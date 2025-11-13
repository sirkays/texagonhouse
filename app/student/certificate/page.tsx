"use client";

import {StudentListHeader} from "@/components/student/student-list-header";
import {CertificateCard} from "@/components/student/certificate-card";
import {mockStudents} from "@/lib/certificate-data";
import {ChevronRight} from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <StudentListHeader />

        {/* Students Grid */}
        <div className="grid grid-cols-1 gap-8">
          {mockStudents.map((student) => (
            <div
              key={student.id}
              className="bg-card border border-border rounded-2xl overflow-hidden">
              {/* Student Header */}
              <div className="bg-gradient-to-r from-primary/5 to-accent/5 p-6 border-b border-border">
                <div className="flex items-center gap-4">
                  <img
                    src={student.avatar || "/placeholder.svg"}
                    alt={student.name}
                    className="w-12 h-12 rounded-full ring-2 ring-primary/20"
                  />
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-foreground">
                      {student.name}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {student.email}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-accent bg-accent/10 px-4 py-2 rounded-full">
                    {student.certificates.length} Certificate
                    {student.certificates.length !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>

              {/* Certificates Grid */}
              <div className="p-6">
                {student.certificates.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {student.certificates.map((certificate) => (
                      <CertificateCard
                        key={certificate.id}
                        certificate={certificate}
                        student={student}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center">
                    <ChevronRight className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                    <p className="text-muted-foreground">No certificates yet</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
