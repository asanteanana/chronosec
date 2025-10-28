import { NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export async function POST(request: Request) {
  try {
    const { timeline, framework } = await request.json()

    const prompt = `
      Analyze this incident response timeline for compliance with ${framework.toUpperCase()} requirements:
      
      Timeline: ${JSON.stringify(timeline, null, 2)}
      
      For each key requirement of ${framework.toUpperCase()}, determine if the timeline is:
      - "compliant" (fully meets requirements)
      - "partial" (partially meets requirements)
      - "non-compliant" (fails to meet requirements)
      
      Also provide a compliance score (0-100) for each requirement and an overall score.
      
      Return the analysis in this JSON format:
      {
        "items": [
          {
            "requirement": "Requirement name",
            "status": "compliant|partial|non-compliant",
            "details": "Explanation of the compliance status",
            "score": 85
          }
        ],
        "overallScore": 75
      }
    `

    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt,
      system:
        "You are an expert in cybersecurity compliance frameworks. Analyze the incident response timeline and provide a detailed compliance assessment.",
    })

    // Parse the JSON response
    const analysisData = JSON.parse(text)

    return NextResponse.json(analysisData)
  } catch (error) {
    console.error("Error analyzing compliance:", error)
    return NextResponse.json({ error: "Failed to analyze compliance" }, { status: 500 })
  }
}
