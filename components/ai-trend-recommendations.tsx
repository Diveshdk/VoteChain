"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { Sparkles, TrendingUp, Loader2, X } from "lucide-react"

interface TrendRecommendation {
  id: string
  title: string
  description: string
  category: string
}

export function AiTrendRecommendations() {
  const [recommendations, setRecommendations] = useState<TrendRecommendation[]>([])
  const [loading, setLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true)

        // In a real implementation, this would call the Gemini API
        // For now, we'll use mock data
        const mockRecommendations: TrendRecommendation[] = [
          {
            id: "1",
            title: "Climate Change Awareness",
            description: "Environmental topics are trending. Create polls about climate change solutions.",
            category: "Environment",
          },
          {
            id: "2",
            title: "Local Elections",
            description: "With upcoming elections, create polls about local candidates and issues.",
            category: "Politics",
          },
          {
            id: "3",
            title: "Remote Work Preferences",
            description: "Work arrangements are a hot topic. Ask about remote vs. office preferences.",
            category: "Work",
          },
        ]

        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 1000))

        setRecommendations(mockRecommendations)
      } catch (error) {
        console.error("Error fetching AI recommendations:", error)
        toast({
          title: "Error",
          description: "Failed to load trend recommendations",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchRecommendations()
  }, [toast])

  if (!isOpen) return null

  return (
    <Card className="fixed bottom-20 right-4 w-80 shadow-lg z-10">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-base flex items-center">
            <Sparkles className="h-4 w-4 mr-2 text-primary" />
            Trending Poll Topics
          </CardTitle>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setIsOpen(false)}>
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </div>
        <CardDescription>AI-powered topic suggestions</CardDescription>
      </CardHeader>
      <CardContent className="pb-4">
        {loading ? (
          <div className="flex justify-center items-center py-4">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <span className="ml-2 text-sm">Loading suggestions...</span>
          </div>
        ) : (
          <div className="space-y-3">
            {recommendations.map((rec) => (
              <div key={rec.id} className="space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium flex items-center">
                    <TrendingUp className="h-3 w-3 mr-1 text-primary" />
                    {rec.title}
                  </h4>
                  <Badge variant="outline" className="text-xs">
                    {rec.category}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{rec.description}</p>
              </div>
            ))}
            <Button variant="outline" size="sm" className="w-full mt-2" asChild>
              <a href="/dashboard/create">Create Trending Poll</a>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

