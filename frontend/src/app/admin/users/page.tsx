"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { Message } from "@/components/Message";
import { apiFetch, responseData, Role, User } from "@/lib/api";

type UsersPayload = User[] | { users: User[] };

function extractUsers(response: UsersPayload | { data: UsersPayload }): User[] {
  const data = responseData(response);
  return Array.isArray(data) ? data : data.users;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "USER" as Role });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);

  const loadUsers = useCallback(async () => {
    setError("");
    try {
      const response = await apiFetch<UsersPayload | { data: UsersPayload }>("/api/users");
      setUsers(extractUsers(response));
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo cargar el listado.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadUsers(); }, [loadUsers]);

  async function createUser(event: FormEvent) {
    event.preventDefault();
    setError("");
    setSuccess("");
    try {
      await apiFetch("/api/users", { method: "POST", body: JSON.stringify(form) });
      setForm({ name: "", email: "", password: "", role: "USER" });
      setSuccess("Usuario creado correctamente.");
      await loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo crear el usuario.");
    }
  }

  async function deactivate(user: User) {
    if (!window.confirm(`¿Desactivar a ${user.email}?`)) return;
    setError("");
    setSuccess("");
    try {
      await apiFetch(`/api/users/${user.id}`, { method: "DELETE" });
      setSuccess("Usuario desactivado correctamente.");
      await loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo desactivar.");
    }
  }

  return (
    <section className="panel wide">
      <h1>Panel admin de usuarios</h1>
      <p>La pantalla permanece accesible para que puedas comprobar el 403 de la API con un token USER.</p>
      {error && <Message type="error">{error}</Message>}
      {success && <Message type="success">{success}</Message>}
      <form className="admin-form" onSubmit={createUser}>
        <label>Nombre<input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
        <label>Email<input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
        <label>Contraseña<input required minLength={6} type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></label>
        <label>Rol<select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as Role })}><option>USER</option><option>ADMIN</option></select></label>
        <button>Crear usuario</button>
      </form>
      {loading ? <p>Cargando usuarios...</p> : (
        <div className="table-wrap">
          <table>
            <thead><tr><th>ID</th><th>Nombre</th><th>Email</th><th>Rol</th><th>Activo</th><th>Acciones</th></tr></thead>
            <tbody>{users.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td><td>{user.name}</td><td>{user.email}</td>
                <td><span className="badge">{user.role}</span></td>
                <td>{user.isActive ? "Sí" : "No"}</td>
                <td><button className="danger" disabled={!user.isActive} onClick={() => void deactivate(user)}>Desactivar</button></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}
    </section>
  );
}
