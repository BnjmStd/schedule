import Link from "next/link";
import { siteConfig } from "@/config/site";
import styles from "../legal.module.css";

export const metadata = {
  title: `Política de Privacidad – ${siteConfig.name}`,
  description:
    "Conoce cómo Class & Time recopila, usa y protege tu información personal.",
};

const LAST_UPDATED = "14 de marzo de 2026";

export default function PrivacyPage() {
  return (
    <div className={styles.legalLayout}>
      {/* Fondo decorativo */}
      <div className={styles.bg}>
        <div className={styles.gradient} />
        <div className={styles.orb1} />
        <div className={styles.orb2} />
      </div>

      <div className={styles.container}>
        {/* ── Header ── */}
        <header className={styles.header}>
          <Link href="/" className={styles.logoLink}>
            <div className={styles.logoIcon}>📅</div>
            <span className={styles.logoText}>{siteConfig.name}</span>
          </Link>
          <div className={styles.badge}>🔒 Privacidad</div>
          <h1 className={styles.pageTitle}>Política de Privacidad</h1>
          <p className={styles.lastUpdated}>
            Última actualización: {LAST_UPDATED}
          </p>
        </header>

        {/* ── Tarjeta principal ── */}
        <div className={styles.card}>
          {/* Tabla de contenidos */}
          <nav aria-label="Tabla de contenidos">
            <p className={styles.tocTitle}>Contenido</p>
            <ul className={styles.tocList}>
              <li>
                <a href="#responsable">Responsable</a>
              </li>
              <li>
                <a href="#datos-recopilados">Datos que recopilamos</a>
              </li>
              <li>
                <a href="#finalidad">Finalidad del tratamiento</a>
              </li>
              <li>
                <a href="#base-legal">Base legal</a>
              </li>
              <li>
                <a href="#cookies">Cookies</a>
              </li>
              <li>
                <a href="#compartir">Compartir datos</a>
              </li>
              <li>
                <a href="#transferencias">Transferencias internacionales</a>
              </li>
              <li>
                <a href="#retencion">Retención</a>
              </li>
              <li>
                <a href="#seguridad">Seguridad</a>
              </li>
              <li>
                <a href="#derechos">Tus derechos</a>
              </li>
              <li>
                <a href="#menores">Menores de edad</a>
              </li>
              <li>
                <a href="#cambios">Cambios</a>
              </li>
              <li>
                <a href="#contacto">Contacto</a>
              </li>
            </ul>
          </nav>

          <div className={styles.highlightBox}>
            Tu privacidad es importante para nosotros. Esta política explica, de
            forma clara y concisa, qué información recopilamos, cómo la usamos y
            los derechos que tienes sobre ella.
          </div>

          {/* 1 */}
          <section id="responsable" className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <span>1</span> Responsable del tratamiento
            </h2>
            <div className={styles.sectionContent}>
              <p>
                <strong>{siteConfig.name}</strong> es el responsable del
                tratamiento de los datos personales recopilados a través de la
                Plataforma. Puedes contactarnos en{" "}
                <a href={`mailto:${siteConfig.email.support}`}>
                  {siteConfig.email.support}
                </a>
                .
              </p>
            </div>
          </section>

          {/* 2 */}
          <section id="datos-recopilados" className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <span>2</span> Datos que recopilamos
            </h2>
            <div className={styles.sectionContent}>
              <p>
                Recopilamos únicamente los datos necesarios para ofrecer el
                servicio:
              </p>
              <p>
                <strong>Datos que tú nos proporcionas</strong>
              </p>
              <ul>
                <li>
                  Nombre y apellido, correo electrónico, contraseña (cifrada).
                </li>
                <li>Nombre e información de tu institución educativa.</li>
                <li>
                  Datos operativos: docentes, materias, cursos, aulas y horarios
                  que ingresas en la Plataforma.
                </li>
                <li>Información de facturación (plan, método de pago).</li>
              </ul>
              <p>
                <strong>Datos recopilados automáticamente</strong>
              </p>
              <ul>
                <li>Dirección IP y datos de navegador/dispositivo.</li>
                <li>
                  Registros de uso (páginas visitadas, acciones realizadas,
                  marcas de tiempo).
                </li>
                <li>Cookies de sesión y preferencias (ver sección 5).</li>
              </ul>
            </div>
          </section>

          {/* 3 */}
          <section id="finalidad" className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <span>3</span> Finalidad del tratamiento
            </h2>
            <div className={styles.sectionContent}>
              <p>Usamos tus datos para:</p>
              <ul>
                <li>Crear y gestionar tu cuenta.</li>
                <li>Prestar y mejorar las funcionalidades de la Plataforma.</li>
                <li>Procesar pagos y emitir facturas.</li>
                <li>
                  Enviarte comunicaciones relacionadas con el servicio
                  (incidencias, actualizaciones, avisos de seguridad).
                </li>
                <li>
                  Enviarte comunicaciones de marketing, únicamente si has dado
                  tu consentimiento expreso.
                </li>
                <li>Cumplir obligaciones legales y prevenir fraudes.</li>
              </ul>
            </div>
          </section>

          {/* 4 */}
          <section id="base-legal" className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <span>4</span> Base legal del tratamiento
            </h2>
            <div className={styles.sectionContent}>
              <p>
                Tratamos tus datos sobre las siguientes bases legales según
                corresponda:
              </p>
              <ul>
                <li>
                  <strong>Ejecución de contrato:</strong> necesario para
                  prestarte el servicio contratado.
                </li>
                <li>
                  <strong>Consentimiento:</strong> para comunicaciones de
                  marketing y cookies no esenciales.
                </li>
                <li>
                  <strong>Interés legítimo:</strong> para seguridad, prevención
                  de fraudes y mejora del servicio.
                </li>
                <li>
                  <strong>Obligación legal:</strong> para cumplir normativas
                  fiscales y regulatorias.
                </li>
              </ul>
            </div>
          </section>

          {/* 5 */}
          <section id="cookies" className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <span>5</span> Cookies
            </h2>
            <div className={styles.sectionContent}>
              <p>Utilizamos los siguientes tipos de cookies:</p>
              <ul>
                <li>
                  <strong>Esenciales:</strong> necesarias para el funcionamiento
                  de la sesión y la autenticación. No pueden desactivarse.
                </li>
                <li>
                  <strong>Preferencias:</strong> almacenan ajustes como idioma o
                  tema visual.
                </li>
                <li>
                  <strong>Analíticas:</strong> nos ayudan a entender cómo se usa
                  la Plataforma para mejorarla.
                </li>
              </ul>
              <p>
                Puedes gestionar las cookies no esenciales desde la
                configuración de tu navegador. Desactivarlas puede afectar
                algunas funcionalidades.
              </p>
            </div>
          </section>

          {/* 6 */}
          <section id="compartir" className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <span>6</span> Compartir datos con terceros
            </h2>
            <div className={styles.sectionContent}>
              <p>
                No vendemos ni alquilamos tus datos personales. Podemos
                compartirlos con:
              </p>
              <ul>
                <li>
                  <strong>Proveedores de servicios:</strong> hospedaje (cloud),
                  procesadores de pago, servicios de correo electrónico, que
                  actúan como encargados del tratamiento bajo acuerdos de
                  confidencialidad.
                </li>
                <li>
                  <strong>Autoridades legales:</strong> cuando sea requerido por
                  ley, orden judicial o para proteger nuestros derechos legales.
                </li>
                <li>
                  <strong>Operaciones corporativas:</strong> en caso de fusión,
                  adquisición o venta de activos, con notificación previa.
                </li>
              </ul>
            </div>
          </section>

          {/* 7 */}
          <section id="transferencias" className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <span>7</span> Transferencias internacionales
            </h2>
            <div className={styles.sectionContent}>
              <p>
                Algunos de nuestros proveedores pueden estar ubicados fuera de
                tu país. En esos casos garantizamos que existan salvaguardas
                adecuadas (cláusulas contractuales estándar u otro mecanismo de
                transferencia válido) para proteger tus datos.
              </p>
            </div>
          </section>

          {/* 8 */}
          <section id="retencion" className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <span>8</span> Retención de datos
            </h2>
            <div className={styles.sectionContent}>
              <p>
                Conservamos tus datos mientras tu cuenta esté activa y por el
                tiempo necesario para cumplir los fines descritos en esta
                política. Tras la cancelación de tu cuenta eliminaremos tus
                datos operativos en un plazo máximo de 30 días, salvo que la ley
                exija conservarlos más tiempo (p. ej., registros fiscales).
              </p>
            </div>
          </section>

          {/* 9 */}
          <section id="seguridad" className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <span>9</span> Seguridad
            </h2>
            <div className={styles.sectionContent}>
              <p>
                Implementamos medidas técnicas y organizativas apropiadas para
                proteger tus datos, incluyendo:
              </p>
              <ul>
                <li>Cifrado en tránsito (TLS/HTTPS) y en reposo.</li>
                <li>Contraseñas almacenadas con hashing seguro (bcrypt).</li>
                <li>Acceso a datos restringido al personal necesario.</li>
                <li>Monitoreo continuo de seguridad e incidentes.</li>
              </ul>
              <p>
                Ningún sistema es 100&nbsp;% seguro. En caso de una brecha de
                seguridad que afecte tus datos, te notificaremos en los plazos
                que establezca la normativa aplicable.
              </p>
            </div>
          </section>

          {/* 10 */}
          <section id="derechos" className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <span>10</span> Tus derechos
            </h2>
            <div className={styles.sectionContent}>
              <p>
                Dependiendo de tu ubicación, puedes ejercer los siguientes
                derechos respecto de tus datos:
              </p>
              <ul>
                <li>
                  <strong>Acceso:</strong> obtener una copia de los datos que
                  tenemos sobre ti.
                </li>
                <li>
                  <strong>Rectificación:</strong> corregir datos inexactos o
                  incompletos.
                </li>
                <li>
                  <strong>Supresión:</strong> solicitar la eliminación de tus
                  datos (&quot;derecho al olvido&quot;).
                </li>
                <li>
                  <strong>Portabilidad:</strong> recibir tus datos en formato
                  estructurado y legible por máquina.
                </li>
                <li>
                  <strong>Oposición:</strong> oponerte al tratamiento basado en
                  interés legítimo.
                </li>
                <li>
                  <strong>Limitación:</strong> solicitar la restricción temporal
                  del tratamiento.
                </li>
                <li>
                  <strong>Retirar consentimiento</strong> en cualquier momento
                  para los tratamientos basados en él.
                </li>
              </ul>
              <p>
                Para ejercer cualquiera de estos derechos escríbenos a{" "}
                <a href={`mailto:${siteConfig.email.support}`}>
                  {siteConfig.email.support}
                </a>
                . Responderemos en un plazo máximo de 30 días.
              </p>
            </div>
          </section>

          {/* 11 */}
          <section id="menores" className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <span>11</span> Menores de edad
            </h2>
            <div className={styles.sectionContent}>
              <p>
                La Plataforma está dirigida a administradores institucionales y
                docentes adultos. No recopilamos intencionalmente datos
                personales de menores de 18 años directamente. Si detectamos que
                hemos recibido datos de un menor sin consentimiento, los
                eliminaremos de inmediato.
              </p>
            </div>
          </section>

          {/* 12 */}
          <section id="cambios" className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <span>12</span> Cambios a esta política
            </h2>
            <div className={styles.sectionContent}>
              <p>
                Podemos actualizar esta política periódicamente. Cuando
                realicemos cambios materiales te notificaremos por correo
                electrónico o mediante un aviso prominente en la Plataforma. La
                fecha de la última actualización siempre aparece en la cabecera.
              </p>
            </div>
          </section>

          {/* 13 */}
          <section id="contacto" className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <span>13</span> Contacto
            </h2>
            <div className={styles.sectionContent}>
              <p>
                Para cualquier consulta relacionada con esta política o el
                tratamiento de tus datos, contáctanos en:{" "}
                <a href={`mailto:${siteConfig.email.support}`}>
                  {siteConfig.email.support}
                </a>
              </p>
            </div>
          </section>
        </div>

        {/* ── Footer ── */}
        <footer className={styles.footer}>
          <div className={styles.footerCard}>
            <p className={styles.footerText}>
              © {new Date().getFullYear()} {siteConfig.name}. Todos los derechos
              reservados.
            </p>
            <nav className={styles.footerLinks} aria-label="Documentos legales">
              <Link href="/legal/terms">Términos de Servicio</Link>
              <Link href="/legal/privacy">Política de Privacidad</Link>
              <a href={`mailto:${siteConfig.email.contact}`}>Contacto</a>
            </nav>
            <Link href="/auth/login" className={styles.backButton}>
              ← Volver al inicio de sesión
            </Link>
          </div>
        </footer>
      </div>
    </div>
  );
}
