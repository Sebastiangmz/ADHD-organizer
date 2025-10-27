import React, { useEffect, useState } from 'react';
import { storageService } from '../services/storageService';

interface StorageInfo {
  used: number;
  limit: number;
  percentage: number;
  taskCount: number;
}

interface StorageIndicatorProps {
  showDetails?: boolean;
}

const StorageIndicator: React.FC<StorageIndicatorProps> = ({ showDetails = false }) => {
  const [storageInfo, setStorageInfo] = useState<StorageInfo | null>(null);

  useEffect(() => {
    // Update storage info whenever component mounts
    const info = storageService.getStorageInfo();
    setStorageInfo(info);

    // Optional: Update periodically (every 2 seconds) if storage might change externally
    const interval = setInterval(() => {
      const updated = storageService.getStorageInfo();
      setStorageInfo(updated);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  if (!storageInfo) {
    return null;
  }

  const getStatusColor = (percentage: number): string => {
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 80) return 'text-yellow-600';
    if (percentage >= 60) return 'text-orange-600';
    return 'text-green-600';
  };

  const getProgressColor = (percentage: number): string => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 80) return 'bg-yellow-500';
    if (percentage >= 60) return 'bg-orange-500';
    return 'bg-green-500';
  };

  const getBgColor = (percentage: number): string => {
    if (percentage >= 90) return 'bg-red-100';
    if (percentage >= 80) return 'bg-yellow-100';
    if (percentage >= 60) return 'bg-orange-100';
    return 'bg-green-100';
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (bytes / Math.pow(k, i)).toFixed(1) + ' ' + sizes[i];
  };

  const shouldShowWarning = storageInfo.percentage >= 80;

  return (
    <div className={`rounded-lg p-4 border ${getBgColor(storageInfo.percentage)}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <span className={`text-sm font-semibold ${getStatusColor(storageInfo.percentage)}`}>
          📦 Almacenamiento
        </span>
        <span className={`text-xs font-medium ${getStatusColor(storageInfo.percentage)}`}>
          {storageInfo.percentage.toFixed(1)}%
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-300 rounded-full h-2 overflow-hidden mb-2">
        <div
          className={`h-full ${getProgressColor(storageInfo.percentage)} transition-all duration-300`}
          style={{ width: `${Math.min(storageInfo.percentage, 100)}%` }}
        />
      </div>

      {/* Details */}
      {showDetails && (
        <div className="text-xs text-gray-600 mt-2">
          <p>{formatBytes(storageInfo.used)} de {formatBytes(storageInfo.limit)}</p>
          <p>{storageInfo.taskCount} tarea{storageInfo.taskCount !== 1 ? 's' : ''} guardada{storageInfo.taskCount !== 1 ? 's' : ''}</p>
        </div>
      )}

      {/* Warning Messages */}
      {shouldShowWarning && (
        <div className={`mt-2 text-xs font-medium ${getStatusColor(storageInfo.percentage)}`}>
          {storageInfo.percentage >= 90 ? (
            <p>⚠️ Almacenamiento casi lleno. Considera eliminar algunas tareas.</p>
          ) : (
            <p>⚠️ Almacenamiento al {storageInfo.percentage.toFixed(0)}%. Espacio bajo disponible.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default StorageIndicator;
