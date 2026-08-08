import express from 'express';

const router = express.Router();

const CURRENCY_MAP = {
  SA: 'SAR',
  YE: 'USD',
  AE: 'AED',
  EG: 'EGP',
  KW: 'KWD',
  QA: 'QAR',
  BH: 'BHD',
  OM: 'OMR',
  JO: 'JOD',
  IQ: 'IQD',
  US: 'USD',
  GB: 'EUR',
  DE: 'EUR',
  FR: 'EUR'
};

/**
 * GET /api/v1/geoip
 * Auto-detects client country & currency from IP address
 */
router.get('/geoip', async (req, res) => {
  try {
    // 1. Check Cloudflare / Reverse Proxy IP Country Headers
    const cfCountry = req.headers['cf-ipcountry'];
    if (cfCountry && cfCountry.length === 2 && cfCountry !== 'XX') {
      const countryCode = cfCountry.toUpperCase();
      return res.json({
        success: true,
        countryCode,
        currency: CURRENCY_MAP[countryCode] || 'USD',
        source: 'CLOUDFLARE_HEADER'
      });
    }

    // 2. Extract Client IP Address
    const rawIp = req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
                  req.socket.remoteAddress ||
                  req.ip;

    const cleanIp = rawIp ? rawIp.replace(/^.*:/, '') : '';

    // If local/private IP, return default SA
    if (!cleanIp || cleanIp === '127.0.0.1' || cleanIp === 'localhost' || cleanIp.startsWith('192.168.') || cleanIp.startsWith('10.')) {
      return res.json({
        success: true,
        countryCode: 'SA',
        currency: 'SAR',
        source: 'LOCAL_DEFAULT'
      });
    }

    // 3. Query GeoIP Provider with 1.5s timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1500);

    const geoRes = await fetch(`http://ip-api.com/json/${cleanIp}?fields=status,countryCode,currency`, {
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (geoRes.ok) {
      const geoData = await geoRes.json();
      if (geoData && geoData.status === 'success' && geoData.countryCode) {
        const countryCode = geoData.countryCode.toUpperCase();
        return res.json({
          success: true,
          countryCode,
          currency: geoData.currency || CURRENCY_MAP[countryCode] || 'USD',
          source: 'IP_GEO_SERVICE'
        });
      }
    }

    res.json({
      success: true,
      countryCode: 'SA',
      currency: 'SAR',
      source: 'FALLBACK_DEFAULT'
    });

  } catch (err) {
    res.json({
      success: true,
      countryCode: 'SA',
      currency: 'SAR',
      source: 'FALLBACK_ERROR',
      error: err.message
    });
  }
});

export default router;
