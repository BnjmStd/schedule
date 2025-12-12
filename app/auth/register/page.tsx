"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { siteConfig } from "@/config/site";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent } from "@/components/ui/Card";
import { hash } from "bcryptjs";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validaciones
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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Ocurrió un error al crear la cuenta");
        return;
      }

      // Redirigir al login después del registro exitoso
      router.push("/auth/login?registered=true");
    } catch (error) {
      setError("Ocurrió un error. Por favor intenta de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-primary-50 via-accent-50 to-secondary-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-linear-to-br from-primary-400 to-accent-500 flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-2xl">📅</span>
          </div>
          <span className="text-2xl font-bold bg-linear-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
            {siteConfig.name}
          </span>
        </Link>

        <Card className="shadow-2xl border-2 border-white">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-neutral-900 mb-2">
                Crea tu cuenta
              </h1>
              <p className="text-neutral-600">
                Comienza gratis, sin tarjeta de crédito
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-4 rounded-lg bg-danger-50 border border-danger-200 text-danger-700 text-sm">
                  {error}
                </div>
              )}

              <div>
                <Input
                  label="Nombre completo"
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Juan Pérez"
                  required
                />
              </div>

              <div>
                <Input
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="tu@email.com"
                  required
                />
              </div>

              <div>
                <Input
                  label="Contraseña"
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  placeholder="••••••••"
                  required
                />
              </div>

              <div>
                <Input
                  label="Confirmar contraseña"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      confirmPassword: e.target.value,
                    })
                  }
                  placeholder="••••••••"
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                size="lg"
                isLoading={isLoading}
              >
                Crear Cuenta
              </Button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-neutral-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-neutral-500">
                    ¿Ya tienes una cuenta?
                  </span>
                </div>
              </div>

              <Link href="/auth/login">
                <Button variant="outline" className="w-full" size="lg">
                  Iniciar Sesión
                </Button>
              </Link>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-neutral-600 mt-8">
          Al crear una cuenta, aceptas nuestros{" "}
          <a href="#terms" className="text-primary-600 hover:underline">
            Términos de Servicio
          </a>{" "}
          y{" "}
          <a href="#privacy" className="text-primary-600 hover:underline">
            Política de Privacidad
          </a>
        </p>
      </div>
    </div>
  );
}
