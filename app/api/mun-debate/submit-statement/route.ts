import { NextRequest, NextResponse } from "next/server";
import { pusher } from "@/lib/pusher-server";
import { munRooms } from "../create-room/route";

export async function POST(req: NextRequest) {
  try {
    const { roomCode, country, delegate, statement, speakerIndex } = await req.json();

    const room = munRooms.get(roomCode);
    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    const statementEntry = { country, delegate, text: statement };
    room.transcript.push(statementEntry);
    room.currentSpeakerIndex = speakerIndex + 1;
    
    munRooms.set(roomCode, room);

    await pusher.trigger(`mun-room-${roomCode}`, "statement-submitted", {
      country,
      delegate,
      statement,
      nextSpeakerIndex: room.currentSpeakerIndex,
      transcript: room.transcript
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to submit statement" }, { status: 500 });
  }
}
