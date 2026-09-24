/** HTTPS-only JSON fetch with a hard timeout. Throws on any failure so callers can fall back. */
export async function fetchJson<T>(url: string, timeoutMs = 8000): Promise<T> {
  if (!url.startsWith('https://')) throw new Error(`Refusing non-HTTPS request: ${url}`);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal, headers: { Accept: 'application/json' } });
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
    return (await res.json()) as T;
  } finally {
    clearTimeout(timer);
  }
}
