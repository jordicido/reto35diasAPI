"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Message } from "@/components/Message";
import { ApiError, apiFetch, responseData, User } from "@/lib/api";

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async () => {
    setError("");
    try {
      const response = await apiFetch<User | { data: User }>("/api/users/me");
      const profile = responseData(response);
      setUser(profile);
      setName(profile.name);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo cargar el perfil.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadProfile(); }, [loadProfile]);

  async function updateName(event: FormEvent) {
    event.preventDefault();
    if (!user) return;
    setError("");
    setSuccess("");
    try {
      const response = await apiFetch<User | { data: User }>(`/api/users/${user.id}`, {
        method: "PATCH",
        body: JSON.stringify({ name })
      });
      setUser(responseData(response));
      setSuccess("Nombre actualizado correctamente.");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo actualizar.");
    }
  }

  if (loading) return <p>Cargando perfil...</p>;

  return (
    <section className="panel">
      <h1>Dashboard · Mi perfil</h1>
      {error && <Message type="error">{error} <Link href="/login">Ir a login</Link></Message>}
      {user && (
        <>
          <dl className="profile">
            {Object.entries(user).map(([key, value]) => (
              <div key={key}><dt>{key}</dt><dd>{String(value)}</dd></div>
            ))}
          </dl>
          <form className="inline-form" onSubmit={updateName}>
            <label>Editar nombre<input required value={name} onChange={(e) => setName(e.target.value)} /></label>
            <button>Guardar cambios</button>
          </form>
          {success && <Message type="success">{success}</Message>}
        </>
      )}
    </section>
  );
}
