"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchStudentCertificates, type CertificateListItem } from "@/lib/certificates-api";
import { CertificateCard } from "@/components/student/certificate-card";
import { Button } from "@/components/ui/button";
import { useStudentTheme } from "@/components/student/useStudentTheme";

export default function StudentCertificatesPage() {
  const { theme } = useStudentTheme();
  const isAero = theme === "aero-premium";
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<CertificateListItem[]>([]);

  useEffect(() => {
    let mounted = true;

    (async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await fetchStudentCertificates({ limit: 200 });
        if (!mounted) return;
        setItems(data.results ?? []);
      } catch (e: any) {
        if (!mounted) return;
        setError(e?.message || "Failed to load certificates");
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const countText = useMemo(() => {
    if (loading) return "Loading…";
    return `${items.length} certificate${items.length === 1 ? "" : "s"}`;
  }, [items.length, loading]);

  return (
    <main className="min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            <h1 className={isAero 
              ? "text-2xl font-black bg-gradient-to-r from-slate-900 via-slate-800 to-[#EF7B55] bg-clip-text text-transparent dark:from-white dark:to-orange-200"
              : "text-2xl font-bold text-foreground"
            }>
              My Certificates
            </h1>
            <p className="text-muted-foreground mt-1 text-sm font-medium">{countText}</p>
          </div>

          <Button
            variant="outline"
            className={isAero
              ? "border-[#EF7B55] text-[#EF7B55] hover:bg-[#EF7B55] hover:text-white rounded-xl shadow-sm font-bold bg-white/60 backdrop-blur-sm transition-all duration-300"
              : "bg-transparent"
            }
            onClick={() => window.location.reload()}
          >
            Refresh
          </Button>
        </div>

        {error && (
          <div className="bg-card border border-border rounded-xl p-6 mb-6">
            <p className="font-semibold text-foreground mb-2">Couldn’t load certificates</p>
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="text-muted-foreground">Loading certificates…</div>
        ) : items.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-8 text-center">
            <p className="font-semibold text-foreground mb-2">No certificates yet</p>
            <p className="text-sm text-muted-foreground">
              Complete courses to earn certificates.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {items.map((c) => (
              <CertificateCard key={c.id} certificate={c} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
