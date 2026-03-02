import { pgTable, text, timestamp, integer, boolean, jsonb, uuid, varchar, real } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  avatarUrl: text('avatar_url'),
  tier: varchar('tier', { length: 20 }).notNull().default('free'),
  stripeCustomerId: text('stripe_customer_id'),
  stripeSubscriptionId: text('stripe_subscription_id'),
  workflowsCount: integer('workflows_count').notNull().default(0),
  runsThisMonth: integer('runs_this_month').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const workflows = pgTable('workflows', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  tags: jsonb('tags').$type<string[]>().default([]),
  canvasData: jsonb('canvas_data').$type<any>().notNull().default({}),
  isTemplate: boolean('is_template').notNull().default(false),
  isPublic: boolean('is_public').notNull().default(false),
  category: varchar('category', { length: 100 }),
  triggerType: varchar('trigger_type', { length: 50 }).default('manual'),
  triggerConfig: jsonb('trigger_config').$type<any>(),
  lastRunAt: timestamp('last_run_at'),
  runCount: integer('run_count').notNull().default(0),
  status: varchar('status', { length: 20 }).notNull().default('draft'),
  version: integer('version').notNull().default(1),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const workflowRuns = pgTable('workflow_runs', {
  id: uuid('id').primaryKey().defaultRandom(),
  workflowId: uuid('workflow_id').notNull().references(() => workflows.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  status: varchar('status', { length: 20 }).notNull().default('queued'),
  triggerType: varchar('trigger_type', { length: 50 }).notNull().default('manual'),
  inputData: jsonb('input_data').$type<any>(),
  outputData: jsonb('output_data').$type<any>(),
  nodeResults: jsonb('node_results').$type<any>(),
  totalTokens: integer('total_tokens').default(0),
  totalCost: real('total_cost').default(0),
  durationMs: integer('duration_ms'),
  errorMessage: text('error_message'),
  errorNodeId: text('error_node_id'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  completedAt: timestamp('completed_at'),
});

export const apiKeys = pgTable('api_keys', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  provider: varchar('provider', { length: 50 }).notNull(),
  encryptedKey: text('encrypted_key').notNull(),
  label: varchar('label', { length: 255 }),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});
