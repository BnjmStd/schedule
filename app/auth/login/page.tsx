'use client';

import { useState } from 'react';
import { siteConfig } from '@/config/site';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Email o contraseña incorrectos');
      } else {
        router.push('/dashboard');
        router.refresh();
      }
    } catch (error) {
      setError('Ocurrió un error. Por favor intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-layout">
      <div className="auth-card">
        {/* Logo */}
        <Link href="/" className="auth-logo">
          <div className="auth-logo-icon">
            <span>📅</span>
          </div>
          <span className="auth-logo-text">
            {siteConfig.name}
          </span>
        </Link>

        <Card className="shadow-2xl border-2 border-white">
          <CardContent className="p-8">
            <div className="auth-header">
              <h1 className="auth-title">
                Bienvenido de nuevo
              </h1>
              <p className="auth-description">
                Ingresa a tu cuenta para continuar
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-4 rounded-lg bg-danger-50 border border-danger-200 text-danger-700 text-sm">
                  {error}
                </div>
              )}

              <div>
                <Input
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  required
                />
              </div>

              <div>
                <Input
                  label="Contraseña"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="checkbox"
                  />
                  <span className="text-neutral-600">Recordarme</span>
                </label>
                <Link
                  href="/auth/forgot-password"
                  className="text-primary-600 hover:text-primary-700 font-medium"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>

              <Button
                type="submit"
                className="w-full"
                size="lg"
                isLoading={isLoading}
              >
                Iniciar Sesión
              </Button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-neutral-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-neutral-500">
                    ¿Nuevo en {siteConfig.name}?
                  </span>
                </div>
              </div>

              <Link href="/auth/register">
                <Button variant="outline" className="w-full" size="lg">
                  Crear una cuenta
                </Button>
              </Link>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-neutral-600 mt-8">
          Al continuar, aceptas nuestros{' '}
          <a href="#terms" className="text-primary-600 hover:underline">
            Términos de Servicio
          </a>{' '}
          y{' '}
          <a href="#privacy" className="text-primary-600 hover:underline">
            Política de Privacidad
          </a>
        </p>
      </div>
    </div>
  );
}
