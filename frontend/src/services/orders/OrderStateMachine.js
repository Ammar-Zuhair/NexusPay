/**
 * OrderStateMachine.js - Extended 16-State Finite State Machine (FSM)
 * Validates transitions & emits state change log entries.
 */

import { EventBus, DOMAIN_EVENTS } from '../../packages/events/EventBus';
import { CategorizedLogger } from '../../packages/logging/CategorizedLogger';

export const ORDER_STATES = {
  CREATED: 'CREATED',
  VALIDATING_REQUEST: 'VALIDATING_REQUEST',
  PAYMENT_PENDING: 'PAYMENT_PENDING',
  PAYMENT_CONFIRMED: 'PAYMENT_CONFIRMED',
  WAITING_PROVIDER: 'WAITING_PROVIDER',
  PROCESSING: 'PROCESSING',
  WAITING_CALLBACK: 'WAITING_CALLBACK',
  DELIVERED: 'DELIVERED',
  PARTIALLY_DELIVERED: 'PARTIALLY_DELIVERED',
  MANUAL_REVIEW: 'MANUAL_REVIEW',
  EXPIRED: 'EXPIRED',
  RETRYING: 'RETRYING',
  ROLLBACK: 'ROLLBACK',
  REFUNDED: 'REFUNDED',
  CANCELLED: 'CANCELLED',
  FAILED: 'FAILED'
};

const VALID_TRANSITIONS = {
  CREATED: ['VALIDATING_REQUEST', 'CANCELLED', 'FAILED'],
  VALIDATING_REQUEST: ['PAYMENT_PENDING', 'MANUAL_REVIEW', 'FAILED'],
  PAYMENT_PENDING: ['PAYMENT_CONFIRMED', 'EXPIRED', 'CANCELLED', 'FAILED'],
  PAYMENT_CONFIRMED: ['WAITING_PROVIDER', 'MANUAL_REVIEW', 'REFUNDED'],
  WAITING_PROVIDER: ['PROCESSING', 'MANUAL_REVIEW', 'FAILED'],
  PROCESSING: ['WAITING_CALLBACK', 'DELIVERED', 'PARTIALLY_DELIVERED', 'RETRYING', 'FAILED'],
  WAITING_CALLBACK: ['DELIVERED', 'PARTIALLY_DELIVERED', 'RETRYING', 'MANUAL_REVIEW'],
  DELIVERED: [], // Terminal State
  PARTIALLY_DELIVERED: ['RETRYING', 'MANUAL_REVIEW', 'REFUNDED'],
  MANUAL_REVIEW: ['PROCESSING', 'REFUNDED', 'CANCELLED'],
  EXPIRED: [],
  RETRYING: ['PROCESSING', 'WAITING_CALLBACK', 'ROLLBACK', 'SENT_TO_DLQ'],
  ROLLBACK: ['REFUNDED', 'FAILED'],
  REFUNDED: [],
  CANCELLED: [],
  FAILED: ['RETRYING', 'MANUAL_REVIEW']
};

class OrderStateMachineImpl {
  transition(order, nextState, note = '', correlationId = null) {
    const currentState = order.status;
    const cid = correlationId || order.correlationId || 'CID-FSM';

    const allowed = VALID_TRANSITIONS[currentState] || [];
    if (!allowed.includes(nextState)) {
      const errMsg = `Invalid State Transition: Cannot move order ${order.id} from ${currentState} to ${nextState}`;
      CategorizedLogger.log('ORDER', {
        correlationId: cid,
        orderId: order.id,
        error: errMsg,
        status: 'TRANSITION_ERROR'
      });
      throw new Error(errMsg);
    }

    const previousState = order.status;
    order.status = nextState;
    order.updatedAt = new Date().toISOString();

    // Log Immutable State Transition
    CategorizedLogger.log('ORDER', {
      correlationId: cid,
      orderId: order.id,
      fromState: previousState,
      toState: nextState,
      note,
      timestamp: order.updatedAt
    });

    // Publish Domain Event
    EventBus.publish(`OrderState_${nextState}`, {
      orderId: order.id,
      fromState: previousState,
      toState: nextState,
      note
    }, cid);

    return order;
  }
}

export const OrderStateMachine = new OrderStateMachineImpl();
