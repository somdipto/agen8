import { Button } from '@/components/ui/button';
import { useWorkflowStore } from '@/lib/store';
import { getRandomExample } from '@/lib/examples';
import { Wand2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DemoButtonProps {
  className?: string;
}

export function DemoButton({ className }: DemoButtonProps) {
  const { setWorkflow } = useWorkflowStore();
  const { toast } = useToast();

  const handleLoadDemo = () => {
    const example = getRandomExample();
    setWorkflow(example);
    toast({
      title: "Demo Loaded",
      description: `Loaded example workflow: ${example.name}`,
    });
  };

  return (
    <Button
      variant="outline"
      onClick={handleLoadDemo}
      className={`gap-2 ${className}`}
    >
      <Wand2 className="h-4 w-4" />
      Load Demo
    </Button>
  );
}