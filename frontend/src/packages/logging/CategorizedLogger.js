/**
 * CategorizedLogger.js - Multi-Store Partitioned Logging Engine
 * Partitioned Stores: Audit, API, Security, Payment, Order, Worker, Notification, Provider
 */

class CategorizedLoggerService {
  constructor() {
    this.stores = {
      AUDIT: [],
      API: [],
      SECURITY: [],
      PAYMENT: [],
      ORDER: [],
      WORKER: [],
      NOTIFICATION: [],
      PROVIDER: []
    };
    this.maxLogsPerStore = 100;
  }

  log(channel, payload) {
    const uppercaseChannel = channel.toUpperCase();
    if (!this.stores[uppercaseChannel]) {
      this.stores[uppercaseChannel] = [];
    }

    const logEntry = {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      channel: uppercaseChannel,
      correlationId: payload.correlationId || payload.cid || 'CID-SYS',
      timestamp: new Date().toISOString(),
      ...payload
    };

    this.stores[uppercaseChannel].unshift(logEntry);
    if (this.stores[uppercaseChannel].length > this.maxLogsPerStore) {
      this.stores[uppercaseChannel].pop();
    }

    return logEntry;
  }

  getLogs(channel = 'ALL', correlationId = null) {
    let result = [];
    if (channel === 'ALL') {
      Object.keys(this.stores).forEach(ch => {
        result = result.concat(this.stores[ch]);
      });
    } else if (this.stores[channel.toUpperCase()]) {
      result = [...this.stores[channel.toUpperCase()]];
    }

    if (correlationId) {
      result = result.filter(l => l.correlationId === correlationId);
    }

    return result.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }

  getLogCounts() {
    const counts = {};
    Object.keys(this.stores).forEach(ch => {
      counts[ch] = this.stores[ch].length;
    });
    return counts;
  }
}

export const CategorizedLogger = new CategorizedLoggerService();
