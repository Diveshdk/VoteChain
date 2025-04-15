"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { useWeb3 } from "@/components/web3-provider"
import { Crown, BarChart, PieChart, TrendingUp } from "lucide-react"
import { PremiumDashboardCharts } from "@/components/premium-dashboard-charts"

export function EnhancedPremiumDashboard() {
  const [isPremium, setIsPremium] = useState(false)
  const [userStats, setUserStats] = useState({
    totalVotes: 247,
    activePolls: 8,
    nftPoints: 120,
  })
  const { toast } = useToast()
  const { contract, address } = useWeb3()

  useEffect(() => {
    const fetchUserStats = async () => {
      if (!contract || !address) return

      try {
        // In a real implementation, we would fetch this data from the contract
        // For now, we'll use mock data
        const voteCount = await contract.getUserVotes(address)

        setUserStats({
          totalVotes: Number(voteCount) || 247,
          activePolls: 8,
          nftPoints: Number(voteCount) || 120,
        })

        // Check if user has premium
        // This would be a contract call in a real implementation
        setIsPremium(Number(voteCount) > 50)
      } catch (error) {
        console.error("Error fetching user stats:", error)
      }
    }

    fetchUserStats()
  }, [contract, address])

  const handleJoinPremium = () => {
    setIsPremium(true)
    toast({
      title: "Premium Activated",
      description: "You now have access to premium features",
    })
  }

  if (!isPremium) {
    return (
      <div className="space-y-6">
        <Card className="bg-[#0f172a] text-white border-[#1e293b]">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Crown className="h-6 w-6 mr-2 text-yellow-500" />
              Premium Dashboard
            </CardTitle>
            <CardDescription className="text-slate-300">
              Upgrade to premium for advanced analytics and features
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-[#1e293b] border-[#334155]">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base text-white">Advanced Analytics</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <ul className="space-y-2">
                    <li className="flex items-center text-sm text-slate-300">
                      <svg
                        className="h-4 w-4 mr-2 text-green-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      Detailed voting patterns
                    </li>
                    <li className="flex items-center text-sm text-slate-300">
                      <svg
                        className="h-4 w-4 mr-2 text-green-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      Demographic insights
                    </li>
                    <li className="flex items-center text-sm text-slate-300">
                      <svg
                        className="h-4 w-4 mr-2 text-green-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      Real-time results
                    </li>
                  </ul>
                </CardContent>
              </Card>
              <Card className="bg-[#1e293b] border-[#334155]">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base text-white">Premium Features</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <ul className="space-y-2">
                    <li className="flex items-center text-sm text-slate-300">
                      <svg
                        className="h-4 w-4 mr-2 text-green-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      Unlimited poll creation
                    </li>
                    <li className="flex items-center text-sm text-slate-300">
                      <svg
                        className="h-4 w-4 mr-2 text-green-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      Advanced security options
                    </li>
                    <li className="flex items-center text-sm text-slate-300">
                      <svg
                        className="h-4 w-4 mr-2 text-green-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      Priority NFT minting
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            <div className="bg-[#1e293b] p-4 rounded-lg">
              <h3 className="font-medium mb-2 text-white">Premium Pricing</h3>
              <div className="flex items-baseline">
                <span className="text-3xl font-bold text-white">50</span>
                <span className="ml-1 text-slate-300">NFT Points / month</span>
              </div>
              <p className="text-sm text-slate-400 mt-2">Redeem your earned NFT points for premium access</p>
            </div>
          </CardContent>
          <div className="px-6 pb-6">
            <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={handleJoinPremium}>
              <Crown className="h-4 w-4 mr-2" />
              Join Premium
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="bg-[#0f172a] text-white border-[#1e293b]">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Crown className="h-6 w-6 mr-2 text-yellow-500" />
            Premium Dashboard
          </CardTitle>
          <CardDescription className="text-slate-300">Welcome to your premium analytics dashboard</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overview">
            <TabsList className="grid w-full grid-cols-3 bg-[#1e293b]">
              <TabsTrigger value="overview" className="data-[state=active]:bg-blue-600">
                Overview
              </TabsTrigger>
              <TabsTrigger value="polls" className="data-[state=active]:bg-blue-600">
                My Polls
              </TabsTrigger>
              <TabsTrigger value="trends" className="data-[state=active]:bg-blue-600">
                Voting Trends
              </TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="pt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-[#1e293b] border-[#334155]">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-slate-300">Total Votes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center">
                      <BarChart className="h-5 w-5 text-blue-500 mr-2" />
                      <span className="text-2xl font-bold text-white">{userStats.totalVotes}</span>
                      <span className="text-green-500 text-sm ml-2 flex items-center">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        +12%
                      </span>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-[#1e293b] border-[#334155]">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-slate-300">Active Polls</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center">
                      <PieChart className="h-5 w-5 text-blue-500 mr-2" />
                      <span className="text-2xl font-bold text-white">{userStats.activePolls}</span>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-[#1e293b] border-[#334155]">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-slate-300">NFT Points</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center">
                      <Crown className="h-5 w-5 text-yellow-500 mr-2" />
                      <span className="text-2xl font-bold text-white">{userStats.nftPoints}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="mt-6">
                <PremiumDashboardCharts />
              </div>
            </TabsContent>
            <TabsContent value="polls" className="pt-4">
              <div className="bg-[#1e293b] p-6 rounded-lg flex items-center justify-center h-64">
                <div className="text-center">
                  <BarChart className="h-12 w-12 mx-auto text-blue-500 mb-2" />
                  <h3 className="text-lg font-medium text-white">Poll Performance</h3>
                  <p className="text-sm text-slate-400 mt-1">Detailed poll analytics will appear here</p>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="trends" className="pt-4">
              <div className="bg-[#1e293b] p-6 rounded-lg flex items-center justify-center h-64">
                <div className="text-center">
                  <TrendingUp className="h-12 w-12 mx-auto text-blue-500 mb-2" />
                  <h3 className="text-lg font-medium text-white">Voting Trends</h3>
                  <p className="text-sm text-slate-400 mt-1">Voting trend analytics will appear here</p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

