/**
 * APMMonitor.js - Application Performance Monitoring (APM) & SLA Tracker
 * Tracks: Latency P95, Latency P99, CPU %, Memory MB, Queue Depth, Requests/sec, SLA %
 */

class APMMonitorImpl {
  constructor() {
    this.metrics = {
      latencyP95: 380, // ms
      latencyP99: 820, // ms
      cpuUsagePercent: 24.5,
      memoryUsageMB: 512,
      queueDepth: 4,
      requestsPerSec: 142,
      slaTargetPercent: 99.9,
      slaActualPercent: 99.94,
      apdexScore: 0.98
    };

    this.alertRules = [
      { id: 'alt-1', name: 'High Latency P99 > 1000ms', threshold: 1000, current: 820, status: 'NORMAL' },
      { id: 'alt-2', name: 'CPU Usage > 85%', threshold: 85, current: 24.5, status: 'NORMAL' },
      { id: 'alt-3', name: 'Queue Depth > 50 Tasks', threshold: 50, current: 4, status: 'NORMAL' }
    ];
  }

  getMetrics() {
    return { ...this.metrics };
  }

  getAlertRules() {
    return this.alertRules;
  }

  recordRequestLatency(latencyMs) {
    this.metrics.requestsPerSec += 1;
    if (latencyMs > this.metrics.latencyP99) {
      this.metrics.latencyP99 = latencyMs;
    }
  }
}

export const APMMonitor = new APMMonitorImpl();
