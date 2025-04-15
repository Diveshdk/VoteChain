"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useAnonAadhaar, LogInWithAnonAadhaar } from "@anon-aadhaar/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, QrCode, Upload, Check } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface AadhaarVerificationProps {
  aadhaarNumber: string
  onVerified?: () => void
}

export function AadhaarVerification({ aadhaarNumber, onVerified = () => {} }: AadhaarVerificationProps) {
  const [anonAadhaar] = useAnonAadhaar()
  const [isVerifying, setIsVerifying] = useState(false)
  const [qrFile, setQrFile] = useState<File | null>(null)
  const [verificationMethod, setVerificationMethod] = useState<"qr" | "manual">("qr")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    // Check the verification status when the component mounts or status changes
    if (anonAadhaar.status === "logged-in") {
      setIsVerifying(false)
      onVerified() // Call the onVerified callback when verification is successful
    }
  }, [anonAadhaar.status, onVerified])

  const handleQrUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      setQrFile(files[0])

      // Read the QR code file
      const reader = new FileReader()
      reader.onload = (event) => {
        if (event.target?.result) {
          toast({
            title: "QR Code uploaded",
            description: "QR code has been successfully uploaded and read",
          })
        }
      }
      reader.readAsDataURL(files[0])
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  // For test purposes, we'll simulate verification
  const handleTestVerify = async () => {
    setIsVerifying(true)

    try {
      // Simulate verification process
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Simulate successful verification
      toast({
        title: "Verification successful",
        description: "Your Aadhaar has been verified for testing purposes",
      })

      onVerified()
    } catch (error) {
      console.error("Aadhaar verification error:", error)
      toast({
        title: "Verification failed",
        description: "There was an error verifying your Aadhaar",
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
          <div className="flex items-center space-x-2">
            <h3 className="text-sm font-medium">Aadhaar Verification</h3>
            {anonAadhaar.status === "logged-in" ? (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <Check className="h-3 w-3 mr-1" />
                Verified
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                Pending
              </Badge>
            )}
          </div>

          {anonAadhaar.status !== "logged-in" && (
            <Tabs defaultValue="qr" onValueChange={(value) => setVerificationMethod(value as "qr" | "manual")}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="qr">QR Code</TabsTrigger>
                <TabsTrigger value="manual">Manual Entry</TabsTrigger>
              </TabsList>

              <TabsContent value="qr" className="space-y-4">
                <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-md p-6 bg-muted/50">
                  {qrFile ? (
                    <div className="flex flex-col items-center">
                      <div className="relative w-32 h-32 mb-2 bg-background rounded-md flex items-center justify-center">
                        <img
                          src={URL.createObjectURL(qrFile) || "/placeholder.svg"}
                          alt="QR Code Preview"
                          className="max-w-full max-h-full object-contain"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">{qrFile.name}</p>
                      <Button variant="outline" size="sm" onClick={triggerFileInput}>
                        Change QR Code
                      </Button>
                    </div>
                  ) : (
                    <>
                      <QrCode className="h-10 w-10 text-muted-foreground mb-2" />
                      <p className="text-sm font-medium mb-1">Upload Aadhaar QR Code</p>
                      <p className="text-xs text-muted-foreground text-center mb-4">
                        Scan the QR code on your Aadhaar card or upload an image of the QR code
                      </p>
                      <Button variant="outline" onClick={triggerFileInput}>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload QR Code
                      </Button>
                    </>
                  )}
                  <input type="file" ref={fileInputRef} accept="image/*" className="hidden" onChange={handleQrUpload} />
                </div>
              </TabsContent>

              <TabsContent value="manual">
                <div className="space-y-2">
                  <Label htmlFor="aadhaar-number">Aadhaar Number</Label>
                  <Input id="aadhaar-number" placeholder="XXXX XXXX XXXX" value={aadhaarNumber} disabled />
                  <p className="text-xs text-muted-foreground">Enter your 12-digit Aadhaar number without spaces</p>
                </div>
              </TabsContent>
            </Tabs>
          )}

          {anonAadhaar.status !== "logged-in" && (
            <div className="space-y-4">
              {/* Use the LogInWithAnonAadhaar component from the library */}
              <div className="flex justify-center">
                <LogInWithAnonAadhaar />
              </div>

              {/* For testing purposes, add a test verification button */}
              <Button variant="outline" size="sm" onClick={handleTestVerify} disabled={isVerifying} className="w-full">
                {isVerifying ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Test Verification (Bypass)"
                )}
              </Button>
            </div>
          )}

          <p className="text-xs text-muted-foreground text-center">
            Your Aadhaar information is verified using zero-knowledge proofs for privacy. No personal data is stored on
            the blockchain.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

