# Quick Start Guide

Get started with Workflow Builder in 5 minutes!

## 🚀 Launch the App

```bash
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000)

## 📚 Your First Workflow

### Step 1: Add a Trigger Node
1. Look at the **Node Library** on the left sidebar
2. Click on **"Trigger"** to add it to the canvas
3. The node will appear on the canvas

### Step 2: Add an Action Node
1. Click on **"Action"** in the Node Library
2. An action node will appear on the canvas

### Step 3: Connect the Nodes
1. Hover over the **Trigger** node
2. You'll see a small circle on the right side (output handle)
3. Click and drag from the Trigger's output to the Action's input (left side)
4. A line connecting them will appear

### Step 4: Configure a Node
1. Click on the **Action** node to select it
2. The **Properties** panel opens on the right
3. Change the label to "Send Email"
4. Change the endpoint to your API URL
5. The changes are automatically saved!

### Step 5: Run Your Workflow
1. Click the **"Run"** button in the top toolbar
2. Watch as nodes light up with status colors:
   - 🔵 Blue = Running
   - 🟢 Green = Success
   - 🔴 Red = Error

## 💡 Pro Tips

### Building Complex Workflows

**Add Conditions for Logic Branching:**
```
Trigger → Action → Condition → Transform (if true)
                             → Action (if false)
```

**Use Transform Nodes for Data Processing:**
- Map data from one format to another
- Filter results
- Aggregate values

### Save & Share

**Export Your Workflow:**
1. Click **"Export"** in the toolbar
2. A JSON file downloads to your computer
3. Share it with your team!

**Import a Workflow:**
1. Click **"Import"** in the toolbar
2. Select a workflow JSON file
3. The workflow loads instantly

**Try the Example:**
Import `example-workflow.json` from the project root to see a complete workflow in action!

## 🎨 Customization

### Edit Node Properties
- **Label**: The name displayed on the node
- **Description**: Additional context (optional)
- **Configuration**: Type-specific settings

### Node Types & Their Uses

| Node Type | Icon | Use Case | Example |
|-----------|------|----------|---------|
| **Trigger** | ▶️ | Start workflows | Webhook, Schedule, Manual |
| **Action** | ⚡ | Perform operations | HTTP Request, Database Query |
| **Condition** | 🔀 | Add logic | If/Else, Validation |
| **Transform** | 🔄 | Process data | Map, Filter, Format |

## ⌨️ Keyboard & Mouse

- **Add Node**: Click in Node Library
- **Move Node**: Drag anywhere on the node
- **Connect Nodes**: Drag from output (right) to input (left)
- **Pan Canvas**: Click and drag on empty canvas
- **Zoom**: Mouse wheel or pinch gesture
- **Delete Node**: Select node → Click "Delete Node" in properties
- **Deselect**: Click empty canvas area

## 🔧 Common Workflows

### 1. Data Pipeline
```
Trigger (Webhook)
  → Action (Fetch from API)
  → Transform (Format Data)
  → Action (Save to Database)
```

### 2. Conditional Processing
```
Trigger (Manual)
  → Action (Get Data)
  → Condition (Check Value)
      → Transform (Process A) → Action (Send)
      → Transform (Process B) → Action (Log)
```

### 3. Multi-Step Automation
```
Trigger (Schedule)
  → Action (Fetch Users)
  → Transform (Filter Active)
  → Action (Send Emails)
  → Action (Log Results)
```

## 🐛 Troubleshooting

**Nodes won't connect?**
- Make sure you're dragging from output (right) to input (left)
- Trigger nodes don't have inputs
- Some nodes might have specific connection rules

**Workflow won't run?**
- Check that you have at least one Trigger node
- Ensure all nodes are connected properly
- Look for error messages in the browser console

**Changes not saving?**
- Workflows auto-save to browser localStorage
- Use Export to save a permanent copy
- Clear browser cache if you see old data

**Import not working?**
- Make sure the file is valid JSON
- Check that it has both "nodes" and "edges" properties
- Try the example-workflow.json first

## 📖 Next Steps

1. **Build Real Integrations**: Replace simulated actions with real API calls
2. **Add Authentication**: Secure your workflows with user accounts
3. **Deploy to Production**: Use Vercel or your preferred hosting
4. **Share Workflows**: Export and share with your team
5. **Contribute**: Add new node types and features

## 🆘 Need Help?

- Check the main [README.md](./README.md) for detailed documentation
- Look at [example-workflow.json](./example-workflow.json) for inspiration
- Review the source code in `/components/workflow/`

Happy workflow building! 🎉

