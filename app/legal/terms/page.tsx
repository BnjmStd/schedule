import Link from "next/link";
import { siteConfig } from "@/config/site";
import styles from "../legal.module.css";

export const metadata = {
  title: `Términos de Servicio – ${siteConfig.name}`,
  description:
    "Lee los términos y condiciones que rigen el uso de Class & Time, plataforma de gestión de horarios escolares.",
};

const LAST_UPDATED = "14 de marzo de 2026";

export default function TermsPage() {
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
          <div className={styles.badge}>📄 Legal</div>
          <h1 className={styles.pageTitle}>Términos de Servicio</h1>
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
              <li><a href="#aceptacion">Aceptación</a></li>
              <li><a href="#descripcion">Descripción del servicio</a></li>
              <li><a href="#cuentas">Cuentas de usuario</a></li>
              <li><a href="#uso-aceptable">Uso aceptable</a></li>
              <li><a href="#datos">Datos y privacidad</a></li>
              <li><a href="#propiedad">Propiedad intelectual</a></li>
              <li><a href="#pagos">Planes y pagos</a></li>
              <li><a href="#suspension">Suspensión</a></li>
              <li><a href="#garantias">Garantías</a></li>
              <li><a href="#limitacion">Limitación de responsabilidad</a></li>
              <li><a href="#ley">Ley aplicable</a></li>
              <li><a href="#cambios">Cambios a los términos</a></li>
              <li><a href="#contacto">Contacto</a></li>
            </ul>
          </nav>

          <div className={styles.highlightBox}>
            Por favor lee estos términos con detenimiento. Al crear una cuenta o
            utilizar {siteConfig.name} aceptas quedar vinculado por el presente
            acuerdo. Si no estás de acuerdo, no utilices el servicio.
          </div>

          {/* 1 */}
          <section id="aceptacion" className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <span>1</span> Aceptación de los términos
            </h2>
            <div className={styles.sectionContent}>
              <p>
                Estos Términos de Servicio (&quot;Términos&quot;) constituyen un
                contrato legal entre tú (&quot;Usuario&quot;) y{" "}
                <strong>{siteConfig.name}</strong> (&quot;la Plataforma&quot;,
                &quot;nosotros&quot;). Al acceder o usar la Plataforma confirmas
                que:
              </p>
              <ul>
                <li>Tienes al menos 18 años o actúas con autorización de tu institución educativa.</li>
                <li>Has leído y comprendido estos Términos.</li>
                <li>Tienes la autoridad para aceptar estos Términos en nombre de tu organización, si aplica.</li>
              </ul>
            </div>
          </section>

          {/* 2 */}
          <section id="descripcion" className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <span>2</span> Descripción del servicio
            </h2>
            <div className={styles.sectionContent}>
              <p>
                {siteConfig.name} es una plataforma SaaS diseñada para la{" "}
                <strong>gestión y generación automática de horarios escolares</strong>.
                Ofrece herramientas para administrar docentes, materias, cursos,
                aulas y jornadas, detectar conflictos y exportar horarios.
              </p>
              <p>
                Nos reservamos el derecho de modificar, suspender o descontinuar
                cualquier funcionalidad del servicio en cualquier momento, con o
                sin previo aviso, sin responsabilidad hacia el Usuario.
              </p>
            </div>
          </section>

          {/* 3 */}
          <section id="cuentas" className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <span>3</span> Cuentas de usuario
            </h2>
            <div className={styles.sectionContent}>
              <p>
                Para acceder al servicio debes crear una cuenta. Eres responsable
                de:
              </p>
              <ul>
                <li>Mantener la confidencialidad de tus credenciales.</li>
                <li>Toda actividad que ocurra bajo tu cuenta.</li>
                <li>Notificarnos de inmediato ante cualquier uso no autorizado.</li>
              </ul>
              <p>
                No está permitido compartir credenciales entre distintas personas
                físicas ni crear cuentas de forma automatizada.
              </p>
            </div>
          </section>

          {/* 4 */}
          <section id="uso-aceptable" className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <span>4</span> Uso aceptable
            </h2>
            <div className={styles.sectionContent}>
              <p>Queda expresamente prohibido:</p>
              <ul>
                <li>Usar la Plataforma para fines ilegales o no autorizados.</li>
                <li>
                  Intentar acceder sin autorización a sistemas, cuentas o redes
                  relacionadas con la Plataforma.
                </li>
                <li>
                  Cargar contenido malicioso, engañoso, difamatorio, obsceno o
                  que infrinja derechos de terceros.
                </li>
                <li>
                  Realizar ingeniería inversa, descompilar o desensamblar cualquier
                  parte del software.
                </li>
                <li>
                  Revender, sublicenciar o transferir el acceso a la Plataforma
                  sin autorización escrita.
                </li>
              </ul>
            </div>
          </section>

          {/* 5 */}
          <section id="datos" className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <span>5</span> Datos y privacidad
            </h2>
            <div className={styles.sectionContent}>
              <p>
                El tratamiento de tus datos personales se rige por nuestra{" "}
                <Link href="/legal/privacy">Política de Privacidad</Link>, que
                forma parte integral de estos Términos. Al usar el servicio
                consientes dicho tratamiento.
              </p>
              <p>
                Los datos ingresados por ti (horarios, docentes, alumnos, etc.)
                son de tu propiedad. Nos otorgas una licencia limitada, no
                exclusiva, para procesarlos únicamente con el fin de prestar el
                servicio.
              </p>
            </div>
          </section>

          {/* 6 */}
          <section id="propiedad" className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <span>6</span> Propiedad intelectual
            </h2>
            <div className={styles.sectionContent}>
              <p>
                La Plataforma, incluyendo su código fuente, diseño, algoritmos,
                logotipos y marca, es propiedad exclusiva de{" "}
                <strong>{siteConfig.name}</strong> y está protegida por las leyes
                de propiedad intelectual aplicables.
              </p>
              <p>
                Se te otorga una licencia limitada, revocable, no exclusiva e
                intransferible para usar la Plataforma de acuerdo con estos
                Términos. No se transfiere ningún derecho de propiedad.
              </p>
            </div>
          </section>

          {/* 7 */}
          <section id="pagos" className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <span>7</span> Planes y pagos
            </h2>
            <div className={styles.sectionContent}>
              <p>
                Algunos planes tienen cargos. Al suscribirte a un plan de pago
                aceptas:
              </p>
              <ul>
                <li>
                  Pagar las tarifas vigentes según el ciclo de facturación
                  seleccionado (mensual o anual).
                </li>
                <li>
                  Que el cobro se realiza de forma anticipada y es no reembolsable,
                  salvo lo dispuesto por la ley aplicable.
                </li>
                <li>
                  Que podemos modificar precios notificándote con al menos 30 días
                  de antelación.
                </li>
              </ul>
              <p>
                El incumplimiento de pago puede derivar en la suspensión o
                cancelación de tu cuenta.
              </p>
            </div>
          </section>

          {/* 8 */}
          <section id="suspension" className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <span>8</span> Suspensión y terminación
            </h2>
            <div className={styles.sectionContent}>
              <p>
                Podemos suspender o terminar tu acceso de forma inmediata si
                incumples estos Términos, previa notificación cuando sea
                razonablemente posible. Puedes cancelar tu cuenta en cualquier
                momento desde la configuración de tu perfil.
              </p>
              <p>
                Tras la cancelación, dispondrás de 30 días para exportar tus
                datos. Transcurrido ese plazo, podremos eliminar permanentemente
                la información asociada a tu cuenta.
              </p>
            </div>
          </section>

          {/* 9 */}
          <section id="garantias" className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <span>9</span> Exclusión de garantías
            </h2>
            <div className={styles.sectionContent}>
              <p>
                La Plataforma se proporciona <strong>&quot;tal cual&quot;</strong> y{" "}
                <strong>&quot;según disponibilidad&quot;</strong>. No garantizamos
                que el servicio sea ininterrumpido, libre de errores o que cumpla
                todos tus requisitos específicos.
              </p>
            </div>
          </section>

          {/* 10 */}
          <section id="limitacion" className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <span>10</span> Limitación de responsabilidad
            </h2>
            <div className={styles.sectionContent}>
              <p>
                En la máxima medida permitida por la ley, {siteConfig.name} no
                será responsable de daños indirectos, incidentales, especiales,
                consecuentes o punitivos, ni de pérdida de datos o beneficios,
                derivados del uso o imposibilidad de uso del servicio.
              </p>
              <p>
                Nuestra responsabilidad total no excederá el importe pagado por ti
                en los doce (12) meses anteriores al evento que originó el
                reclamo.
              </p>
            </div>
          </section>

          {/* 11 */}
          <section id="ley" className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <span>11</span> Ley aplicable y jurisdicción
            </h2>
            <div className={styles.sectionContent}>
              <p>
                Estos Términos se rigen por las leyes de la República Argentina.
                Cualquier controversia será sometida a los tribunales ordinarios
                competentes, renunciando a cualquier otro fuero que pudiera
                corresponder.
              </p>
            </div>
          </section>

          {/* 12 */}
          <section id="cambios" className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <span>12</span> Cambios a los términos
            </h2>
            <div className={styles.sectionContent}>
              <p>
                Podemos actualizar estos Términos periódicamente. Te notificaremos
                por correo electrónico o mediante un aviso visible en la Plataforma
                con al menos 15 días de anticipación para cambios materiales. El
                uso continuado del servicio tras la fecha de vigencia implica la
                aceptación de los nuevos Términos.
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
                Si tienes dudas sobre estos Términos, contáctanos en:{" "}
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
