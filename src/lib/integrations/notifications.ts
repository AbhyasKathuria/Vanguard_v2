/**
 * Push Notifications Dispatcher for VANGUARD
 * Utilizes Firebase Cloud Messaging (FCM) when configured,
 * with structured in-app logging / fallback.
 */

export interface NotificationPayload {
  recipientPhone: string;
  recipientRole?: string;
  title: string;
  body: string;
  requestId?: string;
  actionUrl?: string;
}

export async function sendPushNotification(payload: NotificationPayload): Promise<{ success: boolean; provider: string }> {
  // Check if Firebase server key / access token is configured
  const fcmServerKey = process.env.FIREBASE_SERVER_KEY || process.env.FCM_SERVER_KEY;

  if (fcmServerKey) {
    try {
      const res = await fetch("https://fcm.googleapis.com/fcm/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `key=${fcmServerKey}`,
        },
        body: JSON.stringify({
          to: `/topics/${payload.recipientPhone}`,
          notification: {
            title: payload.title,
            body: payload.body,
            click_action: payload.actionUrl || "http://localhost:3000",
          },
          data: {
            requestId: payload.requestId,
          },
        }),
      });

      if (res.ok) {
        return { success: true, provider: "Firebase Cloud Messaging (FCM)" };
      }
    } catch (err) {
      console.warn("FCM dispatch failed, logging notification:", err);
    }
  }

  // Graceful in-app notification fallback
  console.log(
    `🔔 [VANGUARD Push Notification] To: ${payload.recipientPhone} (${payload.recipientRole || "User"}) | Title: "${payload.title}" | Body: "${payload.body}"`
  );

  return { success: true, provider: "In-App Event Dispatcher (Fallback)" };
}
