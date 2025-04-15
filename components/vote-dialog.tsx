"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { useWeb3 } from "@/components/web3-provider"
import { Loader2, MapPin, AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface PollOption {
  type: "text" | "image"
  content: string
  imageUrl?: string
}

interface Poll {
  id: number
  question: string
  options: string[]
  isPublic: boolean
  geoRestricted?: boolean
  location?: string
}

interface VoteDialogProps {
  poll: Poll
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function VoteDialog({ poll, open, onOpenChange }: VoteDialogProps) {
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [accessCode, setAccessCode] = useState("")
  const [isVoting, setIsVoting] = useState(false)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [locationError, setLocationError] = useState<string | null>(null)
  const [isCheckingLocation, setIsCheckingLocation] = useState(false)
  const { contract } = useWeb3()
  const { toast } = useToast()

  useEffect(() => {
    // Check user's location if the poll has geo-restriction
    if (open && poll.geoRestricted) {
      checkUserLocation()
    }

    // Check if we have an access code stored for this poll
    if (open && !poll.isPublic) {
      const storedAccessCode = sessionStorage.getItem(`poll_${poll.id}_access`)
      if (storedAccessCode) {
        setAccessCode(storedAccessCode)
      }
    }
  }, [open, poll.geoRestricted, poll.isPublic, poll.id])

  const checkUserLocation = async () => {
    setIsCheckingLocation(true)
    setLocationError(null)

    try {
      // Use IP geolocation API (in a real app, you would use a service like ipinfo.io or ipapi.co)
      const response = await fetch("https://ipapi.co/json/")
      const data = await response.json()

      if (data.error) {
        throw new Error("Failed to get location data")
      }

      setUserLocation({
        lat: data.latitude,
        lng: data.longitude,
      })

      // Check if user is within the allowed region
      // This is a simplified check - in a real app, you would use more sophisticated geo-fencing
      if (poll.location && poll.location !== data.city) {
        setLocationError(`This poll is restricted to voters in ${poll.location}. You appear to be in ${data.city}.`)
      }
    } catch (error) {
      console.error("Error getting location:", error)
      setLocationError("Unable to verify your location. Please enable location services.")
    } finally {
      setIsCheckingLocation(false)
    }
  }

  const handleVote = async () => {
    if (selectedOption === null) {
      toast({
        title: "No option selected",
        description: "Please select an option to vote",
        variant: "destructive",
      })
      return
    }

    if (poll.geoRestricted && locationError) {
      toast({
        title: "Location restricted",
        description: "You are not in the allowed region for this poll",
        variant: "destructive",
      })
      return
    }

    if (!contract) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to vote",
        variant: "destructive",
      })
      return
    }

    if (!poll.isPublic && !accessCode) {
      toast({
        title: "Access code required",
        description: "Please enter the access code for this private poll",
        variant: "destructive",
      })
      return
    }

    try {
      setIsVoting(true)

      const tx = await contract.vote(poll.id, selectedOption, poll.isPublic ? "" : accessCode)

      await tx.wait()

      toast({
        title: "Vote successful",
        description: "Your vote has been recorded on the blockchain",
      })

      onOpenChange(false)
      // Refresh the page to update the poll status
      window.location.reload()
    } catch (error) {
      console.error("Voting error:", error)
      toast({
        title: "Voting failed",
        description: "There was an error while submitting your vote",
        variant: "destructive",
      })
    } finally {
      setIsVoting(false)
    }
  }

  // Function to parse option data
  const parseOption = (option: string, index: number) => {
    try {
      if (typeof option === "string" && option.startsWith("{")) {
        const parsed = JSON.parse(option)
        if (parsed.type === "image") {
          return (
            <div className="space-y-2">
              <div className="relative w-full h-24 bg-muted rounded-md overflow-hidden">
                <img
                  src={parsed.url || "/placeholder.svg"}
                  alt={`Option ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = "/placeholder.svg?height=96&width=192"
                  }}
                />
              </div>
              {parsed.caption && <p className="text-sm">{parsed.caption}</p>}
            </div>
          )
        }
      }
      return option
    } catch (e) {
      return option
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{poll.question}</DialogTitle>
          <DialogDescription>Select an option to cast your vote</DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {poll.geoRestricted && (
            <div className="mb-4">
              {isCheckingLocation ? (
                <div className="flex items-center justify-center p-2">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  <span>Verifying your location...</span>
                </div>
              ) : locationError ? (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Location Restricted</AlertTitle>
                  <AlertDescription>{locationError}</AlertDescription>
                </Alert>
              ) : (
                <Alert>
                  <MapPin className="h-4 w-4" />
                  <AlertTitle>Location Verified</AlertTitle>
                  <AlertDescription>Your location has been verified for this poll.</AlertDescription>
                </Alert>
              )}
            </div>
          )}

          <RadioGroup
            value={selectedOption?.toString()}
            onValueChange={(value) => setSelectedOption(Number.parseInt(value))}
          >
            {poll.options.map((option, index) => (
              <div
                key={index}
                className={`flex items-center space-x-2 p-3 rounded-md border cursor-pointer ${
                  selectedOption === index ? "bg-primary/10 border-primary" : "border-input"
                }`}
                onClick={() => setSelectedOption(index)}
              >
                <RadioGroupItem
                  value={index.toString()}
                  checked={selectedOption === index}
                  className="pointer-events-none"
                />
                <Label className="flex-1 cursor-pointer">{parseOption(option, index)}</Label>
              </div>
            ))}
          </RadioGroup>

          {!poll.isPublic && (
            <div className="mt-4">
              <Label htmlFor="access-code">Access Code</Label>
              <Input
                id="access-code"
                placeholder="Enter access code for private poll"
                value={accessCode}
                onChange={(e) => {
                  setAccessCode(e.target.value)
                  sessionStorage.setItem(`poll_${poll.id}_access`, e.target.value)
                }}
                className="mt-1"
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleVote}
            disabled={
              isVoting || selectedOption === null || (poll.geoRestricted && (isCheckingLocation || !!locationError))
            }
          >
            {isVoting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Voting...
              </>
            ) : (
              "Submit Vote"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

