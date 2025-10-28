import { NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export async function POST(request: Request) {
  try {
    const { baseTimeline, incidentType, framework, startTime } = await request.json()

    // Format the base timeline for the AI to understand
    const timelineForAI = baseTimeline.map((item) => ({
      id: item.id,
      title: item.title,
      description: item.description,
      time: new Date(item.time).toISOString(),
      type: item.type,
    }))

    const prompt = `
      I have a basic incident response timeline for a ${incidentType} incident using the ${framework} compliance framework.
      The incident started at ${new Date(startTime).toISOString()}.
      
      Base timeline: ${JSON.stringify(timelineForAI, null, 2)}
      
      Please enhance this timeline by:
      1. Adding any missing critical steps required by ${framework}
      2. Improving descriptions to be more specific and actionable
      3. Adjusting timing if any steps don't meet compliance requirements
      4. Adding 2-3 framework-specific recommendations
      
      Return the enhanced timeline in this JSON format:
      {
        "timeline": [
          {
            "id": "string",
            "title": "string",
            "description": "string",
            "time": "ISO date string",
            "type": "identify|notify|contain|document|remediate|report|assess|analyze|review"
          }
        ],
        "recommendations": [
          "string"
        ]
      }
    `

    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt,
      system:
        "You are an expert in cybersecurity incident response and compliance frameworks. Enhance the provided timeline to ensure it meets all compliance requirements and best practices.",
    })

    // Parse the JSON response
    const enhancedData = JSON.parse(text)

    // Convert ISO strings back to Date objects for the frontend
    const processedTimeline = enhancedData.timeline.map((item) => ({
      ...item,
      time: new Date(item.time),
    }))

    return NextResponse.json({
      timeline: processedTimeline,
      recommendations: enhancedData.recommendations,
    })
  } catch (error) {
    console.error("Error enhancing timeline:", error)
    return NextResponse.json({ error: "Failed to enhance timeline" }, { status: 500 })
  }
}
