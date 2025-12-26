import { NextRequest, NextResponse } from "next/server";
import { pusher } from "@/lib/pusher-server";
import { teamRooms } from "../create-room/route";

export async function POST(req: NextRequest) {
  try {
    const { roomCode, speaker, team, speech, speakerIndex } = await req.json();

    const room = teamRooms.get(roomCode);
    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    const speechEntry = { speaker, team, text: speech };
    room.transcript.push(speechEntry);
    room.currentSpeakerIndex = speakerIndex + 1;
    
    teamRooms.set(roomCode, room);

    await pusher.trigger(`team-room-${roomCode}`, "speech-submitted", {
      speaker,
      team,
      speech,
      nextSpeakerIndex: room.currentSpeakerIndex,
      transcript: room.transcript
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to submit speech" }, { status: 500 });
  }
}
