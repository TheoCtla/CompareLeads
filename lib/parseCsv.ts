import Papa from 'papaparse';
import { CsvData } from './types';

export function parseCsv(file: File): Promise<CsvData> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false, // Important: ne pas convertir les valeurs
      complete: (results) => {
        if (results.errors.length > 0) {
          reject(new Error(`Erreurs de parsing CSV: ${results.errors.map(e => e.message).join(', ')}`));
          return;
        }
        
        const data = results.data as Record<string, any>[];
        const headers = Object.keys(data[0] || {});
        
        resolve({
          headers,
          rows: data,
          fileName: file.name
        });
      },
      error: (error) => {
        reject(new Error(`Erreur lors du parsing: ${error.message}`));
      }
    });
  });
}

export function detectCommonColumns(sheetHeaders: string[], hubspotHeaders: string[]): string[] {
  const common = [];
  const sheetLower = sheetHeaders
    .filter(h => h && h.trim() !== '')
    .map(h => h.toLowerCase().trim());
  const hubspotLower = hubspotHeaders
    .filter(h => h && h.trim() !== '')
    .map(h => h.toLowerCase().trim());
  
  for (const header of sheetHeaders) {
    if (!header || header.trim() === '') continue;
    
    const lowerHeader = header.toLowerCase().trim();
    if (hubspotLower.includes(lowerHeader)) {
      common.push(header);
    }
  }
  
  return common;
}

export function findColumnByPattern(headers: string[], patterns: string[]): string | null {
  const validHeaders = headers.filter(h => h && h.trim() !== '');
  const headersLower = validHeaders.map(h => h.toLowerCase().trim());
  
  for (const pattern of patterns) {
    const patternLower = pattern.toLowerCase().trim();
    for (let i = 0; i < headersLower.length; i++) {
      if (headersLower[i].includes(patternLower) || patternLower.includes(headersLower[i])) {
        return validHeaders[i];
      }
    }
  }
  
  return null;
}
