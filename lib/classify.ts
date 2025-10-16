import { normalizeForComparison } from './normalize';

export type QualificationLabel = "Qualifié" | "Non qualifié" | null;

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
export function classifyLead(phaseRaw: string, statutRaw: string): QualificationLabel {
  const phase = normalize(phaseRaw);
  const statut = normalize(statutRaw);
  
  // a) Qualifié (priorité la plus haute)
  
  // Phase contient R1, R2, ou R3 → Qualifié (quelle que soit la valeur du statut)
  if (phase.includes("r1") || phase.includes("r2") || phase.includes("r3")) {
    return "Qualifié";
  }
  
  // Phase = Lead et Statut = Lead marketing → Qualifié
  if (phase === "lead" && statut === "lead marketing") {
    return "Qualifié";
  }
  
  // Phase = R0 et Statut = Lead marketing → Qualifié
  if (phase === "r0" && statut === "lead marketing") {
    return "Qualifié";
  }
  
  // Phase = R0 et Statut = Lead actif en cours → Qualifié
  if (phase === "r0" && statut === "lead actif en cours") {
    return "Qualifié";
  }
  
  // b) Non qualifié
  
  // (Phase = Lead ou Phase = Lead Perdu) et Statut contient l'un de:
  // - Hors cible
  // - Lead perdu
  // - Faux numéro (ou Faux num)
  if ((phase === "lead" || phase.startsWith("lead perdu")) && 
      (statut.includes("hors cible") || 
       statut.includes("lead perdu") || 
       statut.includes("faux num") || 
       statut.includes("faux numero") || 
       statut.includes("faux numéro"))) {
    return "Non qualifié";
  }
  
  // c) Ignorer (ne pas afficher dans la table de sortie)
  
  // Phase = Lead et Statut = Lead actif en cours → On attend → Ignorer
  if (phase === "lead" && statut === "lead actif en cours") {
    return null;
  }
  
  // Tout autre couple non couvert par a) ou b) → Ignorer
  return null;
}

// Tests unitaires pour valider les combinaisons clés
export function runClassificationTests(): { passed: number; failed: number; results: Array<{ test: string; expected: QualificationLabel; actual: QualificationLabel; passed: boolean }> } {
  const testCases: Array<{ phase: string; statut: string; expected: QualificationLabel; description: string }> = [
    // Cas d'ignorer
    { phase: "Lead", statut: "Lead actif en cours", expected: null, description: "Lead / Lead actif en cours → null (ignorer)" },
    
    // Cas qualifiés
    { phase: "Lead", statut: "Lead marketing", expected: "Qualifié", description: "Lead / Lead marketing → Qualifié" },
    { phase: "R0", statut: "Lead marketing", expected: "Qualifié", description: "R0 / Lead marketing → Qualifié" },
    { phase: "R0", statut: "Lead actif en cours", expected: "Qualifié", description: "R0 / Lead actif en cours → Qualifié" },
    { phase: "R1", statut: "anything", expected: "Qualifié", description: "R1 / anything → Qualifié" },
    { phase: "R2", statut: "anything", expected: "Qualifié", description: "R2 / anything → Qualifié" },
    { phase: "R3", statut: "anything", expected: "Qualifié", description: "R3 / anything → Qualifié" },
    { phase: "Phase R1 - En cours", statut: "anything", expected: "Qualifié", description: "Phase R1 - En cours / anything → Qualifié" },
    { phase: "Phase R2 - Finalisée", statut: "anything", expected: "Qualifié", description: "Phase R2 - Finalisée / anything → Qualifié" },
    { phase: "Phase R3 - Validée", statut: "anything", expected: "Qualifié", description: "Phase R3 - Validée / anything → Qualifié" },
    
    // Cas non qualifiés
    { phase: "Lead", statut: "Hors cible", expected: "Non qualifié", description: "Lead / Hors cible → Non qualifié" },
    { phase: "Lead", statut: "Faux num", expected: "Non qualifié", description: "Lead / Faux num → Non qualifié" },
    { phase: "Lead", statut: "Faux numéro", expected: "Non qualifié", description: "Lead / Faux numéro → Non qualifié" },
    { phase: "Lead", statut: "Lead perdu sans suite", expected: "Non qualifié", description: "Lead / Lead perdu sans suite → Non qualifié" },
    { phase: "Lead perdu - Sans suite", statut: "Lead perdu", expected: "Non qualifié", description: "Lead perdu - Sans suite / Lead perdu → Non qualifié" },
    
    // Cas d'ignorer supplémentaires
    { phase: "Autre phase", statut: "Autre statut", expected: null, description: "Autre phase / Autre statut → null (ignorer)" },
    { phase: "Lead", statut: "Autre statut", expected: null, description: "Lead / Autre statut → null (ignorer)" },
  ];
  
  let passed = 0;
  let failed = 0;
  const results: Array<{ test: string; expected: QualificationLabel; actual: QualificationLabel; passed: boolean }> = [];
  
  for (const testCase of testCases) {
    const actual = classifyLead(testCase.phase, testCase.statut) as QualificationLabel;
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
  const requiredColumns = [
    "Phase de cycle de vie ACQUEREURS B2C",
    "Statut du lead ACQUEREURS"
  ];
  
  const missingColumns = requiredColumns.filter(required => 
    !headers.some(header => header === required)
  );
  
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
