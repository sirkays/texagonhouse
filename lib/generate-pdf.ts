import { format } from "date-fns";
import { getBrandConfig } from "@/lib/brand";

type InvoiceStatus = "open" | "paid" | "void" | "uncollectible" | "active";
type InvoiceType = "tutor" | "subscription";

interface Invoice {
  id: number;
  number: string;
  amount: string;
  currency: string;
  issued_at: string | null;
  due_at: string | null;
  status: InvoiceStatus;

  // From your Django payload
  student_name?: string;
  invoice_type?: InvoiceType;
  invoice_type_object_id?: number | string | null;
  invoice_type_object_type?: string | null;

  created_at?: string | null;
  updated_at?: string | null;
  meta?: Record<string, any>;
}

const safeDate = (iso?: string | null) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return format(d, "MMM dd, yyyy");
};

const safeMoney = (currency: string, amount: string) => {
  const n = Number(amount);
  return `${currency} ${Number.isFinite(n) ? n.toLocaleString() : amount}`;
};

const statusLabel = (s: InvoiceStatus) => {
  switch (s) {
    case "paid":
      return "PAID";
    case "open":
      return "UNPAID";
    case "void":
      return "VOID";
    case "uncollectible":
      return "UNCOLLECTIBLE";
    case "active":
      return "ACTIVE";
    default:
      return String(s).toUpperCase();
  }
};

export function generateInvoicePDF(invoice: Invoice): void {
  const printWindow = window.open("", "_blank");
  if (!printWindow) return;

  const issued = safeDate(invoice.issued_at);
  const due = safeDate(invoice.due_at);

  const amount = safeMoney(invoice.currency, invoice.amount);
  const amountNumber = Number(invoice.amount);
  const prettyAmount = Number.isFinite(amountNumber)
    ? amountNumber.toLocaleString()
    : invoice.amount;

  const invType = invoice.invoice_type ?? "subscription";
  const lineItemLabel =
    invType === "tutor" ? "Tutor Service" : "Subscription";

  const objRef = invoice.number;

  const billedTo = invoice.student_name || "Student";

  const isPaid = invoice.status === "paid";

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Invoice ${invoice.number}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    :root{
      --bg: #ffffff;
      --text: #0f172a;
      --muted: #64748b;
      --border: #e2e8f0;
      --soft: #f8fafc;
      --accent: #2563eb;
      --accent-2: #0ea5e9;
      --success: #16a34a;
      --warn: #f59e0b;
      --danger: #ef4444;
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

    /* Header */
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
      font-size: 26px;
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
      border: 1px solid var(--border);
      background: var(--soft);
      color: var(--text);
      margin-top: 10px;
      gap:8px;
      justify-content:flex-end;
    }
    .dot{
      width: 8px; height: 8px; border-radius: 999px;
      background: var(--warn);
    }
    .pill.paid{ border-color: rgba(22,163,74,.25); background: rgba(22,163,74,.08); }
    .pill.paid .dot{ background: var(--success); }
    .pill.void{ border-color: rgba(239,68,68,.25); background: rgba(239,68,68,.08); }
    .pill.void .dot{ background: var(--danger); }

    /* Summary row */
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
      letter-spacing: .2px;
    }
    .amount-due .sub{
      color: var(--muted);
      font-size: 12px;
      margin-top: 6px;
    }

    /* Items table */
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

    /* Totals */
    .totals{
      display:flex;
      justify-content:flex-end;
      margin-top: 14px;
    }
    .totals .box{
      width: 320px;
      border:1px solid var(--border);
      border-radius: 14px;
      padding: 14px;
      background: #fff;
    }
    .totals .row{
      display:flex;
      justify-content:space-between;
      gap:10px;
      padding: 6px 0;
      font-size: 13px;
    }
    .totals .row strong{ font-weight: 800; }
    .totals .row.total{
      border-top: 1px solid var(--border);
      margin-top: 8px;
      padding-top: 10px;
      font-size: 14px;
    }

    /* Footer */
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
    .note{
      margin-top: 12px;
      border:1px solid var(--border);
      background: #fff;
      border-radius: 14px;
      padding: 12px 14px;
      font-size: 12px;
      color: var(--muted);
    }

    /* PAID stamp */
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
      display: ${isPaid ? "inline-block" : "none"};
    }
    .wrap{ position: relative; }

    /* Print */
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
          <span>Billing / Invoicing</span>
        </div>
      </div>

      <div class="invoice-meta">
        <h1>INVOICE</h1>
        <div class="no">Invoice No: <strong>${invoice.number}</strong></div>
        <div class="pill ${isPaid ? "paid" : invoice.status === "void" ? "void" : ""}">
          <span class="dot"></span>
          ${statusLabel(invoice.status)}
        </div>
      </div>
    </div>

    <div class="summary">
      <div class="card">
        <div class="grid2">
          <div>
            <div class="k">Billed To</div>
            <div class="v">${billedTo}</div>
          </div>
          <div>
            <div class="k">Invoice Type</div>
            <div class="v" style="text-transform: capitalize;">${invType}</div>
          </div>
          <div>
            <div class="k">Issued</div>
            <div class="v">${issued || "—"}</div>
          </div>
          <div>
            <div class="k">Due</div>
            <div class="v">${due || "—"}</div>
          </div>
          <div>
            <div class="k">Reference</div>
            <div class="v muted">${objRef || "—"}</div>
          </div>
          <div>
            <div class="k">Status</div>
            <div class="v">${statusLabel(invoice.status)}</div>
          </div>
        </div>
      </div>

      <div class="card soft amount-due">
        <div>
          <div class="k">Amount Due</div>
          <div class="big">${invoice.currency} ${prettyAmount}</div>
          <div class="sub">${isPaid ? "Payment received" : "Please pay on or before the due date."}</div>
        </div>
        <div class="sub">Currency: <strong>${invoice.currency}</strong></div>
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
            <div style="font-weight: 800;">${lineItemLabel}</div>
            <div class="muted" style="margin-top: 4px;">
              ${objRef ? `Reference: ${objRef}` : "Service charge for the selected plan/service."}
            </div>
          </td>
          <td class="right">1</td>
          <td class="right">${invoice.currency}</td>
          <td class="right" style="font-weight: 800;">${amount}</td>
        </tr>
      </tbody>
    </table>

    <!--<div class="totals">
      <div class="box">
        <div class="row"><span class="muted">Subtotal</span><span>${amount}</span></div>
        <div class="row"><span class="muted">Discount</span><span>${invoice.currency} 0</span></div>
        <div class="row"><span class="muted">Tax</span><span>${invoice.currency} 0</span></div>
        <div class="row total"><strong>Total</strong><strong>${amount}</strong></div>
      </div>
    </div>-->

    <div class="note">
      <strong>Note:</strong> This invoice is auto-generated. If you have questions or need support, contact your administrator/support team.
    </div>

    <div class="footer">
      <div>Generated on ${format(new Date(), "MMM dd, yyyy • hh:mm a")}</div>
      <div>Invoice ${invoice.number}</div>
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
