import { format } from "date-fns";
import { getBrandConfig } from "@/lib/brand";

export interface PaymentReceipt {
  id: string;
  date: string;
  description: string;
  amount: string; // NGN ...
  method: string;
  status: string; // Completed, Paid, Pending, Failed
  invoiceType?: string; // subscription, store, tutor
  childName?: string;
  childAdmissionNo?: string;
}

const safeDate = (iso?: string | null) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return format(d, "MMM dd, yyyy • hh:mm a");
};

const invoiceTypeLabel = (type?: string) => {
  switch ((type || "").toLowerCase()) {
    case "subscription": return "Subscription Payment";
    case "store": return "Store Purchase";
    case "tutor": return "Tutor Service";
    default: return "Payment";
  }
};

const invoiceTypeThankYou = (type?: string) => {
  switch ((type || "").toLowerCase()) {
    case "subscription": return "Thank you for your subscription!";
    case "store": return "Thank you for your purchase!";
    case "tutor": return "Thank you for booking a tutoring session!";
    default: return "Thank you for your payment!";
  }
};

export function generateReceiptPDF(receipt: PaymentReceipt): void {
  const printWindow = window.open("", "_blank");
  if (!printWindow) return;

  const isCompleted = ["completed", "paid", "success", "successful"].includes(receipt.status.toLowerCase());
  const isFailed = ["failed", "failure", "cancelled", "canceled"].includes(receipt.status.toLowerCase());

  const statusColor = isCompleted ? "#16a34a" : (isFailed ? "#dc2626" : "#ea580c");
  const statusLabel = isCompleted ? "PAID" : (isFailed ? "FAILED" : receipt.status.toUpperCase());
  const statusBg = isCompleted ? "rgba(22,163,74,.08)" : (isFailed ? "rgba(220,38,38,.08)" : "rgba(245,158,11,.08)");
  const statusBorder = isCompleted ? "rgba(22,163,74,.25)" : (isFailed ? "rgba(220,38,38,.25)" : "rgba(245,158,11,.25)");

  const typeLabel = invoiceTypeLabel(receipt.invoiceType);
  const thankYouMsg = invoiceTypeThankYou(receipt.invoiceType);
  const dateFormatted = safeDate(receipt.date) || receipt.date;
  const amountClean = receipt.amount.replace(/[₦,]/g, "").trim();
  const amountNum = Number(amountClean);
  const prettyAmount = Number.isFinite(amountNum) ? amountNum.toLocaleString() : amountClean;

  const childInfo = receipt.invoiceType === "subscription" && receipt.childName
    ? `<div><div class="k">Student</div><div class="v">${receipt.childName}${receipt.childAdmissionNo ? ` (${receipt.childAdmissionNo})` : ""}</div></div>`
    : "";

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Receipt ${receipt.id}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    :root{
      --bg: #ffffff;
      --text: #0f172a;
      --muted: #64748b;
      --border: #e2e8f0;
      --soft: #f8fafc;
      --accent: #2563eb;
      --success: #16a34a;
    }
    *{ box-sizing: border-box; }
    body{
      margin:0;
      background: var(--bg);
      color: var(--text);
      font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .page{
      width: 210mm;
      min-height: 297mm;
      padding: 18mm;
      margin: 0 auto;
    }
    .topbar{
      display:flex;
      align-items:flex-start;
      justify-content:space-between;
      gap:16px;
      margin-bottom: 18px;
    }
    .brand{
      display:flex;
      align-items:center;
      gap:12px;
    }
    .brand img{
      height: 44px;
      width: auto;
      object-fit: contain;
    }
    .brand .name{
      display:flex;
      flex-direction:column;
      line-height:1.1;
    }
    .brand .name strong{
      font-size: 14px;
      letter-spacing: .2px;
    }
    .brand .name span{
      font-size: 12px;
      color: var(--muted);
    }
    .invoice-meta{
      text-align:right;
    }
    .invoice-meta h1{
      margin:0;
      font-size: 22px;
      letter-spacing: .3px;
    }
    .invoice-meta .no{
      margin-top: 4px;
      color: var(--muted);
      font-size: 12px;
    }
    .pill{
      display:inline-flex;
      align-items:center;
      padding: 6px 10px;
      border-radius: 999px;
      font-weight: 700;
      font-size: 12px;
      letter-spacing: .6px;
      border: 1px solid ${statusBorder};
      background: ${statusBg};
      color: ${statusColor};
      margin-top: 10px;
      gap:8px;
      justify-content:flex-end;
    }
    .dot{
      width: 8px; height: 8px; border-radius: 999px;
      background: ${statusColor};
    }
    .summary{
      display:grid;
      grid-template-columns: 1.4fr 1fr;
      gap: 14px;
      margin: 18px 0 18px;
    }
    .card{
      border:1px solid var(--border);
      border-radius: 14px;
      padding: 14px;
      background: #fff;
    }
    .card.soft{ background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%); }
    .grid2{
      display:grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px 14px;
    }
    .k{
      color: var(--muted);
      font-size: 12px;
      margin-bottom: 4px;
    }
    .v{
      font-size: 13px;
      font-weight: 650;
    }
    .amount-due{
      display:flex;
      flex-direction:column;
      height:100%;
      justify-content:space-between;
    }
    .amount-due .big{
      font-size: 28px;
      font-weight: 800;
      color: ${statusColor};
      letter-spacing: .2px;
    }
    .amount-due .sub{
      color: var(--muted);
      font-size: 12px;
      margin-top: 6px;
    }
    table{
      width:100%;
      border-collapse: separate;
      border-spacing: 0;
      overflow:hidden;
      border-radius: 14px;
      border:1px solid var(--border);
    }
    thead th{
      text-align:left;
      font-size: 12px;
      color: var(--muted);
      background: #f8fafc;
      padding: 12px 12px;
      border-bottom: 1px solid var(--border);
    }
    tbody td{
      padding: 12px 12px;
      border-bottom: 1px solid var(--border);
      font-size: 13px;
      vertical-align: top;
    }
    tbody tr:last-child td{ border-bottom:none; }
    .right{ text-align:right; }
    .muted{ color: var(--muted); }
    .note{
      margin-top: 14px;
      border:1px solid var(--border);
      background: #fff;
      border-radius: 14px;
      padding: 12px 14px;
      font-size: 12px;
      color: var(--muted);
    }
    .footer{
      margin-top: 18px;
      padding-top: 14px;
      border-top: 1px dashed var(--border);
      color: var(--muted);
      font-size: 12px;
      display:flex;
      justify-content:space-between;
      gap:12px;
      flex-wrap: wrap;
    }
    .stamp{
      position: absolute;
      top: 28mm;
      left: 18mm;
      transform: rotate(-12deg);
      border: 3px solid rgba(22,163,74,.35);
      color: rgba(22,163,74,.75);
      padding: 10px 14px;
      border-radius: 12px;
      font-weight: 900;
      letter-spacing: 2px;
      font-size: 22px;
      display: ${isCompleted ? "inline-block" : "none"};
    }
    .wrap{ position: relative; }
    .no-print{ margin-top: 22px; display:flex; justify-content:center; }
    .btn{
      padding: 10px 14px;
      border-radius: 10px;
      border: none;
      background: var(--accent);
      color: white;
      font-weight: 700;
      cursor: pointer;
    }
    .btn:active{ transform: translateY(1px); }
    @media print{
      .page{ padding: 12mm; }
      .no-print{ display:none !important; }
    }
  </style>
</head>
<body>
  <div class="page wrap">
    <div class="stamp">PAID</div>

    <div class="topbar">
      <div class="brand">
        <img src="${getBrandConfig().logo}" alt="Logo" />
        <div class="name">
          <strong>${getBrandConfig().fullName}</strong>
          <span>Billing / Receipts</span>
        </div>
      </div>

      <div class="invoice-meta">
        <h1>PAYMENT RECEIPT</h1>
        <div class="no">Ref: <strong>${receipt.id}</strong></div>
        <div class="pill">
          <span class="dot"></span>
          ${statusLabel}
        </div>
      </div>
    </div>

    <div class="summary">
      <div class="card">
        <div class="grid2">
          <div>
            <div class="k">Payment Type</div>
            <div class="v">${typeLabel}</div>
          </div>
          <div>
            <div class="k">Transaction ID</div>
            <div class="v muted">${receipt.id}</div>
          </div>
          <div>
            <div class="k">Date &amp; Time</div>
            <div class="v">${dateFormatted || "—"}</div>
          </div>
          <div>
            <div class="k">Payment Method</div>
            <div class="v">${receipt.method || "Online"}</div>
          </div>
          <div>
            <div class="k">Status</div>
            <div class="v">${statusLabel}</div>
          </div>
          ${childInfo}
        </div>
      </div>

      <div class="card soft amount-due">
        <div>
          <div class="k">Amount Paid</div>
          <div class="big">NGN ${prettyAmount}</div>
          <div class="sub">${isCompleted ? "Payment received" : "Payment " + receipt.status.toLowerCase()}</div>
        </div>
        <div class="sub">Currency: <strong>NGN</strong></div>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th style="width: 55%;">Description</th>
          <th style="width: 15%;" class="right">Qty</th>
          <th style="width: 15%;" class="right">Unit</th>
          <th style="width: 15%;" class="right">Amount</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            <div style="font-weight: 800;">${typeLabel}</div>
            <div class="muted" style="margin-top: 4px;">Reference: ${receipt.id}</div>
          </td>
          <td class="right">1</td>
          <td class="right">NGN</td>
          <td class="right" style="font-weight: 800;">NGN ${prettyAmount}</td>
        </tr>
      </tbody>
    </table>

    <div class="note">
      <strong>Note:</strong> This receipt is auto-generated. If you have questions or need support, contact your administrator/support team.
    </div>

    <div class="footer">
      <div>${thankYouMsg}</div>
      <div>Generated on ${format(new Date(), "MMM dd, yyyy • hh:mm a")}</div>
    </div>

    <div class="no-print">
      <button class="btn" onclick="window.print()">Print / Save as PDF</button>
    </div>
  </div>
</body>
</html>
  `.trim();

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
}
