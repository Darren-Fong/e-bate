import { NextRequest, NextResponse } from "next/server";
import { pusher } from "@/lib/pusher-server";

const munRooms = new Map();

export async function POST(req: NextRequest) {
  try {
    const { roomCode, topic, creatorCountry, creatorDelegate } = await req.json();

    const roomData = {
      topic,
      createdAt: Date.now(),
      countries: [{ country: creatorCountry, delegate: creatorDelegate }],
      currentSpeakerIndex: 0,
      transcript: [],
      votes: {},
      stage: "debate"
    };

    munRooms.set(roomCode, roomData);

    await pusher.trigger(`mun-room-${roomCode}`, "room-created", {
      topic,
      roomCode,
      roomData
    });

    return NextResponse.json({ success: true, roomCode, roomData });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create MUN room" }, { status: 500 });
  }
}

export { munRooms };
