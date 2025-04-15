"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { useWeb3 } from "@/components/web3-provider"
import { Loader2, Award } from "lucide-react"

interface NFT {
  id: number
  pollId: number
  optionVoted: number
  timestamp: number
  pollQuestion: string
  optionText: string
}

export function NFTGallery() {
  const [nfts, setNfts] = useState<NFT[]>([])
  const [loading, setLoading] = useState(true)
  const { contract, address } = useWeb3()
  const { toast } = useToast()

  useEffect(() => {
    const fetchNFTs = async () => {
      if (!contract || !address) return

      try {
        setLoading(true)

        // Get user's vote history
        const voteHistory = await contract.getUserVoteHistory()

        // Get user's NFTs
        const balance = await contract.balanceOf(address)
        const nftData: NFT[] = []

        for (let i = 0; i < balance; i++) {
          const tokenId = await contract.tokenOfOwnerByIndex(address, i)
          const [pollId, optionVoted, timestamp] = await contract.getNFTDetails(tokenId)

          // Get poll info
          const [, question] = await contract.getPollInfo(pollId)
          const options = await contract.getPollOptions(pollId)

          nftData.push({
            id: Number(tokenId),
            pollId: Number(pollId),
            optionVoted: Number(optionVoted),
            timestamp: Number(timestamp),
            pollQuestion: question,
            optionText: options[optionVoted],
          })
        }

        setNfts(nftData)
      } catch (error) {
        console.error("Error fetching NFTs:", error)
        toast({
          title: "Error",
          description: "Failed to load your NFTs",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchNFTs()
  }, [contract, address, toast])

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading your NFTs...</span>
      </div>
    )
  }

  if (nfts.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-8">
          <div className="flex flex-col items-center justify-center text-center">
            <Award className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No NFTs yet</h3>
            <p className="text-sm text-muted-foreground">Vote in polls to earn NFTs and collect voting points</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {nfts.map((nft) => (
        <Card key={nft.id} className="overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Award className="h-5 w-5 mr-2 text-primary" />
              Vote NFT #{nft.id}
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="space-y-2">
              <div>
                <p className="text-sm font-medium">Poll Question:</p>
                <p className="text-sm">{nft.pollQuestion}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Your Vote:</p>
                <Badge variant="outline" className="mt-1">
                  {nft.optionText}
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium">Date:</p>
                <p className="text-sm">{new Date(nft.timestamp * 1000).toLocaleDateString()}</p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="pt-0">
            <Badge variant="secondary" className="w-full justify-center">
              +1 NFT Point
            </Badge>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}

