import { NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export async function POST(request: Request) {
  try {
    const { timeline, incidentType, framework } = await request.json()

    const prompt = `
      Analyze this incident response timeline and provide 3-5 specific recommendations to improve compliance and effectiveness:

      Incident Type: ${incidentType}
      Compliance Framework: ${framework}
      Timeline: ${JSON.stringify(timeline, null, 2)}

      Focus on:
      1. Compliance gaps or risks
      2. Process improvements
      3. Documentation requirements
      4. Communication strategies
      5. Technical controls

      Format as a bulleted list of actionable recommendations.
    `

    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt,
      system:
        "You are an expert in cybersecurity incident response and compliance frameworks. Provide clear, actionable recommendations based on the incident timeline.",
    })

    // Parse the bulleted list into an array
    const recommendations = text
      .split(/•|-|\*/)
      .map((item) => item.trim())
      .filter((item) => item.length > 0)

    return NextResponse.json({ recommendations })
  } catch (error) {
    console.error("Error analyzing timeline:", error)
    return NextResponse.json({ error: "Failed to analyze timeline" }, { status: 500 })
  }
}
