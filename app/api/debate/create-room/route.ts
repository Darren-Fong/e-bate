import { NextRequest, NextResponse } from "next/server";
import { pusher } from "@/lib/pusher-server";
import { rooms } from "@/lib/room-storage";

export async function POST(req: NextRequest) {
  try {
    const { roomCode, topic } = await req.json();

    // Store room data
    rooms.set(roomCode, { topic, creator: "player1", createdAt: Date.now() });

    // Trigger event to notify room was created
    await pusher.trigger(`room-${roomCode}`, "room-created", {
      topic,
      roomCode,
    });

    return NextResponse.json({ success: true, roomCode });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create room" }, { status: 500 });
  }
}
