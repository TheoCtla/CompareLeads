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

// Extraire un email d'une chaîne de caractères
// Ex: "Henri Dupont - test@gmail.com - test@gmail.com" → "test@gmail.com"
export function extractEmail(value: any): string {
  if (value === null || value === undefined) return '';
  
  const str = String(value);
  
  // Regex pour trouver un email dans une chaîne
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi;
  const matches = str.match(emailRegex);
  
  if (matches && matches.length > 0) {
    // Retourner le premier email trouvé, normalisé
    return matches[0].trim().toLowerCase();
  }
  
  return '';
}
