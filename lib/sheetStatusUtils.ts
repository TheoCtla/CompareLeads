/**
 * Utilitaires pour la détection correcte des statuts vides côté Sheet
 */

/**
 * Normalise une chaîne pour la comparaison en gérant les accents, espaces, NBSP, etc.
 */
export function normalizeForCompare(value: unknown): string {
  // Conversion sécurisée en string
  let str = String(value ?? "");
  
  // Remplacer NBSP (\u00A0) et ZWSP (\u200B) par des espaces normaux
  str = str.replace(/[\u00A0\u200B]/g, " ");
  
  // Trim
  str = str.trim();
  
  // Conversion lowercase
  str = str.toLowerCase();
  
  // Dé-accentuation: normaliser NFD et supprimer les diacritiques
  str = str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  
  // Collapse des espaces multiples en un seul
  str = str.replace(/\s+/g, " ");
  
  return str;
}

/**
 * Lit la valeur brute d'une cellule CSV de manière sécurisée
 */
export function getCellString(value: unknown): string {
  // Si null/undefined, retourner chaîne vide
  if (value === null || value === undefined) {
    return "";
  }
  
  // Si c'est un objet (certains exports), tenter d'extraire la valeur
  if (typeof value === "object" && value !== null) {
    const obj = value as any;
    return obj.displayValue ?? obj.value ?? String(value);
  }
  
  // Sinon conversion string standard
  return String(value);
}

/**
 * Liste blanche des valeurs non vides connues (pour diagnostics)
 */
export const KNOWN_SHEET_STATUS_VALUES = new Set([
  "a evaluer",
  "qualifie", 
  "converti",
  "non qualifie",
  "perdu",
  "doublon"
]);

/**
 * Options pour la détection de statut vide
 */
export interface SheetStatusOptions {
  considerAEvaluerAsEmpty?: boolean;
}

/**
 * Détermine si un statut côté Sheet est considéré comme vide
 */
export function isEmptySheetStatus(
  rawValue: unknown, 
  options: SheetStatusOptions = {}
): boolean {
  // Obtenir la valeur brute
  const rawString = getCellString(rawValue);
  
  // Normaliser pour comparaison
  const normalized = normalizeForCompare(rawString);
  
  // Vide si chaîne normalisée vide
  if (normalized === "") {
    return true;
  }
  
  // Par défaut: considérer "à évaluer" comme vide
  if (normalized === "a evaluer") {
    return true;
  }
  
  return false;
}

/**
 * Trouve la colonne statut dans les en-têtes (insensible à la casse/accents)
 */
export function findStatusColumn(headers: string[]): string | null {
  const statusPatterns = [
    "statut",
    "status", 
    "etat",
    "state"
  ];
  
  for (const header of headers) {
    const normalizedHeader = normalizeForCompare(header);
    if (statusPatterns.some(pattern => normalizedHeader.includes(pattern))) {
      return header;
    }
  }
  
  return null;
}

/**
 * Analyse les valeurs d'une colonne statut pour diagnostics
 */
export interface StatusAnalysis {
  totalRows: number;
  emptyCount: number;
  topValues: Array<{
    normalized: string;
    raw: string;
    count: number;
  }>;
  columnFound: boolean;
  columnName: string | null;
}

export function analyzeStatusColumn(
  data: any[], 
  statusColumn: string,
  options: SheetStatusOptions = {}
): StatusAnalysis {
  const analysis: StatusAnalysis = {
    totalRows: data.length,
    emptyCount: 0,
    topValues: [],
    columnFound: false,
    columnName: statusColumn
  };
  
  // Vérifier si la colonne existe
  if (data.length > 0 && statusColumn in data[0]) {
    analysis.columnFound = true;
    
    // Compter les valeurs
    const valueCounts = new Map<string, { raw: string; count: number }>();
    
    for (const row of data) {
      const rawValue = getCellString(row[statusColumn]);
      const normalized = normalizeForCompare(rawValue);
      
      if (isEmptySheetStatus(rawValue, options)) {
        analysis.emptyCount++;
      }
      
      // Compter les valeurs pour le top
      const key = normalized;
      if (valueCounts.has(key)) {
        valueCounts.get(key)!.count++;
      } else {
        valueCounts.set(key, { raw: rawValue, count: 1 });
      }
    }
    
    // Trier par fréquence et prendre le top 10
    analysis.topValues = Array.from(valueCounts.entries())
      .map(([normalized, { raw, count }]) => ({ normalized, raw, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }
  
  return analysis;
}
