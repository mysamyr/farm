import os from 'node:os';

import express from 'express';
import qrcode from 'qrcode';

import config from '../../config';

const router = express.Router();

function getLocalIPv4Addresses(): string[] {
  const nets = os.networkInterfaces();
  const results: string[] = [];
  for (const name of Object.keys(nets)) {
    for (const net of nets[name] ?? []) {
      if (net.family === 'IPv4' && !net.internal) {
        results.push(net.address);
      }
    }
  }
  return results;
}

router.get('/api/qr', async (_req, res) => {
  try {
    const ips = getLocalIPv4Addresses();
    const items = await Promise.all(
      ips.map(async ip => {
        const url = `http://${ip}:${config.PORT}`;
        const qr = await qrcode.toDataURL(url, {
          type: 'image/png',
          margin: 2,
          width: 300,
        });
        return { ip, url, qr };
      })
    );
    res.json(items);
  } catch {
    res.status(500).json({ error: 'failed to generate qrcodes' });
  }
});

export default router;
