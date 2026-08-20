export const APP_TIME_ZONE = "America/Sao_Paulo";

const SAO_PAULO_UTC_OFFSET = "-03:00";

export function formatDateTime(date: Date) {
  return date.toLocaleString("pt-BR", { timeZone: APP_TIME_ZONE });
}

export function formatDate(date: Date) {
  return date.toLocaleDateString("pt-BR", { timeZone: APP_TIME_ZONE });
}

export function parseDateInAppTimeZone(
  value: string | undefined,
  endOfDay = false,
) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;

  const [year, month, day] = value.split("-").map(Number);
  const calendarDate = new Date(Date.UTC(year, month - 1, day));

  if (
    calendarDate.getUTCFullYear() !== year ||
    calendarDate.getUTCMonth() !== month - 1 ||
    calendarDate.getUTCDate() !== day
  ) {
    return null;
  }

  const time = endOfDay ? "23:59:59.999" : "00:00:00.000";
  return new Date(`${value}T${time}${SAO_PAULO_UTC_OFFSET}`);
}
