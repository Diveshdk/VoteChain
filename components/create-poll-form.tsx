"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { useWeb3 } from "@/components/web3-provider"
import { Loader2, Plus, Trash2, MapPin, Image, Type, Upload } from "lucide-react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface PollOption {
  type: "text" | "image"
  content: string
  imageUrl?: string
}

export function CreatePollForm() {
  const [formData, setFormData] = useState({
    question: "",
    options: [
      { type: "text", content: "", imageUrl: "" },
      { type: "text", content: "", imageUrl: "" },
    ] as PollOption[],
    visibility: "public",
    description: "",
    biometricAuth: false,
    faceRecognition: false,
    geoRestriction: false,
    location: "",
    radius: "10", // in km
    accessCode: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { contract } = useWeb3()
  const { toast } = useToast()
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleOptionChange = (index: number, field: keyof PollOption, value: string) => {
    const newOptions = [...formData.options]
    newOptions[index] = { ...newOptions[index], [field]: value }
    setFormData((prev) => ({ ...prev, options: newOptions }))
  }

  const handleOptionTypeChange = (index: number, type: "text" | "image") => {
    const newOptions = [...formData.options]
    newOptions[index] = { ...newOptions[index], type }
    setFormData((prev) => ({ ...prev, options: newOptions }))
  }

  const addOption = () => {
    setFormData((prev) => ({
      ...prev,
      options: [...prev.options, { type: "text", content: "", imageUrl: "" }],
    }))
  }

  const removeOption = (index: number) => {
    if (formData.options.length <= 2) {
      toast({
        title: "Cannot remove option",
        description: "A poll must have at least two options",
        variant: "destructive",
      })
      return
    }

    const newOptions = formData.options.filter((_, i) => i !== index)
    setFormData((prev) => ({ ...prev, options: newOptions }))
  }

  const handleImageUpload = (index: number) => {
    const fileInput = document.createElement("input")
    fileInput.type = "file"
    fileInput.accept = "image/*"
    fileInput.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          const result = e.target?.result as string
          handleOptionChange(index, "imageUrl", result)
        }
        reader.readAsDataURL(file)
      }
    }
    fileInput.click()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate form
    if (!formData.question.trim()) {
      toast({
        title: "Missing question",
        description: "Please enter a question for your poll",
        variant: "destructive",
      })
      return
    }

    if (
      formData.options.some(
        (option) => (option.type === "text" && !option.content.trim()) || (option.type === "image" && !option.imageUrl),
      )
    ) {
      toast({
        title: "Empty options",
        description: "Please fill in all options",
        variant: "destructive",
      })
      return
    }

    if (formData.visibility === "private" && !formData.accessCode) {
      toast({
        title: "Missing access code",
        description: "Please provide an access code for your private poll",
        variant: "destructive",
      })
      return
    }

    if (formData.geoRestriction && !formData.location) {
      toast({
        title: "Missing location",
        description: "Please specify a location for geo-restricted polls",
        variant: "destructive",
      })
      return
    }

    if (!contract) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to create a poll",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)

      // Convert options to the format expected by the contract
      const optionTexts = formData.options.map((option) => {
        if (option.type === "text") {
          return option.content
        } else {
          // For image options, store as JSON with image URL
          return JSON.stringify({ type: "image", url: option.imageUrl, caption: option.content })
        }
      })

      // Use the original contract function signature
      const tx = await contract.createPoll(
        formData.question,
        optionTexts,
        formData.visibility === "public",
        formData.biometricAuth,
        false, // SMS auth not implemented in UI
        formData.accessCode,
      )

      await tx.wait()

      toast({
        title: "Poll created",
        description: "Your poll has been created successfully",
      })

      router.push("/dashboard")
    } catch (error) {
      console.error("Poll creation error:", error)
      toast({
        title: "Poll creation failed",
        description: "There was an error creating your poll",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="question">Poll Question</Label>
            <Input
              id="question"
              name="question"
              placeholder="What would you like to ask?"
              value={formData.question}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Provide more context about your poll"
              value={formData.description}
              onChange={handleChange}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Poll Options</Label>
            {formData.options.map((option, index) => (
              <div key={index} className="mt-2 border rounded-md p-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Option {index + 1}</span>
                  <Tabs
                    value={option.type}
                    onValueChange={(value) => handleOptionTypeChange(index, value as "text" | "image")}
                    className="w-32"
                  >
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="text" className="flex items-center">
                        <Type className="h-3 w-3 mr-1" />
                        Text
                      </TabsTrigger>
                      <TabsTrigger value="image" className="flex items-center">
                        <Image className="h-3 w-3 mr-1" />
                        Image
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>

                <div className="space-y-2">
                  {option.type === "text" ? (
                    <Input
                      placeholder="Enter option text"
                      value={option.content}
                      onChange={(e) => handleOptionChange(index, "content", e.target.value)}
                      required
                    />
                  ) : (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Caption (optional)"
                          value={option.content}
                          onChange={(e) => handleOptionChange(index, "content", e.target.value)}
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="shrink-0"
                          onClick={() => handleImageUpload(index)}
                        >
                          <Upload className="h-4 w-4" />
                        </Button>
                      </div>
                      {option.imageUrl && (
                        <div className="relative w-full h-32 bg-muted rounded-md overflow-hidden">
                          <img
                            src={option.imageUrl || "/placeholder.svg"}
                            alt={`Option ${index + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = "/placeholder.svg?height=128&width=256"
                            }}
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex justify-end mt-2">
                  <Button type="button" variant="ghost" size="sm" onClick={() => removeOption(index)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" className="mt-2" onClick={addOption}>
              <Plus className="h-4 w-4 mr-2" />
              Add Option
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="visibility">Poll Visibility</Label>
              <Select value={formData.visibility} onValueChange={(value) => handleSelectChange("visibility", value)}>
                <SelectTrigger id="visibility">
                  <SelectValue placeholder="Select visibility" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {formData.visibility === "private" && (
            <div className="space-y-2">
              <Label htmlFor="accessCode">Access Code</Label>
              <Input
                id="accessCode"
                name="accessCode"
                placeholder="Create an access code for your private poll"
                value={formData.accessCode}
                onChange={handleChange}
              />
              <p className="text-xs text-muted-foreground">
                Share this code with people you want to invite to your poll
              </p>
            </div>
          )}

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="biometricAuth" className="cursor-pointer">
                Require Biometric Authentication
              </Label>
              <Switch
                id="biometricAuth"
                checked={formData.biometricAuth}
                onCheckedChange={(checked) => handleSwitchChange("biometricAuth", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="faceRecognition" className="cursor-pointer">
                Enable Face Recognition
              </Label>
              <Switch
                id="faceRecognition"
                checked={formData.faceRecognition}
                onCheckedChange={(checked) => handleSwitchChange("faceRecognition", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="geoRestriction" className="cursor-pointer">
                Enable Geographic Restriction
              </Label>
              <Switch
                id="geoRestriction"
                checked={formData.geoRestriction}
                onCheckedChange={(checked) => handleSwitchChange("geoRestriction", checked)}
              />
            </div>
          </div>

          {formData.geoRestriction && (
            <div className="space-y-4 p-4 border rounded-md bg-muted/30">
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <div className="flex gap-2">
                  <Input
                    id="location"
                    name="location"
                    placeholder="Enter city or region (e.g., New York, USA)"
                    value={formData.location}
                    onChange={handleChange}
                  />
                  <Button type="button" variant="outline" size="icon" className="shrink-0">
                    <MapPin className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Only voters in this location will be able to participate
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="radius">Radius (km)</Label>
                <Select value={formData.radius} onValueChange={(value) => handleSelectChange("radius", value)}>
                  <SelectTrigger id="radius">
                    <SelectValue placeholder="Select radius" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 km</SelectItem>
                    <SelectItem value="10">10 km</SelectItem>
                    <SelectItem value="25">25 km</SelectItem>
                    <SelectItem value="50">50 km</SelectItem>
                    <SelectItem value="100">100 km</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Poll...
              </>
            ) : (
              "Create Poll"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

