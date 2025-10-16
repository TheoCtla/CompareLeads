import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { CsvData, CompareOptions } from '@/lib/types';
import { analyzeStatusColumn, findStatusColumn } from '@/lib/sheetStatusUtils';
import { AlertTriangle, CheckCircle, Info } from 'lucide-react';

interface StatusDiagnosticsProps {
  sheetData: CsvData | null;
  options: CompareOptions;
}

export function StatusDiagnostics({ sheetData, options }: StatusDiagnosticsProps) {
  if (!sheetData) return null;

  // Trouver la colonne statut automatiquement si pas spécifiée
  const statusColumn = options.sheetStatusColumn || findStatusColumn(sheetData.headers);
  
  if (!statusColumn) {
    return (
      <Alert className="border-yellow-200 bg-yellow-50">
        <AlertTriangle className="h-4 w-4 text-yellow-600" />
        <AlertDescription className="text-yellow-800">
          <strong>Colonnes statut non trouvée :</strong> Aucune colonne "statut" détectée dans le fichier Sheet. 
          Vérifiez que votre fichier contient une colonne avec "statut" dans le nom.
        </AlertDescription>
      </Alert>
    );
  }

  // Analyser la colonne statut
  const analysis = analyzeStatusColumn(sheetData.rows, statusColumn);

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Info className="h-5 w-5 text-blue-600" />
          Diagnostics de la colonne Statut
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="bg-white p-3 rounded border">
            <div className="font-medium text-gray-900">Total lignes</div>
            <div className="text-2xl font-bold text-blue-600">{analysis.totalRows}</div>
          </div>
          <div className="bg-white p-3 rounded border">
            <div className="font-medium text-gray-900">Statuts vides</div>
            <div className="text-2xl font-bold text-green-600">{analysis.emptyCount}</div>
          </div>
        </div>

        
      </CardContent>
    </Card>
  );
}
