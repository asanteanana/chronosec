"use client"

import React from "react"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { format, differenceInDays, addDays } from "date-fns"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown, ChevronUp, ChevronLeft, Edit2, ExternalLink } from "lucide-react"
import { Input } from "@/components/ui/input"

interface TimelineItem {
  id: string
  title: string
  description: string
  time: Date
  type: "identify" | "notify" | "contain" | "document" | "remediate" | "report" | "assess" | "analyze" | "review"
  completed?: boolean
}

interface GanttViewProps {
  timeline: TimelineItem[]
  isDarkMode: boolean
}

export default function GanttView({ timeline, isDarkMode }: GanttViewProps) {
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({})
  const [completedItems, setCompletedItems] = useState<Record<string, boolean>>({})
  const [editingItem, setEditingItem] = useState<string | null>(null)
  const [editedTitle, setEditedTitle] = useState("")
  const [editedDescription, setEditedDescription] = useState("")
  const [editedTime, setEditedTime] = useState("")
  const [showAddTask, setShowAddTask] = useState(false)
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    time: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    type: "document" as TimelineItem["type"],
  })

  const [selectedWeek, setSelectedWeek] = useState<number | null>(null)

  // Add scroll synchronization effect
  React.useEffect(() => {
    // Show right shadow on initial load if content is scrollable
    const ganttContainer = document.getElementById("gantt-chart-container")
    const rightShadow = document.getElementById("right-shadow")
    const rightIndicator = document.getElementById("scroll-right-indicator")

    if (ganttContainer && rightShadow) {
      if (ganttContainer.scrollWidth > ganttContainer.clientWidth) {
        rightShadow.style.opacity = "1"

        // Show and animate the right indicator briefly
        if (rightIndicator) {
          rightIndicator.style.opacity = "1"
          setTimeout(() => {
            rightIndicator.animate(
              [
                { transform: "translate(0, -50%)", opacity: 1 },
                { transform: "translate(10px, -50%)", opacity: 0.8 },
                { transform: "translate(0, -50%)", opacity: 1 },
              ],
              {
                duration: 1500,
                easing: "ease-in-out",
              },
            )

            // Fade out after animation
            setTimeout(() => {
              if (ganttContainer.scrollLeft < 20) {
                rightIndicator.style.opacity = "1"
              }
            }, 1500)
          }, 500)
        }
      }
    }

    // Add resize observer to handle window resizing
    const resizeObserver = new ResizeObserver(() => {
      if (ganttContainer && rightShadow) {
        rightShadow.style.opacity = ganttContainer.scrollWidth > ganttContainer.clientWidth ? "1" : "0"
      }
    })

    if (ganttContainer) {
      resizeObserver.observe(ganttContainer)
    }

    // Add style block to hide scrollbars while maintaining functionality
    const style = document.createElement("style")
    style.textContent = `
    /* Hide scrollbars but keep functionality */
    .scrollbar-none {
      -ms-overflow-style: none;  /* IE and Edge */
      scrollbar-width: none;  /* Firefox */
    }
    .scrollbar-none::-webkit-scrollbar {
      display: none;  /* Chrome, Safari and Opera */
    }
  `
    document.head.appendChild(style)

    return () => {
      if (ganttContainer) {
        resizeObserver.unobserve(ganttContainer)
      }
    }
  }, [timeline.length])

  // Sort timeline by date
  const sortedTimeline = [...timeline].sort((a, b) => a.time.getTime() - b.time.getTime())

  // Calculate the total date range for the Gantt chart
  const startDate = sortedTimeline.length > 0 ? sortedTimeline[0].time : new Date()
  const endDate = sortedTimeline.length > 0 ? sortedTimeline[sortedTimeline.length - 1].time : addDays(new Date(), 30)
  const totalDays = differenceInDays(endDate, startDate) + 1

  // Calculate the number of completed items
  const completedCount = Object.values(completedItems).filter(Boolean).length

  const toggleExpand = (id: string) => {
    setExpandedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  const toggleCompleted = (id: string) => {
    setCompletedItems((prev) => {
      const newState = { ...prev, [id]: !prev[id] }

      // Get the task elements
      const taskBar = document.getElementById(`task-bar-${id}`)
      const taskContainer = document.getElementById(`task-container-${id}`)
      const taskTitle = document.querySelector(`#task-container-${id} h4`)

      if (newState[id]) {
        // Animation for marking as completed
        if (taskBar) {
          taskBar.animate(
            [
              { transform: "scaleX(1)", opacity: 1 },
              { transform: "scaleX(1.02)", opacity: 1 },
              { transform: "scaleX(1)", opacity: 1 },
            ],
            {
              duration: 800,
              easing: "cubic-bezier(0.25, 1, 0.5, 1)",
            },
          )
        }

        if (taskContainer) {
          taskContainer.animate(
            [
              { backgroundColor: "transparent" },
              {
                backgroundColor: isDarkMode ? "rgba(52, 211, 153, 0.08)" : "rgba(16, 185, 129, 0.06)",
              },
            ],
            {
              duration: 400,
              fill: "forwards",
              easing: "cubic-bezier(0.2, 0, 0, 1)",
            },
          )
        }

        if (taskTitle) {
          taskTitle.animate(
            [
              { color: isDarkMode ? "#ffffff" : "#1e293b", textDecoration: "none" },
              {
                color: isDarkMode ? "#34d399" : "#10b981",
                textDecoration: "line-through",
              },
            ],
            {
              duration: 300,
              fill: "forwards",
              easing: "cubic-bezier(0.2, 0, 0, 1)",
            },
          )
        }
      } else {
        // Animation for unmarking (reverting to incomplete)
        if (taskBar) {
          taskBar.animate(
            [
              { transform: "scaleX(1)", opacity: 1 },
              { transform: "scaleX(0.98)", opacity: 1 },
              { transform: "scaleX(1)", opacity: 1 },
            ],
            {
              duration: 800,
              easing: "cubic-bezier(0.25, 1, 0.5, 1)",
            },
          )
        }

        if (taskContainer) {
          taskContainer.animate(
            [
              { backgroundColor: isDarkMode ? "rgba(52, 211, 153, 0.08)" : "rgba(16, 185, 129, 0.06)" },
              { backgroundColor: "transparent" },
            ],
            {
              duration: 400,
              fill: "forwards",
              easing: "cubic-bezier(0.2, 0, 0, 1)",
            },
          )
        }

        if (taskTitle) {
          taskTitle.animate(
            [
              {
                color: isDarkMode ? "#34d399" : "#10b981",
                textDecoration: "line-through",
              },
              {
                color: isDarkMode ? "#ffffff" : "#1e293b",
                textDecoration: "none",
              },
            ],
            {
              duration: 300,
              fill: "forwards",
              easing: "cubic-bezier(0.2, 0, 0, 1)",
            },
          )
        }
      }

      // Add subtle haptic feedback if available
      if (navigator.vibrate) {
        navigator.vibrate([15, 10, 15])
      }

      return newState
    })
  }

  const startEditing = (item: TimelineItem) => {
    setEditingItem(item.id)
    setEditedTitle(item.title)
    setEditedDescription(item.description)
    setEditedTime(format(item.time, "yyyy-MM-dd'T'HH:mm"))
  }

  const saveEditing = () => {
    // In a real app, you would update the timeline item here
    setEditingItem(null)
  }

  const cancelEditing = () => {
    setEditingItem(null)
  }

  const addNewTask = () => {
    // In a real app, you would add the new task to the timeline here
    setShowAddTask(false)
    setNewTask({
      title: "",
      description: "",
      time: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
      type: "document" as TimelineItem["type"],
    })
  }

  const getTypeColor = (type: string) => {
    const colors = {
      identify:
        "bg-[#dbeafe] text-[#1d4ed8] dark:bg-[#1e40af]/20 dark:text-[#93c5fd] hover:bg-[#bfdbfe] dark:hover:bg-[#1e40af]/30",
      notify:
        "bg-[#fef3c7] text-[#b45309] dark:bg-[#92400e]/20 dark:text-[#fcd34d] hover:bg-[#fde68a] dark:hover:bg-[#92400e]/30",
      contain:
        "bg-[#fee2e2] text-[#b91c1c] dark:bg-[#991b1b]/20 dark:text-[#fca5a5] hover:bg-[#fecaca] dark:hover:bg-[#991b1b]/30",
      document:
        "bg-[#ede9fe] text-[#6d28d9] dark:bg-[#5b21b6]/20 dark:text-[#c4b5fd] hover:bg-[#ddd6fe] dark:hover:bg-[#5b21b6]/30",
      remediate:
        "bg-[#f5d0fe] text-[#7e22ce] dark:bg-[#7e22ce]/20 dark:text-[#d8b4fe] hover:bg-[#e9d5ff] dark:hover:bg-[#7e22ce]/30",
      report:
        "bg-[#ffedd5] text-[#c2410c] dark:bg-[#9a3412]/20 dark:text-[#fdba74] hover:bg-[#fed7aa] dark:hover:bg-[#9a3412]/30",
      assess:
        "bg-[#e0f2fe] text-[#0369a1] dark:bg-[#0369a1]/20 dark:text-[#7dd3fc] hover:bg-[#bae6fd] dark:hover:bg-[#0369a1]/30",
      analyze:
        "bg-[#fae8ff] text-[#a21caf] dark:bg-[#a21caf]/20 dark:text-[#e879f9] hover:bg-[#f5d0fe] dark:hover:bg-[#a21caf]/30",
      review:
        "bg-[#f0fdfa] text-[#0f766e] dark:bg-[#0f766e]/20 dark:text-[#5eead4] hover:bg-[#99f6e4] dark:hover:bg-[#0f766e]/30",
    }
    return (
      colors[type as keyof typeof colors] ||
      "bg-[#f1f5f9] text-[#475569] dark:bg-[#334155]/20 dark:text-[#cbd5e1] hover:bg-[#e2e8f0] dark:hover:bg-[#475569]/30"
    )
  }

  const getTypeBarColor = (type: string) => {
    const colors = {
      identify: "bg-[#3b82f6]",
      notify: "bg-[#f59e0b]",
      contain: "bg-[#ef4444]",
      document: "bg-[#8b5cf6]",
      remediate: "bg-[#9333ea]",
      report: "bg-[#f97316]",
      assess: "bg-[#0ea5e9]",
      analyze: "bg-[#d946ef]",
      review: "bg-[#14b8a6]",
    }
    return colors[type as keyof typeof colors] || "bg-[#64748b]"
  }

  const getComplianceGuidance = (type: string) => {
    const guidance = {
      identify: "NIST SP 800-61r2 requires prompt identification of incidents to minimize impact.",
      notify: "Notification should follow your organization's communication plan and regulatory requirements.",
      contain:
        "Containment strategies should be selected based on potential damage, service availability, and resource requirements.",
      document: "Document all steps taken during the incident for later analysis and potential legal proceedings.",
      remediate: "Remediation should address the root cause, not just the symptoms of the incident.",
      report: "Reporting requirements vary by regulation; ensure all required parties are notified within timeframes.",
      assess: "Assessment should determine the scope, impact, and severity of the incident.",
      analyze: "Analysis should identify the attack vectors, compromised systems, and extent of damage.",
      review: "Post-incident review is critical for improving future response capabilities.",
    }
    return guidance[type as keyof typeof guidance] || "Follow your organization's incident response plan."
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

  // Calculate position and width for each task bar
  const getTaskBarStyle = (time: Date) => {
    const daysDiff = differenceInDays(time, startDate)
    const position = (daysDiff / totalDays) * 100
    return {
      left: `${position}%`,
    }
  }

  // Calculate width for task duration (for future enhancement with end dates)
  const getTaskDuration = (type: string) => {
    // Default durations by task type (in days)
    const durations = {
      identify: 1,
      notify: 1,
      contain: 3,
      document: 2,
      remediate: 5,
      report: 2,
      assess: 2,
      analyze: 3,
      review: 2,
    }
    const duration = durations[type as keyof typeof durations] || 1
    return (duration / totalDays) * 100
  }

  return (
    <TooltipProvider>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Card
          className={`border rounded-3xl ${isDarkMode ? "border-[#334155] bg-[#1e1e24]" : "border-[#e2e8f0] bg-white"}`}
        >
          <CardContent className="p-6 overflow-hidden">
            {/* Asana-inspired weeks header */}
            <div className="mb-6 relative">
              {/* Scrollable container for weeks */}
              <div
                className="overflow-x-auto scrollbar-none pb-2 relative"
                style={{ maxWidth: "100%" }}
                id="weeks-scroll-container"
                onScroll={(e) => {
                  // Synchronize scrolling with the Gantt chart below
                  const ganttContainer = document.getElementById("gantt-chart-container")
                  if (ganttContainer) {
                    // Only update if the scroll positions are different to avoid infinite loops
                    if (Math.abs(ganttContainer.scrollLeft - e.currentTarget.scrollLeft) > 2) {
                      ganttContainer.scrollLeft = e.currentTarget.scrollLeft
                    }
                  }

                  // Show/hide shadow indicators
                  const leftShadow = document.getElementById("left-shadow")
                  const rightShadow = document.getElementById("right-shadow")

                  if (leftShadow) {
                    leftShadow.style.opacity = e.currentTarget.scrollLeft > 20 ? "1" : "0"
                  }

                  if (rightShadow) {
                    rightShadow.style.opacity =
                      e.currentTarget.scrollLeft < e.currentTarget.scrollWidth - e.currentTarget.clientWidth - 20
                        ? "1"
                        : "0"
                  }
                }}
              >
                {/* Scroll indicators */}
                <div
                  id="scroll-left-indicator"
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-10 opacity-0 transition-opacity duration-300 cursor-pointer"
                  style={{ left: "0" }}
                  onClick={() => {
                    const container = document.getElementById("weeks-scroll-container")
                    if (container) {
                      const scrollAmount = Math.min(300, container.scrollLeft)
                      container.scrollBy({
                        left: -scrollAmount,
                        behavior: "smooth",
                      })
                    }
                  }}
                >
                  <div className="flex items-center justify-center h-8 w-8 rounded-full bg-white/90 dark:bg-[#1e293b]/90 shadow-md backdrop-blur-md border border-[#e2e8f0]/60 dark:border-[#334155]/60 hover:bg-white dark:hover:bg-[#1e293b] transition-all duration-200 group">
                    <ChevronLeft className="h-4 w-4 text-[#3b82f6] dark:text-[#60a5fa] group-hover:text-[#2563eb] dark:group-hover:text-[#93c5fd]" />
                  </div>
                </div>

                <div className="flex items-center justify-between mb-2 sticky left-0 bg-white dark:bg-[#1e1e24] z-10 pr-4">
                  <h3 className="font-medium text-[#1e293b] dark:text-white text-lg">Gantt Timeline</h3>
                  {/* Badge moved to bottom */}
                </div>

                {/* Weeks display */}
                <div className="relative mb-4">
                  {timeline.length > 0 && (
                    <div
                      className="rounded-lg border border-[#e2e8f0] dark:border-[#334155] overflow-hidden"
                      style={{ minWidth: timeline.length > 10 ? "800px" : "100%" }}
                    >
                      <div className="bg-[#f8fafc] dark:bg-[#1e293b] px-3 py-2 border-b border-[#e2e8f0] dark:border-[#334155] sticky left-0">
                        <h4 className="text-xs font-medium text-[#64748b] dark:text-[#94a3b8]">TIMELINE WEEKS</h4>
                      </div>
                      <div className="flex">
                        {Array.from({ length: Math.ceil((differenceInDays(endDate, startDate) + 1) / 7) + 1 }).map(
                          (_, index) => {
                            const weekStart = addDays(startDate, index * 7)
                            const weekEnd = addDays(weekStart, 6)
                            const isCurrentWeek = new Date() >= weekStart && new Date() < addDays(weekStart, 7)

                            return (
                              <div
                                key={index}
                                className={`flex-1 p-3 ${
                                  index !== 0 ? "border-l border-[#e2e8f0] dark:border-[#334155]" : ""
                                } ${
                                  isCurrentWeek
                                    ? isDarkMode
                                      ? "bg-[#6366f1]/5 hover:bg-[#6366f1]/8"
                                      : "bg-[#3b82f6]/5 hover:bg-[#3b82f6]/8"
                                    : "hover:bg-[#f8fafc] dark:hover:bg-[#1e293b]/50"
                                } transition-colors duration-300 cursor-pointer relative`}
                                onClick={() => {
                                  // Toggle selected week
                                  setSelectedWeek(selectedWeek === index ? null : index)

                                  // Visual feedback for the click
                                  const weekTasks = sortedTimeline.filter(
                                    (task) => task.time >= weekStart && task.time <= weekEnd,
                                  )

                                  // Highlight corresponding tasks in this week
                                  weekTasks.forEach((task) => {
                                    const taskElement = document.getElementById(`task-bar-${task.id}`)
                                    if (taskElement) {
                                      taskElement.animate(
                                        [
                                          { transform: "scale(1)", opacity: 1 },
                                          { transform: "scale(1.05)", opacity: 1 },
                                          { transform: "scale(1)", opacity: 1 },
                                        ],
                                        {
                                          duration: 500,
                                          easing: "ease-out",
                                        },
                                      )
                                    }
                                  })
                                }}
                                data-week-index={index}
                              >
                                {/* Subtle selection indicator */}
                                {selectedWeek === index && (
                                  <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="absolute inset-0 pointer-events-none"
                                  >
                                    <div
                                      className={`absolute inset-0 ${
                                        isDarkMode
                                          ? "bg-[#6366f1]/8 border-l-2 border-[#6366f1]/50"
                                          : "bg-[#3b82f6]/8 border-l-2 border-[#3b82f6]/50"
                                      } rounded-sm`}
                                    ></div>
                                  </motion.div>
                                )}
                                <div className="flex flex-col relative z-10">
                                  <div className="flex justify-between items-center mb-1">
                                    <span
                                      className={`text-xs font-medium ${
                                        isCurrentWeek
                                          ? isDarkMode
                                            ? "text-[#6366f1]/90"
                                            : "text-[#3b82f6]/90"
                                          : selectedWeek === index
                                            ? isDarkMode
                                              ? "text-[#6366f1]/80"
                                              : "text-[#3b82f6]/80"
                                            : "text-[#334155] dark:text-[#e2e8f0]"
                                      }`}
                                    >
                                      Week {index + 1}
                                      {selectedWeek === index && (
                                        <motion.span
                                          initial={{ opacity: 0, scale: 0 }}
                                          animate={{ opacity: 1, scale: 1 }}
                                          className={`ml-1.5 inline-block w-1 h-1 rounded-full ${
                                            isDarkMode ? "bg-[#6366f1]/80" : "bg-[#3b82f6]/80"
                                          }`}
                                        />
                                      )}
                                    </span>
                                    {isCurrentWeek && (
                                      <span
                                        className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                                          isDarkMode
                                            ? "bg-[#6366f1]/10 text-[#6366f1]/90"
                                            : "bg-[#3b82f6]/10 text-[#3b82f6]/90"
                                        }`}
                                      >
                                        Current
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex justify-between items-center text-[10px] text-[#64748b] dark:text-[#94a3b8]">
                                    <span>{format(weekStart, "MMM d")}</span>
                                    <span>-</span>
                                    <span>{format(weekEnd, "MMM d")}</span>
                                  </div>
                                </div>
                                {isCurrentWeek && (
                                  <div
                                    className={`absolute bottom-0 left-0 right-0 h-[1px] ${
                                      isDarkMode ? "bg-[#6366f1]/40" : "bg-[#3b82f6]/40"
                                    }`}
                                  ></div>
                                )}
                              </div>
                            )
                          },
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Shadow indicators for scroll */}
              <div
                className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-white dark:from-[#1e1e24] to-transparent pointer-events-none opacity-0 transition-opacity duration-300"
                id="left-shadow"
              ></div>
              <div
                className="absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-l from-white dark:from-[#1e1e24] to-transparent pointer-events-none transition-opacity duration-300"
                id="right-shadow"
              ></div>
            </div>

            {/* Remove the existing header since we've moved it up */}

            {/* Timeline header with dates - scrollable */}
            <div className="mb-4 relative">
              <div
                className="overflow-x-auto pb-6 mt-2"
                id="gantt-chart-container"
                onScroll={(e) => {
                  // Synchronize scrolling with the weeks header above
                  const weeksContainer = document.getElementById("weeks-scroll-container")
                  if (weeksContainer) {
                    // Only update if the scroll positions are different to avoid infinite loops
                    if (Math.abs(weeksContainer.scrollLeft - e.currentTarget.scrollLeft) > 2) {
                      weeksContainer.scrollLeft = e.currentTarget.scrollLeft
                    }
                  }

                  // Show/hide shadow indicators
                  const leftShadow = document.getElementById("left-shadow")
                  const rightShadow = document.getElementById("right-shadow")

                  if (leftShadow) {
                    leftShadow.style.opacity = e.currentTarget.scrollLeft > 20 ? "1" : "0"
                  }

                  if (rightShadow) {
                    rightShadow.style.opacity =
                      e.currentTarget.scrollLeft < e.currentTarget.scrollWidth - e.currentTarget.clientWidth - 20
                        ? "1"
                        : "0"
                  }
                }}
              >
                <div style={{ minWidth: timeline.length > 10 ? "800px" : "100%" }}>
                  <div className="h-1 bg-[#f1f5f9] dark:bg-[#334155] rounded-full"></div>
                  <div className="flex justify-between text-xs text-[#64748b] dark:text-[#94a3b8] mt-1">
                    <span>{format(startDate, "MMM d, yyyy")}</span>
                    <span>{format(endDate, "MMM d, yyyy")}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Gantt chart */}
            <div className="space-y-4 mt-6">
              {selectedWeek !== null && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-3 rounded-xl bg-[#f0f7ff] dark:bg-[#1e293b]/80 border border-[#bae6fd] dark:border-[#334155]/50 text-[#0369a1] dark:text-[#60a5fa] flex items-start gap-3"
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        Filtering: Week {selectedWeek + 1} ({format(addDays(startDate, selectedWeek * 7), "MMM d")} -{" "}
                        {format(addDays(startDate, selectedWeek * 7 + 6), "MMM d")})
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedWeek(null)}
                      className="text-xs h-7 px-2"
                    >
                      Clear Filter
                    </Button>
                  </div>
                </motion.div>
              )}

              {sortedTimeline
                .filter((item) => {
                  if (selectedWeek === null) return true
                  const weekStart = addDays(startDate, selectedWeek * 7)
                  const weekEnd = addDays(weekStart, 6)
                  return item.time >= weekStart && item.time <= weekEnd
                })
                .map((item, index) => (
                  <motion.div
                    key={item.id}
                    id={`task-container-${item.id}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05, type: "spring", stiffness: 300, damping: 30 }}
                    className={`p-4 rounded-xl border transition-all duration-500 ${
                      isDarkMode ? "border-[#334155] bg-[#1e293b]/30" : "border-[#e2e8f0] bg-[#f8fafc]"
                    } ${
                      completedItems[item.id]
                        ? isDarkMode
                          ? "border-[#34d399]/30 bg-gradient-to-r from-[#1e293b]/30 to-[#065f46]/5 shadow-[inset_0_0_0_1px_rgba(52,211,153,0.2)]"
                          : "border-[#34d399]/30 bg-gradient-to-r from-[#f0fdfa] to-[#ecfdf5] shadow-[inset_0_0_0_1px_rgba(52,211,153,0.2)]"
                        : ""
                    }`}
                    whileHover={{
                      y: -1.5,
                      boxShadow: isDarkMode
                        ? "0 8px 20px -5px rgba(0,0,0,0.15), 0 6px 8px -6px rgba(0,0,0,0.1)"
                        : "0 8px 20px -5px rgba(0,0,0,0.08), 0 6px 8px -6px rgba(0,0,0,0.05)",
                      transition: { type: "spring", stiffness: 400, damping: 25 },
                    }}
                    onClick={() => {
                      // Find which week this task belongs to
                      const taskDate = item.time
                      const daysSinceStart = differenceInDays(taskDate, startDate)
                      const weekIndex = Math.floor(daysSinceStart / 7)

                      // Find the week element and highlight it
                      const weekElement = document.querySelector(`[data-week-index="${weekIndex}"]`)
                      if (weekElement) {
                        // Scroll the weeks container to show this week
                        const weeksContainer = document.getElementById("weeks-scroll-container")
                        if (weeksContainer) {
                          weekElement.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" })
                        }

                        // Add a soft highlight effect to the week instead of a ring
                        const originalBg = weekElement.style.backgroundColor
                        const highlightColor = isDarkMode ? "rgba(99, 102, 241, 0.15)" : "rgba(59, 130, 246, 0.15)"

                        // Apply the highlight with a smooth transition
                        weekElement.style.transition = "background-color 0.3s ease"
                        weekElement.style.backgroundColor = highlightColor

                        // Pulse animation for extra subtle feedback
                        weekElement.animate(
                          [
                            { backgroundColor: highlightColor, offset: 0 },
                            {
                              backgroundColor: isDarkMode ? "rgba(99, 102, 241, 0.25)" : "rgba(59, 130, 246, 0.25)",
                              offset: 0.5,
                            },
                            { backgroundColor: highlightColor, offset: 1 },
                          ],
                          {
                            duration: 1000,
                            easing: "ease-in-out",
                          },
                        )

                        // Return to original state after animation
                        setTimeout(() => {
                          weekElement.style.backgroundColor = originalBg
                        }, 1500)

                        // Provide haptic feedback if available
                        if (navigator.vibrate) {
                          navigator.vibrate(50)
                        }
                      }
                    }}
                  >
                    {editingItem === item.id ? (
                      <div className="space-y-3">
                        <Input
                          value={editedTitle}
                          onChange={(e) => setEditedTitle(e.target.value)}
                          className="font-medium"
                        />
                        <Input value={editedDescription} onChange={(e) => setEditedDescription(e.target.value)} />
                        <Input
                          type="datetime-local"
                          value={editedTime}
                          onChange={(e) => setEditedTime(e.target.value)}
                        />
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={cancelEditing}>
                            Cancel
                          </Button>
                          <Button size="sm" onClick={saveEditing}>
                            Save
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div className="mt-1 flex items-center justify-center">
                              <div
                                className={`text-xs font-semibold rounded-full h-5 w-5 flex items-center justify-center mr-1 ${
                                  isDarkMode ? "bg-[#334155] text-white" : "bg-[#f1f5f9] text-[#64748b]"
                                }`}
                              >
                                {index + 1}
                              </div>
                              <motion.div
                                className={`relative h-6 w-6 flex items-center justify-center rounded-full cursor-pointer ${
                                  completedItems[item.id]
                                    ? isDarkMode
                                      ? "bg-[#34d399] shadow-[0_0_0_1px_rgba(52,211,153,0.3),0_0_0_3px_rgba(52,211,153,0.15)]"
                                      : "bg-[#10b981] shadow-[0_0_0_1px_rgba(16,185,129,0.3),0_0_0_3px_rgba(16,185,129,0.15)]"
                                    : isDarkMode
                                      ? "border-2 border-[#475569] bg-[#1e293b] shadow-[0_0_0_1px_rgba(71,85,105,0.1)]"
                                      : "border-2 border-[#e2e8f0] bg-white shadow-[0_0_0_1px_rgba(226,232,240,0.5)]"
                                } transition-all duration-300`}
                                onClick={(e) => {
                                  e.stopPropagation() // Prevent triggering the parent onClick
                                  toggleCompleted(item.id)
                                }}
                                whileHover={{
                                  scale: 1.05,
                                  boxShadow: completedItems[item.id]
                                    ? isDarkMode
                                      ? "0 0 0 1px rgba(52,211,153,0.4), 0 0 0 4px rgba(52,211,153,0.2)"
                                      : "0 0 0 1px rgba(16,185,129,0.4), 0 0 0 4px rgba(16,185,129,0.2)"
                                    : isDarkMode
                                      ? "0 0 0 1px rgba(71,85,105,0.2), 0 0 0 4px rgba(71,85,105,0.1)"
                                      : "0 0 0 1px rgba(226,232,240,0.6), 0 0 0 4px rgba(226,232,240,0.3)",
                                }}
                                whileTap={{ scale: 0.95 }}
                                transition={{ type: "spring", stiffness: 500, damping: 25 }}
                              >
                                <AnimatePresence>
                                  {completedItems[item.id] && (
                                    <motion.div
                                      className="absolute inset-0 flex items-center justify-center"
                                      initial={{ scale: 0, opacity: 0 }}
                                      animate={{ scale: 1, opacity: 1 }}
                                      exit={{ scale: 0, opacity: 0 }}
                                      transition={{
                                        type: "spring",
                                        stiffness: 500,
                                        damping: 25,
                                        duration: 0.3,
                                      }}
                                    ></motion.div>
                                  )}
                                </AnimatePresence>
                              </motion.div>
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4
                                  className={`font-medium ${
                                    completedItems[item.id]
                                      ? isDarkMode
                                        ? "text-[#34d399] line-through decoration-[#34d399]/50"
                                        : "text-[#10b981] line-through decoration-[#10b981]/50"
                                      : "text-[#1e293b] dark:text-white"
                                  } transition-all duration-500`}
                                >
                                  {item.title}
                                </h4>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Badge
                                      className={`${getTypeColor(item.type)} text-xs px-2 py-0.5 rounded-full transition-all duration-200 hover:bg-opacity-90 hover:scale-105 hover:shadow-sm`}
                                    >
                                      {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                                    </Badge>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <div className="max-w-xs">
                                      <p className="font-medium mb-1">
                                        {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                                      </p>
                                      <p className="text-xs">{getComplianceGuidance(item.type)}</p>
                                      <div className="mt-1 pt-1 border-t border-[#e2e8f0] dark:border-[#334155] text-xs italic">
                                        Source: {getCitationSource(item.type)}
                                      </div>
                                    </div>
                                  </TooltipContent>
                                </Tooltip>
                                <span className="text-xs text-[#64748b] dark:text-[#94a3b8]">
                                  {format(item.time, "MMM d, h:mm a")}
                                </span>
                              </div>
                              <AnimatePresence>
                                {expandedItems[item.id] && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="mt-2"
                                  >
                                    <p className="text-sm text-[#475569] dark:text-[#cbd5e1]">{item.description}</p>
                                    <div className="mt-3 flex items-center gap-2">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-7 px-2 text-xs rounded-full"
                                        onClick={() => startEditing(item)}
                                      >
                                        <Edit2 className="h-3 w-3 mr-1" />
                                        Edit
                                      </Button>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-7 px-2 text-xs rounded-full"
                                        onClick={() => {
                                          // Open guidelines based on the item type
                                          const guidelineUrls = {
                                            identify:
                                              "https://csrc.nist.gov/publications/detail/sp/800-61/rev-2/final#identification",
                                            notify:
                                              "https://csrc.nist.gov/publications/detail/sp/800-61/rev-2/final#notification",
                                            contain:
                                              "https://csrc.nist.gov/publications/detail/sp/800-61/rev-2/final#containment",
                                            document:
                                              "https://csrc.nist.gov/publications/detail/sp/800-61/rev-2/final#documentation",
                                            remediate:
                                              "https://csrc.nist.gov/publications/detail/sp/800-61/rev-2/final#remediation",
                                            report:
                                              "https://csrc.nist.gov/publications/detail/sp/800-61/rev-2/final#reporting",
                                            assess:
                                              "https://csrc.nist.gov/publications/detail/sp/800-61/rev-2/final#assessment",
                                            analyze:
                                              "https://csrc.nist.gov/publications/detail/sp/800-61/rev-2/final#analysis",
                                            review:
                                              "https://csrc.nist.gov/publications/detail/sp/800-61/rev-2/final#review",
                                          }

                                          const url =
                                            guidelineUrls[item.type] ||
                                            "https://csrc.nist.gov/publications/detail/sp/800-61/rev-2/final"
                                          window.open(url, "_blank", "noopener,noreferrer")
                                        }}
                                      >
                                        <ExternalLink className="h-3 w-3 mr-1" />
                                        View Guidelines
                                      </Button>
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 rounded-full"
                              onClick={() => toggleExpand(item.id)}
                            >
                              {expandedItems[item.id] ? (
                                <ChevronUp className="h-4 w-4 text-[#64748b] dark:text-[#94a3b8]" />
                              ) : (
                                <ChevronDown className="h-4 w-4 text-[#64748b] dark:text-[#94a3b8]" />
                              )}
                            </Button>
                          </div>
                        </div>

                        {/* Gantt bar visualization */}
                        <div className="mt-3 relative h-6 bg-white dark:bg-[#1e293b]/40 border border-[#e2e8f0] dark:border-[#60a5fa]/20 rounded-full overflow-hidden shadow-inner">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <motion.div
                                id={`task-bar-${item.id}`}
                                className={`absolute top-0 h-full ${getTypeBarColor(item.type)} rounded-full ${
                                  completedItems[item.id]
                                    ? "opacity-80 transition-all duration-700"
                                    : "transition-all duration-300"
                                }`}
                                style={{
                                  ...getTaskBarStyle(item.time),
                                  width: `${getTaskDuration(item.type)}%`,
                                }}
                                whileHover={{ scale: 1.02, filter: "brightness(1.1)" }}
                                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                              >
                                <AnimatePresence>
                                  {completedItems[item.id] && (
                                    <motion.div
                                      className="absolute inset-0 flex items-center justify-center"
                                      initial={{ scale: 0, opacity: 0 }}
                                      animate={{ scale: 1, opacity: 1 }}
                                      transition={{
                                        type: "spring",
                                        stiffness: 500,
                                        damping: 25,
                                        delay: 0.1,
                                      }}
                                    ></motion.div>
                                  )}
                                </AnimatePresence>
                              </motion.div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <div className="text-xs">
                                <p className="font-medium">{item.title}</p>
                                <p>{format(item.time, "MMM d, yyyy h:mm a")}</p>
                                <p className="mt-1 text-[10px] italic">{getCitationSource(item.type)}</p>
                                {completedItems[item.id] && (
                                  <p className="mt-1 text-[10px] text-green-500 font-medium">✓ Completed</p>
                                )}
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </>
                    )}
                  </motion.div>
                ))}
            </div>

            <div className="mt-6 pt-4 border-t border-[#e2e8f0] dark:border-[#334155] flex items-center justify-between">
              <div className="text-xs text-[#64748b] dark:text-[#94a3b8]">
                <span>Click on tasks to expand details and track progress</span>
              </div>
              <div className="flex items-center">
                {completedCount > 0 && completedCount === timeline.length ? (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md ${
                      isDarkMode ? "bg-[#34d399]/10 text-[#34d399]" : "bg-[#ecfdf5] text-[#10b981]"
                    }`}
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className={isDarkMode ? "text-[#34d399]" : "text-[#10b981]"}
                    >
                      <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
                      <path
                        d="M5.5 8L7 9.5L10.5 6"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span className="text-sm font-medium">All {timeline.length} tasks completed!</span>
                  </motion.div>
                ) : (
                  <span className="text-sm">
                    <span className={isDarkMode ? "text-[#34d399]" : "text-green-500"}>{completedCount}</span>
                    <span className="text-[#64748b] dark:text-[#94a3b8]">/{timeline.length} tasks completed</span>
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </TooltipProvider>
  )
}
