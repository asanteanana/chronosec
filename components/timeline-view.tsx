"use client"

import { useRef, useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { motion, AnimatePresence } from "framer-motion"
import { badgeHover, timelineItem } from "@/lib/animation-utils"

interface TimelineItem {
  id: string
  title: string
  description: string
  time: Date
  type: "identify" | "notify" | "contain" | "document" | "remediate" | "report" | "assess" | "analyze" | "review"
}

interface TimelineViewProps {
  timeline: TimelineItem[]
  isDarkMode: boolean
}

export default function TimelineView({ timeline, isDarkMode }: TimelineViewProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [activePillStyle, setActivePillStyle] = useState({})
  const itemRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    if (hoveredIndex !== null) {
      const hoveredElement = itemRefs.current[hoveredIndex]
      if (hoveredElement) {
        const { offsetTop, offsetHeight, offsetWidth, offsetLeft } = hoveredElement
        setActivePillStyle({
          top: `${offsetTop}px`,
          left: `${offsetLeft}px`,
          height: `${offsetHeight}px`,
          width: `${offsetWidth}px`,
        })
      }
    }
  }, [hoveredIndex])

  const getTypeColor = (type: string) => {
    const colors = {
      identify: "bg-[#dbeafe] text-[#1d4ed8] dark:bg-[#1e40af]/40 dark:text-[#bfdbfe]",
      notify: "bg-[#fef3c7] text-[#b45309] dark:bg-[#92400e]/40 dark:text-[#fde68a]",
      contain: "bg-[#fee2e2] text-[#b91c1c] dark:bg-[#991b1b]/40 dark:text-[#fecaca]",
      document: "bg-[#ede9fe] text-[#6d28d9] dark:bg-[#5b21b6]/40 dark:text-[#ddd6fe]",
      remediate: "bg-[#f5d0fe] text-[#7e22ce] dark:bg-[#7e22ce]/40 dark:text-[#e9d5ff]",
      report: "bg-[#ffedd5] text-[#c2410c] dark:bg-[#9a3412]/40 dark:text-[#fed7aa]",
      assess: "bg-[#e0f2fe] text-[#0369a1] dark:bg-[#0369a1]/40 dark:text-[#bae6fd]",
      analyze: "bg-[#fae8ff] text-[#a21caf] dark:bg-[#a21caf]/40 dark:text-[#f5d0fe]",
      review: "bg-[#f0fdfa] text-[#0f766e] dark:bg-[#0f766e]/40 dark:text-[#99f6e4]",
    }
    return colors[type as keyof typeof colors] || "bg-[#f1f5f9] text-[#475569] dark:bg-[#334155]/50 dark:text-[#f1f5f9]"
  }

  // Add this to the getTypeColor function to make the badge colors more fluid
  const getTypeHoverColor = (type: string) => {
    const colors = {
      identify: "hover:bg-[#bfdbfe] hover:text-[#1e40af] dark:hover:bg-[#1e40af]/50 dark:hover:text-[#bfdbfe]",
      notify: "hover:bg-[#fde68a] hover:text-[#92400e] dark:hover:bg-[#92400e]/50 dark:hover:text-[#fde68a]",
      contain: "hover:bg-[#fecaca] hover:text-[#991b1b] dark:hover:bg-[#991b1b]/50 dark:hover:text-[#fecaca]",
      document: "hover:bg-[#ddd6fe] hover:text-[#5b21b6] dark:hover:bg-[#5b21b6]/50 dark:hover:text-[#ddd6fe]",
      remediate: "hover:bg-[#e9d5ff] hover:text-[#7e22ce] dark:hover:bg-[#7e22ce]/50 dark:hover:text-[#e9d5ff]",
      report: "hover:bg-[#fed7aa] hover:text-[#9a3412] dark:hover:bg-[#9a3412]/50 dark:hover:text-[#fed7aa]",
      assess: "hover:bg-[#bae6fd] hover:text-[#0369a1] dark:hover:bg-[#0369a1]/50 dark:hover:text-[#bae6fd]",
      analyze: "hover:bg-[#f5d0fe] hover:text-[#a21caf] dark:hover:bg-[#a21caf]/50 dark:hover:text-[#f5d0fe]",
      review: "hover:bg-[#99f6e4] hover:text-[#0f766e] dark:hover:bg-[#0f766e]/50 dark:hover:text-[#99f6e4]",
    }
    return (
      colors[type as keyof typeof colors] ||
      "hover:bg-[#e2e8f0] hover:text-[#334155] dark:hover:bg-[#475569]/50 dark:hover:text-[#f1f5f9]"
    )
  }

  const getTypeBarColor = (type: string) => {
    const colors = {
      identify: "bg-[#3b82f6]",
      notify: "bg-[#f59e0b]",
      contain: "bg-[#ef4444]",
      document: "bg-[#8b5cf6]",
      remediate: "bg-[#9333ea]", // Changed from green to purple
      report: "bg-[#f97316]",
      assess: "bg-[#0ea5e9]",
      analyze: "bg-[#d946ef]",
      review: "bg-[#14b8a6]",
    }
    return colors[type as keyof typeof colors] || "bg-[#64748b]"
  }

  const getTypeDescription = (type: string) => {
    const descriptions = {
      identify: "Detection and identification of the security incident",
      notify: "Notification to relevant stakeholders and authorities",
      contain: "Actions to contain and limit the impact of the incident",
      document: "Documentation of incident details and response actions",
      remediate: "Steps to remediate and recover from the incident",
      report: "Formal reporting to regulatory bodies and authorities",
      assess: "Assessment of impact, scope, and severity of the incident",
      analyze: "Technical analysis and forensic investigation",
      review: "Post-incident review and lessons learned",
    }
    return descriptions[type as keyof typeof descriptions] || "Action related to incident response"
  }

  const getCitationNumber = (type: string): number => {
    const citations = {
      identify: 1,
      notify: 2,
      contain: 1,
      document: 3,
      remediate: 2,
      report: 3,
      assess: 1,
      analyze: 2,
      review: 3,
    }
    return citations[type as keyof typeof citations] || 1
  }

  const getCitationSource = (type: string): string => {
    const sources = {
      identify: "NIST SP 800-61r2, Section 3.2.1",
      notify: "ISO/IEC 27035:2016, Section 7.4",
      contain: "NIST SP 800-61r2, Section 3.3.1",
      document: "SANS Institute, Incident Handler's Handbook",
      remediate: "ISO/IEC 27035:2016, Section 7.5",
      report: "FIRST.org CSIRT Framework v2.1",
      assess: "NIST SP 800-61r2, Section 3.2.6",
      analyze: "SANS Institute, Incident Handler's Handbook",
      review: "ISO/IEC 27035:2016, Section 7.6",
    }
    return sources[type as keyof typeof sources] || "Industry best practice"
  }

  return (
    <TooltipProvider>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Card
          className={`border rounded-3xl ${isDarkMode ? "border-[#475569] bg-[#1e1e24]" : "border-[#e2e8f0] bg-white"}`}
        >
          <CardContent className="p-6">
            <div className="relative">
              {/* Background Highlight */}
              <AnimatePresence>
                {hoveredIndex !== null && (
                  <motion.div
                    className={`absolute rounded-2xl ${isDarkMode ? "bg-[#1e293b]/30" : "bg-[#f8fafc]"}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    style={activePillStyle}
                  />
                )}
              </AnimatePresence>

              {/* Timeline Items */}
              <div className="relative space-y-4">
                {timeline.map((item, index) => (
                  <motion.div
                    key={item.id}
                    ref={(el) => (itemRefs.current[index] = el)}
                    className="p-3 sm:p-4 rounded-2xl transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-[#3b82f6] dark:focus-visible:ring-[#60a5fa] focus-visible:outline-none border border-[#e2e8f0] dark:border-[#475569]"
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    tabIndex={0}
                    custom={index}
                    variants={timelineItem}
                    initial="hidden"
                    animate="show"
                    whileHover={{
                      x: 2,
                      y: -1,
                      backgroundColor: isDarkMode ? "rgba(30, 41, 59, 0.2)" : "rgba(248, 250, 252, 0.8)",
                      boxShadow: isDarkMode ? "0 4px 12px rgba(0, 0, 0, 0.1)" : "0 4px 12px rgba(0, 0, 0, 0.03)",
                      scale: 1.01,
                    }}
                    transition={{
                      type: "tween",
                      ease: "easeInOut",
                      duration: 0.2,
                    }}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-0">
                      <div className="flex-1 mr-0 sm:mr-4">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <motion.div
                            className="relative flex items-center justify-center h-10 w-5"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: index * 0.05 + 0.2, type: "spring", stiffness: 400, damping: 25 }}
                          >
                            <motion.div
                              className={`absolute left-0 top-1/2 transform -translate-y-1/2 w-5 h-5 ${getTypeBarColor(item.type)} rounded-full flex items-center justify-center`}
                            >
                              <motion.div
                                className="w-2 h-2 bg-white dark:bg-[#f8fafc] rounded-full"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: index * 0.05 + 0.3 }}
                              ></motion.div>
                            </motion.div>
                          </motion.div>
                          <motion.h3
                            className="font-medium text-[#1e293b] dark:text-[#f8fafc] text-base"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 + 0.1 }}
                          >
                            {item.title}
                          </motion.h3>

                          {/* Add back the citation tooltip */}
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <motion.div
                                className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#f1f5f9] dark:bg-[#334155] text-[#475569] dark:text-[#e2e8f0] text-xs cursor-help"
                                whileHover={{ scale: 1.1 }}
                              >
                                {getCitationNumber(item.type)}
                              </motion.div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-sm">{getCitationSource(item.type)}</p>
                            </TooltipContent>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <motion.div
                                variants={badgeHover}
                                initial="initial"
                                whileHover="hover"
                                transition={{ type: "spring", stiffness: 500, damping: 25 }}
                              >
                                <Badge
                                  className={`${getTypeColor(item.type)} ${getTypeHoverColor(item.type)} transition-all duration-200 rounded-full px-3 font-normal cursor-help`}
                                >
                                  {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                                </Badge>
                              </motion.div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{getTypeDescription(item.type)}</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <motion.p
                          className="text-sm text-[#64748b] dark:text-[#e2e8f0] ml-4"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: index * 0.05 + 0.2 }}
                        >
                          {item.description}
                        </motion.p>
                      </div>
                      <motion.div
                        className="text-sm font-medium text-[#475569] dark:text-[#f1f5f9] bg-[#f1f5f9] dark:bg-[#334155] px-3 py-1 rounded-full self-start mt-2 sm:mt-0"
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 + 0.1 }}
                        whileHover={{ scale: 1.03 }}
                      >
                        {format(item.time, "MMM d, yyyy h:mm a")}
                      </motion.div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </TooltipProvider>
  )
}
