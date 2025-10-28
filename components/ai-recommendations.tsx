"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Lightbulb, ChevronDown, ChevronUp } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface TimelineItem {
  id: string
  title: string
  description: string
  time: Date
  type: string
}

interface AIRecommendationsProps {
  timeline: TimelineItem[]
  incidentType: string
  framework: string
  isDarkMode: boolean
}

export default function AIRecommendations({ timeline, incidentType, framework, isDarkMode }: AIRecommendationsProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [recommendations, setRecommendations] = useState<string[]>([])

  const generateRecommendations = async () => {
    setIsLoading(true)

    try {
      const response = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ timeline, incidentType, framework }),
      })

      const data = await response.json()
      setRecommendations(data.recommendations)
      setIsExpanded(true)
    } catch (error) {
      console.error("Failed to generate recommendations:", error)
      setRecommendations([
        "Ensure all stakeholders are notified within the required timeframe",
        "Document all containment actions taken during the incident",
        "Review your incident response plan for compliance gaps",
      ])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Card
        className={`border rounded-3xl ${isDarkMode ? "border-[#334155] bg-[#1e1e24]" : "border-[#e2e8f0] bg-white"}`}
      >
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div
                className={`flex items-center justify-center h-10 w-10 rounded-full ${
                  isDarkMode ? "bg-[#6366f1]/10" : "bg-[#3b82f6]/10"
                }`}
                whileHover={{ scale: 1.05 }}
              >
                <Lightbulb className={`h-5 w-5 ${isDarkMode ? "text-[#a5b4fc]" : "text-[#3b82f6]"}`} />
              </motion.div>
              <div>
                <h3 className="font-medium text-[#1e293b] dark:text-white">AI Recommendations</h3>
                <p className="text-sm text-[#64748b] dark:text-[#94a3b8]">
                  Get AI-powered insights for your incident response
                </p>
              </div>
            </div>

            {recommendations.length === 0 ? (
              <Button
                onClick={generateRecommendations}
                disabled={isLoading}
                className={`rounded-xl ${
                  isDarkMode ? "bg-[#6366f1] hover:bg-[#4f46e5]" : "bg-[#3b82f6] hover:bg-[#2563eb]"
                } text-white`}
              >
                {isLoading ? (
                  <>
                    <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  "Generate Insights"
                )}
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-[#64748b] dark:text-[#94a3b8]"
              >
                {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            )}
          </div>

          <AnimatePresence>
            {isExpanded && recommendations.length > 0 && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-4 pt-4 border-t border-[#e2e8f0] dark:border-[#334155]"
              >
                <h4 className="font-medium text-[#1e293b] dark:text-white mb-3">Recommendations</h4>
                <ul className="space-y-3">
                  {recommendations.map((recommendation, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start gap-2"
                    >
                      <div
                        className={`mt-1 h-4 w-4 rounded-full flex items-center justify-center ${
                          isDarkMode ? "bg-[#6366f1]" : "bg-[#3b82f6]"
                        }`}
                      >
                        <div className="h-1.5 w-1.5 bg-white rounded-full" />
                      </div>
                      <p className="text-sm text-[#334155] dark:text-[#e2e8f0]">{recommendation}</p>
                    </motion.li>
                  ))}
                </ul>

                <div className="mt-4 pt-3 border-t border-[#e2e8f0] dark:border-[#334155]">
                  <p className="text-xs text-[#64748b] dark:text-[#94a3b8] italic">
                    These recommendations are generated by AI based on your incident details and compliance
                    requirements.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  )
}
