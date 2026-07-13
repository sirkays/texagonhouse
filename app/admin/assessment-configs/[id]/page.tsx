"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";

interface Config {
  id?: number;
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
}

export default function AssessmentConfigFormPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const { toast } = useToast();
  
  const isNew = id === "new";
  
  const [formData, setFormData] = useState<Partial<Config>>({
    name: "",
    use_cbt: true, use_code: true, use_assignment: true, use_opw: true,
    cbt_weight: "25.0", code_weight: "25.0", assignment_weight: "25.0", opw_weight: "25.0",
    grade_a_threshold: "90.0", grade_b_threshold: "80.0", grade_c_threshold: "70.0", grade_d_threshold: "50.0"
  });
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);

  const fetchConfig = useCallback(async () => {
    if (isNew) return;
    try {
      const res = await fetch(`/api/assessment-configs/${id}/`);
      if (res.ok) {
        setFormData(await res.json());
      } else {
        toast({ title: "Error", description: "Configuration not found.", variant: "destructive" });
        router.push("/admin/assessment-configs");
      }
    } catch (e) {
      toast({ title: "Error", description: "Failed to load configuration.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [id, isNew, router, toast]);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  const handleSave = async () => {
    if (!formData.name) {
      toast({ title: "Validation Error", description: "Name is required.", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const method = isNew ? "POST" : "PATCH";
      const url = isNew ? "/api/assessment-configs/" : `/api/assessment-configs/${id}/`;
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        toast({ title: "Success", description: "Configuration saved successfully." });
        router.push("/admin/assessment-configs");
      } else {
        const err = await res.json();
        toast({ title: "Error", description: err.detail || "Failed to save configuration.", variant: "destructive" });
      }
    } catch (e) {
      toast({ title: "Error", description: "Network error.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner className="text-blue-500 w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* ── Header ── */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push("/admin/assessment-configs")} className="rounded-full">
          <ArrowLeft className="w-5 h-5 text-slate-500" />
        </Button>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-800">
            {isNew ? "New Configuration" : "Edit Configuration"}
          </h1>
          <p className="text-sm text-slate-500">
            {isNew ? "Create a new grading configuration." : `Updating configuration ID: ${id}`}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sm:p-8">
        <div className="space-y-8">
          
          {/* Name */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Configuration Name</label>
            <Input
              value={formData.name || ""}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Standard 2026 Grade Scale"
              className="h-12 text-lg font-medium"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            
            {/* Categories & Weights */}
            <div className="space-y-5">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-800">Categories & Weights</h3>
                <p className="text-xs text-slate-500 mt-1">Select which categories to use and their weighting.</p>
              </div>
              
              <div className="space-y-3">
                {[
                  { key: "cbt", label: "CBT Tests" },
                  { key: "code", label: "Code IDE" },
                  { key: "assignment", label: "Assignments" },
                  { key: "opw", label: "Off-Practical (OPW)" }
                ].map(({ key, label }) => {
                  const useKey = `use_${key}` as keyof Config;
                  const weightKey = `${key}_weight` as keyof Config;
                  return (
                    <div key={key} className="flex items-center gap-4 bg-slate-50 p-3.5 rounded-xl border border-slate-100 transition-colors hover:bg-slate-100/50">
                      <Switch
                        checked={Boolean(formData[useKey])}
                        onCheckedChange={c => setFormData({ ...formData, [useKey]: c })}
                      />
                      <span className="text-sm font-semibold text-slate-700 flex-1">{label}</span>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number" step="0.1"
                          disabled={!formData[useKey]}
                          value={String(formData[weightKey] || 0)}
                          onChange={e => setFormData({ ...formData, [weightKey]: e.target.value })}
                          className="w-24 h-9 font-medium text-right bg-white"
                        />
                        <span className="text-sm text-slate-400 font-medium w-4">%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Grade Thresholds */}
            <div className="space-y-5">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-800">Grade Thresholds</h3>
                <p className="text-xs text-slate-500 mt-1">Define the minimum percentage for each grade.</p>
              </div>
              
              <div className="space-y-3">
                {[
                  { key: "grade_a_threshold", label: "A (Excellent)", color: "text-emerald-700 bg-emerald-50", text: "text-emerald-800" },
                  { key: "grade_b_threshold", label: "B (Good)", color: "text-blue-700 bg-blue-50", text: "text-blue-800" },
                  { key: "grade_c_threshold", label: "C (Average)", color: "text-amber-700 bg-amber-50", text: "text-amber-800" },
                  { key: "grade_d_threshold", label: "D (Below Avg)", color: "text-orange-700 bg-orange-50", text: "text-orange-800" },
                ].map(({ key, label, color, text }) => (
                  <div key={key} className="flex items-center gap-4 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                    <span className={`text-sm font-bold w-36 px-2.5 py-1.5 rounded-md ${color}`}>{label}</span>
                    <span className="text-slate-400 font-medium">&ge;</span>
                    <div className="flex-1 flex items-center gap-2">
                      <Input
                        type="number" step="0.1"
                        value={String(formData[key as keyof Config] || 0)}
                        onChange={e => setFormData({ ...formData, [key as keyof Config]: e.target.value })}
                        className={`flex-1 h-9 font-bold bg-white ${text}`}
                      />
                      <span className="text-sm text-slate-400 font-medium w-4">%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
          </div>

          {/* Footer Actions */}
          <div className="pt-6 mt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <Button variant="outline" onClick={() => router.push("/admin/assessment-configs")} disabled={saving} className="h-11 px-6 rounded-xl font-medium">
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving} className="bg-slate-900 text-white hover:bg-slate-800 h-11 px-8 rounded-xl font-medium">
              {saving ? <Spinner className="mr-2" size="sm" /> : <Save className="mr-2 w-4 h-4" />} Save Configuration
            </Button>
          </div>
          
        </div>
      </div>
    </div>
  );
}
