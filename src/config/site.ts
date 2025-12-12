/**
 * Configuración del sitio
 * Centraliza nombres, URLs y metadatos del proyecto
 */

export const siteConfig = {
  name: "BBschedule",
  description: "Sistema de Horarios Escolares",
  tagline: "La plataforma líder en gestión de horarios escolares",
  url: "https://bbschedule.com",
  domain: "bbschedule.com",
  email: {
    support: "soporte@bbschedule.com",
    demo: "demo@bbschedule.com",
    contact: "contacto@bbschedule.com",
  },
  social: {
    twitter: "@bbschedule",
    github: "https://github.com/bbschedule",
  },
  metadata: {
    title: "BBschedule - Sistema de Horarios Escolares",
    description: "La plataforma más avanzada para gestionar horarios escolares. Automatiza la asignación, detecta conflictos y optimiza recursos con IA.",
    keywords: ["horarios", "escolares", "gestión", "educación", "saas"],
  },
} as const;
