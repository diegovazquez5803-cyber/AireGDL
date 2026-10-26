import Link from "next/link";

export default function SiteHeader() {
  return (
    <header className="top">
      <Link href="/" className="brand">AireGDL <b>2.0</b></Link>
      <nav>
        <Link href="/#panel">Panel</Link>
        <Link href="/#alcance">Alcance</Link>
        <Link href="/#producto">Producto</Link>
      </nav>
    </header>
  );
}
