import { NextRequest, NextResponse } from "next/server";
import { pusher } from "@/lib/pusher-server";

const teamRooms = new Map();

export async function POST(req: NextRequest) {
  try {
    const { roomCode, topic, creatorName, creatorTeam } = await req.json();

    const roomData = {
      topic,
      createdAt: Date.now(),
      propositionTeam: creatorTeam === "proposition" ? [creatorName] : [],
      oppositionTeam: creatorTeam === "opposition" ? [creatorName] : [],
      currentSpeakerIndex: 0,
      transcript: []
    };

    teamRooms.set(roomCode, roomData);

    await pusher.trigger(`team-room-${roomCode}`, "room-created", {
      topic,
      roomCode,
      roomData
    });

    return NextResponse.json({ success: true, roomCode, roomData });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create team room" }, { status: 500 });
  }
}

export { teamRooms };
