// app/api/realtime/route.ts - FOR APP ROUTER
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const model = searchParams.get("model");
    const authorization = request.headers.get("authorization");

    if (!authorization) {
      return NextResponse.json(
        { error: "Authorization header required" },
        { status: 401 }
      );
    }

    if (!model) {
      return NextResponse.json(
        { error: "Model parameter required" },
        { status: 400 }
      );
    }

    console.log("Proxying realtime request to OpenAI with model:", model);

    // Get the raw body (SDP string)
    const body = await request.text();

    console.log("SDP body length:", body.length);
    console.log("SDP starts with:", body.substring(0, 50));

    // Forward the SDP offer to OpenAI
    const response = await fetch(
      `https://api.openai.com/v1/realtime?model=${model}`,
      {
        method: "POST",
        headers: {
          Authorization: authorization,
          "Content-Type": "application/sdp",
        },
        body: body,
      }
    );

    console.log("OpenAI response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI realtime error:", response.status, errorText);
      return NextResponse.json(
        {
          error: `OpenAI API error: ${errorText}`,
        },
        { status: response.status }
      );
    }

    const answerSDP = await response.text();
    console.log("Received answer SDP, length:", answerSDP.length);

    // Return the SDP response
    return new NextResponse(answerSDP, {
      status: 200,
      headers: {
        "Content-Type": "application/sdp",
      },
    });
  } catch (error) {
    console.error("Realtime API error:", error);
    return NextResponse.json(
      {
        error: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
