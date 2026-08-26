import { useState } from 'react';
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Flame,
  Loader2,
  Lock,
  Mail,
  Shield,
  TrendingUp,
  Trophy,
  Users,
  Zap,
} from 'lucide-react';
import { supabase, type AppRole, type Member } from '@/lib/supabase';

interface LandingPageProps {
  onLogin: (member: Member, role: AppRole) => void;
}

export function LandingPage({ onLogin }: LandingPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError('Please enter your email and password.');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .eq('email', email.trim().toLowerCase())
        .maybeSingle();

      if (error) throw error;
      if (!data) {
        setError('No member found with that email. Check with your society admin.');
        setLoading(false);
        return;
      }

      const member = data as Member;
      if (member.status === 'inactive') {
        setError('Your account is inactive. Contact your society admin.');
        setLoading(false);
        return;
      }

      onLogin(member, member.app_role);
    } catch {
      setError('Unable to sign in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('demo1234');
  };

  return (
    <div className="min-h-screen bg-ink-50">
      {/* Top nav */}
      <header className="border-b border-ink-100 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-glow">
              <Flame className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-display text-base font-extrabold leading-tight text-ink-900 sm:text-lg">
                Society Activity Tracker
              </h1>
              <p className="text-xs text-ink-500">Member engagement & contribution ledger</p>
            </div>
          </div>
          <a
            href="#login"
            className="btn-secondary hidden sm:inline-flex"
          >
            Sign in <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-20">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            {/* Left: copy */}
            <div className="animate-fade-in">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-700">
                <Zap className="h-3.5 w-3.5" />
                Built for college societies & clubs
              </div>
              <h2 className="font-display text-3xl font-extrabold leading-tight text-ink-900 sm:text-4xl">
                Track every member's
                <span className="bg-gradient-to-r from-brand-500 to-brand-700 bg-clip-text text-transparent"> activity </span>
                in one place.
              </h2>
              <p className="mt-4 max-w-md text-base text-ink-600">
                Record attendance, log contributions, and automatically detect who's going
                inactive — all with a live activity score for every member.
              </p>

              <div className="mt-8 grid grid-cols-2 gap-4">
                <Feature icon={<CheckCircle2 className="h-5 w-5" />} title="Code Check-ins" desc="Verify attendance with unique event codes" />
                <Feature icon={<ClipboardList className="h-5 w-5" />} title="Contributions" desc="Log work across six categories" />
                <Feature icon={<TrendingUp className="h-5 w-5" />} title="Activity Scores" desc="Attendance + contribution points" />
                <Feature icon={<Users className="h-5 w-5" />} title="Inactivity Alerts" desc="Auto-flag dropped participation" />
              </div>
            </div>

            {/* Right: login card */}
            <div id="login" className="animate-scale-in">
              <div className="card mx-auto max-w-md p-7">
                <div className="mb-6 text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
                    <Lock className="h-6 w-6" />
                  </div>
                  <h3 className="font-display text-xl font-bold text-ink-900">Sign in to your workspace</h3>
                  <p className="mt-1 text-sm text-ink-500">Use your society-registered email to continue.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="label">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
                      <input
                        className="input pl-10"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="aarav@dtu-society.in"
                        autoFocus
                      />
                    </div>
                  </div>
                  <div>
                    <label className="label">Password</label>
                    <input
                      className="input"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                    />
                  </div>

                  {error && (
                    <div className="rounded-xl bg-error-50 px-3.5 py-2.5 text-sm font-medium text-error-700">
                      {error}
                    </div>
                  )}

                  <button type="submit" disabled={loading} className="btn-primary w-full">
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Signing in…
                      </>
                    ) : (
                      <>
                        Sign in <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </form>

                <div className="mt-5 border-t border-ink-100 pt-4">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-400">
                    Demo accounts — click to fill
                  </p>
                  <div className="space-y-2">
                    <DemoButton
                      icon={<Shield className="h-4 w-4" />}
                      label="Admin — Aarav Mehta"
                      email="aarav@dtu-society.in"
                      onClick={fillDemo}
                    />
                    <DemoButton
                      icon={<Users className="h-4 w-4" />}
                      label="Member — Diya Sharma"
                      email="diya@dtu-society.in"
                      onClick={fillDemo}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Background decoration */}
        <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-brand-100/40 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-accent-100/30 blur-3xl" />
      </section>

      {/* Stats strip */}
      <section className="border-t border-ink-100 bg-white">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-4 py-8 sm:px-6 sm:grid-cols-4">
          <StatBadge icon={<Users className="h-5 w-5" />} value="5" label="Members" />
          <StatBadge icon={<CalendarDays className="h-5 w-5" />} value="4" label="Events" />
          <StatBadge icon={<Trophy className="h-5 w-5" />} value="6" label="Categories" />
          <StatBadge icon={<TrendingUp className="h-5 w-5" />} value="Live" label="Activity Scores" />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-ink-100 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-6 text-sm text-ink-500 sm:flex-row sm:px-6">
          <div className="flex items-center gap-2">
            <Flame className="h-4 w-4 text-brand-500" />
            <span>Society Activity Tracker</span>
          </div>
          <p>Member engagement & contribution ledger</p>
        </div>
      </footer>
    </div>
  );
}

function Feature({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-ink-100 bg-white p-3.5">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
        {icon}
      </div>
      <div>
        <p className="text-sm font-bold text-ink-800">{title}</p>
        <p className="text-xs text-ink-500">{desc}</p>
      </div>
    </div>
  );
}

function StatBadge({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-ink-50 text-ink-500">
        {icon}
      </div>
      <div>
        <div className="font-display text-xl font-extrabold text-ink-900">{value}</div>
        <div className="text-xs text-ink-500">{label}</div>
      </div>
    </div>
  );
}

function DemoButton({
  icon,
  label,
  email,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  email: string;
  onClick: (email: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onClick(email)}
      className="flex w-full items-center gap-2.5 rounded-lg border border-ink-100 bg-ink-50/50 px-3 py-2 text-left text-sm text-ink-600 transition-colors hover:border-brand-200 hover:bg-brand-50"
    >
      <span className="text-ink-400">{icon}</span>
      <span className="font-medium">{label}</span>
      <ArrowRight className="ml-auto h-3.5 w-3.5 text-ink-300" />
    </button>
  );
}


