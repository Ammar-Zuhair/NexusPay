/**
 * OperationalRunbookService.js - Operational Runbook & Emergency Incident Playbooks
 * Document 7 Emergency Response Playbooks for Operations & Engineering teams.
 */

export const OPERATIONAL_RUNBOOKS = [
  {
    id: 'rbk-1',
    title: 'Runbook 1: Provider API Outage & Failover Procedure',
    trigger: 'Provider Circuit Breaker trips to OPEN or Failure Rate > 15%',
    actions: [
      '1. SmartRoutingEngine automatically short-circuits broken provider for 30s.',
      '2. Traffic reroutes to candidate Provider B (UniPin / GlobalCodes).',
      '3. Ops Team receives Telegram/Discord alert with Correlation IDs.',
      '4. If outage persists > 15m, Ops toggles Provider Maintenance Mode in Admin Console.'
    ]
  },
  {
    id: 'rbk-2',
    title: 'Runbook 2: Redis Cache Layer Crash Recovery',
    trigger: 'Redis Connection Error 6379 / Cache Service Unavailable',
    actions: [
      '1. API Gateway falls back to PostgreSQL read queries directly (Graceful degradation).',
      '2. Kubernetes liveness probe restarts Redis container instance.',
      '3. Cache invalidation worker warms core catalog datasets upon restart.'
    ]
  },
  {
    id: 'rbk-3',
    title: 'Runbook 3: PostgreSQL Read Replica Failure',
    trigger: 'Postgres Replica Unreachable / DB Replication Lag > 60s',
    actions: [
      '1. Database Connection Pool redirects read traffic to Master Node.',
      '2. Ops inspects replication WAL log lag on Slave Node.',
      '3. Execute pg_basebackup sync command to restore replica synchronization.'
    ]
  },
  {
    id: 'rbk-4',
    title: 'Runbook 4: Dead Letter Queue (DLQ) Backlog Overflow',
    trigger: 'DLQ Size > 25 pending incident items',
    actions: [
      '1. Support Agent opens Admin DLQ Console (/admin -> Debug DLQ Tab).',
      '2. Filter by Correlation ID to identify root cause (Provider Timeout vs Payment Mismatch).',
      '3. Click "Reprocess & Refund Wallet" to issue automated customer refunds.',
      '4. Mark DLQ incident as RESOLVED.'
    ]
  },
  {
    id: 'rbk-5',
    title: 'Runbook 5: Backup Job Failure & PITR Recovery Procedure',
    trigger: 'Daily S3 Backup Job returns non-zero exit code',
    actions: [
      '1. Trigger manual snapshot execution via BackupManager.',
      '2. Verify Write-Ahead Log (WAL) archive integrity on S3 storage.',
      '3. Execute PITR validation test on isolated staging environment.'
    ]
  },
  {
    id: 'rbk-6',
    title: 'Runbook 6: Anti-Fraud Risk Score Spike Emergency',
    trigger: 'FraudEngine flags > 10 High-Risk transactions within 5 minutes',
    actions: [
      '1. FraudEngine automatically sets Order FSM to MANUAL_REVIEW.',
      '2. Temporarily enforce 2FA verification for high-risk IP ranges.',
      '3. Security team reviews device fingerprints & velocity logs.'
    ]
  },
  {
    id: 'rbk-7',
    title: 'Runbook 7: API Key Emergency Rotation Protocol',
    trigger: 'API Key leak suspicion or quarterly security rotation schedule',
    actions: [
      '1. Open SecretsManager in Vault Admin.',
      '2. Click "Rotate Secret Key" -> Generates new encrypted keypair.',
      '3. Update supplier API credentials without restarting API application nodes.'
    ]
  }
];

class OperationalRunbookServiceImpl {
  getRunbooks() {
    return OPERATIONAL_RUNBOOKS;
  }
}

export const OperationalRunbookService = new OperationalRunbookServiceImpl();
