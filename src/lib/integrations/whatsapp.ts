/**
 * WhatsApp Business Cloud API Integration for VANGUARD
 * Sends template messages and replies via Meta Graph API if WHATSAPP_ACCESS_TOKEN is present,
 * or logs to console as a safe mock fallback.
 */

export interface WhatsAppMessagePayload {
  toPhone: string;
  text: string;
  templateName?: string;
}

export async function sendWhatsAppMessage(payload: WhatsAppMessagePayload): Promise<{ success: boolean; provider: string }> {
  const token = process.env.WHATSAPP_ACCESS_TOKEN || process.env.META_WA_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID || process.env.META_PHONE_ID;

  if (token && phoneNumberId) {
    try {
      const cleanPhone = payload.toPhone.replace(/\D/g, "");
      const res = await fetch(`https://graph.facebook.com/v19.0/${phoneNumberId}/messages`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to: cleanPhone.startsWith("91") ? cleanPhone : `91${cleanPhone}`,
          type: "text",
          text: { preview_url: false, body: payload.text },
        }),
      });

      if (res.ok) {
        return { success: true, provider: "Meta WhatsApp Cloud API (Live)" };
      }
    } catch (err) {
      console.warn("WhatsApp Cloud API dispatch error, logging message:", err);
    }
  }

  // Mock logging fallback
  console.log(`💬 [VANGUARD WhatsApp Service] Message to +${payload.toPhone}:\n"${payload.text}"`);
  return { success: true, provider: "WhatsApp Mock Dispatcher (Dev Safe)" };
}
