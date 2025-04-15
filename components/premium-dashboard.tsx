"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { BarChart, PieChart, LineChart, TrendingUp, Crown, CheckCircle } from "lucide-react"

export function PremiumDashboard() {
  const [isPremium, setIsPremium] = useState(false)
  const { toast } = useToast()

  const handleJoinPremium = () => {
    setIsPremium(true)
    toast({
      title: "Premium Activated",
      description: "You now have access to premium features",
    })
  }

  if (!isPremium) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Crown className="h-6 w-6 mr-2 text-yellow-500" />
            Premium Dashboard
          </CardTitle>
          <CardDescription>Upgrade to premium for advanced analytics and features</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Advanced Analytics</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <ul className="space-y-2">
                  <li className="flex items-center text-sm">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                    Detailed voting patterns
                  </li>
                  <li className="flex items-center text-sm">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                    Demographic insights
                  </li>
                  <li className="flex items-center text-sm">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                    Real-time results
                  </li>
                </ul>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Premium Features</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <ul className="space-y-2">
                  <li className="flex items-center text-sm">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                    Unlimited poll creation
                  </li>
                  <li className="flex items-center text-sm">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                    Advanced security options
                  </li>
                  <li className="flex items-center text-sm">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                    Priority NFT minting
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <div className="bg-muted p-4 rounded-lg">
            <h3 className="font-medium mb-2">Premium Pricing</h3>
            <div className="flex items-baseline">
              <span className="text-3xl font-bold">50</span>
              <span className="ml-1 text-muted-foreground">NFT Points / month</span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">Redeem your earned NFT points for premium access</p>
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={handleJoinPremium}>
            <Crown className="h-4 w-4 mr-2" />
            Join Premium
          </Button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Crown className="h-6 w-6 mr-2 text-yellow-500" />
            Premium Dashboard
          </CardTitle>
          <CardDescription>Welcome to your premium analytics dashboard</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overview">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="polls">My Polls</TabsTrigger>
              <TabsTrigger value="trends">Voting Trends</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="pt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Total Votes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center">
                      <BarChart className="h-5 w-5 text-primary mr-2" />
                      <span className="text-2xl font-bold">247</span>
                      <span className="text-green-500 text-sm ml-2 flex items-center">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        +12%
                      </span>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Active Polls</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center">
                      <PieChart className="h-5 w-5 text-primary mr-2" />
                      <span className="text-2xl font-bold">8</span>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">NFT Points</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center">
                      <Crown className="h-5 w-5 text-yellow-500 mr-2" />
                      <span className="text-2xl font-bold">120</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="mt-6 bg-muted p-6 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <LineChart className="h-12 w-12 mx-auto text-primary mb-2" />
                  <h3 className="text-lg font-medium">Analytics Dashboard</h3>
                  <p className="text-sm text-muted-foreground mt-1">Detailed analytics charts will appear here</p>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="polls" className="pt-4">
              <div className="bg-muted p-6 rounded-lg flex items-center justify-center h-64">
                <div className="text-center">
                  <BarChart className="h-12 w-12 mx-auto text-primary mb-2" />
                  <h3 className="text-lg font-medium">Poll Performance</h3>
                  <p className="text-sm text-muted-foreground mt-1">Detailed poll analytics will appear here</p>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="trends" className="pt-4">
              <div className="bg-muted p-6 rounded-lg flex items-center justify-center h-64">
                <div className="text-center">
                  <TrendingUp className="h-12 w-12 mx-auto text-primary mb-2" />
                  <h3 className="text-lg font-medium">Voting Trends</h3>
                  <p className="text-sm text-muted-foreground mt-1">Voting trend analytics will appear here</p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

