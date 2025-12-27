import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/nextjs/server";

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error("Please add CLERK_WEBHOOK_SECRET to .env.local");
  }

  // Get the headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error: Missing svix headers", { status: 400 });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Error: Verification failed", { status: 400 });
  }

  // Handle user.created event - auto-assign free tier
  if (evt.type === "user.created") {
    try {
      const client = await clerkClient();
      await client.users.updateUserMetadata(evt.data.id, {
        publicMetadata: {
          tier: "free"
        }
      });
      
      console.log(`[Webhook] Auto-assigned "free" tier to new user: ${evt.data.id}`);
    } catch (error) {
      console.error("Error updating user metadata:", error);
      return new Response("Error: Failed to assign tier", { status: 500 });
    }
  }

  // Send a welcome email to the new user (if we have Resend configured)
  if (evt.type === "user.created") {
    try {
      const client = await clerkClient();
      // Fetch full user details to find an email address
      const user = await client.users.getUser(evt.data.id);
      const email = (user?.emailAddresses || []).find((e: any) => e.primary)?.emailAddress || (user?.emailAddresses || [])[0]?.emailAddress;

      if (!email) {
        console.log(`[Webhook] No email found for new user ${evt.data.id}, skipping welcome email.`);
      } else if (!process.env.RESEND_API_KEY) {
        console.log('[Webhook] RESEND_API_KEY not configured; skipping welcome email.');
      } else {
        const resendApiKey = process.env.RESEND_API_KEY;
        const from = process.env.RESEND_FROM_EMAIL || "E-Bate <onboarding@resend.dev>";
        const subject = "Welcome to E‑Bate!";
        const html = `
        <p>Hi!</p>
        <p>My name is Darren Fong, the Developer of <strong>E-Bate</strong> — an online debate training platform with AI integration.</p>
        <p>You're all set to start your debate journey on our platform!</p>
        <p>On <strong>E‑Bate</strong>, you can:</p>
        <ul>
        <li>Practice structured debates with timed rounds and custom topics.</li>
        <li>Track your progress with AI feedback and scores.</li>
        <li>Team up and debate in real-time with others.</li>
        </ul>
        <p>We believe debating is more than just winning arguments — it’s about sharpening critical thinking, improving communication, and building confidence. Whether you’re a beginner or an experienced speaker, E‑Bate adapts to your journey!</p>
        <p>If you have any questions or want to contribute, please visit the <a href="https://e-bate.vercel.app/contact">Contact</a> page to get in touch.</p>
        <p>Good luck and happy debating!</p>
        <p>Best regards,<br/>Darren Fong<br/>E‑Bate Developer</p>
        `;

        try {
          await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${resendApiKey}`,
            },
            body: JSON.stringify({
              from,
              to: email,
              subject,
              html,
            }),
          });
          console.log(`[Webhook] Sent welcome email to ${email}`);
        } catch (err) {
          console.error('Error sending welcome email:', err);
        }
      }
    } catch (err) {
      console.error('Error in welcome-email flow for user.created webhook:', err);
    }
  }

  return new Response("Webhook processed", { status: 200 });
}
