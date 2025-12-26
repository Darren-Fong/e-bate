import { NextRequest, NextResponse } from "next/server";
import { pusher } from "@/lib/pusher-server";
import { munRooms } from "../create-room/route";

export async function POST(req: NextRequest) {
  try {
    const { roomCode } = await req.json();

    const room = munRooms.get(roomCode);
    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    room.stage = "voting";
    munRooms.set(roomCode, room);

    await pusher.trigger(`mun-room-${roomCode}`, "voting-started", {
      stage: "voting"
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to start voting" }, { status: 500 });
  }
}
