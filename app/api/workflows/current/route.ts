import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { workflows } from '@/lib/db/schema';
import { desc, eq } from 'drizzle-orm';

const CURRENT_WORKFLOW_NAME = '__current__';

// GET /api/workflows/current - Get the current workflow state
export async function GET() {
  try {
    const [currentWorkflow] = await db
      .select()
      .from(workflows)
      .where(eq(workflows.name, CURRENT_WORKFLOW_NAME))
      .orderBy(desc(workflows.updatedAt))
      .limit(1);

    if (!currentWorkflow) {
      // Return empty workflow if no current state exists
      return NextResponse.json({
        nodes: [],
        edges: [],
      });
    }

    return NextResponse.json({
      id: currentWorkflow.id,
      nodes: currentWorkflow.nodes,
      edges: currentWorkflow.edges,
    });
  } catch (error) {
    console.error('Failed to fetch current workflow:', error);
    return NextResponse.json(
      { error: 'Failed to fetch current workflow' },
      { status: 500 }
    );
  }
}

// PUT /api/workflows/current - Save the current workflow state
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { nodes, edges } = body;

    if (!nodes || !edges) {
      return NextResponse.json(
        { error: 'Nodes and edges are required' },
        { status: 400 }
      );
    }

    // Check if current workflow exists
    const [existingWorkflow] = await db
      .select()
      .from(workflows)
      .where(eq(workflows.name, CURRENT_WORKFLOW_NAME))
      .limit(1);

    let savedWorkflow;

    if (existingWorkflow) {
      // Update existing current workflow
      [savedWorkflow] = await db
        .update(workflows)
        .set({
          nodes,
          edges,
          updatedAt: new Date(),
        })
        .where(eq(workflows.id, existingWorkflow.id))
        .returning();
    } else {
      // Create new current workflow
      [savedWorkflow] = await db
        .insert(workflows)
        .values({
          name: CURRENT_WORKFLOW_NAME,
          description: 'Auto-saved current workflow',
          nodes,
          edges,
        })
        .returning();
    }

    return NextResponse.json({
      id: savedWorkflow.id,
      nodes: savedWorkflow.nodes,
      edges: savedWorkflow.edges,
    });
  } catch (error) {
    console.error('Failed to save current workflow:', error);
    return NextResponse.json(
      { error: 'Failed to save current workflow' },
      { status: 500 }
    );
  }
}

