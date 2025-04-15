"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { useWeb3 } from "@/components/web3-provider"
import { Award, Gift, BookOpen, Code, Coffee, Zap } from "lucide-react"

interface RewardItem {
  id: number
  name: string
  description: string
  price: number
  icon: React.ElementType
}

export function NFTShop() {
  const [userPoints, setUserPoints] = useState(0)
  const { contract, address } = useWeb3()
  const { toast } = useToast()

  const rewardItems: RewardItem[] = [
    {
      id: 1,
      name: "Web Development Course",
      description: "Complete web development bootcamp with certificate",
      price: 50,
      icon: Code,
    },
    {
      id: 2,
      name: "Blockchain Basics eBook",
      description: "Comprehensive guide to blockchain technology",
      price: 25,
      icon: BookOpen,
    },
    {
      id: 3,
      name: "Premium Dashboard Access",
      description: "1 month access to premium analytics dashboard",
      price: 40,
      icon: Zap,
    },
    {
      id: 4,
      name: "Coffee Shop Voucher",
      description: "$10 voucher for your favorite coffee shop",
      price: 30,
      icon: Coffee,
    },
    {
      id: 5,
      name: "NFT Art Creation",
      description: "Custom NFT art created by digital artists",
      price: 100,
      icon: Gift,
    },
  ]

  useEffect(() => {
    const fetchUserPoints = async () => {
      if (!contract || !address) return

      try {
        const voteCount = await contract.getUserVotes(address)
        setUserPoints(Number(voteCount))
      } catch (error) {
        console.error("Error fetching user points:", error)
      }
    }

    fetchUserPoints()
  }, [contract, address])

  const handleRedeem = (item: RewardItem) => {
    if (userPoints < item.price) {
      toast({
        title: "Insufficient points",
        description: `You need ${item.price - userPoints} more points to redeem this reward`,
        variant: "destructive",
      })
      return
    }

    // In a real app, this would call a contract function to redeem the reward
    setUserPoints((prev) => prev - item.price)

    toast({
      title: "Reward redeemed",
      description: `You have successfully redeemed ${item.name}`,
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold">NFT Rewards Shop</h2>
              <p className="text-muted-foreground">Redeem your NFT points for exclusive rewards</p>
            </div>
            <div className="flex items-center bg-muted px-4 py-2 rounded-lg">
              <Award className="h-5 w-5 text-primary mr-2" />
              <div>
                <p className="text-sm font-medium">Your Balance</p>
                <p className="text-2xl font-bold">{userPoints} Points</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {rewardItems.map((item) => (
          <Card key={item.id} className="overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{item.name}</CardTitle>
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                  {item.price} Points
                </Badge>
              </div>
              <CardDescription>{item.description}</CardDescription>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="h-24 bg-muted rounded-md flex items-center justify-center">
                <item.icon className="h-12 w-12 text-primary opacity-80" />
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                onClick={() => handleRedeem(item)}
                disabled={userPoints < item.price}
                variant={userPoints >= item.price ? "default" : "outline"}
              >
                {userPoints >= item.price ? "Redeem Reward" : "Not Enough Points"}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}

