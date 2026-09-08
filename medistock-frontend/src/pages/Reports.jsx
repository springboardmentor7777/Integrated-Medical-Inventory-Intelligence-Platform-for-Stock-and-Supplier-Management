import { FileText, FileSpreadsheet, Download, CalendarClock, PackageMinus, Truck, Boxes } from "lucide-react";
import { useData } from "../context/DataContext";
import { expiryStatus, stockStatus } from "../utils/format";

const REPORTS = [
  { key: "inventory", title: "Inventory summary", desc: "Full medicine list with stock levels and value.", icon: Boxes },
  { key: "expiry", title: "Expiry report", desc: "Batches expiring within 45 days, with days remaining.", icon: CalendarClock },
  { key: "lowstock", title: "Low-stock report", desc: "Medicines at or below their reorder level.", icon: PackageMinus },
  { key: "supplier", title: "Supplier performance", desc: "On-time delivery rate and order history by supplier.", icon: Truck },
];

export default function Reports() {
  const { medicines, suppliers } = useData();

  const download = (key, format) => {
    const rows = buildRows(key, medicines, suppliers);
    const content = toCsv(rows);
    const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `medistock-${key}-report.${format === "excel" ? "csv" : "csv"}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-display text-base font-semibold text-ink">Reports &amp; data export</h2>
        <p className="text-sm text-muted">
          Generate a report from current inventory data. PDF export will call the backend report service once connected.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {REPORTS.map((r) => (
          <div key={r.key} className="rounded-lg border border-line bg-surface p-4 shadow-card">
            <span className="grid h-9 w-9 place-items-center rounded bg-primary-light text-primary">
              <r.icon size={17} />
            </span>
            <h3 className="mt-3 font-display text-sm font-semibold text-ink">{r.title}</h3>
            <p className="mt-1 text-xs text-muted">{r.desc}</p>
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => download(r.key, "excel")}
                className="focus-ring flex items-center gap-1.5 rounded border border-line px-3 py-1.5 text-xs font-medium text-ink hover:bg-bg"
              >
                <FileSpreadsheet size={13} /> Excel (.csv)
              </button>
              <button
                onClick={() => alert("PDF export requires the Spring Boot report service — wire this up to /api/reports.")}
                className="focus-ring flex items-center gap-1.5 rounded border border-line px-3 py-1.5 text-xs font-medium text-ink hover:bg-bg"
              >
                <FileText size={13} /> PDF
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 rounded-lg border border-dashed border-line bg-surface px-4 py-3 text-xs text-muted">
        <Download size={14} />
        Excel exports download as CSV from live in-app data. Swap in the Spring Boot{" "}
        <code className="rounded bg-bg px-1 py-0.5 font-mono">/api/reports</code> endpoint for PDF generation and
        server-side Excel formatting.
      </div>
    </div>
  );
}

function buildRows(key, medicines, suppliers) {
  const supplierName = (id) => suppliers.find((s) => s.id === id)?.name || id;

  if (key === "inventory") {
    return [
      ["ID", "Name", "Batch", "Category", "Supplier", "Quantity", "Price"],
      ...medicines.map((m) => [m.id, m.name, m.batchNumber, m.category, supplierName(m.supplierId), m.quantity, m.price]),
    ];
  }
  if (key === "expiry") {
    return [
      ["ID", "Name", "Batch", "Expiry date", "Days remaining", "Status"],
      ...medicines.map((m) => {
        const s = expiryStatus(m.expiryDate);
        return [m.id, m.name, m.batchNumber, m.expiryDate, s.days, s.key];
      }),
    ];
  }
  if (key === "lowstock") {
    return [
      ["ID", "Name", "Quantity", "Reorder level", "Status"],
      ...medicines
        .filter((m) => stockStatus(m.quantity, m.reorderLevel).key !== "ok")
        .map((m) => [m.id, m.name, m.quantity, m.reorderLevel, stockStatus(m.quantity, m.reorderLevel).label]),
    ];
  }
  return [
    ["ID", "Name", "Contact", "Email", "On-time rate", "Last order"],
    ...suppliers.map((s) => [s.id, s.name, s.contact, s.email, `${s.performance}%`, s.lastOrder]),
  ];
}

function toCsv(rows) {
  return rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
}
