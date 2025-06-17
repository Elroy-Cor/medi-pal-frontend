import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { query, userId, sessionId } = await request.json();

    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    console.log("Proxying medical history RAG request:", { query, userId });

    // Forward to your backend
    const backendResponse = await fetch(
      `${process.env.BACKEND_URL}/api/medical-history-rag`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(process.env.BACKEND_API_KEY && {
            Authorization: `Bearer ${process.env.BACKEND_API_KEY}`,
          }),
        },
        body: JSON.stringify({ query, userId, sessionId }),
      }
    );

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      console.error("Backend medical history RAG error:", errorText);
      throw new Error(`Backend error: ${backendResponse.status}`);
    }

    const data = await backendResponse.json();
    console.log("Medical history RAG response from backend:", data);

    return NextResponse.json(data);
  } catch (error) {
    console.error("Medical history RAG proxy error:", error);
    return NextResponse.json(
      {
        success: false,
        error: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
