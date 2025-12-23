import { NextRequest, NextResponse } from "next/server";
import { pusher } from "@/lib/pusher-server";

export async function POST(req: NextRequest) {
  try {
    const { roomCode, username } = await req.json();

    // Notify room that someone joined
    await pusher.trigger(`room-${roomCode}`, "user-joined", {
      username,
      timestamp: Date.now(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to join room" }, { status: 500 });
  }
}
