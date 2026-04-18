import { useEffect } from 'react';
import type { ReactElement } from 'react';

import { useQuery } from '@tanstack/react-query';

import { useSnackbar } from '../../hooks/useSnackbar';
import type { QRItem } from '../../types/app';

import modalStyles from '../ui/Modal.module.css';

import styles from './QrModal.module.css';

function isQrItem(value: unknown): value is QRItem {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const item = value as Record<string, unknown>;
  return (
    typeof item.ip === 'string' &&
    typeof item.url === 'string' &&
    typeof item.qr === 'string'
  );
}

function parseQrItems(payload: unknown): QRItem[] {
  if (!Array.isArray(payload)) {
    throw new Error('Invalid QR response format');
  }

  if (!payload.every(isQrItem)) {
    throw new Error('Invalid QR item format');
  }

  return payload;
}

function QrModal(): ReactElement {
  const { showSnackbar } = useSnackbar();
  const {
    data: qrItems = [],
    isLoading,
    isError,
    error,
  } = useQuery<QRItem[], Error>({
    queryKey: ['qr-codes'],
    queryFn: async (): Promise<QRItem[]> => {
      const response = await fetch(`/api/qr?port=${window.location.port}`);
      if (!response.ok) {
        throw new Error('Failed to fetch QR codes');
      }

      const payload = (await response.json()) as unknown;
      return parseQrItems(payload);
    },
  });

  useEffect(() => {
    if (isError) {
      showSnackbar(error.message || 'Error loading QR codes');
    }
  }, [error, isError, showSnackbar]);

  if (isLoading) {
    return (
      <div className={modalStyles.container}>
        <p>Loading QR codes...</p>
      </div>
    );
  }

  return (
    <div className={modalStyles.container}>
      {!qrItems.length ? (
        <p>No QR codes available</p>
      ) : (
        qrItems.map(item => (
          <div className={styles.location} key={item.ip}>
            <img
              className={styles.img}
              src={item.qr}
              alt={item.url}
              width={240}
            />
            <p>
              {item.ip} - {item.url}
            </p>
          </div>
        ))
      )}
    </div>
  );
}

export default QrModal;
