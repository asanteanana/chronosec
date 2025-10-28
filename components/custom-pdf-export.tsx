"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { FileText } from "lucide-react"
import { exportToPDF } from "@/lib/export-utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface CustomPDFExportProps {
  timeline: any[]
  incidentType: string
  framework: string
  startTime: Date
  buttonText?: string
  className?: string
}

export function CustomPDFExport({
  timeline,
  incidentType,
  framework,
  startTime,
  buttonText = "Custom PDF",
  className = "",
}: CustomPDFExportProps) {
  const [isExporting, setIsExporting] = useState(false)
  const [showOptions, setShowOptions] = useState(false)
  const [customDocId, setCustomDocId] = useState("")
  const [useCustomDocId, setUseCustomDocId] = useState(false)
  const [includeRevisionHistory, setIncludeRevisionHistory] = useState(true)
  const [additionalNotes, setAdditionalNotes] = useState("")

  const handleExport = () => {
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
    progressContainer.style.backgroundColor = document.body.classList.contains("dark") ? "#1e293b" : "white"
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
    spinner.style.border = document.body.classList.contains("dark") ? "3px solid #6366f1" : "3px solid #3b82f6"
    spinner.style.borderTop = "3px solid transparent"
    spinner.style.borderRadius = "50%"
    spinner.style.animation = "spin 1s linear infinite"

    // Add a title
    const title = document.createElement("div")
    title.style.fontSize = "18px"
    title.style.fontWeight = "600"
    title.style.color = document.body.classList.contains("dark") ? "white" : "#1e293b"
    title.textContent = "Preparing Custom PDF Export"

    // Add a progress message
    const progressMessage = document.createElement("div")
    progressMessage.style.fontSize = "14px"
    progressMessage.style.color = document.body.classList.contains("dark") ? "#94a3b8" : "#64748b"
    progressMessage.style.textAlign = "center"
    progressMessage.style.marginTop = "8px"
    progressMessage.innerHTML = `
      <p>Generating custom PDF for your timeline</p>
      <p style="margin-top: 4px; font-size: 12px;">This may take a few moments...</p>
    `

    // Add a progress bar
    const progressBarContainer = document.createElement("div")
    progressBarContainer.style.width = "100%"
    progressBarContainer.style.height = "6px"
    progressBarContainer.style.backgroundColor = document.body.classList.contains("dark") ? "#334155" : "#e2e8f0"
    progressBarContainer.style.borderRadius = "3px"
    progressBarContainer.style.overflow = "hidden"
    progressBarContainer.style.marginTop = "8px"

    const progressBar = document.createElement("div")
    progressBar.style.height = "100%"
    progressBar.style.width = "0%"
    progressBar.style.backgroundColor = document.body.classList.contains("dark") ? "#6366f1" : "#3b82f6"
    progressBar.style.transition = "width 0.3s ease-out"

    // Add a cancel button
    const cancelButton = document.createElement("button")
    cancelButton.style.marginTop = "16px"
    cancelButton.style.padding = "8px 16px"
    cancelButton.style.backgroundColor = "transparent"
    cancelButton.style.border = document.body.classList.contains("dark") ? "1px solid #4b5563" : "1px solid #d1d5db"
    cancelButton.style.borderRadius = "6px"
    cancelButton.style.color = document.body.classList.contains("dark") ? "#94a3b8" : "#64748b"
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
        exportToPDF(
          timeline,
          incidentType,
          framework,
          startTime,
          "", // Empty classification
          useCustomDocId ? customDocId : undefined,
        )

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
              <p class="font-medium text-[#1e293b] dark:text-white text-sm">Custom PDF downloaded successfully</p>
              <p class="text-xs text-[#64748b] dark:text-[#94a3b8]">Your timeline has been exported as a custom PDF</p>
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
            <p class="font-medium text-[#1e293b] dark:text-white text-sm">Custom PDF export failed</p>
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

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={isExporting}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl px-4 py-2 border-[#e2e8f0] dark:border-[#334155] text-[#334155] dark:text-[#e2e8f0]"
          >
            {isExporting ? (
              <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-1" />
            ) : (
              <FileText className="h-4 w-4" />
            )}
            <span>{isExporting ? "Preparing..." : buttonText}</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Export timeline as a custom PDF document</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
