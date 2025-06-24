interface TriageSambaNovaMessage {
  role: "system" | "user" | "assistant" | "tool";
  content: string;
  tool_call_id?: string;
  tool_calls?: TriageToolCall[];
}

interface TriageToolCall {
  id: string;
  type: "function";
  function: {
    name: string;
    arguments: string;
  };
}

interface TriageSambaNovaResponse {
  choices: Array<{
    message: {
      content: string;
      role: string;
      tool_calls?: TriageToolCall[];
    };
  }>;
}

// Form field update interfaces
export interface PatientInfoUpdate {
  name?: string;
  age?: number;
  gender?: "Male" | "Female" | "Other";
  phone?: string;
  address?: string;
  emergencyContact?: string;
}

export interface SymptomsUpdate {
  complaint?: string;
  painLevel?: number;
}

export interface VitalsUpdate {
  systolic?: number;
  diastolic?: number;
  heartRate?: number;
  temperature?: number;
  spo2?: number;
}

export interface MedicalHistoryUpdate {
  allergies?: string;
  medications?: string;
  medicalHistory?: string;
  notes?: string;
}

export interface TriageFormUpdates {
  patientInfo?: PatientInfoUpdate;
  symptoms?: SymptomsUpdate;
  vitals?: VitalsUpdate;
  medicalHistory?: MedicalHistoryUpdate;
}

const TRIAGE_SYSTEM_INSTRUCTIONS = `You are a medical triage assistant that helps nurses fill out patient forms through voice input. Your role is to:

1. Listen to the nurse's voice input about patient information
2. Extract relevant medical data from their speech
3. Use the appropriate tools to update the correct form fields
4. Only call tools when you have specific information to update
5. Be accurate with medical data - if unclear, ask for clarification

Key guidelines:
- Extract patient demographic information (name, age, gender, contact info)
- Identify chief complaints and symptoms
- Record vital signs (blood pressure, heart rate, temperature, SpO2)
- Note medical history, allergies, and current medications
- Always confirm critical medical information
- Use proper medical terminology
- If multiple pieces of information are provided, use multiple tool calls

Examples of voice input you might receive:
- "Patient name is John Smith, age 45, male"
- "Chief complaint is chest pain, pain level 8 out of 10"
- "Blood pressure 140 over 90, heart rate 85"
- "Patient is allergic to penicillin, currently taking lisinopril"

Only use tools when you have specific data to update. Do not make assumptions about missing information.`;

const TRIAGE_TOOL_DEFINITIONS = [
  {
    type: "function",
    function: {
      name: "update_patient_info",
      description: "Update basic patient information including name, age, gender, phone, address, and emergency contact",
      parameters: {
        type: "object",
        properties: {
          name: {
            type: "string",
            description: "Patient's full name"
          },
          age: {
            type: "number",
            description: "Patient's age in years"
          },
          gender: {
            type: "string",
            enum: ["Male", "Female", "Other"],
            description: "Patient's gender"
          },
          phone: {
            type: "string",
            description: "Patient's phone number"
          },
          address: {
            type: "string",
            description: "Patient's address"
          },
          emergencyContact: {
            type: "string",
            description: "Emergency contact name and phone"
          }
        },
        required: []
      }
    }
  },
  {
    type: "function",
    function: {
      name: "update_symptoms",
      description: "Update patient's chief complaint and pain level",
      parameters: {
        type: "object",
        properties: {
          complaint: {
            type: "string",
            description: "Chief complaint or main reason for visit"
          },
          painLevel: {
            type: "number",
            minimum: 0,
            maximum: 10,
            description: "Pain level from 0 (no pain) to 10 (severe pain)"
          }
        },
        required: []
      }
    }
  },
  {
    type: "function",
    function: {
      name: "update_vitals",
      description: "Update patient's vital signs including blood pressure, heart rate, temperature, and oxygen saturation",
      parameters: {
        type: "object",
        properties: {
          systolic: {
            type: "number",
            description: "Systolic blood pressure in mmHg"
          },
          diastolic: {
            type: "number",
            description: "Diastolic blood pressure in mmHg"
          },
          heartRate: {
            type: "number",
            description: "Heart rate in beats per minute"
          },
          temperature: {
            type: "number",
            description: "Body temperature in Celsius"
          },
          spo2: {
            type: "number",
            description: "Oxygen saturation percentage"
          }
        },
        required: []
      }
    }
  },
  {
    type: "function",
    function: {
      name: "update_medical_history",
      description: "Update patient's medical information including allergies, medications, and medical history",
      parameters: {
        type: "object",
        properties: {
          allergies: {
            type: "string",
            description: "Patient's known allergies"
          },
          medications: {
            type: "string",
            description: "Current medications"
          },
          medicalHistory: {
            type: "string",
            description: "Relevant medical history"
          },
          notes: {
            type: "string",
            description: "Additional notes"
          }
        },
        required: []
      }
    }
  }
] as const;

class TriageSambaNovaService {
  private apiKey: string;
  private apiUrl: string;

  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_SAMBANOVA_API_KEY || "";
    this.apiUrl =
      process.env.NEXT_PUBLIC_SAMBANOVA_API_URL ||
      "https://api.sambanova.ai/v1/chat/completions";
  }

  async processVoiceInput(
    voiceText: string,
    onFormUpdate: (updates: TriageFormUpdates) => void
  ): Promise<string> {
    try {
      const systemMessage: TriageSambaNovaMessage = {
        role: "system",
        content: TRIAGE_SYSTEM_INSTRUCTIONS,
      };

      const messages: TriageSambaNovaMessage[] = [
        systemMessage,
        {
          role: "user",
          content: voiceText,
        },
      ];

      console.log("Processing voice input:", voiceText);

      // First API call with tools
      const response = await fetch(this.apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: "Meta-Llama-3.3-70B-Instruct",
          messages: messages,
          temperature: 0.1, // Lower temperature for accuracy
          max_tokens: 1000,
          tools: TRIAGE_TOOL_DEFINITIONS,
          tool_choice: "auto",
        }),
      });

      if (!response.ok) {
        throw new Error(
          `SambaNova API error: ${response.status} ${response.statusText}`
        );
      }

      const data: TriageSambaNovaResponse = await response.json();
      const assistantMessage = data.choices[0].message;

      // Check if the model wants to use tools
      if (
        assistantMessage.tool_calls &&
        assistantMessage.tool_calls.length > 0
      ) {
        console.log("Tool calls detected:", assistantMessage.tool_calls);

        const formUpdates: TriageFormUpdates = {};

        // Process each tool call and collect updates
        for (const toolCall of assistantMessage.tool_calls) {
          const functionName = toolCall.function.name;
          const functionArgs = JSON.parse(toolCall.function.arguments);

          console.log(
            `Processing tool: ${functionName} with args:`,
            functionArgs
          );

          switch (functionName) {
            case "update_patient_info":
              formUpdates.patientInfo = functionArgs as PatientInfoUpdate;
              break;
            case "update_symptoms":
              formUpdates.symptoms = functionArgs as SymptomsUpdate;
              break;
            case "update_vitals":
              formUpdates.vitals = functionArgs as VitalsUpdate;
              break;
            case "update_medical_history":
              formUpdates.medicalHistory = functionArgs as MedicalHistoryUpdate;
              break;
            default:
              console.warn(`Unknown tool function: ${functionName}`);
          }
        }

        // Apply the form updates
        if (Object.keys(formUpdates).length > 0) {
          console.log("Applying form updates:", formUpdates);
          onFormUpdate(formUpdates);
        }

        // Return confirmation message
        return this.generateConfirmationMessage(formUpdates);
      }

      // No tools needed - return direct response
      return assistantMessage.content || "I understand. Please provide more specific information to update the form.";
    } catch (error) {
      console.error("Error processing voice input:", error);
      return "I'm sorry, I had trouble processing that. Could you please repeat the information?";
    }
  }

  private generateConfirmationMessage(updates: TriageFormUpdates): string {
    const confirmations: string[] = [];

    if (updates.patientInfo) {
      const info = updates.patientInfo;
      if (info.name) confirmations.push(`✓ Name: ${info.name}`);
      if (info.age) confirmations.push(`✓ Age: ${info.age} years`);
      if (info.gender) confirmations.push(`✓ Gender: ${info.gender}`);
      if (info.phone) confirmations.push(`✓ Phone: ${info.phone}`);
      if (info.address) confirmations.push(`✓ Address: ${info.address}`);
      if (info.emergencyContact) confirmations.push(`✓ Emergency contact: ${info.emergencyContact}`);
    }

    if (updates.symptoms) {
      const symptoms = updates.symptoms;
      if (symptoms.complaint) confirmations.push(`✓ Chief complaint: ${symptoms.complaint}`);
      if (symptoms.painLevel !== undefined) confirmations.push(`✓ Pain level: ${symptoms.painLevel}/10`);
    }

    if (updates.vitals) {
      const vitals = updates.vitals;
      if (vitals.systolic && vitals.diastolic) {
        confirmations.push(`✓ Blood pressure: ${vitals.systolic}/${vitals.diastolic} mmHg`);
      }
      if (vitals.heartRate) confirmations.push(`✓ Heart rate: ${vitals.heartRate} bpm`);
      if (vitals.temperature) confirmations.push(`✓ Temperature: ${vitals.temperature}°C`);
      if (vitals.spo2) confirmations.push(`✓ SpO2: ${vitals.spo2}%`);
    }

    if (updates.medicalHistory) {
      const history = updates.medicalHistory;
      if (history.allergies) confirmations.push(`✓ Allergies: ${history.allergies}`);
      if (history.medications) confirmations.push(`✓ Medications: ${history.medications}`);
      if (history.medicalHistory) confirmations.push(`✓ Medical history: ${history.medicalHistory}`);
      if (history.notes) confirmations.push(`✓ Notes: ${history.notes}`);
    }

    if (confirmations.length === 0) {
      return "I understand. Please provide more specific information to update the form.";
    }

    return `Updated the following information:\n\n${confirmations.join('\n')}`;
  }
}

export const triageSambaNovaService = new TriageSambaNovaService();