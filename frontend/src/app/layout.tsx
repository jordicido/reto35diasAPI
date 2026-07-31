import type { Metadata } from "next";
import { NavBar } from "@/components/NavBar";
import "./globals.css";

export const metadata: Metadata = {
  title: "UserManager API - Cliente web",
  description: "Frontend didáctico para consumir UserManager API"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <NavBar />
        <main className="container">{children}</main>
      </body>
    </html>
  );
}
