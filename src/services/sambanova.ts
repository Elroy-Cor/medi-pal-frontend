// Remove unused imports
// import { sessionStartedAtom, currentStepIndexAtom } from "@/store/er-session";
// import { getDefaultStore } from "jotai";

interface SambaNovaMessage {
  role: "system" | "user" | "assistant" | "tool";
  content: string;
  tool_call_id?: string;
  tool_calls?: ToolCall[];
}

interface ToolCall {
  id: string;
  type: "function";
  function: {
    name: string;
    arguments: string;
  };
}

interface SambaNovaResponse {
  choices: Array<{
    message: {
      content: string;
      role: string;
      tool_calls?: ToolCall[];
    };
  }>;
}

interface SambaNovaStreamResponse {
  choices: Array<{
    delta: {
      content?: string;
      role?: string;
      tool_calls?: ToolCall[];
    };
  }>;
}

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
- Do not return the response in json format, if there is a json response, return the 'answer' as the string.
`;

const TOOL_DEFINITIONS = [
  {
    type: "function",
    function: {
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
  },
  {
    type: "function",
    function: {
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
  },
  {
    type: "function",
    function: {
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
          },
        },
        required: ["query"],
      },
    },
  },
  // {
  //   type: "function",
  //   function: {
  //     name: "start_emergency_room_experience",
  //     description: "Start the emergency room experience",
  //     parameters: {
  //       type: "object",
  //       properties: {
  //         query: {}
  //       }
  //     },
  //     required: [],
  //   }
  // }
] as const;

// Tool function implementations - replace these with your actual API calls
async function aiInsuranceRag(query: string): Promise<string> {
  try {
    const response = await fetch("/api/insurance-rag", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      throw new Error(`Insurance API error: ${response.status}`);
    }

    const data = await response.json();
    return JSON.stringify(data);
  } catch (error) {
    console.error("Error calling insurance RAG:", error);
    return `Error retrieving insurance information: ${error}`;
  }
}

async function medicalHistoryRag(query: string): Promise<string> {
  try {
    const response = await fetch("/api/medical-history-rag", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      throw new Error(`Medical History API error: ${response.status}`);
    }

    const data = await response.json();
    return JSON.stringify(data);
  } catch (error) {
    console.error("Error calling medical history RAG:", error);
    return `Error retrieving medical history: ${error}`;
  }
}

async function medicalReportRag(query: string): Promise<string> {
  try {
    const response = await fetch("/api/medical-report-rag", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      throw new Error(`Medical Report API error: ${response.status}`);
    }

    const data = await response.json();
    return JSON.stringify(data);
  } catch (error) {
    console.error("Error calling medical report RAG:", error);
    return `Error retrieving medical reports: ${error}`;
  }
}

// async function startEmergencyRoomExperience(query: string): Promise<string> {
//   console.log("Starting emergency room experience"), query;
//   const sessionId = `ER-${Date.now()}-${Math.random()
//     .toString(36)
//     .substr(2, 9)}`;

//   // Get the default store
//   const store = getDefaultStore();

//   // Set the session atoms
//   store.set(sessionStartedAtom, true);
//   store.set(currentStepIndexAtom, 0);

//   return `I've started your emergency room session. Your session ID is ${sessionId}. You'll now be guided through the following steps:
//   1. Hospital Check-in
//   2. Triage Assessment
//   3. Waiting Room
//   4. Medical Examination
//   5. Treatment/Procedure
//   6. Discharge & Follow-up
  
//   Please proceed to the hospital reception and scan the QR code to begin your visit.`;
// }

// Map tool names to functions
const toolFunctions: Record<string, (query: string) => Promise<string>> = {
  'ai_insurance_rag': aiInsuranceRag,
  'medical_history_rag': medicalHistoryRag,
  'medical_report_rag': medicalReportRag,
};

class SambaNovaService {
  private apiKey: string;
  private apiUrl: string;

  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_SAMBANOVA_API_KEY || "";
    this.apiUrl =
      process.env.NEXT_PUBLIC_SAMBANOVA_API_URL ||
      "https://api.sambanova.ai/v1/chat/completions";
  }

  async sendMessage(
    userMessage: string,
    conversationHistory: SambaNovaMessage[] = []
  ): Promise<string> {
    try {
      const systemMessage: SambaNovaMessage = {
        role: "system",
        content: SYSTEM_INSTRUCTIONS,
      };

      const messages: SambaNovaMessage[] = [
        systemMessage,
        ...conversationHistory,
        {
          role: "user",
          content: userMessage,
        },
      ];

      // First API call with tools
      const response = await fetch(this.apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: "Meta-Llama-3.3-70B-Instruct", // Use 70B for better tool calling
          messages: messages,
          temperature: 0.7,
          max_tokens: 1000,
          tools: TOOL_DEFINITIONS, // Include tools here
          tool_choice: "auto", // Let model decide when to use tools
          // stream: false,
        }),
      });

      if (!response.ok) {
        throw new Error(
          `SambaNova API error: ${response.status} ${response.statusText}`
        );
      }

      const data: SambaNovaResponse = await response.json();
      console.log("SambaNova response:", response);
      const assistantMessage = data.choices[0].message;

      // Check if the model wants to use tools
      if (
        assistantMessage.tool_calls &&
        assistantMessage.tool_calls.length > 0
      ) {
        console.log("Tool calls detected:", assistantMessage.tool_calls);

        // Add assistant message with tool calls to conversation
        messages.push({
          role: "assistant",
          content: assistantMessage.content || "",
          tool_calls: assistantMessage.tool_calls,
        });

        // Execute each tool call
        for (const toolCall of assistantMessage.tool_calls) {
          const functionName = toolCall.function.name;
          const functionArgs = JSON.parse(toolCall.function.arguments);

          console.log(
            `Executing tool: ${functionName} with args:`,
            functionArgs
          );

          if (toolFunctions[functionName]) {
            try {
              // Call the appropriate function
              const toolResult = await toolFunctions[functionName](
                functionArgs.query
              );

              // Add tool result to conversation
              messages.push({
                role: "tool",
                tool_call_id: toolCall.id,
                content: toolResult,
              });

              console.log(`Tool ${functionName} result:`, toolResult);
            } catch (error) {
              console.error(`Error executing tool ${functionName}:`, error);
              messages.push({
                role: "tool",
                tool_call_id: toolCall.id,
                content: `Error executing ${functionName}: ${error}`,
              });
            }
          } else {
            console.error(`Unknown tool function: ${functionName}`);
            messages.push({
              role: "tool",
              tool_call_id: toolCall.id,
              content: `Unknown function: ${functionName}`,
            });
          }
        }

        // Second API call with tool results
        const finalResponse = await fetch(this.apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.apiKey}`,
          },
          body: JSON.stringify({
            model: "Meta-Llama-3.3-70B-Instruct",
            messages: messages,
            temperature: 0.7,
            max_tokens: 1000,
          }),
        });

        if (!finalResponse.ok) {
          throw new Error(
            `SambaNova API error: ${finalResponse.status} ${finalResponse.statusText}`
          );
        }

        const finalData: SambaNovaResponse = await finalResponse.json();
        return finalData.choices[0].message.content;
      }

      // No tools needed - return direct response
      return assistantMessage.content;
    } catch (error) {
      console.error("Error calling SambaNova API:", error);
      return "I'm sorry, I'm having trouble connecting to my AI service right now. Please try again in a moment, or contact support if the issue persists.";
    }
  }

  async *sendPatientMessageStream(
    userMessage: string,
    conversationHistory: SambaNovaMessage[] = []
  ): AsyncGenerator<string, void, unknown> {
    try {
      // For streaming with tools, we need to handle it differently
      // If tools might be needed, fall back to non-streaming
      const possibleToolKeywords = [
        'insurance', 'coverage', 'claim', 'policy', 'copay', 'deductible',
        'history', 'diagnosis', 'treatment', 'medication', 'allergy',
        'report', 'test', 'lab', 'imaging', 'result'
      ];

      const mightNeedTools = possibleToolKeywords.some((keyword) =>
        userMessage.toLowerCase().includes(keyword)
      );

      if (mightNeedTools) {
        // Use non-streaming for potential tool calls
        const result = await this.sendMessage(userMessage, conversationHistory);
        yield result;
        return;
      }

      // Continue with streaming for general conversations
      const systemMessage: SambaNovaMessage = {
        role: "system",
        content: SYSTEM_INSTRUCTIONS,
      };

      const messages: SambaNovaMessage[] = [
        systemMessage,
        ...conversationHistory,
        {
          role: "user",
          content: userMessage,
        },
      ];

      const response = await fetch(this.apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: "Meta-Llama-3.1-8B-Instruct",
          messages: messages,
          temperature: 0.7,
          max_tokens: 1000,
          stream: true,
          // Don't include tools for streaming to avoid complications
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error Response:", errorText);
        throw new Error(
          `SambaNova API error: ${response.status} ${response.statusText} - ${errorText}`
        );
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("No response body reader available");
      }

      console.log("Starting to read stream...");
      const decoder = new TextDecoder();
      let buffer = "";

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            console.log("Stream finished");
            break;
          }

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6).trim();

              if (data === "[DONE]") {
                console.log("Stream completed with [DONE]");
                return;
              }

              try {
                const parsed: SambaNovaStreamResponse = JSON.parse(data);
                const content = parsed.choices[0]?.delta?.content;
                if (content) {
                  yield content;
                }
              } catch (parseError) {
                console.error("Error parsing JSON:", parseError);
                // Skip invalid JSON lines
                continue;
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
      }
    } catch (error) {
      console.error("Error streaming from SambaNova API:", error);
      yield "I'm sorry, I'm having trouble connecting to my AI service right now. Please try again in a moment.";
    }
  }
}

export const sambaNovaService = new SambaNovaService();
