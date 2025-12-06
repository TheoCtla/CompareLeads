import { normalizeForComparison } from './normalize';
import { PropositionValue } from './types';

export type QualificationLabel = "Qualifié" | "Non qualifié" | "Lead marketing" | null;

// Fonction de normalisation améliorée selon les spécifications
function normalize(value: any): string {
  if (value === null || value === undefined) return '';
  
  let normalized = String(value);
  
  // Remplacer NBSP/ZWSP par espace vide
  normalized = normalized.replace(/[\u00A0\u200B]/g, ' ');
  
  // Trim
  normalized = normalized.trim();
  
  // toLowerCase
  normalized = normalized.toLowerCase();
  
  // NFD + suppression des diacritiques
  normalized = normalized.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  
  // Compacter espaces multiples
  normalized = normalized.replace(/\s+/g, ' ');
  
  return normalized;
}

// Fonction de classification selon les nouvelles règles
// Basé sur la colonne "Phase de la transaction" uniquement
export function classifyLead(phaseRaw: string, _statutRaw?: string): QualificationLabel {
  const phase = normalize(phaseRaw);
  
  // ORDRE DE PRIORITÉ IMPORTANT !
  
  // 1️⃣ "Lead marketing" → Lead marketing (DOIT être testé AVANT "lead")
  if (phase.includes("lead marketing")) {
    return "Lead marketing";
  }
  
  // 2️⃣ "lead" ou "r0" → Ignorer (ne pas retourner)
  if (phase.includes("lead") || phase.includes("r0")) {
    return null;
  }
  
  // 3️⃣ "r1", "r2", "option", "compromis", "dossier", "perdue" → Qualifié
  if (
    phase.includes("r1") || 
    phase.includes("r2") || 
    phase.includes("option") || 
    phase.includes("compromis") || 
    phase.includes("dossier") || 
    phase.includes("perdue")
  ) {
    return "Qualifié";
  }
  
  // 4️⃣ "cible" → Non qualifié
  if (phase.includes("cible")) {
    return "Non qualifié";
  }
  
  // Tout autre cas → Ignorer
  return null;
}

// Fonction de classification pour la colonne "Proposition"
// Basé sur la colonne "Phase de la transaction"
export function classifyProposition(phaseRaw: string): PropositionValue {
  const phase = normalize(phaseRaw);
  
  // "fermé", "compromis" ou "dossier" → Oui
  if (phase.includes("ferme") || phase.includes("compromis") || phase.includes("dossier")) {
    return "Oui";
  }
  
  // "cible" → Non
  if (phase.includes("cible")) {
    return "Non";
  }
  
  // "perdue" → Variable
  if (phase.includes("perdue")) {
    return "Variable";
  }
  
  // Tout autre cas → On attend
  return "On attend";
}

// Tests unitaires pour valider les combinaisons clés
export function runClassificationTests(): { passed: number; failed: number; results: Array<{ test: string; expected: QualificationLabel; actual: QualificationLabel; passed: boolean }> } {
  const testCases: Array<{ phase: string; expected: QualificationLabel; description: string }> = [
    // Cas Lead marketing (priorité haute - doit être testé avant "lead")
    { phase: "Lead marketing - B2C", expected: "Lead marketing", description: "Lead marketing - B2C → Lead marketing" },
    { phase: "B2C - Lead marketing", expected: "Lead marketing", description: "B2C - Lead marketing → Lead marketing" },
    { phase: "LEAD MARKETING", expected: "Lead marketing", description: "LEAD MARKETING (majuscules) → Lead marketing" },
    
    // Cas ignorés (lead ou R0)
    { phase: "LEAD", expected: null, description: "LEAD → null (ignorer)" },
    { phase: "Lead", expected: null, description: "Lead → null (ignorer)" },
    { phase: "B2C - R0 (échange email)", expected: null, description: "B2C - R0 (échange email) → null (ignorer)" },
    { phase: "R0", expected: null, description: "R0 → null (ignorer)" },
    
    // Cas qualifiés
    { phase: "B2C - R1 (qualif faite)", expected: "Qualifié", description: "B2C - R1 (qualif faite) → Qualifié" },
    { phase: "B2C - R2 (solution proposée)", expected: "Qualifié", description: "B2C - R2 (solution proposée) → Qualifié" },
    { phase: "B2C - OPTION POSÉE", expected: "Qualifié", description: "B2C - OPTION POSÉE → Qualifié" },
    { phase: "B2C - OPTION FERME", expected: "Qualifié", description: "B2C - OPTION FERME → Qualifié" },
    { phase: "B2C - COMPROMIS SIGNÉ", expected: "Qualifié", description: "B2C - COMPROMIS SIGNÉ → Qualifié" },
    { phase: "B2C - DOSSIER ACTÉ", expected: "Qualifié", description: "B2C - DOSSIER ACTÉ → Qualifié" },
    { phase: "B2C - PERDUE + Motifs", expected: "Qualifié", description: "B2C - PERDUE + Motifs → Qualifié" },
    
    // Cas non qualifiés
    { phase: "B2C - Hors cible", expected: "Non qualifié", description: "B2C - Hors cible → Non qualifié" },
    { phase: "Hors CIBLE", expected: "Non qualifié", description: "Hors CIBLE (majuscules) → Non qualifié" },
    
    // Cas d'ignorer (autres)
    { phase: "Autre phase inconnue", expected: null, description: "Autre phase inconnue → null (ignorer)" },
  ];
  
  let passed = 0;
  let failed = 0;
  const results: Array<{ test: string; expected: QualificationLabel; actual: QualificationLabel; passed: boolean }> = [];
  
  for (const testCase of testCases) {
    const actual = classifyLead(testCase.phase) as QualificationLabel;
    const testPassed = actual === testCase.expected;
    
    if (testPassed) {
      passed++;
    } else {
      failed++;
    }
    
    results.push({
      test: testCase.description,
      expected: testCase.expected,
      actual,
      passed: testPassed
    });
  }
  
  return { passed, failed, results };
}

// Fonction pour valider les colonnes HubSpot requises
export function validateHubSpotColumns(headers: string[]): { isValid: boolean; missingColumns: string[] } {
  // Colonne requise : "Phase de la transaction" (insensible à la casse)
  const hasPhaseColumn = headers.some(header => 
    header.toLowerCase().includes('phase de la transaction')
  );
  
  const missingColumns: string[] = [];
  if (!hasPhaseColumn) {
    missingColumns.push("Phase de la transaction");
  }
  
  return {
    isValid: missingColumns.length === 0,
    missingColumns
  };
}

// Fonction pour détecter les colonnes de statut dans le Sheet
export function findStatusColumn(headers: string[]): string | null {
  const statusPatterns = [
    "statut",
    "status", 
    "etat",
    "state"
  ];
  
  const validHeaders = headers.filter(h => h && h.trim() !== '');
  
  for (const pattern of statusPatterns) {
    const found = validHeaders.find(header => 
      header.toLowerCase().trim().includes(pattern.toLowerCase())
    );
    if (found) return found;
  }
  
  return null;
}
