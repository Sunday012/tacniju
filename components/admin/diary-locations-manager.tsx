"use client";

import { useState, useTransition } from "react";
import { Building2, Loader2, MapPin, Pencil, Plus, Trash2, Users } from "lucide-react";
import { toast } from "sonner";
import {
  createDiaryAssembly,
  createDiaryLocation,
  deleteDiaryAssembly,
  deleteDiaryLocation,
  updateDiaryAssembly,
  updateDiaryLocation,
} from "@/app/actions/diary-locations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";

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
  const [districtOpen, setDistrictOpen] = useState(false);
  const [assemblyOpen, setAssemblyOpen] = useState(false);
  const [editingDistrictId, setEditingDistrictId] = useState("");
  const [editingAssemblyId, setEditingAssemblyId] = useState("");
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

  const openNewDistrict = () => { setEditingDistrictId(""); setDistrictName(""); setDistrictOpen(true); };
  const openEditDistrict = (location: Location) => { setEditingDistrictId(location.id); setDistrictName(location.name); setDistrictOpen(true); };
  const openNewAssembly = () => { setEditingAssemblyId(""); setAssemblyName(""); setLocationId(locations[0]?.id || ""); setAssemblyOpen(true); };
  const openEditAssembly = (assembly: Assembly) => { setEditingAssemblyId(assembly.id); setAssemblyName(assembly.name); setLocationId(assembly.location_id); setAssemblyOpen(true); };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-end gap-2">
        <Button variant="outline" className="gap-2 border-indigo-200 font-bold text-indigo-700 hover:bg-indigo-50" onClick={openNewDistrict}><MapPin className="h-4 w-4" />New District</Button>
        <Button className="gap-2 bg-indigo-600 font-bold text-white hover:bg-indigo-700" onClick={openNewAssembly}><Building2 className="h-4 w-4" />New Assembly</Button>
      </div>

      <Sheet open={districtOpen} onOpenChange={setDistrictOpen}><SheetContent className="w-full p-0 sm:max-w-xl"><SheetHeader className="border-b border-slate-200 px-6 py-5 text-left"><SheetTitle>{editingDistrictId ? "Edit District" : "Create District"}</SheetTitle><SheetDescription>{editingDistrictId ? "Change this district's name." : "Add a district to the location directory."}</SheetDescription></SheetHeader><div className="space-y-5 p-6"><label className="grid gap-2"><Label>District name</Label><Input value={districtName} onChange={(event) => setDistrictName(event.target.value)} placeholder="Enter district name" /></label><Button className="h-11 w-full bg-indigo-600 font-bold text-white hover:bg-indigo-700" disabled={isPending || !districtName.trim()} onClick={() => run(() => editingDistrictId ? updateDiaryLocation(editingDistrictId, districtName) : createDiaryLocation(districtName), editingDistrictId ? "District updated." : "District created.", () => { setDistrictName(""); setEditingDistrictId(""); setDistrictOpen(false); })}>{isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : editingDistrictId ? <Pencil className="h-4 w-4" /> : <Plus className="h-4 w-4" />}{editingDistrictId ? "Save Changes" : "Create District"}</Button></div></SheetContent></Sheet>

      <Sheet open={assemblyOpen} onOpenChange={setAssemblyOpen}><SheetContent className="w-full p-0 sm:max-w-xl"><SheetHeader className="border-b border-slate-200 px-6 py-5 text-left"><SheetTitle>{editingAssemblyId ? "Edit Assembly" : "Create Assembly"}</SheetTitle><SheetDescription>{editingAssemblyId ? "Change this assembly or move it to another district." : "Add an assembly under a district."}</SheetDescription></SheetHeader><div className="space-y-5 p-6"><label className="grid gap-2"><Label>District</Label><Select value={locationId} onValueChange={setLocationId}><SelectTrigger><SelectValue placeholder="Select district" /></SelectTrigger><SelectContent>{locations.map((location) => <SelectItem key={location.id} value={location.id}>{location.name}</SelectItem>)}</SelectContent></Select></label><label className="grid gap-2"><Label>Assembly name</Label><Input value={assemblyName} onChange={(event) => setAssemblyName(event.target.value)} placeholder="Enter assembly name" /></label><Button className="h-11 w-full bg-indigo-600 font-bold text-white hover:bg-indigo-700" disabled={isPending || !locationId || !assemblyName.trim()} onClick={() => run(() => editingAssemblyId ? updateDiaryAssembly(editingAssemblyId, locationId, assemblyName) : createDiaryAssembly(locationId, assemblyName), editingAssemblyId ? "Assembly updated." : "Assembly created.", () => { setAssemblyName(""); setEditingAssemblyId(""); setAssemblyOpen(false); })}>{isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : editingAssemblyId ? <Pencil className="h-4 w-4" /> : <Plus className="h-4 w-4" />}{editingAssemblyId ? "Save Changes" : "Create Assembly"}</Button></div></SheetContent></Sheet>

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
                <div className="flex items-center gap-1"><button type="button" className="rounded p-2 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600" onClick={() => openEditDistrict(location)} title="Edit district" aria-label={`Edit ${location.name}`}><Pencil className="h-4 w-4" /></button><button
                  type="button"
                  className="rounded p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                  onClick={() => confirm(`Delete ${location.name} and its assembly list?`) && run(() => deleteDiaryLocation(location.id), "District deleted.")}
                  title="Delete district"
                >
                  <Trash2 className="h-4 w-4" />
                </button></div>
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
                      <div className="flex items-center gap-1"><button type="button" className="rounded p-1.5 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600" onClick={() => openEditAssembly(assembly)} title="Edit assembly" aria-label={`Edit ${assembly.name}`}><Pencil className="h-4 w-4" /></button><button
                        type="button"
                        className="rounded p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                        onClick={() => confirm(`Delete ${assembly.name}?`) && run(() => deleteDiaryAssembly(assembly.id), "Assembly deleted.")}
                        title="Delete assembly"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button></div>
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
