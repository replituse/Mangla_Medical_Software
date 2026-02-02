import { db } from "./db";
import {
  medicines,
  suppliers,
  customers,
  invoices,
  invoiceItems,
  users,
  type Medicine,
  type InsertMedicine,
  type Supplier,
  type InsertSupplier,
  type Customer,
  type InsertCustomer,
  type Invoice,
  type InsertInvoice,
  type InvoiceItem,
  type InsertInvoiceItem,
  type InvoiceWithDetails,
  type DashboardStats
} from "@shared/schema";
import { eq, like, desc, sql, and, lt, lte } from "drizzle-orm";

export interface IStorage {
  // Medicines
  getMedicines(search?: string, lowStock?: boolean, expiring?: boolean): Promise<Medicine[]>;
  getMedicine(id: number): Promise<Medicine | undefined>;
  createMedicine(medicine: InsertMedicine): Promise<Medicine>;
  updateMedicine(id: number, medicine: Partial<InsertMedicine>): Promise<Medicine | undefined>;
  deleteMedicine(id: number): Promise<void>;

  // Suppliers
  getSuppliers(): Promise<Supplier[]>;
  createSupplier(supplier: InsertSupplier): Promise<Supplier>;

  // Customers
  getCustomers(search?: string): Promise<Customer[]>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  getCustomerByMobile(mobile: string): Promise<Customer | undefined>;

  // Invoices
  createInvoice(invoice: InsertInvoice, items: InsertInvoiceItem[]): Promise<Invoice>;
  getInvoices(): Promise<Invoice[]>;
  getInvoice(id: number): Promise<InvoiceWithDetails | undefined>;

  // Stats
  getDashboardStats(): Promise<DashboardStats>;

  // Users
  upsertUser(user: any): Promise<any>;
}

export class DatabaseStorage implements IStorage {
  // Medicines
  async getMedicines(search?: string, lowStock?: boolean, expiring?: boolean): Promise<Medicine[]> {
    let conditions = [];

    if (search) {
      conditions.push(like(medicines.name, `%${search}%`));
    }

    if (lowStock) {
      conditions.push(lte(medicines.stockQuantity, medicines.minStockLevel));
    }

    if (expiring) {
      // Logic for expiring soon (e.g., within 30 days)
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      const dateStr = thirtyDaysFromNow.toISOString().split('T')[0];
      conditions.push(lte(medicines.expiryDate, dateStr));
    }

    if (conditions.length > 0) {
      return await db.select().from(medicines).where(and(...conditions));
    }

    return await db.select().from(medicines).orderBy(desc(medicines.createdAt));
  }

  async getMedicine(id: number): Promise<Medicine | undefined> {
    const [medicine] = await db.select().from(medicines).where(eq(medicines.id, id));
    return medicine;
  }

  async createMedicine(medicine: InsertMedicine): Promise<Medicine> {
    const [newMedicine] = await db.insert(medicines).values(medicine).returning();
    return newMedicine;
  }

  async updateMedicine(id: number, updates: Partial<InsertMedicine>): Promise<Medicine | undefined> {
    const [updated] = await db
      .update(medicines)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(medicines.id, id))
      .returning();
    return updated;
  }

  async deleteMedicine(id: number): Promise<void> {
    await db.delete(medicines).where(eq(medicines.id, id));
  }

  // Suppliers
  async getSuppliers(): Promise<Supplier[]> {
    return await db.select().from(suppliers);
  }

  async createSupplier(supplier: InsertSupplier): Promise<Supplier> {
    const [newSupplier] = await db.insert(suppliers).values(supplier).returning();
    return newSupplier;
  }

  // Customers
  async getCustomers(search?: string): Promise<Customer[]> {
    if (search) {
      return await db.select().from(customers).where(
        sql`name ILIKE ${`%${search}%`} OR mobile_number LIKE ${`%${search}%`}`
      );
    }
    return await db.select().from(customers);
  }

  async createCustomer(customer: InsertCustomer): Promise<Customer> {
    const [newCustomer] = await db.insert(customers).values(customer).returning();
    return newCustomer;
  }

  async getCustomerByMobile(mobile: string): Promise<Customer | undefined> {
    const [customer] = await db.select().from(customers).where(eq(customers.mobileNumber, mobile));
    return customer;
  }

  // Invoices
  async createInvoice(invoice: InsertInvoice, items: InsertInvoiceItem[]): Promise<Invoice> {
    return await db.transaction(async (tx) => {
      // 1. Create Invoice
      const [newInvoice] = await tx.insert(invoices).values(invoice).returning();

      // 2. Create Items & Update Stock
      for (const item of items) {
        await tx.insert(invoiceItems).values({
          ...item,
          invoiceId: newInvoice.id,
        });

        // Reduce stock
        await tx.execute(
          sql`UPDATE medicines SET stock_quantity = stock_quantity - ${item.quantity} WHERE id = ${item.medicineId}`
        );
      }

      return newInvoice;
    });
  }

  async getInvoices(): Promise<Invoice[]> {
    return await db.select().from(invoices).orderBy(desc(invoices.date));
  }

  async getInvoice(id: number): Promise<InvoiceWithDetails | undefined> {
    const [invoice] = await db.select().from(invoices).where(eq(invoices.id, id));
    if (!invoice) return undefined;

    const items = await db.query.invoiceItems.findMany({
      where: eq(invoiceItems.invoiceId, id),
      with: {
        medicine: true,
      },
    });

    const [customer] = invoice.customerId 
      ? await db.select().from(customers).where(eq(customers.id, invoice.customerId))
      : [null];

    return { ...invoice, items, customer: customer || null };
  }

  // Stats
  async getDashboardStats(): Promise<DashboardStats> {
    const [totalMedicines] = await db.select({ count: sql<number>`count(*)` }).from(medicines);
    
    // Low stock
    const [lowStock] = await db.select({ count: sql<number>`count(*)` })
      .from(medicines)
      .where(sql`stock_quantity <= min_stock_level`);
    
    // Expiring soon (30 days)
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    const dateStr = thirtyDaysFromNow.toISOString().split('T')[0];
    
    const [expiring] = await db.select({ count: sql<number>`count(*)` })
      .from(medicines)
      .where(lte(medicines.expiryDate, dateStr));

    // Today's Sales
    const today = new Date().toISOString().split('T')[0];
    const [sales] = await db.select({ total: sql<number>`sum(grand_total)` })
      .from(invoices)
      .where(sql`DATE(date) = ${today}`);

    const [totalCustomers] = await db.select({ count: sql<number>`count(*)` }).from(customers);

    return {
      totalMedicines: Number(totalMedicines.count),
      lowStockItems: Number(lowStock.count),
      expiringSoonItems: Number(expiring.count),
      todaysSales: Number(sales.total || 0),
      totalCustomers: Number(totalCustomers.count),
    };
  }

  async upsertUser(userData: any): Promise<any> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }
}

export const storage = new DatabaseStorage();
