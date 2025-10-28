"use client"

import { Card, CardContent } from "@/components/ui/card"
import { useState, useRef, useEffect } from "react"
import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"

const uiFeatures = [
  {
    title: "Responsive Design",
    description: "Layouts that adapt to various screen sizes",
  },
  {
    title: "Accessibility Features",
    description: "Ensuring usability for all users",
  },
  {
    title: "Performance Optimization",
    description: "Fast loading and smooth interactions",
  },
  {
    title: "Cross-Browser Compatibility",
    description: "Consistent experience across platforms",
  },
  {
    title: "User-Centric Design",
    description: "Intuitive interfaces",
  },
]

export default function Frame() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [activePillStyle, setActivePillStyle] = useState({})
  const [isDarkMode, setIsDarkMode] = useState(false)
  const featureRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    if (hoveredIndex !== null) {
      const hoveredElement = featureRefs.current[hoveredIndex]
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

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
    document.documentElement.classList.toggle("dark")
  }

  return (
    <div className={`flex justify-center w-full min-h-screen ${isDarkMode ? "dark bg-[#0e0f11]" : "bg-white"}`}>
      <Card
        className={`w-[567px] h-[513px] border-none shadow-none relative ${isDarkMode ? "bg-[#0e0f11]" : "bg-white"}`}
      >
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 text-[#0e0f11] dark:text-white"
          onClick={toggleDarkMode}
        >
          {isDarkMode ? <Sun className="h-[1.2rem] w-[1.2rem]" /> : <Moon className="h-[1.2rem] w-[1.2rem]" />}
        </Button>
        <CardContent className="flex flex-col items-start gap-6 p-0 mt-[110px] mx-[84px]">
          <div className="w-full px-3">
            <h2 className="font-[var(--www-mattmannucci-me-semantic-heading-2-upper-font-family)] text-sm text-[#0e0f11] dark:text-white">
              UI
            </h2>
          </div>

          <div className="flex flex-col items-start w-full gap-2 relative">
            {/* Background Highlight */}
            <div
              className="absolute transition-all duration-300 ease-out bg-[#0e0f1114] dark:bg-[#ffffff14] rounded-[10px]"
              style={{
                ...activePillStyle,
                opacity: hoveredIndex !== null ? 1 : 0,
              }}
            />

            {/* Feature Items */}
            <div className="relative w-full space-y-2 flex flex-col items-start">
              {uiFeatures.map((feature, index) => (
                <div
                  key={index}
                  ref={(el) => (featureRefs.current[index] = el)}
                  className="inline-block px-3 py-3 rounded-[10px] transition-colors duration-300"
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  <div className="text-sm text-[#0e0e10] dark:text-white font-[var(--www-mattmannucci-me-geist-regular-font-family)] leading-5 whitespace-nowrap">
                    {feature.title}
                  </div>
                  <div className="text-sm text-[#0e0f1199] dark:text-[#ffffff99] font-[var(--www-mattmannucci-me-geist-regular-font-family)] leading-5 whitespace-nowrap">
                    {feature.description}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
