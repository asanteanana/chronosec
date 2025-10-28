"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Moon, Sun, Download, FileText, CalendarIcon, Info, List, BarChart2, Clock } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { format } from "date-fns"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import TimelineView from "@/components/timeline-view"
import CalendarView from "@/components/calendar-view"
import GanttView from "@/components/gantt-view"
import { incidentTypes, regulationFrameworks, generateTimeline } from "@/lib/timeline-generator"
import { exportToPDF, exportToMarkdown } from "@/lib/export-utils"
import { motion, AnimatePresence } from "framer-motion"
import { staggerContainer, fadeUpItem, pulse } from "@/lib/animation-utils"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

const fadeInAnimation = `
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fadeIn {
  animation: fadeIn 0.6s ease-out forwards;
}
`

// Helper function to get incident type descriptions
function getIncidentTypeDescription(incidentType: string): string {
  const descriptions: Record<string, string> = {
    ransomware:
      "A cyberattack where attackers encrypt data and demand payment for decryption keys. Requires immediate containment and careful recovery planning.",
    phishing:
      "Fraudulent attempts to obtain sensitive information by disguising as a trustworthy entity. Often the entry point for other attacks.",
    data_breach:
      "Unauthorized access to sensitive, protected, or confidential data. Requires careful documentation and notification procedures.",
    ddos: "Distributed Denial of Service attack that disrupts normal traffic by overwhelming the target with a flood of traffic. Focus on service restoration.",
    malware:
      "Malicious software designed to damage or gain unauthorized access to systems. Requires thorough containment and eradication.",
    insider_threat:
      "Security threat from someone with legitimate access to systems. Requires careful investigation and evidence preservation.",
    physical_breach:
      "Unauthorized physical access to facilities or hardware. Often overlooked but requires specific documentation and remediation.",
  }

  return (
    descriptions[incidentType] ||
    "A security incident requiring proper documentation and response according to compliance requirements."
  )
}

// Helper function to get framework descriptions
function getFrameworkDescription(framework: string): string {
  const descriptions: Record<string, string> = {
    nerc_cip:
      "North American Electric Reliability Corporation Critical Infrastructure Protection. Applies to organizations in the power and utility sector with specific notification requirements.",
    gdpr: "General Data Protection Regulation. EU regulation with strict 72-hour breach notification requirements and potential fines up to 4% of global revenue.",
    hipaa:
      "Health Insurance Portability and Accountability Act. Applies to healthcare organizations handling protected health information (PHI) in the US.",
    pci_dss:
      "Payment Card Industry Data Security Standard. Applies to organizations that handle credit card information with specific incident response requirements.",
    ferc: "Federal Energy Regulatory Commission. Applies to organizations in the energy sector with specific reporting timelines.",
    nist: "National Institute of Standards and Technology Cybersecurity Framework. Voluntary framework that provides detailed incident handling guidance.",
    ccpa: "California Consumer Privacy Act. Applies to businesses collecting personal information from California residents with specific breach notification requirements.",
  }

  return (
    descriptions[framework] || "A regulatory framework with specific incident response and documentation requirements."
  )
}

// Update the ExportButtons component to remove dark styling that appears black
// Replace the ExportButtons component with this updated version:

const ExportButtons = ({ handleExportPDF, handleExportMarkdown, isExporting }) => (
  <div className="flex flex-col gap-3">
    <div className="flex gap-2 w-full flex-wrap sm:flex-nowrap">
      <Button
        variant="outline"
        size="sm"
        onClick={handleExportPDF}
        disabled={isExporting}
        className={`flex-1 flex items-center justify-center gap-2 rounded-xl px-3 py-2 ${
          isExporting
            ? "bg-[#f1f5f9] border-[#e2e8f0] text-[#64748b] dark:bg-[#334155]/50 dark:border-[#60a5fa]/30 dark:text-[#94a3b8]"
            : "bg-white dark:bg-[#1e293b]/30 border-[#e2e8f0] dark:border-[#60a5fa]/30 text-[#334155] dark:text-[#e2e8f0] hover:bg-[#f8fafc] dark:hover:bg-[#1e293b]/60 dark:hover:border-[#6366f1]/50 dark:hover:text-[#60a5fa]"
        }`}
      >
        {isExporting ? (
          <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-1 animate-spin" />
        ) : (
          <Download className="h-4 w-4" />
        )}
        <span className="whitespace-nowrap">{isExporting ? "Preparing..." : "Download PDF"}</span>
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={handleExportMarkdown}
        className="flex-1 flex items-center justify-center gap-2 rounded-xl px-3 py-2 bg-white dark:bg-[#1e293b]/30 border-[#e2e8f0] dark:border-[#60a5fa]/30 text-[#334155] dark:text-[#e2e8f0] hover:bg-[#f8fafc] dark:hover:bg-[#1e293b]/60 dark:hover:border-[#6366f1]/50 dark:hover:text-[#60a5fa]"
      >
        <FileText className="h-4 w-4" />
        <span className="whitespace-nowrap">Download MD</span>
      </Button>
    </div>
  </div>
)

export default function IncidentResponseSimulator() {
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [startTime, setStartTime] = useState(new Date())
  const [incidentType, setIncidentType] = useState("")
  const [framework, setFramework] = useState("")
  const [timeline, setTimeline] = useState([])
  const [isTimelineGenerated, setIsTimelineGenerated] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [isFirstVisit, setIsFirstVisit] = useState(true)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [inputsChanged, setInputsChanged] = useState(false)
  const [tooltipsEnabled, setTooltipsEnabled] = useState(false)
  const [typedText, setTypedText] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [typedFrameworkText, setTypedFrameworkText] = useState("")
  const [isFrameworkTyping, setIsFrameworkTyping] = useState(false)
  const [selectedTimezone, setSelectedTimezone] = useState("UTC")
  const [zoomLevel, setZoomLevel] = useState(100)
  const [fontSize, setFontSize] = useState(100)
  const [timeFormat, setTimeFormat] = useState<"12h" | "24h">("24h")

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
  }

  const handleStartTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStartTime(new Date(e.target.value))
  }

  // Enhance the handleGenerateTimeline function with better feedback
  const handleGenerateTimeline = () => {
    if (incidentType && framework && startTime) {
      setIsGenerating(true)
      setInputsChanged(false)

      // Create a loading toast notification
      const loadingToast = document.createElement("div")
      loadingToast.className =
        "fixed bottom-4 right-4 bg-white dark:bg-[#1e293b] shadow-lg rounded-xl p-4 z-50 flex items-center gap-3 max-w-md animate-in fade-in slide-in-from-bottom-5 duration-300"
      loadingToast.innerHTML = `
      <div class="h-5 w-5 border-2 border-[#3b82f6] dark:border-[#6366f1] border-t-transparent rounded-full animate-spin"></div>
      <div>
        <p class="font-medium text-[#1e293b] dark:text-white text-sm">Generating timeline...</p>
        <p class="text-xs text-[#64748b] dark:text-[#94a3b8]">Creating ${incidentTypes.find((t) => t.id === incidentType)?.name} timeline with ${regulationFrameworks.find((f) => f.id === framework)?.name}</p>
      </div>
    `
      document.body.appendChild(loadingToast)

      // Add a slight delay to show the loading animation
      setTimeout(() => {
        try {
          const generatedTimeline = generateTimeline(incidentType, startTime, framework)
          setTimeline(generatedTimeline)
          setIsTimelineGenerated(true)
          setIsFirstVisit(false)
          setIsGenerating(false)

          // Remove loading toast
          document.body.removeChild(loadingToast)

          // Add success toast
          const successToast = document.createElement("div")
          successToast.className =
            "fixed bottom-4 right-4 bg-white dark:bg-[#1e293b] shadow-lg rounded-xl p-4 z-50 flex items-center gap-3 max-w-md animate-in fade-in slide-in-from-bottom-5 duration-300"
          successToast.innerHTML = `
          <div class="h-5 w-5 text-green-500 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
          </div>
          <div>
            <p class="font-medium text-[#1e293b] dark:text-white text-sm">Timeline generated successfully</p>
            <p class="text-xs text-[#64748b] dark:text-[#94a3b8]">${generatedTimeline.length} steps across ${Math.ceil((new Date(generatedTimeline[generatedTimeline.length - 1].time).getTime() - new Date(generatedTimeline[0].time).getTime()) / (1000 * 60 * 60 * 24))} days</p>
          </div>
        `
          document.body.appendChild(successToast)

          // Remove success toast after 5 seconds
          setTimeout(() => {
            if (document.body.contains(successToast)) {
              successToast.classList.add("animate-out", "fade-out", "slide-out-to-right-5")
              setTimeout(() => {
                if (document.body.contains(successToast)) {
                  document.body.removeChild(successToast)
                }
              }, 300)
            }
          }, 5000)

          // Add subtle success feedback
          const button = document.getElementById("generate-button")
          if (button) {
            button.classList.add("generation-success")
            setTimeout(() => {
              button.classList.remove("generation-success")
            }, 2000)
          }

          // Scroll to timeline section with smooth animation
          const timelineSection = document.getElementById("timeline-section")
          if (timelineSection) {
            timelineSection.scrollIntoView({ behavior: "smooth", block: "start" })
          }

          // Announce to screen readers
          const announcer = document.createElement("div")
          announcer.setAttribute("aria-live", "polite")
          announcer.className = "sr-only"
          announcer.textContent = `Timeline generated successfully with ${generatedTimeline.length} steps across ${Math.ceil((new Date(generatedTimeline[generatedTimeline.length - 1].time).getTime() - new Date(generatedTimeline[0].time).getTime()) / (1000 * 60 * 60 * 24))} days`
          document.body.appendChild(announcer)
          setTimeout(() => document.body.removeChild(announcer), 3000)
        } catch (error) {
          console.error("Timeline generation error:", error)
          setIsGenerating(false)

          // Remove loading toast
          document.body.removeChild(loadingToast)

          // Add error toast
          const errorToast = document.createElement("div")
          errorToast.className =
            "fixed bottom-4 right-4 bg-white dark:bg-[#1e293b] shadow-lg rounded-xl p-4 z-50 flex items-center gap-3 max-w-md animate-in fade-in slide-in-from-bottom-5 duration-300 border-l-4 border-red-500"
          errorToast.innerHTML = `
          <div class="h-5 w-5 text-red-500 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          </div>
          <div>
            <p class="font-medium text-[#1e293b] dark:text-white text-sm">Error generating timeline</p>
            <p class="text-xs text-[#64748b] dark:text-[#94a3b8]">Please try again or check your selections</p>
          </div>
        `
          document.body.appendChild(errorToast)

          // Remove error toast after 5 seconds
          setTimeout(() => {
            if (document.body.contains(errorToast)) {
              errorToast.classList.add("animate-out", "fade-out", "slide-out-to-right-5")
              setTimeout(() => {
                if (document.body.contains(errorToast)) {
                  document.body.removeChild(errorToast)
                }
              }, 300)
            }
          }, 5000)
        }
      }, 800)
    }
  }

  // Enhance the handleExportPDF function with better feedback
  const handleExportPDF = () => {
    setIsExporting(true)

    // Create a loading overlay with progress information
    const overlay = document.createElement("div")
    overlay.style.position = "fixed"
    overlay.style.top = "0"
    overlay.style.left = "0"
    overlay.style.width = "100%"
    overlay.style.height = "100%"
    overlay.style.backgroundColor = "rgba(0, 0, 0, 0.7)"
    overlay.style.zIndex = "9999"
    overlay.style.display = "flex"
    overlay.style.flexDirection = "column"
    overlay.style.alignItems = "center"
    overlay.style.justifyContent = "center"
    overlay.style.color = "white"
    overlay.style.fontFamily = "system-ui, -apple-system, sans-serif"

    // Add a progress container
    const progressContainer = document.createElement("div")
    progressContainer.style.backgroundColor = isDarkMode ? "#1e293b" : "white"
    progressContainer.style.borderRadius = "12px"
    progressContainer.style.padding = "24px"
    progressContainer.style.width = "90%"
    progressContainer.style.maxWidth = "400px"
    progressContainer.style.boxShadow = "0 10px 25px rgba(0, 0, 0, 0.2)"
    progressContainer.style.display = "flex"
    progressContainer.style.flexDirection = "column"
    progressContainer.style.alignItems = "center"
    progressContainer.style.gap = "16px"

    // Add a spinner
    const spinner = document.createElement("div")
    spinner.style.width = "40px"
    spinner.style.height = "40px"
    spinner.style.border = isDarkMode ? "3px solid #6366f1" : "3px solid #3b82f6"
    spinner.style.borderTop = "3px solid transparent"
    spinner.style.borderRadius = "50%"
    spinner.style.animation = "spin 1s linear infinite"

    // Add a title
    const title = document.createElement("div")
    title.style.fontSize = "18px"
    title.style.fontWeight = "600"
    title.style.color = isDarkMode ? "white" : "#1e293b"
    title.textContent = "Preparing PDF Export"

    // Add a progress message
    const progressMessage = document.createElement("div")
    progressMessage.style.fontSize = "14px"
    progressMessage.style.color = isDarkMode ? "#94a3b8" : "#64748b"
    progressMessage.style.textAlign = "center"
    progressMessage.style.marginTop = "8px"
    progressMessage.innerHTML = `
    <p>Generating PDF for ${incidentTypes.find((t) => t.id === incidentType)?.name} timeline</p>
    <p style="margin-top: 4px; font-size: 12px;">This may take a few moments...</p>
  `

    // Add a progress bar
    const progressBarContainer = document.createElement("div")
    progressBarContainer.style.width = "100%"
    progressBarContainer.style.height = "6px"
    progressBarContainer.style.backgroundColor = isDarkMode ? "#334155" : "#e2e8f0"
    progressBarContainer.style.borderRadius = "3px"
    progressBarContainer.style.overflow = "hidden"
    progressBarContainer.style.marginTop = "8px"

    const progressBar = document.createElement("div")
    progressBar.style.height = "100%"
    progressBar.style.width = "0%"
    progressBar.style.backgroundColor = isDarkMode ? "#6366f1" : "#3b82f6"
    progressBar.style.transition = "width 0.3s ease-out"

    // Add a cancel button
    const cancelButton = document.createElement("button")
    cancelButton.style.marginTop = "16px"
    cancelButton.style.padding = "8px 16px"
    cancelButton.style.backgroundColor = "transparent"
    cancelButton.style.border = isDarkMode ? "1px solid #4b5563" : "1px solid #d1d5db"
    cancelButton.style.borderRadius = "6px"
    cancelButton.style.color = isDarkMode ? "#94a3b8" : "#64748b"
    cancelButton.style.fontSize = "14px"
    cancelButton.style.cursor = "pointer"
    cancelButton.textContent = "Cancel"
    cancelButton.onclick = () => {
      document.body.removeChild(overlay)
      setIsExporting(false)
    }

    // Add animation keyframes
    const style = document.createElement("style")
    style.textContent = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `

    // Assemble the overlay
    progressBarContainer.appendChild(progressBar)
    progressContainer.appendChild(spinner)
    progressContainer.appendChild(title)
    progressContainer.appendChild(progressMessage)
    progressContainer.appendChild(progressBarContainer)
    progressContainer.appendChild(cancelButton)
    overlay.appendChild(progressContainer)
    document.head.appendChild(style)
    document.body.appendChild(overlay)

    // Simulate progress updates
    let progress = 0
    const progressInterval = setInterval(() => {
      progress += 5
      if (progress > 90) {
        clearInterval(progressInterval)
      }
      progressBar.style.width = `${progress}%`

      // Update progress message based on stage
      if (progress < 30) {
        progressMessage.innerHTML = `
        <p>Preparing timeline data...</p>
        <p style="margin-top: 4px; font-size: 12px;">${progress}% complete</p>
      `
      } else if (progress < 60) {
        progressMessage.innerHTML = `
        <p>Generating document structure...</p>
        <p style="margin-top: 4px; font-size: 12px;">${progress}% complete</p>
      `
      } else {
        progressMessage.innerHTML = `
        <p>Finalizing PDF export...</p>
        <p style="margin-top: 4px; font-size: 12px;">${progress}% complete</p>
      `
      }
    }, 200)

    setTimeout(() => {
      try {
        // Set progress to 100% right before export
        clearInterval(progressInterval)
        progressBar.style.width = "100%"
        progressMessage.innerHTML = `
        <p>Downloading PDF...</p>
        <p style="margin-top: 4px; font-size: 12px;">100% complete</p>
      `

        // Export the PDF
        exportToPDF(timeline, incidentType, framework, startTime)

        // Show success message
        setTimeout(() => {
          if (document.body.contains(overlay)) {
            document.body.removeChild(overlay)
          }

          // Create success notification
          const successNotification = document.createElement("div")
          successNotification.className =
            "fixed bottom-4 right-4 bg-white dark:bg-[#1e293b] shadow-lg rounded-xl p-4 z-50 flex items-center gap-3 max-w-md animate-in fade-in slide-in-from-bottom-5 duration-300"
          successNotification.innerHTML = `
          <div class="h-5 w-5 text-green-500 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
          </div>
          <div>
            <p class="font-medium text-[#1e293b] dark:text-white text-sm">PDF downloaded successfully</p>
            <p class="text-xs text-[#64748b] dark:text-[#94a3b8]">Your timeline has been exported as a PDF</p>
          </div>
        `
          document.body.appendChild(successNotification)

          // Remove success notification after 5 seconds
          setTimeout(() => {
            if (document.body.contains(successNotification)) {
              successNotification.classList.add("animate-out", "fade-out", "slide-out-to-right-5")
              setTimeout(() => {
                if (document.body.contains(successNotification)) {
                  document.body.removeChild(successNotification)
                }
              }, 300)
            }
          }, 5000)

          setIsExporting(false)
        }, 1000)
      } catch (error) {
        console.error("Export error:", error)

        // Remove overlay
        clearInterval(progressInterval)
        if (document.body.contains(overlay)) {
          document.body.removeChild(overlay)
        }

        // Show error notification
        const errorNotification = document.createElement("div")
        errorNotification.className =
          "fixed bottom-4 right-4 bg-white dark:bg-[#1e293b] shadow-lg rounded-xl p-4 z-50 flex items-center gap-3 max-w-md animate-in fade-in slide-in-from-bottom-5 duration-300 border-l-4 border-red-500"
        errorNotification.innerHTML = `
        <div class="h-5 w-5 text-red-500 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
        </div>
        <div>
          <p class="font-medium text-[#1e293b] dark:text-white text-sm">PDF export failed</p>
          <p class="text-xs text-[#64748b] dark:text-[#94a3b8]">There was an error generating the PDF. Please try again.</p>
        </div>
      `
        document.body.appendChild(errorNotification)

        // Remove error notification after 5 seconds
        setTimeout(() => {
          if (document.body.contains(errorNotification)) {
            errorNotification.classList.add("animate-out", "fade-out", "slide-out-to-right-5")
            setTimeout(() => {
              if (document.body.contains(errorNotification)) {
                document.body.removeChild(errorNotification)
              }
            }, 300)
          }
        }, 5000)

        setIsExporting(false)
      }
    }, 100)
  }

  // Enhance the handleExportMarkdown function with better feedback
  const handleExportMarkdown = () => {
    try {
      // Create a loading notification
      const loadingNotification = document.createElement("div")
      loadingNotification.className =
        "fixed bottom-4 right-4 bg-white dark:bg-[#1e293b] shadow-lg rounded-xl p-4 z-50 flex items-center gap-3 max-w-md animate-in fade-in slide-in-from-bottom-5 duration-300"
      loadingNotification.innerHTML = `
      <div class="h-5 w-5 border-2 border-[#3b82f6] dark:border-[#6366f1] border-t-transparent rounded-full animate-spin"></div>
      <div>
        <p class="font-medium text-[#1e293b] dark:text-white text-sm">Preparing Markdown export...</p>
        <p class="text-xs text-[#64748b] dark:text-[#94a3b8]">Creating markdown file for your timeline</p>
      </div>
    `
      document.body.appendChild(loadingNotification)

      // Export the markdown after a short delay to show the loading state
      setTimeout(() => {
        exportToMarkdown(timeline, incidentType, framework, startTime)

        // Remove loading notification
        if (document.body.contains(loadingNotification)) {
          document.body.removeChild(loadingNotification)
        }

        // Show success notification
        const successNotification = document.createElement("div")
        successNotification.className =
          "fixed bottom-4 right-4 bg-white dark:bg-[#1e293b] shadow-lg rounded-xl p-4 z-50 flex items-center gap-3 max-w-md animate-in fade-in slide-in-from-bottom-5 duration-300"
        successNotification.innerHTML = `
        <div class="h-5 w-5 text-green-500 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
          </div>
          <div>
            <p class="font-medium text-[#1e293b] dark:text-white text-sm">Markdown downloaded successfully</p>
            <p class="text-xs text-[#64748b] dark:text-[#94a3b8]">Your timeline has been exported as a Markdown file</p>
          </div>
        `
        document.body.appendChild(successNotification)

        // Remove success notification after 5 seconds
        setTimeout(() => {
          if (document.body.contains(successNotification)) {
            successNotification.classList.add("animate-out", "fade-out", "slide-out-to-right-5")
            setTimeout(() => {
              if (document.body.contains(successNotification)) {
                document.body.removeChild(successNotification)
              }
            }, 300)
          }
        }, 5000)

        // Announce to screen readers
        const announcer = document.createElement("div")
        announcer.setAttribute("aria-live", "polite")
        announcer.className = "sr-only"
        announcer.textContent = "Markdown file downloaded successfully"
        document.body.appendChild(announcer)
        setTimeout(() => document.body.removeChild(announcer), 3000)
      }, 500)
    } catch (error) {
      console.error("Markdown export error:", error)

      // Show error notification
      const errorNotification = document.createElement("div")
      errorNotification.className =
        "fixed bottom-4 right-4 bg-white dark:bg-[#1e293b] shadow-lg rounded-xl p-4 z-50 flex items-center gap-3 max-w-md animate-in fade-in slide-in-from-bottom-5 duration-300 border-l-4 border-red-500"
      errorNotification.innerHTML = `
      <div class="h-5 w-5 text-red-500 flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
      </div>
      <div>
        <p class="font-medium text-[#1e293b] dark:text-white text-sm">Markdown export failed</p>
        <p class="text-xs text-[#64748b] dark:text-[#94a3b8]">There was an error generating the Markdown file. Please try again.</p>
      </div>
    `
      document.body.appendChild(errorNotification)

      // Remove error notification after 5 seconds
      setTimeout(() => {
        if (document.body.contains(errorNotification)) {
          errorNotification.classList.add("animate-out", "fade-out", "slide-out-to-right-5")
          setTimeout(() => {
            if (document.body.contains(errorNotification)) {
              document.body.removeChild(errorNotification)
            }
          }, 300)
        }
      }, 5000)
    }
  }

  const handleZoom = (direction: "in" | "out" | "reset") => {
    let newZoomLevel = zoomLevel

    if (direction === "in" && zoomLevel < 120) {
      newZoomLevel = Math.min(zoomLevel + 10, 120)
    } else if (direction === "out" && zoomLevel > 80) {
      newZoomLevel = Math.max(zoomLevel - 10, 80)
    } else if (direction === "reset") {
      newZoomLevel = 100
    }

    setZoomLevel(newZoomLevel)

    // Apply zoom directly to the main content container for immediate effect
    const mainContent = document.querySelector(".max-w-4xl")
    if (mainContent) {
      ;(mainContent as HTMLElement).style.transform = `scale(${newZoomLevel / 100})`
      ;(mainContent as HTMLElement).style.transformOrigin = "top center"
      ;(mainContent as HTMLElement).style.transition = "transform 0.3s ease-out"
    }

    // Save to localStorage
    localStorage.setItem("chronosec-zoom-level", newZoomLevel.toString())
  }

  const handleFontSize = (action: "increase" | "decrease" | "reset") => {
    let newFontSize = fontSize

    if (action === "increase" && fontSize < 120) {
      newFontSize = Math.min(fontSize + 10, 120)
    } else if (action === "decrease" && fontSize > 80) {
      newFontSize = Math.max(fontSize - 10, 80)
    } else if (action === "reset") {
      newFontSize = 100
    }

    setFontSize(newFontSize)

    // Apply font size to the root element
    document.documentElement.style.fontSize = `${newFontSize}%`

    // Save to localStorage
    localStorage.setItem("chronosec-font-size", newFontSize.toString())
  }

  useEffect(() => {
    // Add the animation styles to the document
    const style = document.createElement("style")
    const popupStyles = `
  .popup-banner {
    position: fixed;
    top: 20%;
    left: 50%;
    transform: translateX(-50%);
    z-index: 100;
    width: 90%;
    max-width: 400px;
    border-radius: 12px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  }

  .timeline-item-popup {
    position: absolute;
    z-index: 50;
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    padding: 16px;
    max-width: 90%;
    width: 320px;
    top: 0;
    left: 50%;
    transform: translateX(-50%) translateY(-110%);
  }

  @media (max-width: 640px) {
    .timeline-controls {
      flex-direction: column;
      align-items: stretch;
    }
    
    .timeline-controls > * {
      margin-bottom: 8px;
    }
  }
  
  /* Toast animations */
  .animate-in {
    animation-duration: 300ms;
    animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
    will-change: transform, opacity;
  }
  
  .fade-in {
    animation-name: fadeIn;
  }
  
  .slide-in-from-bottom-5 {
    animation-name: slideInFromBottom;
  }
  
  .animate-out {
    animation-duration: 300ms;
    animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
    will-change: transform, opacity;
  }
  
  .fade-out {
    animation-name: fadeOut;
  }
  
  .slide-out-to-right-5 {
    animation-name: slideOutToRight;
  }
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes slideInFromBottom {
    from { transform: translateY(20px); }
    to { transform: translateY(0); }
  }
  
  @keyframes fadeOut {
    from { opacity: 1; }
    to { opacity: 0; }
  }
  
  @keyframes slideOutToRight {
    from { transform: translateX(0); }
    to { transform: translateX(20px); }
  }
`

    style.innerHTML = `
  ${fadeInAnimation}
  ${popupStyles}
  
  @keyframes successPulse {
    0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4); }
    70% { box-shadow: 0 0 0 10px rgba(59, 130, 246, 0); }
    100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
  }
  
  .dark .generation-success {
    animation: successPulse 1.5s ease-out;
    box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.4);
  }
  
  .generation-success {
    animation: successPulse 1.5s ease-out;
    box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4);
  }
  
  .timeline-generated-indicator {
    position: relative;
  }
  
  .timeline-generated-indicator::after {
    content: '';
    position: absolute;
    top: -6px;
    right: -6px;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background-color: #10b981;
    border: 2px solid white;
    box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2);
    opacity: 0;
    transform: scale(0);
    transition: all 0.3s ease-out;
  }
  
  .timeline-generated-indicator.active::after {
    opacity: 1;
    transform: scale(1);
  }
  
  .dark .timeline-generated-indicator::after {
    border-color: #1e1e24;
    box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.3);
  }

  /* Tooltip positioning fix */
  .group\/item:hover {
    position: relative;
    z-index: 100;
  }
  
  /* Fix for dropdown tooltips */
  [data-radix-popper-content-wrapper] {
    z-index: 50 !important;
  }

  /* Add these styles to the popupStyles variable */
  .time-controls-container {
    max-width: 100%;
    overflow-x: hidden;
  }

  @media (max-width: 640px) {
    [data-radix-popper-content-wrapper] {
      max-width: 95vw !important;
      transform: none !important;
    }
    
    .time-controls-container > div {
      gap: 1rem;
    }
    
    .time-controls-container button {
      min-height: 44px; /* Larger touch targets */
    }
    
    /* Mobile-specific zoom styles */
    .max-w-4xl {
      transform: scale(0.8);
      transform-origin: top center;
      width: 125% !important; /* Compensate for the scale to maintain proper width */
      margin-left: -12.5%; /* Center the wider container */
      margin-right: -12.5%;
    }
    
    /* Improve mobile form controls */
    .rounded-xl {
      border-radius: 0.75rem;
    }
    
    /* Increase touch targets */
    button, 
    [role="button"],
    .select-trigger,
    .popover-trigger {
      min-height: 44px;
    }
  }
`
    document.head.appendChild(style)

    return () => {
      document.head.removeChild(style)
    }
  }, [])

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => {
      clearInterval(timer)
    }
  }, [])

  // Load html2pdf.js script
  useEffect(() => {
    if (typeof window === "undefined" || window.html2pdf) return

    const script = document.createElement("script")
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"
    script.async = true
    script.onload = () => console.log("html2pdf.js loaded successfully")
    script.onerror = () => console.error("Failed to load html2pdf.js")
    document.body.appendChild(script)

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script)
      }
    }
  }, [])

  // Typing animation effect for tooltips
  useEffect(() => {
    if (!tooltipsEnabled || !incidentType) {
      setTypedText("")
      setIsTyping(false)
      return
    }

    const textToType = getIncidentTypeDescription(incidentType)
    let i = 0
    setTypedText("")
    setIsTyping(true)

    const typingInterval = setInterval(() => {
      if (i < textToType.length) {
        setTypedText((prev) => prev + textToType.charAt(i))
        i++
      } else {
        clearInterval(typingInterval)
        setIsTyping(false)
      }
    }, 30)

    return () => clearInterval(typingInterval)
  }, [tooltipsEnabled, incidentType])

  // Typing animation effect for framework tooltips
  useEffect(() => {
    if (!tooltipsEnabled || !framework) {
      setTypedFrameworkText("")
      setIsFrameworkTyping(false)
      return
    }

    const textToType = getFrameworkDescription(framework)
    let i = 0
    setTypedFrameworkText("")
    setIsFrameworkTyping(true)

    const typingInterval = setInterval(() => {
      if (i < textToType.length) {
        setTypedFrameworkText((prev) => prev + textToType.charAt(i))
        i++
      } else {
        clearInterval(typingInterval)
        setIsFrameworkTyping(false)
      }
    }, 30)

    return () => clearInterval(typingInterval)
  }, [tooltipsEnabled, framework])

  const CustomTooltip = ({ children, content, disabled = false }) => {
    if (disabled) return children

    return (
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent>{content}</TooltipContent>
      </Tooltip>
    )
  }

  // Add keyboard shortcuts for zooming
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + Plus to zoom in
      if ((e.ctrlKey || e.metaKey) && e.key === "+") {
        e.preventDefault()
        if (zoomLevel < 120) handleZoom("in")
      }
      // Ctrl/Cmd + Minus to zoom out
      else if ((e.ctrlKey || e.metaKey) && e.key === "-") {
        e.preventDefault()
        if (zoomLevel > 80) handleZoom("out")
      }
      // Ctrl/Cmd + 0 to reset zoom
      else if ((e.ctrlKey || e.metaKey) && e.key === "0") {
        e.preventDefault()
        handleZoom("reset")
      }
      // Alt + Plus to increase font size
      else if (e.altKey && e.key === "+") {
        e.preventDefault()
        if (fontSize < 120) handleFontSize("increase")
      }
      // Alt + Minus to decrease font size
      else if (e.altKey && e.key === "-") {
        e.preventDefault()
        if (fontSize > 80) handleFontSize("decrease")
      }
      // Alt + 0 to reset font size
      else if (e.altKey && e.key === "0") {
        e.preventDefault()
        handleFontSize("reset")
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [zoomLevel, fontSize])

  // Initialize font size from localStorage
  useEffect(() => {
    const savedFontSize = localStorage.getItem("chronosec-font-size")
    if (savedFontSize) {
      const parsedSize = Number.parseInt(savedFontSize, 10)
      setFontSize(parsedSize)
      document.documentElement.style.fontSize = `${parsedSize}%`
    }

    // Add transition for smooth font size changes
    document.documentElement.style.transition = "font-size 0.3s ease-out"

    return () => {
      // Clean up transition when component unmounts
      document.documentElement.style.transition = ""
    }
  }, [])

  // Update the useEffect for zoom level to include localStorage persistence
  // Replace the existing useEffect for zoom level with this updated version:

  useEffect(() => {
    // Function to check if device is mobile
    const isMobileDevice = () => {
      return window.innerWidth < 640
    }

    // Function to apply zoom based on device type
    const applyZoom = () => {
      const mainContent = document.querySelector(".max-w-4xl")
      if (mainContent) {
        const isMobile = isMobileDevice()
        // Apply 80% zoom for mobile, otherwise use the saved zoom level
        const zoomToApply = isMobile ? 0.8 : zoomLevel / 100
        ;(mainContent as HTMLElement).style.transform = `scale(${zoomToApply})`
        ;(mainContent as HTMLElement).style.transformOrigin = "top center"
        ;(mainContent as HTMLElement).style.transition = "transform 0.3s ease-out"
      }
    }

    // Load saved zoom level from localStorage
    const savedZoomLevel = localStorage.getItem("chronosec-zoom-level")
    if (savedZoomLevel) {
      const parsedZoom = Number.parseInt(savedZoomLevel, 10)
      setZoomLevel(parsedZoom)
    }

    // Apply zoom immediately
    applyZoom()

    // Add resize listener to handle zoom when window size changes
    const handleResize = () => {
      applyZoom()
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [zoomLevel])

  return (
    <TooltipProvider>
      <div
        className={`flex justify-center w-full min-h-screen pb-8 transition-colors duration-500 ${
          isDarkMode ? "dark bg-[#121217]" : "bg-[#f8faff]"
        }`}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-4xl my-8 px-4 sm:px-6"
          style={{
            transformOrigin: "top center",
            transition: "transform 0.3s ease-out",
            marginBottom: `${zoomLevel > 100 ? (zoomLevel - 100) * 2 : 0}px`,
            marginTop: "2rem",
          }}
        >
          <Card className={`w-full border-none rounded-3xl relative ${isDarkMode ? "bg-[#1e1e24]" : "bg-white"}`}>
            <div className="absolute top-6 right-6 z-10 grid grid-cols-3 gap-2 hidden sm:grid">
              <button
                className="flex items-center justify-center w-10 h-10 rounded-full bg-transparent hover:bg-black/5 dark:hover:bg-white/5"
                onClick={() => setTooltipsEnabled(!tooltipsEnabled)}
              >
                <Info
                  className="w-5 h-5 text-[#0e0f11] dark:text-white"
                  style={{ opacity: tooltipsEnabled ? 1 : 0.5 }}
                />
                <span className="sr-only">Toggle tooltips</span>
              </button>
              <button
                className="flex items-center justify-center w-10 h-10 rounded-full bg-transparent hover:bg-black/5 dark:hover:bg-white/5"
                onClick={toggleDarkMode}
              >
                {isDarkMode ? (
                  <Sun className="w-5 h-5 text-[#0e0f11] dark:text-white" />
                ) : (
                  <Moon className="w-5 h-5 text-[#0e0f11] dark:text-white" />
                )}
                <span className="sr-only">Toggle dark mode</span>
              </button>

              {/* Zoom controls popover */}
              <Popover>
                <PopoverTrigger asChild>
                  <button className="flex items-center justify-center w-10 h-10 rounded-full bg-transparent hover:bg-black/5 dark:hover:bg-white/5">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-[#0e0f11] dark:text-white"
                    >
                      <circle cx="11" cy="11" r="8"></circle>
                      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                    <span className="sr-only">Zoom controls</span>
                  </button>
                </PopoverTrigger>
                <PopoverContent side="bottom" className="w-auto p-2" sideOffset={5}>
                  <div
                    className={`flex flex-col items-center gap-4 p-3 rounded-lg w-40 ${
                      isDarkMode ? "bg-[#1e293b] text-white" : "bg-white text-[#1e293b]"
                    }`}
                  >
                    {/* Font size controls */}
                    <div className="flex flex-col items-center gap-2 w-full">
                      <div className="text-xs font-medium mb-1 text-[#64748b] dark:text-[#94a3b8]">Zoom</div>
                      <div className="flex items-center gap-2">
                        <button
                          className={`flex items-center justify-center h-8 w-8 rounded-full ${
                            fontSize <= 80
                              ? "opacity-50 cursor-not-allowed"
                              : "hover:bg-gray-100 dark:hover:bg-gray-800 active:scale-95"
                          } transition-all`}
                          onClick={() => handleFontSize("decrease")}
                          disabled={fontSize <= 80}
                          aria-label="Decrease font size"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <polyline points="4 14 10 14 10 20"></polyline>
                            <polyline points="20 10 14 10 14 4"></polyline>
                            <line x1="14" y1="10" x2="21" y2="3"></line>
                            <line x1="3" y1="21" x2="10" y2="14"></line>
                          </svg>
                        </button>

                        <button
                          className={`h-6 px-2 text-xs font-medium hover:bg-gray-100 dark:hover:bg-gray-800 active:scale-95 transition-all rounded ${
                            fontSize === 100 ? (isDarkMode ? "text-[#60a5fa]" : "text-[#3b82f6]") : ""
                          }`}
                          onClick={() => handleFontSize("reset")}
                          aria-label="Reset font size"
                        >
                          {fontSize}%
                        </button>

                        <button
                          className={`flex items-center justify-center h-8 w-8 rounded-full ${
                            fontSize >= 120
                              ? "opacity-50 cursor-not-allowed"
                              : "hover:bg-gray-100 dark:hover:bg-gray-800 active:scale-95"
                          } transition-all`}
                          onClick={() => handleFontSize("increase")}
                          disabled={fontSize >= 120}
                          aria-label="Increase font size"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <polyline points="20 14 14 14 14 20"></polyline>
                            <polyline points="4 10 10 10 10 4"></polyline>
                            <line x1="10" y1="10" x2="3" y2="3"></line>
                            <line x1="21" y1="21" x2="14" y2="14"></line>
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Reset button */}
                    <button
                      className={`w-full py-1.5 px-3 text-xs font-medium rounded-md transition-all ${
                        isDarkMode
                          ? "bg-[#334155] hover:bg-[#475569] text-white"
                          : "bg-[#f1f5f9] hover:bg-[#e2e8f0] text-[#334155]"
                      }`}
                      onClick={() => {
                        handleZoom("reset")
                        handleFontSize("reset")
                      }}
                      aria-label="Reset all settings"
                    >
                      <div className="flex items-center justify-center gap-1.5">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                          <path d="M3 3v5h5"></path>
                        </svg>
                        <span>Reset All</span>
                      </div>
                    </button>

                    {/* Keyboard shortcuts info */}
                    <div className="w-full text-xs text-[#64748b] dark:text-[#94a3b8] mt-1 text-center">
                      <p>Alt+/- for font size, Alt+0 to reset</p>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            <CardContent className="flex flex-col items-start gap-8 p-8 mt-8">
              <div className="w-full">
                <motion.div
                  className="mb-6 pb-5 border-b border-[#e2e8f0] dark:border-[#334155] text-center"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <div className="inline-block relative">
                    <div className="relative">
                      {/* motion.h1 element */}
                      <motion.h1
                        className="text-2xl font-bold text-[#1e293b] dark:text-white tracking-tight relative z-10 px-1 inline-flex items-center gap-1.5 overflow-hidden"
                        whileHover={{ scale: 1.02 }}
                        transition={{ type: "spring", stiffness: 500, damping: 20 }}
                      >
                        <motion.span
                          className="relative cursor-pointer flex items-center"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.5, delay: 0.3 }}
                          onClick={() => {
                            // Reset all state variables to initial values
                            setIncidentType("")
                            setFramework("")
                            setStartTime(new Date())
                            setTimeline([])
                            setIsTimelineGenerated(false)
                            setIsFirstVisit(true)
                            setIsGenerating(false)
                            setIsExporting(false)
                            setInputsChanged(false)
                          }}
                          title="Reset application"
                        >
                          <span className="inline-flex items-center">
                            <motion.div
                              className="flex items-center mr-1"
                              whileHover={{
                                x: [0, -1.5, 1.5, -1.5, 1.5, 0],
                                transition: {
                                  duration: 0.8,
                                  ease: "easeInOut",
                                  repeat: Number.POSITIVE_INFINITY,
                                  repeatType: "loop",
                                },
                              }}
                              initial={{ scale: 1.5 }}
                              transition={{ type: "tween", duration: 0.3 }}
                            >
                              <img
                                src="/logo.png"
                                alt="ChronoSec Logo"
                                width={24}
                                height={24}
                                className="h-6 w-6 drop-shadow-sm dark:filter-none dark:brightness-100"
                              />
                            </motion.div>
                            <span className="font-bold text-[#1e293b] dark:text-white">chrono</span>
                            <span className="font-bold text-[#1e293b] dark:text-white">sec</span>
                          </span>
                        </motion.span>
                        <motion.span
                          className="ml-0 text-xs font-medium text-white dark:text-white relative bg-[#3b82f6] dark:bg-[#6366f1] px-2 py-0.5 rounded-full shadow-sm"
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.5, delay: 0.5 }}
                          whileHover={{ y: -1, scale: 1.05 }}
                        >
                          beta
                        </motion.span>
                      </motion.h1>
                    </div>
                  </div>
                  <motion.p
                    className="text-[#64748b] dark:text-[#94a3b8] mt-1"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                  >
                    Compliance-aligned incident response timelines, delivered on time, every time
                  </motion.p>
                </motion.div>

                <AnimatePresence mode="wait">
                  {isFirstVisit && (
                    <motion.div
                      className="mb-6 p-4 rounded-3xl bg-[#f8fbff] dark:bg-[#1e293b]/60 border-2 border-[#edf2ff] dark:border-[#60a5fa]/15 text-[#0369a1] dark:text-[#93c5fd] flex items-start gap-3 shadow-[0_2px_10px_rgba(0,0,0,0.05)] dark:shadow-[0_2px_10px_rgba(0,0,0,0.1)] transition-all duration-300 max-w-fit mx-auto overflow-hidden relative"
                      initial={{ opacity: 0, y: 10, height: 0 }}
                      animate={{
                        opacity: 1,
                        y: 0,
                        height: "auto",
                        transition: {
                          type: "spring",
                          stiffness: 400,
                          damping: 30,
                        },
                      }}
                      exit={{
                        opacity: 0,
                        scale: 0.95,
                        y: -10,
                        height: 0,
                        transition: {
                          opacity: { duration: 0.25, ease: "easeInOut" },
                          scale: { duration: 0.35, ease: [0.32, 0.72, 0, 1] },
                          y: { duration: 0.3, ease: "backIn" },
                          height: { delay: 0.15, duration: 0.4, ease: "anticipate" },
                        },
                      }}
                      layout
                    >
                      {/* Add close button */}
                      <button
                        onClick={() => setIsFirstVisit(false)}
                        className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center rounded-full bg-[#e0f2ff] dark:bg-[#1e293b]/80 text-[#0369a1] dark:text-[#93c5fd] hover:bg-[#d1e9ff] dark:hover:bg-[#334155] hover:text-[#2563eb] dark:hover:text-[#60a5fa] transition-all duration-300 ease-in-out transform hover:rotate-90 focus:outline-none focus:ring-2 focus:ring-[#3b82f6] dark:focus:ring-[#6366f1] z-10"
                        aria-label="Close welcome message"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M18 6 6 18"></path>
                          <path d="m6 6 12 12"></path>
                        </svg>
                      </button>
                      <div className="flex items-center">
                        <div>
                          <motion.p
                            className="text-base font-medium text-[#0369a1] dark:text-white/90 mb-1"
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            Welcome to Chronosec — Your Compliance Timeline Partner 📋
                          </motion.p>
                          <motion.p
                            className="text-sm text-[#2a4365] dark:text-[#e2e8ff]"
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: 0.1 }}
                          >
                            Choose your options below to begin creating your first compliance-aligned timeline
                          </motion.p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.div
                  className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10"
                  variants={staggerContainer}
                  initial="hidden"
                  animate="show"
                >
                  <motion.div className="space-y-6" variants={fadeUpItem}>
                    <div className="space-y-3" id="incident-type-container">
                      <div className="flex items-center gap-2">
                        <Label htmlFor="incident-type" className="text-[#334155] dark:text-[#e2e8f0] text-base">
                          What type of incident occurred?
                        </Label>
                      </div>
                      <motion.div whileHover={{ y: -1 }} transition={{ type: "spring", stiffness: 500, damping: 25 }}>
                        <Select
                          value={incidentType}
                          onValueChange={(value) => {
                            setIncidentType(value)
                            if (isTimelineGenerated) setInputsChanged(true)
                            // Add subtle animation to the parent container
                            const container = document.getElementById("incident-type-container")
                            if (container) {
                              container.animate(
                                [
                                  {
                                    backgroundColor: isDarkMode
                                      ? "rgba(99, 102, 241, 0.08)"
                                      : "rgba(59, 130, 246, 0.08)",
                                  },
                                  { backgroundColor: "transparent" },
                                ],
                                { duration: 600, easing: "ease-out" },
                              )
                            }
                          }}
                        >
                          <SelectTrigger
                            id="incident-type"
                            className={`w-full rounded-xl h-12 border-[#e2e8f0] dark:border-[#334155] bg-white dark:bg-[#1e1e24] transition-all duration-300 ${
                              incidentType
                                ? "border-[#3b82f6] dark:border-[#6366f1] ring-1 ring-[#3b82f6]/20 dark:ring-[#6366f1]/20"
                                : ""
                            }`}
                          >
                            <SelectValue placeholder="Select incident type" />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl border-[#e2e8f0] dark:border-[#334155]">
                            {incidentTypes.map((type) => (
                              <div key={type.id} className="group/item relative">
                                <SelectItem
                                  value={type.id}
                                  className={incidentType === type.id ? "bg-[#dbeafe] dark:bg-[#1e40af]/20" : ""}
                                >
                                  <div className="flex items-center justify-between w-full">
                                    <span>{type.name}</span>
                                    {tooltipsEnabled && (
                                      <Info className="h-3 w-3 ml-2 text-[#64748b] dark:text-[#94a3b8] opacity-50 group-hover/item:opacity-100" />
                                    )}
                                  </div>
                                </SelectItem>
                                {tooltipsEnabled && (
                                  <div
                                    className="fixed invisible group-hover/item:visible opacity-0 group-hover/item:opacity-100 transition-opacity duration-200 z-50 bg-white dark:bg-[#1e293b] shadow-lg rounded-lg p-2 text-sm max-w-xs border border-[#e2e8f0] dark:border-[#334155] whitespace-normal overflow-visible"
                                    style={{
                                      left: "calc(100% + 8px)",
                                      top: "50%",
                                      transform: "translateY(-50%)",
                                      pointerEvents: "none",
                                      wordBreak: "normal",
                                      overflowWrap: "break-word",
                                    }}
                                  >
                                    <p
                                      className={`font-medium ${incidentType === type.id ? "text-[#3b82f6] dark:text-[#60a5fa]" : ""}`}
                                    >
                                      {type.name}
                                    </p>
                                    <p className="text-xs text-[#64748b] dark:text-[#94a3b8] mt-1">
                                      {getIncidentTypeDescription(type.id)}
                                    </p>
                                  </div>
                                )}
                              </div>
                            ))}
                          </SelectContent>
                        </Select>
                      </motion.div>
                      <p className="text-xs text-[#64748b] dark:text-[#94a3b8] mt-1 ml-1">
                        Select the specific type of security incident that occurred
                      </p>
                      {tooltipsEnabled && (
                        <div className="mt-2 p-2 bg-[#f8fafc] dark:bg-[#1e293b] rounded-lg border border-[#e2e8f0] dark:border-[#334155]">
                          <h4 className="text-xs font-medium text-[#334155] dark:text-[#e2e8f0] mb-1 flex items-center gap-1">
                            <Info className="h-3 w-3" />
                            About Incident Types
                          </h4>
                          <p className="text-xs text-[#64748b] dark:text-[#94a3b8]">
                            {incidentType ? (
                              <>
                                {typedText}
                                {isTyping && (
                                  <span className="inline-block w-1 h-3 ml-0.5 bg-[#3b82f6] dark:bg-[#6366f1] animate-pulse"></span>
                                )}
                              </>
                            ) : (
                              "Different incident types require specific response steps and have varying compliance requirements. Hover over options in the dropdown for details."
                            )}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Label htmlFor="start-time" className="text-[#334155] dark:text-[#e2e8f0] text-base">
                          When did the incident start?
                        </Label>
                      </div>
                      <motion.div
                        className="relative"
                        whileHover={{ y: -1 }}
                        transition={{ type: "spring", stiffness: 500, damping: 25 }}
                        id="start-time-container"
                      >
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={`w-full justify-start text-left font-normal h-12 rounded-xl border-[#e2e8f0] dark:border-[#334155] bg-white dark:bg-[#1e1e24] transition-all duration-300 ${
                                startTime
                                  ? "border-[#3b82f6] dark:border-[#6366f1] ring-1 ring-[#3b82f6]/20 dark:ring-[#6366f1]/20"
                                  : ""
                              }`}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4 text-[#64748b] dark:text-[#60a5fa]" />
                              {startTime ? (
                                <span>
                                  {format(startTime, timeFormat === "24h" ? "PPP p:ss" : "PPP h:mm:ss a")}{" "}
                                  <span className="opacity-75 text-xs">
                                    ({selectedTimezone.replace(/_/g, " ").split("/").pop()})
                                  </span>
                                </span>
                              ) : (
                                <span className="text-[#64748b] dark:text-[#94a3b8]">Select date and time</span>
                              )}
                            </Button>
                          </PopoverTrigger>

                          <PopoverContent
                            className="flex flex-col p-0 overflow-hidden w-[95vw] sm:w-auto"
                            side="bottom"
                            sideOffset={5}
                            align="center"
                          >
                            <Calendar
                              mode="single"
                              selected={startTime}
                              onSelect={(date) => {
                                if (date) {
                                  const newDate = new Date(date)
                                  // Preserve the current time
                                  newDate.setHours(startTime.getHours())
                                  newDate.setMinutes(startTime.getMinutes())
                                  setStartTime(newDate)
                                  if (isTimelineGenerated) setInputsChanged(true)

                                  // Add subtle animation to the parent container
                                  const container = document.getElementById("start-time-container")
                                  if (container) {
                                    container.animate(
                                      [
                                        {
                                          backgroundColor: isDarkMode
                                            ? "rgba(99, 102, 241, 0.08)"
                                            : "rgba(59, 130, 246, 0.08)",
                                        },
                                        { backgroundColor: "transparent" },
                                      ],
                                      { duration: 600, easing: "ease-out" },
                                    )
                                  }
                                }
                              }}
                              initialFocus
                            />

                            <div className="p-3 border-t border-[#e2e8f0] dark:border-[#334155]">
                              <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                  <h3 className="text-sm font-medium text-[#334155] dark:text-[#e2e8f0]">Time</h3>
                                  <div className="flex items-center space-x-1">
                                    <button
                                      type="button"
                                      onClick={() => setTimeFormat("24h")}
                                      className={`px-2 py-1 text-xs rounded-l-md ${
                                        timeFormat === "24h"
                                          ? "bg-[#3b82f6] text-white dark:bg-[#6366f1]"
                                          : "bg-[#f1f5f9] text-[#64748b] dark:bg-[#334155] dark:text-[#94a3b8]"
                                      }`}
                                    >
                                      24h
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setTimeFormat("12h")}
                                      className={`px-2 py-1 text-xs rounded-r-md ${
                                        timeFormat === "12h"
                                          ? "bg-[#3b82f6] text-white dark:bg-[#6366f1]"
                                          : "bg-[#f1f5f9] text-[#64748b] dark:bg-[#334155] dark:text-[#94a3b8]"
                                      }`}
                                    >
                                      12h
                                    </button>
                                  </div>
                                </div>

                                {/* Replace the existing time controls with this mobile-optimized version */}
                                <div className="flex flex-wrap items-center justify-center gap-3 mt-4 px-2 time-controls-container">
                                  {/* Time controls - will be stacked on mobile */}
                                  <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
                                    {/* Hours */}
                                    <div className="flex flex-col items-center w-full sm:w-auto">
                                      <button
                                        className="p-1.5 w-full sm:w-auto rounded-md hover:bg-[#f1f5f9] dark:hover:bg-[#334155] text-[#64748b] dark:text-[#94a3b8] transition-colors"
                                        onClick={() => {
                                          const newDate = new Date(startTime)
                                          let hours = newDate.getHours()
                                          if (timeFormat === "12h") {
                                            const isPM = hours >= 12
                                            hours = hours % 12 || 12
                                            hours = hours < 12 ? hours + 1 : 1
                                            newDate.setHours(
                                              isPM ? (hours === 12 ? 12 : hours + 12) : hours === 12 ? 0 : hours,
                                            )
                                          } else {
                                            newDate.setHours((hours + 1) % 24)
                                          }
                                          setStartTime(newDate)
                                          if (isTimelineGenerated) setInputsChanged(true)
                                        }}
                                      >
                                        <svg
                                          xmlns="http://www.w3.org/2000/svg"
                                          width="16"
                                          height="16"
                                          viewBox="0 0 24 24"
                                          fill="none"
                                          stroke="currentColor"
                                          strokeWidth="2"
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          className="mx-auto"
                                        >
                                          <path d="m18 15-6-6-6 6" />
                                        </svg>
                                      </button>
                                      <div className="w-full sm:w-20 h-12 flex items-center justify-center bg-white dark:bg-[#1e1e24] border border-[#e2e8f0] dark:border-[#334155] rounded-md text-lg font-medium text-[#334155] dark:text-white">
                                        {timeFormat === "12h"
                                          ? (startTime.getHours() % 12 || 12).toString().padStart(2, "0")
                                          : startTime.getHours().toString().padStart(2, "0")}
                                      </div>
                                      <button
                                        className="p-1.5 w-full sm:w-auto rounded-md hover:bg-[#f1f5f9] dark:hover:bg-[#334155] text-[#64748b] dark:text-[#94a3b8] transition-colors"
                                        onClick={() => {
                                          const newDate = new Date(startTime)
                                          let hours = newDate.getHours()
                                          if (timeFormat === "12h") {
                                            const isPM = hours >= 12
                                            hours = hours % 12 || 12
                                            hours = hours > 1 ? hours - 1 : 12
                                            newDate.setHours(
                                              isPM ? (hours === 12 ? 12 : hours + 12) : hours === 12 ? 0 : hours,
                                            )
                                          } else {
                                            newDate.setHours((hours - 1 + 24) % 24)
                                          }
                                          setStartTime(newDate)
                                          if (isTimelineGenerated) setInputsChanged(true)
                                        }}
                                      >
                                        <svg
                                          xmlns="http://www.w3.org/2000/svg"
                                          width="16"
                                          height="16"
                                          viewBox="0 0 24 24"
                                          fill="none"
                                          stroke="currentColor"
                                          strokeWidth="2"
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          className="mx-auto"
                                        >
                                          <path d="m6 9 6 6 6-6" />
                                        </svg>
                                      </button>
                                      <span className="text-xs text-[#64748b] dark:text-[#94a3b8] mt-1">Hours</span>
                                    </div>

                                    {/* Minutes */}
                                    <div className="flex flex-col items-center w-full sm:w-auto">
                                      <button
                                        className="p-1.5 w-full sm:w-auto rounded-md hover:bg-[#f1f5f9] dark:hover:bg-[#334155] text-[#64748b] dark:text-[#94a3b8] transition-colors"
                                        onClick={() => {
                                          const newDate = new Date(startTime)
                                          newDate.setMinutes((newDate.getMinutes() + 1) % 60)
                                          setStartTime(newDate)
                                          if (isTimelineGenerated) setInputsChanged(true)
                                        }}
                                      >
                                        <svg
                                          xmlns="http://www.w3.org/2000/svg"
                                          width="16"
                                          height="16"
                                          viewBox="0 0 24 24"
                                          fill="none"
                                          stroke="currentColor"
                                          strokeWidth="2"
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          className="mx-auto"
                                        >
                                          <path d="m18 15-6-6-6 6" />
                                        </svg>
                                      </button>
                                      <div className="w-full sm:w-20 h-12 flex items-center justify-center bg-white dark:bg-[#1e1e24] border border-[#e2e8f0] dark:border-[#334155] rounded-md text-lg font-medium text-[#334155] dark:text-white">
                                        {startTime.getMinutes().toString().padStart(2, "0")}
                                      </div>
                                      <button
                                        className="p-1.5 w-full sm:w-auto rounded-md hover:bg-[#f1f5f9] dark:hover:bg-[#334155] text-[#64748b] dark:text-[#94a3b8] transition-colors"
                                        onClick={() => {
                                          const newDate = new Date(startTime)
                                          newDate.setMinutes((newDate.getMinutes() - 1 + 60) % 60)
                                          setStartTime(newDate)
                                          if (isTimelineGenerated) setInputsChanged(true)
                                        }}
                                      >
                                        <svg
                                          xmlns="http://www.w3.org/2000/svg"
                                          width="16"
                                          height="16"
                                          viewBox="0 0 24 24"
                                          fill="none"
                                          stroke="currentColor"
                                          strokeWidth="2"
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          className="mx-auto"
                                        >
                                          <path d="m6 9 6 6 6-6" />
                                        </svg>
                                      </button>
                                      <span className="text-xs text-[#64748b] dark:text-[#94a3b8] mt-1">Minutes</span>
                                    </div>

                                    {/* Seconds */}
                                    <div className="flex flex-col items-center w-full sm:w-auto">
                                      <button
                                        className="p-1.5 w-full sm:w-auto rounded-md hover:bg-[#f1f5f9] dark:hover:bg-[#334155] text-[#64748b] dark:text-[#94a3b8] transition-colors"
                                        onClick={() => {
                                          const newDate = new Date(startTime)
                                          newDate.setSeconds((newDate.getSeconds() + 1) % 60)
                                          setStartTime(newDate)
                                          if (isTimelineGenerated) setInputsChanged(true)
                                        }}
                                      >
                                        <svg
                                          xmlns="http://www.w3.org/2000/svg"
                                          width="16"
                                          height="16"
                                          viewBox="0 0 24 24"
                                          fill="none"
                                          stroke="currentColor"
                                          strokeWidth="2"
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          className="mx-auto"
                                        >
                                          <path d="m18 15-6-6-6 6" />
                                        </svg>
                                      </button>
                                      <div className="w-full sm:w-20 h-12 flex items-center justify-center bg-white dark:bg-[#1e1e24] border border-[#e2e8f0] dark:border-[#334155] rounded-md text-lg font-medium text-[#334155] dark:text-white">
                                        {startTime.getSeconds().toString().padStart(2, "0")}
                                      </div>
                                      <button
                                        className="p-1.5 w-full sm:w-auto rounded-md hover:bg-[#f1f5f9] dark:hover:bg-[#334155] text-[#64748b] dark:text-[#94a3b8] transition-colors"
                                        onClick={() => {
                                          const newDate = new Date(startTime)
                                          newDate.setSeconds((newDate.getSeconds() - 1 + 60) % 60)
                                          setStartTime(newDate)
                                          if (isTimelineGenerated) setInputsChanged(true)
                                        }}
                                      >
                                        <svg
                                          xmlns="http://www.w3.org/2000/svg"
                                          width="16"
                                          height="16"
                                          viewBox="0 0 24 24"
                                          fill="none"
                                          stroke="currentColor"
                                          strokeWidth="2"
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          className="mx-auto"
                                        >
                                          <path d="m6 9 6 6 6-6" />
                                        </svg>
                                      </button>
                                      <span className="text-xs text-[#64748b] dark:text-[#94a3b8] mt-1">Seconds</span>
                                    </div>

                                    {/* AM/PM selector - only shown in 12h mode */}
                                    {timeFormat === "12h" && (
                                      <div className="flex flex-col items-center w-full sm:w-auto mt-4">
                                        <button
                                          className={`w-full sm:w-20 h-12 flex items-center justify-center rounded-t-md text-sm font-medium ${
                                            startTime.getHours() < 12
                                              ? "bg-[#3b82f6] text-white dark:bg-[#6366f1]"
                                              : "bg-[#f1f5f9] text-[#64748b] dark:bg-[#334155] dark:text-[#94a3b8]"
                                          }`}
                                          onClick={() => {
                                            const newDate = new Date(startTime)
                                            const currentHours = newDate.getHours()
                                            if (currentHours >= 12) {
                                              newDate.setHours(currentHours - 12)
                                            }
                                            setStartTime(newDate)
                                            if (isTimelineGenerated) setInputsChanged(true)
                                          }}
                                        >
                                          AM
                                        </button>
                                        <button
                                          className={`w-full sm:w-20 h-12 flex items-center justify-center rounded-b-md text-sm font-medium ${
                                            startTime.getHours() >= 12
                                              ? "bg-[#3b82f6] text-white dark:bg-[#6366f1]"
                                              : "bg-[#f1f5f9] text-[#64748b] dark:bg-[#334155] dark:text-[#94a3b8]"
                                          }`}
                                          onClick={() => {
                                            const newDate = new Date(startTime)
                                            const currentHours = newDate.getHours()
                                            if (currentHours < 12) {
                                              newDate.setHours(currentHours + 12)
                                            }
                                            setStartTime(newDate)
                                            if (isTimelineGenerated) setInputsChanged(true)
                                          }}
                                        >
                                          PM
                                        </button>
                                        <span className="text-xs text-[#64748b] dark:text-[#94a3b8] mt-1">AM/PM</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </PopoverContent>
                        </Popover>
                      </motion.div>
                    </div>
                  </motion.div>

                  <motion.div className="space-y-6" variants={fadeUpItem}>
                    <div className="space-y-3" id="framework-container">
                      <div className="flex items-center gap-2">
                        <Label htmlFor="framework" className="text-[#334155] dark:text-[#e2e8f0] text-base">
                          Which compliance framework applies?
                        </Label>
                      </div>
                      <motion.div whileHover={{ y: -1 }} transition={{ type: "spring", stiffness: 500, damping: 25 }}>
                        <Select
                          value={framework}
                          onValueChange={(value) => {
                            setFramework(value)
                            if (isTimelineGenerated) setInputsChanged(true)
                            // Add subtle animation to the parent container
                            const container = document.getElementById("framework-container")
                            if (container) {
                              container.animate(
                                [
                                  {
                                    backgroundColor: isDarkMode
                                      ? "rgba(99, 102, 241, 0.08)"
                                      : "rgba(59, 130, 246, 0.08)",
                                  },
                                  { backgroundColor: "transparent" },
                                ],
                                { duration: 600, easing: "ease-out" },
                              )
                            }
                          }}
                        >
                          <SelectTrigger
                            id="framework"
                            className={`w-full rounded-xl h-12 border-[#e2e8f0] dark:border-[#334155] bg-white dark:bg-[#1e1e24] transition-all duration-300 ${
                              framework
                                ? "border-[#3b82f6] dark:border-[#6366f1] ring-1 ring-[#3b82f6]/20 dark:ring-[#6366f1]/20"
                                : ""
                            }`}
                          >
                            <SelectValue placeholder="Select framework" />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl border-[#e2e8f0] dark:border-[#334155]">
                            {regulationFrameworks.map((fw) => (
                              <div key={fw.id} className="group/item relative">
                                <SelectItem
                                  value={fw.id}
                                  className={framework === fw.id ? "bg-[#dbeafe] dark:bg-[#1e40af]/20" : ""}
                                >
                                  <div className="flex items-center justify-between w-full">
                                    <span>{fw.name}</span>
                                    {tooltipsEnabled && (
                                      <Info className="h-3 w-3 ml-2 text-[#64748b] dark:text-[#94a3b8] opacity-50 group-hover/item:opacity-100" />
                                    )}
                                  </div>
                                </SelectItem>
                                {tooltipsEnabled && (
                                  <div
                                    className="fixed invisible group-hover/item:visible opacity-0 group-hover/item:opacity-100 transition-opacity duration-200 z-50 bg-white dark:bg-[#1e293b] shadow-lg rounded-lg p-2 text-sm max-w-xs border border-[#e2e8f0] dark:border-[#334155] whitespace-normal overflow-visible"
                                    style={{
                                      left: "calc(100% + 8px)",
                                      top: "50%",
                                      transform: "translateY(-50%)",
                                      pointerEvents: "none",
                                      wordBreak: "normal",
                                      overflowWrap: "break-word",
                                    }}
                                  >
                                    <p
                                      className={`font-medium ${framework === fw.id ? "text-[#3b82f6] dark:text-[#60a5fa]" : ""}`}
                                    >
                                      {fw.name}
                                    </p>
                                    <p className="text-xs text-[#64748b] dark:text-[#94a3b8] mt-1">
                                      {getFrameworkDescription(fw.id)}
                                    </p>
                                  </div>
                                )}
                              </div>
                            ))}
                          </SelectContent>
                        </Select>
                      </motion.div>
                      <p className="text-xs text-[#64748b] dark:text-[#94a3b8] mt-1 ml-1">
                        Select the regulatory framework that applies to your organization
                      </p>
                      {tooltipsEnabled && (
                        <div className="mt-2 p-2 bg-[#f8fafc] dark:bg-[#1e293b] rounded-lg border border-[#e2e8f0] dark:border-[#334155] overflow-visible">
                          <h4 className="text-xs font-medium text-[#334155] dark:text-[#e2e8f0] mb-1 flex items-center gap-1">
                            <Info className="h-3 w-3" />
                            About Compliance Frameworks
                          </h4>
                          <p className="text-xs text-[#64748b] dark:text-[#94a3b8]">
                            {framework ? (
                              <>
                                {typedFrameworkText}
                                {isFrameworkTyping && (
                                  <span className="inline-block w-1 h-3 ml-0.5 bg-[#3b82f6] dark:bg-[#6366f1] animate-pulse"></span>
                                )}
                              </>
                            ) : (
                              "Each framework has specific requirements for incident response timing, documentation, and notification. Hover over options in the dropdown for details."
                            )}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="pt-8">
                      {/* Add visual feedback when both selections are made */}
                      {incidentType && framework && startTime && (
                        <motion.div
                          className="mb-4 p-3 rounded-xl bg-[#f0f7ff] dark:bg-[#1e293b]/80 border border-[#bae6fd] dark:border-[#60a5fa]/30 text-[#0369a1] dark:text-[#93c5fd] flex items-start gap-3"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{
                            duration: 0.3,
                            ease: "easeOut",
                          }}
                        >
                          <div className="flex items-start gap-2">
                            <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="font-medium">Ready to generate timeline</p>
                              <p className="text-xs mt-1 text-[#64748b] dark:text-[#cbd5e1]">
                                {incidentTypes.find((t) => t.id === incidentType)?.name} timeline will be generated
                                using {regulationFrameworks.find((f) => f.id === framework)?.name} requirements
                                {inputsChanged && (
                                  <span className="ml-1 text-[#3b82f6] dark:text-[#60a5fa] font-medium">
                                    • Changes detected
                                  </span>
                                )}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      )}

                      <motion.div
                        whileHover={!isGenerating && incidentType && framework ? { scale: 1.01, y: -1 } : {}}
                        whileTap={!isGenerating && incidentType && framework ? { scale: 0.99 } : {}}
                        transition={{ type: "spring", stiffness: 500, damping: 25 }}
                      >
                        <Button
                          id="generate-button"
                          onClick={handleGenerateTimeline}
                          className={`w-full h-12 rounded-xl text-base font-medium transition-all duration-300 ${
                            !incidentType || !framework || !startTime || isGenerating
                              ? "bg-[#e2e8f0] text-[#64748b] dark:bg-[#334155] dark:text-[#94a3b8] cursor-not-allowed"
                              : inputsChanged
                                ? "bg-[#3b82f6] hover:bg-[#2563eb] text-white dark:bg-[#6366f1] dark:hover:bg-[#4f46e5] hover:shadow-md dark:hover:shadow-[#6366f1]/20 border-[#3b82f6] dark:border-[#6366f1] border-2"
                                : "bg-[#3b82f6] hover:bg-[#2563eb] text-white dark:bg-[#6366f1] dark:hover:bg-[#4f46e5] hover:shadow-md dark:hover:shadow-[#6366f1]/20"
                          }`}
                          disabled={!incidentType || !framework || !startTime || isGenerating}
                        >
                          {isGenerating ? (
                            <motion.div className="flex items-center">
                              <motion.span
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1.5, ease: "linear", repeat: Number.POSITIVE_INFINITY }}
                                className="mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"
                              />
                              <span>Generating...</span>
                            </motion.div>
                          ) : !incidentType || !framework ? (
                            "Generate Timeline"
                          ) : inputsChanged ? (
                            <>
                              <span className="mr-2">Update Timeline</span>
                              <motion.span
                                className="relative flex h-2 w-2"
                                animate={{
                                  scale: [1, 1.3, 1],
                                  opacity: [0.5, 1, 0.5],
                                }}
                                transition={{
                                  duration: 1.5,
                                  ease: "easeInOut",
                                  repeat: Number.POSITIVE_INFINITY,
                                }}
                              >
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                              </motion.span>
                            </>
                          ) : (
                            <>
                              <span>Generate Timeline</span>
                            </>
                          )}
                        </Button>
                      </motion.div>

                      {/* Add export buttons near generate button */}
                      {incidentType && framework && startTime && isTimelineGenerated && (
                        <motion.div
                          className="mt-4"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 }}
                        >
                          <ExportButtons
                            handleExportPDF={handleExportPDF}
                            handleExportMarkdown={handleExportMarkdown}
                            isExporting={isExporting}
                          />
                        </motion.div>
                      )}

                      {(!incidentType || !framework || !startTime) && (
                        <motion.p
                          className="text-xs text-[#64748b] dark:text-[#94a3b8] mt-2 text-center"
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 }}
                        >
                          Please select an incident type, framework, and start time to continue
                        </motion.p>
                      )}
                    </div>
                  </motion.div>
                </motion.div>

                <AnimatePresence>
                  {isTimelineGenerated && (
                    <motion.div
                      id="timeline-section"
                      className="mt-20 space-y-6"
                      initial={{ opacity: 0, y: 40 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, type: "spring", stiffness: 100, damping: 15 }}
                    >
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <motion.div
                          className="flex flex-col"
                          initial={{ opacity: 0.95, x: -2 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.6, ease: "easeOut" }}
                        >
                          <motion.h2
                            className="text-xl font-semibold text-[#1d1d1f] dark:text-white tracking-tight"
                            variants={fadeUpItem}
                          >
                            Compliance Timeline
                          </motion.h2>
                          <AnimatePresence mode="wait">
                            {isTimelineGenerated && (
                              <motion.p
                                key={framework} // Add key to trigger animation when framework changes
                                className="text-sm text-[#86868b] dark:text-[#a1a1a6] font-normal"
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -5 }}
                                transition={{
                                  type: "spring",
                                  stiffness: 500,
                                  damping: 30,
                                  duration: 0.3,
                                }}
                              >
                                Generated according to {regulationFrameworks.find((f) => f.id === framework)?.name}
                              </motion.p>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      </div>

                      <Tabs defaultValue="timeline" className="w-full" defaultValue="timeline">
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2, duration: 0.4 }}
                        >
                          <TabsList className="mb-4 rounded-[22px] p-1 h-[38px] bg-[#f1f5f9] dark:bg-[#1e293b] w-auto inline-flex shadow-[0_1px_2px_rgba(0,0,0,0.05)] dark:shadow-[0_1px_2px_rgba(255,255,255,0.05)]">
                            <motion.div
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              transition={{ duration: 0.2, ease: "easeOut" }}
                            >
                              <TabsTrigger
                                value="timeline"
                                className="rounded-[18px] flex items-center gap-2 px-5 py-2.5 h-[30px] data-[state=active]:bg-white dark:data-[state=active]:bg-[#334155] data-[state=active]:shadow-[0_1px_1px_rgba(0,0,0,0.05)] text-sm font-medium transition-all duration-200"
                              >
                                <List className="h-4 w-4" />
                                <span>Timeline View</span>
                              </TabsTrigger>
                            </motion.div>
                            <motion.div
                              whileTap={{ scale: 0.98 }}
                              transition={{ duration: 0.2, ease: "easeOut" }}
                              className="hidden sm:block"
                            >
                              <TabsTrigger
                                value="calendar"
                                className="rounded-[18px] flex items-center gap-2 px-5 py-2.5 h-[30px] data-[state=active]:bg-white dark:data-[state=active]:bg-[#334155] data-[state=active]:shadow-[0_1px_1px_rgba(0,0,0,0.05)] text-sm font-medium transition-all duration-200"
                              >
                                <CalendarIcon className="h-4 w-4" />
                                <span>Calendar View</span>
                              </TabsTrigger>
                            </motion.div>
                            <motion.div
                              whileTap={{ scale: 0.98 }}
                              transition={{ duration: 0.2, ease: "easeOut" }}
                              className="hidden sm:block"
                            >
                              <TabsTrigger
                                value="gantt"
                                className="rounded-[18px] flex items-center gap-2 px-5 py-2.5 h-[30px] data-[state=active]:bg-white dark:data-[state=active]:bg-[#334155] data-[state=active]:shadow-[0_1px_1px_rgba(0,0,0,0.05)] text-sm font-medium transition-all duration-200"
                              >
                                <BarChart2 className="h-4 w-4" />
                                <span>Gantt Chart</span>
                              </TabsTrigger>
                            </motion.div>
                          </TabsList>
                        </motion.div>

                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3, duration: 0.5 }}
                        >
                          <TabsContent value="timeline" className="mt-0">
                            <TimelineView timeline={timeline} isDarkMode={isDarkMode} />
                          </TabsContent>

                          <TabsContent value="calendar" className="mt-0">
                            <CalendarView timeline={timeline} isDarkMode={isDarkMode} />
                          </TabsContent>
                          <TabsContent value="gantt" className="mt-0">
                            <GanttView timeline={timeline} isDarkMode={isDarkMode} />
                          </TabsContent>
                        </motion.div>
                      </Tabs>

                      <motion.div
                        className="text-xs text-center text-[#64748b] dark:text-[#94a3b8] mb-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                      >
                        <span className="italic">
                          Timeline generated based on {regulationFrameworks.find((f) => f.id === framework)?.name}{" "}
                          requirements and industry best practices
                        </span>
                      </motion.div>

                      <motion.div
                        className="mt-6 p-4 rounded-xl bg-[#f8fafc] dark:bg-[#1e293b] border border-[#e2e8f0] dark:border-[#334155] text-[#0369a1] dark:text-[#93c5fd] shadow-sm"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 0.5 }}
                        whileHover={{ y: -2, boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)" }}
                      >
                        <motion.h3
                          className="font-medium flex items-center gap-2 text-[#1e293b] dark:text-white"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.5 }}
                        >
                          <motion.div
                            animate={pulse.pulse}
                            transition={{ delay: 1, repeat: Number.POSITIVE_INFINITY, repeatDelay: 5 }}
                          >
                            <Info className="h-4 w-4 text-[#3b82f6] dark:text-[#60a5fa]" />
                          </motion.div>
                          Timeline Summary
                        </motion.h3>
                        <motion.div
                          className="text-sm mt-2 text-[#334155] dark:text-[#e2e8f0]"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.6 }}
                        >
                          <p className="font-medium">
                            This timeline includes {timeline.length} steps across{" "}
                            {Math.ceil(
                              (new Date(timeline[timeline.length - 1].time).getTime() -
                                new Date(timeline[0].time).getTime()) /
                                (1000 * 60 * 60 * 24),
                            )}{" "}
                            days, following {regulationFrameworks.find((f) => f.id === framework)?.name} requirements
                            for a {incidentTypes.find((i) => i.id === incidentType)?.name.toLowerCase()}.
                          </p>

                          <div className="mt-3 pt-3 border-t border-[#e2e8f0] dark:border-[#334155]">
                            <h4 className="text-xs uppercase tracking-wider text-[#64748b] dark:text-[#94a3b8] font-medium mb-2">
                              Sources
                            </h4>
                            <ul className="space-y-1.5 text-xs text-[#475569] dark:text-[#cbd5e1]">
                              {framework === "hipaa" && (
                                <>
                                  <li className="flex items-start gap-1">
                                    <span className="text-[10px] font-medium bg-[#f1f5f9] dark:bg-[#334155] px-1 rounded mt-0.5">
                                      [1]
                                    </span>
                                    <span>
                                      U.S. Department of Health & Human Services. (2013).{" "}
                                      <em>HIPAA Breach Notification Rule, 45 CFR §§ 164.400-414</em>.
                                    </span>
                                  </li>
                                  <li className="flex items-start gap-1">
                                    <span className="text-[10px] font-medium bg-[#f1f5f9] dark:bg-[#334155] px-1 rounded mt-0.5">
                                      [2]
                                    </span>
                                    <span>
                                      Office for Civil Rights. (2020). <em>Guidance on HIPAA & Contingency Planning</em>
                                      . HHS.gov.
                                    </span>
                                  </li>
                                </>
                              )}
                              {framework === "gdpr" && (
                                <>
                                  <li className="flex items-start gap-1">
                                    <span className="text-[10px] font-medium bg-[#f1f5f9] dark:bg-[#334155] px-1 rounded mt-0.5">
                                      [1]
                                    </span>
                                    <span>
                                      European Data Protection Board. (2018).{" "}
                                      <em>Guidelines on Personal Data Breach Notification under GDPR</em>. Article
                                      33-34.
                                    </span>
                                  </li>
                                  <li className="flex items-start gap-1">
                                    <span className="text-[10px] font-medium bg-[#f1f5f9] dark:bg-[#334155] px-1 rounded mt-0.5">
                                      [2]
                                    </span>
                                    <span>
                                      Information Commissioner's Office. (2022).{" "}
                                      <em>Guide to the UK General Data Protection Regulation</em>.
                                    </span>
                                  </li>
                                </>
                              )}
                              {framework === "pci_dss" && (
                                <>
                                  <li className="flex items-start gap-1">
                                    <span className="text-[10px] font-medium bg-[#f1f5f9] dark:bg-[#334155] px-1 rounded mt-0.5">
                                      [1]
                                    </span>
                                    <span>
                                      PCI Security Standards Council. (2022).{" "}
                                      <em>Payment Card Industry Data Security Standard v4.0</em>. Section 12.10.
                                    </span>
                                  </li>
                                  <li className="flex items-start gap-1">
                                    <span className="text-[10px] font-medium bg-[#f1f5f9] dark:bg-[#334155] px-1 rounded mt-0.5">
                                      [2]
                                    </span>
                                    <span>
                                      PCI Security Standards Council. (2018).{" "}
                                      <em>
                                        Information Supplement: Best Practices for Implementing a Security Incident
                                        Response Program
                                      </em>
                                      .
                                    </span>
                                  </li>
                                </>
                              )}
                              {framework === "nist" && (
                                <>
                                  <li className="flex items-start gap-1">
                                    <span className="text-[10px] font-medium bg-[#f1f5f9] dark:bg-[#334155] px-1 rounded mt-0.5">
                                      [1]
                                    </span>
                                    <span>
                                      Cichonski, P., et al. (2012). <em>Computer Security Incident Handling Guide</em>.
                                      NIST Special Publication 800-61 Revision 2.
                                    </span>
                                  </li>
                                  <li className="flex items-start gap-1">
                                    <span className="text-[10px] font-medium bg-[#f1f5f9] dark:bg-[#334155] px-1 rounded mt-0.5">
                                      [2]
                                    </span>
                                    <span>
                                      National Institute of Standards and Technology. (2018).{" "}
                                      <em>Framework for Improving Critical Infrastructure Cybersecurity</em>, Version
                                      1.1.
                                    </span>
                                  </li>
                                </>
                              )}
                              {framework !== "hipaa" &&
                                framework !== "gdpr" &&
                                framework !== "pci_dss" &&
                                framework !== "nist" && (
                                  <>
                                    <li className="flex items-start gap-1">
                                      <span className="text-[10px] font-medium bg-[#f1f5f9] dark:bg-[#334155] px-1 rounded mt-0.5">
                                        [1]
                                      </span>
                                      <span>
                                        International Organization for Standardization. (2016).{" "}
                                        <em>ISO/IEC 27035:2016 Information Security Incident Management</em>.
                                      </span>
                                    </li>
                                    <li className="flex items-start gap-1">
                                      <span className="text-[10px] font-medium bg-[#f1f5f9] dark:bg-[#334155] px-1 rounded mt-0.5">
                                        [2]
                                      </span>
                                      <span>
                                        FIRST.org. (2019).{" "}
                                        <em>Computer Security Incident Response Team (CSIRT) Services Framework</em>,
                                        Version 2.1.
                                      </span>
                                    </li>
                                  </>
                                )}
                            </ul>
                          </div>

                          <p className="mt-3 text-xs text-[#64748b] dark:text-[#94a3b8]">
                            Use the tabs above to switch between timeline and calendar views. You can export this
                            timeline using the buttons above.
                          </p>
                        </motion.div>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
                {isTimelineGenerated && (
                  <motion.div
                    className="mt-4 text-center"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <motion.div
                      className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-900/20 rounded-full"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ type: "spring", stiffness: 500, damping: 25 }}
                    >
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                      </span>
                      Timeline generated successfully
                    </motion.div>
                  </motion.div>
                )}
                {!isTimelineGenerated && (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <img
                      src="/logo.png"
                      alt="ChronoSec Logo"
                      width={80}
                      height={80}
                      className="mb-2 opacity-50 dark:opacity-70 dark:filter-none dark:brightness-100"
                    />
                    <h3 className="text-lg font-medium text-[#1e293b] dark:text-white mb-2">No Timeline Generated</h3>
                    <p className="text-[#64748b] dark:text-[#94a3b8] max-w-md">
                      Select an incident type and compliance framework, then click "Generate Timeline" to create your
                      incident response timeline.
                    </p>
                  </div>
                )}
                <div className="flex flex-col items-center w-full mt-8 pb-6 gap-2">
                  <motion.div
                    className="text-xs inline-flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg border border-[#e2e8f0] dark:border-[#334155] bg-white/80 dark:bg-[#1e293b]/80 backdrop-blur-sm shadow-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.7 }}
                    whileHover={{ y: -1, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}
                  >
                    <Clock className={`h-3.5 w-3.5 ${isDarkMode ? "text-[#60a5fa]" : "text-[#3b82f6]"}`} />
                    <span className={`font-medium ${isDarkMode ? "text-white" : "text-[#1e293b]"}`}>
                      {format(currentTime, "MMM d, yyyy")}
                    </span>
                    <span className={`${isDarkMode ? "text-[#94a3b8]" : "text-[#64748b]"}`}>
                      {format(currentTime, "h:mm:ss a")}
                    </span>
                    <span className={`text-xs ${isDarkMode ? "text-[#94a3b8]/70" : "text-[#64748b]/70"}`}>
                      ({Intl.DateTimeFormat().resolvedOptions().timeZone.replace(/_/g, " ").split("/").pop()})
                    </span>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <motion.div className="cursor-help">
                          <Info className={`h-3 w-3 ${isDarkMode ? "text-[#94a3b8]" : "text-[#64748b]"}`} />
                        </motion.div>
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        <p className="text-xs">Current system time</p>
                      </TooltipContent>
                    </Tooltip>
                  </motion.div>

                  <motion.div
                    className="text-xs text-center text-[#64748b] dark:text-[#94a3b8] mt-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.9 }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex flex-col items-center justify-center gap-1">
                      <span className={`${isDarkMode ? "text-white/70" : "text-[#334155]/70"} italic`}>
                        Timelines with precision, compliance with confidence
                      </span>
                      <span className={`text-[10px] ${isDarkMode ? "text-white/50" : "text-[#334155]/50"}`}>
                        © Chronosec v1.0.3 • Released April 2025
                      </span>
                    </div>
                  </motion.div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </TooltipProvider>
  )
}
