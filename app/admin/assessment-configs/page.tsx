"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Settings, Search, Plus, RefreshCw, X, AlertCircle, CheckCircle2, MoreVertical,
  Link as LinkIcon, Trash2, Edit2, Download, Save, Eye
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";

interface Config {
  id: number;
  name: string;
  use_cbt: boolean;
  use_code: boolean;
  use_assignment: boolean;
  use_opw: boolean;
  cbt_weight: string;
  code_weight: string;
  assignment_weight: string;
  opw_weight: string;
  grade_a_threshold: string;
  grade_b_threshold: string;
  grade_c_threshold: string;
  grade_d_threshold: string;
  created_at: string;
  updated_at: string;
}

interface Classroom {
  id: number;
  name: string;
}
interface Course {
  id: number;
  name: string;
}

export default function AssessmentConfigsPage() {
  const [configs, setConfigs] = useState<Config[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  
  // Modals
  const [deleteOpen, setDeleteOpen] = useState(false);
  
  // Selection
  const [selectedConfig, setSelectedConfig] = useState<Config | null>(null);
  const [saving, setSaving] = useState(false);

  const { toast } = useToast();

  const fetchConfigs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/assessment-configs/");
      if (res.ok) {
        setConfigs(await res.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConfigs();
  }, [fetchConfigs]);

  const filteredConfigs = configs.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async () => {
    if (!selectedConfig) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/assessment-configs/${selectedConfig.id}/`, { method: "DELETE" });
      if (res.ok) {
        toast({ title: "Deleted", description: "Configuration removed." });
        setDeleteOpen(false);
        fetchConfigs();
      } else {
        toast({ title: "Error", description: "Failed to delete.", variant: "destructive" });
      }
    } catch (e) {
      toast({ title: "Error", description: "Network error.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };



  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* ── Header ── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-[#1e293b] p-6 sm:p-8 text-white shadow-xl">
        <div className="absolute right-0 top-0 h-64 w-64 -translate-y-12 translate-x-12 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="space-y-2">
            <Badge className="bg-blue-500/20 text-blue-200 border border-blue-500/30 px-3 py-1 font-semibold text-xs tracking-wide">
              ⚙️ Grade Configurations
            </Badge>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Assessment Settings
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-xl">
              Create custom grade scales and weighting rules, then attach them to classrooms or courses to dynamically calculate overall scores.
            </p>
          </div>
          <Button onClick={() => window.location.href = "/admin/assessment-configs/new"} className="bg-white text-slate-900 hover:bg-slate-100 font-bold rounded-xl h-11 px-6 shadow-lg">
            <Plus className="w-4 h-4 mr-2" /> New Configuration
          </Button>
        </div>
      </div>

      {/* ── Toolbar & List ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border-b border-slate-100">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search configurations…"
              className="pl-9 h-10 rounded-xl border-slate-200"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <Button variant="ghost" onClick={fetchConfigs} className="h-10 gap-2 text-slate-600 rounded-xl">
            <RefreshCw className="w-4 h-4" /> Refresh
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-100">
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Name</th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Categories Used</th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Weights</th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Grade Scale (A/B/C/D)</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-16">
                    <Spinner size="sm" className="text-blue-500 mx-auto" />
                  </td>
                </tr>
              ) : filteredConfigs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-16">
                    <Settings className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="text-sm text-slate-400">No configurations found</p>
                  </td>
                </tr>
              ) : (
                filteredConfigs.map((conf) => (
                  <tr key={conf.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-4">
                      <p className="font-semibold text-slate-800">{conf.name}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">ID: {conf.id}</p>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="flex justify-center gap-1">
                        {conf.use_cbt && <Badge variant="secondary" className="text-[9px]">CBT</Badge>}
                        {conf.use_code && <Badge variant="secondary" className="text-[9px]">Code</Badge>}
                        {conf.use_assignment && <Badge variant="secondary" className="text-[9px]">Assign</Badge>}
                        {conf.use_opw && <Badge variant="secondary" className="text-[9px]">OPW</Badge>}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="text-xs text-slate-600 font-medium">
                        {Number(conf.cbt_weight)}/{Number(conf.code_weight)}/{Number(conf.assignment_weight)}/{Number(conf.opw_weight)}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="flex justify-center gap-1 text-[10px] font-bold">
                        <span className="text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">{Number(conf.grade_a_threshold)}+</span>
                        <span className="text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">{Number(conf.grade_b_threshold)}+</span>
                        <span className="text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">{Number(conf.grade_c_threshold)}+</span>
                        <span className="text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded">{Number(conf.grade_d_threshold)}+</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline" size="sm"
                          onClick={() => window.location.href = `/admin/assessment-configs/${conf.id}/usage`}
                          className="h-8 gap-1.5 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 border-indigo-200"
                        >
                          <Eye className="w-3.5 h-3.5" /> Usage
                        </Button>
                        <Button
                          variant="outline" size="sm"
                          onClick={() => window.location.href = `/admin/assessment-configs/${conf.id}/attach`}
                          className="h-8 gap-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200"
                        >
                          <LinkIcon className="w-3.5 h-3.5" /> Attach
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500" onClick={() => window.location.href = `/admin/assessment-configs/${conf.id}`}>
                          <Edit2 className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:bg-red-50" onClick={() => { setSelectedConfig(conf); setDeleteOpen(true); }}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>


      {/* ── Delete Modal ── */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Configuration</DialogTitle>
          </DialogHeader>
          <div className="py-4 text-slate-600 text-sm">
            Are you sure you want to delete <strong className="text-slate-800">{selectedConfig?.name}</strong>? Enrollments using this configuration will fall back to default equal weighting.
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)} disabled={saving}>Cancel</Button>
            <Button onClick={handleDelete} disabled={saving} variant="destructive">
              {saving ? <Spinner className="mr-2" size="sm" /> : <Trash2 className="mr-2 w-4 h-4" />} Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
