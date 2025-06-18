import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { query, userId } = await request.json();

    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    console.log("Proxying medical report RAG request:", { query, userId });

    // Forward to your backend
    const backendResponse = await fetch(
      'https://cipz15o8wk.execute-api.us-west-2.amazonaws.com/prod/report_query?Content-Type=application/json',
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question: query }),
      }
    );

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      console.error("Backend medical report RAG error:", errorText);
      throw new Error(`Backend error: ${backendResponse.status}`);
    }

    const data = await backendResponse.json();
    console.log("Medical report RAG response from backend:", data);

    // Return the backend response directly
    return NextResponse.json({
      success: true,
      data: data.answer,
      question: data.question,
    });
  } catch (error) {
    console.error("Medical report RAG proxy error:", error);
    return NextResponse.json(
      {
        success: false,
        error: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
