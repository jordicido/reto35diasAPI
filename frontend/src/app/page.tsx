import Link from "next/link";

const links = [
  { href: "/login", title: "Login", text: "Obtén un JWT con un usuario de prueba." },
  { href: "/register", title: "Registro", text: "Crea una cuenta USER desde la ruta pública." },
  { href: "/dashboard", title: "Dashboard", text: "Consulta y modifica tu propio perfil." },
  { href: "/admin/users", title: "Panel admin", text: "Prueba el listado, alta y baja de usuarios." }
];

export default function Home() {
  return (
    <>
      <section className="hero">
        <span className="eyebrow">Frontend didáctico</span>
        <h1>Cliente web de UserManager API</h1>
        <p>
          Esta interfaz usa Fetch para conectar Next.js con la API REST de
          Express. Abre las herramientas del navegador para observar cada
          petición, su cabecera Authorization y la respuesta JSON.
        </p>
      </section>
      <section className="card-grid">
        {links.map((item) => (
          <Link className="card" href={item.href} key={item.href}>
            <h2>{item.title}</h2>
            <p>{item.text}</p>
          </Link>
        ))}
      </section>
    </>
  );
}
