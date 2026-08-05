/**
 * ObjectStorageCDN.js - AWS S3 Object Storage & CDN Asset Delivery Emulation
 */

class ObjectStorageCDNImpl {
  constructor() {
    this.cdnDomain = 'https://cdn.coinwestie.com';
  }

  getAssetUrl(path) {
    return `${this.cdnDomain}/${path}`;
  }

  uploadInvoice(orderId, pdfBuffer) {
    return {
      bucket: 'coinwestie-invoices-private',
      key: `invoices/2026/08/${orderId}.pdf`,
      cdnUrl: `${this.cdnDomain}/invoices/${orderId}.pdf`
    };
  }
}

export const ObjectStorageCDN = new ObjectStorageCDNImpl();
