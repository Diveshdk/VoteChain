import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { NFTShop } from "@/components/nft-shop"

export default function ShopPage() {
  const cookieStore = cookies()
  const isLoggedIn = cookieStore.get("auth-token")

  if (!isLoggedIn) {
    redirect("/")
  }

  return (
    <div className="container py-6">
      <h1 className="text-3xl font-bold mb-6">NFT Rewards Shop</h1>
      <NFTShop />
    </div>
  )
}

