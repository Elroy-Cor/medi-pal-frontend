// app/api/session/route.ts - FOR APP ROUTER
import { NextResponse } from "next/server";

export async function GET() {
  return POST();
}

export async function POST() {
  try {
    console.log("Creating OpenAI session...");

    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY environment variable is not set");
    }

    const response = await fetch(
      "https://api.openai.com/v1/realtime/sessions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-realtime-preview-2025-06-03",
          voice: "alloy",
          instructions: `You are a helpful AI health assistant. You have access to three specialized functions:

1. ai_insurance_rag: Use this for insurance-related questions (coverage, claims, policies, benefits, copays, deductibles)
2. medical_history_rag: Use this for patient medical history queries (past diagnoses, treatments, test results, medications, allergies)
3. general_medical_rag: Use this for general medical knowledge (symptoms, conditions, treatments, health education, prevention)

Always choose the most appropriate function based on the user's question. Be specific and helpful in your responses.`,

          tools: [
            {
              type: "function",
              name: "ai_insurance_rag",
              description:
                "Search and retrieve insurance information including coverage details, claims status, policy benefits, copays, deductibles, and network providers",
              parameters: {
                type: "object",
                properties: {
                  query: {
                    type: "string",
                    description:
                      "The insurance-related question or topic the user is asking about",
                  },
                },
                required: ["query"],
              },
            },
            {
              type: "function",
              name: "medical_history_rag",
              description:
                "Retrieve patient's medical history including past diagnoses, treatments, test results, medications, allergies, and health records",
              parameters: {
                type: "object",
                properties: {
                  query: {
                    type: "string",
                    description:
                      "The medical history question or specific patient information needed",
                  },
                },
                required: ["query"],
              },
            },
            {
              type: "function",
              name: "general_medical_rag",
              description:
                "Get general medical knowledge including symptoms, conditions, treatments, health education, prevention, and medical terminology",
              parameters: {
                type: "object",
                properties: {
                  query: {
                    type: "string",
                    description:
                      "The general medical question or health information needed",
                  },
                },
                required: ["query"],
              },
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI session creation failed:", errorText);
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log("Session created successfully:", data);

    return NextResponse.json(data);
  } catch (error) {
    console.error("Session creation error:", error);
    return NextResponse.json(
      {
        error: (error as Error).message,
        details: "Failed to create OpenAI session",
      },
      { status: 500 }
    );
  }
}
