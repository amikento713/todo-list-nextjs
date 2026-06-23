const API = "http://localhost:8000";

export const authService = {
  async register(username: string, password: string) {
    const res = await fetch(`${API}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (!res.ok) throw new Error(await res.text());

    const data = await res.json();
    localStorage.setItem("token", data.access_token);
    localStorage.setItem("username", username);
    return data;
  },

  async login(username: string, password: string) {
    const form = new URLSearchParams();
    form.append("username", username);
    form.append("password", password);

    const res = await fetch(`${API}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: form.toString(),
    });

    if (!res.ok) throw new Error(await res.text());

    const data = await res.json();
    localStorage.setItem("token", data.access_token);
    localStorage.setItem("username", username);
    return data;
  },

  logout() {
    localStorage.removeItem("token");
  },

  getToken() {
    return localStorage.getItem("token");
  },
};

export default authService;
