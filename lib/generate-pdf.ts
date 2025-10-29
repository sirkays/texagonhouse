// lib/generate-pdf.ts
import { format } from "date-fns";

interface Invoice {
  id: number;
  number: string;
  amount: string;
  currency: string;
  issued_at: string;
  due_at: string;
  status: "open" | "paid" | "void" | "uncollectible" | "active";
  meta: { generated_for: string; parent_profile_id: number };
}

export function generateInvoicePDF(invoice: Invoice): void {
  const printWindow = window.open("", "_blank");
  if (!printWindow) return;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Invoice ${invoice.number}</title>
  <style>
    body { font-family: system-ui, sans-serif; padding: 2rem; color: #1f2937; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
    .header h1 { margin: 0; font-size: 1.75rem; }
    .badge { padding: 0.25rem 0.5rem; border-radius: 0.375rem; font-weight: 600; font-size: 0.75rem; }
    .badge-paid { background: #ecfdf5; color: #047857; border: 1px solid #86efac; }
    .badge-open { background: #fef3c7; color: #92400e; border: 1px solid #fbbf24; }
    .section { margin-bottom: 1.5rem; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .label { color: #6b7280; font-size: 0.875rem; margin-bottom: 0.25rem; }
    .value { font-weight: 600; }
    .amount { font-size: 1.5rem; font-weight: bold; }
    hr { border: none; border-top: 1px solid #e5e7eb; margin: 1.5rem 0; }
    @media print {
      body { padding: 1rem; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Invoice ${invoice.number}</h1>
    <span class="badge badge-${invoice.status === 'paid' ? 'paid' : 'open'}">
      ${invoice.status.toUpperCase()}
    </span>
  </div>

  <div class="grid section">
    <div>
      <div class="label">Issued Date</div>
      <div class="value">${format(new Date(invoice.issued_at), "MMM dd, yyyy")}</div>
    </div>
    <div>
      <div class="label">Due Date</div>
      <div class="value">${format(new Date(invoice.due_at), "MMM dd, yyyy")}</div>
    </div>
    <div>
      <div class="label">Profile ID</div>
      <div class="value">${invoice.meta.parent_profile_id}</div>
    </div>
    <div>
      <div class="label">Amount</div>
      <div class="amount">${invoice.currency} ${Number(invoice.amount).toLocaleString()}</div>
    </div>
  </div>

  <hr>

  <p style="text-align: center; color: #9ca3af; font-size: 0.875rem;">
    This is an auto-generated invoice. Contact support if you have questions.
  </p>

  <div class="no-print" style="margin-top: 3rem; text-align: center;">
    <button onclick="window.print()" style="padding: 0.5rem 1rem; background: #3b82f6; color: white; border: none; border-radius: 0.375rem; cursor: pointer;">
      Print / Save as PDF
    </button>
  </div>
</body>
</html>
  `.trim();

  printWindow.document.write(html);
  printWindow.document.close();
}