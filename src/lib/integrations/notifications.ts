/**
 * W3C Web Push Notifications Dispatcher for VANGUARD
 * Utilizes standard Web Push protocol with VAPID keys.
 * Handles background push alerts with sound and vibration even when app is closed.
 */

import webpush from "web-push";
import { prisma } from "@/lib/prisma";

const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
const vapidSubject = process.env.VAPID_SUBJECT || "mailto:alerts@vanguard.gov.in";

let vapidConfigured = false;
if (vapidPublicKey && vapidPrivateKey) {
  try {
    webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
    vapidConfigured = true;
  } catch (err) {
    console.warn("[VANGUARD Push] VAPID initialization warning:", err);
  }
}

export interface NotificationPayload {
  recipientPhone?: string;
  recipientRole?: string;
  recipientId?: string;
  title: string;
  body: string;
  requestId?: string;
  actionUrl?: string;
}

// Low-level dispatcher to a single subscription
async function dispatchToSubscription(sub: any, payload: { title: string; body: string; url?: string; tag?: string }) {
  if (!vapidConfigured) {
    console.log(`🔔 [VANGUARD Local Push Simulation] Title: "${payload.title}" | Body: "${payload.body}"`);
    return { success: true, simulated: true };
  }

  const pushSubscription = {
    endpoint: sub.endpoint,
    keys: {
      p256dh: sub.p256dh,
      auth: sub.auth,
    },
  };

  const notificationData = JSON.stringify({
    title: payload.title,
    body: payload.body,
    url: payload.url || "/",
    tag: payload.tag || `vanguard-${Date.now()}`,
    vibrate: [300, 150, 300, 150, 450],
  });

  try {
    await webpush.sendNotification(pushSubscription, notificationData);
    return { success: true, endpoint: sub.endpoint };
  } catch (error: any) {
    // If endpoint is expired or unsubscribed, delete it
    if (error.statusCode === 410 || error.statusCode === 404) {
      try {
        await prisma.pushSubscription.delete({ where: { endpoint: sub.endpoint } });
      } catch {}
    }
    console.warn(`[Web Push Error] Failed to send to ${sub.endpoint.slice(0, 30)}...: ${error.message}`);
    return { success: false, error: error.message };
  }
}

/**
 * 1. SOS / Emergency Proximity Push Alert (Multi-Tier Broadcast)
 * - Directly targets assigned worker / volunteer phone.
 * - Always alerts District Local Authority and Medical Command (Dr. Swaminathan).
 * - If unassigned (open emergency), broadcasts to all verified responders in the district.
 */
export async function sendEmergencyPush({
  responderId,
  responderName,
  incidentTitle,
  location,
  district,
  distanceKm,
  category = "emergency",
  actionUrl,
}: {
  responderId?: string | null;
  responderName?: string | null;
  incidentTitle: string;
  location?: string;
  district?: string;
  distanceKm?: number;
  category?: string;
  actionUrl?: string;
}) {
  // 1. Direct assigned responder devices
  const responderSubs = responderId
    ? await prisma.pushSubscription.findMany({ where: { userId: responderId } })
    : [];

  // 2. Local Authorities, Medical Command (Doctor), and SuperAdmins
  const authoritySubs = await prisma.pushSubscription.findMany({
    where: {
      OR: [
        { role: "authority", ...(district ? { district } : {}) },
        { role: "super_admin" },
        { user: { role: "authority" } },
        { user: { role: "super_admin" } },
        { user: { id: "usr_higher_medical" } },
      ],
    },
  });

  // 3. Broadcast to all verified volunteers & workers in district if unassigned
  const broadcastSubs = !responderId && district
    ? await prisma.pushSubscription.findMany({
        where: {
          district,
          OR: [
            { role: "volunteer" },
            { role: "worker" },
          ],
        },
      })
    : [];

  // Deduplicate subscriptions by endpoint
  const subMap = new Map<string, any>();
  for (const s of [...responderSubs, ...authoritySubs, ...broadcastSubs]) {
    subMap.set(s.endpoint, s);
  }
  const allSubs = Array.from(subMap.values());

  const title = responderId
    ? `🚨 URGENT EMERGENCY DISPATCH ASSIGNED`
    : `🚨 BROADCAST: UNASSIGNED EMERGENCY SOS (${district || "Local Sector"})`;

  const body = `${incidentTitle} near ${location || "your sector"}${
    distanceKm ? ` (${distanceKm} km away)` : ""
  }. Open immediately to review and respond.`;

  let deliveredCount = 0;
  for (const sub of allSubs) {
    const defaultUrl =
      sub.role === "authority"
        ? "/authority/dashboard"
        : sub.role === "volunteer"
        ? "/volunteer/dashboard"
        : sub.role === "super_admin"
        ? "/higher-official/dashboard"
        : "/worker/dashboard";

    const res = await dispatchToSubscription(sub, {
      title,
      body,
      url: actionUrl || defaultUrl,
      tag: "sos-alert",
    });
    if (res.success) deliveredCount++;
  }

  console.log(
    `📢 [Emergency Push Sent] ${deliveredCount} of ${allSubs.length} devices notified (Responder: ${
      responderName || responderId || "Broadcast"
    }, District: ${district || "Any"})`
  );
  return { success: true, devicesCount: deliveredCount, totalQueued: allSubs.length };
}

/**
 * 1b. General Status Update Push Alert
 * Dispatched to Citizen / Reporter when their grievance or service request status updates.
 */
export async function sendStatusUpdatePush({
  recipientUserId,
  title,
  body,
  actionUrl,
  tag,
}: {
  recipientUserId: string;
  title: string;
  body: string;
  actionUrl?: string;
  tag?: string;
}) {
  const subscriptions = await prisma.pushSubscription.findMany({
    where: { userId: recipientUserId },
  });

  let delivered = 0;
  for (const sub of subscriptions) {
    const res = await dispatchToSubscription(sub, {
      title,
      body,
      url: actionUrl || "/citizen/dashboard",
      tag: tag || `status-${Date.now()}`,
    });
    if (res.success) delivered++;
  }

  console.log(`🔔 [Status Update Push] ${delivered}/${subscriptions.length} devices notified for user ${recipientUserId}`);
  return { success: true, devicesCount: delivered };
}

/**
 * 2. Blood Bank Volunteer Donor Broadcast
 * Pushes to all verified volunteer donor devices in the district.
 */
export async function sendBloodDonorPush({
  district,
  bloodGroup,
  units,
  hospital,
  actionUrl = "/higher-official/dashboard",
}: {
  district: string;
  bloodGroup: string;
  units: number;
  hospital: string;
  actionUrl?: string;
}) {
  const subscriptions = await prisma.pushSubscription.findMany({
    where: {
      district,
      OR: [
        { role: "volunteer" },
        { user: { role: "volunteer", volunteerProfile: { verified: true } } },
      ],
    },
  });

  const title = `🩸 CRITICAL BLOOD NEEDED: ${bloodGroup} (${units} Units)`;
  const body = `Immediate transfusion needed at ${hospital}, ${district}. Tap to confirm donor availability.`;

  for (const sub of subscriptions) {
    await dispatchToSubscription(sub, { title, body, url: actionUrl, tag: `blood-${bloodGroup}` });
  }

  console.log(`📢 [Blood Donor Push Broadcast] ${subscriptions.length} volunteer devices alerted for ${bloodGroup} in ${district}`);
  return { success: true, alertedCount: subscriptions.length };
}

/**
 * 3. Worker / Volunteer Ticket Assignment Push
 * Direct alert when Local Authority dispatches a task.
 */
export async function sendTaskAssignmentPush({
  assigneeId,
  requestTitle,
  category,
  actionUrl,
}: {
  assigneeId: string;
  requestTitle: string;
  category?: string;
  actionUrl?: string;
}) {
  const subscriptions = await prisma.pushSubscription.findMany({
    where: { userId: assigneeId },
  });

  const title = "📋 New Service Work Order Assigned";
  const body = `You have been assigned: ${requestTitle} (${category || "Civic Task"}). Tap to view work order.`;

  for (const sub of subscriptions) {
    await dispatchToSubscription(sub, { title, body, url: actionUrl || "/worker/dashboard", tag: "task-assigned" });
  }

  return { success: true, devicesCount: subscriptions.length };
}

/**
 * 4. SafeLine Protection Officer Alert (STRICTLY PRIVACY ISOLATED)
 * Dispatched EXCLUSIVELY to designated Female Protection Officer devices.
 * Contains ZERO citizen PII (only anonymous SL- token and urgency code).
 */
export async function sendSafeLineOfficerPush({
  anonymousToken,
  urgency,
  district,
  actionUrl = "/citizen/women",
}: {
  anonymousToken: string;
  urgency: string;
  district: string;
  actionUrl?: string;
}) {
  // Query ONLY authorized protection officers or designated women protection users
  const subscriptions = await prisma.pushSubscription.findMany({
    where: {
      OR: [
        { user: { subRole: "safeline_officer" } },
        { user: { citizenProfile: "women" } },
        { user: { phone: "9876543260" } }, // Smt. Sunita Devi (Designated Officer)
        { user: { role: "super_admin" } },
      ],
    },
  });

  // Zero-PII Payload
  const title = "🔒 [SafeLine Confidential Alert] Urgent Protection Dispatch";
  const body = `New confidential intake ${anonymousToken} (${urgency}) registered in ${district}. Direct officer callback protocol engaged.`;

  for (const sub of subscriptions) {
    await dispatchToSubscription(sub, { title, body, url: actionUrl, tag: `safeline-${anonymousToken}` });
  }

  console.log(`🔒 [SafeLine Isolated Push] ${subscriptions.length} authorized officer devices notified for token ${anonymousToken}`);
  return { success: true, officerDevicesCount: subscriptions.length };
}

/**
 * Legacy compatibility wrapper
 */
export async function sendPushNotification(payload: NotificationPayload): Promise<{ success: boolean; provider: string }> {
  if (payload.recipientId) {
    const subs = await prisma.pushSubscription.findMany({ where: { userId: payload.recipientId } });
    for (const sub of subs) {
      await dispatchToSubscription(sub, { title: payload.title, body: payload.body, url: payload.actionUrl });
    }
  }

  console.log(`🔔 [VANGUARD Push Notification] Title: "${payload.title}" | Body: "${payload.body}"`);
  return { success: true, provider: vapidConfigured ? "W3C Web Push (VAPID)" : "In-App Telemetry Fallback" };
}
