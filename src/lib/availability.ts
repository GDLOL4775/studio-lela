import { addMinutes, format, isAfter, isBefore, isSameDay, startOfDay } from "date-fns";

export type WeeklyScheduleRow = {
  weekday: number;
  start_time: string; // "HH:MM:SS"
  end_time: string;
  slot_minutes: number;
  active: boolean;
};

export type ScheduleBlock = {
  starts_at: string;
  ends_at: string;
};

export type BookedAppointment = {
  starts_at: string;
  duration_minutes: number;
};

function parseTimeOnDate(date: Date, time: string): Date {
  const [h, m] = time.split(":").map(Number);
  const d = new Date(date);
  d.setHours(h, m, 0, 0);
  return d;
}

/** Compute slots for the given date based on weekly schedule, hiding blocked/booked times. */
export function computeAvailableSlots(
  date: Date,
  schedule: WeeklyScheduleRow[],
  blocks: ScheduleBlock[],
  booked: BookedAppointment[],
  now: Date = new Date(),
): Date[] {
  const day = date.getDay();
  const row = schedule.find((r) => r.weekday === day && r.active);
  if (!row) return [];

  const start = parseTimeOnDate(date, row.start_time);
  const end = parseTimeOnDate(date, row.end_time);

  const slots: Date[] = [];
  let cur = start;
  while (isBefore(cur, end)) {
    slots.push(new Date(cur));
    cur = addMinutes(cur, row.slot_minutes);
  }

  return slots.filter((slot) => {
    // Hide past slots
    if (isSameDay(slot, now) && isBefore(slot, now)) return false;

    const slotEnd = addMinutes(slot, row.slot_minutes);

    // Hide blocked
    for (const b of blocks) {
      const bs = new Date(b.starts_at);
      const be = new Date(b.ends_at);
      if (isBefore(slot, be) && isAfter(slotEnd, bs)) return false;
    }

    // Hide booked
    for (const a of booked) {
      const as = new Date(a.starts_at);
      const ae = addMinutes(as, a.duration_minutes);
      if (isBefore(slot, ae) && isAfter(slotEnd, as)) return false;
    }
    return true;
  });
}

export function formatSlot(d: Date) {
  return format(d, "HH:mm");
}

export { startOfDay };
