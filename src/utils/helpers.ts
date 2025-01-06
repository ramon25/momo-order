export function anonymizeName(name: string): string {
  if (name.length <= 2) return name;
  return `${name[0]}${'.'.repeat(Math.min(3, name.length - 2))}${name[name.length - 1]}`;
} 