import { useState, useRef, useEffect } from 'react';
import {
  CalendarDays, Mail, Lock, User as UserIcon, ArrowRight, Eye, EyeOff,
  ArrowLeft, Shield, Megaphone, Check, AlertCircle, Sparkles, ChevronDown,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import type { Role } from '@/types';

type Mode = 'signin' | 'signup';
type Portal = 'main' | 'admin';
type SelectedRole = 'customer' | 'organizer';

const roleChoices: {
  role: SelectedRole;
  label: string;
  description: string;
  icon: typeof UserIcon;
  gradient: string;
  ring: string;
}[] = [
  {
    role: 'customer',
    label: 'Customer',
    description: 'Browse events, book tickets, and track your bookings.',
    icon: UserIcon,
    gradient: 'from-brand-500 to-brand-700',
    ring: 'ring-brand-500',
  },
  {
    role: 'organizer',
    label: 'Event Manager',
    description: 'Create events, manage bookings, and run promotions.',
    icon: Megaphone,
    gradient: 'from-accent-500 to-accent-700',
    ring: 'ring-accent-500',
  },
];

const demoAccounts: { role: Role; label: string; email: string; icon: typeof Shield }[] = [
  { role: 'customer', label: 'Customer', email: 'sam.rivera@gmail.com', icon: UserIcon },
  { role: 'organizer', label: 'Event Manager', email: 'jamie@brightlightevents.com', icon: Megaphone },
];

const DEMO_PASSWORD = 'demo1234';

export default function LoginPage() {
  const { loginWithCredentials, register, switchRole } = useAuth();
  const [portal, setPortal] = useState<Portal>('main');
  const [selectedRole, setSelectedRole] = useState<SelectedRole | null>(null);
  const [mode, setMode] = useState<Mode>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [demoOpen, setDemoOpen] = useState(false);
  const demoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (demoRef.current && !demoRef.current.contains(e.target as Node)) {
        setDemoOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const resetForm = () => {
    setSelectedRole(null);
    setMode('signin');
    setName('');
    setEmail('');
    setPassword('');
    setError('');
  };

  const handleRoleSelect = (role: SelectedRole) => {
    setSelectedRole(role);
    setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
      if (portal === 'admin') {
        const result = loginWithCredentials(email, password);
        if (!result.success) {
          setError(result.error ?? 'Invalid administrator credentials.');
          setLoading(false);
        }
        return;
      }

      if (mode === 'signin') {
        const result = loginWithCredentials(email, password);
        if (!result.success) {
          setError(result.error ?? 'Unable to sign in.');
          setLoading(false);
        }
      } else {
        if (name.trim().length < 2) {
          setError('Please enter your full name.');
          setLoading(false);
          return;
        }
        if (password.length < 6) {
          setError('Password must be at least 6 characters.');
          setLoading(false);
          return;
        }
        const result = register(name, email, password, selectedRole as Role);
        if (!result.success) {
          setError(result.error ?? 'Unable to create account.');
          setLoading(false);
        }
      }
    }, 400);
  };

  const fillDemo = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword(DEMO_PASSWORD);
    setMode('signin');
    setDemoOpen(false);
    setError('');
  };

  const quickDemoLogin = (role: Role) => {
    switchRole(role);
  };

  const showRoleSelection = portal === 'main' && !selectedRole;

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gray-50">
      {/* Decorative background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-brand-200/40 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-accent-200/40 blur-3xl" />
        <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-success-200/30 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md px-4 py-12 md:px-6">
        {/* Logo header */}
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-lg shadow-brand-600/20">
            {portal === 'admin' ? <Shield className="h-7 w-7" /> : <CalendarDays className="h-7 w-7" />}
          </div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-gray-900">
            Event<span className="text-brand-600">Hub</span>
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            {portal === 'admin'
              ? 'Administrator Portal — authorized access only.'
              : 'Your all-in-one platform for event management.'}
          </p>
        </div>

        <div className="card animate-slide-up p-6 sm:p-8">
          {showRoleSelection ? (
            /* ─── Step 1: Role Selection ─── */
            <div className="space-y-4">
              <div className="mb-2 text-center">
                <h2 className="font-display text-xl font-bold text-gray-900">Get Started</h2>
                <p className="mt-1 text-sm text-gray-500">Are you a Customer or an Event Manager?</p>
              </div>

              <div className="space-y-3">
                {roleChoices.map((choice, index) => {
                  const Icon = choice.icon;
                  return (
                    <button
                      key={choice.role}
                      onClick={() => handleRoleSelect(choice.role)}
                      className={`group flex w-full items-center gap-4 rounded-xl border-2 p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-cardhover animate-slide-up ${
                        'border-gray-200 hover:border-gray-300'
                      }`}
                      style={{ animationDelay: `${index * 80}ms` }}
                    >
                      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${choice.gradient} text-white shadow-md`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-display text-base font-bold text-gray-900">{choice.label}</h3>
                        <p className="mt-0.5 text-xs leading-relaxed text-gray-500">{choice.description}</p>
                      </div>
                      <ArrowRight className="h-5 w-5 shrink-0 text-gray-300 transition-colors group-hover:text-brand-500" />
                    </button>
                  );
                })}
              </div>

              {/* Admin link */}
              <div className="pt-4 text-center">
                <button
                  onClick={() => { setPortal('admin'); setError(''); }}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-400 transition hover:text-brand-600"
                >
                  <Shield className="h-3.5 w-3.5" />
                  Administrator Access
                </button>
              </div>
            </div>

          ) : (
            /* ─── Step 2: Auth Form ─── */
            <>
              {/* Back button + role context */}
              {portal === 'main' && (
                <div className="mb-5 flex items-center gap-3">
                  <button
                    onClick={resetForm}
                    className="flex items-center gap-1 text-sm font-medium text-gray-500 transition hover:text-gray-700"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                  </button>
                  <div className="ml-auto flex items-center gap-2">
                    {(() => {
                      const choice = roleChoices.find((c) => c.role === selectedRole);
                      if (!choice) return null;
                      const Icon = choice.icon;
                      return (
                        <span className={`badge bg-gradient-to-r ${choice.gradient} text-white`}>
                          <Icon className="h-3 w-3" />
                          {choice.label}
                        </span>
                      );
                    })()}
                  </div>
                </div>
              )}

              {portal === 'admin' && (
                <div className="mb-5">
                  <button
                    onClick={() => { setPortal('main'); resetForm(); }}
                    className="flex items-center gap-1 text-sm font-medium text-gray-500 transition hover:text-gray-700"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back to main
                  </button>
                </div>
              )}

              {/* Tab switcher — only for main portal */}
              {portal === 'main' && (
                <div className="mb-6 flex rounded-lg bg-gray-100 p-1">
                  <button
                    onClick={() => { setMode('signin'); setError(''); }}
                    className={`flex-1 rounded-md py-2 text-sm font-semibold transition-all ${
                      mode === 'signin' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => { setMode('signup'); setError(''); }}
                    className={`flex-1 rounded-md py-2 text-sm font-semibold transition-all ${
                      mode === 'signup' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Sign Up
                  </button>
                </div>
              )}

              {portal === 'admin' && (
                <h2 className="mb-6 font-display text-xl font-bold text-gray-900">Admin Sign In</h2>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === 'signup' && portal === 'main' && (
                  <div className="animate-fade-in">
                    <label className="label" htmlFor="name">Full Name</label>
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <input
                        id="name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Jane Smith"
                        className="input pl-10"
                        autoComplete="name"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="label" htmlFor="email">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="input pl-10"
                      autoComplete="email"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="label" htmlFor="password">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={mode === 'signup' ? 'At least 6 characters' : 'Enter your password'}
                      className="input px-10"
                      autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-2 rounded-lg bg-error-50 px-3 py-2.5 text-sm text-error-700 animate-fade-in">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {error}
                  </div>
                )}

                <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base">
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Please wait...
                    </span>
                  ) : (
                    <>
                      {portal === 'admin'
                        ? 'Sign In as Administrator'
                        : mode === 'signin'
                          ? 'Sign In'
                          : 'Create Account'}
                      <ArrowRight className="h-5 w-5" />
                    </>
                  )}
                </button>
              </form>

              {/* Divider + Demo — only for main portal */}
              {portal === 'main' && (
                <>
                  <div className="my-6 flex items-center gap-3">
                    <div className="h-px flex-1 bg-gray-200" />
                    <span className="text-xs font-medium text-gray-400">or</span>
                    <div className="h-px flex-1 bg-gray-200" />
                  </div>

                  <div className="space-y-3" ref={demoRef}>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setDemoOpen((o) => !o)}
                        className="btn-secondary w-full"
                      >
                        <Sparkles className="h-4 w-4 text-brand-500" />
                        Quick Demo Login
                        <ChevronDown className={`h-4 w-4 transition-transform ${demoOpen ? 'rotate-180' : ''}`} />
                      </button>

                      {demoOpen && (
                        <div className="absolute bottom-full left-0 right-0 mb-2 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-cardhover animate-scale-in">
                          {demoAccounts.map((demo) => {
                            const Icon = demo.icon;
                            return (
                              <div key={demo.role} className="group flex items-center gap-3 border-b border-gray-50 px-4 py-3 transition last:border-0 hover:bg-gray-50">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                                  <Icon className="h-4 w-4" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="text-sm font-semibold text-gray-900">{demo.label}</p>
                                  <p className="truncate text-xs text-gray-400">{demo.email}</p>
                                </div>
                                <div className="flex gap-1">
                                  <button
                                    onClick={() => fillDemo(demo.email)}
                                    className="rounded-md px-2 py-1 text-xs font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                                  >
                                    Fill
                                  </button>
                                  <button
                                    onClick={() => quickDemoLogin(demo.role)}
                                    className="flex items-center gap-1 rounded-md bg-brand-50 px-2 py-1 text-xs font-semibold text-brand-600 hover:bg-brand-100"
                                  >
                                    <Check className="h-3 w-3" />
                                    Login
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                    <p className="text-center text-xs text-gray-400">
                      Demo accounts use any password. Use "Login" for instant access.
                    </p>
                  </div>
                </>
              )}

              {portal === 'admin' && (
                <div className="mt-6 space-y-3">
                  <div className="rounded-lg bg-gray-50 px-4 py-3 text-center">
                    <p className="text-xs text-gray-500">
                      Demo admin email: <span className="font-medium text-gray-700">alex.admin@eventhub.com</span>
                    </p>
                    <p className="mt-1 text-xs text-gray-500">Any password will work for the demo.</p>
                  </div>
                  <button
                    onClick={() => quickDemoLogin('admin')}
                    className="btn-secondary w-full"
                  >
                    <Shield className="h-4 w-4 text-brand-500" />
                    Quick Admin Demo Login
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Admin link at the very bottom — only on role selection screen */}
        {showRoleSelection && null}
      </div>
    </div>
  );
}
