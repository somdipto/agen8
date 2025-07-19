import { N8nWorkflow } from '@/lib/store';

export const EXAMPLE_WORKFLOWS: N8nWorkflow[] = [
  {
    name: "Email to Slack Notification",
    nodes: [
      {
        id: "start",
        name: "Start",
        type: "n8n-nodes-base.start",
        position: [240, 300],
        parameters: {}
      },
      {
        id: "email_trigger",
        name: "Email Trigger",
        type: "n8n-nodes-base.emailTrigger",
        position: [440, 300],
        parameters: {
          "mailbox": "INBOX",
          "format": "simple",
          "options": {}
        }
      },
      {
        id: "slack",
        name: "Slack",
        type: "n8n-nodes-base.slack",
        position: [640, 300],
        parameters: {
          "operation": "postMessage",
          "channel": "#general",
          "text": "New email received: {{$node[\"Email Trigger\"].json[\"subject\"]}}"
        }
      }
    ],
    connections: {
      "Start": {
        "main": [
          [
            {
              "node": "Email Trigger",
              "type": "main",
              "index": 0
            }
          ]
        ]
      },
      "Email Trigger": {
        "main": [
          [
            {
              "node": "Slack",
              "type": "main",
              "index": 0
            }
          ]
        ]
      }
    },
    active: false,
    settings: {},
    tags: ["email", "slack", "notification"]
  },
  {
    name: "Website Monitor with SMS Alert",
    nodes: [
      {
        id: "start",
        name: "Cron",
        type: "n8n-nodes-base.cron",
        position: [240, 300],
        parameters: {
          "cronExpression": "0 */5 * * * *",
          "triggerAtStartup": true
        }
      },
      {
        id: "http_request",
        name: "HTTP Request",
        type: "n8n-nodes-base.httpRequest",
        position: [440, 300],
        parameters: {
          "url": "https://your-website.com",
          "method": "GET",
          "options": {
            "timeout": 10000
          }
        }
      },
      {
        id: "if",
        name: "IF",
        type: "n8n-nodes-base.if",
        position: [640, 300],
        parameters: {
          "conditions": {
            "number": [
              {
                "value1": "={{$node[\"HTTP Request\"].json[\"statusCode\"]}}",
                "operation": "notEqual",
                "value2": 200
              }
            ]
          }
        }
      },
      {
        id: "sms",
        name: "SMS",
        type: "n8n-nodes-base.sms",
        position: [840, 200],
        parameters: {
          "message": "Website down! Status: {{$node[\"HTTP Request\"].json[\"statusCode\"]}}",
          "to": "+1234567890"
        }
      }
    ],
    connections: {
      "Cron": {
        "main": [
          [
            {
              "node": "HTTP Request",
              "type": "main",
              "index": 0
            }
          ]
        ]
      },
      "HTTP Request": {
        "main": [
          [
            {
              "node": "IF",
              "type": "main",
              "index": 0
            }
          ]
        ]
      },
      "IF": {
        "main": [
          [
            {
              "node": "SMS",
              "type": "main",
              "index": 0
            }
          ]
        ]
      }
    },
    active: false,
    settings: {},
    tags: ["monitoring", "sms", "alert", "website"]
  }
];

export function getRandomExample(): N8nWorkflow {
  return EXAMPLE_WORKFLOWS[Math.floor(Math.random() * EXAMPLE_WORKFLOWS.length)];
}