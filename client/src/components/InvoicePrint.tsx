import React, { forwardRef } from 'react';
import { format } from 'date-fns';
import { InvoiceWithDetails } from '@shared/schema';

type InvoicePrintProps = {
  invoice: InvoiceWithDetails;
};

export const InvoicePrint = forwardRef<HTMLDivElement, InvoicePrintProps>(({ invoice }, ref) => {
  return (
    <div ref={ref} className="p-8 bg-white text-black print-only font-serif">
      {/* Header */}
      <div className="border-b-2 border-gray-800 pb-4 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold text-emerald-800 mb-1 font-display">Mangala Medicos</h1>
            <p className="text-sm text-gray-600">D-9, Chanakya Place, Part-I, 40 Feet Road</p>
            <p className="text-sm text-gray-600">New Delhi - 110059</p>
            <p className="text-sm text-gray-600 mt-1">Phone: 8882297409</p>
            <p className="text-sm text-gray-600">Email: manglamedicos07@gmail.com</p>
          </div>
          <div className="text-right">
            <h2 className="text-2xl font-bold text-gray-400">INVOICE</h2>
            <p className="font-mono text-lg mt-2 font-bold">#{invoice.invoiceNumber}</p>
            <p className="text-sm text-gray-500">{format(new Date(invoice.date || new Date()), "dd MMM yyyy, hh:mm a")}</p>
          </div>
        </div>
      </div>

      {/* Customer Details */}
      <div className="mb-8 p-4 bg-gray-50 rounded-lg border border-gray-100">
        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-2">Bill To</h3>
        <p className="font-bold text-lg">{invoice.customer?.name || "Guest Customer"}</p>
        <p className="text-gray-600">{invoice.customer?.mobileNumber}</p>
        {invoice.customer?.address && <p className="text-gray-600">{invoice.customer.address}</p>}
      </div>

      {/* Items Table */}
      <table className="w-full mb-8">
        <thead>
          <tr className="border-b-2 border-gray-200">
            <th className="text-left py-2 font-bold text-gray-600 text-sm w-[40%]">Item</th>
            <th className="text-left py-2 font-bold text-gray-600 text-sm">Batch</th>
            <th className="text-left py-2 font-bold text-gray-600 text-sm">Exp</th>
            <th className="text-center py-2 font-bold text-gray-600 text-sm">Qty</th>
            <th className="text-right py-2 font-bold text-gray-600 text-sm">Price</th>
            <th className="text-right py-2 font-bold text-gray-600 text-sm">Total</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items?.map((item, index) => (
            <tr key={index} className="border-b border-gray-100">
              <td className="py-3 text-sm">
                <span className="font-semibold block">{item.medicine?.name}</span>
                <span className="text-xs text-gray-500">{item.medicine?.category}</span>
              </td>
              <td className="py-3 text-sm font-mono text-gray-600">{item.batchNumber}</td>
              <td className="py-3 text-sm font-mono text-gray-600">{item.expiryDate ? format(new Date(item.expiryDate), "MM/yy") : ""}</td>
              <td className="py-3 text-center text-sm">{item.quantity}</td>
              <td className="py-3 text-right text-sm">₹{item.rate}</td>
              <td className="py-3 text-right text-sm font-medium">₹{item.totalAmount}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div className="flex justify-end">
        <div className="w-64 space-y-2">
          <div className="flex justify-between text-gray-600">
            <span>Subtotal</span>
            <span>₹{invoice.subtotal}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>GST Amount</span>
            <span>₹{invoice.gstTotal}</span>
          </div>
          {Number(invoice.discount) > 0 && (
            <div className="flex justify-between text-emerald-600">
              <span>Discount</span>
              <span>-₹{invoice.discount}</span>
            </div>
          )}
          <div className="flex justify-between border-t-2 border-gray-800 pt-2 text-xl font-bold">
            <span>Total</span>
            <span>₹{invoice.grandTotal}</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-12 text-center border-t border-gray-200 pt-6">
        <p className="text-lg font-serif italic text-emerald-800">"Thank You – Get Well Soon!"</p>
        <p className="text-xs text-gray-400 mt-2">Terms: Goods once sold will not be taken back.</p>
      </div>
    </div>
  );
});

InvoicePrint.displayName = 'InvoicePrint';
