"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useWeb3 } from "@/components/web3-provider"
import { Trophy, Medal, Users, Loader2 } from "lucide-react"

interface LeaderboardUser {
  address: string
  name: string
  voteCount: number
  rank: number
}

export function Leaderboard() {
  const [users, setUsers] = useState<LeaderboardUser[]>([])
  const [loading, setLoading] = useState(true)
  const { contract } = useWeb3()

  useEffect(() => {
    const fetchLeaderboard = async () => {
      if (!contract) return

      try {
        setLoading(true)

        // In a real implementation, we would fetch this data from the contract
        // For now, we'll create mock data
        const mockUsers: LeaderboardUser[] = [
          { address: "0x1234...5678", name: "Alice", voteCount: 47, rank: 1 },
          { address: "0x8765...4321", name: "Bob", voteCount: 35, rank: 2 },
          { address: "0xabcd...efgh", name: "Charlie", voteCount: 29, rank: 3 },
          { address: "0xijkl...mnop", name: "David", voteCount: 24, rank: 4 },
          { address: "0xqrst...uvwx", name: "Eve", voteCount: 18, rank: 5 },
          { address: "0x2468...1357", name: "Frank", voteCount: 15, rank: 6 },
          { address: "0x9876...5432", name: "Grace", voteCount: 12, rank: 7 },
          { address: "0xfedc...ba98", name: "Heidi", voteCount: 10, rank: 8 },
          { address: "0x1357...2468", name: "Ivan", voteCount: 8, rank: 9 },
          { address: "0x7531...8642", name: "Judy", voteCount: 5, rank: 10 },
        ]

        setUsers(mockUsers)
      } catch (error) {
        console.error("Error fetching leaderboard:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchLeaderboard()
  }, [contract])

  if (loading) {
    return (
      <Card>
        <CardContent className="py-6">
          <div className="flex justify-center items-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Loading leaderboard...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Trophy className="h-5 w-5 mr-2 text-yellow-500" />
          Voting Leaderboard
        </CardTitle>
        <CardDescription>Top voters in the community</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {users.map((user) => (
            <div key={user.address} className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted mr-3 text-sm font-bold">
                  {user.rank <= 3 ? (
                    <Medal
                      className={`h-5 w-5 ${
                        user.rank === 1 ? "text-yellow-500" : user.rank === 2 ? "text-gray-400" : "text-amber-700"
                      }`}
                    />
                  ) : (
                    user.rank
                  )}
                </div>
                <Avatar className="h-10 w-10 mr-3">
                  <AvatarImage src={`/placeholder.svg?height=40&width=40`} alt={user.name} />
                  <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.address}</p>
                </div>
              </div>
              <Badge variant="secondary" className="ml-auto">
                <Users className="h-3 w-3 mr-1" />
                {user.voteCount} votes
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

