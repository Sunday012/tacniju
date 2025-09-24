"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, Trash2, CheckCircle, XCircle } from "lucide-react"
import { useRouter } from "next/navigation"

interface CleanupResult {
  id: string
  email: string
  success: boolean
  error?: string
}

interface CleanupResponse {
  message: string
  results: CleanupResult[]
  summary: {
    total: number
    successful: number
    failed: number
  }
}

export function AdminCleanup() {
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<CleanupResponse | null>(null)
  const router = useRouter()

  const handleCleanup = async () => {
    setIsLoading(true)
    setResults(null)

    try {
      const response = await fetch("/api/admin/cleanup-orphaned-users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Cleanup failed")
      }

      setResults(data)
      router.refresh()
    } catch (error) {
      console.error("Cleanup error:", error)
      alert(error instanceof Error ? error.message : "Cleanup failed")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-800">
          <AlertTriangle className="w-5 h-5" />
          System Cleanup
        </CardTitle>
        <CardDescription className="text-orange-700">
          Clean up orphaned authentication users that don't have corresponding profiles. 
          This can happen when registration fails after user creation.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          onClick={handleCleanup}
          disabled={isLoading}
          variant="outline"
          className="border-orange-300 text-orange-800 hover:bg-orange-100"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          {isLoading ? "Cleaning up..." : "Cleanup Orphaned Users"}
        </Button>

        {results && (
          <div className="space-y-3">
            <div className="p-3 bg-white rounded-lg border border-orange-200">
              <h4 className="font-semibold text-orange-800 mb-2">Cleanup Results</h4>
              <p className="text-sm text-orange-700 mb-3">{results.message}</p>
              
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-2 bg-blue-50 rounded">
                  <div className="text-lg font-bold text-blue-600">{results.summary.total}</div>
                  <div className="text-xs text-blue-600">Total Found</div>
                </div>
                <div className="p-2 bg-green-50 rounded">
                  <div className="text-lg font-bold text-green-600">{results.summary.successful}</div>
                  <div className="text-xs text-green-600">Deleted</div>
                </div>
                <div className="p-2 bg-red-50 rounded">
                  <div className="text-lg font-bold text-red-600">{results.summary.failed}</div>
                  <div className="text-xs text-red-600">Failed</div>
                </div>
              </div>
            </div>

            {results.results.length > 0 && (
              <div className="max-h-40 overflow-y-auto">
                <h5 className="font-medium text-orange-800 mb-2">Detailed Results:</h5>
                <div className="space-y-1">
                  {results.results.map((result, index) => (
                    <div
                      key={index}
                      className={`flex items-center gap-2 p-2 rounded text-sm ${
                        result.success
                          ? "bg-green-50 text-green-700"
                          : "bg-red-50 text-red-700"
                      }`}
                    >
                      {result.success ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        <XCircle className="w-4 h-4" />
                      )}
                      <span className="flex-1">
                        {result.email || result.id}
                        {result.error && ` - ${result.error}`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}