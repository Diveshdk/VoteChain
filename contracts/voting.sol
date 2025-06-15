// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract VotingSystem is ERC721URIStorage, Ownable {
    using Strings for uint256;
    
    uint256 private tokenIdCounter;
    uint256 private pollIdCounter;
    string private baseURI;

    // Enum to define voting types
    enum VotingType { Single, Ranked }

    struct User {
        string name;
        string phone;
        string email;
        bytes32 passwordHash;
        uint256[] votedPolls;
    }

    struct Poll {
        address creator;
        string question;
        string[] options;
        uint256[] votes;           // For single choice voting
        uint256[][] rankedVotes;   // For ranked choice voting [rank][option] = count
        bool isPublic;
        bool biometricAuth;
        bool smsAuth;
        uint256 totalVotes;
        VotingType votingType;
        mapping(address => bool) hasVoted; 
    }

    struct VoteNFT {
        uint256 pollId;
        uint256 optionVoted;      // For single choice
        uint256[] rankedChoices;  // For ranked choice
        uint256 timestamp;
        string metadata; 
    }

    mapping(address => User) public users;
    mapping(uint256 => Poll) public polls;
    mapping(address => bool) public isRegistered;
    mapping(address => uint256) public userVoteCount;
    mapping(uint256 => VoteNFT) public voteNFTs;
    mapping(uint256 => bytes32) private pollAccessCodes; 
    
    // Track public polls for easy access
    uint256[] public publicPollIds;

    event UserRegistered(address user);
    event PollCreated(uint256 pollId, address creator, bool isPublic, bool biometric, bool sms, uint8 votingType);
    event Voted(address voter, uint256 pollId, uint256 optionIndex, uint256 nftId);
    event RankedVoted(address voter, uint256 pollId, uint256[] rankedChoices, uint256 nftId);

    constructor() ERC721("VoteNFT", "VNFT") Ownable(msg.sender) {
        baseURI = "https://ipfs://QmQC4So5PvJjUcHeALRLMgf1i7PFmU8tmT86tR1e2MSBYB";
    }
    
    function setBaseURI(string memory _newBaseURI) external onlyOwner {
        baseURI = _newBaseURI;
    }
    
    function _baseURI() internal view override returns (string memory) {
        return baseURI;
    }

    function register(
        string memory _name,
        string memory _phone,
        string memory _email,
        string memory _password
    ) external {
        require(!isRegistered[msg.sender], "User already registered");

        users[msg.sender] = User({
            name: _name,
            phone: _phone,
            email: _email,
            passwordHash: keccak256(abi.encodePacked(_password)),
            votedPolls: new uint256[](0) 
        });

        isRegistered[msg.sender] = true;
        emit UserRegistered(msg.sender);
    }
    
    function getUserName(address _userAddress) external view returns (string memory) {
        require(isRegistered[_userAddress], "User not registered");
        return users[_userAddress].name;
    }

    function login(string memory _password) external view returns (bool) {
        require(isRegistered[msg.sender], "User not registered");
        bytes32 passwordHash = keccak256(abi.encodePacked(_password));
        return users[msg.sender].passwordHash == passwordHash;
    }

    function createPoll(
        string memory _question,
        string[] memory _options,
        bool _isPublic,
        bool _biometricAuth,
        bool _smsAuth,
        string memory _accessCode,
        VotingType _votingType
    ) external {
        require(isRegistered[msg.sender], "User not registered");
        require(_options.length > 1, "At least two options required");

        uint256 pollId = pollIdCounter;
        
        // Create a new poll
        Poll storage newPoll = polls[pollId];
        newPoll.creator = msg.sender;
        newPoll.question = _question;
        newPoll.isPublic = _isPublic;
        newPoll.biometricAuth = _biometricAuth;
        newPoll.smsAuth = _smsAuth;
        newPoll.totalVotes = 0;
        newPoll.votingType = _votingType;
        
        for (uint i = 0; i < _options.length; i++) {
            newPoll.options.push(_options[i]);
            newPoll.votes.push(0);
        }
        
        // Initialize ranked votes structure if needed
        if (_votingType == VotingType.Ranked) {
            // Create a 2D array with dimensions [optionsCount][optionsCount]
            // Each row represents a rank (1st choice, 2nd choice, etc.)
            // Each column represents the vote count for an option at that rank
            newPoll.rankedVotes = new uint256[][](_options.length);
            for (uint i = 0; i < _options.length; i++) {
                newPoll.rankedVotes[i] = new uint256[](_options.length);
                for (uint j = 0; j < _options.length; j++) {
                    newPoll.rankedVotes[i][j] = 0;
                }
            }
        }
        
        if (!_isPublic && bytes(_accessCode).length > 0) {
            pollAccessCodes[pollId] = keccak256(abi.encodePacked(_accessCode));
        }
        
        if (_isPublic) {
            publicPollIds.push(pollId);
        }
        
        pollIdCounter++;
        emit PollCreated(pollId, msg.sender, _isPublic, _biometricAuth, _smsAuth, uint8(_votingType));
    }

    function vote(uint256 _pollId, uint256 _optionIndex, string memory _accessCode) external {
        require(isRegistered[msg.sender], "User not registered");
        require(_pollId < pollIdCounter, "Poll does not exist");
        require(_optionIndex < polls[_pollId].options.length, "Invalid option");
        require(!polls[_pollId].hasVoted[msg.sender], "Already voted in this poll");
        require(polls[_pollId].votingType == VotingType.Single, "This poll requires ranked voting");
        
        Poll storage poll = polls[_pollId];
        
        if (!poll.isPublic) {
            require(
                poll.creator == msg.sender || 
                pollAccessCodes[_pollId] == keccak256(abi.encodePacked(_accessCode)),
                "Invalid access code for private poll"
            );
        }

        poll.votes[_optionIndex]++;
        poll.totalVotes++;
        poll.hasVoted[msg.sender] = true;
        users[msg.sender].votedPolls.push(_pollId);

        uint256 nftId = tokenIdCounter++;
        _mint(msg.sender, nftId);
        
        string memory nftMetadata = string(abi.encodePacked(
            '{"name":"Vote #', 
            nftId.toString(), 
            '","description":"Vote for poll: ', 
            poll.question,
            '","attributes":[{"trait_type":"Poll ID","value":"',
            _pollId.toString(),
            '"},{"trait_type":"Option Voted","value":"',
            _optionIndex.toString(),
            '"},{"trait_type":"Timestamp","value":"',
            block.timestamp.toString(),
            '"}]}'
        ));
        
        voteNFTs[nftId] = VoteNFT({
            pollId: _pollId,
            optionVoted: _optionIndex,
            rankedChoices: new uint256[](0),
            timestamp: block.timestamp,
            metadata: nftMetadata
        });
        
        _setTokenURI(nftId, string(abi.encodePacked(nftId.toString(), ".json")));
        
        userVoteCount[msg.sender]++;

        emit Voted(msg.sender, _pollId, _optionIndex, nftId);
    }

    function voteRanked(uint256 _pollId, uint256[] calldata _rankedChoices, string memory _accessCode) external {
        require(isRegistered[msg.sender], "User not registered");
        require(_pollId < pollIdCounter, "Poll does not exist");
        require(!polls[_pollId].hasVoted[msg.sender], "Already voted in this poll");
        require(polls[_pollId].votingType == VotingType.Ranked, "This poll requires single choice voting");
        
        Poll storage poll = polls[_pollId];
        uint256 optionCount = poll.options.length;
        
        require(_rankedChoices.length <= optionCount, "Too many ranked choices");
        require(_rankedChoices.length > 0, "Must provide at least one choice");
        
        // Validate that all choices are within bounds and no duplicates
        bool[] memory used = new bool[](optionCount);
        for (uint i = 0; i < _rankedChoices.length; i++) {
            require(_rankedChoices[i] < optionCount, "Invalid option index");
            require(!used[_rankedChoices[i]], "Duplicate option in ranking");
            used[_rankedChoices[i]] = true;
        }
        
        if (!poll.isPublic) {
            require(
                poll.creator == msg.sender || 
                pollAccessCodes[_pollId] == keccak256(abi.encodePacked(_accessCode)),
                "Invalid access code for private poll"
            );
        }

        // Record ranked votes
        for (uint i = 0; i < _rankedChoices.length; i++) {
            // Increment the vote count for this option at this rank
            poll.rankedVotes[i][_rankedChoices[i]]++;
        }
        
        poll.totalVotes++;
        poll.hasVoted[msg.sender] = true;
        users[msg.sender].votedPolls.push(_pollId);

        uint256 nftId = tokenIdCounter++;
        _mint(msg.sender, nftId);
        
        // Build ranked choices string for metadata
        string memory rankedString = "[";
        for (uint i = 0; i < _rankedChoices.length; i++) {
            if (i > 0) rankedString = string(abi.encodePacked(rankedString, ","));
            rankedString = string(abi.encodePacked(rankedString, _rankedChoices[i].toString()));
        }
        rankedString = string(abi.encodePacked(rankedString, "]"));
        
        string memory nftMetadata = string(abi.encodePacked(
            '{"name":"Ranked Vote #', 
            nftId.toString(), 
            '","description":"Ranked vote for poll: ', 
            poll.question,
            '","attributes":[{"trait_type":"Poll ID","value":"',
            _pollId.toString(),
            '"},{"trait_type":"Ranked Choices","value":"',
            rankedString,
            '"},{"trait_type":"Timestamp","value":"',
            block.timestamp.toString(),
            '"}]}'
        ));
        
        // Store the user's ranked choices
        voteNFTs[nftId] = VoteNFT({
            pollId: _pollId,
            optionVoted: 0,
            rankedChoices: _rankedChoices,
            timestamp: block.timestamp,
            metadata: nftMetadata
        });
        
        _setTokenURI(nftId, string(abi.encodePacked(nftId.toString(), ".json")));
        
        userVoteCount[msg.sender]++;

        emit RankedVoted(msg.sender, _pollId, _rankedChoices, nftId);
    }

    function getPollInfo(uint256 _pollId) external view returns (
        address creator,
        string memory question,
        bool isPublic,
        bool biometricAuth,
        bool smsAuth,
        uint256 totalVotes,
        VotingType votingType
    ) {
        require(_pollId < pollIdCounter, "Poll does not exist");
        Poll storage poll = polls[_pollId];
        
        return (
            poll.creator,
            poll.question,
            poll.isPublic,
            poll.biometricAuth,
            poll.smsAuth,
            poll.totalVotes,
            poll.votingType
        );
    }
    
    function getPollOptions(uint256 _pollId) external view returns (string[] memory) {
        require(_pollId < pollIdCounter, "Poll does not exist");
        return polls[_pollId].options;
    }
    
    function getPollResults(uint256 _pollId) external view returns (
        string[] memory options,
        uint256[] memory voteCounts
    ) {
        require(_pollId < pollIdCounter, "Poll does not exist");
        Poll storage poll = polls[_pollId];
        
        if (!poll.isPublic) {
            require(msg.sender == poll.creator, "Only creator can see private poll results");
        }
        
        require(poll.votingType == VotingType.Single, "Use getRankedPollResults for ranked polls");
        
        return (poll.options, poll.votes);
    }
    
    function getRankedPollResults(uint256 _pollId) external view returns (
        string[] memory options,
        uint256[][] memory rankedVoteCounts
    ) {
        require(_pollId < pollIdCounter, "Poll does not exist");
        Poll storage poll = polls[_pollId];
        
        if (!poll.isPublic) {
            require(msg.sender == poll.creator, "Only creator can see private poll results");
        }
        
        require(poll.votingType == VotingType.Ranked, "Use getPollResults for single choice polls");
        
        return (poll.options, poll.rankedVotes);
    }

    function getUserVotes(address _user) external view returns (uint256) {
        require(msg.sender == _user || msg.sender == owner(), "Unauthorized access");
        return userVoteCount[_user];
    }

    function getUserVoteHistory() external view returns (uint256[] memory) {
        require(isRegistered[msg.sender], "User not registered");
        return users[msg.sender].votedPolls;
    }
    
    // Get all public polls
    function getPublicPolls() external view returns (uint256[] memory) {
        return publicPollIds;
    }
    
    function getUserCreatedPolls() external view returns (uint256[] memory) {
        uint256 userPollCount = 0;
        
        // Count user polls
        for (uint256 i = 0; i < pollIdCounter; i++) {
            if (polls[i].creator == msg.sender) {
                userPollCount++;
            }
        }
        
        // Create array of user poll IDs
        uint256[] memory userPolls = new uint256[](userPollCount);
        uint256 index = 0;
        
        for (uint256 i = 0; i < pollIdCounter; i++) {
            if (polls[i].creator == msg.sender) {
                userPolls[index] = i;
                index++;
            }
        }
        
        return userPolls;
    }
    
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_ownerOf(tokenId) != address(0), "ERC721: URI query for nonexistent token");
        
        string memory baseURI_ = _baseURI();
        return bytes(baseURI_).length > 0 ? string(abi.encodePacked(baseURI_, tokenId.toString(), ".json")) : "";
    }
    
    function getNFTMetadata(uint256 _tokenId) external view returns (string memory) {
        require(_ownerOf(_tokenId) != address(0), "NFT does not exist");
        return voteNFTs[_tokenId].metadata;
    }
    
    function getNFTDetails(uint256 _tokenId) external view returns (
        uint256 pollId,
        uint256 optionVoted,
        uint256[] memory rankedChoices,
        uint256 timestamp,
        VotingType votingType
    ) {
        require(_ownerOf(_tokenId) != address(0), "NFT does not exist");
        VoteNFT memory nft = voteNFTs[_tokenId];
        uint256 pollId_ = nft.pollId;
        
        return (
            pollId_,
            nft.optionVoted,
            nft.rankedChoices,
            nft.timestamp,
            polls[pollId_].votingType
        );
    }
    
    function hasVotedInPoll(address _user, uint256 _pollId) external view returns (bool) {
        require(_pollId < pollIdCounter, "Poll does not exist");
        return polls[_pollId].hasVoted[_user];
    }
}
