"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

interface OTPVerificationProps {
  phoneNumber: string
  onVerified: () => void
}

export function OTPVerification({ phoneNumber, onVerified }: OTPVerificationProps) {
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""))
  const [isVerifying, setIsVerifying] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [timer, setTimer] = useState(30)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const { toast } = useToast()

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (otpSent && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1)
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [otpSent, timer])

  const handleChange = (index: number, value: string) => {
    // Only allow numbers
    if (value && !/^\d+$/.test(value)) return

    const newOtp = [...otp]
    // Take only the last character if multiple characters are pasted
    newOtp[index] = value.slice(-1)
    setOtp(newOtp)

    // Move to next input if current input is filled
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Move to previous input on backspace if current input is empty
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData("text/plain").trim()

    // Check if pasted content is a 6-digit number
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split("")
      setOtp(digits)

      // Focus the last input
      inputRefs.current[5]?.focus()
    }
  }

  const sendOTP = async () => {
    if (!phoneNumber) {
      toast({
        title: "Phone number required",
        description: "Please enter your phone number to receive OTP",
        variant: "destructive",
      })
      return
    }

    setIsSending(true)
    try {
      // In a real implementation, this would call an API to send OTP
      // For now, we'll simulate OTP sending
      await new Promise((resolve) => setTimeout(resolve, 1500))

      setOtpSent(true)
      setTimer(30)
      toast({
        title: "OTP sent",
        description: `A verification code has been sent to ${phoneNumber}`,
      })
    } catch (error) {
      toast({
        title: "Failed to send OTP",
        description: "There was an error sending the verification code",
        variant: "destructive",
      })
    } finally {
      setIsSending(false)
    }
  }

  const verifyOTP = async () => {
    const otpString = otp.join("")
    if (otpString.length !== 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter a valid 6-digit OTP",
        variant: "destructive",
      })
      return
    }

    setIsVerifying(true)
    try {
      // In a real implementation, this would call an API to verify OTP
      // For now, we'll simulate OTP verification
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // For demo purposes, any OTP is considered valid
      toast({
        title: "OTP verified",
        description: "Your phone number has been verified successfully",
      })
      onVerified()
    } catch (error) {
      toast({
        title: "Verification failed",
        description: "The OTP you entered is incorrect",
        variant: "destructive",
      })
    } finally {
      setIsVerifying(false)
    }
  }

  return (
    <Card className="border-dashed">
      <CardContent className="pt-4">
        <div className="flex flex-col space-y-4">
          <div>
            <Label className="text-sm font-medium">Phone Verification</Label>
            <p className="text-xs text-muted-foreground mt-1">
              We'll send a verification code to {phoneNumber || "your phone number"}
            </p>
          </div>

          {!otpSent ? (
            <Button
              variant="outline"
              size="sm"
              onClick={sendOTP}
              disabled={isSending || !phoneNumber}
              className="w-full"
            >
              {isSending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending OTP...
                </>
              ) : (
                "Send OTP"
              )}
            </Button>
          ) : (
            <>
              <div className="flex justify-between gap-2">
                {Array(6)
                  .fill(0)
                  .map((_, index) => (
                    <Input
                      key={index}
                      ref={(el) => (inputRefs.current[index] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={otp[index]}
                      onChange={(e) => handleChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      onPaste={index === 0 ? handlePaste : undefined}
                      className="w-10 h-10 text-center p-0"
                    />
                  ))}
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={verifyOTP}
                  disabled={isVerifying || otp.join("").length !== 6}
                  className="flex-1"
                >
                  {isVerifying ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    "Verify OTP"
                  )}
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={sendOTP}
                  disabled={isSending || timer > 0}
                  className="text-xs"
                >
                  {timer > 0 ? `Resend in ${timer}s` : "Resend OTP"}
                </Button>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

