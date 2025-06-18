// app/api/session/route.ts
import { NextRequest, NextResponse } from "next/server";

// Configuration constants
const OPENAI_CONFIG = {
  baseUrl: "https://api.openai.com/v1/realtime/sessions",
  model: "gpt-4o-realtime-preview-2025-06-03",
  voice: "alloy",
  timeout: 30000, // 30 seconds
  stream: true,
} as const;

const SYSTEM_INSTRUCTIONS = `You are a helpful AI health assistant with access to three specialized functions:

1. **ai_insurance_rag**: Use for insurance-related questions (coverage, claims, policies, benefits, copays, deductibles, network providers)

2. **medical_history_rag**: Use for patient medical history queries (past diagnoses, treatments, test results, medications, allergies, health records)

3. **medical_report_rag**: Use for medical report queries (medical reports, test results, imaging reports, lab results, etc.)

Guidelines:
- Always select the most appropriate function based on the user's question
- When you receive function call results, read out the complete response exactly as provided
- Do NOT summarize, interpret, or add your own commentary to function results
- Simply read the full function response verbatim to the user
- If the function returns detailed information, read all the details provided
- Maintain patient confidentiality and follow HIPAA guidelines
- If uncertain about medical advice, recommend consulting healthcare professionals
- When no function call is needed, respond in a friendly and engaging tone
- For function call responses, be a direct reader of the information without adding interpretation
- Ensure that the response is in the same language as the user's question, default to english
- If the response gives me code, or gibberish, or anything that is not a valid response, just say "I'm sorry, I can't help with that."
`;

const TOOL_DEFINITIONS = [
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
          minLength: 1,
          maxLength: 500,
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
          minLength: 1,
          maxLength: 500,
        },
      },
      required: ["query"],
    },
  },
  {
    type: "function",
    name: "medical_report_rag",
    description:
      "Retrieve medical reports including test results, imaging reports, lab results, and other medical documents",
    parameters: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description:
            "The medical report question or specific medical document needed",
          minLength: 1,
          maxLength: 500,
        },
      },
      required: ["query"],
    },
  },
] as const;

// Types for better type safety
interface SessionRequestBody {
  voice?: string;
  model?: string;
  customInstructions?: string;
}

interface OpenAISessionResponse {
  id: string;
  object: string;
  model: string;
  expires_at: number;
  [key: string]: unknown;
}

interface ErrorResponse {
  error: string;
  details: string;
  timestamp: string;
  requestId?: string;
}

/**
 * Validates environment variables and throws descriptive errors
 */
function validateEnvironment(): void {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY environment variable is not configured");
  }

  if (process.env.OPENAI_API_KEY.length < 20) {
    throw new Error("OPENAI_API_KEY appears to be invalid (too short)");
  }
}

/**
 * Creates a session with OpenAI Realtime API
 */
async function createOpenAISession(
  options: SessionRequestBody = {}
): Promise<OpenAISessionResponse> {
  validateEnvironment();

  const payload = {
    model: options.model || OPENAI_CONFIG.model,
    voice: options.voice || OPENAI_CONFIG.voice,
    instructions: options.customInstructions
      ? `${SYSTEM_INSTRUCTIONS}\n\nAdditional instructions: ${options.customInstructions}`
      : SYSTEM_INSTRUCTIONS,
    tools: TOOL_DEFINITIONS,
  };

  // Create AbortController for timeout handling
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), OPENAI_CONFIG.timeout);

  try {
    const response = await fetch(OPENAI_CONFIG.baseUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
        "User-Agent": "HealthAssistant-NextJS/1.0",
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;

      try {
        const errorData = await response.json();
        errorMessage =
          errorData.error?.message || errorData.message || errorMessage;
      } catch {
        // If JSON parsing fails, try to get text
        try {
          const errorText = await response.text();
          if (errorText) errorMessage = errorText;
        } catch {
          // Use the default HTTP error message
        }
      }

      throw new Error(`OpenAI API request failed: ${errorMessage}`);
    }

    const sessionData = await response.json();

    // Validate response structure
    if (!sessionData.id || !sessionData.object) {
      throw new Error("Invalid response structure from OpenAI API");
    }

    return sessionData;
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof Error) {
      if (error.name === "AbortError") {
        throw new Error(
          `Request timed out after ${OPENAI_CONFIG.timeout / 1000} seconds`
        );
      }
      throw error;
    }

    throw new Error("Unknown error occurred while creating session");
  }
}

/**
 * Creates a standardized error response
 */
function createErrorResponse(
  error: unknown,
  status: number = 500
): NextResponse<ErrorResponse> {
  const message =
    error instanceof Error ? error.message : "Unknown error occurred";
  const requestId = crypto.randomUUID();

  console.error(`[${requestId}] Session creation error:`, {
    error: message,
    status,
    timestamp: new Date().toISOString(),
  });

  return NextResponse.json(
    {
      error: message,
      details: "Failed to create OpenAI realtime session",
      timestamp: new Date().toISOString(),
      requestId,
    },
    { status }
  );
}

/**
 * GET handler - creates OpenAI realtime session (same as POST)
 */
export async function GET(): Promise<NextResponse> {
  const requestId = crypto.randomUUID();
  console.log(
    `[${requestId}] GET request - creating OpenAI realtime session...`
  );

  try {
    // Create the session with default options
    const sessionData = await createOpenAISession({});

    console.log(`[${requestId}] Session created successfully:`, {
      sessionId: sessionData.id,
      model: sessionData.model,
      expiresAt: new Date(sessionData.expires_at * 1000).toISOString(),
    });

    // Return successful response
    return NextResponse.json({
      ...sessionData,
      requestId,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    // Handle different types of errors with appropriate status codes
    if (error instanceof Error) {
      if (error.message.includes("environment variable")) {
        return createErrorResponse(error, 500); // Server configuration error
      }

      if (error.message.includes("timeout")) {
        return createErrorResponse(error, 504); // Gateway timeout
      }

      if (error.message.includes("OpenAI API request failed")) {
        return createErrorResponse(error, 502); // Bad gateway (upstream error)
      }
    }

    return createErrorResponse(error, 500); // Generic server error
  }
}

/**
 * POST handler - creates OpenAI realtime session
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const requestId = crypto.randomUUID();

  console.log(`[${requestId}] Creating OpenAI realtime session...`);

  try {
    // Parse request body if present
    let requestBody: SessionRequestBody = {};

    try {
      const body = await request.json();
      requestBody = body;

      // Validate request body
      if (requestBody.voice && typeof requestBody.voice !== "string") {
        throw new Error("Invalid voice parameter: must be a string");
      }

      if (requestBody.model && typeof requestBody.model !== "string") {
        throw new Error("Invalid model parameter: must be a string");
      }

      if (
        requestBody.customInstructions &&
        typeof requestBody.customInstructions !== "string"
      ) {
        throw new Error(
          "Invalid customInstructions parameter: must be a string"
        );
      }
    } catch (error) {
      if (error instanceof SyntaxError) {
        // Empty body is acceptable, ignore JSON parse errors
        requestBody = {};
      } else {
        throw error;
      }
    }

    // Create the session
    const sessionData = await createOpenAISession(requestBody);

    console.log(`[${requestId}] Session created successfully:`, {
      sessionId: sessionData.id,
      model: sessionData.model,
      expiresAt: new Date(sessionData.expires_at * 1000).toISOString(),
    });

    // Return successful response
    return NextResponse.json({
      ...sessionData,
      requestId,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    // Handle different types of errors with appropriate status codes
    if (error instanceof Error) {
      if (error.message.includes("environment variable")) {
        return createErrorResponse(error, 500); // Server configuration error
      }

      if (error.message.includes("timeout")) {
        return createErrorResponse(error, 504); // Gateway timeout
      }

      if (
        error.message.includes("Invalid") &&
        error.message.includes("parameter")
      ) {
        return createErrorResponse(error, 400); // Bad request
      }

      if (error.message.includes("OpenAI API request failed")) {
        return createErrorResponse(error, 502); // Bad gateway (upstream error)
      }
    }

    return createErrorResponse(error, 500); // Generic server error
  }
}
