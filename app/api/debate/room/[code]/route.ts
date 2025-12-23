import { NextRequest, NextResponse } from "next/server";

// Shared room storage
const rooms = new Map<string, { topic: string; creator: string }>();

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code: roomCode } = await params;
  const room = rooms.get(roomCode);

  if (!room) {
    return NextResponse.json({ error: "Room not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true, room });
}

export { rooms };
