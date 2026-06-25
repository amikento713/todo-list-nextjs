import { API_BASE_URL } from "../lib/config";
import { parseError } from "../lib/apiUtils";

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
