"use client";

import { useState } from "react";
import { Loader2, RefreshCcw } from "lucide-react";
import { revokeGift } from "@/app/actions/assets";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function RevokeGiftButton({ assignmentId }: { assignmentId: string }) {
  const [loading, setLoading] = useState(false);

  const handleRevoke = async () => {
    if (!window.confirm("Are you sure you want to revoke this gift?")) return;
    
    setLoading(true);
    try {
      const res = await revokeGift(assignmentId);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Gift revoked successfully!");
      }
    } catch (error) {
      toast.error("Failed to revoke gift");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleRevoke}
      disabled={loading}
      className="text-amber-600 hover:text-amber-700 hover:bg-amber-50 h-8"
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <RefreshCcw className="w-4 h-4 mr-1" />}
      Revoke
    </Button>
  );
}
