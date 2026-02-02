import { Button } from "@/components/ui/button";
import { RotateCw } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

export function RefreshButton() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await queryClient.refetchQueries();
      toast({
        title: "Data Refreshed",
        description: "The latest data has been loaded.",
      });
    } catch (error) {
      toast({
        title: "Refresh Failed",
        description: "Could not refresh data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="icon"
      className="fixed top-4 right-4 z-[100] bg-background/80 backdrop-blur-sm shadow-md hover:bg-accent h-10 w-10 rounded-full border-primary/20"
      onClick={handleRefresh}
      disabled={isRefreshing}
      title="Refresh Data"
    >
      <RotateCw className={`h-5 w-5 text-primary ${isRefreshing ? "animate-spin" : ""}`} />
    </Button>
  );
}
