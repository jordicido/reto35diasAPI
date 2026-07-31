"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { Message } from "@/components/Message";
import { apiFetch, responseData, User } from "@/lib/api";

type LoginData = { token: string; user: Pick<User, "id" | "email" | "role"> };

const accounts = [
  ["ADMIN", "admin@email.com", "admin123"],
  ["USER", "user@email.com", "user123"],
  ["USER inactivo", "inactive@email.com", "inactive123"]
] as const;

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [user, setUser] = useState<LoginData["user"] | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setUser(null);
    setLoading(true);
    try {
      const response = await apiFetch<LoginData | { data: LoginData }>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(form)
      });
      const data = responseData(response);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo iniciar sesión.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="panel narrow">
      <h1>Login</h1>
      <form onSubmit={submit}>
        <label>Email<input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
        <label>Contraseña<input required type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></label>
        <button disabled={loading}>{loading ? "Entrando..." : "Iniciar sesión"}</button>
      </form>
      <div className="quick-users">
        <h2>Credenciales de prueba</h2>
        {accounts.map(([label, email, password]) => (
          <button className="secondary" type="button" key={email} onClick={() => setForm({ email, password })}>
            Rellenar {label}
          </button>
        ))}
      </div>
      {error && <Message type="error">{error}</Message>}
      {user && (
        <Message type="success">
          Sesión iniciada como <strong>{user.role}</strong>.{" "}
          <Link href="/dashboard">Ir al dashboard</Link>
        </Message>
      )}
    </section>
  );
}
