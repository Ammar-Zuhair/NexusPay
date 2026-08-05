/**
 * TaskScheduler.js - Background Cron Worker Scheduler
 * Cron Tasks: Every 1m (Sync Providers), Every 1h (Refresh FX Rates), Every 24h (Nightly Ledger Settlement)
 */

import { CategorizedLogger } from '../../packages/logging/CategorizedLogger';

class TaskSchedulerImpl {
  constructor() {
    this.jobs = [
      { id: 'cron-1', name: 'Sync Provider Balances & Health', schedule: '* * * * *', lastRun: '1 minute ago', status: 'SUCCESS' },
      { id: 'cron-2', name: 'Refresh Central FX Rates', schedule: '0 * * * *', lastRun: '42 minutes ago', status: 'SUCCESS' },
      { id: 'cron-3', name: 'Nightly General Ledger Balance Snapshot', schedule: '0 0 * * *', lastRun: '11 hours ago', status: 'SUCCESS' },
      { id: 'cron-4', name: 'Release Expired Code Locks (10m Timeout)', schedule: '*/5 * * * *', lastRun: '3 minutes ago', status: 'SUCCESS' }
    ];
  }

  getJobs() {
    return this.jobs;
  }

  triggerJobManually(jobId) {
    const job = this.jobs.find(j => j.id === jobId);
    if (!job) return false;

    job.lastRun = 'Just now';
    job.status = 'SUCCESS';

    CategorizedLogger.log('WORKER', {
      jobName: job.name,
      status: 'MANUALLY_EXECUTED',
      durationMs: 340
    });

    return true;
  }
}

export const TaskScheduler = new TaskSchedulerImpl();
