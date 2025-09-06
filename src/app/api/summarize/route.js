import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // make sure to set this in .env
});

export async function POST(req) {
  try {
    const { postTitle, comments } = await req.json();

    if (!postTitle || !comments) {
      return NextResponse.json({ error: "Missing postTitle or comments" }, { status: 400 });
    }

    // Prepare the prompt for AI
    const prompt = `
Summarize the following Reddit thread into 3-5 concise bullet points. 
Focus on key insights, opinions, or discussion highlights.

Post Title: ${postTitle}
Comments:
${comments.join("\n")}
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // or "gpt-4" if available
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 300,
    });

    const summary = completion.choices[0].message.content.trim();

    return NextResponse.json({ summary });
  } catch (error) {
    console.error("Error in /api/summarize:", error);
    return NextResponse.json({ error: "Failed to summarize thread." }, { status: 500 });
  }
}