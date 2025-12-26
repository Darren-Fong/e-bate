import { NextRequest, NextResponse } from "next/server";
import { teamRooms } from "../../create-room/route";

export async function GET(
  req: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const roomCode = params.code;
    const room = teamRooms.get(roomCode);

    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, roomData: room });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch room" }, { status: 500 });
  }
}
