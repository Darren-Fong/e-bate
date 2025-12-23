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

    // Also send back room info to the joiner
    // In a real app, you'd fetch the topic from a database
    // For now, we'll trigger room-created so they get the topic
    await pusher.trigger(`room-${roomCode}`, "room-created", {
      roomCode,
      topic: "Debate Topic", // Player 2 will receive this
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to join room" }, { status: 500 });
  }
}
