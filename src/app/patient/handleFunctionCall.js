export default async function handleFunctionCall(eventData, dataChannel) {
  console.log("OpenAI wants to call function:", eventData);

  try {
    const parsedArgs = JSON.parse(eventData.arguments);
    const query = parsedArgs.query;
    let apiRoute = "";

    // Map OpenAI function names to your Next.js API routes
    switch (eventData.name) {
      case "ai_insurance_rag":
        apiRoute = "/api/insurance-rag";
        break;

      case "medical_history_rag":
        apiRoute = "/api/medical-history-rag";
        break;

      case "general_medical_rag":
        apiRoute = "/api/general-medical-rag";
        break;

      default:
        throw new Error(`Unknown function: ${eventData.name}`);
    }

    console.log(
      `Calling Next.js API route: ${apiRoute} with query: "${query}"`
    );

    // Call your Next.js API route (which will proxy to your backend)
    const response = await fetch(apiRoute, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: query,
        userId: getUserId(), // Get from your auth context
        sessionId: getSessionId(), // Generate or get from context
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `API route failed: ${response.status} - ${errorData.error}`
      );
    }

    const responseData = await response.json();
    console.log(
      `Function ${eventData.name} completed successfully:`,
      responseData
    );

    // Send the result back to OpenAI
    dataChannel.send(
      JSON.stringify({
        type: "conversation.item.create",
        item: {
          type: "function_call_output",
          call_id: eventData.call_id,
          output: JSON.stringify(responseData),
        },
      })
    );

    // Tell OpenAI to generate a response based on the function result
    dataChannel.send(
      JSON.stringify({
        type: "response.create",
      })
    );
  } catch (error) {
    console.error("Function call error:", error);

    // Send error back to OpenAI so it can respond appropriately
    dataChannel.send(
      JSON.stringify({
        type: "conversation.item.create",
        item: {
          type: "function_call_output",
          call_id: eventData.call_id,
          output: JSON.stringify({
            error: error.message,
            success: false,
          }),
        },
      })
    );

    dataChannel.send(
      JSON.stringify({
        type: "response.create",
      })
    );
  }
}

// Helper functions (implement based on your auth system)
function getUserId() {
  // Get current user ID from your authentication context
  return "user_123"; // Replace with actual implementation
}

function getSessionId() {
  // Generate or retrieve session ID
  return Date.now().toString(); // Replace with actual session management
}
