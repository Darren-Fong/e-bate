// This file is no longer used - AI functions moved to API routes
// Keeping for reference only

export async function generateAIArgument(
  topic: string,
  userSide: "for" | "against",
  userArgument: string,
  round: number,
  conversationHistory: Array<{ speaker: string; text: string; round: number }>
): Promise<string> {
  try {
    const aiSide = userSide === "for" ? "against" : "for";
    
    // Build conversation context
    const historyContext = conversationHistory
      .map((entry) => `Round ${entry.round} - ${entry.speaker}: ${entry.text}`)
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

    return completion.choices[0].message.content || "Unable to generate response.";
  } catch (error) {
    console.error("Error generating AI argument:", error);
    throw new Error("Failed to generate AI response. Please try again.");
  }
}

export async function generateDebateFeedback(
  topic: string,
  transcript: Array<{ speaker: string; text: string; round: number }>
): Promise<{
  strengths: string[];
  improvements: string[];
  score: number;
}> {
  try {
    const transcriptText = transcript
      .map((entry) => `Round ${entry.round} - ${entry.speaker}: ${entry.text}`)
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
      return JSON.parse(jsonMatch[0]);
    }
    
    // Fallback if JSON parsing fails
    return {
      strengths: ["Engaged with the topic", "Maintained debate structure"],
      improvements: ["Could provide more specific examples", "Consider addressing counterarguments more directly"],
      score: 70
    };
  } catch (error) {
    console.error("Error generating feedback:", error);
    return {
      strengths: ["Participated in all rounds", "Stayed on topic"],
      improvements: ["Continue practicing debate techniques"],
      score: 65
    };
  }
}
