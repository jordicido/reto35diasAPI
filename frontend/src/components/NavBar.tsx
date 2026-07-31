"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export function NavBar() {
  const router = useRouter();

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  }

  return (
    <header className="nav">
      <Link className="brand" href="/">UserManager</Link>
      <nav aria-label="Navegación principal">
        <Link href="/login">Login</Link>
        <Link href="/register">Registro</Link>
        <Link href="/dashboard">Dashboard</Link>
        <Link href="/admin/users">Panel admin</Link>
        <button className="link-button" onClick={logout}>Logout</button>
      </nav>
    </header>
  );
}
