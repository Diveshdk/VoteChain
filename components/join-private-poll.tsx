"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { useWeb3 } from "@/components/web3-provider"
import { Loader2, Lock } from "lucide-react"
import { VoteDialog } from "@/components/vote-dialog"

interface PrivatePoll {
  id: number
  question: string
  options: string[]
  isPublic: boolean
}

export function JoinPrivatePoll() {
  const [pollId, setPollId] = useState("")
  const [accessCode, setAccessCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [poll, setPoll] = useState<PrivatePoll | null>(null)
  const [isVoteDialogOpen, setIsVoteDialogOpen] = useState(false)
  const { contract } = useWeb3()
  const { toast } = useToast()

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!pollId.trim()) {
      toast({
        title: "Missing poll ID",
        description: "Please enter a poll ID",
        variant: "destructive",
      })
      return
    }

    if (!accessCode.trim()) {
      toast({
        title: "Missing access code",
        description: "Please enter the access code for this poll",
        variant: "destructive",
      })
      return
    }

    if (!contract) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to join a poll",
        variant: "destructive",
      })
      return
    }

    try {
      setIsLoading(true)

      // Verify the poll exists and is private
      const id = Number(pollId)
      const [creator, question, isPublic, biometricAuth, smsAuth, totalVotes] = await contract.getPollInfo(id)

      if (isPublic) {
        toast({
          title: "Public poll",
          description: "This is a public poll. You can find it in the Public Polls tab.",
          variant: "destructive",
        })
        return
      }

      // Get poll options
      const options = await contract.getPollOptions(id)

      // Store the access code for this poll
      sessionStorage.setItem(`poll_${id}_access`, accessCode)

      // Set the poll data and open the vote dialog
      setPoll({
        id,
        question,
        options,
        isPublic: false,
      })

      setIsVoteDialogOpen(true)
    } catch (error) {
      console.error("Error joining poll:", error)
      toast({
        title: "Error",
        description: "Failed to join poll. Please check the poll ID and try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Join Private Poll</CardTitle>
          <CardDescription>Enter the poll ID and access code to join a private poll</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleJoin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="poll-id">Poll ID</Label>
              <Input
                id="poll-id"
                placeholder="Enter poll ID"
                value={pollId}
                onChange={(e) => setPollId(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="access-code">Access Code</Label>
              <Input
                id="access-code"
                placeholder="Enter access code"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Joining...
                </>
              ) : (
                <>
                  <Lock className="mr-2 h-4 w-4" />
                  Join Poll
                </>
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center border-t pt-4">
          <p className="text-sm text-muted-foreground">
            Don't have a poll ID? Ask the poll creator to share it with you.
          </p>
        </CardFooter>
      </Card>

      {poll && <VoteDialog poll={poll} open={isVoteDialogOpen} onOpenChange={setIsVoteDialogOpen} />}
    </>
  )
}

