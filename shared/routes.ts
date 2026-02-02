import { z } from "zod";
import {
  insertMedicineSchema,
  insertSupplierSchema,
  insertCustomerSchema,
  medicines,
  suppliers,
  customers,
  invoices,
} from "./schema";

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  medicines: {
    list: {
      method: "GET" as const,
      path: "/api/medicines",
      input: z.object({
        search: z.string().optional(),
        lowStock: z.boolean().optional(),
        expiring: z.boolean().optional(),
      }).optional(),
      responses: {
        200: z.array(z.custom<typeof medicines.$inferSelect>()),
      },
    },
    create: {
      method: "POST" as const,
      path: "/api/medicines",
      input: insertMedicineSchema,
      responses: {
        201: z.custom<typeof medicines.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: "PUT" as const,
      path: "/api/medicines/:id",
      input: insertMedicineSchema.partial(),
      responses: {
        200: z.custom<typeof medicines.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: "DELETE" as const,
      path: "/api/medicines/:id",
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
    get: {
      method: "GET" as const,
      path: "/api/medicines/:id",
      responses: {
        200: z.custom<typeof medicines.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
  },
  suppliers: {
    list: {
      method: "GET" as const,
      path: "/api/suppliers",
      responses: {
        200: z.array(z.custom<typeof suppliers.$inferSelect>()),
      },
    },
    create: {
      method: "POST" as const,
      path: "/api/suppliers",
      input: insertSupplierSchema,
      responses: {
        201: z.custom<typeof suppliers.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
  },
  customers: {
    list: {
      method: "GET" as const,
      path: "/api/customers",
      input: z.object({
        search: z.string().optional(), // search by mobile or name
      }).optional(),
      responses: {
        200: z.array(z.custom<typeof customers.$inferSelect>()),
      },
    },
  },
  invoices: {
    create: {
      method: "POST" as const,
      path: "/api/invoices",
      input: z.object({
        customerName: z.string(),
        customerMobile: z.string(),
        customerAddress: z.string().optional(),
        items: z.array(z.object({
          medicineId: z.number(),
          quantity: z.number().min(1),
        })),
        discount: z.number().optional(),
        paymentMode: z.string().optional(),
      }),
      responses: {
        201: z.custom<typeof invoices.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    list: {
      method: "GET" as const,
      path: "/api/invoices",
      responses: {
        200: z.array(z.custom<typeof invoices.$inferSelect>()),
      },
    },
    get: {
      method: "GET" as const,
      path: "/api/invoices/:id",
      responses: {
        200: z.custom<any>(), // Should return InvoiceWithDetails
        404: errorSchemas.notFound,
      },
    },
  },
  stats: {
    get: {
      method: "GET" as const,
      path: "/api/stats",
      responses: {
        200: z.object({
          totalMedicines: z.number(),
          lowStockItems: z.number(),
          expiringSoonItems: z.number(),
          todaysSales: z.number(),
          totalCustomers: z.number(),
        }),
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
