import { format } from "date-fns";
import { type InvoiceWithDetails } from "@shared/schema";
import { forwardRef } from "react";

interface InvoiceTemplateProps {
  invoice: InvoiceWithDetails;
}

export const InvoiceTemplate = forwardRef<HTMLDivElement, InvoiceTemplateProps>(
  ({ invoice }, ref) => {
    const subtotal = Number(invoice.subtotal);
    const gstTotal = Number(invoice.gstTotal);
    const discount = Number(invoice.discount || 0);
    const grandTotal = Number(invoice.grandTotal);

    return (
      <div ref={ref} className="p-8 bg-white text-slate-900 min-h-[297mm] w-full max-w-[210mm] mx-auto font-sans print:p-4">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-emerald-700">Mangala Medicos</h1>
          <p className="text-sm text-slate-500 mt-1 max-w-xs">
            D-9, Chanakya Place, Part-I, 40 Feet Road<br />
            New Delhi - 110059
          </p>
          <p className="text-sm text-slate-500">Phone: 8882297409</p>
          <p className="text-sm text-slate-500">Email: manglamedicos07@gmail.com</p>
        </div>
        <div className="text-right">
          <h2 className="text-xl font-bold text-slate-400 uppercase tracking-wider">Invoice</h2>
          <p className="text-lg font-bold mt-2">#{invoice.invoiceNumber}</p>
          <p className="text-sm text-slate-500">
            {format(new Date(invoice.date || new Date()), "dd MMM yyyy, hh:mm a")}
          </p>
        </div>
      </div>

      <div className="border-t border-slate-200 pt-8 mb-8">
        <div className="bg-slate-50 p-4 rounded-lg">
          <p className="text-xs font-bold text-slate-400 uppercase mb-2">Bill To</p>
          <p className="text-lg font-bold">{invoice.customerName || invoice.customer?.name || "Walk-in Customer"}</p>
          <p className="text-sm text-slate-500">{invoice.customer?.mobileNumber}</p>
        </div>
      </div>

      {/* Items Table */}
      <div className="mb-8">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-slate-200 text-xs font-bold text-slate-400 uppercase">
              <th className="py-3">Item</th>
              <th className="py-3">Batch</th>
              <th className="py-3">Exp</th>
              <th className="py-3 text-right">Qty</th>
              <th className="py-3 text-right">Price</th>
              <th className="py-3 text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {invoice.items.map((item, idx) => (
              <tr key={idx} className="text-sm">
                <td className="py-4">
                  <p className="font-bold">{item.medicine.name}</p>
                  <p className="text-xs text-slate-400">{item.medicine.category}</p>
                </td>
                <td className="py-4 text-xs font-mono">{item.batchNumber}</td>
                <td className="py-4 text-xs">{format(new Date(item.expiryDate), "MM/yy")}</td>
                <td className="py-4 text-right">{item.quantity}</td>
                <td className="py-4 text-right">₹{Number(item.rate).toFixed(2)}</td>
                <td className="py-4 text-right font-medium">₹{Number(item.totalAmount).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="flex justify-end border-t border-slate-200 pt-8">
        <div className="w-64 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Subtotal</span>
            <span className="font-medium">₹{subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">GST Amount</span>
            <span className="font-medium">₹{gstTotal.toFixed(2)}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-sm text-emerald-600">
              <span>Discount</span>
              <span>-₹{discount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between items-center pt-3 border-t border-slate-200">
            <span className="text-lg font-bold">Total</span>
            <span className="text-2xl font-bold text-emerald-700">₹{grandTotal.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-24 text-center">
        <p className="text-emerald-700 font-medium italic">"Thank You – Get Well Soon!"</p>
      </div>
    </div>
    );
  }
);
