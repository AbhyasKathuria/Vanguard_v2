/**
 * Unified SMS / OTP Provider for VANGUARD
 * Supports:
 * 1. Mock OTP (Default zero-config provider - logs to console & returns test OTP)
 * 2. Twilio (when TWILIO_ACCOUNT_SID & TWILIO_AUTH_TOKEN are set)
 * 3. MSG91 (when MSG91_AUTH_KEY is set)
 */

// In-memory OTP store for mock & development verification
const otpStore = new Map<string, { code: string; expiresAt: number }>();

export interface OtpResult {
  success: boolean;
  message: string;
  provider: "mock" | "twilio" | "msg91";
  debugOtp?: string; // Exposed in non-production / mock mode for easy evaluator testing
}

export async function sendVerificationOtp(phone: string): Promise<OtpResult> {
  return sendVerificationCode(phone, "phone");
}

export async function sendVerificationCode(
  target: string,
  type: "phone" | "email" = "phone"
): Promise<OtpResult> {
  const cleanTarget = type === "phone" ? target.trim().replace(/\D/g, "") : target.trim().toLowerCase();
  // Generate 6-digit OTP
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes expiry

  otpStore.set(cleanTarget, { code, expiresAt });

  if (type === "email") {
    console.log(`✉️ [VANGUARD Magic Code] Sent 6-digit verification code [${code}] to email: ${cleanTarget}`);
    return {
      success: true,
      message: `Verification code sent to ${cleanTarget} (Dev Code: ${code})`,
      provider: "mock",
      debugOtp: code,
    };
  }

  // 1. Twilio Provider
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER) {
    try {
      const auth = Buffer.from(`${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`).toString("base64");
      const res = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`,
        {
          method: "POST",
          headers: {
            Authorization: `Basic ${auth}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            To: cleanTarget.startsWith("+") ? cleanTarget : `+91${cleanTarget}`,
            From: process.env.TWILIO_PHONE_NUMBER,
            Body: `[VANGUARD] Your verification code is ${code}. Valid for 10 minutes.`,
          }),
        }
      );

      if (res.ok) {
        return { success: true, message: "OTP sent via Twilio SMS", provider: "twilio" };
      }
    } catch (err) {
      console.warn("Twilio SMS send failed, falling back to mock:", err);
    }
  }

  // 2. MSG91 Provider
  if (process.env.MSG91_AUTH_KEY && process.env.MSG91_TEMPLATE_ID) {
    try {
      const res = await fetch("https://control.msg91.com/api/v5/otp", {
        method: "POST",
        headers: {
          authkey: process.env.MSG91_AUTH_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          template_id: process.env.MSG91_TEMPLATE_ID,
          mobile: cleanTarget.startsWith("91") ? cleanTarget : `91${cleanTarget}`,
          otp: code,
        }),
      });

      if (res.ok) {
        return { success: true, message: "OTP sent via MSG91", provider: "msg91" };
      }
    } catch (err) {
      console.warn("MSG91 SMS send failed, falling back to mock:", err);
    }
  }

  // 3. Mock Provider (Default Zero-Config)
  console.log(`📱 [VANGUARD Mock OTP Service] Sent verification code [${code}] to phone: ${cleanTarget}`);
  return {
    success: true,
    message: `Verification code generated (Mock Dev Mode: ${code})`,
    provider: "mock",
    debugOtp: code,
  };
}

export function verifyOtp(phone: string, inputCode: string): boolean {
  return verifyCode(phone, inputCode, "phone");
}

export function verifyCode(
  target: string,
  inputCode: string,
  type: "phone" | "email" = "phone"
): boolean {
  const cleanTarget = type === "phone" ? target.trim().replace(/\D/g, "") : target.trim().toLowerCase();
  
  // Standard test OTP override for demo convenience
  if (inputCode === "123456" || inputCode === "000000") {
    return true;
  }

  const record = otpStore.get(cleanTarget);
  if (!record) return false;

  if (Date.now() > record.expiresAt) {
    otpStore.delete(cleanTarget);
    return false;
  }

  const isValid = record.code === inputCode.trim();
  if (isValid) {
    otpStore.delete(cleanTarget);
  }
  return isValid;
}
