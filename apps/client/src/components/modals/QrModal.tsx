import { useEffect, useState } from 'react';
import type { ReactElement } from 'react';

import { useSnackbar } from '../../hooks/useSnackbar';
import type { QRItem } from '../../types/app';

function QrModal(): ReactElement {
  const [qrItems, setQrItems] = useState<QRItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { showSnackbar } = useSnackbar();

  useEffect(() => {
    const fetchQrCodes = async (): Promise<void> => {
      try {
        const response = await fetch('/api/qr');
        if (!response.ok) {
          setQrItems([]);
          showSnackbar('Failed to fetch QR codes');
          return;
        }
        const items = (await response.json()) as QRItem[];
        setQrItems(items);
      } catch {
        setQrItems([]);
        showSnackbar('Error loading QR codes');
      } finally {
        setIsLoading(false);
      }
    };

    void fetchQrCodes();
  }, [showSnackbar]);

  if (isLoading) {
    return (
      <div className="modal-container">
        <p>Loading QR codes...</p>
      </div>
    );
  }

  return (
    <div className="modal-container">
      {!qrItems.length ? (
        <p>No QR codes available</p>
      ) : (
        qrItems.map(item => (
          <div className="location" key={item.ip}>
            <img src={item.qr} alt={item.url} width={240} />
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
