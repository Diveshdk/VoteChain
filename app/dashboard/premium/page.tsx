import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { EnhancedPremiumDashboard } from "@/components/enhanced-premium-dashboard"

export default function PremiumPage() {
  const cookieStore = cookies()
  const isLoggedIn = cookieStore.get("auth-token")

  if (!isLoggedIn) {
    redirect("/")
  }

  return (
    <div className="container py-6">
      <h1 className="text-3xl font-bold mb-6">Premium Dashboard</h1>
      <EnhancedPremiumDashboard />
    </div>
  )
}

