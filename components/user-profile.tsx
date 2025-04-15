"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useWeb3 } from "@/components/web3-provider"
import { useToast } from "@/components/ui/use-toast"
import { Award, BarChart3, UserPlus, UserCheck, Users } from "lucide-react"
import { PollHistory } from "@/components/poll-history"

export function UserProfile({ userId }: { userId?: string }) {
  const [userData, setUserData] = useState({
    name: "User",
    voteCount: 0,
    pollsCreated: 0,
    followers: 0,
    following: 0,
  })
  const [isFollowing, setIsFollowing] = useState(false)
  const { contract, address } = useWeb3()
  const { toast } = useToast()

  // If no userId is provided, use the current user's address
  const targetUser = userId || address

  useEffect(() => {
    const fetchUserData = async () => {
      if (!contract || !targetUser) return

      try {
        // Get user name
        const name = await contract.getUserName(targetUser)

        // Get vote count
        const voteCount = await contract.getUserVotes(targetUser)

        // Get polls created
        const userPolls = await contract.getUserCreatedPolls()

        // In a real implementation, you would fetch followers and following from the contract
        // For now, we'll use mock data
        const followers = Math.floor(Math.random() * 100)
        const following = Math.floor(Math.random() * 50)

        // Check if the current user is following the target user
        // In a real implementation, you would check this from the contract
        setIsFollowing(Math.random() > 0.5)

        setUserData({
          name: name || "User",
          voteCount: Number(voteCount),
          pollsCreated: userPolls.length,
          followers,
          following,
        })
      } catch (error) {
        console.error("Error fetching user data:", error)
      }
    }

    fetchUserData()
  }, [contract, targetUser])

  const handleFollow = () => {
    // In a real implementation, you would call a contract function to follow/unfollow
    setIsFollowing(!isFollowing)

    toast({
      title: isFollowing ? "Unfollowed" : "Followed",
      description: isFollowing ? `You unfollowed ${userData.name}` : `You are now following ${userData.name}`,
    })
  }

  const isCurrentUser = targetUser === address

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6 items-center">
            <Avatar className="h-24 w-24">
              <AvatarImage src="/placeholder.svg?height=96&width=96" alt={userData.name} />
              <AvatarFallback className="text-2xl">{userData.name.charAt(0)}</AvatarFallback>
            </Avatar>

            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl font-bold">{userData.name}</h2>
              <p className="text-muted-foreground">Blockchain Voter</p>

              <div className="flex flex-wrap gap-4 mt-2 justify-center md:justify-start">
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-1 text-muted-foreground" />
                  <span className="text-sm">
                    <span className="font-bold">{userData.followers}</span> followers
                  </span>
                </div>
                <div className="flex items-center">
                  <UserPlus className="h-4 w-4 mr-1 text-muted-foreground" />
                  <span className="text-sm">
                    <span className="font-bold">{userData.following}</span> following
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
              <div className="flex flex-col items-center p-3 bg-muted rounded-lg">
                <Award className="h-5 w-5 text-primary mb-1" />
                <span className="text-xl font-bold">{userData.voteCount}</span>
                <span className="text-xs text-muted-foreground">NFT Points</span>
              </div>
              <div className="flex flex-col items-center p-3 bg-muted rounded-lg">
                <BarChart3 className="h-5 w-5 text-primary mb-1" />
                <span className="text-xl font-bold">{userData.pollsCreated}</span>
                <span className="text-xs text-muted-foreground">Polls Created</span>
              </div>
            </div>

            {!isCurrentUser && (
              <Button variant={isFollowing ? "outline" : "default"} onClick={handleFollow} className="w-full md:w-auto">
                {isFollowing ? (
                  <>
                    <UserCheck className="h-4 w-4 mr-2" />
                    Following
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Follow
                  </>
                )}
              </Button>
            )}

            <Badge variant="outline" className="hidden md:flex">
              {userData.voteCount >= 10 ? "Power Voter" : "Novice Voter"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <PollHistory />
    </div>
  )
}

