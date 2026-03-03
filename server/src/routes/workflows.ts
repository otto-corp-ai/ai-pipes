import { Router, Response } from 'express';
import { db } from '../db';
import { workflows, workflowRuns, users } from '../db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { authMiddleware, AuthRequest } from '../lib/auth';
import { executeWorkflow } from '../engine/executor';
import { z } from 'zod';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { processFile, validateFileType, FILE_SIZE_LIMITS } from '../engine/file-processor';

const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const upload = multer({
  dest: uploadsDir,
  limits: { fileSize: 500 * 1024 * 1024 }, // Max limit, checked per-tier below
});

function paramId(req: AuthRequest, key = 'id'): string {
  const v = req.params[key];
  return Array.isArray(v) ? v[0] : v;
}

const router = Router();
router.use(authMiddleware);

const createSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  canvasData: z.any(),
  tags: z.array(z.string()).optional(),
  triggerType: z.string().optional(),
  triggerConfig: z.any().optional(),
});

// List workflows
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const result = await db.select().from(workflows)
      .where(eq(workflows.userId, req.user!.userId))
      .orderBy(desc(workflows.updatedAt));
    res.json(result);
  } catch (error) {
    console.error('List workflows error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single workflow
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const [wf] = await db.select().from(workflows)
      .where(and(eq(workflows.id, paramId(req)), eq(workflows.userId, req.user!.userId)))
      .limit(1);
    if (!wf) { res.status(404).json({ error: 'Not found' }); return; }
    res.json(wf);
  } catch (error) {
    console.error('Get workflow error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create workflow
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const data = createSchema.parse(req.body);
    const [wf] = await db.insert(workflows).values({
      ...data,
      userId: req.user!.userId,
      canvasData: data.canvasData || { nodes: [], edges: [] },
    }).returning();
    res.status(201).json(wf);
  } catch (error: any) {
    if (error instanceof z.ZodError) { res.status(400).json({ error: 'Validation failed', details: error.errors }); return; }
    console.error('Create workflow error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update workflow
router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const [wf] = await db.update(workflows)
      .set({ ...req.body, updatedAt: new Date() })
      .where(and(eq(workflows.id, paramId(req)), eq(workflows.userId, req.user!.userId)))
      .returning();
    if (!wf) { res.status(404).json({ error: 'Not found' }); return; }
    res.json(wf);
  } catch (error) {
    console.error('Update workflow error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete workflow
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const [wf] = await db.delete(workflows)
      .where(and(eq(workflows.id, paramId(req)), eq(workflows.userId, req.user!.userId)))
      .returning();
    if (!wf) { res.status(404).json({ error: 'Not found' }); return; }
    // Clean up uploaded files
    const wfDir = path.join(uploadsDir, paramId(req));
    if (fs.existsSync(wfDir)) fs.rmSync(wfDir, { recursive: true, force: true });
    res.json({ success: true });
  } catch (error) {
    console.error('Delete workflow error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Run workflow
router.post('/:id/run', async (req: AuthRequest, res: Response) => {
  try {
    const [wf] = await db.select().from(workflows)
      .where(and(eq(workflows.id, paramId(req)), eq(workflows.userId, req.user!.userId)))
      .limit(1);
    if (!wf) { res.status(404).json({ error: 'Not found' }); return; }
    
    const input = req.body.input || '';
    
    // Create run record
    const [run] = await db.insert(workflowRuns).values({
      workflowId: wf.id,
      userId: req.user!.userId,
      status: 'running',
      triggerType: 'manual',
      inputData: { input },
    }).returning();
    
    // Execute
    const result = await executeWorkflow(req.user!.userId, wf.canvasData as any, input);
    
    // Update run record
    const [updatedRun] = await db.update(workflowRuns).set({
      status: result.status,
      outputData: { output: result.output },
      nodeResults: result.nodeResults,
      totalTokens: result.totalTokens,
      totalCost: result.totalCost,
      durationMs: result.durationMs,
      errorMessage: result.errorMessage,
      errorNodeId: result.errorNodeId,
      completedAt: new Date(),
    }).where(eq(workflowRuns.id, run.id)).returning();
    
    // Update workflow stats
    await db.update(workflows).set({
      lastRunAt: new Date(),
      runCount: (wf.runCount || 0) + 1,
      status: 'active',
      updatedAt: new Date(),
    }).where(eq(workflows.id, wf.id));
    
    res.json(updatedRun);
  } catch (error: any) {
    console.error('Run workflow error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// Get run history
router.get('/:id/runs', async (req: AuthRequest, res: Response) => {
  try {
    const runs = await db.select().from(workflowRuns)
      .where(and(eq(workflowRuns.workflowId, paramId(req)), eq(workflowRuns.userId, req.user!.userId)))
      .orderBy(desc(workflowRuns.createdAt))
      .limit(50);
    res.json(runs);
  } catch (error) {
    console.error('Get runs error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single run
router.get('/:workflowId/runs/:runId', async (req: AuthRequest, res: Response) => {
  try {
    const [run] = await db.select().from(workflowRuns)
      .where(and(eq(workflowRuns.id, paramId(req, "runId")), eq(workflowRuns.userId, req.user!.userId)))
      .limit(1);
    if (!run) { res.status(404).json({ error: 'Not found' }); return; }
    res.json(run);
  } catch (error) {
    console.error('Get run error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// File upload
router.post('/:id/upload', upload.single('file'), async (req: AuthRequest, res: Response) => {
  try {
    const file = req.file;
    if (!file) { res.status(400).json({ error: 'No file uploaded' }); return; }

    // Check workflow ownership
    const [wf] = await db.select().from(workflows)
      .where(and(eq(workflows.id, paramId(req)), eq(workflows.userId, req.user!.userId)))
      .limit(1);
    if (!wf) { res.status(404).json({ error: 'Workflow not found' }); return; }

    // Get user tier for size limit
    const [user] = await db.select().from(users).where(eq(users.id, req.user!.userId)).limit(1);
    const tier = user?.tier || 'free';
    const maxSize = FILE_SIZE_LIMITS[tier] || FILE_SIZE_LIMITS.free;
    if (file.size > maxSize) {
      fs.unlinkSync(file.path);
      res.status(413).json({ error: `File too large. Max ${(maxSize / 1024 / 1024).toFixed(0)}MB for ${tier} tier.` });
      return;
    }

    // Validate magic bytes
    const buffer = fs.readFileSync(file.path);
    if (!validateFileType(buffer, file.mimetype)) {
      fs.unlinkSync(file.path);
      res.status(400).json({ error: 'File type mismatch. The file contents don\'t match the declared type.' });
      return;
    }

    // Move to workflow-specific directory
    const wfDir = path.join(uploadsDir, paramId(req));
    if (!fs.existsSync(wfDir)) fs.mkdirSync(wfDir, { recursive: true });
    const destPath = path.join(wfDir, `${Date.now()}_${file.originalname}`);
    fs.renameSync(file.path, destPath);

    // Process file
    const result = await processFile(destPath, file.originalname, file.mimetype);

    res.json({
      path: destPath,
      originalName: file.originalname,
      type: result.type,
      size: file.size,
      mimeType: file.mimetype,
      textPreview: result.text.slice(0, 500),
      rowCount: result.metadata.rowCount,
      pages: result.metadata.pages,
      columns: result.rows ? Object.keys(result.rows[0] || {}) : undefined,
    });
  } catch (error: any) {
    console.error('File upload error:', error);
    res.status(500).json({ error: error.message || 'File processing failed' });
  }
});

// Templates
router.get('/templates/list', async (_req: AuthRequest, res: Response) => {
  try {
    const templates = await db.select().from(workflows)
      .where(eq(workflows.isTemplate, true))
      .orderBy(desc(workflows.createdAt));
    res.json(templates);
  } catch (error) {
    console.error('Get templates error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Clone template
router.post('/templates/:id/clone', async (req: AuthRequest, res: Response) => {
  try {
    const [template] = await db.select().from(workflows)
      .where(and(eq(workflows.id, paramId(req)), eq(workflows.isTemplate, true)))
      .limit(1);
    if (!template) { res.status(404).json({ error: 'Template not found' }); return; }
    
    const [wf] = await db.insert(workflows).values({
      userId: req.user!.userId,
      name: `${template.name} (Copy)`,
      description: template.description,
      canvasData: template.canvasData,
      tags: template.tags,
      category: template.category,
    }).returning();
    res.status(201).json(wf);
  } catch (error) {
    console.error('Clone template error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
