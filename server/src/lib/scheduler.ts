import cron from 'node-cron';
import { db } from '../db';
import { workflows } from '../db/schema';
import { eq } from 'drizzle-orm';
import { executeWorkflow } from '../engine/executor';
import { workflowRuns } from '../db/schema';

const scheduledJobs = new Map<string, cron.ScheduledTask>();

export function scheduleWorkflow(workflowId: string, userId: string, cronExpression: string, input: string = '') {
  // Remove existing schedule
  unscheduleWorkflow(workflowId);
  
  const task = cron.schedule(cronExpression, async () => {
    try {
      const [wf] = await db.select().from(workflows).where(eq(workflows.id, workflowId)).limit(1);
      if (!wf) { unscheduleWorkflow(workflowId); return; }
      
      const [run] = await db.insert(workflowRuns).values({
        workflowId, userId, status: 'running', triggerType: 'scheduled', inputData: { input },
      }).returning();
      
      const result = await executeWorkflow(userId, wf.canvasData as any, input);
      
      await db.update(workflowRuns).set({
        status: result.status, outputData: { output: result.output },
        nodeResults: result.nodeResults, totalTokens: result.totalTokens,
        totalCost: result.totalCost, durationMs: result.durationMs,
        errorMessage: result.errorMessage, errorNodeId: result.errorNodeId,
        completedAt: new Date(),
      }).where(eq(workflowRuns.id, run.id));
      
      await db.update(workflows).set({
        lastRunAt: new Date(), runCount: (wf.runCount || 0) + 1, updatedAt: new Date(),
      }).where(eq(workflows.id, workflowId));
    } catch (error) {
      console.error(`Scheduled run failed for workflow ${workflowId}:`, error);
    }
  });
  
  scheduledJobs.set(workflowId, task);
}

export function unscheduleWorkflow(workflowId: string) {
  const existing = scheduledJobs.get(workflowId);
  if (existing) {
    existing.stop();
    scheduledJobs.delete(workflowId);
  }
}

export async function loadScheduledWorkflows() {
  try {
    const scheduled = await db.select().from(workflows)
      .where(eq(workflows.triggerType, 'scheduled'));
    for (const wf of scheduled) {
      if (wf.triggerConfig && (wf.triggerConfig as any).cron && wf.status === 'active') {
        const config = wf.triggerConfig as any;
        scheduleWorkflow(wf.id, wf.userId, config.cron, config.input || '');
        console.log(`Scheduled workflow: ${wf.name} (${config.cron})`);
      }
    }
  } catch (error) {
    console.error('Failed to load scheduled workflows:', error);
  }
}
