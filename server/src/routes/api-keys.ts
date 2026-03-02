import { Router, Response } from 'express';
import { db } from '../db';
import { apiKeys } from '../db/schema';
import { eq, and } from 'drizzle-orm';
import { authMiddleware, AuthRequest } from '../lib/auth';
import { encrypt } from '../lib/encryption';
import { z } from 'zod';

function paramId(req: any): string {
  const v = paramId(req);
  return Array.isArray(v) ? v[0] : v;
}

const router = Router();
router.use(authMiddleware);

const createSchema = z.object({
  provider: z.enum(['openai', 'anthropic', 'google']),
  key: z.string().min(10),
  label: z.string().optional(),
});

// List keys (masked)
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const keys = await db.select({
      id: apiKeys.id, provider: apiKeys.provider, label: apiKeys.label,
      isActive: apiKeys.isActive, createdAt: apiKeys.createdAt,
    }).from(apiKeys).where(eq(apiKeys.userId, req.user!.userId));
    res.json(keys);
  } catch (error) {
    console.error('List keys error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add key
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const data = createSchema.parse(req.body);
    const encryptedKey = encrypt(data.key);
    const [key] = await db.insert(apiKeys).values({
      userId: req.user!.userId,
      provider: data.provider,
      encryptedKey,
      label: data.label || `${data.provider} key`,
    }).returning({
      id: apiKeys.id, provider: apiKeys.provider, label: apiKeys.label,
      isActive: apiKeys.isActive, createdAt: apiKeys.createdAt,
    });
    res.status(201).json(key);
  } catch (error: any) {
    if (error instanceof z.ZodError) { res.status(400).json({ error: 'Validation failed', details: error.errors }); return; }
    console.error('Add key error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete key
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const [key] = await db.delete(apiKeys)
      .where(and(eq(apiKeys.id, paramId(req)), eq(apiKeys.userId, req.user!.userId)))
      .returning();
    if (!key) { res.status(404).json({ error: 'Not found' }); return; }
    res.json({ success: true });
  } catch (error) {
    console.error('Delete key error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Toggle key active
router.patch('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const [key] = await db.update(apiKeys)
      .set({ isActive: req.body.isActive })
      .where(and(eq(apiKeys.id, paramId(req)), eq(apiKeys.userId, req.user!.userId)))
      .returning({
        id: apiKeys.id, provider: apiKeys.provider, label: apiKeys.label,
        isActive: apiKeys.isActive, createdAt: apiKeys.createdAt,
      });
    if (!key) { res.status(404).json({ error: 'Not found' }); return; }
    res.json(key);
  } catch (error) {
    console.error('Toggle key error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
