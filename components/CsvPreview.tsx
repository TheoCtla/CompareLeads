'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { CsvData } from '@/lib/types';

interface CsvPreviewProps {
  data: CsvData;
  title: string;
}

export function CsvPreview({ data, title }: CsvPreviewProps) {
  const { headers, rows } = data;
  const previewRows = rows.slice(0, 10);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        <p className="text-sm text-gray-600">
          {rows.length} lignes • {headers.length} colonnes
        </p>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                {headers.map((header, index) => (
                  <th 
                    key={index}
                    className="text-left p-2 font-medium text-gray-700 bg-gray-50"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {previewRows.map((row, rowIndex) => (
                <tr key={rowIndex} className="border-b hover:bg-gray-50">
                  {headers.map((header, colIndex) => (
                    <td key={colIndex} className="p-2 text-gray-600">
                      {row[header] || '-'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length > 10 && (
            <p className="text-sm text-gray-500 mt-2 text-center">
              ... et {rows.length - 10} autres lignes
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
