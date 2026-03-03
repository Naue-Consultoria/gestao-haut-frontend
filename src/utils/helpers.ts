export function sumArr<T>(arr: T[] | undefined, field: keyof T): number {
  return (arr || []).reduce((s, i) => s + (Number(i[field]) || 0), 0);
}

export function getInitials(name: string): string {
  return name.charAt(0).toUpperCase();
}
