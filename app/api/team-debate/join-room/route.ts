import { NextRequest, NextResponse } from "next/server";
import { pusher } from "@/lib/pusher-server";
import { teamRooms } from "../create-room/route";

export async function POST(req: NextRequest) {
  try {
    const { roomCode, playerName, team } = await req.json();

    const room = teamRooms.get(roomCode);
    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    // Check if team is full (max 3 per team)
    if (team === "proposition" && room.propositionTeam.length >= 3) {
      return NextResponse.json({ error: "Proposition team is full" }, { status: 400 });
    }
    if (team === "opposition" && room.oppositionTeam.length >= 3) {
      return NextResponse.json({ error: "Opposition team is full" }, { status: 400 });
    }

    // Add player to team
    if (team === "proposition") {
      room.propositionTeam.push(playerName);
    } else {
      room.oppositionTeam.push(playerName);
    }

    teamRooms.set(roomCode, room);

    await pusher.trigger(`team-room-${roomCode}`, "player-joined", {
      playerName,
      team,
      roomData: room
    });

    return NextResponse.json({ success: true, roomData: room });
  } catch (error) {
    return NextResponse.json({ error: "Failed to join team room" }, { status: 500 });
  }
}
