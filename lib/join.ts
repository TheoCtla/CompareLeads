import { SheetRow, HubSpotRow, ResultRow, CompareOptions, JoinResult } from './types';
import { normalizeKey, isEmpty, normalizeText } from './normalize';
import { classifyLead } from './classify';
import { isEmptySheetStatus, normalizeForCompare } from './sheetStatusUtils';

export function joinData(
  sheetData: SheetRow[],
  hubspotData: HubSpotRow[],
  options: CompareOptions
): JoinResult {
  const results: ResultRow[] = [];
  let totalProcessed = 0;
  let matchedCount = 0;
  let unmatchedCount = 0;
  
  // Construire un Map côté HubSpot par clé normalisée (garder tous les enregistrements)
  const hubspotMap = new Map<string, HubSpotRow[]>();
  const hubspotDuplicates = new Map<string, number>();
  const hubspotDuplicateEmails: string[] = [];
  
  for (const row of hubspotData) {
    const key = normalizeKey(row[options.hubspotKey]);
    if (key) {
      if (hubspotMap.has(key)) {
        hubspotMap.get(key)!.push(row);
        hubspotDuplicates.set(key, (hubspotDuplicates.get(key) || 0) + 1);
        if (!hubspotDuplicateEmails.includes(key)) {
          hubspotDuplicateEmails.push(key);
        }
      } else {
        hubspotMap.set(key, [row]);
      }
    }
  }
  
  // Construire un Map pour détecter les doublons côté Sheet
  const sheetKeys = new Map<string, number>();
  const sheetDuplicateEmails: string[] = [];
  for (const row of sheetData) {
    const key = normalizeKey(row[options.sheetKey]);
    if (key) {
      if (sheetKeys.has(key)) {
        if (!sheetDuplicateEmails.includes(key)) {
          sheetDuplicateEmails.push(key);
        }
      }
      sheetKeys.set(key, (sheetKeys.get(key) || 0) + 1);
    }
  }
  
  // Itérer le Sheet, ne retenir que les lignes avec statut vide
  for (const sheetRow of sheetData) {
    totalProcessed++;
    
    const statusValue = sheetRow[options.sheetStatusColumn];
    
    // Utiliser la nouvelle logique de détection de statut vide
    if (!isEmptySheetStatus(statusValue)) {
      continue;
    }
    
    const key = normalizeKey(sheetRow[options.sheetKey]);
    if (!key) {
      unmatchedCount++;
      continue;
    }
    
    const hubspotRows = hubspotMap.get(key);
    if (!hubspotRows || hubspotRows.length === 0) {
      unmatchedCount++;
      continue;
    }
    
    // Traiter tous les enregistrements HubSpot (y compris les doublons)
    for (const hubspotRow of hubspotRows) {
      matchedCount++;
      
      // Extraire les données pour le résultat
      const phase = hubspotRow["Phase de cycle de vie ACQUEREURS B2C"] || '';
      const statutLead = hubspotRow["Statut du lead ACQUEREURS"] || '';
      
      // Utiliser la nouvelle logique de classification
      const label = classifyLead(phase, statutLead);
      
      // Ignorer les cas où la classification retourne null (cas à ignorer)
      if (label === null) {
        continue;
      }
      
      const result: ResultRow = {
        key,
        nom: sheetRow.nom || sheetRow.name || sheetRow.Nom || sheetRow.Name || '',
        email: sheetRow.email || sheetRow.Email || sheetRow.EMAIL || '',
        sheetStatut: statusValue,
        phase,
        statutLead,
        label
      };
      
      results.push(result);
    }
  }
  
  return {
    results,
    totalProcessed,
    matchedCount,
    unmatchedCount,
    duplicates: {
      sheet: Array.from(sheetKeys.values()).filter(count => count > 1).length,
      hubspot: Array.from(hubspotDuplicates.values()).reduce((sum, count) => sum + count, 0),
      sheetEmails: sheetDuplicateEmails,
      hubspotEmails: hubspotDuplicateEmails
    }
  };
}
