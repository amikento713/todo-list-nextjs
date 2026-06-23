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
      return res.statusText || "Request failed";
    }
  }

  const text = await res.text().catch(() => "");
  return text || res.statusText || "Request failed";
}

export const authService = {
  async register(username: string, password: string) {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (!res.ok) {
      throw new Error(await parseError(res));
    }

    const data = await res.json();
    localStorage.setItem("token", data.access_token);
    localStorage.setItem("username", username);
    return data;
  },

  async login(username: string, password: string) {
    const form = new URLSearchParams();
    form.append("username", username);
    form.append("password", password);

    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: form.toString(),
    });

    if (!res.ok) {
      throw new Error(await parseError(res));
    }

    const data = await res.json();
    localStorage.setItem("token", data.access_token);
    localStorage.setItem("username", username);
    return data;
  },

  logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
  },

  getToken() {
    return localStorage.getItem("token");
  },
};

export default authService;
