import Papa from 'papaparse';
import { ResultRow } from './types';

export function exportResultsToCsv(results: ResultRow[], filename: string = 'resultats-leads.csv'): void {
  const csvData = results.map(row => ({
    'Identifiant': row.key,
    'Nom': row.nom || '',
    'Prénom': row.prenom || '',
    'Statut Sheet': row.sheetStatut || '',
    'Phase de cycle de vie ACQUEREURS B2C': row.phase || '',
    'Statut du lead ACQUEREURS': row.statutLead || '',
    'Label': row.label
  }));
  
  const csv = Papa.unparse(csvData, {
    header: true,
    delimiter: ','
  });
  
  // Créer et télécharger le fichier
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

export function generateCsvContent(results: ResultRow[]): string {
  const csvData = results.map(row => ({
    'Identifiant': row.key,
    'Nom': row.nom || '',
    'Prénom': row.prenom || '',
    'Statut Sheet': row.sheetStatut || '',
    'Phase de cycle de vie ACQUEREURS B2C': row.phase || '',
    'Statut du lead ACQUEREURS': row.statutLead || '',
    'Label': row.label
  }));
  
  return Papa.unparse(csvData, {
    header: true,
    delimiter: ','
  });
}
