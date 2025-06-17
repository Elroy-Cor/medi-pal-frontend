import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { query, userId, sessionId } = await request.json();

    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    console.log("Proxying general medical RAG request:", { query, userId });

    // Forward to your backend
    const backendResponse = await fetch(
      `${process.env.BACKEND_URL}/api/general-medical-rag`,
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
      console.error("Backend general medical RAG error:", errorText);
      throw new Error(`Backend error: ${backendResponse.status}`);
    }

    const data = await backendResponse.json();
    console.log("General medical RAG response from backend:", data);

    return NextResponse.json(data);
  } catch (error) {
    console.error("General medical RAG proxy error:", error);
    return NextResponse.json(
      {
        success: false,
        error: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
