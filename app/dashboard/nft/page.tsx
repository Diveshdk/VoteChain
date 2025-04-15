import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { NFTGallery } from "@/components/nft-gallery"
import { UserProfile } from "@/components/user-profile"
import { AchievementBadges } from "@/components/achievement-badges"
import { Leaderboard } from "@/components/leaderboard"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function NFTPage() {
  const cookieStore = cookies()
  const isLoggedIn = cookieStore.get("auth-token")

  if (!isLoggedIn) {
    redirect("/")
  }

  return (
    <div className="container py-6">
      <h1 className="text-3xl font-bold mb-6">Your NFT Collection</h1>
      <UserProfile />

      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Tabs defaultValue="nfts">
            <TabsList className="w-full mb-4">
              <TabsTrigger value="nfts" className="flex-1">
                Vote History
              </TabsTrigger>
              <TabsTrigger value="badges" className="flex-1">
                Achievement Badges
              </TabsTrigger>
            </TabsList>
            <TabsContent value="nfts">
              <h2 className="text-2xl font-bold mb-4">Vote History</h2>
              <NFTGallery />
            </TabsContent>
            <TabsContent value="badges">
              <h2 className="text-2xl font-bold mb-4">Your Achievements</h2>
              <AchievementBadges />
            </TabsContent>
          </Tabs>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-4">Leaderboard</h2>
          <Leaderboard />
        </div>
      </div>
    </div>
  )
}

