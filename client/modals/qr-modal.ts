import { Div, Image, Paragraph } from '../components';

type QRItem = {
  ip: string;
  url: string;
  qr: string;
};

export default async (): Promise<HTMLDivElement> => {
  const container: HTMLDivElement = Div({
    className: 'modal-container',
  });
  const res = await fetch('/api/qr');
  if (!res.ok) return container;

  const items: QRItem[] = await res.json();

  if (!items.length) {
    return container;
  }

  const renderLocation = (location: QRItem): void => {
    const locationContainer: HTMLDivElement = Div({
      className: 'location',
    });
    const qr: HTMLImageElement = Image({
      src: location.qr,
      alt: location.url,
      width: 240,
    });
    const ip: HTMLParagraphElement = Paragraph({
      text: `${location.ip} — ${location.url}`,
    });
    locationContainer.append(qr, ip);
    container.appendChild(locationContainer);
  };

  items.forEach(renderLocation);
  return container;
};
