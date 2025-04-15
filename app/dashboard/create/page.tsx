import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { CreatePollForm } from "@/components/create-poll-form"

export default function CreatePollPage() {
  const cookieStore = cookies()
  const isLoggedIn = cookieStore.get("auth-token")

  if (!isLoggedIn) {
    redirect("/")
  }

  return (
    <div className="container py-6">
      <h1 className="text-3xl font-bold mb-6">Create New Poll</h1>
      <div className="max-w-2xl mx-auto">
        <CreatePollForm />
      </div>
    </div>
  )
}

