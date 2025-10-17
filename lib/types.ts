export type SheetRow = Record<string, any>;
export type HubSpotRow = Record<string, any>;

export type CompareOptions = {
  sheetKey: string;     // ex "email"
  hubspotKey: string;   // ex "email"
  sheetStatusColumn: string; // ex "statut" (par défaut), modifiable
};

export type ResultRow = {
  key: string;
  nom?: string;
  prenom?: string;
  sheetStatut?: string; // vide ici
  phase?: string;       // HubSpot: "Phase de cycle de vie ACQUEREURS B2C"
  statutLead?: string;  // HubSpot: "Statut du lead ACQUEREURS"
  label: "Qualifié" | "Non qualifié";
};

export type CsvData = {
  headers: string[];
  rows: Record<string, any>[];
  fileName: string;
};

export type ValidationResult = {
  isValid: boolean;
  errors: string[];
  warnings: string[];
};

export type JoinResult = {
  results: ResultRow[];
  totalProcessed: number;
  matchedCount: number;
  unmatchedCount: number;
  duplicates: {
    sheet: number;
    hubspot: number;
    sheetEmails: string[];
    hubspotEmails: string[];
  };
  unmatchedDetails: {
    emails: string[];
    names: string[];
    prenoms: string[];
  };
};
