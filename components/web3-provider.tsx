"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { ethers } from "ethers"
import VotingSystemABI from "@/lib/VotingSystemABI.json"
import { useToast } from "@/components/ui/use-toast"

type Web3ContextType = {
  provider: ethers.BrowserProvider | null
  signer: ethers.JsonRpcSigner | null
  contract: ethers.Contract | null
  address: string | null
  connectWallet: () => Promise<void>
  isConnected: boolean
  isConnecting: boolean
  error: string | null
}

const Web3Context = createContext<Web3ContextType>({
  provider: null,
  signer: null,
  contract: null,
  address: null,
  connectWallet: async () => {},
  isConnected: false,
  isConnecting: false,
  error: null,
})

export const useWeb3 = () => useContext(Web3Context)

const CONTRACT_ADDRESS = "" // Replace with your contract address

export function Web3Provider({ children }: { children: React.ReactNode }) {
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null)
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null)
  const [contract, setContract] = useState<ethers.Contract | null>(null)
  const [address, setAddress] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const connectWallet = async () => {
    if (!window.ethereum) {
      toast({
        title: "MetaMask not found",
        description: "Please install MetaMask to use this application",
        variant: "destructive",
      })
      return
    }

    try {
      setIsConnecting(true)
      setError(null)

      const browserProvider = new ethers.BrowserProvider(window.ethereum)
      const accounts = await browserProvider.send("eth_requestAccounts", [])

      if (accounts.length === 0) {
        throw new Error("No accounts found")
      }

      const userSigner = await browserProvider.getSigner()
      const userAddress = await userSigner.getAddress()

      const votingContract = new ethers.Contract(CONTRACT_ADDRESS, VotingSystemABI, userSigner)

      setProvider(browserProvider)
      setSigner(userSigner)
      setContract(votingContract)
      setAddress(userAddress)
      setIsConnected(true)

      toast({
        title: "Wallet connected",
        description: `Connected to ${userAddress.slice(0, 6)}...${userAddress.slice(-4)}`,
      })
    } catch (err) {
      console.error("Error connecting wallet:", err)
      setError("Failed to connect wallet")
      toast({
        title: "Connection failed",
        description: "Could not connect to your wallet",
        variant: "destructive",
      })
    } finally {
      setIsConnecting(false)
    }
  }

  useEffect(() => {
    // Check if already connected
    const checkConnection = async () => {
      if (window.ethereum) {
        try {
          const browserProvider = new ethers.BrowserProvider(window.ethereum)
          const accounts = await browserProvider.listAccounts()

          if (accounts.length > 0) {
            const userSigner = await browserProvider.getSigner()
            const userAddress = await userSigner.getAddress()

            const votingContract = new ethers.Contract(CONTRACT_ADDRESS, VotingSystemABI, userSigner)

            setProvider(browserProvider)
            setSigner(userSigner)
            setContract(votingContract)
            setAddress(userAddress)
            setIsConnected(true)
          }
        } catch (err) {
          console.error("Error checking connection:", err)
        }
      }
    }

    checkConnection()

    // Handle account changes
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts: string[]) => {
        if (accounts.length === 0) {
          // User disconnected
          setProvider(null)
          setSigner(null)
          setContract(null)
          setAddress(null)
          setIsConnected(false)
        } else {
          // Account changed, reconnect
          connectWallet()
        }
      })
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners("accountsChanged")
      }
    }
  }, [])

  return (
    <Web3Context.Provider
      value={{
        provider,
        signer,
        contract,
        address,
        connectWallet,
        isConnected,
        isConnecting,
        error,
      }}
    >
      {children}
    </Web3Context.Provider>
  )
}

