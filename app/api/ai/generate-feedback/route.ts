import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(req: NextRequest) {
  if (!process.env.DEEPSEEK_API_KEY) {
    return NextResponse.json(
      { error: "API key not configured" },
      { status: 500 }
    );
  }

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
      const raw = JSON.parse(jsonMatch[0]);
      // Normalize score to a number between 0 and 100
      let score = raw.score;
      if (typeof score === 'string') {
        const m = score.match(/(\d{1,3})/);
        score = m ? Number(m[1]) : NaN;
      }
      if (typeof score !== 'number' || isNaN(score)) score = 0;
      if (score < 0) score = 0;
      if (score > 100) score = 100;
      const feedback = {
        strengths: Array.isArray(raw.strengths) ? raw.strengths : [],
        improvements: Array.isArray(raw.improvements) ? raw.improvements : [],
        score,
      };
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
