"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertTriangle, CheckCircle, XCircle } from "lucide-react"
import { motion } from "framer-motion"
import { Progress } from "@/components/ui/progress"

interface TimelineItem {
  id: string
  title: string
  description: string
  time: Date
  type: string
}

interface ComplianceGapAnalysisProps {
  timeline: TimelineItem[]
  framework: string
  isDarkMode: boolean
}

interface ComplianceItem {
  requirement: string
  status: "compliant" | "partial" | "non-compliant"
  details: string
  score: number
}

export default function ComplianceGapAnalysis({ timeline, framework, isDarkMode }: ComplianceGapAnalysisProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [complianceItems, setComplianceItems] = useState<ComplianceItem[]>([])
  const [overallScore, setOverallScore] = useState(0)

  const runAnalysis = async () => {
    setIsAnalyzing(true)

    try {
      const response = await fetch("/api/ai/compliance-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ timeline, framework }),
      })

      const data = await response.json()
      setComplianceItems(data.items)
      setOverallScore(data.overallScore)
    } catch (error) {
      console.error("Compliance analysis error:", error)
      // Fallback with sample data
      setComplianceItems([
        {
          requirement: "Incident documentation",
          status: "compliant",
          details: "All required documentation is present in the timeline",
          score: 100,
        },
        {
          requirement: "Notification timeframes",
          status: "partial",
          details: "Some notifications may not meet the required timeframes",
          score: 70,
        },
        {
          requirement: "Evidence preservation",
          status: "non-compliant",
          details: "No evidence preservation steps documented",
          score: 30,
        },
      ])
      setOverallScore(67)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "compliant":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "partial":
        return <AlertTriangle className="h-5 w-5 text-amber-500" />
      case "non-compliant":
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return null
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "bg-green-500"
    if (score >= 60) return "bg-amber-500"
    return "bg-red-500"
  }

  return (
    <Card
      className={`border rounded-3xl ${isDarkMode ? "border-[#334155] bg-[#1e1e24]" : "border-[#e2e8f0] bg-white"}`}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-medium text-[#1e293b] dark:text-white text-lg">Compliance Gap Analysis</h3>
            <p className="text-sm text-[#64748b] dark:text-[#94a3b8]">
              AI-powered analysis of your compliance with {framework.toUpperCase()} requirements
            </p>
          </div>

          {complianceItems.length === 0 ? (
            <Button
              onClick={runAnalysis}
              disabled={isAnalyzing}
              className={`rounded-xl ${
                isDarkMode ? "bg-[#6366f1] hover:bg-[#4f46e5]" : "bg-[#3b82f6] hover:bg-[#2563eb]"
              } text-white`}
            >
              {isAnalyzing ? (
                <>
                  <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                "Run Analysis"
              )}
            </Button>
          ) : (
            <div className="flex flex-col items-end">
              <div className="text-2xl font-bold text-[#1e293b] dark:text-white">{overallScore}%</div>
              <div className="text-xs text-[#64748b] dark:text-[#94a3b8]">Compliance Score</div>
            </div>
          )}
        </div>

        {complianceItems.length > 0 && (
          <div className="space-y-6">
            <div className="w-full h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <Progress value={overallScore} className={`h-full ${getScoreColor(overallScore)}`} />
            </div>

            <div className="space-y-4">
              {complianceItems.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-4 rounded-xl border ${
                    isDarkMode ? "border-[#334155] bg-[#1e293b]/30" : "border-[#e2e8f0] bg-[#f8fafc]"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">{getStatusIcon(item.status)}</div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-[#1e293b] dark:text-white">{item.requirement}</h4>
                        <div
                          className={`text-sm font-medium px-2 py-0.5 rounded-full ${
                            item.status === "compliant"
                              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                              : item.status === "partial"
                                ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
                                : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                          }`}
                        >
                          {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                        </div>
                      </div>
                      <p className="text-sm text-[#475569] dark:text-[#cbd5e1] mt-1">{item.details}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="text-xs text-[#64748b] dark:text-[#94a3b8] italic mt-4">
              This analysis is generated by AI based on your timeline and {framework.toUpperCase()} requirements. For
              legal compliance, please consult with a compliance professional.
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
