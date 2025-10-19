/**
 * Tests for ConnectionStatus Component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConnectionStatus } from '../../components/ConnectionStatus';
import * as hybridStorage from '../../utils/hybridStorage';

// Mock the hybrid storage module
vi.mock('../../utils/hybridStorage', () => ({
  getConnectionStatus: vi.fn(),
}));

describe('ConnectionStatus', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should display "Cloud Sync" when connected to database', async () => {
    vi.mocked(hybridStorage.getConnectionStatus).mockResolvedValue({
      isConnected: true,
      isAuthenticated: true,
      usingDatabase: true,
      usingLocalStorage: true,
    });

    render(<ConnectionStatus />);

    await waitFor(() => {
      expect(screen.getByText('Cloud Sync')).toBeInTheDocument();
    });
  });

  it('should display "Local Only" when not connected to database', async () => {
    vi.mocked(hybridStorage.getConnectionStatus).mockResolvedValue({
      isConnected: false,
      isAuthenticated: false,
      usingDatabase: false,
      usingLocalStorage: true,
    });

    render(<ConnectionStatus />);

    await waitFor(() => {
      expect(screen.getByText('Local Only')).toBeInTheDocument();
    });
  });

  it('should expand details when clicked', async () => {
    const user = userEvent.setup();
    vi.mocked(hybridStorage.getConnectionStatus).mockResolvedValue({
      isConnected: true,
      isAuthenticated: true,
      usingDatabase: true,
      usingLocalStorage: true,
    });

    render(<ConnectionStatus />);

    await waitFor(() => {
      expect(screen.getByText('Cloud Sync')).toBeInTheDocument();
    });

    const button = screen.getByTitle('Storage mode: Cloud Sync');
    await user.click(button);

    await waitFor(() => {
      expect(screen.getByText('Connection Status')).toBeInTheDocument();
    });
  });

  it('should show detailed status for cloud sync', async () => {
    const user = userEvent.setup();
    vi.mocked(hybridStorage.getConnectionStatus).mockResolvedValue({
      isConnected: true,
      isAuthenticated: true,
      usingDatabase: true,
      usingLocalStorage: true,
    });

    render(<ConnectionStatus />);

    await waitFor(() => {
      expect(screen.getByText('Cloud Sync')).toBeInTheDocument();
    });

    const button = screen.getByTitle('Storage mode: Cloud Sync');
    await user.click(button);

    await waitFor(() => {
      expect(screen.getByText(/Data synced to cloud/)).toBeInTheDocument();
      expect(screen.getByText(/Available across devices/)).toBeInTheDocument();
      expect(screen.getByText(/Automatic backups enabled/)).toBeInTheDocument();
    });
  });

  it('should show detailed status for local only mode', async () => {
    const user = userEvent.setup();
    vi.mocked(hybridStorage.getConnectionStatus).mockResolvedValue({
      isConnected: true,
      isAuthenticated: false,
      usingDatabase: false,
      usingLocalStorage: true,
    });

    render(<ConnectionStatus />);

    await waitFor(() => {
      expect(screen.getByText('Local Only')).toBeInTheDocument();
    });

    const button = screen.getByTitle('Storage mode: Local Only');
    await user.click(button);

    await waitFor(() => {
      expect(screen.getByText(/Not signed in/)).toBeInTheDocument();
      expect(screen.getByText(/Data saved locally only/)).toBeInTheDocument();
      expect(screen.getByText(/Sign in to sync across devices/)).toBeInTheDocument();
    });
  });

  it('should apply custom className', async () => {
    vi.mocked(hybridStorage.getConnectionStatus).mockResolvedValue({
      isConnected: true,
      isAuthenticated: true,
      usingDatabase: true,
      usingLocalStorage: true,
    });

    const { container } = render(<ConnectionStatus className="test-class" />);

    await waitFor(() => {
      const element = container.querySelector('.test-class');
      expect(element).toBeInTheDocument();
    });
  });
});
