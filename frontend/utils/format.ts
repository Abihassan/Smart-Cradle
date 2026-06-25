export function fmtTemperature(celsius: number | null | undefined): string {
  if (celsius == null) return "--°";
  return `${celsius.toFixed(1)}°C`;
}

export function fmtHumidity(percent: number | null | undefined): string {
  if (percent == null) return "--%";
  return `${Math.round(percent)}%`;
}

export function fmtRelativeTime(isoString: string): string {
  const date = new Date(isoString);
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;

  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;

  const diffDay = Math.floor(diffHr / 24);
  return `${diffDay}d ago`;
}

export function fmtClock(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

export function fmtBabyAge(birthDateIso: string): string {
  const birth = new Date(birthDateIso);
  const now = new Date();
  const days = Math.floor((now.getTime() - birth.getTime()) / 86400000);

  if (days < 14) return `${days} day${days === 1 ? "" : "s"} old`;
  const weeks = Math.floor(days / 7);
  if (weeks < 12) return `${weeks} week${weeks === 1 ? "" : "s"} old`;
  const months = Math.floor(days / 30.44);
  return `${months} month${months === 1 ? "" : "s"} old`;
}
