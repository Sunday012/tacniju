"use client";

import { useState, useRef, useEffect } from "react";
import { Gift, Loader2, ScanBarcode, Camera } from "lucide-react";
import { Html5QrcodeScanner } from "html5-qrcode";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { assignGift } from "@/app/actions/assets";
import { toast } from "sonner";

export function DistributeGiftModal({ assets }: { assets: any[] }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [useCamera, setUseCamera] = useState(false);
  const [reservationNumber, setReservationNumber] = useState("");
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  const giftAssets = assets.filter((a) => a.is_gift && a.available_quantity > 0);

  useEffect(() => {
    if (!useCamera) {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
        scannerRef.current = null;
      }
      return;
    }

    const timer = setTimeout(() => {
      if (scannerRef.current) return;

      const scanner = new Html5QrcodeScanner(
        "gift-reader",
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        false
      );
      scannerRef.current = scanner;

      scanner.render(
        (decodedText) => {
          setReservationNumber(decodedText);
          setUseCamera(false);
          toast.success("Code scanned successfully!");
        },
        () => {}
      );
    }, 300);

    return () => {
      clearTimeout(timer);
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
        scannerRef.current = null;
      }
    };
  }, [useCamera]);

  // Clean up when modal closes
  useEffect(() => {
    if (!open) {
      setUseCamera(false);
      setReservationNumber("");
    }
  }, [open]);

  async function handleSubmit(formData?: FormData) {
    if (!formData && !reservationNumber) {
      toast.error("Please provide a reservation number");
      return;
    }

    setLoading(true);
    
    // If called directly (not from form), construct FormData
    let data = formData;
    if (!data) {
      const assetSelect = document.getElementById("assetId") as HTMLSelectElement;
      if (!assetSelect) {
        setLoading(false);
        return;
      }
      data = new FormData();
      data.append("assetId", assetSelect.value);
      data.append("reservationNumber", reservationNumber);
    }

    try {
      const res = await assignGift(data);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Gift distributed successfully!");
        setOpen(false);
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-bold transition-all shadow-[0_4px_16px_rgba(79,70,229,0.3)] hover:shadow-[0_4px_20px_rgba(79,70,229,0.4)]">
          <ScanBarcode className="h-5 w-5" />
          <span>Distribute Gift</span>
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-white border-slate-200 text-slate-800 p-0 overflow-hidden shadow-2xl rounded-2xl">
        <div className="p-6 max-h-[85vh] overflow-y-auto">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-xl flex items-center gap-2 font-extrabold text-slate-800">
              <Gift className="h-5 w-5 text-indigo-500" />
              Distribute Gift
            </DialogTitle>
            <DialogDescription className="text-slate-500 font-medium mt-1">
              Scan or enter a reservation number to assign a gift.
            </DialogDescription>
          </DialogHeader>

          {giftAssets.length === 0 ? (
            <div className="text-center py-6 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-slate-500 font-medium">No gifts available to distribute.</p>
            </div>
          ) : (
            <form action={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label htmlFor="assetId" className="text-sm font-bold text-slate-700">
                  Select Gift
                </label>
                <select
                  id="assetId"
                  name="assetId"
                  required
                  className="w-full bg-white border border-slate-200 shadow-sm rounded-xl px-4 py-2.5 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all appearance-none"
                >
                  {giftAssets.map((asset) => (
                    <option key={asset.id} value={asset.id}>
                      {asset.name} ({asset.available_quantity} left)
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="reservationNumber" className="text-sm font-bold text-slate-700">
                    Reservation Number
                  </label>
                  <button
                    type="button"
                    onClick={() => setUseCamera(!useCamera)}
                    className="text-xs font-semibold text-indigo-600 flex items-center gap-1.5 hover:text-indigo-700 transition-colors bg-indigo-50 px-2.5 py-1 rounded-lg"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    {useCamera ? "Hide Camera" : "Scan Code"}
                  </button>
                </div>
                
                {useCamera ? (
                  <div className="rounded-xl border-2 border-indigo-100 overflow-hidden bg-slate-50 relative min-h-[250px]">
                    <style dangerouslySetInnerHTML={{__html: `
                      #gift-reader a { color: #4f46e5 !important; text-decoration: underline; font-size: 12px; }
                      #gift-reader select { background-color: white !important; color: #1e293b !important; border: 1px solid #e2e8f0 !important; border-radius: 6px; padding: 6px; margin-bottom: 8px; width: 100%; }
                      #gift-reader button { background-color: #4f46e5 !important; color: white !important; border: none; padding: 8px 16px; border-radius: 8px; cursor: pointer; font-weight: 600; width: 100%; margin-top: 8px; }
                      #gift-reader span { color: #64748b !important; }
                    `}} />
                    <div id="gift-reader" className="w-full"></div>
                  </div>
                ) : (
                  <input
                    id="reservationNumber"
                    name="reservationNumber"
                    type="text"
                    required
                    value={reservationNumber}
                    onChange={(e) => setReservationNumber(e.target.value)}
                    autoComplete="off"
                    autoFocus
                    className="w-full bg-slate-50 border border-indigo-200/50 shadow-inner rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-mono text-lg tracking-wider placeholder:text-slate-400 placeholder:font-sans placeholder:text-sm"
                    placeholder="Scan or type..."
                  />
                )}
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex-1 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2.5 rounded-xl font-bold transition-colors shadow-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || (useCamera && !reservationNumber)}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-bold transition-all shadow-[0_4px_12px_rgba(79,70,229,0.2)] disabled:opacity-50 flex items-center justify-center"
                >
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Confirm"}
                </button>
              </div>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
