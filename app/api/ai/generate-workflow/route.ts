import { streamText } from 'ai';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session) {
      return new Response('Unauthorized', { status: 401 });
    }

    const { prompt } = await req.json();

    const result = streamText({
      model: process.env.AI_MODEL || 'openai/gpt-4o-mini',
      system: `You are a workflow automation expert. Generate a workflow based on the user's description.
          
Return a JSON object with this structure:
{
  "name": "Workflow Name",
  "description": "Brief description",
  "nodes": [
    {
      "id": "unique-id",
      "type": "trigger|action|condition|transform",
      "position": { "x": number, "y": number },
      "data": {
        "label": "Node Label",
        "description": "Node description",
        "type": "trigger|action|condition|transform",
        "config": { /* type-specific config */ },
        "status": "idle"
      }
    }
  ],
  "edges": [
    {
      "id": "edge-id",
      "source": "source-node-id",
      "target": "target-node-id",
      "type": "default"
    }
  ]
}

Node types and their configs:
- trigger: { triggerType: "Manual|Webhook|Schedule" }
- action: { actionType: "HTTP Request|Database Query", endpoint: "url" }
- condition: { condition: "expression" }
- transform: { transformType: "Map Data|Filter|Aggregate" }

Position nodes in a left-to-right flow with proper spacing (x: 100, 400, 700, etc., y: 200).
Return ONLY valid JSON, no markdown or explanations.`,
      prompt,
      temperature: 0.7,
    });

    // Convert stream to text
    let fullText = '';
    for await (const chunk of result.textStream) {
      fullText += chunk;
    }

    const workflowData = JSON.parse(fullText);
    return NextResponse.json(workflowData);
  } catch (error) {
    console.error('Failed to generate workflow:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      {
        error: 'Failed to generate workflow',
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}
