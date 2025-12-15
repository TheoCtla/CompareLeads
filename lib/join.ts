import { SheetRow, HubSpotRow, ResultRow, CompareOptions, JoinResult } from './types';
import { normalizeKey, extractEmail } from './normalize';
import { classifyLead, classifyProposition } from './classify';

export function joinData(
  sheetData: SheetRow[],
  hubspotData: HubSpotRow[],
  options: CompareOptions
): JoinResult {
  const results: ResultRow[] = [];
  let totalProcessed = 0;
  let matchedCount = 0;
  let unmatchedCount = 0;
  const unmatchedEmails: string[] = [];
  const unmatchedNames: string[] = [];
  const unmatchedPrenoms: string[] = [];


  // Construire un Map côté HubSpot par clé normalisée (garder tous les enregistrements)
  const hubspotMap = new Map<string, HubSpotRow[]>();
  const hubspotDuplicates = new Map<string, number>();
  const hubspotDuplicateEmails: string[] = [];
  const hubspotDuplicateNames: string[] = [];
  const hubspotDuplicatePrenoms: string[] = [];

  for (const row of hubspotData) {
    // Extraire l'email de la colonne HubSpot (ex: "Nom - email@test.com - email@test.com" → "email@test.com")
    const rawValue = row[options.hubspotKey];
    const key = extractEmail(rawValue) || normalizeKey(rawValue);
    if (key) {
      if (hubspotMap.has(key)) {
        hubspotMap.get(key)!.push(row);
        hubspotDuplicates.set(key, (hubspotDuplicates.get(key) || 0) + 1);
        if (!hubspotDuplicateEmails.includes(key)) {
          hubspotDuplicateEmails.push(key);
          // Capturer nom et prénom pour les doublons HubSpot
          const nom = row.nom || row.name || row.Nom || row.Name || '';
          const prenom = row['Prénom'] || row.prenom || row.Prenom || row.PRENOM || row.firstname || row.firstName || row.FirstName || row.first_name || row.First_Name || '';
          if (nom) hubspotDuplicateNames.push(nom);
          if (prenom) hubspotDuplicatePrenoms.push(prenom);
        }
      } else {
        hubspotMap.set(key, [row]);
      }
    }
  }

  // Construire un Map pour détecter les doublons côté Sheet
  const sheetKeys = new Map<string, number>();
  const sheetDuplicateEmails: string[] = [];
  const sheetDuplicateNames: string[] = [];
  const sheetDuplicatePrenoms: string[] = [];
  for (const row of sheetData) {
    const key = normalizeKey(row[options.sheetKey]);
    if (key) {
      if (sheetKeys.has(key)) {
        if (!sheetDuplicateEmails.includes(key)) {
          sheetDuplicateEmails.push(key);
          // Capturer nom et prénom pour les doublons Sheet
          const nom = row.nom || row.name || row.Nom || row.Name || '';
          const prenom = row['Prénom'] || row.prenom || row.Prenom || row.PRENOM || row.firstname || row.firstName || row.FirstName || row.first_name || row.First_Name || '';
          if (nom) sheetDuplicateNames.push(nom);
          if (prenom) sheetDuplicatePrenoms.push(prenom);
        }
      }
      sheetKeys.set(key, (sheetKeys.get(key) || 0) + 1);
    }
  }

  // Itérer tous les clients du Sheet
  for (const sheetRow of sheetData) {
    totalProcessed++;

    const statusValue = sheetRow[options.sheetStatusColumn] || '';

    const key = normalizeKey(sheetRow[options.sheetKey]);
    if (!key) {
      unmatchedCount++;
      // Capturer les détails des leads sans clé valide
      const email = sheetRow.email || sheetRow.Email || sheetRow.EMAIL || '';
      const nom = sheetRow.nom || sheetRow.name || sheetRow.Nom || sheetRow.Name || '';
      const prenom = sheetRow['Prénom'] || sheetRow.prenom || sheetRow.Prenom || sheetRow.PRENOM || sheetRow.firstname || sheetRow.firstName || sheetRow.FirstName || sheetRow.first_name || sheetRow.First_Name || '';
      if (email) unmatchedEmails.push(email);
      if (nom) unmatchedNames.push(nom);
      if (prenom) unmatchedPrenoms.push(prenom);
      continue;
    }

    const hubspotRows = hubspotMap.get(key);
    if (!hubspotRows || hubspotRows.length === 0) {
      unmatchedCount++;
      // Capturer les détails des leads sans correspondance dans HubSpot
      const email = sheetRow.email || sheetRow.Email || sheetRow.EMAIL || '';
      const nom = sheetRow.nom || sheetRow.name || sheetRow.Nom || sheetRow.Name || '';
      const prenom = sheetRow['Prénom'] || sheetRow.prenom || sheetRow.Prenom || sheetRow.PRENOM || sheetRow.firstname || sheetRow.firstName || sheetRow.FirstName || sheetRow.first_name || sheetRow.First_Name || '';
      if (email) unmatchedEmails.push(email);
      if (nom) unmatchedNames.push(nom);
      if (prenom) unmatchedPrenoms.push(prenom);
      continue;
    }

    // Traiter tous les enregistrements HubSpot (y compris les doublons)
    for (const hubspotRow of hubspotRows) {
      matchedCount++;

      // Extraire "Phase de la transaction" (insensible à la casse)
      const phaseKey = Object.keys(hubspotRow).find(k =>
        k.toLowerCase().includes('phase de la transaction')
      );
      const phase = phaseKey ? hubspotRow[phaseKey] : '';
      const statutLead = ''; // Non utilisé pour l'instant

      // Utiliser la nouvelle logique de classification
      const classificationResult = classifyLead(phase);
      // Si la classification retourne null, on met une chaîne vide (pas de nouvelle qualification)
      const label = classificationResult === null ? "" : classificationResult;

      // Classifier la proposition
      const proposition = classifyProposition(phase);

      const result: ResultRow = {
        key,
        nom: sheetRow.nom || sheetRow.name || sheetRow.Nom || sheetRow.Name || '',
        prenom: sheetRow['Prénom'] || sheetRow.prenom || sheetRow.Prenom || sheetRow.PRENOM || sheetRow.firstname || sheetRow.firstName || sheetRow.FirstName || sheetRow.first_name || sheetRow.First_Name || '',
        sheetStatut: statusValue,
        phase,
        statutLead,
        label,
        proposition
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
      hubspotEmails: hubspotDuplicateEmails,
      sheetNames: sheetDuplicateNames,
      hubspotNames: hubspotDuplicateNames,
      sheetPrenoms: sheetDuplicatePrenoms,
      hubspotPrenoms: hubspotDuplicatePrenoms
    },
    unmatchedDetails: {
      emails: unmatchedEmails,
      names: unmatchedNames,
      prenoms: unmatchedPrenoms
    }
  };
}
