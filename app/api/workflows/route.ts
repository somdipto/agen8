import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { workflows } from '@/lib/db/schema';
import { desc } from 'drizzle-orm';

// GET /api/workflows - List all workflows
export async function GET() {
  try {
    const allWorkflows = await db.select().from(workflows).orderBy(desc(workflows.updatedAt));
    return NextResponse.json(allWorkflows);
  } catch (error) {
    console.error('Failed to fetch workflows:', error);
    return NextResponse.json({ error: 'Failed to fetch workflows' }, { status: 500 });
  }
}

// POST /api/workflows - Create a new workflow
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, nodes, edges } = body;

    if (!name || !nodes || !edges) {
      return NextResponse.json({ error: 'Name, nodes, and edges are required' }, { status: 400 });
    }

    const [newWorkflow] = await db
      .insert(workflows)
      .values({
        name,
        description,
        nodes,
        edges,
      })
      .returning();

    return NextResponse.json(newWorkflow, { status: 201 });
  } catch (error) {
    console.error('Failed to create workflow:', error);
    return NextResponse.json({ error: 'Failed to create workflow' }, { status: 500 });
  }
}
