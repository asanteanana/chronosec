"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Lightbulb, AlertTriangle } from "lucide-react"
import { motion } from "framer-motion"
import { generateTimeline } from "@/lib/timeline-generator"

interface EnhancedTimelineGeneratorProps {
  incidentType: string
  framework: string
  startTime: Date
  isDarkMode: boolean
  onTimelineGenerated: (timeline: any[], recommendations: string[]) => void
}

export default function EnhancedTimelineGenerator({
  incidentType,
  framework,
  startTime,
  isDarkMode,
  onTimelineGenerated,
}: EnhancedTimelineGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGenerateTimeline = async () => {
    if (!incidentType || !framework) return

    setIsGenerating(true)
    setError(null)

    try {
      // First generate the base timeline using existing logic
      const baseTimeline = generateTimeline(incidentType, startTime, framework)

      // Then enhance it with AI
      const response = await fetch("/api/ai/enhance-timeline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          baseTimeline,
          incidentType,
          framework,
          startTime: startTime.toISOString(),
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to enhance timeline")
      }

      const { timeline, recommendations } = await response.json()

      // Pass the enhanced timeline and recommendations back to the parent
      onTimelineGenerated(timeline, recommendations)
    } catch (error) {
      console.error("Timeline generation error:", error)
      setError("Could not enhance timeline with AI. Using standard timeline instead.")

      // Fallback to standard timeline
      const baseTimeline = generateTimeline(incidentType, startTime, framework)
      onTimelineGenerated(baseTimeline, [])
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="space-y-4">
      <motion.div
        whileHover={!isGenerating && incidentType && framework ? { scale: 1.01, y: -1 } : {}}
        whileTap={!isGenerating && incidentType && framework ? { scale: 0.99 } : {}}
        transition={{ type: "spring", stiffness: 500, damping: 25 }}
      >
        <Button
          onClick={handleGenerateTimeline}
          className={`w-full h-12 rounded-xl text-base font-medium transition-all duration-300 ${
            !incidentType || !framework || isGenerating
              ? "bg-[#e2e8f0] text-[#64748b] dark:bg-[#334155] dark:text-[#94a3b8] cursor-not-allowed"
              : "bg-[#3b82f6] hover:bg-[#2563eb] text-white dark:bg-[#6366f1] dark:hover:bg-[#4f46e5] hover:shadow-md dark:hover:shadow-[#6366f1]/20"
          }`}
          disabled={!incidentType || !framework || isGenerating}
        >
          {isGenerating ? (
            <motion.div className="flex items-center">
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 1.5, ease: "linear", repeat: Number.POSITIVE_INFINITY }}
                className="mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"
              />
              <span>Generating AI-Enhanced Timeline...</span>
            </motion.div>
          ) : (
            <>
              <Lightbulb className="mr-2 h-4 w-4" />
              <span>Generate AI-Enhanced Timeline</span>
            </>
          )}
        </Button>
      </motion.div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400"
        >
          <AlertTriangle className="h-4 w-4" />
          <span>{error}</span>
        </motion.div>
      )}
    </div>
  )
}
