import { NextRequest, NextResponse } from "next/server";
import { pusher } from "@/lib/pusher-server";

export async function POST(req: NextRequest) {
  try {
    const { roomCode, username, argument, round } = await req.json();

    // Broadcast argument to all users in room
    await pusher.trigger(`room-${roomCode}`, "argument-submitted", {
      username,
      argument,
      round,
      timestamp: Date.now(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to submit argument" }, { status: 500 });
  }
}
