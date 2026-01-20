// texagonui/lib/certificates-api.ts
export type OrgSignature = {
  name: string;
  title: string;
  signature_url: string;
};

export type CertificateListItem = {
  id: number;
  number: string;
  status: "issued" | "revoked" | string;

  title: string; // e.g. "Certificate of Completion"
  description?: string;

  student_id: number;
  admission_no: string;
  student_name: string;

  enrollment_id: number;
  course_id: number;
  course_name: string;

  acquired_at: string; // ISO
  downloadable_at?: string | null; // ISO or null

  can_download: boolean;
  pdf_url?: string; // may be empty
};

export type CertificateListResponse = {
  student_id: number;
  admission_no: string;
  count: number;
  results: CertificateListItem[];
  signatures?: Record<string, OrgSignature>;
  server_time?: string;
};

// Use the Next.js route that proxies to Django:
const BASE = "/api/certificate/list";

export async function fetchStudentCertificates(params?: {
  course_id?: string | number;
  status?: string;
  limit?: number;
  student_id?: string | number; // only if staffish; for student can omit
  admission_no?: string;
}) {
  const qs = new URLSearchParams();

  if (params?.course_id != null) qs.set("course_id", String(params.course_id));
  if (params?.status) qs.set("status", params.status);
  if (params?.limit != null) qs.set("limit", String(params.limit));
  if (params?.student_id != null) qs.set("student_id", String(params.student_id));

  const url = `${BASE}${qs.toString() ? `?${qs.toString()}` : ""}`;

  const res = await fetch(url, {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(data?.error ?? "Failed to fetch certificates");
  }

  return data as CertificateListResponse;
}

export async function fetchCertificateById(id: string | number) {
  const qs = new URLSearchParams({ id: String(id), limit: "1" });

  const res = await fetch(`${BASE}?${qs.toString()}`, {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(data?.error ?? "Failed to fetch certificate");
  }

  const rawFirst = (data?.results?.[0] ?? null) as CertificateListItem | null;

  const first = rawFirst
    ? ({
        ...rawFirst,
        // prefer item.admission_no, fallback to top-level admission_no
        admission_no: rawFirst.admission_no ?? data?.admission_no ?? "",
      } as CertificateListItem)
    : null;

  return { raw: data as CertificateListResponse, certificate: first };
}

