# 🗳️ VoteChain

VoteChain is a decentralized voting platform built on Ethereum, combining the transparency of blockchain with the usability of a social platform. Users can create and participate in secure, verifiable polls and receive NFTs for each vote.

---

## 🔧 Features

- 👥 User/Organization registration and login
- 🗳️ Public and private polls
- 🔒 Optional biometric and SMS authentication
- 📊 Real-time voting stats (votes, progress, entities)
- 🧾 NFT rewards per vote
- 🧠 Voting history dashboard
- 🛍️ In-app NFT shop

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/Diveshdk/VoteChain
cd VoteChain
2. Install Dependencies
bash
Copy
Edit
npm install
3. Configure Environment Variables
Create a .env file in the root directory and add the following:

env
Copy
Edit
NEXT_PUBLIC_CONTRACT_ADDRESS=your_contract_address
NEXT_PUBLIC_ABI=contract_ABI_here
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api

# Example test login (used for testing)
NEXT_PUBLIC_TEST_USER=test
NEXT_PUBLIC_TEST_PASSWORD=test
⚠️ Replace values with your actual contract address, ABI, and API endpoints.

🧪 Testing Instructions
📌 Test Credentials
Use the following credentials to test the login and poll creation features:

bash
Copy
Edit
Username: test
Password: test
You can change these from the .env file.

✅ Run the App Locally
bash
Copy
Edit
npm run dev
Visit http://localhost:3000 in your browser.

⚙️ Smart Contract
The smart contract is deployed on Remix. Make sure the following are updated in .env:

Contract ABI (copied from Remix or JSON file)

Contract Address (after deployment)

📁 Folder Structure
bash
Copy
Edit
/pages
/components
/contracts
/public
/utils
.env
README.md
🔒 Security
Passwords are hashed.

Optional biometric & SMS-based 2FA available (configure in UI).

Voting is one-time per user per poll (verified on-chain).

📈 Roadmap
Add DAO integration

Enable advanced vote analytics

Layer-2 migration for scalability

Multi-language support

🤝 Contributing
Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

📜 License
This project is licensed under the MIT License.

