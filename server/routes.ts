import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { setupAuth, registerAuthRoutes } from "./replit_integrations/auth";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Setup Auth FIRST
  await setupAuth(app);
  registerAuthRoutes(app);

  // === MEDICINES ===
  app.get(api.medicines.list.path, async (req, res) => {
    const { search, lowStock, expiring } = req.query;
    const medicines = await storage.getMedicines(
      search as string, 
      lowStock === 'true', 
      expiring === 'true'
    );
    res.json(medicines);
  });

  app.get(api.medicines.get.path, async (req, res) => {
    const medicine = await storage.getMedicine(Number(req.params.id));
    if (!medicine) return res.status(404).json({ message: "Medicine not found" });
    res.json(medicine);
  });

  app.post(api.medicines.create.path, async (req, res) => {
    try {
      const input = api.medicines.create.input.parse(req.body);
      const medicine = await storage.createMedicine(input);
      res.status(201).json(medicine);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.put(api.medicines.update.path, async (req, res) => {
    const updated = await storage.updateMedicine(Number(req.params.id), req.body);
    if (!updated) return res.status(404).json({ message: "Medicine not found" });
    res.json(updated);
  });

  app.delete(api.medicines.delete.path, async (req, res) => {
    await storage.deleteMedicine(Number(req.params.id));
    res.status(204).send();
  });

  // === SUPPLIERS ===
  app.get(api.suppliers.list.path, async (req, res) => {
    const suppliers = await storage.getSuppliers();
    res.json(suppliers);
  });

  app.post(api.suppliers.create.path, async (req, res) => {
    const supplier = await storage.createSupplier(req.body);
    res.status(201).json(supplier);
  });

  // === CUSTOMERS ===
  app.get(api.customers.list.path, async (req, res) => {
    const customers = await storage.getCustomers(req.query.search as string);
    res.json(customers);
  });

  // === INVOICES ===
  app.post(api.invoices.create.path, async (req, res) => {
    try {
      const input = api.invoices.create.input.parse(req.body);
      
      // 1. Find or Create Customer
      let customer = await storage.getCustomerByMobile(input.customerMobile);
      if (!customer) {
        customer = await storage.createCustomer({
          name: input.customerName,
          mobileNumber: input.customerMobile,
          address: input.customerAddress,
        });
      }

      // 2. Calculate Totals
      let subtotal = 0;
      let gstTotal = 0;
      const invoiceItemsData = [];

      for (const item of input.items) {
        const medicine = await storage.getMedicine(item.medicineId);
        if (!medicine) throw new Error(`Medicine ${item.medicineId} not found`);
        if (medicine.stockQuantity < item.quantity) {
          return res.status(400).json({ message: `Insufficient stock for ${medicine.name}` });
        }

        const rate = Number(medicine.sellingPrice);
        const itemTotal = rate * item.quantity;
        const itemGst = (itemTotal * medicine.gstPercentage) / 100;
        
        subtotal += itemTotal;
        gstTotal += itemGst;

        invoiceItemsData.push({
          medicineId: medicine.id,
          quantity: item.quantity,
          rate: rate.toString(),
          gstAmount: itemGst.toString(),
          totalAmount: (itemTotal + itemGst).toString(),
          batchNumber: medicine.batchNumber,
          expiryDate: medicine.expiryDate,
        });
      }

      const grandTotal = subtotal + gstTotal - (input.discount || 0);

      // 3. Create Invoice
      const invoice = await storage.createInvoice({
        invoiceNumber: `INV-${Date.now()}`,
        customerId: customer.id,
        subtotal: subtotal.toString(),
        gstTotal: gstTotal.toString(),
        discount: (input.discount || 0).toString(),
        grandTotal: grandTotal.toString(),
        paymentMode: input.paymentMode || 'Cash',
      }, invoiceItemsData);

      res.status(201).json(invoice);

    } catch (err) {
      console.error(err);
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  app.get(api.invoices.list.path, async (req, res) => {
    const invoices = await storage.getInvoices();
    res.json(invoices);
  });

  app.get(api.invoices.get.path, async (req, res) => {
    const invoice = await storage.getInvoice(Number(req.params.id));
    if (!invoice) return res.status(404).json({ message: "Invoice not found" });
    res.json(invoice);
  });

  // === STATS ===
  app.get(api.stats.get.path, async (req, res) => {
    const stats = await storage.getDashboardStats();
    res.json(stats);
  });

  // Seed Data
  if (process.env.NODE_ENV !== "production") {
    await seedDatabase();
  }

  return httpServer;
}

async function seedDatabase() {
  const suppliers = await storage.getSuppliers();
  if (suppliers.length === 0) {
    const supplier = await storage.createSupplier({
      name: "MediPharma Distributors",
      contactNumber: "9876543210",
      address: "123 Pharma Road, New Delhi",
      gstNumber: "07AAAAA0000A1Z5",
    });

    await storage.createMedicine({
      name: "Paracetamol 500mg",
      category: "Tablet",
      batchNumber: "B123",
      expiryDate: "2025-12-31",
      purchasePrice: "10.00",
      sellingPrice: "20.00",
      gstPercentage: 12,
      stockQuantity: 100,
      minStockLevel: 20,
      supplierId: supplier.id,
    });

    await storage.createMedicine({
      name: "Cough Syrup 100ml",
      category: "Syrup",
      batchNumber: "S456",
      expiryDate: "2024-10-15",
      purchasePrice: "45.00",
      sellingPrice: "85.00",
      gstPercentage: 18,
      stockQuantity: 5, // Low stock test
      minStockLevel: 10,
      supplierId: supplier.id,
    });

    await storage.createMedicine({
      name: "Vitamin C",
      category: "Tablet",
      batchNumber: "V789",
      expiryDate: "2024-03-01", // Expiring soon test
      purchasePrice: "150.00",
      sellingPrice: "250.00",
      gstPercentage: 12,
      stockQuantity: 50,
      minStockLevel: 10,
      supplierId: supplier.id,
    });
  }
}
