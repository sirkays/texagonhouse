// lib/certificate-service.ts

export interface ApiCertificate {
  id: number;
  number: string;
  status: "issued" | "revoked";
  title: string;
  description: string;
  student_id: number;
  student_name: string;
  enrollment_id: number;
  course_id: number;
  course_name: string;
  acquired_at: string;
  downloadable_at: string;
  can_download: boolean;
  pdf_url: string;
}

export interface CertificateResponse {
  count: number;
  results: ApiCertificate[];
}

export async function fetchMyCertificates(studentId?: number): Promise<ApiCertificate[]> {
  try {
    // If studentId is provided, append it; otherwise leave query empty (defaults to self)
    const query = studentId ? `?student_id=${studentId}` : "";
    
    const res = await fetch(`/api/certificate/list${query}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) {
      // FIX: Use comma separation instead of backticks to avoid transpiler errors
      console.error("Failed to fetch certificates. Status:", res.status);
      return [];
    }

    const data: CertificateResponse = await res.json();
    return data.results || [];
  } catch (error) {
    console.error("Error fetching certificates:", error);
    return [];
  }
}