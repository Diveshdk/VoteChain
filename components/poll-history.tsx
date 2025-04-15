"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useWeb3 } from "@/components/web3-provider"
import { useToast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Copy, CheckCircle2, Lock, Users, Calendar, Share2 } from "lucide-react"

interface Poll {
  id: number
  question: string
  isPublic: boolean
  totalVotes: number
  timestamp: number
}

interface Vote {
  pollId: number
  pollQuestion: string
  optionVoted: number
  optionText: string
  timestamp: number
}

export function PollHistory() {
  const [createdPolls, setCreatedPolls] = useState<Poll[]>([])
  const [votedPolls, setVotedPolls] = useState<Vote[]>([])
  const [loading, setLoading] = useState(true)
  const { contract, address } = useWeb3()
  const { toast } = useToast()

  useEffect(() => {
    const fetchPollHistory = async () => {
      if (!contract || !address) return

      try {
        setLoading(true)

        // Fetch created polls
        const userPollIds = await contract.getUserCreatedPolls()

        const pollsData = await Promise.all(
          userPollIds.map(async (id: number) => {
            const [creator, question, isPublic, biometricAuth, smsAuth, totalVotes] = await contract.getPollInfo(id)

            // In a real implementation, you would get the timestamp from the contract
            // For now, we'll use a mock timestamp
            const timestamp = Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000

            return {
              id: Number(id),
              question,
              isPublic,
              totalVotes: Number(totalVotes),
              timestamp,
            }
          }),
        )

        setCreatedPolls(pollsData)

        // Fetch voted polls
        const voteHistory = await contract.getUserVoteHistory()

        const votesData = await Promise.all(
          voteHistory.map(async (pollId: number) => {
            const [creator, question] = await contract.getPollInfo(pollId)

            // In a real implementation, you would get the option voted from the contract
            // For now, we'll use mock data
            const optionVoted = Math.floor(Math.random() * 3)
            const options = await contract.getPollOptions(pollId)
            const timestamp = Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000

            return {
              pollId: Number(pollId),
              pollQuestion: question,
              optionVoted,
              optionText: options[optionVoted] || "Unknown option",
              timestamp,
            }
          }),
        )

        setVotedPolls(votesData)
      } catch (error) {
        console.error("Error fetching poll history:", error)
        toast({
          title: "Error",
          description: "Failed to load your poll history",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchPollHistory()
  }, [contract, address, toast])

  const copyPollId = (id: number) => {
    navigator.clipboard.writeText(id.toString())
    toast({
      title: "Poll ID copied",
      description: `Poll ID ${id} copied to clipboard`,
    })
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString()
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading your poll history...</span>
      </div>
    )
  }

  return (
    <Tabs defaultValue="created">
      <TabsList className="w-full mb-4">
        <TabsTrigger value="created" className="flex-1">
          Polls Created
        </TabsTrigger>
        <TabsTrigger value="voted" className="flex-1">
          Polls Voted
        </TabsTrigger>
      </TabsList>

      <TabsContent value="created">
        {createdPolls.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">You haven't created any polls yet</p>
              <Button className="mt-4" asChild>
                <a href="/dashboard/create">Create Your First Poll</a>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {createdPolls.map((poll) => (
              <Card key={poll.id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{poll.question}</CardTitle>
                    <Badge variant={poll.isPublic ? "secondary" : "outline"}>
                      {poll.isPublic ? <Users className="h-3 w-3 mr-1" /> : <Lock className="h-3 w-3 mr-1" />}
                      {poll.isPublic ? "Public" : "Private"}
                    </Badge>
                  </div>
                  <CardDescription className="flex items-center gap-4">
                    <span className="flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      {poll.totalVotes} votes
                    </span>
                    <span className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {formatDate(poll.timestamp)}
                    </span>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="text-sm font-medium mr-2">Poll ID:</span>
                      <Badge variant="outline" className="font-mono">
                        {poll.id}
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => copyPollId(poll.id)}>
                        <Copy className="h-4 w-4 mr-1" />
                        Copy ID
                      </Button>
                      <Button variant="outline" size="sm">
                        <Share2 className="h-4 w-4 mr-1" />
                        Share
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </TabsContent>

      <TabsContent value="voted">
        {votedPolls.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">You haven't voted in any polls yet</p>
              <Button className="mt-4" asChild>
                <a href="/dashboard">Browse Polls</a>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {votedPolls.map((vote) => (
              <Card key={`${vote.pollId}-${vote.timestamp}`}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{vote.pollQuestion}</CardTitle>
                  <CardDescription className="flex items-center gap-4">
                    <span className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {formatDate(vote.timestamp)}
                    </span>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-medium">Your vote:</span>
                      <Badge className="ml-2">{vote.optionText}</Badge>
                    </div>
                    <Badge variant="outline" className="flex items-center">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Voted
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </TabsContent>
    </Tabs>
  )
}

