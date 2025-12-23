import { NextRequest, NextResponse } from "next/server";

// Shared room storage
const rooms = new Map<string, { topic: string; creator: string }>();

export async function GET(
  req: NextRequest,
  { params }: { params: { code: string } }
) {
  const roomCode = params.code;
  const room = rooms.get(roomCode);

  if (!room) {
    return NextResponse.json({ error: "Room not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true, room });
}

export { rooms };
