"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type Criteria = {
  course_id: number;
  no_of_cbt: number;
  no_of_code_submission: number;
  total_pass_mark_cbt: number;
  total_pass_mark_code: number;
  exists?: boolean;
};

export function CourseCriteriaModal({
  open,
  onOpenChange,
  courseId,
  courseName,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseId: number | null;
  courseName?: string;
}) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [criteria, setCriteria] = useState<Criteria>({
    course_id: courseId || 0,
    no_of_cbt: 10,
    no_of_code_submission: 10,
    total_pass_mark_cbt: 500,
    total_pass_mark_code: 500,
    exists: false,
  });

  useEffect(() => {
    if (!open || !courseId) return;

    const fetchCriteria = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/courses/${courseId}/pass-criteria`);
        const data = await res.json();

        if (!res.ok) {
          toast({
            title: "Error",
            description: data.detail || "Failed to fetch course criteria.",
            variant: "destructive",
          });
          return;
        }

        setCriteria({
          course_id: courseId,
          no_of_cbt: data.no_of_cbt ?? 10,
          no_of_code_submission: data.no_of_code_submission ?? 10,
          total_pass_mark_cbt: data.total_pass_mark_cbt ?? 500,
          total_pass_mark_code: data.total_pass_mark_code ?? 500,
          exists: !!data.exists,
        });
      } catch (e) {
        console.error(e);
        toast({
          title: "Error",
          description: "Failed to fetch course criteria.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCriteria();
  }, [open, courseId, toast]);

  const setField = (field: keyof Criteria, val: string) => {
    const n = val === "" ? 0 : Number(val);
    setCriteria((p) => ({ ...p, [field]: Number.isFinite(n) ? n : 0 }));
  };

  const handleSave = async () => {
    if (!courseId) return;

    setSaving(true);
    try {
      const payload = {
        no_of_cbt: criteria.no_of_cbt,
        no_of_code_submission: criteria.no_of_code_submission,
        total_pass_mark_cbt: criteria.total_pass_mark_cbt,
        total_pass_mark_code: criteria.total_pass_mark_code,
      };

      const res = await fetch(`/api/admin/courses/${courseId}/pass-criteria`, {
        method: "POST", // upsert
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        toast({
          title: "Error",
          description: data.detail || "Failed to save criteria.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Saved",
        description: `Pass criteria saved for ${courseName || "course"}.`,
      });

      onOpenChange(false);
    } catch (e) {
      console.error(e);
      toast({
        title: "Error",
        description: "Failed to save criteria.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Course Pass Criteria</DialogTitle>
          <DialogDescription>
            Set CBT and Code Submission requirements for{" "}
            <span className="font-medium">{courseName || "this course"}</span>.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <label className="text-sm text-muted-foreground">No of CBT</label>
              <Input
                type="number"
                min={0}
                value={criteria.no_of_cbt}
                onChange={(e) => setField("no_of_cbt", e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <label className="text-sm text-muted-foreground">
                No of Code Submissions
              </label>
              <Input
                type="number"
                min={0}
                value={criteria.no_of_code_submission}
                onChange={(e) =>
                  setField("no_of_code_submission", e.target.value)
                }
              />
            </div>

            <div className="grid gap-2">
              <label className="text-sm text-muted-foreground">
                Total Pass Mark (CBT)
              </label>
              <Input
                type="number"
                min={0}
                value={criteria.total_pass_mark_cbt}
                onChange={(e) => setField("total_pass_mark_cbt", e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <label className="text-sm text-muted-foreground">
                Total Pass Mark (Code)
              </label>
              <Input
                type="number"
                min={0}
                value={criteria.total_pass_mark_code}
                onChange={(e) =>
                  setField("total_pass_mark_code", e.target.value)
                }
              />
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving || loading || !courseId}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Criteria"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
