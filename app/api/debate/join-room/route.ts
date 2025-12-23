import { NextRequest, NextResponse } from "next/server";
import { pusher } from "@/lib/pusher-server";

// Shared room storage (in production, use a database)
const rooms = new Map<string, { topic: string; creator: string }>();

export async function POST(req: NextRequest) {
  try {
    const { roomCode, username } = await req.json();

    // Get room info
    const room = rooms.get(roomCode);
    
    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    // Notify room that someone joined
    await pusher.trigger(`room-${roomCode}`, "user-joined", {
      username,
      timestamp: Date.now(),
    });

    // Send room data to the joiner
    await pusher.trigger(`room-${roomCode}`, "room-created", {
      roomCode,
      topic: room.topic,
    });

    return NextResponse.json({ success: true, room });
  } catch (error) {
    console.error("Join room error:", error);
    return NextResponse.json({ error: "Failed to join room" }, { status: 500 });
  }
}

export { rooms };
