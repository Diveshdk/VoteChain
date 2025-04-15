"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

interface Language {
  code: string
  name: string
  nativeName: string
  flag: string
}

const languages: Language[] = [
  { code: "en", name: "English", nativeName: "English", flag: "🇺🇸" },
  { code: "es", name: "Spanish", nativeName: "Español", flag: "🇪🇸" },
  { code: "fr", name: "French", nativeName: "Français", flag: "🇫🇷" },
  { code: "de", name: "German", nativeName: "Deutsch", flag: "🇩🇪" },
  { code: "zh", name: "Chinese", nativeName: "中文", flag: "🇨🇳" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी", flag: "🇮🇳" },
  { code: "ar", name: "Arabic", nativeName: "العربية", flag: "🇸🇦" },
  { code: "ja", name: "Japanese", nativeName: "日本語", flag: "🇯🇵" },
]

export function LanguageSelectionModal() {
  const [open, setOpen] = useState(false)
  const [selectedLanguage, setSelectedLanguage] = useState("en")

  useEffect(() => {
    // Check if language has been selected before
    const hasSelectedLanguage = localStorage.getItem("votechain-language-selected")

    if (!hasSelectedLanguage) {
      setOpen(true)
    }
  }, [])

  const handleLanguageSelect = () => {
    localStorage.setItem("votechain-language", selectedLanguage)
    localStorage.setItem("votechain-language-selected", "true")
    document.documentElement.lang = selectedLanguage
    setOpen(false)

    // Reload the page to apply language changes
    window.location.reload()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Select Your Language</DialogTitle>
          <DialogDescription>Choose your preferred language for the VoteChain platform.</DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <RadioGroup
            value={selectedLanguage}
            onValueChange={setSelectedLanguage}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {languages.map((language) => (
              <div
                key={language.code}
                className="flex items-center space-x-2 border rounded-md p-3 cursor-pointer hover:bg-muted"
                onClick={() => setSelectedLanguage(language.code)}
              >
                <RadioGroupItem value={language.code} id={`language-${language.code}`} />
                <Label htmlFor={`language-${language.code}`} className="flex items-center cursor-pointer">
                  <span className="mr-2 text-xl">{language.flag}</span>
                  <div>
                    <div className="font-medium">{language.name}</div>
                    <div className="text-sm text-muted-foreground">{language.nativeName}</div>
                  </div>
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleLanguageSelect}>
            Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

