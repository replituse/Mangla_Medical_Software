import { pgTable, text, serial, integer, boolean, timestamp, numeric, date, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Export Auth models (MANDATORY)
export * from "./models/auth";
import { users } from "./models/auth";

// === TABLE DEFINITIONS ===

export const medicines = pgTable("medicines", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(), // Tablet, Syrup, Injection, etc.
  batchNumber: text("batch_number").notNull(),
  expiryDate: date("expiry_date").notNull(),
  purchasePrice: numeric("purchase_price").notNull(),
  sellingPrice: numeric("selling_price").notNull(),
  gstPercentage: integer("gst_percentage").notNull(),
  stockQuantity: integer("stock_quantity").notNull(),
  minStockLevel: integer("min_stock_level").default(10),
  supplierId: integer("supplier_id"), // Relation to suppliers
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const suppliers = pgTable("suppliers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  contactNumber: text("contact_number").notNull(),
  address: text("address").notNull(),
  gstNumber: text("gst_number").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  mobileNumber: text("mobile_number").notNull().unique(),
  address: text("address"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const invoices = pgTable("invoices", {
  id: serial("id").primaryKey(),
  invoiceNumber: text("invoice_number").notNull().unique(),
  customerId: integer("customer_id").references(() => customers.id),
  date: timestamp("date").defaultNow(),
  subtotal: numeric("subtotal").notNull(),
  discount: numeric("discount").default("0"),
  gstTotal: numeric("gst_total").notNull(),
  grandTotal: numeric("grand_total").notNull(),
  paymentMode: text("payment_mode").default("Cash"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const invoiceItems = pgTable("invoice_items", {
  id: serial("id").primaryKey(),
  invoiceId: integer("invoice_id").notNull().references(() => invoices.id),
  medicineId: integer("medicine_id").notNull().references(() => medicines.id),
  quantity: integer("quantity").notNull(),
  rate: numeric("rate").notNull(), // Selling price at time of sale
  gstAmount: numeric("gst_amount").notNull(),
  totalAmount: numeric("total_amount").notNull(),
  batchNumber: text("batch_number").notNull(), // Snapshot
  expiryDate: date("expiry_date").notNull(), // Snapshot
});

// === RELATIONS ===

export const medicinesRelations = relations(medicines, ({ one }) => ({
  supplier: one(suppliers, {
    fields: [medicines.supplierId],
    references: [suppliers.id],
  }),
}));

export const suppliersRelations = relations(suppliers, ({ many }) => ({
  medicines: many(medicines),
}));

export const invoicesRelations = relations(invoices, ({ one, many }) => ({
  customer: one(customers, {
    fields: [invoices.customerId],
    references: [customers.id],
  }),
  items: many(invoiceItems),
}));

export const invoiceItemsRelations = relations(invoiceItems, ({ one }) => ({
  invoice: one(invoices, {
    fields: [invoiceItems.invoiceId],
    references: [invoices.id],
  }),
  medicine: one(medicines, {
    fields: [invoiceItems.medicineId],
    references: [medicines.id],
  }),
}));

// === ZOD SCHEMAS ===

export const insertMedicineSchema = createInsertSchema(medicines).omit({ id: true, createdAt: true, updatedAt: true });
export const insertSupplierSchema = createInsertSchema(suppliers).omit({ id: true, createdAt: true });
export const insertCustomerSchema = createInsertSchema(customers).omit({ id: true, createdAt: true });
export const insertInvoiceSchema = createInsertSchema(invoices).omit({ id: true, invoiceNumber: true, date: true, createdAt: true });
export const insertInvoiceItemSchema = createInsertSchema(invoiceItems).omit({ id: true, invoiceId: true });

// === EXPLICIT TYPES ===

export type Medicine = typeof medicines.$inferSelect;
export type InsertMedicine = z.infer<typeof insertMedicineSchema>;

export type Supplier = typeof suppliers.$inferSelect;
export type InsertSupplier = z.infer<typeof insertSupplierSchema>;

export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;

export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;

export type InvoiceItem = typeof invoiceItems.$inferSelect;
export type InsertInvoiceItem = z.infer<typeof insertInvoiceItemSchema>;

// Complex types for API
export type CreateInvoiceRequest = {
  customerName: string;
  customerMobile: string;
  customerAddress?: string;
  items: {
    medicineId: number;
    quantity: number;
  }[];
  discount?: number;
  paymentMode?: string;
};

export type InvoiceWithDetails = Invoice & {
  customer: Customer | null;
  items: (InvoiceItem & { medicine: Medicine })[];
};

export type DashboardStats = {
  totalMedicines: number;
  lowStockItems: number;
  expiringSoonItems: number;
  todaysSales: number;
  totalCustomers: number;
};
