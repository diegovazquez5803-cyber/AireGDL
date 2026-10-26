// Completa estos dos datos antes de publicar el aviso.
const RESPONSABLE = "Diego Vázquez Hernández";
const CORREO = "correo-de-contacto@ejemplo.com";

export const metadata = {
  title: "Aviso de confidencialidad · AireGDL 2.0",
  description: "Cómo trata AireGDL 2.0 la información y qué datos recopila.",
};

const secciones = [
  ["Responsable", [
    `AireGDL 2.0 es un proyecto educativo desarrollado por ${RESPONSABLE}. Para cualquier asunto relacionado con este aviso puedes escribir a ${CORREO}.`,
  ]],
  ["Información que se trata", [
    "AireGDL trabaja con datos de calidad del aire (PM10, PM2.5 y ozono) publicados como archivos abiertos por estaciones de monitoreo. Son datos ambientales, no datos personales.",
    "Para funcionar, el sistema no pide tu nombre, correo, ubicación ni ningún otro dato personal.",
  ]],
  ["Para qué se usa", [
    "La información se usa únicamente para analizar y visualizar la calidad del aire con fines educativos. No se usa con fines comerciales, publicitarios ni para crear perfiles de personas.",
  ]],
  ["Dónde se guarda", [
    "El sistema se ejecuta en tu computadora. Los archivos CSV que cargas y los datos ya limpios se almacenan de forma local, sin base de datos externa y sin enviarse a ningún servidor del proyecto.",
    "Esta página web no usa cookies de rastreo ni herramientas de analítica, y no envía información a terceros.",
  ]],
  ["Los archivos que cargues", [
    "Lo que cargues en AireGDL permanece en tu equipo y es tu responsabilidad. El sistema no necesita datos personales ni información sensible, así que te pedimos no incluirlos en tus archivos.",
  ]],
  ["Contenido del proyecto", [
    "La especificación y el contenido de esta página se comparten con docentes y personas interesadas con fines informativos y educativos. Si quieres reutilizarlos fuera de ese fin, solicita autorización al responsable.",
    "AireGDL no es un sistema oficial y no sustituye a los sistemas oficiales de monitoreo. No ofrece recomendaciones médicas ni de salud.",
  ]],
  ["Transferencia a terceros", [
    "No se venden, ceden ni comparten datos personales con terceros.",
  ]],
  ["Tus derechos", [
    `Si me escribes a ${CORREO}, usaré tus datos de contacto solo para responderte. Puedes solicitar el acceso, la rectificación o la cancelación de esos datos, u oponerte a su uso (derechos ARCO), escribiendo al mismo correo.`,
  ]],
  ["Cambios a este aviso", [
    "Cualquier cambio se publicará en esta página. Si una versión futura del sistema llegara a recopilar datos personales, este aviso se actualizará antes de que eso ocurra.",
  ]],
];

export default function Aviso() {
  return (
    <main className="wrap legal">
      <h1>Aviso de confidencialidad</h1>
      <p className="sub">Última actualización: 26 de octubre de 2026</p>
      <p className="resumen">
        En resumen: AireGDL no recopila datos personales, no usa cookies de rastreo y guarda todo en tu
        propia computadora.
      </p>
      {secciones.map(([titulo, parrafos]) => (
        <section key={titulo}>
          <h2>{titulo}</h2>
          {parrafos.map((t) => <p key={t}>{t}</p>)}
        </section>
      ))}
    </main>
  );
}
