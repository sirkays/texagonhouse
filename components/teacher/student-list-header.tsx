// C:\Texagon\texagon\components\student\student-list-header.tsx
"use client";

import {Users, Search} from "lucide-react";
import {Input} from "@/components/ui/input";

export function StudentListHeader() {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-3 bg-primary/10 rounded-lg">
          <Users className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Student Certificates
          </h1>
          <p className="text-muted-foreground text-sm">
            Manage and preview student course completion certificates
          </p>
        </div>
      </div>

      <div className="relative mt-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          placeholder="Search students by name or email..."
          className="pl-10 py-6"
        />
      </div>
    </div>
  );
}
