"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChevronDown, ChevronUp } from "lucide-react"

export function DebugPanel() {
  const [isOpen, setIsOpen] = useState(false)

  if (process.env.NODE_ENV !== "development") {
    return null
  }

  const envVars = {
    API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || "Not set",
    NODE_ENV: process.env.NODE_ENV,
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className="w-80">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle className="text-sm">Debug Panel</CardTitle>
            <Button size="sm" variant="ghost" onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </CardHeader>

        {isOpen && (
          <CardContent className="space-y-3 text-xs">
            <div>
              <p className="font-semibold mb-2">Environment Variables:</p>
              <div className="space-y-1">
                {Object.entries(envVars).map(([key, value]) => (
                  <div key={key} className="flex justify-between">
                    <span className="text-gray-600">{key}:</span>
                    <Badge variant="outline">{String(value).substring(0, 20)}...</Badge>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="font-semibold mb-2">Tips:</p>
              <ul className="list-disc list-inside space-y-1 text-gray-600">
                <li>Check console for [v0] logs</li>
                <li>Open Network tab to see API calls</li>
                <li>Verify backend API is running</li>
                <li>Check .env.local for credentials</li>
              </ul>
            </div>

            <Button
              size="sm"
              variant="outline"
              className="w-full bg-transparent"
              onClick={() => {
                console.clear()
                console.log("[v0] Console cleared")
              }}
            >
              Clear Console
            </Button>
          </CardContent>
        )}
      </Card>
    </div>
  )
}
