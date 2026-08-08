/**
 * OrderStateMachine.js - Backend 16-State Finite State Machine (FSM)
 * Validates transitions & emits state change log entries on Node.js Server.
 */

export const ORDER_STATES = {
  CREATED: 'CREATED',
  VALIDATING_REQUEST: 'VALIDATING_REQUEST',
  PAYMENT_PENDING: 'PAYMENT_PENDING',
  PAYMENT_CONFIRMED: 'PAYMENT_CONFIRMED',
  PENDING: 'PENDING',
  WAITING_PROVIDER: 'WAITING_PROVIDER',
  PROCESSING: 'PROCESSING',
  WAITING_CALLBACK: 'WAITING_CALLBACK',
  DELIVERED: 'DELIVERED',
  COMPLETED: 'COMPLETED',
  PARTIALLY_DELIVERED: 'PARTIALLY_DELIVERED',
  MANUAL_REVIEW: 'MANUAL_REVIEW',
  EXPIRED: 'EXPIRED',
  RETRYING: 'RETRYING',
  ROLLBACK: 'ROLLBACK',
  REFUNDED: 'REFUNDED',
  CANCELLED: 'CANCELLED',
  FAILED: 'FAILED',
  REJECTED: 'REJECTED'
};

const VALID_TRANSITIONS = {
  CREATED: ['VALIDATING_REQUEST', 'PENDING', 'CANCELLED', 'FAILED'],
  VALIDATING_REQUEST: ['PAYMENT_PENDING', 'PENDING', 'MANUAL_REVIEW', 'FAILED'],
  PAYMENT_PENDING: ['PAYMENT_CONFIRMED', 'PENDING', 'EXPIRED', 'CANCELLED', 'FAILED'],
  PAYMENT_CONFIRMED: ['PENDING', 'WAITING_PROVIDER', 'MANUAL_REVIEW', 'REFUNDED'],
  PENDING: ['COMPLETED', 'DELIVERED', 'REJECTED', 'CANCELLED', 'MANUAL_REVIEW'],
  WAITING_PROVIDER: ['PROCESSING', 'MANUAL_REVIEW', 'FAILED'],
  PROCESSING: ['WAITING_CALLBACK', 'DELIVERED', 'COMPLETED', 'PARTIALLY_DELIVERED', 'RETRYING', 'FAILED'],
  WAITING_CALLBACK: ['DELIVERED', 'COMPLETED', 'PARTIALLY_DELIVERED', 'RETRYING', 'MANUAL_REVIEW'],
  DELIVERED: [], // Terminal State
  COMPLETED: [], // Terminal State
  PARTIALLY_DELIVERED: ['RETRYING', 'MANUAL_REVIEW', 'REFUNDED'],
  MANUAL_REVIEW: ['PROCESSING', 'COMPLETED', 'REFUNDED', 'CANCELLED'],
  EXPIRED: [],
  RETRYING: ['PROCESSING', 'WAITING_CALLBACK', 'ROLLBACK', 'SENT_TO_DLQ'],
  ROLLBACK: ['REFUNDED', 'FAILED'],
  REFUNDED: [],
  CANCELLED: [],
  FAILED: ['RETRYING', 'MANUAL_REVIEW'],
  REJECTED: []
};

class OrderStateMachineImpl {
  transition(order, nextState, note = '', correlationId = null) {
    const currentState = order.status;
    const cid = correlationId || order.correlationId || 'CID-FSM';

    const allowed = VALID_TRANSITIONS[currentState] || [];
    if (!allowed.includes(nextState)) {
      const errMsg = `[BACKEND FSM GUARD] Invalid State Transition: Cannot move order ${order.id} from ${currentState} to ${nextState}`;
      console.error(errMsg);
      throw new Error(errMsg);
    }

    const previousState = order.status;
    order.status = nextState;
    order.updatedAt = new Date().toISOString();

    console.log(`[BACKEND FSM SUCCESS] Order ${order.id}: ${previousState} -> ${nextState} (CID: ${cid}, Note: ${note})`);
    return order;
  }
}

export const OrderStateMachine = new OrderStateMachineImpl();
