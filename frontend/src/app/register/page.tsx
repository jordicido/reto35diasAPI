"use client";

import { FormEvent, useState } from "react";
import { Message } from "@/components/Message";
import { apiFetch } from "@/lib/api";

export default function RegisterPage() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [result, setResult] = useState<unknown>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setResult(null);
    setLoading(true);
    try {
      const data = await apiFetch("/api/auth/register", {
        method: "POST",
        body: JSON.stringify(form)
      });
      setResult(data);
      setForm({ name: "", email: "", password: "" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo completar el registro.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="panel narrow">
      <h1>Registro</h1>
      <p>Crea un usuario con rol USER mediante una ruta pública.</p>
      <form onSubmit={submit}>
        <label>Nombre<input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
        <label>Email<input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
        <label>Contraseña<input required minLength={6} type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></label>
        <button disabled={loading}>{loading ? "Registrando..." : "Crear cuenta"}</button>
      </form>
      {error && <Message type="error">{error}</Message>}
      {result !== null && (
        <Message type="success">
          <strong>Usuario registrado.</strong>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </Message>
      )}
    </section>
  );
}
