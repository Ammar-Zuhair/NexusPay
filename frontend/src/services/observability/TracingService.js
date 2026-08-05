/**
 * TracingService.js - Correlation ID & OpenTelemetry Trace Inspector
 * Maps complete request trajectory across Payment, Wallet, FSM, Provider API, and Notifications.
 */

import { EventBus } from '../../packages/events/EventBus';
import { CategorizedLogger } from '../../packages/logging/CategorizedLogger';

class TracingServiceImpl {
  getTraceTimeline(correlationId) {
    if (!correlationId) return [];

    const events = EventBus.getHistory(correlationId);
    const logs = CategorizedLogger.getLogs('ALL', correlationId);

    const combinedTimeline = [];

    events.forEach(evt => {
      combinedTimeline.push({
        type: 'EVENT',
        title: `Event: ${evt.eventType}`,
        timestamp: evt.timestamp,
        details: evt.payload,
        source: 'EventBus'
      });
    });

    logs.forEach(l => {
      combinedTimeline.push({
        type: 'LOG',
        title: `Log [${l.channel}]: ${l.action || l.fromState ? `${l.fromState} -> ${l.toState}` : l.message || 'System Action'}`,
        timestamp: l.timestamp,
        details: l,
        source: l.channel
      });
    });

    return combinedTimeline.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  }
}

export const TracingService = new TracingServiceImpl();
