import { NextRequest, NextResponse } from "next/server";
import { pusher } from "@/lib/pusher-server";
import { munRooms } from "../create-room/route";

export async function POST(req: NextRequest) {
  try {
    const { roomCode, country, delegate } = await req.json();

    const room = munRooms.get(roomCode);
    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    // Check if country already exists
    if (room.countries.some((c: any) => c.country === country)) {
      return NextResponse.json({ error: "Country already in session" }, { status: 400 });
    }

    room.countries.push({ country, delegate });
    munRooms.set(roomCode, room);

    await pusher.trigger(`mun-room-${roomCode}`, "country-joined", {
      country,
      delegate,
      roomData: room
    });

    return NextResponse.json({ success: true, roomData: room });
  } catch (error) {
    return NextResponse.json({ error: "Failed to join MUN room" }, { status: 500 });
  }
}
