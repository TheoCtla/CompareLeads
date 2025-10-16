'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { CsvData, CompareOptions } from '@/lib/types';
import { detectCommonColumns, findColumnByPattern } from '@/lib/parseCsv';
import { findStatusColumn } from '@/lib/classify';

interface MappingFormProps {
  sheetData: CsvData | null;
  hubspotData: CsvData | null;
  onCompare: (options: CompareOptions) => void;
  isProcessing: boolean;
  hasCompared: boolean;
}

export function MappingForm({ sheetData, hubspotData, onCompare, isProcessing, hasCompared }: MappingFormProps) {
  const [options, setOptions] = React.useState<CompareOptions>({
    sheetKey: '',
    hubspotKey: '',
    sheetStatusColumn: ''
  });

  const [errors, setErrors] = React.useState<string[]>([]);

  React.useEffect(() => {
    if (sheetData && hubspotData) {
      // Filtrer les en-têtes valides
      const validSheetHeaders = sheetData.headers.filter(h => h && h.trim() !== '');
      const validHubspotHeaders = hubspotData.headers.filter(h => h && h.trim() !== '');
      
      // Détecter les colonnes communes
      const commonColumns = detectCommonColumns(validSheetHeaders, validHubspotHeaders);
      
      // Trouver la colonne de statut dans le Sheet
      const statusColumn = findStatusColumn(validSheetHeaders);
      
      // Pré-sélectionner email si disponible dans chaque fichier
      const sheetEmailColumn = validSheetHeaders.find(col => 
        col.toLowerCase().includes('email') || col.toLowerCase().includes('mail')
      );
      const hubspotEmailColumn = validHubspotHeaders.find(col => 
        col.toLowerCase().includes('email') || col.toLowerCase().includes('mail')
      );
      
      setOptions({
        sheetKey: sheetEmailColumn || commonColumns[0] || validSheetHeaders[0] || '',
        hubspotKey: hubspotEmailColumn || commonColumns[0] || validHubspotHeaders[0] || '',
        sheetStatusColumn: statusColumn || validSheetHeaders.find(h => h.toLowerCase().includes('statut')) || validSheetHeaders[0] || ''
      });
    }
  }, [sheetData, hubspotData]);

  const handleCompare = () => {
    const newErrors: string[] = [];
    
    if (!options.sheetKey) {
      newErrors.push('Veuillez sélectionner une clé pour le fichier Sheet');
    }
    if (!options.hubspotKey) {
      newErrors.push('Veuillez sélectionner une clé pour le fichier HubSpot');
    }
    if (!options.sheetStatusColumn) {
      newErrors.push('Veuillez sélectionner une colonne de statut pour le fichier Sheet');
    }

    // Vérifier les colonnes HubSpot requises
    if (hubspotData) {
      const requiredColumns = [
        "Phase de cycle de vie ACQUEREURS B2C",
        "Statut du lead ACQUEREURS"
      ];
      const missingColumns = requiredColumns.filter(col => 
        !hubspotData.headers.includes(col)
      );
      if (missingColumns.length > 0) {
        newErrors.push(`Colonnes HubSpot manquantes: ${missingColumns.join(', ')}`);
      }
    }

    setErrors(newErrors);
    
    if (newErrors.length === 0) {
      onCompare(options);
    }
  };

  if (!sheetData || !hubspotData) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuration de la comparaison</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {errors.length > 0 && (
          <Alert variant="destructive">
            <AlertDescription>
              <ul className="list-disc list-inside space-y-1">
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="font-medium">Clé de jointure - Sheet</h3>
            <Select 
              value={options.sheetKey} 
              onValueChange={(value) => setOptions(prev => ({ ...prev, sheetKey: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner une colonne" />
              </SelectTrigger>
              <SelectContent>
                {sheetData.headers
                  .filter(header => header && header.trim() !== '')
                  .map((header) => (
                    <SelectItem key={header} value={header}>
                      {header}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            <h3 className="font-medium">Clé de jointure - HubSpot</h3>
            <Select 
              value={options.hubspotKey} 
              onValueChange={(value) => setOptions(prev => ({ ...prev, hubspotKey: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner une colonne" />
              </SelectTrigger>
              <SelectContent>
                {hubspotData.headers
                  .filter(header => header && header.trim() !== '')
                  .map((header) => (
                    <SelectItem key={header} value={header}>
                      {header}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-medium">Colonne de statut - Sheet</h3>
          <Select 
            value={options.sheetStatusColumn} 
            onValueChange={(value) => setOptions(prev => ({ ...prev, sheetStatusColumn: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner la colonne de statut" />
            </SelectTrigger>
            <SelectContent>
              {sheetData.headers
                .filter(header => header && header.trim() !== '')
                .map((header) => (
                  <SelectItem key={header} value={header}>
                    {header}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
          <p className="text-sm text-gray-600">
            Seuls les leads avec un statut vide dans cette colonne seront analysés
          </p>
        </div>

        <Button 
          onClick={handleCompare} 
          disabled={isProcessing || hasCompared}
          className="w-full"
        >
          {isProcessing ? 'Comparaison en cours...' : hasCompared ? 'Comparaison terminée' : 'Comparer les données'}
        </Button>
      </CardContent>
    </Card>
  );
}
