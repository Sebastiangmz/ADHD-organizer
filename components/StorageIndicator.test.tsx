import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import StorageIndicator from './StorageIndicator';
import * as storageService from '../services/storageService';

// Mock the storage service
vi.mock('../services/storageService', () => ({
  storageService: {
    getStorageInfo: vi.fn()
  }
}));

describe('StorageIndicator Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render storage indicator', () => {
      (storageService.storageService.getStorageInfo as any).mockReturnValue({
        used: 51200,
        limit: 5242880,
        percentage: 0.976,
        taskCount: 5
      });

      render(<StorageIndicator />);

      expect(screen.getByText(/Almacenamiento/)).toBeTruthy();
    });

    it('should display percentage', () => {
      (storageService.storageService.getStorageInfo as any).mockReturnValue({
        used: 2621440,
        limit: 5242880,
        percentage: 50,
        taskCount: 10
      });

      render(<StorageIndicator />);

      expect(screen.getByText(/50.0%/)).toBeTruthy();
    });

    it('should format bytes correctly', () => {
      (storageService.storageService.getStorageInfo as any).mockReturnValue({
        used: 51200,
        limit: 5242880,
        percentage: 0.976,
        taskCount: 5
      });

      render(<StorageIndicator showDetails={true} />);

      expect(screen.getByText(/50.0 KB de 5.0 MB/)).toBeTruthy();
    });

    it('should display task count', () => {
      (storageService.storageService.getStorageInfo as any).mockReturnValue({
        used: 102400,
        limit: 5242880,
        percentage: 1.953,
        taskCount: 7
      });

      render(<StorageIndicator showDetails={true} />);

      expect(screen.getByText(/7 tareas guardadas/)).toBeTruthy();
    });

    it('should show singular form for 1 task', () => {
      (storageService.storageService.getStorageInfo as any).mockReturnValue({
        used: 51200,
        limit: 5242880,
        percentage: 0.976,
        taskCount: 1
      });

      render(<StorageIndicator showDetails={true} />);

      expect(screen.getByText(/1 tarea guardada/)).toBeTruthy();
    });
  });

  describe('Color Coding', () => {
    it('should show green for low usage (< 60%)', () => {
      (storageService.storageService.getStorageInfo as any).mockReturnValue({
        used: 1048576,
        limit: 5242880,
        percentage: 20,
        taskCount: 5
      });

      const { container } = render(<StorageIndicator />);

      const progressBar = container.querySelector('.bg-green-500');
      expect(progressBar).toBeTruthy();
    });

    it('should show orange for medium usage (60-79%)', () => {
      (storageService.storageService.getStorageInfo as any).mockReturnValue({
        used: 3670016,
        limit: 5242880,
        percentage: 70,
        taskCount: 10
      });

      const { container } = render(<StorageIndicator />);

      const progressBar = container.querySelector('.bg-orange-500');
      expect(progressBar).toBeTruthy();
    });

    it('should show yellow for high usage (80-89%)', () => {
      (storageService.storageService.getStorageInfo as any).mockReturnValue({
        used: 4194304,
        limit: 5242880,
        percentage: 80,
        taskCount: 20
      });

      const { container } = render(<StorageIndicator />);

      const progressBar = container.querySelector('.bg-yellow-500');
      expect(progressBar).toBeTruthy();
    });

    it('should show red for critical usage (>= 90%)', () => {
      (storageService.storageService.getStorageInfo as any).mockReturnValue({
        used: 4718592,
        limit: 5242880,
        percentage: 90,
        taskCount: 50
      });

      const { container } = render(<StorageIndicator />);

      const progressBar = container.querySelector('.bg-red-500');
      expect(progressBar).toBeTruthy();
    });
  });

  describe('Warning Messages', () => {
    it('should not show warning for low usage', () => {
      (storageService.storageService.getStorageInfo as any).mockReturnValue({
        used: 1048576,
        limit: 5242880,
        percentage: 20,
        taskCount: 5
      });

      render(<StorageIndicator />);

      expect(screen.queryByText(/Almacenamiento al/)).not.toBeTruthy();
      expect(screen.queryByText(/Almacenamiento casi lleno/)).not.toBeTruthy();
    });

    it('should show warning at 80% usage', () => {
      (storageService.storageService.getStorageInfo as any).mockReturnValue({
        used: 4194304,
        limit: 5242880,
        percentage: 80,
        taskCount: 20
      });

      render(<StorageIndicator />);

      expect(screen.getByText(/Almacenamiento al 80%/)).toBeTruthy();
    });

    it('should show critical warning at 90% usage', () => {
      (storageService.storageService.getStorageInfo as any).mockReturnValue({
        used: 4718592,
        limit: 5242880,
        percentage: 90,
        taskCount: 50
      });

      render(<StorageIndicator />);

      expect(screen.getByText(/Almacenamiento casi lleno/)).toBeTruthy();
    });

    it('should not show details when showDetails is false', () => {
      (storageService.storageService.getStorageInfo as any).mockReturnValue({
        used: 51200,
        limit: 5242880,
        percentage: 0.976,
        taskCount: 5
      });

      render(<StorageIndicator showDetails={false} />);

      expect(screen.queryByText(/50.0 KB/)).not.toBeTruthy();
    });

    it('should show details when showDetails is true', () => {
      (storageService.storageService.getStorageInfo as any).mockReturnValue({
        used: 51200,
        limit: 5242880,
        percentage: 0.976,
        taskCount: 5
      });

      render(<StorageIndicator showDetails={true} />);

      expect(screen.getByText(/50.0 KB de 5.0 MB/)).toBeTruthy();
    });
  });

  describe('Bytes Formatting', () => {
    it('should format bytes (B)', () => {
      (storageService.storageService.getStorageInfo as any).mockReturnValue({
        used: 512,
        limit: 1024,
        percentage: 50,
        taskCount: 1
      });

      render(<StorageIndicator showDetails={true} />);

      expect(screen.getByText(/512.0 B de 1.0 KB/)).toBeTruthy();
    });

    it('should format kilobytes (KB)', () => {
      (storageService.storageService.getStorageInfo as any).mockReturnValue({
        used: 51200,
        limit: 102400,
        percentage: 50,
        taskCount: 2
      });

      render(<StorageIndicator showDetails={true} />);

      expect(screen.getByText(/50.0 KB de 100.0 KB/)).toBeTruthy();
    });

    it('should format megabytes (MB)', () => {
      (storageService.storageService.getStorageInfo as any).mockReturnValue({
        used: 5242880,
        limit: 10485760,
        percentage: 50,
        taskCount: 50
      });

      render(<StorageIndicator showDetails={true} />);

      expect(screen.getByText(/5.0 MB de 10.0 MB/)).toBeTruthy();
    });
  });

  describe('Progress Bar Animation', () => {
    it('should render progress bar with correct width', () => {
      (storageService.storageService.getStorageInfo as any).mockReturnValue({
        used: 2621440,
        limit: 5242880,
        percentage: 50,
        taskCount: 10
      });

      const { container } = render(<StorageIndicator />);

      const progressBar = container.querySelector('div[style*="width"]');
      expect(progressBar).toBeTruthy();
      expect(progressBar?.getAttribute('style')).toContain('50%');
    });

    it('should cap progress bar at 100%', () => {
      (storageService.storageService.getStorageInfo as any).mockReturnValue({
        used: 5242880,
        limit: 5242880,
        percentage: 100,
        taskCount: 100
      });

      const { container } = render(<StorageIndicator />);

      const progressBar = container.querySelector('div[style*="width"]');
      expect(progressBar?.getAttribute('style')).toContain('100%');
    });
  });

  describe('Background Colors', () => {
    it('should have green background for low usage', () => {
      (storageService.storageService.getStorageInfo as any).mockReturnValue({
        used: 1048576,
        limit: 5242880,
        percentage: 20,
        taskCount: 5
      });

      const { container } = render(<StorageIndicator />);

      const wrapper = container.querySelector('.bg-green-100');
      expect(wrapper).toBeTruthy();
    });

    it('should have red background for critical usage', () => {
      (storageService.storageService.getStorageInfo as any).mockReturnValue({
        used: 4718592,
        limit: 5242880,
        percentage: 90,
        taskCount: 50
      });

      const { container } = render(<StorageIndicator />);

      const wrapper = container.querySelector('.bg-red-100');
      expect(wrapper).toBeTruthy();
    });
  });
});
