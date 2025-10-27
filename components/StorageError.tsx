import React from 'react';
import { storageService } from '../services/storageService';

interface StorageErrorProps {
  message: string;
  onClear?: () => void;
}

const StorageError: React.FC<StorageErrorProps> = ({ message, onClear }) => {
  const handleClearData = () => {
    if (confirm('¿Estás seguro de que quieres limpiar todos los datos? Esta acción no se puede deshacer.')) {
      storageService.clearAll();
      if (onClear) {
        onClear();
      }
      window.location.reload();
    }
  };

  return (
    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md mb-4" role="alert">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <p className="font-bold">Error de Almacenamiento</p>
          <p className="mt-1">{message}</p>
          <button
            onClick={handleClearData}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Limpiar Datos
          </button>
        </div>
      </div>
    </div>
  );
};

export default StorageError;
