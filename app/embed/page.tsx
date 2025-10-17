'use client';

import React, { useState } from 'react';
import { FileDrop } from '@/components/FileDrop';
import { MappingForm } from '@/components/MappingForm';
import { ResultsTable } from '@/components/ResultsTable';
import { StatusDiagnostics } from '@/components/StatusDiagnostics';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { parseCsv } from '@/lib/parseCsv';
import { joinData } from '@/lib/join';
import { CsvData, CompareOptions, JoinResult } from '@/lib/types';
import { FileText, BarChart3 } from 'lucide-react';

export default function EmbedPage() {
  const [sheetData, setSheetData] = useState<CsvData | null>(null);
  const [hubspotData, setHubspotData] = useState<CsvData | null>(null);
  const [sheetFile, setSheetFile] = useState<File | null>(null);
  const [hubspotFile, setHubspotFile] = useState<File | null>(null);
  const [results, setResults] = useState<JoinResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasCompared, setHasCompared] = useState(false);
  const [currentOptions, setCurrentOptions] = useState<CompareOptions | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSheetFile = async (file: File) => {
    try {
      setError(null);
      setSheetFile(file);
      const data = await parseCsv(file);
      setSheetData(data);
    } catch (err) {
      setError(`Erreur lors du parsing du fichier Sheet: ${err instanceof Error ? err.message : 'Erreur inconnue'}`);
      setSheetFile(null);
    }
  };

  const handleHubspotFile = async (file: File) => {
    try {
      setError(null);
      setHubspotFile(file);
      const data = await parseCsv(file);
      setHubspotData(data);
    } catch (err) {
      setError(`Erreur lors du parsing du fichier HubSpot: ${err instanceof Error ? err.message : 'Erreur inconnue'}`);
      setHubspotFile(null);
    }
  };

  const handleFileError = (message: string) => {
    setError(message);
  };

  const handleCompare = async (options: CompareOptions) => {
    if (!sheetData || !hubspotData) return;

    setIsProcessing(true);
    setError(null);
    setCurrentOptions(options);

    try {
      const joinResults = joinData(sheetData.rows, hubspotData.rows, options);
      setResults(joinResults);
      setHasCompared(true);
    } catch (err) {
      setError(`Erreur lors de la comparaison: ${err instanceof Error ? err.message : 'Erreur inconnue'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const resetData = () => {
    setSheetData(null);
    setHubspotData(null);
    setSheetFile(null);
    setHubspotFile(null);
    setResults(null);
    setHasCompared(false);
    setCurrentOptions(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Compare Leads Sheet vs HubSpot
            </h1>
            <p className="text-base text-gray-600">
              Comparaison des leads entre fichiers Sheet et HubSpot
            </p>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {!sheetData || !hubspotData ? (
            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <FileText className="h-4 w-4" />
                    Étape 1: Upload des fichiers CSV
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <FileDrop
                      onFileSelect={handleSheetFile}
                      onFileRemove={() => {
                        setSheetData(null);
                        setSheetFile(null);
                      }}
                      file={sheetFile}
                      title="Fichier Sheet (Suivi interne)"
                      description=""
                      accept=".csv"
                      onError={handleFileError}
                    />
                    <FileDrop
                      onFileSelect={handleHubspotFile}
                      onFileRemove={() => {
                        setHubspotData(null);
                        setHubspotFile(null);
                      }}
                      file={hubspotFile}
                      title="Fichier HubSpot (Export)"
                      description=""
                      accept=".csv"
                      onError={handleFileError}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="space-y-4">
              <MappingForm
                sheetData={sheetData}
                hubspotData={hubspotData}
                onCompare={handleCompare}
                isProcessing={isProcessing}
                hasCompared={hasCompared}
              />

              {sheetData && currentOptions && (
                <StatusDiagnostics
                  sheetData={sheetData}
                  options={currentOptions}
                />
              )}

              {results && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Résultats de la comparaison
                    </h2>
                    <Button
                      onClick={resetData}
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      Recommencer
                    </Button>
                  </div>
                  <ResultsTable results={results} />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
