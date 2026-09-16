/**
 * Resilient Client Mutation & Network Dispatch Engine
 * Provides exponential backoff retries (max 3 retries), optimistic updates,
 * and deterministic error parsing.
 */

export interface ResilientRequestOptions extends RequestInit {
  maxRetries?: number;
  retryDelayMs?: number;
  onOptimisticUpdate?: () => void;
  onErrorRollback?: (error: Error) => void;
}

export async function resilientFetch<T = any>(
  url: string,
  options: ResilientRequestOptions = {}
): Promise<{ data: T | null; error: string | null; status: number }> {
  const {
    maxRetries = 3,
    retryDelayMs = 600,
    onOptimisticUpdate,
    onErrorRollback,
    ...fetchOptions
  } = options;

  // Execute optimistic UI update immediately before network round-trip
  if (onOptimisticUpdate) {
    try {
      onOptimisticUpdate();
    } catch (optErr) {
      console.warn("[ResilientFetch] Optimistic update callback error:", optErr);
    }
  }

  let attempt = 0;
  let lastError: any = null;

  while (attempt < maxRetries) {
    try {
      const response = await fetch(url, {
        ...fetchOptions,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          ...fetchOptions.headers,
        },
      });

      const text = await response.text();
      let parsedJson: any = null;

      if (text && text.trim()) {
        try {
          parsedJson = JSON.parse(text);
        } catch {
          parsedJson = { raw: text };
        }
      }

      if (response.ok) {
        return {
          data: parsedJson as T,
          error: null,
          status: response.status,
        };
      }

      // If server returned a 4xx error (e.g. 400 Bad Request, 401 Unauthorized), do not retry indefinitely
      if (response.status >= 400 && response.status < 500) {
        const errorMsg = parsedJson?.error || `Request failed with status ${response.status}`;
        if (onErrorRollback) onErrorRollback(new Error(errorMsg));
        return {
          data: null,
          error: errorMsg,
          status: response.status,
        };
      }

      // 5xx Server error, qualify for retry
      lastError = new Error(parsedJson?.error || `Server error (${response.status})`);
    } catch (netErr: any) {
      lastError = netErr;
    }

    attempt++;
    if (attempt < maxRetries) {
      const backoff = retryDelayMs * Math.pow(2, attempt - 1);
      await new Promise((resolve) => setTimeout(resolve, backoff));
    }
  }

  // All retries failed
  const finalErrorMsg = lastError?.message || "Network request failed after maximum retries.";
  if (onErrorRollback) {
    onErrorRollback(lastError || new Error(finalErrorMsg));
  }

  return {
    data: null,
    error: finalErrorMsg,
    status: 500,
  };
}
