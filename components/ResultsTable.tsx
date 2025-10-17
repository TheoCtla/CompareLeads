'use client';

import React from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  SortingState,
  ColumnFiltersState,
} from '@tanstack/react-table';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ResultRow, JoinResult } from '@/lib/types';
import { exportResultsToCsv } from '@/lib/exportCsv';
import { ArrowUpDown, Download, ChevronLeft, ChevronRight } from 'lucide-react';

interface ResultsTableProps {
  results: JoinResult;
}

export function ResultsTable({ results }: ResultsTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [showDuplicates, setShowDuplicates] = React.useState(false);
  const [showUnmatched, setShowUnmatched] = React.useState(false);

  const columns: ColumnDef<ResultRow>[] = [
    {
      accessorKey: 'key',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Email
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const key = row.getValue('key') as string;
        const isDuplicate = results.duplicates.sheetEmails.includes(key) || results.duplicates.hubspotEmails.includes(key);
        return (
          <div className="flex items-center gap-2">
            <span>{key}</span>
            {isDuplicate && (
              <span className="px-1.5 py-0.5 bg-orange-100 text-orange-800 rounded text-xs font-medium">
                Doublon
              </span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'nom',
      header: 'Nom',
    },
    {
      accessorKey: 'prenom',
      header: 'Prénom',
    },
    {
      accessorKey: 'phase',
      header: () => (
        <div className="text-center">
          <div>Phase de cycle de vie</div>
          <div>ACQUEREURS B2C</div>
        </div>
      ),
      cell: ({ row }) => (
        <div className="max-w-[180px] truncate text-xs" title={row.getValue('phase')}>
          {row.getValue('phase')}
        </div>
      ),
    },
    {
      accessorKey: 'statutLead',
      header: () => (
        <div className="text-center">
          <div>Statut du lead</div>
          <div>ACQUEREURS</div>
        </div>
      ),
      cell: ({ row }) => (
        <div className="max-w-[180px] truncate text-xs" title={row.getValue('statutLead')}>
          {row.getValue('statutLead')}
        </div>
      ),
    },
    {
      accessorKey: 'label',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Label
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const label = row.getValue('label') as string;
        return (
          <span className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${
            label === 'Qualifié' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {label}
          </span>
        );
      },
    },
  ];

  const table = useReactTable({
    data: results.results,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    state: {
      sorting,
      columnFilters,
    },
  });

  const handleExport = () => {
    exportResultsToCsv(results.results, 'resultats-leads.csv');
  };

  const qualifiedCount = results.results.filter(r => r.label === 'Qualifié').length;
  const unqualifiedCount = results.results.filter(r => r.label === 'Non qualifié').length;

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Résultats de la comparaison</CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              {results.results.length} leads trouvés • {qualifiedCount} qualifiés • {unqualifiedCount} non qualifiés
            </p>
          </div>
          <Button onClick={handleExport} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Exporter CSV
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Statistiques */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="font-medium text-blue-900">Total traité</div>
              <div className="text-2xl font-bold text-blue-600">{results.totalProcessed}</div>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <div className="font-medium text-green-900">Correspondances</div>
              <div className="text-2xl font-bold text-green-600">{results.matchedCount}</div>
            </div>
            <div 
              className="bg-yellow-50 p-3 rounded-lg cursor-pointer hover:bg-yellow-100 transition-colors"
              onClick={() => setShowUnmatched(!showUnmatched)}
            >
              <div className="font-medium text-yellow-900">Sans correspondance</div>
              <div className="text-2xl font-bold text-yellow-600">{results.unmatchedCount}</div>
              <div className="text-xs text-yellow-600 mt-1">
                Cliquez pour {showUnmatched ? 'masquer' : 'afficher'} les détails
              </div>
            </div>
            <div 
              className="bg-purple-50 p-3 rounded-lg cursor-pointer hover:bg-purple-100 transition-colors"
              onClick={() => setShowDuplicates(!showDuplicates)}
            >
              <div className="font-medium text-purple-900">Doublons détectés</div>
              <div className="text-2xl font-bold text-purple-600">
                {results.duplicates.sheet + results.duplicates.hubspot}
              </div>
              <div className="text-xs text-purple-600 mt-1">
                Cliquez pour {showDuplicates ? 'masquer' : 'afficher'} les détails
              </div>
            </div>
          </div>

          {/* Détails des doublons */}
          {showDuplicates && (
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="font-medium text-purple-900 mb-3">Détails des doublons</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="font-medium text-purple-800 mb-2">Doublons Sheet ({results.duplicates.sheet})</div>
                  {results.duplicates.sheetEmails.length > 0 ? (
                    <div className="space-y-1">
                      {results.duplicates.sheetEmails.map((email, index) => (
                        <div key={index} className="text-purple-700 bg-purple-100 px-2 py-1 rounded text-xs">
                          {email}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-purple-700">Aucun doublon détecté</div>
                  )}
                </div>
                <div>
                  <div className="font-medium text-purple-800 mb-2">Doublons HubSpot ({results.duplicates.hubspot})</div>
                  {results.duplicates.hubspotEmails.length > 0 ? (
                    <div className="space-y-1">
                      {results.duplicates.hubspotEmails.map((email, index) => (
                        <div key={index} className="text-purple-700 bg-purple-100 px-2 py-1 rounded text-xs">
                          {email}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-purple-700">Aucun doublon détecté</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Détails des leads sans correspondances */}
          {showUnmatched && (
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h3 className="font-medium text-yellow-900 mb-3">Détails des leads sans correspondances</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="font-medium text-yellow-800 mb-2">Emails ({results.unmatchedDetails.emails.length})</div>
                  {results.unmatchedDetails.emails.length > 0 ? (
                    <div className="space-y-1">
                      {results.unmatchedDetails.emails.map((email, index) => (
                        <div key={index} className="text-yellow-700 bg-yellow-100 px-2 py-1 rounded text-xs">
                          {email}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-yellow-700">Aucun email disponible</div>
                  )}
                </div>
                <div>
                  <div className="font-medium text-yellow-800 mb-2">Noms ({results.unmatchedDetails.names.length})</div>
                  {results.unmatchedDetails.names.length > 0 ? (
                    <div className="space-y-1">
                      {results.unmatchedDetails.names.map((name, index) => (
                        <div key={index} className="text-yellow-700 bg-yellow-100 px-2 py-1 rounded text-xs">
                          {name}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-yellow-700">Aucun nom disponible</div>
                  )}
                </div>
                <div>
                  <div className="font-medium text-yellow-800 mb-2">Prénoms ({results.unmatchedDetails.prenoms.length})</div>
                  {results.unmatchedDetails.prenoms.length > 0 ? (
                    <div className="space-y-1">
                      {results.unmatchedDetails.prenoms.map((prenom, index) => (
                        <div key={index} className="text-yellow-700 bg-yellow-100 px-2 py-1 rounded text-xs">
                          {prenom}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-yellow-700">Aucun prénom disponible</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Filtre global */}
          <div className="flex items-center space-x-2">
            <Input
              placeholder="Rechercher dans tous les champs..."
              value={(table.getColumn("key")?.getFilterValue() as string) ?? ""}
              onChange={(event) =>
                table.getColumn("key")?.setFilterValue(event.target.value)
              }
              className="max-w-sm"
            />
          </div>

          {/* Tableau */}
          <div className="rounded-md border overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id} className="border-b bg-gray-50">
                    {headerGroup.headers.map((header) => (
                      <th key={header.id} className="px-3 py-2 text-left whitespace-nowrap text-xs font-medium">
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <tr key={row.id} className="border-b hover:bg-gray-50">
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="px-3 py-2 align-top text-xs">
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </td>
                      ))}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={columns.length} className="h-24 text-center text-gray-500">
                      Aucun résultat trouvé.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between space-x-2 py-4">
            <div className="flex items-center space-x-2">
              <p className="text-sm text-gray-700">
                Page {table.getState().pagination.pageIndex + 1} sur{' '}
                {table.getPageCount()}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <ChevronLeft className="h-4 w-4" />
                Précédent
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                Suivant
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
