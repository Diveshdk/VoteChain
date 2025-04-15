import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { PublicPolls } from "@/components/public-polls"
import { DashboardHeader } from "@/components/dashboard-header"
import { JoinPrivatePoll } from "@/components/join-private-poll"
import { AiTrendRecommendations } from "@/components/ai-trend-recommendations"
import { AiChatbot } from "@/components/ai-chatbot"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function DashboardPage() {
  const cookieStore = cookies()
  const isLoggedIn = cookieStore.get("auth-token")

  if (!isLoggedIn) {
    redirect("/")
  }

  return (
    <div className="container py-6">
      <DashboardHeader />
      <div className="mt-8">
        <Tabs defaultValue="public" className="w-full">
          <TabsList className="w-full max-w-md mx-auto mb-6">
            <TabsTrigger value="public" className="flex-1">
              Public Polls
            </TabsTrigger>
            <TabsTrigger value="private" className="flex-1">
              Join Private Poll
            </TabsTrigger>
          </TabsList>
          <TabsContent value="public">
            <h2 className="text-2xl font-bold mb-4">Public Polls</h2>
            <PublicPolls />
          </TabsContent>
          <TabsContent value="private">
            <div className="max-w-md mx-auto">
              <JoinPrivatePoll />
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* AI Components */}
      <AiTrendRecommendations />
      <AiChatbot />
    </div>
  )
}

