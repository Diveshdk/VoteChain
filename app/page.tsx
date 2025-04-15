import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { AuthForm } from "@/components/auth-form"

export default function Home() {
  const cookieStore = cookies()
  const isLoggedIn = cookieStore.get("auth-token")

  if (isLoggedIn) {
    redirect("/dashboard")
  }

  return (
    <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)]">
      <div className="w-full max-w-md">
        <AuthForm />
      </div>
    </div>
  )
}

