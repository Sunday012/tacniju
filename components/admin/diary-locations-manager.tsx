"use client";

import { useState, useTransition } from "react";
import { Building2, Loader2, MapPin, Plus, Trash2, Users } from "lucide-react";
import { toast } from "sonner";
import {
  createDiaryAssembly,
  createDiaryLocation,
  deleteDiaryAssembly,
  deleteDiaryLocation,
} from "@/app/actions/diary-locations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Location = { id: string; name: string };
type Assembly = { id: string; location_id: string; name: string };
type Member = { id: string; full_name: string; district: string | null; assembly: string | null };

export function DiaryLocationsManager({
  locations,
  assemblies,
  members,
}: {
  locations: Location[];
  assemblies: Assembly[];
  members: Member[];
}) {
  const [districtName, setDistrictName] = useState("");
  const [assemblyName, setAssemblyName] = useState("");
  const [locationId, setLocationId] = useState(locations[0]?.id || "");
  const [isPending, startTransition] = useTransition();

  const run = (action: () => Promise<{ error?: string | null; success?: boolean }>, success: string, reset?: () => void) => {
    startTransition(async () => {
      const result = await action();
      if (result.error) {
        toast.error(result.error);
        return;
      }
      reset?.();
      toast.success(success);
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <MapPin className="h-5 w-5 text-indigo-600" />
            <h2 className="font-bold text-slate-900">Create District</h2>
          </div>
          <div className="flex gap-2">
            <Input value={districtName} onChange={(event) => setDistrictName(event.target.value)} placeholder="District name" />
            <Button
              disabled={isPending || !districtName.trim()}
              onClick={() => run(() => createDiaryLocation(districtName), "District created.", () => setDistrictName(""))}
              title="Add district"
            >
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        <div className="border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <Building2 className="h-5 w-5 text-indigo-600" />
            <h2 className="font-bold text-slate-900">Create Assembly</h2>
          </div>
          <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
            <Select value={locationId} onValueChange={setLocationId}>
              <SelectTrigger><SelectValue placeholder="Select district" /></SelectTrigger>
              <SelectContent>
                {locations.map((location) => <SelectItem key={location.id} value={location.id}>{location.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Input value={assemblyName} onChange={(event) => setAssemblyName(event.target.value)} placeholder="Assembly name" />
            <Button
              disabled={isPending || !locationId || !assemblyName.trim()}
              onClick={() => run(() => createDiaryAssembly(locationId, assemblyName), "Assembly created.", () => setAssemblyName(""))}
              title="Add assembly"
            >
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {locations.map((location) => {
          const locationAssemblies = assemblies.filter((assembly) => assembly.location_id === location.id);
          const locationMembers = members.filter((member) => member.district?.trim().toLowerCase() === location.name.trim().toLowerCase());
          return (
            <section key={location.id} className="border border-slate-200 bg-white shadow-sm">
              <header className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-3">
                <div>
                  <h3 className="font-bold text-slate-900">{location.name}</h3>
                  <p className="text-xs text-slate-500">{locationMembers.length} members</p>
                </div>
                <button
                  type="button"
                  className="rounded p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                  onClick={() => confirm(`Delete ${location.name} and its assembly list?`) && run(() => deleteDiaryLocation(location.id), "District deleted.")}
                  title="Delete district"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </header>
              <div className="divide-y divide-slate-100">
                {locationAssemblies.length ? locationAssemblies.map((assembly) => {
                  const count = locationMembers.filter((member) => member.assembly?.trim().toLowerCase() === assembly.name.trim().toLowerCase()).length;
                  return (
                    <div key={assembly.id} className="flex items-center justify-between px-4 py-3">
                      <div className="flex min-w-0 items-center gap-2">
                        <Building2 className="h-4 w-4 shrink-0 text-indigo-500" />
                        <span className="truncate text-sm font-semibold text-slate-700">{assembly.name}</span>
                        <span className="inline-flex items-center gap-1 text-xs text-slate-400"><Users className="h-3 w-3" />{count}</span>
                      </div>
                      <button
                        type="button"
                        className="rounded p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                        onClick={() => confirm(`Delete ${assembly.name}?`) && run(() => deleteDiaryAssembly(assembly.id), "Assembly deleted.")}
                        title="Delete assembly"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  );
                }) : <p className="px-4 py-5 text-sm text-slate-400">No assemblies yet.</p>}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
