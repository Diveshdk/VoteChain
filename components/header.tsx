"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useWeb3 } from "@/components/web3-provider"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Menu, User, LogOut } from "lucide-react"
import { LanguageSelector } from "@/components/language-selector"

export default function Header() {
  const pathname = usePathname()
  const { address, connectWallet, isConnected } = useWeb3()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    // Check if user is logged in
    const authToken = document.cookie.split("; ").find((row) => row.startsWith("auth-token="))

    setIsLoggedIn(!!authToken)
  }, [pathname])

  const handleLogout = () => {
    document.cookie = "auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT"
    window.location.href = "/"
  }

  const truncateAddress = (addr: string) => {
    if (!addr) return ""
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  return (
    <header className="border-b bg-background">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href={isLoggedIn ? "/dashboard" : "/"} className="font-bold text-xl">
            VoteChain
          </Link>

          {isLoggedIn && (
            <nav className="hidden md:flex gap-6">
              <Link
                href="/dashboard"
                className={`text-sm font-medium ${pathname === "/dashboard" ? "text-primary" : "text-muted-foreground"}`}
              >
                Home
              </Link>
              <Link
                href="/dashboard/create"
                className={`text-sm font-medium ${pathname === "/dashboard/create" ? "text-primary" : "text-muted-foreground"}`}
              >
                Create Poll
              </Link>
              <Link
                href="/dashboard/nft"
                className={`text-sm font-medium ${pathname === "/dashboard/nft" ? "text-primary" : "text-muted-foreground"}`}
              >
                My NFTs
              </Link>
              <Link
                href="/dashboard/shop"
                className={`text-sm font-medium ${pathname === "/dashboard/shop" ? "text-primary" : "text-muted-foreground"}`}
              >
                Rewards Shop
              </Link>
              <Link
                href="/dashboard/premium"
                className={`text-sm font-medium ${pathname === "/dashboard/premium" ? "text-primary" : "text-muted-foreground"}`}
              >
                Premium
              </Link>
              <Link
                href="/dashboard/profile"
                className={`text-sm font-medium ${pathname === "/dashboard/profile" ? "text-primary" : "text-muted-foreground"}`}
              >
                Profile
              </Link>
            </nav>
          )}
        </div>

        <div className="flex items-center gap-4">
          <LanguageSelector />

          {isLoggedIn ? (
            <>
              <div className="hidden md:flex items-center gap-2">
                {isConnected ? (
                  <Button variant="outline" size="sm">
                    <User className="h-4 w-4 mr-2" />
                    {truncateAddress(address || "")}
                  </Button>
                ) : (
                  <Button variant="outline" size="sm" onClick={connectWallet}>
                    Connect Wallet
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild className="md:hidden">
                  <Button variant="outline" size="icon">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard">Home</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/create">Create Poll</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/nft">My NFTs</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/shop">Rewards Shop</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/premium">Premium</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/profile">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Button variant="default" size="sm" onClick={connectWallet}>
              Connect Wallet
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}

