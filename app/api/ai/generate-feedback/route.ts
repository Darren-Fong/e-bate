import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(req: NextRequest) {
  const openai = new OpenAI({
    apiKey: process.env.DEEPSEEK_API_KEY,
    baseURL: "https://api.deepseek.com",
  });
  try {
    const { topic, transcript } = await req.json();

    const transcriptText = transcript
      .map((entry: any) => `Round ${entry.round} - ${entry.speaker}: ${entry.text}`)
      .join("\n\n");

    const prompt = `Analyze this debate performance and provide constructive feedback.

Topic: "${topic}"

Full Transcript:
${transcriptText}

Provide feedback in the following JSON format:
{
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "improvements": ["area to improve 1", "area to improve 2", "area to improve 3"],
  "score": [a number from 1-100 representing overall debate performance]
}

Focus on:
- Logical structure and reasoning
- Use of evidence and examples
- Addressing counterarguments
- Clarity and persuasiveness
- Debate technique

Return only valid JSON, no additional text.`;

    const completion = await openai.chat.completions.create({
      model: "deepseek-chat",
      messages: [
        { role: "user", content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 500,
    });

    const text = completion.choices[0].message.content || "";
    
    // Try to parse JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const feedback = JSON.parse(jsonMatch[0]);
      return NextResponse.json(feedback);
    }
    
    // Fallback if JSON parsing fails
    return NextResponse.json({
      strengths: ["Engaged with the topic", "Maintained debate structure"],
      improvements: ["Could provide more specific examples", "Consider addressing counterarguments more directly"],
      score: 70
    });
  } catch (error) {
    console.error("Error generating feedback:", error);
    return NextResponse.json({
      strengths: ["Participated in all rounds", "Stayed on topic"],
      improvements: ["Continue practicing debate techniques"],
      score: 65
    });
  }
}
