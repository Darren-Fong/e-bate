import { NextRequest, NextResponse } from "next/server";
import { pusher } from "@/lib/pusher-server";
import { munRooms } from "../create-room/route";

export async function POST(req: NextRequest) {
  try {
    const { roomCode, country, vote } = await req.json();

    const room = munRooms.get(roomCode);
    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    room.votes[country] = vote;
    munRooms.set(roomCode, room);

    await pusher.trigger(`mun-room-${roomCode}`, "vote-submitted", {
      country,
      vote,
      votes: room.votes
    });

    return NextResponse.json({ success: true, votes: room.votes });
  } catch (error) {
    return NextResponse.json({ error: "Failed to submit vote" }, { status: 500 });
  }
}
