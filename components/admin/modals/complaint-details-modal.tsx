"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type ComplaintListItem = {
  id: string;
  code: string;
  title: string;
  status: string;
  priority: string;
  created_at: string | null;
  responses_count: number;
  transaction_id: string | null;
};

type ComplaintResponse = {
  id: string;
  role: string;
  author_name: string;
  message: string;
  created_at: string | null;
};

type ComplaintDetail = {
  id: string;
  code: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  created_at: string | null;
  transaction_id: string | null;
  responses: ComplaintResponse[];
};

export function ComplaintDetailsModal({
  open,
  onOpenChange,
  complaint,
  onChanged,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  complaint: ComplaintListItem | null;
  onChanged: () => void;
}) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [detail, setDetail] = useState<ComplaintDetail | null>(null);

  const [statusValue, setStatusValue] = useState<string>("open");
  const [priorityValue, setPriorityValue] = useState<string>("medium");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (open && complaint?.id) {
      fetchDetail(complaint.id);
    }
    if (!open) {
      setDetail(null);
      setMessage("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, complaint?.id]);

  const fetchDetail = async (id: string) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/complaints/${id}`);
      if (!res.ok) throw new Error("Failed to load complaint");
      const data: ComplaintDetail = await res.json();
      setDetail(data);
      setStatusValue(data.status);
      setPriorityValue(data.priority);
    } catch {
      toast({
        title: "Error",
        description: "Failed to load complaint details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const saveMeta = async () => {
    if (!detail?.id) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/complaints/${detail.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: statusValue,
          priority: priorityValue,
        }),
      });
      if (!res.ok) throw new Error("Failed");
      const updated: ComplaintDetail = await res.json();
      setDetail(updated);
      toast({ title: "Saved", description: "Complaint updated" });
      onChanged();
    } catch {
      toast({
        title: "Error",
        description: "Failed to update complaint",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const sendResponse = async () => {
    if (!detail?.id) return;
    const msg = message.trim();
    if (!msg) return;

    try {
      setLoading(true);
      const res = await fetch(`/api/admin/complaints/${detail.id}/responses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg }),
      });
      if (!res.ok) throw new Error("Failed");
      setMessage("");
      await fetchDetail(detail.id);
      toast({ title: "Sent", description: "Response added" });
      onChanged();
    } catch {
      toast({
        title: "Error",
        description: "Failed to send response",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!complaint) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-[90vw] sm:max-w-xl lg:max-w-3xl overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="font-mono">{detail?.code || complaint.code}</span>
            <Badge className="capitalize" variant="secondary">
              {detail?.status || complaint.status}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            {detail?.created_at ? `Created: ${formatDate(detail.created_at)}` : ""}
          </DialogDescription>
        </DialogHeader>

        {loading && !detail ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Summary */}
            <div className="space-y-1">
              <div className="text-lg font-semibold">{detail?.title || complaint.title}</div>
              {detail?.transaction_id ? (
                <div className="text-sm text-muted-foreground">
                  Transaction: <span className="font-mono">{detail.transaction_id}</span>
                </div>
              ) : null}
            </div>

            {detail?.description ? (
              <>
                <Separator />
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Description</div>
                  <div className="whitespace-pre-wrap text-sm">{detail.description}</div>
                </div>
              </>
            ) : null}

            <Separator />

            {/* Status/Priority controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Status</div>
                <Input
                  value={statusValue}
                  onChange={(e) => setStatusValue(e.target.value)}
                  placeholder="open | in_progress | resolved | closed"
                />
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Priority</div>
                <Input
                  value={priorityValue}
                  onChange={(e) => setPriorityValue(e.target.value)}
                  placeholder="low | medium | high"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={saveMeta} disabled={loading}>
                Save
              </Button>
            </div>

            <Separator />

            {/* Conversation */}
            <div className="space-y-3">
              <div className="font-semibold">Conversation</div>

              <div className="space-y-3">
                {(detail?.responses || []).length === 0 ? (
                  <div className="text-sm text-muted-foreground">No responses yet.</div>
                ) : (
                  detail!.responses.map((r) => (
                    <div key={r.id} className="p-3 rounded-lg border border-border">
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-sm font-medium">
                          {r.author_name || "Unknown"}
                          <span className="ml-2 text-xs text-muted-foreground capitalize">
                            ({r.role})
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {formatDate(r.created_at)}
                        </div>
                      </div>
                      <div className="text-sm mt-2 whitespace-pre-wrap">{r.message}</div>
                    </div>
                  ))
                )}
              </div>

              <Separator />

              {/* Reply box */}
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Add response</div>
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Write a response..."
                  className="min-h-[100px]"
                />
                <div className="flex justify-end">
                  <Button onClick={sendResponse} disabled={loading || !message.trim()}>
                    Send
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
