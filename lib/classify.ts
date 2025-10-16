import { normalizeForComparison } from './normalize';

// Règles de classification selon les spécifications
export function classifyLead(phase: string, statutLead: string): "Qualifié" | "Non qualifié" {
  const normalizedPhase = normalizeForComparison(phase);
  const normalizedStatut = normalizeForComparison(statutLead);
  
  // Exclure les leads avec phase = "lead" (sans conditions supplémentaires)
  if (normalizedPhase === "lead") {
    return "Non qualifié";
  }
  
  // Règle 1: Phase = "lead + (ro fait- echange email)" ET statut = "lead actif - en cours"
  const targetPhase = "lead + (ro fait- echange email)";
  const targetStatus = "lead actif - en cours";
  
  if (normalizedPhase === targetPhase && normalizedStatut === targetStatus) {
    return "Qualifié";
  }
  
  // Règle 2: Phase = "lead + (ro fait- echange email)" ET statut = "lead marketing"
  const targetStatus2 = "lead marketing";
  
  if (normalizedPhase === targetPhase && normalizedStatut === targetStatus2) {
    return "Qualifié";
  }
  
  // Règle 3: Phase contient "r1", "r2", ou "r3" (peu importe le statut du lead)
  const rPhases = ["r1", "r2", "r3"];
  if (rPhases.some(rPhase => normalizedPhase.includes(rPhase))) {
    return "Qualifié";
  }
  
  // Sinon Non qualifié
  return "Non qualifié";
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
