// lib/certificate-service.ts
import { getSession } from "next-auth/react";

// [cite: 63-75] Define the signature structure from the docs
export interface DirectorSignature {
  name: string;
  title: string;
  signature_url: string;
}

export interface ApiSignatures {
  director_1?: DirectorSignature;
  director_2?: DirectorSignature;
}

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
  signatures?: ApiSignatures; // [cite: 89] Signatures are returned at the root
}

export async function fetchMyCertificates(studentId?: number): Promise<{ certificates: ApiCertificate[], signatures?: ApiSignatures }> {
  try {
    const query = studentId ? `?student_id=${studentId}` : "";
    
    // [cite: 12] Note the trailing slash requirement
    const res = await fetch(`/api/certificate/list/${query}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) {
      console.error("Failed to fetch certificates. Status:", res.status);
      return { certificates: [] };
    }

    const data: CertificateResponse = await res.json();
    return { 
      certificates: data.results || [], 
      signatures: data.signatures 
    };
  } catch (error) {
    console.error("Error fetching certificates:", error);
    return { certificates: [] };
  }
}

/**
 * Finds a specific certificate by ID.
 * Since the API doesn't support filtering by ID directly, we fetch list and find.
 */
export async function fetchCertificateById(certId: number) {
  const { certificates, signatures } = await fetchMyCertificates();
  const cert = certificates.find((c) => c.id === certId);
  return { certificate: cert, signatures };
}