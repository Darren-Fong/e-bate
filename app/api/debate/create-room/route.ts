import { NextRequest, NextResponse } from "next/server";
import { pusher } from "@/lib/pusher-server";

// In-memory storage for rooms (use database in production)
const rooms = new Map<string, { topic: string; creator: string }>();

export async function POST(req: NextRequest) {
  try {
    const { roomCode, topic } = await req.json();

    // Store room data
    rooms.set(roomCode, { topic, creator: "player1" });

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

// Export rooms for other routes to access
export { rooms };
