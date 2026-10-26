import Dashboard from "../components/Dashboard";

const incluye = [
  "Cargar datos de PM10, PM2.5 y ozono desde archivos abiertos de estaciones de monitoreo.",
  "Limpiar los datos: valores faltantes, duplicados y registros fuera de rango.",
  "Explorar promedios por estación, por hora y por mes, y ver tendencias.",
  "Predecir el nivel de un contaminante para las siguientes 24 horas con un modelo de regresión sencillo.",
  "Mostrar los resultados en un panel con gráficas interactivas.",
];
const noIncluye = [
  "Datos en tiempo real ni conexión directa con los sensores.",
  "Alertas automáticas a la población.",
  "Aplicación móvil.",
  "Recomendaciones médicas o de salud.",
];
const entorno = [
  ["Contexto", "Complementa a SIMAJ y SINAICA: ellos publican los datos, AireGDL los analiza y los compara de forma sencilla."],
  ["Usuario", "Panel web local donde eliges estación, contaminante y rango de fechas."],
  ["Datos", "Entrada de archivos CSV de fuentes abiertas. Sin base de datos externa; los datos limpios se guardan en local."],
  ["Software", "Python con pandas y scikit-learn para el análisis, y Plotly o Streamlit para la visualización."],
  ["Hardware", "Una computadora personal estándar, sin requerimientos especiales."],
  ["Operación", "Bajo demanda: cargas los datos, ejecutas el análisis y consultas los resultados."],
];
const pasos = ["Cargar CSV", "Limpiar", "Explorar", "Predecir 24 h", "Visualizar"];

export default function Home() {
  return (
    <>
      <header className="top">
        <span className="brand">AireGDL <b>2.0</b></span>
        <nav>
          <a href="#panel">Panel</a>
          <a href="#alcance">Alcance</a>
          <a href="#producto">Producto</a>
        </nav>
      </header>

      <main>
        <section className="hero">
          <h1>Qué respira la zona metropolitana de Guadalajara, hora por hora.</h1>
          <p className="lead">
            AireGDL recopila, limpia y visualiza datos históricos de calidad del aire y estima los
            niveles de contaminantes para las próximas 24 horas. Es un proyecto educativo de ciencia
            de datos aplicado a un problema real de la comunidad.
          </p>
          <ol className="flow" aria-label="Flujo del sistema">
            {pasos.map((p, i) => (
              <li key={p}><span>{i + 1}</span>{p}</li>
            ))}
          </ol>
        </section>

        <section id="panel" className="wrap">
          <h2>Panel de análisis y predicción</h2>
          <Dashboard />
        </section>

        <section id="alcance" className="wrap two">
          <div>
            <h2>Qué hará el sistema</h2>
            <ul className="yes">{incluye.map((t) => <li key={t}>{t}</li>)}</ul>
          </div>
          <div>
            <h2>Qué no incluye</h2>
            <ul className="no">{noIncluye.map((t) => <li key={t}>{t}</li>)}</ul>
          </div>
        </section>

        <section id="producto" className="wrap">
          <h2>Perspectiva del producto</h2>
          <p className="sub">
            Un sistema independiente y autocontenido que se relaciona con su entorno así:
          </p>
          <dl className="env">
            {entorno.map(([k, v]) => (
              <div key={k}><dt>{k}</dt><dd>{v}</dd></div>
            ))}
          </dl>
        </section>
      </main>

      <footer className="foot">
        <p>
          Propósito: acordar qué debe hacer el sistema antes de diseñarlo e implementarlo. Está dirigido al
          autor, a los docentes que evalúan el proyecto y a quien quiera conocer el comportamiento del aire
          en la zona. No sustituye a los sistemas oficiales de monitoreo.
        </p>
        <p>Basado en la Especificación de Requerimientos de Software (IEEE 29148) de AireGDL 2.0.</p>
      </footer>
    </>
  );
}
