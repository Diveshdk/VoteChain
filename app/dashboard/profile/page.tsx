import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { UserProfile } from "@/components/user-profile"

export default function ProfilePage() {
  const cookieStore = cookies()
  const isLoggedIn = cookieStore.get("auth-token")

  if (!isLoggedIn) {
    redirect("/")
  }

  return (
    <div className="container py-6">
      <h1 className="text-3xl font-bold mb-6">Your Profile</h1>
      <UserProfile />
    </div>
  )
}

