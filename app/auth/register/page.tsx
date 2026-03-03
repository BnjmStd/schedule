"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { siteConfig } from "@/config/site";

// ─── Tipos locales ─────────────────────────────────────────────────────────
interface FormData {
  // Paso 1 – Datos institucionales
  schoolName: string;
  schoolAddress: string;
  schoolPhone: string;
  schoolEmail: string;
  schoolCountry: string;
  schoolRut: string;
  // Paso 2 – Datos del administrador
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const STEPS = ["Datos del Colegio", "Administrador"] as const;
const ADMIN_ROLES = new Set(["OWNER", "ADMIN", "SUPER_ADMIN"]);

// ─── Componente ────────────────────────────────────────────────────────────
export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<FormData>({
    schoolName: "",
    schoolAddress: "",
    schoolPhone: "",
    schoolEmail: "",
    schoolCountry: "",
    schoolRut: "",
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const set =
    (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setFormData((prev) => ({ ...prev, [field]: e.target.value }));

  // ── Validación paso 1 ────────────────────────────────────────────────────
  const validateStep0 = () => {
    if (!formData.schoolName.trim() || formData.schoolName.trim().length < 2) {
      setError("El nombre del colegio debe tener al menos 2 caracteres");
      return false;
    }
    if (
      !formData.schoolAddress.trim() ||
      formData.schoolAddress.trim().length < 5
    ) {
      setError("La dirección debe tener al menos 5 caracteres");
      return false;
    }
    if (!formData.schoolCountry.trim()) {
      setError("El país es obligatorio");
      return false;
    }
    if (
      formData.schoolEmail &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.schoolEmail)
    ) {
      setError("El email institucional no es válido");
      return false;
    }
    return true;
  };

  // ── Avanzar al paso 2 ────────────────────────────────────────────────────
  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (validateStep0()) setStep(1);
  };

  // ── Envío final ──────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }
    if (formData.password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          schoolName: formData.schoolName.trim(),
          schoolAddress: formData.schoolAddress.trim(),
          schoolPhone: formData.schoolPhone.trim() || undefined,
          schoolEmail: formData.schoolEmail.trim() || undefined,
          schoolCountry: formData.schoolCountry.trim(),
          schoolRut: formData.schoolRut.trim() || undefined,
          name: formData.name.trim(),
          email: formData.email.trim(),
          password: formData.password,
          initialPlan: "FREE",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Ocurrió un error al crear la cuenta");
        return;
      }

      // Auto-login después del registro: llamar al endpoint de login
      const loginRes = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email.trim(),
          password: formData.password,
        }),
      });

      const loginData = await loginRes.json();

      if (!loginRes.ok) {
        // Registro exitoso pero login falló → redirigir al login normal
        router.push("/auth/login?registered=true");
        return;
      }

      // Redirigir según rol
      const role: string = loginData.user?.role ?? "STAFF";
      const destination = ADMIN_ROLES.has(role) ? "/dashboard" : "/dashboard";
      window.location.href = destination;
    } catch {
      setError("Ocurrió un error. Por favor intenta de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="auth-layout">
      <div className="auth-bg">
        <div className="auth-gradient"></div>
        <div className="auth-orb auth-orb-1"></div>
        <div className="auth-orb auth-orb-2"></div>
      </div>

      <div className="auth-card">
        {/* Logo */}
        <Link href="/" className="auth-logo">
          <div className="auth-logo-icon">
            <span>📅</span>
          </div>
          <span className="auth-logo-text">{siteConfig.name}</span>
        </Link>

        <div className="auth-form-card">
          {/* Header */}
          <div className="auth-header">
            <h1 className="auth-title">Registra tu colegio</h1>
            <p className="auth-description">
              {step === 0
                ? "Comienza configurando los datos de tu institución"
                : "Crea la cuenta del administrador principal"}
            </p>
          </div>

          {/* Indicador de pasos */}
          <div
            style={{
              display: "flex",
              gap: "0.5rem",
              marginBottom: "1.5rem",
              alignItems: "center",
            }}
          >
            {STEPS.map((label, i) => (
              <div
                key={label}
                style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
              >
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    background:
                      i <= step
                        ? "var(--accent, #6366f1)"
                        : "rgba(255,255,255,0.1)",
                    color: i <= step ? "#fff" : "rgba(255,255,255,0.4)",
                    transition: "background 0.2s",
                  }}
                >
                  {i < step ? "✓" : i + 1}
                </div>
                <span
                  style={{
                    fontSize: "0.75rem",
                    color:
                      i <= step
                        ? "rgba(255,255,255,0.9)"
                        : "rgba(255,255,255,0.4)",
                  }}
                >
                  {label}
                </span>
                {i < STEPS.length - 1 && (
                  <div
                    style={{
                      flex: 1,
                      height: 1,
                      background:
                        i < step
                          ? "var(--accent, #6366f1)"
                          : "rgba(255,255,255,0.1)",
                      minWidth: 20,
                    }}
                  />
                )}
              </div>
            ))}
          </div>

          {error && <div className="auth-error">{error}</div>}

          {/* ── PASO 1: Datos del colegio ── */}
          {step === 0 && (
            <form onSubmit={handleNextStep} className="space-y-5">
              <div className="auth-input-group">
                <label className="auth-input-label">
                  Nombre del colegio<span className="required">*</span>
                </label>
                <input
                  className="auth-input"
                  type="text"
                  value={formData.schoolName}
                  onChange={set("schoolName")}
                  placeholder="Colegio San Ignacio"
                  required
                />
              </div>

              <div className="auth-input-group">
                <label className="auth-input-label">
                  Dirección<span className="required">*</span>
                </label>
                <input
                  className="auth-input"
                  type="text"
                  value={formData.schoolAddress}
                  onChange={set("schoolAddress")}
                  placeholder="Av. Principal 1234, Santiago"
                  required
                />
              </div>

              <div className="auth-input-group">
                <label className="auth-input-label">
                  País<span className="required">*</span>
                </label>
                <input
                  className="auth-input"
                  type="text"
                  value={formData.schoolCountry}
                  onChange={set("schoolCountry")}
                  placeholder="Chile"
                  required
                />
              </div>

              <div className="auth-input-group">
                <label className="auth-input-label">Email institucional</label>
                <input
                  className="auth-input"
                  type="email"
                  value={formData.schoolEmail}
                  onChange={set("schoolEmail")}
                  placeholder="contacto@colegio.cl"
                />
              </div>

              <div className="auth-input-group">
                <label className="auth-input-label">Teléfono</label>
                <input
                  className="auth-input"
                  type="tel"
                  value={formData.schoolPhone}
                  onChange={set("schoolPhone")}
                  placeholder="+56 2 2345 6789"
                />
              </div>

              <div className="auth-input-group">
                <label className="auth-input-label">
                  RUT / Identificador oficial del establecimiento
                </label>
                <input
                  className="auth-input"
                  type="text"
                  value={formData.schoolRut}
                  onChange={set("schoolRut")}
                  placeholder="12.345.678-9"
                />
              </div>

              <button type="submit" className="auth-button auth-button-primary">
                Continuar →
              </button>
            </form>
          )}

          {/* ── PASO 2: Datos del administrador ── */}
          {step === 1 && (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="auth-input-group">
                <label className="auth-input-label">
                  Nombre completo<span className="required">*</span>
                </label>
                <input
                  className="auth-input"
                  type="text"
                  value={formData.name}
                  onChange={set("name")}
                  placeholder="Juan Pérez"
                  required
                />
              </div>

              <div className="auth-input-group">
                <label className="auth-input-label">
                  Email personal<span className="required">*</span>
                </label>
                <input
                  className="auth-input"
                  type="email"
                  value={formData.email}
                  onChange={set("email")}
                  placeholder="juan@email.com"
                  required
                />
              </div>

              <div className="auth-input-group">
                <label className="auth-input-label">
                  Contraseña<span className="required">*</span>
                </label>
                <div className="auth-input-wrapper">
                  <input
                    className="auth-input auth-input-with-icon"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={set("password")}
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    className="auth-input-icon"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={
                      showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                    }
                  >
                    {showPassword ? (
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="auth-input-group">
                <label className="auth-input-label">
                  Confirmar contraseña<span className="required">*</span>
                </label>
                <div className="auth-input-wrapper">
                  <input
                    className="auth-input auth-input-with-icon"
                    type={showConfirm ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={set("confirmPassword")}
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    className="auth-input-icon"
                    onClick={() => setShowConfirm((v) => !v)}
                    aria-label={
                      showConfirm ? "Ocultar contraseña" : "Mostrar contraseña"
                    }
                  >
                    {showConfirm ? (
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div style={{ display: "flex", gap: "0.75rem" }}>
                <button
                  type="button"
                  className="auth-button auth-button-outline"
                  style={{ flex: 1 }}
                  onClick={() => {
                    setError("");
                    setStep(0);
                  }}
                  disabled={isLoading}
                >
                  ← Volver
                </button>
                <button
                  type="submit"
                  className="auth-button auth-button-primary"
                  style={{ flex: 2 }}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="auth-button-spinner"></span>
                  ) : null}
                  {isLoading ? "Creando cuenta..." : "Crear cuenta"}
                </button>
              </div>
            </form>
          )}

          <div className="auth-divider">
            <div className="auth-divider-line">
              <div></div>
            </div>
            <div className="auth-divider-text">
              <span>¿Ya tienes una cuenta?</span>
            </div>
          </div>

          <Link href="/auth/login">
            <button type="button" className="auth-button auth-button-outline">
              Iniciar Sesión
            </button>
          </Link>
        </div>

        <p className="auth-footer">
          Al crear una cuenta, aceptas nuestros{" "}
          <a href="#terms">Términos de Servicio</a> y{" "}
          <a href="#privacy">Política de Privacidad</a>
        </p>
      </div>
    </div>
  );
}
