import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    'Missing Supabase environment variables. Create a .env file with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY. See .env.example for the template.'
  );
}

export const supabase = createClient(supabaseUrl ?? 'http://localhost:54321', supabaseAnonKey ?? 'placeholder', {
  auth: { persistSession: false },
});

export type AppRole = 'admin' | 'member';
export type MemberStatus = 'active' | 'inactive';
export type ActivityState = 'ACTIVE' | 'LOW_ACTIVITY' | 'INACTIVE';
export type EventType = 'meeting' | 'event' | 'workshop' | 'orientation';
export type CheckInMethod = 'code' | 'qr';
export type ContributionCategory =
  | 'technical'
  | 'design'
  | 'content'
  | 'management'
  | 'outreach'
  | 'event operations';

export interface Member {
  id: string;
  name: string;
  email: string;
  team: string;
  role: string;
  app_role: AppRole;
  joined_date: string;
  status: MemberStatus;
  created_at?: string;
}

export interface SocietyEvent {
  id: string;
  title: string;
  event_date: string;
  start_time: string;
  event_type: EventType;
  check_in_code: string;
  created_at?: string;
}

export interface Attendance {
  id: string;
  member_id: string;
  event_id: string;
  check_in_method: CheckInMethod;
  checked_in_at: string;
}

export interface Contribution {
  id: string;
  member_id: string;
  title: string;
  description: string;
  category: ContributionCategory;
  contribution_date: string;
  points: number;
  logged_by: string;
  created_at?: string;
}

export interface ActivityHistoryEntry {
  date: string;
  label: string;
  type: 'attendance' | 'contribution';
  points: number;
  detail: string;
}

export interface MemberScore extends Member {
  attendancePoints: number;
  contributionPoints: number;
  activityScore: number;
  attendedEvents: number;
  contributionsCount: number;
  attendancePercentage: number;
  activityState: ActivityState;
  lastActivityDate: string | null;
  history: ActivityHistoryEntry[];
}

export const EVENT_POINTS: Record<EventType, number> = {
  meeting: 5,
  event: 10,
  workshop: 8,
  orientation: 5,
};

export const EVENT_TYPE_META: Record<EventType, { label: string; color: string; ring: string }> = {
  meeting: { label: 'Meeting', color: 'bg-brand-100 text-brand-700', ring: 'ring-brand-200' },
  event: { label: 'Event', color: 'bg-accent-100 text-accent-700', ring: 'ring-accent-200' },
  workshop: { label: 'Workshop', color: 'bg-success-100 text-success-700', ring: 'ring-success-200' },
  orientation: { label: 'Orientation', color: 'bg-ink-100 text-ink-600', ring: 'ring-ink-200' },
};

export const CATEGORY_META: Record<ContributionCategory, { color: string }> = {
  technical: { color: 'bg-brand-100 text-brand-700' },
  design: { color: 'bg-accent-100 text-accent-700' },
  content: { color: 'bg-success-100 text-success-700' },
  management: { color: 'bg-ink-100 text-ink-700' },
  outreach: { color: 'bg-warning-100 text-warning-700' },
  'event operations': { color: 'bg-error-100 text-error-700' },
};

export const ACTIVITY_STATE_META: Record<ActivityState, { label: string; color: string; dot: string }> = {
  ACTIVE: { label: 'Active', color: 'bg-success-100 text-success-700', dot: 'bg-success-500' },
  LOW_ACTIVITY: { label: 'Low Activity', color: 'bg-warning-100 text-warning-700', dot: 'bg-warning-500' },
  INACTIVE: { label: 'Inactive', color: 'bg-error-100 text-error-700', dot: 'bg-error-500' },
};

export const TEAM_OPTIONS = ['Core Team', 'Technology', 'Design', 'Outreach', 'Operations', 'Content'];
export const ROLE_OPTIONS = ['Lead', 'Co-Lead', 'Member', 'Mentor'];
export const EVENT_TYPES: EventType[] = ['meeting', 'event', 'workshop', 'orientation'];
export const CATEGORIES: ContributionCategory[] = [
  'technical',
  'design',
  'content',
  'management',
  'outreach',
  'event operations',
];

export const INACTIVITY_WINDOW = 3;
