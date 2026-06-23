import { API_BASE_URL } from "../lib/config";

async function parseError(res: Response): Promise<string> {
  const contentType = res.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    try {
      const json = await res.json();
      return typeof json.detail === "string"
        ? json.detail
        : JSON.stringify(json);
    } catch {
      return res.statusText || "Upload failed";
    }
  }

  const text = await res.text().catch(() => "");
  return text || res.statusText || "Upload failed";
}

export async function uploadBook(file: File): Promise<{ url: string; filename: string }> {
  const form = new FormData();
  form.append("file", file);

  const headers = new Headers();
  const token = localStorage.getItem("token");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(`${API_BASE_URL}/upload-book`, {
    method: "POST",
    headers,
    body: form,
  });

  if (!res.ok) {
    throw new Error(await parseError(res));
  }

  return res.json();
}
