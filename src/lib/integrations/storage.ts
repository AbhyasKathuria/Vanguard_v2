/**
 * Media & Attachment Storage Service for VANGUARD
 * Supports photo attachments on rural service requests.
 * Uses Firebase Storage when keys are provided, or local Base64/Data-URL fallback.
 */

export interface UploadResult {
  url: string;
  provider: "firebase" | "local_base64";
  sizeBytes?: number;
}

export async function uploadRequestAttachment(
  fileBase64: string,
  fileName: string,
  contentType: string = "image/jpeg"
): Promise<UploadResult> {
  const bucketName = process.env.VITE_FIREBASE_STORAGE_BUCKET || process.env.FIREBASE_STORAGE_BUCKET;

  // 1. Firebase Storage Upload (if bucket and access token configured)
  if (bucketName && process.env.FIREBASE_AUTH_TOKEN) {
    try {
      const buffer = Buffer.from(fileBase64.replace(/^data:image\/\w+;base64,/, ""), "base64");
      const uploadUrl = `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o?uploadType=media&name=attachments/${Date.now()}_${fileName}`;

      const res = await fetch(uploadUrl, {
        method: "POST",
        headers: {
          "Content-Type": contentType,
          Authorization: `Bearer ${process.env.FIREBASE_AUTH_TOKEN}`,
        },
        body: buffer,
      });

      if (res.ok) {
        const data = await res.json();
        const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encodeURIComponent(
          data.name
        )}?alt=media`;
        return { url: publicUrl, provider: "firebase", sizeBytes: buffer.length };
      }
    } catch (err) {
      console.warn("Firebase storage upload error, using local base64 fallback:", err);
    }
  }

  // 2. Zero-config Base64 Data URL Fallback
  const dataUrl = fileBase64.startsWith("data:")
    ? fileBase64
    : `data:${contentType};base64,${fileBase64}`;

  return {
    url: dataUrl,
    provider: "local_base64",
    sizeBytes: fileBase64.length,
  };
}
