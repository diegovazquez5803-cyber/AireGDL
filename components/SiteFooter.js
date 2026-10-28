import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="foot">
      <p>
        Propósito: acordar qué debe hacer el sistema antes de diseñarlo e implementarlo. Está dirigido al
        autor, a los docentes que evalúan el proyecto y a quien quiera conocer el comportamiento del aire
        en la zona. No sustituye a los sistemas oficiales de monitoreo.
      </p>
      <p>Basado en la Especificación de Requerimientos de Software (IEEE 29148) de AireGDL 2.0.</p>
      <p>Proyecto final de la materia Ingeniería de software - Diego Vázquez Hernández - 218358034</p>
      <p><Link href="/aviso-confidencialidad">Aviso de confidencialidad</Link></p>
      
    </footer>
  );
}
