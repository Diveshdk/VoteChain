"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { BarChart, LineChart, PieChart, TrendingUp, Calendar, Download } from "lucide-react"

// Mock data for charts
const generateMockData = () => {
  // Generate dates for the last 30 days
  const dates = Array.from({ length: 30 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (29 - i))
    return date.toISOString().split("T")[0]
  })

  // Generate random vote counts
  const voteCounts = dates.map(() => Math.floor(Math.random() * 20) + 1)

  // Generate cumulative votes
  let cumulative = 0
  const cumulativeVotes = voteCounts.map((count) => {
    cumulative += count
    return cumulative
  })

  // Generate poll categories
  const categories = [
    { name: "Politics", count: Math.floor(Math.random() * 100) + 50 },
    { name: "Environment", count: Math.floor(Math.random() * 80) + 30 },
    { name: "Technology", count: Math.floor(Math.random() * 70) + 20 },
    { name: "Education", count: Math.floor(Math.random() * 60) + 10 },
    { name: "Health", count: Math.floor(Math.random() * 50) + 5 },
  ]

  // Generate demographic data
  const demographics = [
    { name: "18-24", count: Math.floor(Math.random() * 30) + 10 },
    { name: "25-34", count: Math.floor(Math.random() * 40) + 20 },
    { name: "35-44", count: Math.floor(Math.random() * 35) + 15 },
    { name: "45-54", count: Math.floor(Math.random() * 25) + 5 },
    { name: "55+", count: Math.floor(Math.random() * 20) + 5 },
  ]

  return {
    dates,
    voteCounts,
    cumulativeVotes,
    categories,
    demographics,
  }
}

export function PremiumDashboardCharts() {
  const [chartData, setChartData] = useState(generateMockData())
  const [timeRange, setTimeRange] = useState("30d")
  const { toast } = useToast()

  useEffect(() => {
    // Regenerate data when time range changes
    setChartData(generateMockData())
  }, [timeRange])

  const handleExport = () => {
    toast({
      title: "Data exported",
      description: "Your analytics data has been exported successfully",
    })
  }

  // Canvas drawing functions for charts
  useEffect(() => {
    // Draw line chart
    const drawLineChart = () => {
      const canvas = document.getElementById("votes-trend-chart") as HTMLCanvasElement
      if (!canvas) return

      const ctx = canvas.getContext("2d")
      if (!ctx) return

      const { dates, cumulativeVotes } = chartData
      const width = canvas.width
      const height = canvas.height
      const padding = 40

      // Clear canvas
      ctx.clearRect(0, 0, width, height)

      // Set background
      ctx.fillStyle = "#0f172a"
      ctx.fillRect(0, 0, width, height)

      // Draw grid lines
      ctx.strokeStyle = "#1e293b"
      ctx.lineWidth = 1

      // Horizontal grid lines
      const maxVotes = Math.max(...cumulativeVotes)
      for (let i = 0; i <= 4; i++) {
        const y = padding + (height - padding * 2) * (1 - i / 4)
        ctx.beginPath()
        ctx.moveTo(padding, y)
        ctx.lineTo(width - padding, y)
        ctx.stroke()

        // Y-axis labels
        ctx.fillStyle = "#94a3b8"
        ctx.font = "10px sans-serif"
        ctx.textAlign = "right"
        ctx.fillText(Math.round((maxVotes * i) / 4).toString(), padding - 5, y + 3)
      }

      // Draw line
      ctx.strokeStyle = "#3b82f6"
      ctx.lineWidth = 2
      ctx.beginPath()

      // Plot points
      const dataPoints = cumulativeVotes.map((votes, i) => {
        const x = padding + (width - padding * 2) * (i / (dates.length - 1))
        const y = padding + (height - padding * 2) * (1 - votes / maxVotes)
        return { x, y }
      })

      dataPoints.forEach((point, i) => {
        if (i === 0) {
          ctx.moveTo(point.x, point.y)
        } else {
          ctx.lineTo(point.x, point.y)
        }
      })

      ctx.stroke()

      // Fill area under the line
      ctx.lineTo(dataPoints[dataPoints.length - 1].x, height - padding)
      ctx.lineTo(dataPoints[0].x, height - padding)
      ctx.closePath()
      ctx.fillStyle = "rgba(59, 130, 246, 0.1)"
      ctx.fill()

      // Draw points
      dataPoints.forEach((point) => {
        ctx.beginPath()
        ctx.arc(point.x, point.y, 3, 0, Math.PI * 2)
        ctx.fillStyle = "#3b82f6"
        ctx.fill()
      })

      // X-axis labels (show only a few dates for clarity)
      ctx.fillStyle = "#94a3b8"
      ctx.font = "10px sans-serif"
      ctx.textAlign = "center"

      const labelIndices = [0, 7, 14, 21, 29]
      labelIndices.forEach((i) => {
        if (i < dates.length) {
          const x = padding + (width - padding * 2) * (i / (dates.length - 1))
          ctx.fillText(dates[i].slice(5), x, height - padding + 15)
        }
      })
    }

    // Draw bar chart
    const drawBarChart = () => {
      const canvas = document.getElementById("category-chart") as HTMLCanvasElement
      if (!canvas) return

      const ctx = canvas.getContext("2d")
      if (!ctx) return

      const { categories } = chartData
      const width = canvas.width
      const height = canvas.height
      const padding = 40

      // Clear canvas
      ctx.clearRect(0, 0, width, height)

      // Set background
      ctx.fillStyle = "#0f172a"
      ctx.fillRect(0, 0, width, height)

      // Draw bars
      const barWidth = (width - padding * 2) / categories.length - 10
      const maxCount = Math.max(...categories.map((c) => c.count))

      categories.forEach((category, i) => {
        const x = padding + i * ((width - padding * 2) / categories.length) + 5
        const barHeight = (height - padding * 2) * (category.count / maxCount)
        const y = height - padding - barHeight

        // Bar
        ctx.fillStyle = "#4f46e5"
        ctx.fillRect(x, y, barWidth, barHeight)

        // Category label
        ctx.fillStyle = "#94a3b8"
        ctx.font = "10px sans-serif"
        ctx.textAlign = "center"
        ctx.fillText(category.name, x + barWidth / 2, height - padding + 15)

        // Count label
        ctx.fillStyle = "#ffffff"
        ctx.font = "10px sans-serif"
        ctx.textAlign = "center"
        ctx.fillText(category.count.toString(), x + barWidth / 2, y - 5)
      })
    }

    // Draw pie chart
    const drawPieChart = () => {
      const canvas = document.getElementById("demographics-chart") as HTMLCanvasElement
      if (!canvas) return

      const ctx = canvas.getContext("2d")
      if (!ctx) return

      const { demographics } = chartData
      const width = canvas.width
      const height = canvas.height
      const radius = Math.min(width, height) / 2 - 40
      const centerX = width / 2
      const centerY = height / 2

      // Clear canvas
      ctx.clearRect(0, 0, width, height)

      // Set background
      ctx.fillStyle = "#0f172a"
      ctx.fillRect(0, 0, width, height)

      // Colors for pie slices
      const colors = ["#3b82f6", "#4f46e5", "#8b5cf6", "#ec4899", "#f97316"]

      // Calculate total
      const total = demographics.reduce((sum, demo) => sum + demo.count, 0)

      // Draw pie
      let startAngle = 0

      demographics.forEach((demo, i) => {
        const sliceAngle = (demo.count / total) * 2 * Math.PI

        // Draw slice
        ctx.beginPath()
        ctx.moveTo(centerX, centerY)
        ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle)
        ctx.closePath()

        ctx.fillStyle = colors[i % colors.length]
        ctx.fill()

        // Draw label
        const labelAngle = startAngle + sliceAngle / 2
        const labelRadius = radius * 0.7
        const labelX = centerX + Math.cos(labelAngle) * labelRadius
        const labelY = centerY + Math.sin(labelAngle) * labelRadius

        ctx.fillStyle = "#ffffff"
        ctx.font = "bold 12px sans-serif"
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.fillText(demo.name, labelX, labelY)

        // Draw percentage
        const percentRadius = radius * 0.9
        const percentX = centerX + Math.cos(labelAngle) * percentRadius
        const percentY = centerY + Math.sin(labelAngle) * percentRadius

        ctx.fillStyle = "#ffffff"
        ctx.font = "10px sans-serif"
        ctx.fillText(`${Math.round((demo.count / total) * 100)}%`, percentX, percentY + 15)

        startAngle += sliceAngle
      })

      // Draw center circle (donut style)
      ctx.beginPath()
      ctx.arc(centerX, centerY, radius * 0.4, 0, 2 * Math.PI)
      ctx.fillStyle = "#0f172a"
      ctx.fill()

      // Draw title in center
      ctx.fillStyle = "#ffffff"
      ctx.font = "bold 12px sans-serif"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillText("Age Groups", centerX, centerY)
    }

    // Draw all charts
    drawLineChart()
    drawBarChart()
    drawPieChart()

    // Redraw on window resize
    const handleResize = () => {
      drawLineChart()
      drawBarChart()
      drawPieChart()
    }

    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [chartData])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[120px]">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Time Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="demographics">Demographics</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 pt-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-primary" />
                Voting Trend
              </CardTitle>
              <CardDescription>Cumulative votes over time</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="h-80 w-full">
                <canvas id="votes-trend-chart" width="800" height="400" className="w-full h-full"></canvas>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <BarChart className="h-5 w-5 mr-2 text-primary" />
                  Poll Categories
                </CardTitle>
                <CardDescription>Votes by category</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="h-60 w-full">
                  <canvas id="category-chart" width="400" height="300" className="w-full h-full"></canvas>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <PieChart className="h-5 w-5 mr-2 text-primary" />
                  Demographics
                </CardTitle>
                <CardDescription>Voter age distribution</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="h-60 w-full">
                  <canvas id="demographics-chart" width="400" height="300" className="w-full h-full"></canvas>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="demographics" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Demographic Analysis</CardTitle>
              <CardDescription>Detailed breakdown of voter demographics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96 flex items-center justify-center bg-muted/20 rounded-md">
                <div className="text-center">
                  <LineChart className="h-12 w-12 mx-auto text-primary mb-2" />
                  <h3 className="text-lg font-medium">Demographic Analytics</h3>
                  <p className="text-sm text-muted-foreground mt-1">Detailed demographic analytics will appear here</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="engagement" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Engagement Metrics</CardTitle>
              <CardDescription>Detailed analysis of voter engagement</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96 flex items-center justify-center bg-muted/20 rounded-md">
                <div className="text-center">
                  <BarChart className="h-12 w-12 mx-auto text-primary mb-2" />
                  <h3 className="text-lg font-medium">Engagement Analytics</h3>
                  <p className="text-sm text-muted-foreground mt-1">Detailed engagement analytics will appear here</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

