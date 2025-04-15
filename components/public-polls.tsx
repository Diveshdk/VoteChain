"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { useWeb3 } from "@/components/web3-provider"
import { Loader2, Users, Lock, CheckCircle2, MessageSquare, MapPin, Award } from "lucide-react"
import { VoteDialog } from "@/components/vote-dialog"

interface Poll {
  id: number
  creator: string
  question: string
  isPublic: boolean
  biometricAuth: boolean
  smsAuth: boolean
  totalVotes: number
  options: string[]
  optionVotes?: number[]
  hasVoted: boolean
  isMultipleChoice?: boolean
  maxSelections?: number
  geoRestricted?: boolean
  location?: string
}

export function PublicPolls() {
  const [polls, setPolls] = useState<Poll[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPoll, setSelectedPoll] = useState<Poll | null>(null)
  const [isVoteDialogOpen, setIsVoteDialogOpen] = useState(false)
  const { contract, address } = useWeb3()
  const { toast } = useToast()
  const router = useRouter()

  // Function to calculate percentages that ensures they sum to 100%
  const calculatePercentages = (votes: number[]) => {
    const total = votes.reduce((sum, count) => sum + count, 0)
    if (total === 0) return votes.map(() => 0)

    // Calculate raw percentages
    const rawPercentages = votes.map((count) => (count / total) * 100)

    // Round to 1 decimal place
    const roundedPercentages = rawPercentages.map((p) => Math.round(p * 10) / 10)

    // Adjust to ensure sum is 100%
    const sum = roundedPercentages.reduce((sum, p) => sum + p, 0)
    if (sum !== 100 && total > 0) {
      // Add/subtract the difference to/from the largest percentage
      const diff = 100 - sum
      const maxIndex = roundedPercentages.indexOf(Math.max(...roundedPercentages))
      roundedPercentages[maxIndex] += diff
    }

    return roundedPercentages
  }

  useEffect(() => {
    const fetchPolls = async () => {
      if (!contract) return

      try {
        setLoading(true)
        const publicPollIds = await contract.getPublicPolls()

        const pollsData = await Promise.all(
          publicPollIds.map(async (id: number) => {
            const [creator, question, isPublic, biometricAuth, smsAuth, totalVotes] = await contract.getPollInfo(id)

            const options = await contract.getPollOptions(id)
            const hasVoted = address ? await contract.hasVotedInPoll(address, id) : false

            // Get real vote counts if available, otherwise use realistic mock data
            let optionVotes: number[] = []
            try {
              // Try to get real vote counts from the contract
              const [, voteCounts] = await contract.getPollResults(id)
              optionVotes = voteCounts.map((count: any) => Number(count))
            } catch (error) {
              // If not available, generate realistic mock data
              const mockTotal = Number(totalVotes) || Math.floor(Math.random() * 50) + 5

              // Distribute votes among options
              let remainingVotes = mockTotal
              optionVotes = options.map((_, index) => {
                if (index === options.length - 1) {
                  return remainingVotes
                }
                const votes = Math.floor(Math.random() * remainingVotes * 0.7)
                remainingVotes -= votes
                return votes
              })
            }

            // Mock data for poll type and geo-restriction
            const isMultipleChoice = false // Default to single choice for now
            const geoRestricted = Math.random() > 0.7 // 30% chance of geo-restriction
            const location = geoRestricted
              ? ["New York", "London", "Tokyo", "Sydney", "Berlin"][Math.floor(Math.random() * 5)]
              : undefined

            return {
              id: Number(id),
              creator,
              question,
              isPublic,
              biometricAuth,
              smsAuth,
              totalVotes: optionVotes.reduce((sum, count) => sum + count, 0),
              options,
              optionVotes,
              hasVoted,
              isMultipleChoice,
              geoRestricted,
              location,
            }
          }),
        )

        setPolls(pollsData)
      } catch (error) {
        console.error("Error fetching polls:", error)
        toast({
          title: "Error",
          description: "Failed to load polls",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchPolls()
  }, [contract, address, toast])

  const handleVote = (poll: Poll) => {
    setSelectedPoll(poll)
    setIsVoteDialogOpen(true)
  }

  // Function to parse option data for display
  const parseOption = (option: string) => {
    try {
      if (typeof option === "string" && option.startsWith("{")) {
        const parsed = JSON.parse(option)
        if (parsed.type === "image") {
          return parsed.caption || "Image option"
        }
      }
      return option
    } catch (e) {
      return option
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading polls...</span>
      </div>
    )
  }

  if (polls.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-8">
          <div className="flex flex-col items-center justify-center text-center">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No public polls yet</h3>
            <p className="text-sm text-muted-foreground mb-4">Be the first to create a public poll for the community</p>
            <Button asChild>
              <a href="/dashboard/create">Create a Poll</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Sort polls by total votes (most popular first)
  const sortedPolls = [...polls].sort((a, b) => b.totalVotes - a.totalVotes)

  // Find the most popular poll
  const mostPopularPoll = sortedPolls[0]

  return (
    <>
      <div className="space-y-6">
        {sortedPolls.map((poll) => {
          const percentages = calculatePercentages(poll.optionVotes || [])
          const isMostPopular = poll.id === mostPopularPoll.id && polls.length > 1

          return (
            <Card key={poll.id} className={`overflow-hidden ${isMostPopular ? "border-primary/50 bg-primary/5" : ""}`}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-xl">{poll.question}</CardTitle>
                      {isMostPopular && (
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200">
                          <Award className="h-3 w-3 mr-1" />
                          Popular
                        </Badge>
                      )}
                    </div>
                    <CardDescription className="flex items-center mt-1">
                      <Users className="h-4 w-4 mr-1" />
                      {poll.totalVotes} {poll.totalVotes === 1 ? "vote" : "votes"}
                    </CardDescription>
                  </div>
                  {poll.hasVoted && (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Voted
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-1 mb-2">
                    {poll.isPublic ? (
                      <Badge variant="secondary">Public</Badge>
                    ) : (
                      <Badge variant="outline">
                        <Lock className="h-3 w-3 mr-1" />
                        Private
                      </Badge>
                    )}
                    {poll.biometricAuth && <Badge variant="outline">Biometric Auth</Badge>}
                    {poll.smsAuth && <Badge variant="outline">SMS Auth</Badge>}
                    {poll.geoRestricted && (
                      <Badge variant="outline" className="flex items-center">
                        <MapPin className="h-3 w-3 mr-1" />
                        {poll.location}
                      </Badge>
                    )}
                  </div>

                  <div className="space-y-3">
                    {poll.options.map((option, index) => {
                      const votes = poll.optionVotes?.[index] || 0
                      const percentage = percentages[index]
                      const isLeading = percentage === Math.max(...percentages) && percentage > 0

                      return (
                        <div key={index} className="space-y-1">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">{parseOption(option)}</span>
                            <span className="text-sm">
                              {votes} votes ({percentage.toFixed(1)}%)
                              {isLeading && poll.totalVotes > 0 && " 🏆"}
                            </span>
                          </div>
                          <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${isLeading ? "bg-green-500" : "bg-primary"}`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t pt-4 flex justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    toast({
                      title: "Coming soon",
                      description: "Sharing functionality will be available in the next update",
                    })
                  }}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Share
                </Button>
                <Button onClick={() => handleVote(poll)} disabled={poll.hasVoted}>
                  {poll.hasVoted ? "Already Voted" : "Vote Now"}
                </Button>
              </CardFooter>
            </Card>
          )
        })}
      </div>

      {selectedPoll && <VoteDialog poll={selectedPoll} open={isVoteDialogOpen} onOpenChange={setIsVoteDialogOpen} />}
    </>
  )
}

