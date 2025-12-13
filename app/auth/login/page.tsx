"use client";

import { useState } from "react";
import { siteConfig } from "@/config/site";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Error al iniciar sesión");
        setIsLoading(false);
        return;
      }

      // Redirigir al dashboard
      window.location.href = "/dashboard";
    } catch (error) {
      console.error("Login error:", error);
      setError("Ocurrió un error. Por favor intenta de nuevo.");
      setIsLoading(false);
    }
  };

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
          <div className="auth-header">
            <h1 className="auth-title">Bienvenido de nuevo</h1>
            <p className="auth-description">
              Ingresa a tu cuenta para continuar
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && <div className="auth-error">{error}</div>}

            <div className="auth-input-group">
              <label className="auth-input-label">
                Email<span className="required">*</span>
              </label>
              <input
                className="auth-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  className="auth-input-icon"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showPassword ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                      <line x1="1" y1="1" x2="23" y2="23"></line>
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="auth-checkbox-label">
                <input type="checkbox" className="checkbox" />
                <span>Recordarme</span>
              </label>
              <Link href="/auth/forgot-password" className="auth-link">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            <button
              type="submit"
              className="auth-button auth-button-primary"
              disabled={isLoading}
            >
              {isLoading ? <span className="auth-button-spinner"></span> : null}
              Iniciar Sesión
            </button>

            <div className="auth-divider">
              <div className="auth-divider-line">
                <div></div>
              </div>
              <div className="auth-divider-text">
                <span>¿Nuevo en {siteConfig.name}?</span>
              </div>
            </div>

            <Link href="/auth/register">
              <button type="button" className="auth-button auth-button-outline">
                Crear una cuenta
              </button>
            </Link>
          </form>
        </div>

        <p className="auth-footer">
          Al continuar, aceptas nuestros{" "}
          <a href="#terms">Términos de Servicio</a> y{" "}
          <a href="#privacy">Política de Privacidad</a>
        </p>
      </div>
    </div>
  );
}
