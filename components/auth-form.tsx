"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import { useWeb3 } from "@/components/web3-provider"
import { AnonAadhaarProvider } from "@anon-aadhaar/react"
import { AadhaarVerification } from "@/components/aadhaar-verification"
import { BiometricAuth } from "@/components/biometric-auth"
import { Fingerprint } from "lucide-react"

// App ID from Anon Aadhaar (you should replace this with your actual app ID)
const APP_ID = "1234567890123456789012345678901234567890123"

export function AuthForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    aadhaar: "",
    password: "",
    confirmPassword: "",
    enableBiometrics: false,
  })
  const [loginData, setLoginData] = useState({
    identifier: "",
    password: "",
    useBiometrics: false,
  })
  const router = useRouter()
  const { toast } = useToast()
  const { contract, address, connectWallet, isConnected } = useWeb3()

  const [verificationStep, setVerificationStep] = useState({
    aadhaarVerified: false,
    otpVerified: false,
    biometricVerified: false,
  })

  const isMobileDevice = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  }

  const handleAadhaarVerified = () => {
    setVerificationStep((prev) => ({ ...prev, aadhaarVerified: true }))
  }

  const handleOtpVerified = () => {
    setVerificationStep((prev) => ({ ...prev, otpVerified: true }))
  }

  const handleBiometricVerified = () => {
    setVerificationStep((prev) => ({ ...prev, biometricVerified: true }))

    // If this is during login and biometrics are verified, proceed with login
    if (loginData.useBiometrics) {
      handleBiometricLogin()
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSwitchChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, enableBiometrics: checked }))
  }

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setLoginData((prev) => ({ ...prev, [name]: value }))
  }

  const handleLoginSwitchChange = (checked: boolean) => {
    setLoginData((prev) => ({ ...prev, useBiometrics: checked }))
  }

  const handleBiometricLogin = async () => {
    // Check if a fingerprint token exists
    const fingerprintToken = localStorage.getItem("votechain-fingerprint-token")

    if (!fingerprintToken) {
      toast({
        title: "Fingerprint not registered",
        description: "You need to register with fingerprint authentication first",
        variant: "destructive",
      })
      return
    }

    // In a real implementation, this would verify the biometric credentials
    // against the stored credentials

    // Simulate fingerprint verification
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // If verification is successful, log the user in
    document.cookie = "auth-token=fingerprint-token; path=/"
    router.push("/dashboard")

    toast({
      title: "Login successful",
      description: "You have been authenticated using fingerprint",
    })
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()

    // Test login bypass
    if (formData.email === "test" && formData.password === "test") {
      document.cookie = "auth-token=test-token; path=/"
      router.push("/dashboard")
      return
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Passwords do not match",
        variant: "destructive",
      })
      return
    }

    if (!isConnected) {
      await connectWallet()
      return
    }

    try {
      setIsLoading(true)

      if (!contract) {
        throw new Error("Contract not initialized")
      }

      // If biometrics are enabled, store this information
      if (formData.enableBiometrics) {
        // In a real implementation, we would register biometric credentials
        localStorage.setItem("votechain-biometrics-enabled", "true")
      }

      const tx = await contract.register(formData.name, "", formData.email, formData.password)

      await tx.wait()

      toast({
        title: "Registration successful",
        description: "You have been registered successfully",
      })

      document.cookie = `auth-token=${address}; path=/`
      router.push("/dashboard")
    } catch (error) {
      console.error("Registration error:", error)
      toast({
        title: "Registration failed",
        description: "There was an error during registration",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    // If biometric login is selected, trigger biometric authentication
    if (loginData.useBiometrics) {
      // Check if biometrics were enabled during registration
      const biometricsEnabled = localStorage.getItem("votechain-biometrics-enabled")

      if (biometricsEnabled === "true") {
        // The actual login will happen in handleBiometricVerified after successful authentication
        return
      } else {
        toast({
          title: "Biometrics not enabled",
          description: "You need to register with biometrics first",
          variant: "destructive",
        })
        return
      }
    }

    // Test login bypass
    if (loginData.identifier === "test" && loginData.password === "test") {
      document.cookie = "auth-token=test-token; path=/"
      router.push("/dashboard")
      return
    }

    if (!isConnected) {
      await connectWallet()
      return
    }

    try {
      setIsLoading(true)

      if (!contract) {
        throw new Error("Contract not initialized")
      }

      const isLoggedIn = await contract.login(loginData.password)

      if (isLoggedIn) {
        toast({
          title: "Login successful",
          description: "You have been logged in successfully",
        })

        document.cookie = `auth-token=${address}; path=/`
        router.push("/dashboard")
      } else {
        toast({
          title: "Login failed",
          description: "Invalid credentials",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Login error:", error)
      toast({
        title: "Login failed",
        description: "There was an error during login",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AnonAadhaarProvider appId={APP_ID}>
      <Tabs defaultValue="login" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="login">Login</TabsTrigger>
          <TabsTrigger value="register">Register</TabsTrigger>
        </TabsList>
        <TabsContent value="login">
          <Card>
            <CardHeader>
              <CardTitle>Login</CardTitle>
              <CardDescription>Enter your credentials to access your account</CardDescription>
            </CardHeader>
            <form onSubmit={handleLogin}>
              <CardContent className="space-y-4">
                {loginData.useBiometrics ? (
                  <BiometricAuth
                    onAuthenticated={handleBiometricVerified}
                    onError={(error) => {
                      toast({
                        title: "Authentication failed",
                        description: error,
                        variant: "destructive",
                      })
                    }}
                    onNotSupported={() => {
                      setLoginData((prev) => ({ ...prev, useBiometrics: false }))
                      toast({
                        title: "Fingerprint not supported",
                        description: "Your device doesn't support fingerprint authentication",
                        variant: "destructive",
                      })
                    }}
                  />
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="identifier">Email</Label>
                      <Input
                        id="identifier"
                        name="identifier"
                        placeholder="Enter your email"
                        value={loginData.identifier}
                        onChange={handleLoginChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="login-password">Password</Label>
                      <Input
                        id="login-password"
                        name="password"
                        type="password"
                        placeholder="Enter your password"
                        value={loginData.password}
                        onChange={handleLoginChange}
                        required
                      />
                    </div>
                  </>
                )}

                {isMobileDevice() && (
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="use-biometrics"
                      checked={loginData.useBiometrics}
                      onCheckedChange={handleLoginSwitchChange}
                    />
                    <Label htmlFor="use-biometrics" className="cursor-pointer flex items-center">
                      <Fingerprint className="h-4 w-4 mr-1" />
                      Use fingerprint authentication
                    </Label>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Logging in..." : "Login"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
        <TabsContent value="register">
          <Card>
            <CardHeader>
              <CardTitle>Register</CardTitle>
              <CardDescription>Create a new account to start voting</CardDescription>
            </CardHeader>
            <form onSubmit={handleRegister}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="aadhaar">Aadhaar Number</Label>
                  <Input
                    id="aadhaar"
                    name="aadhaar"
                    placeholder="Enter your Aadhaar number"
                    value={formData.aadhaar}
                    onChange={handleChange}
                    required
                  />
                </div>
                <AadhaarVerification aadhaarNumber={formData.aadhaar} onVerified={handleAadhaarVerified} />
                {verificationStep.aadhaarVerified && isMobileDevice() && (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="enable-biometrics"
                        checked={formData.enableBiometrics}
                        onCheckedChange={handleSwitchChange}
                      />
                      <Label htmlFor="enable-biometrics" className="cursor-pointer flex items-center">
                        <Fingerprint className="h-4 w-4 mr-1" />
                        Enable fingerprint authentication
                      </Label>
                    </div>
                    {formData.enableBiometrics && (
                      <BiometricAuth
                        onAuthenticated={handleBiometricVerified}
                        onError={(error) => {
                          toast({
                            title: "Biometric setup failed",
                            description: error,
                            variant: "destructive",
                          })
                        }}
                        onNotSupported={() => {
                          setFormData((prev) => ({ ...prev, enableBiometrics: false }))
                          toast({
                            title: "Biometrics not supported",
                            description: "Your device doesn't support biometric authentication",
                            variant: "destructive",
                          })
                        }}
                      />
                    )}
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading || (!verificationStep.aadhaarVerified && formData.email !== "test")}
                >
                  {isLoading ? "Registering..." : "Register"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
      </Tabs>
    </AnonAadhaarProvider>
  )
}

