import { getAdminStallOrders } from "@/app/actions/assets";
import { StallOrdersTable } from "@/components/admin/stock/StallOrdersTable";
import { ShoppingBag, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/server";
import { redirect } from "next/navigation";
import { PrintButton } from "@/components/ui/print-button";

export const dynamic = "force-dynamic";

export default async function StallsPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).maybeSingle();
  if (!profile?.is_admin && user.email !== "sundayfavour997@gmail.com") redirect("/");

  const { orders: stallOrders, error } = await getAdminStallOrders();

  return (
    <div className="p-6 md:p-10 relative">
      <div className="max-w-6xl mx-auto w-full space-y-8 relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center">
              <ShoppingBag className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Stall Orders</h1>
              <p className="text-slate-500 mt-1 font-medium">Manage and process requests from members for stall items.</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <PrintButton />
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-600 flex items-center gap-3 shadow-sm">
            <AlertCircle className="h-5 w-5" />
            <p className="font-medium">{error}</p>
          </div>
        )}

        <div className="mt-8">
          <StallOrdersTable orders={stallOrders || []} />
        </div>
      </div>
    </div>
  );
}
