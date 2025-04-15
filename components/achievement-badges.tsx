"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { useWeb3 } from "@/components/web3-provider"
import { Lock, Award, Diamond, Medal, Crown } from "lucide-react"

interface BadgeInfo {
  name: string
  icon: React.ReactNode
  threshold: number
  color: string
  description: string
}

export function AchievementBadges() {
  const [nftCount, setNftCount] = useState(0)
  const { contract, address } = useWeb3()

  const badges: BadgeInfo[] = [
    {
      name: "Silver Voter",
      icon: <Medal className="h-6 w-6" />,
      threshold: 5,
      color: "bg-gray-300",
      description: "Participate in 5 polls",
    },
    {
      name: "Gold Voter",
      icon: <Medal className="h-6 w-6 text-yellow-500" />,
      threshold: 15,
      color: "bg-yellow-400",
      description: "Participate in 15 polls",
    },
    {
      name: "Platinum Voter",
      icon: <Crown className="h-6 w-6 text-blue-400" />,
      threshold: 30,
      color: "bg-blue-300",
      description: "Participate in 30 polls",
    },
    {
      name: "Diamond Voter",
      icon: <Diamond className="h-6 w-6 text-purple-500" />,
      threshold: 50,
      color: "bg-purple-400",
      description: "Participate in 50 polls",
    },
  ]

  useEffect(() => {
    const fetchNFTCount = async () => {
      if (!contract || !address) return

      try {
        // Get user's vote count
        const voteCount = await contract.getUserVotes(address)
        setNftCount(Number(voteCount))
      } catch (error) {
        console.error("Error fetching NFT count:", error)
      }
    }

    fetchNFTCount()
  }, [contract, address])

  // Find the current badge level
  const currentBadgeIndex = badges.findIndex((badge) => nftCount < badge.threshold)
  const currentBadge = currentBadgeIndex > 0 ? badges[currentBadgeIndex - 1] : null
  const nextBadge = currentBadgeIndex >= 0 ? badges[currentBadgeIndex] : null

  // Calculate progress to next badge
  const calculateProgress = () => {
    if (!nextBadge) return 100 // Already at max level

    const prevThreshold = currentBadgeIndex > 0 ? badges[currentBadgeIndex - 1].threshold : 0
    const progress = ((nftCount - prevThreshold) / (nextBadge.threshold - prevThreshold)) * 100
    return Math.min(Math.max(progress, 0), 100)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Award className="h-5 w-5 mr-2 text-primary" />
          Achievement Badges
        </CardTitle>
        <CardDescription>Earn badges by participating in polls</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center">
              <span className="text-sm font-medium">Current Level: </span>
              <span className="ml-1 font-bold">{currentBadge?.name || "New Voter"}</span>
            </div>
            <span className="text-sm">
              {nftCount} / {nextBadge?.threshold || "∞"} votes
            </span>
          </div>

          {nextBadge && (
            <>
              <Progress value={calculateProgress()} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">
                {nextBadge.threshold - nftCount} more votes until {nextBadge.name}
              </p>
            </>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          {badges.map((badge, index) => {
            const isUnlocked = nftCount >= badge.threshold

            return (
              <div
                key={badge.name}
                className={`relative rounded-lg p-3 border ${isUnlocked ? "border-primary" : "border-muted"}`}
              >
                <div className="flex items-center mb-2">
                  <div className={`p-2 rounded-full ${isUnlocked ? badge.color : "bg-muted"}`}>{badge.icon}</div>
                  <div className="ml-2">
                    <h4 className="text-sm font-medium">{badge.name}</h4>
                    <p className="text-xs text-muted-foreground">{badge.threshold} votes</p>
                  </div>
                  {!isUnlocked && <Lock className="h-4 w-4 absolute top-3 right-3 text-muted-foreground" />}
                </div>
                <p className="text-xs">{badge.description}</p>
                {isUnlocked && (
                  <Badge
                    variant="outline"
                    className="absolute top-3 right-3 bg-green-50 text-green-700 border-green-200"
                  >
                    Unlocked
                  </Badge>
                )}
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

