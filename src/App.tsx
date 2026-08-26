import { useMemo, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  CalendarDays,
  CalendarPlus,
  CheckCircle2,
  ClipboardList,
  Flame,
  LayoutDashboard,
  LogOut,
  Mail,
  Plus,
  Search,
  Shield,
  TrendingUp,
  Trophy,
  UserCog,
  UserPlus,
  Users,
  QrCode,
  KeyRound,
  Award,
  Sparkles,
  Clock,
  Target,
  Zap,
  AlertCircle,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import {
  CATEGORIES,
  CATEGORY_META,
  EVENT_POINTS,
  EVENT_TYPE_META,
  EVENT_TYPES,
  INACTIVITY_WINDOW,
  ROLE_OPTIONS,
  TEAM_OPTIONS,
  ACTIVITY_STATE_META,
  type AppRole,
  type ContributionCategory,
  type EventType,
  type Member,
  type MemberScore,
} from '@/lib/supabase';
import { useSocietyData, computeScores } from '@/hooks/useSocietyData';
import { Modal } from '@/components/Modal';
import { toast } from '@/components/Toast';
import { ToastHost } from '@/components/Toast';
import { LandingPage } from '@/components/LandingPage';
import {
  ActivityStateBadge,
  ActivityTimeline,
  ActivityTrendChart,
  ContributionRow,
  EmptyState,
  EventCard,
  MemberRow,
} from '@/components/cards';

type Tab = 'dashboard' | 'members' | 'events' | 'checkin' | 'contributions' | 'leaderboard';

const ADMIN_TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="h-4 w-4" /> },
  { id: 'members', label: 'Members', icon: <Users className="h-4 w-4" /> },
  { id: 'events', label: 'Events', icon: <CalendarDays className="h-4 w-4" /> },
  { id: 'checkin', label: 'Check-in', icon: <QrCode className="h-4 w-4" /> },
  { id: 'contributions', label: 'Contributions', icon: <ClipboardList className="h-4 w-4" /> },
  { id: 'leaderboard', label: 'Leaderboard', icon: <Trophy className="h-4 w-4" /> },
];

const MEMBER_TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'dashboard', label: 'Overview', icon: <LayoutDashboard className="h-4 w-4" /> },
  { id: 'events', label: 'Events', icon: <CalendarDays className="h-4 w-4" /> },
  { id: 'checkin', label: 'Check-in', icon: <QrCode className="h-4 w-4" /> },
  { id: 'leaderboard', label: 'Leaderboard', icon: <Trophy className="h-4 w-4" /> },
];

export default function App() {
  const data = useSocietyData();
  const [tab, setTab] = useState<Tab>('dashboard');
  const [loggedInMember, setLoggedInMember] = useState<Member | null>(null);
  const [activeRole, setActiveRole] = useState<AppRole>('admin');
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);

  const scores = useMemo(
    () => computeScores(data.members, data.events, data.attendance, data.contributions),
    [data.members, data.events, data.attendance, data.contributions],
  );

  const missingConfig = !import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (missingConfig) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-ink-50 px-4 text-center">
        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-error-50 text-error-500">
          <AlertCircle className="h-8 w-8" />
        </div>
        <h1 className="font-display text-2xl font-extrabold text-ink-900">Configuration Required</h1>
        <p className="mt-2 max-w-md text-sm text-ink-600">
          This app needs a Supabase project to function. Create a file named <code className="rounded bg-ink-100 px-1.5 py-0.5 font-mono text-xs">.env</code> in the project root with the following variables:
        </p>
        <pre className="mt-4 max-w-md overflow-x-auto rounded-xl bg-ink-900 px-5 py-4 text-left text-xs text-ink-100">
{`VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here`}
        </pre>
        <p className="mt-4 max-w-md text-sm text-ink-500">
          You can find these in your Supabase project dashboard under Settings → API. After creating the file, restart the dev server.
        </p>
      </div>
    );
  }

  if (!loggedInMember) {
    return (
      <>
        <LandingPage
          onLogin={(member, role) => {
            setLoggedInMember(member);
            setActiveRole(role);
            setTab('dashboard');
          }}
        />
        <ToastHost />
      </>
    );
  }

  const tabs = activeRole === 'admin' ? ADMIN_TABS : MEMBER_TABS;
  const selectedMember = scores.find((m) => m.id === selectedMemberId) ?? null;

  return (
    <div className="min-h-screen bg-ink-50">
      <Header
        activeRole={activeRole}
        onRoleChange={(r) => {
          setActiveRole(r);
          setTab('dashboard');
        }}
        loggedInMember={loggedInMember}
        onSignOut={() => {
          setLoggedInMember(null);
          setSelectedMemberId(null);
        }}
      />
      <nav className="sticky top-0 z-30 border-b border-ink-100 bg-white/80 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex gap-1 overflow-x-auto scrollbar-thin">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`relative flex shrink-0 items-center gap-2 px-4 py-3.5 text-sm font-semibold transition-colors ${
                  tab === t.id ? 'text-brand-600' : 'text-ink-500 hover:text-ink-800'
                }`}
              >
                {t.icon}
                {t.label}
                {tab === t.id && (
                  <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-brand-500" />
                )}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
        {data.loading ? (
          <LoadingState />
        ) : data.error ? (
          <ErrorState message={data.error} onRetry={data.refresh} />
        ) : (
          <div className="animate-fade-in">
            {tab === 'dashboard' && activeRole === 'admin' && (
              <DashboardView scores={scores} data={data} activeRole={activeRole} onSelectMember={setSelectedMemberId} />
            )}
            {tab === 'dashboard' && activeRole === 'member' && loggedInMember && (
              <MemberDashboardView
                loggedInMember={scores.find((m) => m.id === loggedInMember.id) ?? null}
                scores={scores}
                data={data}
                onSelectMember={setSelectedMemberId}
              />
            )}
            {tab === 'members' && activeRole === 'admin' && (
              <MembersView scores={scores} onChange={data.refresh} onSelectMember={setSelectedMemberId} />
            )}
            {tab === 'events' && activeRole === 'admin' && (
              <EventsView data={data} onChange={data.refresh} />
            )}
            {tab === 'events' && activeRole === 'member' && loggedInMember && (
              <MemberEventsView data={data} loggedInMemberId={loggedInMember.id} />
            )}
            {tab === 'checkin' && (
              <CheckInView
                scores={scores}
                data={data}
                onChange={data.refresh}
                activeRole={activeRole}
                loggedInMemberId={activeRole === 'member' ? loggedInMember.id : null}
              />
            )}
            {tab === 'contributions' && activeRole === 'admin' && (
              <ContributionsView scores={scores} data={data} onChange={data.refresh} />
            )}
            {tab === 'leaderboard' && <LeaderboardView scores={scores} onSelectMember={setSelectedMemberId} />}
          </div>
        )}
      </main>

      <MemberProfileModal
        member={selectedMember}
        scores={scores}
        onClose={() => setSelectedMemberId(null)}
      />
      <ToastHost />
    </div>
  );
}

function Header({
  activeRole,
  onRoleChange,
  loggedInMember,
  onSignOut,
}: {
  activeRole: AppRole;
  onRoleChange: (r: AppRole) => void;
  loggedInMember: Member;
  onSignOut: () => void;
}) {
  const initials = loggedInMember.name.split(' ').map((n) => n[0]).slice(0, 2).join('');
  return (
    <header className="border-b border-ink-100 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
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
        <div className="flex items-center gap-3">
          {loggedInMember.app_role === 'admin' && (
            <div className="flex items-center rounded-full bg-ink-100 p-0.5">
              <button
                onClick={() => onRoleChange('admin')}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
                  activeRole === 'admin' ? 'bg-white text-brand-700 shadow-soft' : 'text-ink-500 hover:text-ink-700'
                }`}
              >
                <Shield className="h-3.5 w-3.5" /> Admin
              </button>
              <button
                onClick={() => onRoleChange('member')}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
                  activeRole === 'member' ? 'bg-white text-brand-700 shadow-soft' : 'text-ink-500 hover:text-ink-700'
                }`}
              >
                <Users className="h-3.5 w-3.5" /> Member
              </button>
            </div>
          )}
          <div className="hidden items-center gap-2 rounded-full bg-success-50 px-3 py-1.5 text-xs font-semibold text-success-700 sm:flex">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-success-500" />
            </span>
            Live
          </div>
          <div className="flex items-center gap-2 border-l border-ink-100 pl-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">
              {initials}
            </div>
            <div className="hidden sm:block">
              <p className="text-xs font-semibold text-ink-800">{loggedInMember.name}</p>
              <p className="text-[10px] text-ink-500">{activeRole === 'admin' ? 'Admin' : 'Member'}</p>
            </div>
            <button
              onClick={onSignOut}
              className="rounded-lg p-1.5 text-ink-400 transition-colors hover:bg-ink-100 hover:text-error-600"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

function LoadingState() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 skeleton" />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="h-64 skeleton lg:col-span-2" />
        <div className="h-64 skeleton" />
      </div>
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-error-50 text-error-500">
        <Activity className="h-7 w-7" />
      </div>
      <h2 className="font-display text-lg font-bold text-ink-800">Something went wrong</h2>
      <p className="mt-1 max-w-sm text-sm text-ink-500">{message}</p>
      <button onClick={onRetry} className="btn-primary mt-5">Try again</button>
    </div>
  );
}

/* ---------- Dashboard ---------- */

function DashboardView({
  scores,
  data,
  activeRole,
  onSelectMember,
}: {
  scores: MemberScore[];
  data: ReturnType<typeof useSocietyData>;
  activeRole: AppRole;
  onSelectMember: (id: string) => void;
}) {
  const totalMembers = scores.length;
  const activeCount = scores.filter((m) => m.activityState === 'ACTIVE').length;
  const lowActivityCount = scores.filter((m) => m.activityState === 'LOW_ACTIVITY').length;
  const inactiveCount = scores.filter((m) => m.activityState === 'INACTIVE').length;

  const pastMeetings = data.events
    .filter((e) => e.event_type === 'meeting')
    .sort((a, b) => b.event_date.localeCompare(a.event_date));
  const recentMeeting = pastMeetings[0];
  const recentMeetingAttendance = recentMeeting
    ? data.attendance.filter((a) => a.event_id === recentMeeting.id).length
    : 0;

  const topScorers = [...scores].sort((a, b) => b.activityScore - a.activityScore).slice(0, 5);
  const mostConsistent = [...scores]
    .filter((m) => m.attendedEvents > 0)
    .sort((a, b) => b.attendancePercentage - a.attendancePercentage || b.activityScore - a.activityScore)
    .slice(0, 5);

  const recentContributions = data.contributions.slice(0, 5);
  const memberMap = new Map(scores.map((m) => [m.id, m]));

  const teamBreakdown = useMemo(() => {
    const map = new Map<string, { count: number; score: number }>();
    for (const m of scores) {
      const entry = map.get(m.team) ?? { count: 0, score: 0 };
      entry.count += 1;
      entry.score += m.activityScore;
      map.set(m.team, entry);
    }
    return Array.from(map.entries()).sort((a, b) => b[1].score - a[1].score);
  }, [scores]);

  return (
    <div className="space-y-6">
      {/* Stat tiles */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatTile icon={<Users className="h-5 w-5" />} label="Total Members" value={totalMembers} tint="brand" />
        <StatTile icon={<Zap className="h-5 w-5" />} label="Active" value={activeCount} tint="success" />
        <StatTile icon={<AlertTriangle className="h-5 w-5" />} label="Low Activity" value={lowActivityCount} tint="warning" />
        <StatTile icon={<Activity className="h-5 w-5" />} label="Inactive" value={inactiveCount} tint="error" />
      </div>

      {/* Inactivity detection summary */}
      <div className="card p-5">
        <div className="mb-4 flex items-center gap-2">
          <Target className="h-4 w-4 text-brand-500" />
          <h2 className="font-display text-base font-bold text-ink-900">Inactivity Detection</h2>
          <span className="ml-auto text-xs text-ink-400">
            Rule: no attendance or contribution in last {INACTIVITY_WINDOW} meetings → Inactive
          </span>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {(['ACTIVE', 'LOW_ACTIVITY', 'INACTIVE'] as const).map((state) => {
            const meta = ACTIVITY_STATE_META[state];
            const count = scores.filter((m) => m.activityState === state).length;
            return (
              <div key={state} className="rounded-xl border border-ink-100 bg-ink-50/50 p-4 text-center">
                <div className="mb-2 flex justify-center">
                  <span className={`h-3 w-3 rounded-full ${meta.dot}`} />
                </div>
                <div className="font-display text-2xl font-extrabold text-ink-900">{count}</div>
                <div className="text-xs font-semibold text-ink-500">{meta.label}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Team breakdown + top performers */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="card p-6 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-base font-bold text-ink-900">Team Breakdown</h2>
            <Sparkles className="h-4 w-4 text-ink-400" />
          </div>
          <div className="space-y-3">
            {teamBreakdown.map(([team, info]) => {
              const maxScore = Math.max(...teamBreakdown.map((t) => t[1].score), 1);
              const width = (info.score / maxScore) * 100;
              return (
                <div key={team}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="font-semibold text-ink-700">{team}</span>
                    <span className="text-ink-500">{info.count} members · {info.score} pts</span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-ink-100">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-brand-400 to-brand-600 transition-all duration-700"
                      style={{ width: `${width}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card p-6">
          <div className="mb-4 flex items-center gap-2">
            <Trophy className="h-4 w-4 text-accent-500" />
            <h2 className="font-display text-base font-bold text-ink-900">Highest Scores</h2>
          </div>
          <div className="space-y-2.5">
            {topScorers.map((m, i) => (
              <button
                key={m.id}
                onClick={() => onSelectMember(m.id)}
                className="flex w-full items-center gap-3 rounded-lg p-1.5 text-left transition-colors hover:bg-ink-50"
              >
                <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                  i === 0 ? 'bg-accent-100 text-accent-700' : i === 1 ? 'bg-ink-200 text-ink-600' : i === 2 ? 'bg-warning-100 text-warning-700' : 'bg-ink-100 text-ink-500'
                }`}>
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-ink-800">{m.name}</p>
                  <p className="text-xs text-ink-500">{m.team}</p>
                </div>
                <span className="font-display text-sm font-bold text-brand-600">{m.activityScore}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Most consistent + recent meeting attendance */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card p-6">
          <div className="mb-4 flex items-center gap-2">
            <Award className="h-4 w-4 text-success-500" />
            <h2 className="font-display text-base font-bold text-ink-900">Most Consistent Members</h2>
          </div>
          {mostConsistent.length > 0 ? (
            <div className="space-y-2.5">
              {mostConsistent.map((m, i) => (
                <button
                  key={m.id}
                  onClick={() => onSelectMember(m.id)}
                  className="flex w-full items-center gap-3 rounded-lg p-1.5 text-left transition-colors hover:bg-ink-50"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-success-100 text-xs font-bold text-success-700">
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-ink-800">{m.name}</p>
                    <p className="text-xs text-ink-500">{m.team}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-ink-700">{m.attendancePercentage}%</span>
                    <p className="text-xs text-ink-400">{m.attendedEvents} events</p>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <p className="text-sm text-ink-400">No attendance data yet.</p>
          )}
        </div>

        <div className="card p-6">
          <div className="mb-4 flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-brand-500" />
            <h2 className="font-display text-base font-bold text-ink-900">Recent Meeting Attendance</h2>
          </div>
          {recentMeeting ? (
            <div>
              <p className="text-sm font-semibold text-ink-800">{recentMeeting.title}</p>
              <p className="text-xs text-ink-500">
                {new Date(recentMeeting.event_date + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
              <div className="mt-4 flex items-end gap-4">
                <div>
                  <div className="font-display text-3xl font-extrabold text-ink-900">{recentMeetingAttendance}</div>
                  <div className="text-xs text-ink-500">checked in</div>
                </div>
                <div className="text-ink-300">/</div>
                <div>
                  <div className="font-display text-3xl font-extrabold text-ink-400">{totalMembers}</div>
                  <div className="text-xs text-ink-500">total members</div>
                </div>
                <div className="ml-auto flex h-16 items-end">
                  <div
                    className="w-3 rounded-t-full bg-gradient-to-t from-brand-400 to-brand-600"
                    style={{ height: `${totalMembers > 0 ? (recentMeetingAttendance / totalMembers) * 100 : 0}%` }}
                  />
                </div>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-ink-100">
                <div
                  className="h-full rounded-full bg-brand-500"
                  style={{ width: `${totalMembers > 0 ? (recentMeetingAttendance / totalMembers) * 100 : 0}%` }}
                />
              </div>
            </div>
          ) : (
            <p className="text-sm text-ink-400">No meetings scheduled yet.</p>
          )}
        </div>
      </div>

      {/* Recent contributions */}
      <div>
        <h2 className="mb-3 font-display text-base font-bold text-ink-900">Recent Contributions</h2>
        {recentContributions.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {recentContributions.map((c) => (
              <ContributionRow key={c.id} contribution={c} member={memberMap.get(c.member_id)} />
            ))}
          </div>
        ) : (
          <EmptyState icon={<ClipboardList className="h-6 w-6" />} title="No contributions logged" message="Record member work from the Contributions tab to start building the activity ledger." />
        )}
      </div>

      {activeRole === 'member' && (
        <div className="card border-brand-200 bg-brand-50/50 p-5">
          <div className="flex items-center gap-2 text-sm text-ink-600">
            <Users className="h-4 w-4 text-brand-500" />
            <span>You are viewing as a <strong>Member</strong>. Switch to Admin in the top-right to manage members, events, and contributions.</span>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- Member Dashboard ---------- */

function MemberDashboardView({
  loggedInMember,
  scores,
  data,
  onSelectMember,
}: {
  loggedInMember: MemberScore | null;
  scores: MemberScore[];
  data: ReturnType<typeof useSocietyData>;
  onSelectMember: (id: string) => void;
}) {
  if (!loggedInMember) {
    return (
      <div className="card p-8 text-center">
        <Users className="mx-auto mb-3 h-8 w-8 text-ink-300" />
        <p className="text-sm text-ink-500">Unable to load your profile data. Please try again.</p>
      </div>
    );
  }

  const ranked = [...scores].sort((a, b) => b.activityScore - a.activityScore);
  const myRank = ranked.findIndex((m) => m.id === loggedInMember.id) + 1;
  const upcomingEvents = data.events
    .filter((e) => new Date(e.event_date + 'T00:00:00') >= new Date(new Date().toDateString()))
    .sort((a, b) => a.event_date.localeCompare(b.event_date));
  const myEventIds = new Set(data.attendance.filter((a) => a.member_id === loggedInMember.id).map((a) => a.event_id));
  const myContributions = data.contributions.filter((c) => c.member_id === loggedInMember.id);
  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div className="card relative overflow-hidden p-6">
        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-xl font-bold text-white shadow-glow">
              {loggedInMember.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
            </div>
            <div>
              <h2 className="font-display text-xl font-extrabold text-ink-900">Welcome, {loggedInMember.name.split(' ')[0]}</h2>
              <p className="text-sm text-ink-500">{loggedInMember.team} · {loggedInMember.role}</p>
              <div className="mt-2 flex items-center gap-2">
                <ActivityStateBadge state={loggedInMember.activityState} />
                <span className="text-xs text-ink-400">Rank #{myRank} of {scores.length}</span>
              </div>
            </div>
          </div>
          <div className="text-center sm:text-right">
            <div className="font-display text-4xl font-extrabold text-brand-600">{loggedInMember.activityScore}</div>
            <div className="text-xs font-semibold text-ink-500">Activity Score</div>
          </div>
        </div>
        <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-brand-100/30 blur-3xl" />
      </div>

      {/* Personal stat tiles */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatTile icon={<CalendarDays className="h-5 w-5" />} label="Events Attended" value={loggedInMember.attendedEvents} tint="brand" />
        <StatTile icon={<ClipboardList className="h-5 w-5" />} label="Contributions" value={loggedInMember.contributionsCount} tint="success" />
        <StatTile icon={<TrendingUp className="h-5 w-5" />} label="Attendance" value={loggedInMember.attendancePercentage} suffix="%" tint="accent" />
        <StatTile icon={<Trophy className="h-5 w-5" />} label="Leaderboard Rank" value={myRank} tint="warning" />
      </div>

      {/* Score breakdown + activity trend */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card p-6">
          <h2 className="mb-4 font-display text-base font-bold text-ink-900">Score Breakdown</h2>
          <div className="space-y-4">
            <ScoreBar label="Attendance Points" value={loggedInMember.attendancePoints} max={loggedInMember.activityScore} color="from-brand-400 to-brand-600" />
            <ScoreBar label="Contribution Points" value={loggedInMember.contributionPoints} max={loggedInMember.activityScore} color="from-success-400 to-success-600" />
            <div className="border-t border-ink-100 pt-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-ink-700">Total Activity Score</span>
                <span className="font-display text-lg font-extrabold text-brand-600">{loggedInMember.activityScore}</span>
              </div>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-ink-100 bg-ink-50/50 p-3 text-center">
              <div className="font-display text-xl font-extrabold text-ink-900">{loggedInMember.attendancePercentage}%</div>
              <div className="text-xs text-ink-500">Attendance Rate</div>
            </div>
            <div className="rounded-xl border border-ink-100 bg-ink-50/50 p-3 text-center">
              <div className="font-display text-xl font-extrabold text-ink-900">{loggedInMember.lastActivityDate ? new Date(loggedInMember.lastActivityDate + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'Never'}</div>
              <div className="text-xs text-ink-500">Last Active</div>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h2 className="mb-4 flex items-center gap-2 font-display text-base font-bold text-ink-900">
            <TrendingUp className="h-4 w-4 text-brand-500" /> Activity Trend
          </h2>
          <ActivityTrendChart history={loggedInMember.history} />
        </div>
      </div>

      {/* Recent activity + upcoming events */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <h2 className="mb-3 flex items-center gap-2 font-display text-base font-bold text-ink-900">
            <Clock className="h-4 w-4 text-ink-500" /> Your Recent Activity
          </h2>
          {loggedInMember.history.length > 0 ? (
            <ActivityTimeline history={loggedInMember.history.slice(0, 6)} />
          ) : (
            <EmptyState icon={<Activity className="h-6 w-6" />} title="No activity yet" message="Check in to events or log contributions to build your activity history." />
          )}
        </div>

        <div>
          <h2 className="mb-3 flex items-center gap-2 font-display text-base font-bold text-ink-900">
            <CalendarDays className="h-4 w-4 text-brand-500" /> Upcoming Events
          </h2>
          {upcomingEvents.length > 0 ? (
            <div className="space-y-2.5">
              {upcomingEvents.map((e) => {
                const attended = myEventIds.has(e.id);
                const meta = EVENT_TYPE_META[e.event_type];
                return (
                  <div key={e.id} className="card-soft flex items-center justify-between p-3.5">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-ink-800">{e.title}</p>
                      <p className="text-xs text-ink-500">
                        {new Date(e.event_date + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} · {e.start_time.slice(0, 5)}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <span className={`chip ${meta.color}`}>{meta.label}</span>
                      {attended ? (
                        <span className="chip bg-success-100 text-success-700"><CheckCircle2 className="h-3 w-3" /> Checked in</span>
                      ) : (
                        <span className="chip bg-ink-100 text-ink-500">+{EVENT_POINTS[e.event_type]} pts</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState icon={<CalendarDays className="h-6 w-6" />} title="No upcoming events" message="Check back later for new society events to attend." />
          )}
        </div>
      </div>

      {/* My contributions */}
      {myContributions.length > 0 && (
        <div>
          <h2 className="mb-3 font-display text-base font-bold text-ink-900">My Contributions</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {myContributions.map((c) => (
              <ContributionRow key={c.id} contribution={c} member={loggedInMember} />
            ))}
          </div>
        </div>
      )}

      {/* Leaderboard preview */}
      <div className="card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-display text-base font-bold text-ink-900">
            <Trophy className="h-4 w-4 text-accent-500" /> Your Position on the Leaderboard
          </h2>
          <button onClick={() => onSelectMember(loggedInMember.id)} className="text-xs font-semibold text-brand-600 hover:text-brand-700">
            View full profile
          </button>
        </div>
        <div className="space-y-2">
          {ranked.slice(0, 5).map((m, i) => {
            const isMe = m.id === loggedInMember.id;
            return (
              <div key={m.id} className={`flex items-center gap-3 rounded-xl border p-3 transition-colors ${isMe ? 'border-brand-300 bg-brand-50' : 'border-ink-100 bg-white'}`}>
                <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                  i === 0 ? 'bg-accent-100 text-accent-700' : i === 1 ? 'bg-ink-200 text-ink-600' : i === 2 ? 'bg-warning-100 text-warning-700' : 'bg-ink-100 text-ink-500'
                }`}>
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-ink-800">{m.name}{isMe && <span className="ml-2 text-xs font-bold text-brand-600">(You)</span>}</p>
                  <p className="text-xs text-ink-500">{m.team}</p>
                </div>
                <span className="font-display text-sm font-bold text-brand-600">{m.activityScore}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ScoreBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="font-medium text-ink-600">{label}</span>
        <span className="font-bold text-ink-800">{value}</span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-ink-100">
        <div className={`h-full rounded-full bg-gradient-to-r ${color} transition-all duration-700`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function StatTile({ icon, label, value, suffix, tint }: { icon: React.ReactNode; label: string; value: number; suffix?: string; tint: string }) {
  const tints: Record<string, string> = {
    brand: 'bg-brand-50 text-brand-600',
    accent: 'bg-accent-50 text-accent-600',
    success: 'bg-success-50 text-success-600',
    warning: 'bg-warning-50 text-warning-600',
    error: 'bg-error-50 text-error-600',
  };
  return (
    <div className="stat-tile">
      <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${tints[tint]}`}>{icon}</div>
      <div className="font-display text-2xl font-extrabold text-ink-900">{value}{suffix}</div>
      <div className="text-xs font-medium text-ink-500">{label}</div>
    </div>
  );
}

/* ---------- Member Profile Modal ---------- */

function MemberProfileModal({
  member,
  scores,
  onClose,
}: {
  member: MemberScore | null;
  scores: MemberScore[];
  onClose: () => void;
}) {
  if (!member) return null;

  const memberContributions = scores
    .find((m) => m.id === member.id)
    ?.history.filter((h) => h.type === 'contribution') ?? [];

  return (
    <Modal open={!!member} onClose={onClose} title={member.name} subtitle={`${member.team} · ${member.role}`} maxWidth="max-w-2xl">
      <div className="space-y-5">
        {/* Profile info */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <ProfileField icon={<Mail className="h-4 w-4" />} label="Email" value={member.email} />
          <ProfileField icon={<Users className="h-4 w-4" />} label="Team" value={member.team} />
          <ProfileField icon={<UserCog className="h-4 w-4" />} label="Role" value={member.role} />
          <ProfileField icon={<CalendarDays className="h-4 w-4" />} label="Joined" value={new Date(member.joined_date + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} />
          <ProfileField icon={<Clock className="h-4 w-4" />} label="Last Active" value={member.lastActivityDate ? new Date(member.lastActivityDate + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'Never'} />
          <div className="rounded-xl border border-ink-100 bg-ink-50/50 p-3">
            <div className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-ink-500">
              <Activity className="h-4 w-4" /> Status
            </div>
            <ActivityStateBadge state={member.activityState} />
          </div>
        </div>

        {/* Score breakdown */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <ScoreTile label="Attendance Pts" value={member.attendancePoints} tint="brand" />
          <ScoreTile label="Contribution Pts" value={member.contributionPoints} tint="success" />
          <ScoreTile label="Activity Score" value={member.activityScore} tint="accent" />
          <ScoreTile label="Attendance %" value={member.attendancePercentage} suffix="%" tint="warning" />
        </div>

        {/* Activity trend chart */}
        <div className="card-soft p-4">
          <h3 className="mb-3 flex items-center gap-2 font-display text-sm font-bold text-ink-900">
            <TrendingUp className="h-4 w-4 text-brand-500" /> Activity Trend
          </h3>
          <ActivityTrendChart history={member.history} />
        </div>

        {/* Activity timeline */}
        <div>
          <h3 className="mb-3 flex items-center gap-2 font-display text-sm font-bold text-ink-900">
            <Clock className="h-4 w-4 text-ink-500" /> Activity History
          </h3>
          <ActivityTimeline history={member.history} />
        </div>

        {/* Contributions */}
        {memberContributions.length > 0 && (
          <div>
            <h3 className="mb-3 flex items-center gap-2 font-display text-sm font-bold text-ink-900">
              <ClipboardList className="h-4 w-4 text-ink-500" /> Contributions ({member.contributionsCount})
            </h3>
            <div className="space-y-2">
              {memberContributions.map((h, i) => (
                <div key={i} className="flex items-center gap-3 rounded-lg border border-ink-100 bg-white p-3">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-success-50 text-success-600">
                    <TrendingUp className="h-3.5 w-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-ink-800">{h.label}</p>
                    <p className="truncate text-xs text-ink-500">{h.detail}</p>
                  </div>
                  <span className="shrink-0 text-xs font-bold text-success-600">+{h.points}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

function ProfileField({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-ink-100 bg-ink-50/50 p-3">
      <div className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-ink-500">
        {icon} {label}
      </div>
      <p className="truncate text-sm font-semibold text-ink-800">{value}</p>
    </div>
  );
}

function ScoreTile({ label, value, suffix, tint }: { label: string; value: number; suffix?: string; tint: string }) {
  const tints: Record<string, string> = {
    brand: 'text-brand-600',
    success: 'text-success-600',
    accent: 'text-accent-600',
    warning: 'text-warning-600',
  };
  return (
    <div className="rounded-xl border border-ink-100 bg-white p-3 text-center">
      <div className={`font-display text-2xl font-extrabold ${tints[tint]}`}>{value}{suffix}</div>
      <div className="text-xs font-medium text-ink-500">{label}</div>
    </div>
  );
}

/* ---------- Members ---------- */

function MembersView({
  scores,
  onChange,
  onSelectMember,
}: {
  scores: MemberScore[];
  onChange: () => Promise<void>;
  onSelectMember: (id: string) => void;
}) {
  const [query, setQuery] = useState('');
  const [teamFilter, setTeamFilter] = useState('all');
  const [stateFilter, setStateFilter] = useState('all');
  const [showAdd, setShowAdd] = useState(false);

  const filtered = scores.filter((m) => {
    const matchesQuery = m.name.toLowerCase().includes(query.toLowerCase()) || m.email.toLowerCase().includes(query.toLowerCase());
    const matchesTeam = teamFilter === 'all' || m.team === teamFilter;
    const matchesState = stateFilter === 'all' || m.activityState === stateFilter;
    return matchesQuery && matchesTeam && matchesState;
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-xl font-bold text-ink-900">Members</h2>
          <p className="text-sm text-ink-500">{scores.length} total · {scores.filter((m) => m.activityState === 'ACTIVE').length} active</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary">
          <UserPlus className="h-4 w-4" /> Add Member
        </button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <input className="input pl-10" placeholder="Search by name or email…" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <select className="input sm:w-40" value={teamFilter} onChange={(e) => setTeamFilter(e.target.value)}>
          <option value="all">All Teams</option>
          {TEAM_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <select className="input sm:w-44" value={stateFilter} onChange={(e) => setStateFilter(e.target.value)}>
          <option value="all">All Statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="LOW_ACTIVITY">Low Activity</option>
          <option value="INACTIVE">Inactive</option>
        </select>
      </div>

      {filtered.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {filtered.map((m, i) => (
            <MemberRow key={m.id} member={m} rank={i + 1} onClick={() => onSelectMember(m.id)} />
          ))}
        </div>
      ) : (
        <EmptyState icon={<Users className="h-6 w-6" />} title="No members found" message="Try adjusting your search or add a new member to the society." />
      )}

      <AddMemberModal open={showAdd} onClose={() => setShowAdd(false)} onSaved={onChange} />
    </div>
  );
}

function AddMemberModal({ open, onClose, onSaved }: { open: boolean; onClose: () => void; onSaved: () => Promise<void> }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [team, setTeam] = useState(TEAM_OPTIONS[0]);
  const [role, setRole] = useState(ROLE_OPTIONS[2]);
  const [saving, setSaving] = useState(false);

  const reset = () => { setName(''); setEmail(''); setTeam(TEAM_OPTIONS[0]); setRole(ROLE_OPTIONS[2]); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) { toast('error', 'Name and email are required.'); return; }
    setSaving(true);
    try {
      const { error } = await supabase.from('members').insert({ name: name.trim(), email: email.trim().toLowerCase(), team, role, status: 'active', app_role: 'member' });
      if (error) throw error;
      toast('success', `${name.trim()} added to the society.`);
      reset(); onClose(); await onSaved();
    } catch (err) {
      toast('error', err instanceof Error ? err.message : 'Failed to add member.');
    } finally { setSaving(false); }
  };

  return (
    <Modal open={open} onClose={onClose} title="Add New Member" subtitle="Register a person into the society roster.">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Full Name</label>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Priya Nair" autoFocus />
        </div>
        <div>
          <label className="label">Email</label>
          <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="priya@dtu-society.in" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Team</label>
            <select className="input" value={team} onChange={(e) => setTeam(e.target.value)}>
              {TEAM_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Role</label>
            <select className="input" value={role} onChange={(e) => setRole(e.target.value)}>
              {ROLE_OPTIONS.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
          <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving…' : 'Add Member'}</button>
        </div>
      </form>
    </Modal>
  );
}

/* ---------- Events ---------- */

/* ---------- Events ---------- */

function EventsView({ data, onChange }: { data: ReturnType<typeof useSocietyData>; onChange: () => Promise<void> }) {
  const [showAdd, setShowAdd] = useState(false);
  const scores = computeScores(data.members, data.events, data.attendance, data.contributions);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-xl font-bold text-ink-900">Events</h2>
          <p className="text-sm text-ink-500">{data.events.length} scheduled · {data.events.filter((e) => new Date(e.event_date + 'T00:00:00') >= new Date(new Date().toDateString())).length} upcoming</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary">
          <CalendarPlus className="h-4 w-4" /> Schedule Event
        </button>
      </div>

      {data.events.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.events.map((e) => <EventCard key={e.id} event={e} attendance={data.attendance} members={scores} />)}
        </div>
      ) : (
        <EmptyState icon={<CalendarDays className="h-6 w-6" />} title="No events yet" message="Schedule the first society event to start tracking attendance." />
      )}

      <AddEventModal open={showAdd} onClose={() => setShowAdd(false)} onSaved={onChange} />
    </div>
  );
}

function MemberEventsView({ data, loggedInMemberId }: { data: ReturnType<typeof useSocietyData>; loggedInMemberId: string }) {
  const myEventIds = new Set(data.attendance.filter((a) => a.member_id === loggedInMemberId).map((a) => a.event_id));
  const sortedEvents = [...data.events].sort((a, b) => b.event_date.localeCompare(a.event_date));

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display text-xl font-bold text-ink-900">Events</h2>
        <p className="text-sm text-ink-500">{data.events.length} total · you've attended {myEventIds.size}</p>
      </div>
      {sortedEvents.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sortedEvents.map((e) => {
            const meta = EVENT_TYPE_META[e.event_type];
            const attended = myEventIds.has(e.id);
            const date = new Date(e.event_date + 'T00:00:00');
            const isPast = date < new Date(new Date().toDateString());
            return (
              <div key={e.id} className="card p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                      <CalendarDays className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-display text-base font-bold leading-tight text-ink-900">{e.title}</h3>
                      <div className="mt-1 flex items-center gap-2">
                        <span className={`chip ${meta.color} ring-1 ${meta.ring}`}>{meta.label}</span>
                        <span className="text-xs text-ink-400">{isPast ? 'Completed' : 'Upcoming'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-semibold uppercase tracking-wide text-ink-400">Points</div>
                    <div className="font-display text-lg font-bold text-brand-600">+{EVENT_POINTS[e.event_type]}</div>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2 text-ink-600">
                    <CalendarDays className="h-4 w-4 text-ink-400" />
                    {date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </div>
                  <div className="flex items-center gap-2 text-ink-600">
                    <Clock className="h-4 w-4 text-ink-400" />
                    {e.start_time.slice(0, 5)}
                  </div>
                </div>
                <div className="mt-4 border-t border-ink-100 pt-3">
                  {attended ? (
                    <span className="chip bg-success-100 text-success-700"><CheckCircle2 className="h-3 w-3" /> You checked in</span>
                  ) : isPast ? (
                    <span className="chip bg-ink-100 text-ink-500">Not attended</span>
                  ) : (
                    <div>
                      <p className="mb-1 text-xs text-ink-400">Check-in code:</p>
                      <code className="rounded-md bg-ink-100 px-2 py-0.5 font-mono text-xs font-semibold text-ink-700">{e.check_in_code}</code>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState icon={<CalendarDays className="h-6 w-6" />} title="No events yet" message="Check back later for upcoming society events." />
      )}
    </div>
  );
}

function AddEventModal({ open, onClose, onSaved }: { open: boolean; onClose: () => void; onSaved: () => Promise<void> }) {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('17:00');
  const [eventType, setEventType] = useState<EventType>('meeting');
  const [code, setCode] = useState('');
  const [saving, setSaving] = useState(false);

  const reset = () => { setTitle(''); setDate(''); setTime('17:00'); setEventType('meeting'); setCode(''); };

  const generateCode = () => {
    const slug = eventType.toUpperCase().slice(0, 6);
    const day = date ? date.slice(8) : '00';
    setCode(`DTU-${slug}-${day}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date || !code.trim()) { toast('error', 'Title, date, and check-in code are required.'); return; }
    setSaving(true);
    try {
      const { error } = await supabase.from('events').insert({ title: title.trim(), event_date: date, start_time: time, event_type: eventType, check_in_code: code.trim() });
      if (error) throw error;
      toast('success', `Event "${title.trim()}" scheduled.`);
      reset(); onClose(); await onSaved();
    } catch (err) {
      toast('error', err instanceof Error ? err.message : 'Failed to schedule event.');
    } finally { setSaving(false); }
  };

  return (
    <Modal open={open} onClose={onClose} title="Schedule New Event" subtitle="Create a society event with a unique check-in code.">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Event Title</label>
          <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Weekly Society Sync" autoFocus />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Date</label>
            <input className="input" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div>
            <label className="label">Start Time</label>
            <input className="input" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
          </div>
        </div>
        <div>
          <label className="label">Event Type</label>
          <div className="grid grid-cols-4 gap-2">
            {EVENT_TYPES.map((t) => {
              const meta = EVENT_TYPE_META[t];
              return (
                <button key={t} type="button" onClick={() => setEventType(t)}
                  className={`rounded-xl border px-2 py-2 text-xs font-semibold capitalize transition-all ${
                    eventType === t ? 'border-brand-500 bg-brand-50 text-brand-700 ring-2 ring-brand-100' : 'border-ink-200 text-ink-500 hover:border-ink-300'
                  }`}>
                  {meta.label}
                  <div className="mt-0.5 text-[10px] font-normal text-ink-400">+{EVENT_POINTS[t]} pts</div>
                </button>
              );
            })}
          </div>
        </div>
        <div>
          <label className="label">Check-in Code</label>
          <div className="flex gap-2">
            <input className="input font-mono uppercase" value={code} onChange={(e) => setCode(e.target.value)} placeholder="DTU-MEET-18" />
            <button type="button" onClick={generateCode} className="btn-secondary shrink-0"><KeyRound className="h-4 w-4" /> Auto</button>
          </div>
          <p className="mt-1 text-xs text-ink-400">Members enter this code to verify attendance.</p>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
          <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving…' : 'Schedule Event'}</button>
        </div>
      </form>
    </Modal>
  );
}

/* ---------- Check-in ---------- */

function CheckInView({
  scores,
  data,
  onChange,
  activeRole,
  loggedInMemberId,
}: {
  scores: MemberScore[];
  data: ReturnType<typeof useSocietyData>;
  onChange: () => Promise<void>;
  activeRole: AppRole;
  loggedInMemberId: string | null;
}) {
  const [memberId, setMemberId] = useState(loggedInMemberId ?? '');
  const [code, setCode] = useState('');
  const [method, setMethod] = useState<'code' | 'qr'>('code');
  const [submitting, setSubmitting] = useState(false);
  const [lastCheckIn, setLastCheckIn] = useState<{ member: string; event: string } | null>(null);

  const sortedEvents = [...data.events].sort((a, b) => b.event_date.localeCompare(a.event_date));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberId || !code.trim()) { toast('error', 'Select a member and enter the check-in code.'); return; }
    setSubmitting(true);
    try {
      const event = data.events.find((ev) => ev.check_in_code.toLowerCase() === code.trim().toLowerCase());
      if (!event) { toast('error', 'Invalid check-in code. No matching event found.'); setSubmitting(false); return; }
      const member = scores.find((m) => m.id === memberId);
      if (!member) { toast('error', 'Selected member not found.'); setSubmitting(false); return; }
      const { error } = await supabase.from('attendance').insert({ member_id: memberId, event_id: event.id, check_in_method: method });
      if (error) {
        if (error.code === '23505') { toast('error', `${member.name} has already checked in to "${event.title}".`); }
        else throw error;
        setSubmitting(false); return;
      }
      toast('success', `${member.name} checked in to "${event.title}". +${EVENT_POINTS[event.event_type]} points.`);
      setLastCheckIn({ member: member.name, event: event.title });
      setCode('');
      await onChange();
    } catch (err) {
      toast('error', err instanceof Error ? err.message : 'Check-in failed.');
    } finally { setSubmitting(false); }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div>
        <h2 className="font-display text-xl font-bold text-ink-900">Event Check-in</h2>
        <p className="text-sm text-ink-500">Verify member attendance using the event check-in code.</p>
      </div>

      <div className="card overflow-hidden">
        <div className="grid grid-cols-2 border-b border-ink-100">
          <button onClick={() => setMethod('code')} className={`flex items-center justify-center gap-2 py-3 text-sm font-semibold transition-colors ${method === 'code' ? 'bg-brand-50 text-brand-700' : 'text-ink-500 hover:bg-ink-50'}`}>
            <KeyRound className="h-4 w-4" /> Code
          </button>
          <button onClick={() => setMethod('qr')} className={`flex items-center justify-center gap-2 py-3 text-sm font-semibold transition-colors ${method === 'qr' ? 'bg-brand-50 text-brand-700' : 'text-ink-500 hover:bg-ink-50'}`}>
            <QrCode className="h-4 w-4" /> QR
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          <div>
            <label className="label">Member</label>
            {activeRole === 'member' && loggedInMemberId ? (
              <input
                className="input bg-ink-50"
                value={scores.find((m) => m.id === loggedInMemberId)?.name ?? 'You'}
                readOnly
              />
            ) : (
              <select className="input" value={memberId} onChange={(e) => setMemberId(e.target.value)}>
                <option value="">Select a member…</option>
                {scores.map((m) => <option key={m.id} value={m.id}>{m.name} — {m.team}</option>)}
              </select>
            )}
          </div>
          <div>
            <label className="label">Check-in Code</label>
            <input className="input font-mono uppercase tracking-wider" value={code} onChange={(e) => setCode(e.target.value)} placeholder="DTU-SYNC-18" autoCapitalize="characters" />
          </div>
          {method === 'qr' && (
            <div className="rounded-xl border border-dashed border-brand-200 bg-brand-50/50 p-4 text-center">
              <QrCode className="mx-auto mb-2 h-8 w-8 text-brand-400" />
              <p className="text-xs text-ink-500">QR scanning uses the same code lookup. Enter the code from the QR payload.</p>
            </div>
          )}
          <button type="submit" disabled={submitting} className="btn-primary w-full">
            <CheckCircle2 className="h-4 w-4" /> {submitting ? 'Checking in…' : 'Verify & Check In'}
          </button>
        </form>
      </div>

      {lastCheckIn && (
        <div className="card animate-scale-in flex items-center gap-3 border-success-200 bg-success-50 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-success-100 text-success-600">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-bold text-success-800">Check-in confirmed</p>
            <p className="text-xs text-success-700">{lastCheckIn.member} → {lastCheckIn.event}</p>
          </div>
        </div>
      )}

      <div>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-500">Recent Events</h3>
        <div className="space-y-2">
          {sortedEvents.slice(0, 4).map((e) => {
            const count = data.attendance.filter((a) => a.event_id === e.id).length;
            return (
              <div key={e.id} className="card-soft flex items-center justify-between p-3">
                <div>
                  <p className="text-sm font-semibold text-ink-800">{e.title}</p>
                  <p className="text-xs text-ink-500">{new Date(e.event_date + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} · {e.start_time.slice(0, 5)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <code className="rounded-md bg-ink-100 px-2 py-1 font-mono text-xs font-semibold text-ink-700">{e.check_in_code}</code>
                  <span className="text-xs font-bold text-ink-600">{count} in</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ---------- Contributions ---------- */

function ContributionsView({ scores, data, onChange }: { scores: MemberScore[]; data: ReturnType<typeof useSocietyData>; onChange: () => Promise<void> }) {
  const [showAdd, setShowAdd] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const memberMap = new Map(scores.map((m) => [m.id, m]));

  const filtered = data.contributions.filter((c) => categoryFilter === 'all' || c.category === categoryFilter);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-xl font-bold text-ink-900">Contributions</h2>
          <p className="text-sm text-ink-500">{data.contributions.length} logged · {data.contributions.reduce((s, c) => s + c.points, 0)} total points awarded</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary">
          <Plus className="h-4 w-4" /> Log Contribution
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        <button onClick={() => setCategoryFilter('all')} className={`chip transition-colors ${categoryFilter === 'all' ? 'bg-ink-800 text-white' : 'bg-ink-100 text-ink-600 hover:bg-ink-200'}`}>All</button>
        {CATEGORIES.map((c) => (
          <button key={c} onClick={() => setCategoryFilter(c)} className={`chip capitalize transition-colors ${categoryFilter === c ? CATEGORY_META[c].color : 'bg-ink-100 text-ink-500 hover:bg-ink-200'}`}>{c}</button>
        ))}
      </div>

      {filtered.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {filtered.map((c) => <ContributionRow key={c.id} contribution={c} member={memberMap.get(c.member_id)} />)}
        </div>
      ) : (
        <EmptyState icon={<ClipboardList className="h-6 w-6" />} title="No contributions yet" message="Log member work — technical tasks, designs, outreach — to award activity points." />
      )}

      <AddContributionModal open={showAdd} onClose={() => setShowAdd(false)} onSaved={onChange} scores={scores} />
    </div>
  );
}

function AddContributionModal({ open, onClose, onSaved, scores }: { open: boolean; onClose: () => void; onSaved: () => Promise<void>; scores: MemberScore[] }) {
  const [memberId, setMemberId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ContributionCategory>('technical');
  const [points, setPoints] = useState(10);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [saving, setSaving] = useState(false);

  const reset = () => { setMemberId(''); setTitle(''); setDescription(''); setCategory('technical'); setPoints(10); setDate(new Date().toISOString().slice(0, 10)); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberId || !title.trim()) { toast('error', 'Member and title are required.'); return; }
    if (points < 1 || points > 50) { toast('error', 'Points must be between 1 and 50.'); return; }
    setSaving(true);
    try {
      const { error } = await supabase.from('contributions').insert({ member_id: memberId, title: title.trim(), description: description.trim(), category, points, contribution_date: date, logged_by: 'Admin' });
      if (error) throw error;
      const member = scores.find((m) => m.id === memberId);
      toast('success', `Contribution logged for ${member?.name ?? 'member'}. +${points} points.`);
      reset(); onClose(); await onSaved();
    } catch (err) {
      toast('error', err instanceof Error ? err.message : 'Failed to log contribution.');
    } finally { setSaving(false); }
  };

  return (
    <Modal open={open} onClose={onClose} title="Log Contribution" subtitle="Record member work and award activity points (1–50).">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Member</label>
          <select className="input" value={memberId} onChange={(e) => setMemberId(e.target.value)} autoFocus>
            <option value="">Select a member…</option>
            {scores.map((m) => <option key={m.id} value={m.id}>{m.name} — {m.team}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Title</label>
          <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Built event registration system" />
        </div>
        <div>
          <label className="label">Description</label>
          <textarea className="input min-h-[80px] resize-none" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Brief summary of the work done…" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Category</label>
            <select className="input capitalize" value={category} onChange={(e) => setCategory(e.target.value as ContributionCategory)}>
              {CATEGORIES.map((c) => <option key={c} value={c} className="capitalize">{c}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Points (1–50)</label>
            <input className="input" type="number" min={1} max={50} value={points} onChange={(e) => setPoints(Number(e.target.value))} />
          </div>
        </div>
        <div>
          <label className="label">Date</label>
          <input className="input" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
          <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving…' : 'Log Contribution'}</button>
        </div>
      </form>
    </Modal>
  );
}

/* ---------- Leaderboard ---------- */

function LeaderboardView({ scores, onSelectMember }: { scores: MemberScore[]; onSelectMember: (id: string) => void }) {
  const ranked = [...scores].sort((a, b) => b.activityScore - a.activityScore);
  const maxScore = Math.max(...ranked.map((m) => m.activityScore), 1);
  const podium = ranked.slice(0, 3);
  const rest = ranked.slice(3);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-xl font-bold text-ink-900">Activity Leaderboard</h2>
        <p className="text-sm text-ink-500">Ranked by total activity score — attendance points plus contribution points.</p>
      </div>

      {podium.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-3">
          {podium.map((m, i) => {
            const place = i + 1;
            const styles = place === 1 ? 'bg-gradient-to-br from-accent-50 to-white border-accent-200' : place === 2 ? 'bg-gradient-to-br from-ink-50 to-white border-ink-200' : 'bg-gradient-to-br from-warning-50 to-white border-warning-200';
            const icon = place === 1 ? <Trophy className="h-5 w-5 text-accent-500" /> : place === 2 ? <Award className="h-5 w-5 text-ink-400" /> : <Award className="h-5 w-5 text-warning-500" />;
            const initials = m.name.split(' ').map((n) => n[0]).slice(0, 2).join('');
            return (
              <button key={m.id} onClick={() => onSelectMember(m.id)} className={`card relative overflow-hidden border-2 p-5 text-left transition-all hover:shadow-glow ${styles} ${place === 1 ? 'sm:scale-105' : ''}`}>
                <div className="absolute right-3 top-3">{icon}</div>
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-lg font-bold text-brand-700 shadow-soft">{initials}</div>
                <h3 className="mt-3 font-display text-base font-bold text-ink-900">{m.name}</h3>
                <p className="text-xs text-ink-500">{m.team} · {m.role}</p>
                <div className="mt-3 flex items-end justify-between">
                  <div>
                    <div className="font-display text-2xl font-extrabold text-ink-900">{m.activityScore}</div>
                    <div className="text-xs text-ink-500">activity score</div>
                  </div>
                  <div className="text-right text-xs text-ink-500">
                    <div>{m.attendedEvents} events</div>
                    <div>{m.contributionsCount} contributions</div>
                  </div>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-ink-100">
                  <div className="h-full rounded-full bg-gradient-to-r from-brand-400 to-brand-600" style={{ width: `${(m.activityScore / maxScore) * 100}%` }} />
                </div>
              </button>
            );
          })}
        </div>
      )}

      {rest.length > 0 && (
        <div className="space-y-2.5">
          {rest.map((m, i) => <MemberRow key={m.id} member={m} rank={i + 4} onClick={() => onSelectMember(m.id)} />)}
        </div>
      )}

      {ranked.length === 0 && (
        <EmptyState icon={<Trophy className="h-6 w-6" />} title="No rankings yet" message="Add members and log activity to build the leaderboard." />
      )}
    </div>
  );
}
