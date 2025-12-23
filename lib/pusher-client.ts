import PusherClient from "pusher-js";

let pusherClient: PusherClient | null = null;

export const getPusherClient = () => {
  if (typeof window === "undefined") {
    // Don't initialize on server-side
    return null;
  }

  if (!pusherClient) {
    const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
    const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;

    if (!key || !cluster) {
      console.warn("Pusher credentials not found");
      return null;
    }

    pusherClient = new PusherClient(key, {
      cluster,
    });
  }

  return pusherClient;
};

export { pusherClient };
