import { pgTable, text, timestamp, jsonb, uuid } from 'drizzle-orm/pg-core';

export const workflows = pgTable('workflows', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  description: text('description'),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  nodes: jsonb('nodes').notNull().$type<Array<any>>(),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  edges: jsonb('edges').notNull().$type<Array<any>>(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export type Workflow = typeof workflows.$inferSelect;
export type NewWorkflow = typeof workflows.$inferInsert;
