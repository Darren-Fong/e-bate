// Shared in-memory storage for debate rooms
// In production, replace this with a database

export interface Room {
  topic: string;
  creator: string;
  createdAt: number;
}

export const rooms = new Map<string, Room>();
