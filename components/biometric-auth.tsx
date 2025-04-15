"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { Fingerprint, AlertCircle, Loader2 } from "lucide-react"

interface BiometricAuthProps {
  onAuthenticated?: () => void
  onError?: (error: string) => void
  onNotSupported?: () => void
}

export function BiometricAuth({ onAuthenticated, onError, onNotSupported }: BiometricAuthProps) {
  const [isSupported, setIsSupported] = useState<boolean | null>(null)
  const [isAuthenticating, setIsAuthenticating] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    // Check if Web Authentication API is supported and if we're on a mobile device
    const checkBiometricSupport = async () => {
      // Check if we're on a mobile device
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)

      if (!isMobile) {
        setIsSupported(false)
        if (onNotSupported) onNotSupported()
        return
      }

      if (
        window.PublicKeyCredential &&
        typeof window.PublicKeyCredential === "function" &&
        typeof window.navigator.credentials.create === "function" &&
        typeof window.navigator.credentials.get === "function"
      ) {
        try {
          // Check if platform authenticator is available
          const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
          setIsSupported(available)

          if (!available && onNotSupported) {
            onNotSupported()
          }
        } catch (error) {
          setIsSupported(false)
          if (onNotSupported) onNotSupported()
        }
      } else {
        setIsSupported(false)
        if (onNotSupported) onNotSupported()
      }
    }

    checkBiometricSupport()
  }, [onNotSupported])

  const authenticateWithBiometrics = async () => {
    if (!isSupported) {
      toast({
        title: "Fingerprint authentication not supported",
        description: "Your device doesn't support fingerprint authentication",
        variant: "destructive",
      })
      return
    }

    setIsAuthenticating(true)

    try {
      // In a real implementation, this would use the WebAuthn API to register or verify credentials

      // Simulate fingerprint authentication
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Store a fingerprint token in localStorage (in a real app, this would be a secure credential)
      const fingerprintToken = btoa(Math.random().toString(36) + Date.now().toString(36))
      localStorage.setItem("votechain-fingerprint-token", fingerprintToken)

      // Simulate successful authentication
      if (onAuthenticated) {
        onAuthenticated()
      }

      toast({
        title: "Fingerprint registered",
        description: "Your fingerprint has been successfully registered for authentication",
      })
    } catch (error) {
      console.error("Biometric authentication error:", error)

      const errorMessage = "Failed to register fingerprint"
      if (onError) {
        onError(errorMessage)
      }

      toast({
        title: "Authentication failed",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsAuthenticating(false)
    }
  }

  if (isSupported === null) {
    return (
      <Card className="border-dashed">
        <CardContent className="pt-4 flex items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin mr-2" />
          <span>Checking biometric support...</span>
        </CardContent>
      </Card>
    )
  }

  if (isSupported === false) {
    return (
      <Card className="border-dashed">
        <CardContent className="pt-4">
          <div className="flex items-center mb-2">
            <AlertCircle className="h-5 w-5 text-destructive mr-2" />
            <h3 className="text-sm font-medium">Fingerprint Authentication Not Supported</h3>
          </div>
          <p className="text-xs text-muted-foreground">
            Your device doesn't support fingerprint authentication. Please use password authentication instead.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-dashed">
      <CardContent className="pt-4">
        <div className="flex items-center space-x-2 mb-2">
          <h3 className="text-sm font-medium">Fingerprint Authentication</h3>
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Supported
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground mb-4">
          Use your fingerprint to securely authenticate without entering a password.
        </p>
        <Button onClick={authenticateWithBiometrics} disabled={isAuthenticating} className="w-full" variant="outline">
          {isAuthenticating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Registering fingerprint...
            </>
          ) : (
            <>
              <Fingerprint className="mr-2 h-4 w-4" />
              Register Fingerprint
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}

