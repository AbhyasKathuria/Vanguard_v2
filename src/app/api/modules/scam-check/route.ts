import { NextResponse } from "next/server";
import { ScamCheckResult, ScamRiskLevel } from "@/lib/types";

export const dynamic = "force-dynamic";

interface ScamIndicatorRule {
  id: string;
  pattern: RegExp;
  weight: number;
  description: string;
  category: "urgency" | "payment" | "impersonation" | "technical" | "credentials";
}

const INDICATOR_RULES: ScamIndicatorRule[] = [
  {
    id: "otp_credential_solicitation",
    pattern: /(otp|one\s*time\s*password|pin|cvv|password|passcode|aadhaar\s*otp|bank\s*details)/i,
    weight: 35,
    description: "Requests confidential credentials, PIN, or OTP.",
    category: "credentials",
  },
  {
    id: "urgent_coercion",
    pattern: /(within\s*\d+\s*(hours|hrs|minutes|mins)|immediately|urgently|account\s*(blocked|suspended|deactivated)|power\s*cut\s*tonight|electricity\s*disconnected|arrest\s*warrant)/i,
    weight: 25,
    description: "Manufactured urgency or threat of immediate punitive disruption.",
    category: "urgency",
  },
  {
    id: "suspicious_payment_channel",
    pattern: /(scan\s*(this\s*)?qr|send\s*money\s*to\s*receive|processing\s*fee|registration\s*fee|advance\s*deposit|crypto|gift\s*card|apk\s*download)/i,
    weight: 30,
    description: "Request to transfer upfront funds or scan QR code to receive funds.",
    category: "payment",
  },
  {
    id: "lottery_or_unsolicited_subsidy",
    pattern: /(won|winner|lottery|lucky\s*draw|selected\s*for\s*(free|crore|lakhs)|congratulations.*reward|unclaimed\s*benefit)/i,
    weight: 25,
    description: "Unsolicited monetary prize, lottery, or unexpected subsidy award.",
    category: "impersonation",
  },
  {
    id: "official_impersonation",
    pattern: /(pm[- ]kisan|bijli\s*vibhag|vidyut\s*nigam|sbi\s*yono|income\s*tax\s*refund|police\s*department|cbi|trai\s*sim\s*block)/i,
    weight: 15,
    description: "Mentions high-authority government agency or bank to instill trust.",
    category: "impersonation",
  },
  {
    id: "unofficial_url_format",
    pattern: /(bit\.ly|tinyurl\.com|t\.me|wa\.me|goo\.gl|http:\/\/|https?:\/\/[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+|\.xyz|\.top|\.click|\.vip)/i,
    weight: 25,
    description: "Uses shortened or unofficial top-level domain instead of .gov.in / .nic.in.",
    category: "technical",
  },
];

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { text = "", sender = "", url = "" } = body;

    const fullContent = `${text} ${sender} ${url}`.trim();

    if (!fullContent) {
      return NextResponse.json(
        { error: "Please provide message text, sender info, or link to analyze." },
        { status: 400 }
      );
    }

    let calculatedScore = 0;
    const matchedDescriptions: string[] = [];

    for (const rule of INDICATOR_RULES) {
      if (rule.pattern.test(fullContent)) {
        calculatedScore += rule.weight;
        matchedDescriptions.push(rule.description);
      }
    }

    const hasGovDomain = /(https?:\/\/[a-z0-9\.\-]+\.(gov\.in|nic\.in))/i.test(fullContent);
    if (hasGovDomain) {
      calculatedScore = Math.max(0, calculatedScore - 40);
    }

    const riskScore = Math.min(100, Math.max(0, calculatedScore));

    let riskLevel: ScamRiskLevel = "Likely Legitimate";
    let hedgedSummary = "";

    if (riskScore >= 70) {
      riskLevel = "High Risk";
      hedgedSummary =
        "Notice: Strong potential fraudulent characteristics detected. This communication contains multiple markers consistent with reported financial impersonation and credential phishing campaigns. Do NOT interact, scan codes, or transfer funds.";
    } else if (riskScore >= 45) {
      riskLevel = "Suspicious";
      hedgedSummary =
        "Caution: Suspicious attributes flagged. The message exhibits unverified urgency and claims that require independent verification before any action is taken.";
    } else if (riskScore >= 20) {
      riskLevel = "Needs Verification";
      hedgedSummary =
        "Advisory: Unverified claim detected. While not definitively malicious, cross-verify the sender details with your local Panchayat or official department directory.";
    } else {
      riskLevel = "Likely Legitimate";
      hedgedSummary =
        "Standard communication: No immediate high-risk threat indicators matched. Always exercise baseline vigilance and never disclose PINs or OTPs.";
    }

    const safetyRecommendations: string[] = [
      "No legitimate government department or bank will ever ask for your UPI PIN or OTP over SMS or WhatsApp.",
      "To receive money, you NEVER need to enter your UPI PIN or scan a QR code.",
      "If you suspect fraudulent activity, report immediately to the National Cybercrime Helpline at 1930 or file a ticket at cybercrime.gov.in.",
      "Consult your local Gram Panchayat Bhavan or CSC center before reacting to service disconnection threats.",
    ];

    const result: ScamCheckResult = {
      riskLevel,
      riskScore,
      hedgedSummary,
      matchedIndicators: matchedDescriptions,
      safetyRecommendations,
      verifiedOfficialChannels: [
        "National Cyber Crime Portal: https://cybercrime.gov.in",
        "National Consumer Helpline: 1915",
        "Toll-free Cyber Crime Helpline: 1930",
        "Official Government Directory: https://www.india.gov.in",
      ],
    };

    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    console.error("[API scam-check] Error:", error);
    return NextResponse.json({ error: "Failed to perform scam check." }, { status: 500 });
  }
}
