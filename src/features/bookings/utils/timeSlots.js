export function toMinutes(time) {
  if (!time) return null;
  const match = String(time)
    .trim()
    .match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return null;
  let hours = Number(match[1]) % 12;
  if (match[3].toUpperCase() === "PM") hours += 12;
  return hours * 60 + Number(match[2]);
}

export function formatTime(totalMinutes) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const suffix = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;
  return `${String(displayHours).padStart(2, "0")}:${String(minutes).padStart(2, "0")} ${suffix}`;
}

export function buildTimeSlots(timeSlots, durationMinutes) {
  const duration = Number(durationMinutes);

  if (!Number.isFinite(duration) || duration <= 0) {
    return [];
  }

  return (timeSlots || [])
    .filter((timeSlot) => timeSlot.isActive !== false)
    .flatMap((timeSlot) => {
      const startMinutes = toMinutes(timeSlot.startTime);
      const endMinutes = toMinutes(timeSlot.endTime);

      if (
        startMinutes == null ||
        endMinutes == null ||
        endMinutes <= startMinutes
      ) {
        return [];
      }

      // Keep a fixed 15-minute separation between services so rendered slots
      // and the day timeline cannot overlap because of stale slot settings.
      const bufferMinutes = 15;

      const slots = [];

      for (
        let current = startMinutes;
        current + duration + bufferMinutes <= endMinutes;
        current += duration + bufferMinutes
      ) {
        slots.push({
          id: `${timeSlot._id}-${current}`,
          mongoId: timeSlot._id,
          startTime: timeSlot.startTime,
          label: `${formatTime(current)} – ${formatTime(current + duration)}`,
          bufferMinutes,
        });
      }

      return slots;
    });
}
