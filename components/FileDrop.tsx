'use client';

import React, { useCallback, useState } from 'react';
import { Upload, File, X } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';

interface FileDropProps {
  onFileSelect: (file: File) => void;
  onFileRemove: () => void;
  file: File | null;
  title: string;
  description: string;
  accept?: string;
  onError?: (message: string) => void;
}

export function FileDrop({ 
  onFileSelect, 
  onFileRemove, 
  file, 
  title, 
  description, 
  accept = ".csv",
  onError
}: FileDropProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 1) {
      onError?.('Veuillez déposer un seul fichier à la fois.');
      return;
    }
    if (files.length > 0) {
      onFileSelect(files[0]);
    }
  }, [onFileSelect]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 1) {
      onError?.('Veuillez sélectionner un seul fichier à la fois.');
      return;
    }
    if (files && files.length > 0) {
      onFileSelect(files[0]);
    }
  }, [onFileSelect]);

  if (file) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center justify-center space-x-3 flex-1">
              <File className="h-6 w-6 text-green-600" />
              <div className="text-center">
                <p className="font-medium text-green-800 text-sm">{file.name}</p>
                <p className="text-xs text-green-600">
                  {(file.size / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onFileRemove}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      className={`transition-colors ${
        isDragOver 
          ? 'border-blue-300 bg-blue-50' 
          : 'border-gray-200 hover:border-gray-300'
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <CardContent className="p-6 text-center">
        <Upload className="h-10 w-10 mx-auto text-gray-400 mb-3" />
        <h3 className="text-base font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-sm text-gray-600 mb-4">{description}</p>
        <div className="space-y-2">
          <input
            type="file"
            accept={accept}
            onChange={handleFileInput}
            className="hidden"
            id={`file-input-${title.toLowerCase().replace(/\s+/g, '-')}`}
            multiple={false}
          />
          <Button asChild size="sm">
            <label 
              htmlFor={`file-input-${title.toLowerCase().replace(/\s+/g, '-')}`}
              className="cursor-pointer"
            >
              Choisir un fichier
            </label>
          </Button>
          <p className="text-xs text-gray-500">
            ou glissez-déposez votre fichier ici
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
