"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { format, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval, addDays, isSameMonth } from "date-fns"
import { ChevronLeft, ChevronRight, Info } from "lucide-react"
import { TooltipProvider } from "@/components/ui/tooltip"
import { motion, AnimatePresence } from "framer-motion"
import { fadeIn, cardHover } from "@/lib/animation-utils"

interface TimelineItem {
  id: string
  title: string
  description: string
  time: Date
  type: "identify" | "notify" | "contain" | "document" | "remediate" | "report" | "assess" | "analyze" | "review"
}

interface CalendarViewProps {
  timeline: TimelineItem[]
  isDarkMode: boolean
}

export default function CalendarView({ timeline, isDarkMode }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState<Date | null>(null)

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // Add days from previous month to start on Sunday
  const startDay = monthStart.getDay()
  const prevDays = Array.from({ length: startDay }, (_, i) => addDays(monthStart, -startDay + i))

  // Add days from next month to end on Saturday
  const endDay = monthEnd.getDay()
  const nextDays = Array.from({ length: 6 - endDay }, (_, i) => addDays(monthEnd, i + 1))

  const allDays = [...prevDays, ...days, ...nextDays]

  const getTypeColor = (type: string) => {
    const colors = {
      identify: "bg-[#3b82f6]",
      notify: "bg-[#f59e0b]",
      contain: "bg-[#ef4444]",
      document: "bg-[#8b5cf6]",
      remediate: "bg-[#10b981]",
      report: "bg-[#f97316]",
      assess: "bg-[#0ea5e9]",
      analyze: "bg-[#d946ef]",
      review: "bg-[#14b8a6]",
    }
    return colors[type as keyof typeof colors] || "bg-[#64748b]"
  }

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  }

  // Find the first and last event dates to enable/disable navigation
  const firstEventDate = timeline.length > 0 ? new Date(Math.min(...timeline.map((item) => item.time.getTime()))) : null
  const lastEventDate = timeline.length > 0 ? new Date(Math.max(...timeline.map((item) => item.time.getTime()))) : null

  const isPrevMonthDisabled = firstEventDate
    ? currentMonth.getFullYear() < firstEventDate.getFullYear() ||
      (currentMonth.getFullYear() === firstEventDate.getFullYear() &&
        currentMonth.getMonth() <= firstEventDate.getMonth())
    : false

  const isNextMonthDisabled = lastEventDate
    ? currentMonth.getFullYear() > lastEventDate.getFullYear() ||
      (currentMonth.getFullYear() === lastEventDate.getFullYear() &&
        currentMonth.getMonth() >= lastEventDate.getMonth())
    : false

  // Get events for the selected day
  const selectedDayEvents = selectedDay ? timeline.filter((item) => isSameDay(item.time, selectedDay)) : []

  return (
    <TooltipProvider>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Card
          className={`border rounded-3xl ${isDarkMode ? "border-[#334155] bg-[#1e1e24]" : "border-[#e2e8f0] bg-white"}`}
        >
          <CardContent className="p-6">
            <motion.div
              className="flex justify-between items-center mb-6"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <motion.button
                onClick={prevMonth}
                disabled={isPrevMonthDisabled}
                className={`p-2 rounded-full ${
                  isDarkMode ? "text-white hover:bg-[#334155]" : "text-[#1e293b] hover:bg-[#f1f5f9]"
                } transition-colors duration-300 ${isPrevMonthDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
                aria-label="Previous month"
                whileHover={!isPrevMonthDisabled ? { scale: 1.05 } : {}} // Removed rotation, reduced scale
                whileTap={!isPrevMonthDisabled ? { scale: 0.95 } : {}}
                transition={{ type: "spring", stiffness: 500, damping: 25 }}
              >
                <ChevronLeft className="h-5 w-5" />
              </motion.button>
              <motion.h2
                className="text-lg font-medium text-[#1e293b] dark:text-white"
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
              >
                {format(currentMonth, "MMMM yyyy")}
              </motion.h2>
              <motion.button
                onClick={nextMonth}
                disabled={isNextMonthDisabled}
                className={`p-2 rounded-full ${
                  isDarkMode ? "text-white hover:bg-[#334155]" : "text-[#1e293b] hover:bg-[#f1f5f9]"
                } transition-colors duration-300 ${isNextMonthDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
                aria-label="Next month"
                whileHover={!isNextMonthDisabled ? { scale: 1.05 } : {}} // Removed rotation, reduced scale
                whileTap={!isNextMonthDisabled ? { scale: 0.95 } : {}}
                transition={{ type: "spring", stiffness: 500, damping: 25 }}
              >
                <ChevronRight className="h-5 w-5" />
              </motion.button>
            </motion.div>

            <motion.div className="grid grid-cols-7 gap-2" variants={fadeIn} initial="hidden" animate="show">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, i) => (
                <motion.div
                  key={day}
                  className="text-center py-2 font-medium text-[#64748b] dark:text-[#94a3b8]"
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  {day}
                </motion.div>
              ))}

              {allDays.map((day, i) => {
                const dayEvents = timeline.filter((item) => isSameDay(item.time, day))
                const isCurrentMonth = isSameMonth(day, currentMonth)
                const isSelected = selectedDay && isSameDay(day, selectedDay)
                const hasEvents = dayEvents.length > 0

                return (
                  <motion.div
                    key={i}
                    className={`min-h-[80px] p-2 border rounded-xl transition-all duration-200 ${
                      isCurrentMonth
                        ? isDarkMode
                          ? "border-[#334155] bg-[#1e1e24]"
                          : "border-[#e2e8f0] bg-white"
                        : isDarkMode
                          ? "border-[#1e293b] bg-[#1e293b] text-[#94a3b8]"
                          : "border-[#f1f5f9] bg-[#f8fafc] text-[#94a3b8]"
                    } ${
                      isSelected
                        ? "ring-2 ring-[#3b82f6] dark:ring-[#6366f1]"
                        : hasEvents && isCurrentMonth
                          ? "hover:border-[#3b82f6] dark:hover:border-[#6366f1] cursor-pointer"
                          : ""
                    }`}
                    onClick={() => hasEvents && setSelectedDay(isSelected ? null : day)}
                    tabIndex={hasEvents && isCurrentMonth ? 0 : -1}
                    role={hasEvents && isCurrentMonth ? "button" : undefined}
                    aria-label={
                      hasEvents && isCurrentMonth ? `View events for ${format(day, "MMMM d, yyyy")}` : undefined
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault()
                        hasEvents && setSelectedDay(isSelected ? null : day)
                      }
                    }}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.01, duration: 0.2 }}
                    whileHover={hasEvents && isCurrentMonth ? { y: -1, scale: 1.01 } : {}} // Reduced values for subtler effect
                    variants={cardHover}
                  >
                    <motion.div
                      className="text-right text-sm mb-1 font-medium"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.01 + 0.1 }}
                    >
                      {format(day, "d")}
                    </motion.div>
                    <div className="space-y-1">
                      {dayEvents.length > 0
                        ? dayEvents.slice(0, 2).map((event, eventIndex) => (
                            <motion.div
                              key={event.id}
                              className={`text-xs p-1.5 rounded-lg group relative ${
                                isDarkMode ? "bg-[#334155] text-white" : "bg-[#f1f5f9] text-[#1e293b]"
                              } ${eventIndex === 0 ? "hover:z-10" : "hover:z-20"} transition-all duration-300 hover:bg-opacity-90 dark:hover:bg-opacity-90 cursor-pointer`}
                              initial={{ opacity: 0, x: -5 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.01 + 0.2 + eventIndex * 0.1 }}
                              whileHover={{ scale: 1.02, y: -1 }} // Reduced values for subtler effect
                              onClick={(e) => {
                                // Prevent event bubbling
                                e.stopPropagation()

                                // Create a popup for mobile devices
                                if (window.innerWidth < 768) {
                                  const popup = document.createElement("div")
                                  popup.className = "timeline-item-popup popup-banner"
                                  popup.innerHTML = `
                                    <div class="p-3 ${isDarkMode ? "bg-[#1e293b] text-white" : "bg-white text-[#1e293b]"}">
                                      <div class="font-medium">${event.title}</div>
                                      <div class="text-xs ${isDarkMode ? "text-[#94a3b8]" : "text-[#64748b]"} mb-1">
                                        ${format(event.time, "MMM d, yyyy h:mm a")}
                                      </div>
                                      <div class="text-xs">${event.description}</div>
                                      <button class="mt-2 text-xs px-2 py-1 rounded ${
                                        isDarkMode ? "bg-[#334155] text-white" : "bg-[#f1f5f9] text-[#1e293b]"
                                      }">Close</button>
                                    </div>
                                  `
                                  document.body.appendChild(popup)

                                  // Add click event to close button
                                  popup.querySelector("button").addEventListener("click", () => {
                                    document.body.removeChild(popup)
                                  })

                                  // Close when clicking outside
                                  document.addEventListener("click", function closePopup(e) {
                                    if (!popup.contains(e.target)) {
                                      document.body.removeChild(popup)
                                      document.removeEventListener("click", closePopup)
                                    }
                                  })
                                }
                              }}
                            >
                              <div className="flex items-center gap-1 mb-0.5">
                                <motion.div
                                  className={`w-2 h-2 rounded-full ${getTypeColor(event.type)}`}
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  transition={{ delay: i * 0.01 + 0.3 + eventIndex * 0.1 }}
                                ></motion.div>
                                <span className="font-medium">{format(event.time, "h:mm a")}</span>
                              </div>

                              <div className="pl-3">
                                <div className="font-medium line-clamp-1">{event.title}</div>
                                <div className="line-clamp-1 text-[10px] text-[#64748b] dark:text-[#94a3b8] mt-0.5">
                                  {event.description}
                                </div>
                              </div>
                            </motion.div>
                          ))
                        : isCurrentMonth && (
                            <motion.div
                              className={`text-xs p-1 rounded-lg text-center ${
                                isDarkMode ? "text-[#64748b]" : "text-[#94a3b8]"
                              }`}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 0.7 }}
                              transition={{ delay: i * 0.01 + 0.3 }}
                            >
                              No events
                            </motion.div>
                          )}

                      {dayEvents.length > 2 && (
                        <motion.div
                          className="text-xs text-center mt-1 text-[#3b82f6] dark:text-[#93c5fd] font-medium"
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.01 + 0.4 }}
                          whileHover={{ scale: 1.05 }} // Reduced from 1.1 for subtler effect
                        >
                          +{dayEvents.length - 2} more
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </motion.div>

            <AnimatePresence>
              {selectedDay && selectedDayEvents.length > 0 && (
                <motion.div
                  className="mt-6 p-4 rounded-xl bg-[#f8fafc] dark:bg-[#1e293b] border border-[#e2e8f0] dark:border-[#334155]"
                  initial={{ opacity: 0, y: 20, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={{ opacity: 0, y: -20, height: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <motion.h3
                      className="font-medium text-[#1e293b] dark:text-white flex items-center gap-2"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      <motion.div
                        initial={{ rotate: -10, scale: 0.8 }}
                        animate={{ rotate: 0, scale: 1 }}
                        transition={{ delay: 0.2, type: "spring" }}
                      >
                        <Info className="h-4 w-4 text-[#3b82f6] dark:text-[#93c5fd]" />
                      </motion.div>
                      Events on {format(selectedDay, "MMMM d, yyyy")}
                    </motion.h3>
                    <motion.button
                      className="text-xs text-[#64748b] dark:text-[#94a3b8] hover:text-[#1e293b] dark:hover:text-white"
                      onClick={() => setSelectedDay(null)}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Close
                    </motion.button>
                  </div>
                  <motion.div
                    className="space-y-3 max-h-[300px] overflow-y-auto pr-2"
                    variants={fadeIn}
                    initial="hidden"
                    animate="show"
                  >
                    {selectedDayEvents.map((event, index) => (
                      <motion.div
                        key={event.id}
                        className={`p-3 rounded-lg ${isDarkMode ? "bg-[#334155]/50" : "bg-white border border-[#e2e8f0]"}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ y: -1, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <motion.div
                            className={`w-2 h-2 rounded-full ${getTypeColor(event.type)}`}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: index * 0.1 + 0.2 }}
                          ></motion.div>
                          <span className="text-xs font-medium text-[#64748b] dark:text-[#94a3b8]">
                            {format(event.time, "h:mm a")}
                          </span>
                          <motion.span
                            className="text-xs px-2 py-0.5 rounded-full bg-opacity-50 dark:bg-opacity-20 font-medium capitalize"
                            style={{
                              backgroundColor: `${getTypeColor(event.type)}33`,
                              color: isDarkMode ? "#fff" : getTypeColor(event.type),
                            }}
                            initial={{ opacity: 0, x: -5 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 + 0.3 }}
                            whileHover={{ scale: 1.05 }}
                          >
                            {event.type}
                          </motion.span>
                          <span className="text-[10px] text-[#64748b] dark:text-[#94a3b8]">[Ref {index + 1}]</span>
                        </div>
                        <motion.h4
                          className="font-medium text-[#1e293b] dark:text-white"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: index * 0.1 + 0.1 }}
                        >
                          {event.title}
                        </motion.h4>
                        <motion.p
                          className="text-sm text-[#64748b] dark:text-[#94a3b8] mt-1"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: index * 0.1 + 0.2 }}
                        >
                          {event.description}
                        </motion.p>
                        <motion.div
                          className="mt-2 pt-2 border-t border-[#e2e8f0] dark:border-[#334155] text-[10px] text-[#64748b] dark:text-[#94a3b8] italic"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: index * 0.1 + 0.4 }}
                        >
                          Source:{" "}
                          {event.type === "identify"
                            ? "NIST SP 800-61r2"
                            : event.type === "notify"
                              ? "ISO/IEC 27035:2016"
                              : event.type === "contain"
                                ? "SANS Institute"
                                : "Industry best practice"}
                        </motion.div>
                      </motion.div>
                    ))}
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
            {selectedDay && selectedDayEvents.length > 0 && (
              <motion.div
                className="mt-4 pt-3 border-t border-[#e2e8f0] dark:border-[#334155] text-xs text-[#64748b] dark:text-[#94a3b8]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <h4 className="font-medium mb-1">References</h4>
                <ul className="space-y-1 text-[10px]">
                  <li>[1] NIST Special Publication 800-61 Revision 2</li>
                  <li>[2] ISO/IEC 27035:2016 Information Security Incident Management</li>
                  <li>[3] SANS Institute Incident Handler's Handbook</li>
                </ul>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </TooltipProvider>
  )
}
