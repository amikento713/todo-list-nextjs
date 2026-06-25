export async function parseError(res: Response): Promise<string> {
  const contentType = res.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    try {
      const json = await res.json();
      return typeof json.detail === "string"
        ? json.detail
        : JSON.stringify(json);
    } catch {
      return res.statusText || "Request failed";
    }
  }

  const text = await res.text().catch(() => "");
  return text || res.statusText || "Request failed";
}
