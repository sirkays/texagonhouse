// app/student/certificate/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { CertificateCard } from "@/components/student/certificate-card";
import { fetchMyCertificates, ApiCertificate } from "@/lib/certificate-service";
import { Award, Search, Loader2, User } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function StudentCertificatesPage() {
  const { data: session } = useSession();
  const [certificates, setCertificates] = useState<ApiCertificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function loadCertificates() {
      // Call without ID to fetch "My Certificates"
      const data = await fetchMyCertificates();
      setCertificates(data);
      setLoading(false);
    }
    loadCertificates();
  }, []);

  // Simple client-side search filtering
  const filteredCertificates = certificates.filter((cert) =>
    cert.course_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Award className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                My Certificates
              </h1>
              <p className="text-muted-foreground text-sm">
                View and download your earned credentials
              </p>
            </div>
          </div>

          {/* User Profile Summary Card */}
          <div className="bg-card border border-border rounded-2xl p-6 mb-8 flex flex-col md:flex-row items-center gap-6 shadow-sm">
            <div className="relative">
              {session?.user?.image ? (
                <img
                  src={session.user.image}
                  alt={session.user.name || "User"}
                  className="w-20 h-20 rounded-full ring-4 ring-primary/10"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-primary/5 ring-4 ring-primary/10 flex items-center justify-center">
                  <User className="w-10 h-10 text-primary/40" />
                </div>
              )}
            </div>
            
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl font-bold text-foreground">
                {session?.user?.name || "Student"}
              </h2>
              <p className="text-muted-foreground">{session?.user?.email}</p>
            </div>

            <div className="flex items-center gap-4 bg-accent/5 px-6 py-3 rounded-xl border border-accent/10">
              <div className="text-center">
                <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">
                  Total Earned
                </p>
                <p className="text-3xl font-bold text-accent">
                  {certificates.length}
                </p>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative max-w-xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search by course name..."
              className="pl-10 py-6 text-base"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Certificates Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Loading your certificates...</p>
          </div>
        ) : filteredCertificates.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCertificates.map((cert) => (
              <CertificateCard key={cert.id} certificate={cert} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-card/50 rounded-2xl border border-border border-dashed">
            <div className="bg-muted/50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Award className="w-8 h-8 text-muted-foreground/50" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-1">
              No certificates found
            </h3>
            <p className="text-muted-foreground max-w-sm mx-auto">
              {searchQuery
                ? "No certificates match your search criteria."
                : "You haven't earned any certificates yet. Complete a course to get started!"}
            </p>
          </div>
        )}
      </div>
    </main>
  );
}