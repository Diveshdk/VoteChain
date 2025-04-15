"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useWeb3 } from "@/components/web3-provider"
import { PlusCircle, Award, ShoppingBag } from "lucide-react"

export function DashboardHeader() {
  const { contract, address } = useWeb3()
  const [voteCount, setVoteCount] = useState(0)

  useEffect(() => {
    const fetchUserVotes = async () => {
      if (contract && address) {
        try {
          const votes = await contract.getUserVotes(address)
          setVoteCount(Number(votes))
        } catch (error) {
          console.error("Error fetching user votes:", error)
        }
      }
    }

    fetchUserVotes()
  }, [contract, address])

  return (
    <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
      <div>
        <h1 className="text-3xl font-bold">Welcome to VoteChain</h1>
        <p className="text-muted-foreground mt-1">Create and participate in blockchain-based polls</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
        <Card className="flex-1">
          <CardContent className="p-3 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">NFT Points</p>
              <p className="text-2xl font-bold">{voteCount}</p>
            </div>
            <Award className="h-8 w-8 text-primary opacity-80" />
          </CardContent>
        </Card>

        <div className="flex gap-2">
          <Button asChild>
            <Link href="/dashboard/create">
              <PlusCircle className="h-4 w-4 mr-2" />
              Create Poll
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/dashboard/shop">
              <ShoppingBag className="h-4 w-4 mr-2" />
              Shop
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

