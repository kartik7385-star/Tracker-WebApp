import { useCallback, useEffect, useState } from 'react';
import { supabase, EVENT_POINTS, INACTIVITY_WINDOW, type ActivityHistoryEntry, type ActivityState, type Attendance, type Contribution, type Member, type MemberScore, type SocietyEvent } from '@/lib/supabase';

type DataState = {
  members: Member[];
  events: SocietyEvent[];
  attendance: Attendance[];
  contributions: Contribution[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

export function useSocietyData(): DataState {
  const [members, setMembers] = useState<Member[]>([]);
  const [events, setEvents] = useState<SocietyEvent[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [membersRes, eventsRes, attendanceRes, contributionsRes] = await Promise.all([
        supabase.from('members').select('*').order('name'),
        supabase.from('events').select('*').order('event_date', { ascending: false }),
        supabase.from('attendance').select('*'),
        supabase.from('contributions').select('*').order('contribution_date', { ascending: false }),
      ]);

      const errors = [membersRes, eventsRes, attendanceRes, contributionsRes].filter((r) => r.error);
      if (errors.length) throw errors[0]!.error;

      setMembers(membersRes.data as Member[]);
      setEvents(eventsRes.data as SocietyEvent[]);
      setAttendance(attendanceRes.data as Attendance[]);
      setContributions(contributionsRes.data as Contribution[]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unable to load society data.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return { members, events, attendance, contributions, loading, error, refresh: load };
}

function computeActivityState(
  member: Member,
  events: SocietyEvent[],
  attendance: Attendance[],
  contributions: Contribution[],
): ActivityState {
  const pastMeetings = events
    .filter((e) => e.event_type === 'meeting')
    .sort((a, b) => b.event_date.localeCompare(a.event_date));

  const recentMeetingIds = new Set(pastMeetings.slice(0, INACTIVITY_WINDOW).map((e) => e.id));
  const memberAttendance = attendance.filter((a) => a.member_id === member.id);
  const attendedRecentMeetings = memberAttendance.filter((a) => recentMeetingIds.has(a.event_id)).length;

  const recentMeetingDates = pastMeetings.slice(0, INACTIVITY_WINDOW).map((e) => e.event_date);
  const latestRelevantDate = recentMeetingDates[0];

  if (latestRelevantDate) {
    const recentContributions = contributions.filter(
      (c) => c.member_id === member.id && c.contribution_date >= latestRelevantDate,
    );
    if (attendedRecentMeetings === 0 && recentContributions.length === 0) {
      return 'INACTIVE';
    }
  }

  if (attendedRecentMeetings > 0 && attendedRecentMeetings >= Math.ceil(INACTIVITY_WINDOW / 2)) {
    return 'ACTIVE';
  }

  const totalRecentActivity = attendedRecentMeetings;
  if (totalRecentActivity === 0) {
    return 'INACTIVE';
  }

  return 'LOW_ACTIVITY';
}

function computeHistory(
  memberId: string,
  events: SocietyEvent[],
  attendance: Attendance[],
  contributions: Contribution[],
): ActivityHistoryEntry[] {
  const eventMap = new Map(events.map((e) => [e.id, e]));
  const entries: ActivityHistoryEntry[] = [];

  for (const a of attendance.filter((a) => a.member_id === memberId)) {
    const ev = eventMap.get(a.event_id);
    if (!ev) continue;
    entries.push({
      date: ev.event_date,
      label: ev.title,
      type: 'attendance',
      points: EVENT_POINTS[ev.event_type],
      detail: `Checked in to ${ev.title}`,
    });
  }

  for (const c of contributions.filter((c) => c.member_id === memberId)) {
    entries.push({
      date: c.contribution_date,
      label: c.title,
      type: 'contribution',
      points: c.points,
      detail: c.description || c.title,
    });
  }

  return entries.sort((a, b) => b.date.localeCompare(a.date));
}

export function computeScores(
  members: Member[],
  events: SocietyEvent[],
  attendance: Attendance[],
  contributions: Contribution[],
): MemberScore[] {
  const eventMap = new Map(events.map((e) => [e.id, e]));
  const contributionPoints = new Map<string, number>();
  const contributionCounts = new Map<string, number>();
  for (const c of contributions) {
    contributionPoints.set(c.member_id, (contributionPoints.get(c.member_id) ?? 0) + c.points);
    contributionCounts.set(c.member_id, (contributionCounts.get(c.member_id) ?? 0) + 1);
  }

  const attendancePoints = new Map<string, number>();
  const attendedEvents = new Map<string, number>();
  for (const a of attendance) {
    const ev = eventMap.get(a.event_id);
    if (!ev) continue;
    const pts = EVENT_POINTS[ev.event_type] ?? 5;
    attendancePoints.set(a.member_id, (attendancePoints.get(a.member_id) ?? 0) + pts);
    attendedEvents.set(a.member_id, (attendedEvents.get(a.member_id) ?? 0) + 1);
  }

  const totalEvents = events.length || 1;

  return members.map((m) => {
    const attendancePts = attendancePoints.get(m.id) ?? 0;
    const contributionPts = contributionPoints.get(m.id) ?? 0;
    const attended = attendedEvents.get(m.id) ?? 0;
    const history = computeHistory(m.id, events, attendance, contributions);
    const lastActivityDate = history.length > 0 ? history[0].date : null;

    return {
      ...m,
      attendancePoints: attendancePts,
      contributionPoints: contributionPts,
      activityScore: attendancePts + contributionPts,
      attendedEvents: attended,
      contributionsCount: contributionCounts.get(m.id) ?? 0,
      attendancePercentage: Math.round((attended / totalEvents) * 100),
      activityState: computeActivityState(m, events, attendance, contributions),
      lastActivityDate,
      history,
    };
  });
}
