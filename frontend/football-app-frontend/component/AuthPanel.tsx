'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { API_CONFIG } from '@/utils/constants';

interface AuthResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    provider: string;
  };
}

type AuthMode = 'login' | 'register';

const parseJsonSafely = async (res: Response) => {
  const raw = await res.text();
  try {
    return { json: JSON.parse(raw), raw };
  } catch {
    return { json: null, raw };
  }
};

export default function AuthPanel() {
  const [mode, setMode] = useState<AuthMode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [backendStatus, setBackendStatus] = useState<'checking' | 'ok' | 'down'>('checking');
  const googleButtonRef = useRef<HTMLDivElement | null>(null);

  const authBase = `${API_CONFIG.BASE_URL}/api/auth`;

  const handleSuccess = (authData: AuthResponse) => {
    localStorage.setItem('authToken', authData.token);
    localStorage.setItem('authUser', JSON.stringify(authData.user));
    setMessage(`Signed in as ${authData.user.email} (${authData.user.role})`);
  };

  const callAuth = async (endpoint: string, body: Record<string, string>) => {
    setLoading(true);
    setMessage('');
    try {
      const res = await fetch(`${authBase}/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const { json, raw } = await parseJsonSafely(res);
      if (!res.ok) {
        const msg =
          res.status === 404
            ? 'Auth API not found (404). Start backend from Backend/football-app-backend and verify NEXT_PUBLIC_API_BASE_URL.'
            : json?.message || `Auth failed (${res.status})`;
        throw new Error(msg);
      }
      if (!json?.token) {
        throw new Error(
          raw.startsWith('<')
            ? 'Auth endpoint returned HTML. Check NEXT_PUBLIC_API_BASE_URL for frontend deployment.'
            : 'Unexpected auth response.'
        );
      }
      handleSuccess(json as AuthResponse);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unexpected error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const checkBackend = async () => {
      try {
        const res = await fetch(`${API_CONFIG.BASE_URL}/api/test`);
        setBackendStatus(res.ok ? 'ok' : 'down');
      } catch {
        setBackendStatus('down');
      }
    };

    checkBackend();
  }, []);

  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    let mounted = true;
    let timer: ReturnType<typeof setInterval> | null = null;

    const tryInitGoogle = () => {
      const w = window as any;
      if (!mounted || !clientId || !googleButtonRef.current || !w.google?.accounts?.id) {
        return false;
      }

      w.google.accounts.id.initialize({
        client_id: clientId,
        callback: async (response: { credential?: string }) => {
          if (!response?.credential) {
            setMessage('Google login failed. Missing credential.');
            return;
          }
          await callAuth('google', { idToken: response.credential });
        },
      });

      googleButtonRef.current.innerHTML = '';
      w.google.accounts.id.renderButton(googleButtonRef.current, {
        type: 'standard',
        theme: 'outline',
        size: 'large',
        shape: 'pill',
        text: 'continue_with',
        width: 320,
      });
      return true;
    };

    if (!tryInitGoogle()) {
      timer = setInterval(() => {
        if (tryInitGoogle() && timer) {
          clearInterval(timer);
        }
      }, 250);
    }

    return () => {
      mounted = false;
      if (timer) clearInterval(timer);
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-xl mx-auto px-4 py-8 sm:py-12">
        <Link href="/" className="text-sm text-slate-600 hover:text-slate-900">
          Back to dashboard
        </Link>
        <Card className="mt-4 rounded-2xl border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-2xl">Sign In</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Button
                className="flex-1"
                variant={mode === 'login' ? 'default' : 'outline'}
                onClick={() => setMode('login')}
              >
                Login
              </Button>
              <Button
                className="flex-1"
                variant={mode === 'register' ? 'default' : 'outline'}
                onClick={() => setMode('register')}
              >
                Register
              </Button>
            </div>

            {mode === 'register' && (
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full Name"
              />
            )}

            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              type="email"
            />
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
            />

            <Button
              disabled={loading}
              className="w-full"
              onClick={() =>
                callAuth(mode === 'login' ? 'login' : 'register', {
                  name,
                  email,
                  password,
                })
              }
            >
              {loading ? 'Please wait...' : mode === 'login' ? 'Login' : 'Create Account'}
            </Button>

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-slate-500">or continue with</span>
              </div>
            </div>

            <div className="flex justify-center">
              <div ref={googleButtonRef} />
            </div>
            {!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID && (
              <p className="text-xs text-amber-700 bg-amber-50 p-2 rounded">
                Google login is disabled: set `NEXT_PUBLIC_GOOGLE_CLIENT_ID`.
              </p>
            )}

            {backendStatus !== 'ok' && (
              <p className="text-xs text-amber-700 bg-amber-50 p-2 rounded">
                Backend is not reachable at {API_CONFIG.BASE_URL}. Start backend and verify `NEXT_PUBLIC_API_BASE_URL`.
              </p>
            )}

            {message && (
              <p className="text-sm bg-slate-100 p-3 rounded-md break-words">{message}</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
