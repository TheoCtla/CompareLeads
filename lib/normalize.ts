export function normalizeKey(value: any): string {
  if (value === null || value === undefined) return '';
  return String(value).trim().toLowerCase();
}

export function isEmpty(value: any): boolean {
  if (value === null || value === undefined) return true;
  return String(value).trim() === '';
}

export function normalizeText(value: any): string {
  if (value === null || value === undefined) return '';
  return String(value).trim().toLowerCase();
}

export function removeAccents(str: string): string {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

export function normalizeForComparison(value: any): string {
  const normalized = normalizeText(value);
  return removeAccents(normalized);
}
