import { CalendarDays, CheckCircle2, Clock, Hash, TrendingUp, Users } from 'lucide-react';
import type { ActivityHistoryEntry, Attendance, Contribution, MemberScore, SocietyEvent } from '@/lib/supabase';
import { ACTIVITY_STATE_META, CATEGORY_META, EVENT_POINTS, EVENT_TYPE_META } from '@/lib/supabase';

interface EventCardProps {
  event: SocietyEvent;
  attendance: Attendance[];
  members: MemberScore[];
}

export function EventCard({ event, attendance, members }: EventCardProps) {
  const meta = EVENT_TYPE_META[event.event_type];
  const checkedIn = attendance.filter((a) => a.event_id === event.id);
  const memberMap = new Map(members.map((m) => [m.id, m]));
  const date = new Date(event.event_date + 'T00:00:00');
  const formattedDate = date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  const isPast = date < new Date(new Date().toDateString());

  return (
    <div className="card group relative overflow-hidden p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-glow">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
            <CalendarDays className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-display text-base font-bold leading-tight text-ink-900">{event.title}</h3>
            <div className="mt-1 flex items-center gap-2">
              <span className={`chip ${meta.color} ring-1 ${meta.ring}`}>{meta.label}</span>
              <span className="text-xs text-ink-400">{isPast ? 'Completed' : 'Upcoming'}</span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs font-semibold uppercase tracking-wide text-ink-400">Points</div>
          <div className="font-display text-lg font-bold text-brand-600">+{EVENT_POINTS[event.event_type]}</div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div className="flex items-center gap-2 text-ink-600">
          <CalendarDays className="h-4 w-4 text-ink-400" />
          {formattedDate}
        </div>
        <div className="flex items-center gap-2 text-ink-600">
          <Clock className="h-4 w-4 text-ink-400" />
          {event.start_time.slice(0, 5)}
        </div>
        <div className="col-span-2 flex items-center gap-2 text-ink-600">
          <Hash className="h-4 w-4 text-ink-400" />
          <code className="rounded-md bg-ink-100 px-2 py-0.5 font-mono text-xs font-semibold text-ink-700">
            {event.check_in_code}
          </code>
        </div>
      </div>

      <div className="mt-4 border-t border-ink-100 pt-3">
        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-1.5 font-semibold text-ink-500">
            <Users className="h-3.5 w-3.5" /> Attendance
          </span>
          <span className="font-bold text-ink-700">
            {checkedIn.length}
            <span className="font-normal text-ink-400"> / {members.length}</span>
          </span>
        </div>
        {checkedIn.length > 0 ? (
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {checkedIn.slice(0, 6).map((a) => {
              const m = memberMap.get(a.member_id);
              if (!m) return null;
              const initials = m.name.split(' ').map((n) => n[0]).slice(0, 2).join('');
              return (
                <div
                  key={a.id}
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-100 text-[10px] font-bold text-brand-700 ring-2 ring-white"
                  title={m.name}
                >
                  {initials}
                </div>
              );
            })}
            {checkedIn.length > 6 && (
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-ink-100 text-[10px] font-bold text-ink-500 ring-2 ring-white">
                +{checkedIn.length - 6}
              </div>
            )}
          </div>
        ) : (
          <p className="mt-2 text-xs text-ink-400">No check-ins recorded yet.</p>
        )}
      </div>
    </div>
  );
}

interface ContributionRowProps {
  contribution: Contribution;
  member?: MemberScore;
}

export function ContributionRow({ contribution, member }: ContributionRowProps) {
  const meta = CATEGORY_META[contribution.category];
  return (
    <div className="flex items-start gap-3 rounded-xl border border-ink-100 bg-white p-3.5 transition-colors hover:bg-ink-50">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-ink-100 text-xs font-bold text-ink-600">
        {member?.name?.split(' ').map((n) => n[0]).slice(0, 2).join('') ?? '?'}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-sm font-semibold text-ink-800">{contribution.title}</p>
          <span className="shrink-0 rounded-md bg-success-50 px-2 py-0.5 text-xs font-bold text-success-700">
            +{contribution.points}
          </span>
        </div>
        <p className="truncate text-xs text-ink-500">{member?.name ?? 'Unknown member'}</p>
        <div className="mt-1.5 flex items-center gap-2">
          <span className={`chip ${meta.color}`}>{contribution.category}</span>
          <span className="text-xs text-ink-400">
            {new Date(contribution.contribution_date + 'T00:00:00').toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
            })}
          </span>
        </div>
      </div>
    </div>
  );
}

interface MemberRowProps {
  member: MemberScore;
  rank: number;
  onClick?: () => void;
}

export function MemberRow({ member, rank, onClick }: MemberRowProps) {
  const initials = member.name.split(' ').map((n) => n[0]).slice(0, 2).join('');
  const stateMeta = ACTIVITY_STATE_META[member.activityState];

  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-xl border border-ink-100 bg-white p-3.5 text-left transition-all hover:border-brand-200 hover:shadow-soft"
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-ink-50 text-xs font-bold text-ink-500">
        #{rank}
      </div>
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">
        {initials}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-semibold text-ink-800">{member.name}</p>
          <span className={`chip ${stateMeta.color}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${stateMeta.dot}`} />
            {stateMeta.label}
          </span>
        </div>
        <p className="truncate text-xs text-ink-500">
          {member.team} · {member.role}
        </p>
      </div>
      <div className="flex shrink-0 gap-4 text-right">
        <div>
          <div className="text-xs text-ink-400">Events</div>
          <div className="text-sm font-bold text-ink-700">{member.attendedEvents}</div>
        </div>
        <div>
          <div className="text-xs text-ink-400">Contribs</div>
          <div className="text-sm font-bold text-ink-700">{member.contributionsCount}</div>
        </div>
        <div>
          <div className="text-xs text-ink-400">Score</div>
          <div className="font-display text-sm font-bold text-brand-600">{member.activityScore}</div>
        </div>
      </div>
    </button>
  );
}

interface ActivityStateBadgeProps {
  state: MemberScore['activityState'];
}

export function ActivityStateBadge({ state }: ActivityStateBadgeProps) {
  const meta = ACTIVITY_STATE_META[state];
  return (
    <span className={`chip ${meta.color}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
      {meta.label}
    </span>
  );
}

interface ActivityTrendChartProps {
  history: ActivityHistoryEntry[];
}

export function ActivityTrendChart({ history }: ActivityTrendChartProps) {
  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-ink-200 bg-ink-50/50 py-8 text-center">
        <TrendingUp className="mb-2 h-6 w-6 text-ink-300" />
        <p className="text-sm text-ink-500">No activity history yet.</p>
      </div>
    );
  }

  const sorted = [...history].sort((a, b) => a.date.localeCompare(b.date));
  const cumulative: { date: string; total: number; label: string }[] = [];
  let running = 0;
  for (const entry of sorted) {
    running += entry.points;
    cumulative.push({ date: entry.date, total: running, label: entry.label });
  }

  const maxTotal = Math.max(...cumulative.map((c) => c.total), 1);
  const chartHeight = 140;
  const stepWidth = cumulative.length > 1 ? 100 / (cumulative.length - 1) : 0;
  const points = cumulative.map((c, i) => ({
    x: cumulative.length === 1 ? 50 : i * stepWidth,
    y: chartHeight - (c.total / maxTotal) * (chartHeight - 20) - 10,
    total: c.total,
    label: c.label,
    date: c.date,
  }));

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaD = `${pathD} L ${points[points.length - 1].x} ${chartHeight} L ${points[0].x} ${chartHeight} Z`;

  return (
    <div>
      <div className="relative" style={{ height: chartHeight + 30 }}>
        <svg viewBox={`0 0 100 ${chartHeight}`} preserveAspectRatio="none" className="h-full w-full overflow-visible">
          <defs>
            <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3392ff" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#3392ff" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={areaD} fill="url(#trendGradient)" />
          <path d={pathD} fill="none" stroke="#1c75f0" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
          {points.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r="1.5" fill="#1c75f0" vectorEffect="non-scaling-stroke" />
          ))}
        </svg>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-between px-1">
          {cumulative.map((c, i) => (
            <span key={i} className="text-[10px] text-ink-400">
              {new Date(c.date + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
            </span>
          ))}
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between text-xs">
        <span className="text-ink-500">Cumulative activity score</span>
        <span className="font-bold text-brand-600">{running} pts total</span>
      </div>
    </div>
  );
}

interface ActivityTimelineProps {
  history: ActivityHistoryEntry[];
}

export function ActivityTimeline({ history }: ActivityTimelineProps) {
  if (history.length === 0) {
    return <p className="text-sm text-ink-400">No activity recorded yet.</p>;
  }

  return (
    <div className="space-y-2">
      {history.map((entry, i) => (
        <div key={i} className="flex items-start gap-3 rounded-lg border border-ink-100 bg-white p-3">
          <div className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
            entry.type === 'attendance' ? 'bg-brand-50 text-brand-600' : 'bg-success-50 text-success-600'
          }`}>
            {entry.type === 'attendance' ? <CheckCircle2 className="h-4 w-4" /> : <TrendingUp className="h-4 w-4" />}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <p className="truncate text-sm font-semibold text-ink-800">{entry.label}</p>
              <span className="shrink-0 text-xs font-bold text-brand-600">+{entry.points}</span>
            </div>
            <p className="truncate text-xs text-ink-500">{entry.detail}</p>
            <p className="mt-0.5 text-xs text-ink-400">
              {new Date(entry.date + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              {' · '}
              {entry.type === 'attendance' ? 'Attendance' : 'Contribution'}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  message: string;
}

export function EmptyState({ icon, title, message }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-ink-200 bg-ink-50/50 px-6 py-12 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-ink-400 shadow-soft">
        {icon}
      </div>
      <h3 className="font-display text-sm font-bold text-ink-700">{title}</h3>
      <p className="mt-1 max-w-xs text-sm text-ink-500">{message}</p>
    </div>
  );
}
