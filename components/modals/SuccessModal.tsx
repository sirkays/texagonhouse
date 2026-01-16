"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  primaryText?: string;
  onPrimary?: () => void;
};

export function SuccessModal({
  open,
  onOpenChange,
  title = "Success",
  description = "Saved successfully.",
  primaryText = "Continue",
  onPrimary,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-6 w-6 text-green-600" />
            <DialogTitle>{title}</DialogTitle>
          </div>
          <DialogDescription className="pt-1">
            {description}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button
            onClick={() => {
              onOpenChange(false);
              onPrimary?.();
            }}
          >
            {primaryText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
