import "./globals.css";

export const metadata = {
  title: "AireGDL 2.0 · Calidad del aire en la ZMG",
  description:
    "Sistema de análisis y predicción de la calidad del aire en la zona metropolitana de Guadalajara.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
