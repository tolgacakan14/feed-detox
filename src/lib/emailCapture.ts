import type { EmailCaptureData } from "@/types";

/**
 * MVP email capture: logs and holds the signup in memory.
 *
 * To connect Supabase later, replace the body of `saveEmailSignup` with an
 * insert into an `email_signups` table — the function signature and return
 * type can stay the same for every caller (EmailCaptureModal).
 */

const inMemorySignups: EmailCaptureData[] = [];

export async function saveEmailSignup(
  data: EmailCaptureData,
): Promise<{ success: boolean }> {
  inMemorySignups.push(data);
   
  console.log("[emailCapture] new signup", data);
  return { success: true };
}

export function getSignupsForDebug(): EmailCaptureData[] {
  return inMemorySignups;
}
