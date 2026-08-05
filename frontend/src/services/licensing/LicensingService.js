/**
 * LicensingService.js - Software Licensing, Activation & Device Binding Subsystem
 * Features: Key Activation, Expiration, Device Binding & Hardware Hash Verification
 */

class LicensingServiceImpl {
  constructor() {
    this.licenses = new Map([
      ['WIN11-PRO-KEY-88120-X', { key: 'WIN11-PRO-KEY-88120-X', maxDevices: 1, boundDevices: [], status: 'ACTIVE', expiresAt: '2099-12-31' }]
    ]);
  }

  activateKey(licenseKey, hardwareHash) {
    const lic = this.licenses.get(licenseKey);
    if (!lic) return { success: false, error: 'INVALID_LICENSE_KEY' };
    if (lic.boundDevices.length >= lic.maxDevices && !lic.boundDevices.includes(hardwareHash)) {
      return { success: false, error: 'MAX_DEVICE_LIMIT_REACHED' };
    }

    if (!lic.boundDevices.includes(hardwareHash)) {
      lic.boundDevices.push(hardwareHash);
    }

    return {
      success: true,
      licenseKey,
      hardwareHash,
      activatedAt: new Date().toISOString(),
      expiresAt: lic.expiresAt
    };
  }
}

export const LicensingService = new LicensingServiceImpl();
