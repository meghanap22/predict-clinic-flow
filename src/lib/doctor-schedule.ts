export type ScheduleSlotType = "appointment" | "break" | "admin" | "block";

export interface ScheduleSlot {
  start: string;
  end: string;
  title: string;
  type: ScheduleSlotType;
  room?: string;
}

export interface DoctorScheduleEntry {
  id: string;
  name: string;
  department: string;
  sessionLoad: number;
  shift: string;
  todaySchedule: ScheduleSlot[];
}

export const DOCTOR_SCHEDULE: DoctorScheduleEntry[] = [
  {
    id: "dr-alvarez",
    name: "Dr. Alvarez",
    department: "Pediatrics",
    sessionLoad: 92,
    shift: "08:00 – 16:00",
    todaySchedule: [
      { start: "08:00", end: "08:20", title: "Team stand-up", type: "admin" },
      { start: "08:30", end: "09:00", title: "Well-child visit", type: "appointment", room: "Room 2" },
      { start: "09:05", end: "09:35", title: "Sick visit — fever", type: "appointment", room: "Room 2" },
      { start: "09:40", end: "10:10", title: "Vaccination block", type: "appointment", room: "Room 2" },
      { start: "10:15", end: "10:30", title: "Charting buffer", type: "block" },
      { start: "10:30", end: "11:00", title: "Follow-up — asthma", type: "appointment", room: "Room 5" },
      { start: "11:05", end: "11:35", title: "New patient intake", type: "appointment", room: "Room 5" },
      { start: "12:00", end: "12:30", title: "Lunch", type: "break" },
      { start: "12:30", end: "13:00", title: "Walk-in overflow", type: "appointment", room: "Room 2" },
      { start: "13:05", end: "13:35", title: "Sibling back-to-back", type: "appointment", room: "Room 2" },
      { start: "14:00", end: "14:30", title: "Parent consult", type: "appointment", room: "Room 5" },
      { start: "15:00", end: "15:30", title: "End-of-day documentation", type: "admin" },
    ],
  },
  {
    id: "dr-chen",
    name: "Dr. Chen",
    department: "Cardiology",
    sessionLoad: 71,
    shift: "09:00 – 17:00",
    todaySchedule: [
      { start: "09:00", end: "09:30", title: "EKG review block", type: "admin" },
      { start: "09:45", end: "10:30", title: "Stress test consult", type: "appointment", room: "Room 8" },
      { start: "10:45", end: "11:30", title: "Post-procedure follow-up", type: "appointment", room: "Room 8" },
      { start: "11:30", end: "12:00", title: "Cardiology rounds", type: "admin" },
      { start: "12:00", end: "12:45", title: "Lunch", type: "break" },
      { start: "13:00", end: "13:45", title: "Hypertension management", type: "appointment", room: "Room 8" },
      { start: "14:00", end: "14:45", title: "Echo results discussion", type: "appointment", room: "Room 11" },
      { start: "15:00", end: "15:30", title: "Referral coordination", type: "admin" },
      { start: "16:00", end: "16:30", title: "Afternoon clinic slot", type: "appointment", room: "Room 8" },
    ],
  },
  {
    id: "dr-patel",
    name: "Dr. Patel",
    department: "Urgent Care",
    sessionLoad: 88,
    shift: "07:30 – 15:30",
    todaySchedule: [
      { start: "07:30", end: "07:45", title: "Shift handoff", type: "admin" },
      { start: "08:00", end: "08:20", title: "Acute visit — ankle injury", type: "appointment", room: "UC-1" },
      { start: "08:25", end: "08:45", title: "Acute visit — URI", type: "appointment", room: "UC-1" },
      { start: "09:00", end: "09:20", title: "Stitch removal", type: "appointment", room: "UC-2" },
      { start: "09:30", end: "09:50", title: "Rapid triage block", type: "block" },
      { start: "10:00", end: "10:20", title: "Work note / forms", type: "appointment", room: "UC-1" },
      { start: "10:30", end: "10:50", title: "Acute visit — abdominal pain", type: "appointment", room: "UC-3" },
      { start: "11:00", end: "11:30", title: "Team surge huddle", type: "admin" },
      { start: "12:00", end: "12:25", title: "Lunch", type: "break" },
      { start: "12:30", end: "12:50", title: "Walk-in — back pain", type: "appointment", room: "UC-2" },
      { start: "13:00", end: "13:20", title: "Acute visit — laceration", type: "appointment", room: "UC-1" },
      { start: "14:00", end: "14:20", title: "Discharge planning", type: "admin" },
    ],
  },
  {
    id: "dr-okafor",
    name: "Dr. Okafor",
    department: "General",
    sessionLoad: 54,
    shift: "10:00 – 18:00",
    todaySchedule: [
      { start: "10:00", end: "10:30", title: "Inbox & refills", type: "admin" },
      { start: "10:45", end: "11:15", title: "Annual physical", type: "appointment", room: "Room 6" },
      { start: "11:30", end: "12:00", title: "Chronic care — diabetes", type: "appointment", room: "Room 6" },
      { start: "12:00", end: "12:45", title: "Lunch", type: "break" },
      { start: "13:00", end: "13:30", title: "Lab review visit", type: "appointment", room: "Room 6" },
      { start: "14:00", end: "14:30", title: "Open slot (available)", type: "block", room: "Room 6" },
      { start: "15:00", end: "15:30", title: "Telehealth block", type: "appointment" },
      { start: "16:30", end: "17:00", title: "Quality metrics review", type: "admin" },
    ],
  },
  {
    id: "dr-lindberg",
    name: "Dr. Lindberg",
    department: "Radiology",
    sessionLoad: 36,
    shift: "08:30 – 14:30",
    todaySchedule: [
      { start: "08:30", end: "09:00", title: "Reading room setup", type: "admin" },
      { start: "09:00", end: "09:30", title: "Chest X-ray batch", type: "appointment", room: "Imaging A" },
      { start: "10:00", end: "10:30", title: "Ultrasound reads", type: "appointment", room: "Imaging B" },
      { start: "11:00", end: "11:30", title: "Consult — orthopedics", type: "appointment", room: "Reading 2" },
      { start: "12:00", end: "12:45", title: "Lunch", type: "break" },
      { start: "13:00", end: "13:30", title: "MRI preliminary reads", type: "appointment", room: "Imaging A" },
      { start: "14:00", end: "14:30", title: "Teaching conference", type: "admin" },
    ],
  },
];

export function getDoctorById(id: string) {
  return DOCTOR_SCHEDULE.find((d) => d.id === id);
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Split plain text into segments, matching longest doctor names first. */
export function splitByDoctorNames(text: string) {
  const names = [...DOCTOR_SCHEDULE].sort((a, b) => b.name.length - a.name.length);
  const pattern = new RegExp(`(${names.map((d) => escapeRegex(d.name)).join("|")})`, "g");
  const parts: Array<{ kind: "text"; value: string } | { kind: "doctor"; doctor: DoctorScheduleEntry }> = [];
  let last = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > last) {
      parts.push({ kind: "text", value: text.slice(last, match.index) });
    }
    const doctor = DOCTOR_SCHEDULE.find((d) => d.name === match![0]);
    if (doctor) parts.push({ kind: "doctor", doctor });
    last = match.index + match[0].length;
  }

  if (last < text.length) parts.push({ kind: "text", value: text.slice(last) });
  if (parts.length === 0) parts.push({ kind: "text", value: text });
  return parts;
}

export const SLOT_TYPE_LABELS: Record<ScheduleSlotType, string> = {
  appointment: "Patient",
  break: "Break",
  admin: "Admin",
  block: "Buffer",
};
