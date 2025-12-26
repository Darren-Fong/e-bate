import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(req: NextRequest) {
  const openai = new OpenAI({
    apiKey: process.env.DEEPSEEK_API_KEY,
    baseURL: "https://api.deepseek.com",
  });
  try {
    const { topic, userSide, userArgument, round, conversationHistory } = await req.json();

    const aiSide = userSide === "for" ? "against" : "for";
    
    // Build conversation context
    const historyContext = conversationHistory
      .map((entry: any) => `Round ${entry.round} - ${entry.speaker}: ${entry.text}`)
      .join("\n\n");

    const prompt = `You are participating in a structured debate. 

Topic: "${topic}"
Your position: ${aiSide.toUpperCase()} the topic
Current round: ${round} of 3

${historyContext ? `Previous arguments:\n${historyContext}\n\n` : ""}

The opponent's latest argument (Round ${round}):
${userArgument}

Instructions:
- Present a strong counter-argument ${aiSide} the topic
- Address the opponent's points directly
- Use logical reasoning and examples
- Be persuasive but respectful
- Keep your response to 2-3 paragraphs (150-200 words)
- Match the debate format and tone

Your response:`;

    const completion = await openai.chat.completions.create({
      model: "deepseek-chat",
      messages: [
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 400,
    });

    const response = completion.choices[0].message.content || "Unable to generate response.";
    
    return NextResponse.json({ response });
  } catch (error) {
    console.error("Error generating AI argument:", error);
    return NextResponse.json(
      { error: "Failed to generate AI response. Please try again." },
      { status: 500 }
    );
  }
}
