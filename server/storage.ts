import {
  users,
  categories,
  products,
  digitalKeys,
  orders,
  orderItems,
  refunds,
  supportTickets,
  ticketMessages,
  disputes,
  inventoryAlerts,
  type User,
  type UpsertUser,
  type Category,
  type InsertCategory,
  type Product,
  type InsertProduct,
  type ProductWithCategory,
  type DigitalKey,
  type InsertDigitalKey,
  type Order,
  type InsertOrder,
  type OrderItem,
  type InsertOrderItem,
  type OrderWithItems,
  type Refund,
  type InsertRefund,
  type RefundWithOrder,
  type SupportTicket,
  type InsertSupportTicket,
  type SupportTicketWithMessages,
  type TicketMessage,
  type InsertTicketMessage,
  type Dispute,
  type InsertDispute,
  type DisputeWithOrder,
  type InventoryAlert,
  type InsertInventoryAlert,
  type InventoryAlertWithProduct,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, isNull, isNotNull, sql } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations (IMPORTANT) these user operations are mandatory for Replit Auth.
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Category operations
  getCategories(): Promise<Category[]>;
  createCategory(category: InsertCategory): Promise<Category>;
  
  // Product operations
  getProducts(): Promise<ProductWithCategory[]>;
  getFeaturedProducts(): Promise<ProductWithCategory[]>;
  getProductsByCategory(categoryId: string): Promise<ProductWithCategory[]>;
  getProductById(id: string): Promise<ProductWithCategory | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product>;
  deleteProduct(id: string): Promise<void>;
  
  // Digital key operations
  createDigitalKey(digitalKey: InsertDigitalKey): Promise<DigitalKey>;
  getAvailableKeyForProduct(productId: string): Promise<DigitalKey | undefined>;
  markKeyAsUsed(keyId: string, orderId: string): Promise<DigitalKey>;
  
  // Order operations
  createOrder(order: InsertOrder): Promise<Order>;
  createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem>;
  getOrderById(id: string): Promise<OrderWithItems | undefined>;
  updateOrderStatus(id: string, status: string): Promise<Order>;
  getUserOrders(userId: string): Promise<OrderWithItems[]>;
  getUserStats(userId: string): Promise<{ totalOrders: number; totalSpent: string; totalKeys: number }>;
  getOrderByPaymentIntent(paymentIntentId: string): Promise<Order | undefined>;
  
  // Refund operations
  createRefund(refund: InsertRefund): Promise<Refund>;
  getRefundById(id: string): Promise<RefundWithOrder | undefined>;
  getUserRefunds(userId: string): Promise<RefundWithOrder[]>;
  getAllRefunds(): Promise<RefundWithOrder[]>;
  updateRefundStatus(id: string, status: string, adminNotes?: string, stripeRefundId?: string): Promise<Refund>;
  
  // Support ticket operations
  createSupportTicket(ticket: InsertSupportTicket): Promise<SupportTicket>;
  getSupportTicketById(id: string): Promise<SupportTicketWithMessages | undefined>;
  getUserTickets(userId: string): Promise<SupportTicket[]>;
  getAllTickets(): Promise<SupportTicketWithMessages[]>;
  updateTicketStatus(id: string, status: string): Promise<SupportTicket>;
  assignTicket(id: string, assignedTo: string): Promise<SupportTicket>;
  
  // Ticket message operations
  createTicketMessage(message: InsertTicketMessage): Promise<TicketMessage>;
  getTicketMessages(ticketId: string): Promise<(TicketMessage & { user: User })[]>;
  
  // Dispute operations
  createDispute(dispute: InsertDispute): Promise<Dispute>;
  getDisputeById(id: string): Promise<DisputeWithOrder | undefined>;
  getUserDisputes(userId: string): Promise<DisputeWithOrder[]>;
  getAllDisputes(): Promise<DisputeWithOrder[]>;
  updateDisputeStatus(id: string, status: string, resolution?: string): Promise<Dispute>;
  
  // Inventory alert operations
  createInventoryAlert(alert: InsertInventoryAlert): Promise<InventoryAlert>;
  getInventoryAlerts(): Promise<InventoryAlertWithProduct[]>;
  resolveInventoryAlert(id: string): Promise<InventoryAlert>;
  checkLowStockProducts(): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations (IMPORTANT) these user operations are mandatory for Replit Auth.
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
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
  
  // Category operations
  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories);
  }
  
  async createCategory(category: InsertCategory): Promise<Category> {
    const [newCategory] = await db.insert(categories).values(category).returning();
    return newCategory;
  }
  
  // Product operations
  async getProducts(): Promise<ProductWithCategory[]> {
    return await db
      .select()
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(eq(products.isActive, true))
      .orderBy(desc(products.createdAt))
      .then(rows => 
        rows.map(row => ({
          ...row.products,
          category: row.categories!,
        }))
      );
  }
  
  async getFeaturedProducts(): Promise<ProductWithCategory[]> {
    return await db
      .select()
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(and(eq(products.isActive, true), eq(products.isFeatured, true)))
      .orderBy(desc(products.createdAt))
      .then(rows => 
        rows.map(row => ({
          ...row.products,
          category: row.categories!,
        }))
      );
  }
  
  async getProductsByCategory(categoryId: string): Promise<ProductWithCategory[]> {
    return await db
      .select()
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(and(eq(products.categoryId, categoryId), eq(products.isActive, true)))
      .orderBy(desc(products.createdAt))
      .then(rows => 
        rows.map(row => ({
          ...row.products,
          category: row.categories!,
        }))
      );
  }
  
  async getProductById(id: string): Promise<ProductWithCategory | undefined> {
    const [result] = await db
      .select()
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(eq(products.id, id));
    
    if (!result) return undefined;
    
    return {
      ...result.products,
      category: result.categories!,
    };
  }
  
  async createProduct(product: InsertProduct): Promise<Product> {
    const [newProduct] = await db.insert(products).values(product).returning();
    return newProduct;
  }
  
  async updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product> {
    const [updatedProduct] = await db
      .update(products)
      .set({ ...product, updatedAt: new Date() })
      .where(eq(products.id, id))
      .returning();
    return updatedProduct;
  }
  
  async deleteProduct(id: string): Promise<void> {
    await db.update(products).set({ isActive: false }).where(eq(products.id, id));
  }
  
  // Digital key operations
  async createDigitalKey(digitalKey: InsertDigitalKey): Promise<DigitalKey> {
    const [newKey] = await db.insert(digitalKeys).values(digitalKey).returning();
    return newKey;
  }
  
  async getAvailableKeyForProduct(productId: string): Promise<DigitalKey | undefined> {
    const [key] = await db
      .select()
      .from(digitalKeys)
      .where(and(eq(digitalKeys.productId, productId), eq(digitalKeys.isUsed, false)))
      .limit(1);
    return key;
  }
  
  async markKeyAsUsed(keyId: string, orderId: string): Promise<DigitalKey> {
    const [updatedKey] = await db
      .update(digitalKeys)
      .set({ isUsed: true, orderId, usedAt: new Date() })
      .where(eq(digitalKeys.id, keyId))
      .returning();
    return updatedKey;
  }
  
  // Order operations
  async createOrder(order: InsertOrder): Promise<Order> {
    const [newOrder] = await db.insert(orders).values(order).returning();
    return newOrder;
  }
  
  async createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem> {
    const [newOrderItem] = await db.insert(orderItems).values(orderItem).returning();
    return newOrderItem;
  }
  
  async getOrderById(id: string): Promise<OrderWithItems | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    if (!order) return undefined;
    
    const items = await db
      .select()
      .from(orderItems)
      .leftJoin(products, eq(orderItems.productId, products.id))
      .leftJoin(digitalKeys, eq(orderItems.digitalKeyId, digitalKeys.id))
      .where(eq(orderItems.orderId, id));
    
    return {
      ...order,
      orderItems: items.map(item => ({
        ...item.order_items,
        product: item.products!,
        digitalKey: item.digital_keys || undefined,
      })),
    };
  }
  
  async updateOrderStatus(id: string, status: string): Promise<Order> {
    const [updatedOrder] = await db
      .update(orders)
      .set({ status, updatedAt: new Date() })
      .where(eq(orders.id, id))
      .returning();
    return updatedOrder;
  }
  
  async getUserOrders(userId: string): Promise<OrderWithItems[]> {
    const userOrders = await db
      .select()
      .from(orders)
      .where(eq(orders.userId, userId))
      .orderBy(desc(orders.createdAt));
    
    const ordersWithItems = await Promise.all(
      userOrders.map(async (order) => {
        const items = await db
          .select()
          .from(orderItems)
          .leftJoin(products, eq(orderItems.productId, products.id))
          .leftJoin(digitalKeys, eq(orderItems.digitalKeyId, digitalKeys.id))
          .where(eq(orderItems.orderId, order.id));
        
        return {
          ...order,
          orderItems: items.map(item => ({
            ...item.order_items,
            product: item.products!,
            digitalKey: item.digital_keys || undefined,
          })),
        };
      })
    );
    
    return ordersWithItems;
  }
  
  async getUserStats(userId: string): Promise<{ totalOrders: number; totalSpent: string; totalKeys: number }> {
    // Get total orders count and total spent
    const orderStats = await db
      .select({
        totalOrders: sql<number>`count(*)`,
        totalSpent: sql<string>`coalesce(sum(cast(${orders.total} as decimal)), 0)`
      })
      .from(orders)
      .where(eq(orders.userId, userId));
    
    // Get total digital keys count for the user
    const keyStats = await db
      .select({
        totalKeys: sql<number>`count(${digitalKeys.id})`
      })
      .from(orderItems)
      .leftJoin(orders, eq(orderItems.orderId, orders.id))
      .leftJoin(digitalKeys, eq(orderItems.digitalKeyId, digitalKeys.id))
      .where(and(
        eq(orders.userId, userId),
        isNotNull(digitalKeys.id)
      ));
    
    return {
      totalOrders: orderStats[0]?.totalOrders || 0,
      totalSpent: parseFloat(orderStats[0]?.totalSpent || '0').toFixed(2),
      totalKeys: keyStats[0]?.totalKeys || 0
    };
  }
  
  async getOrderByPaymentIntent(paymentIntentId: string): Promise<Order | undefined> {
    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.paymentIntentId, paymentIntentId));
    return order;
  }

  // Refund operations
  async createRefund(refund: InsertRefund): Promise<Refund> {
    const [newRefund] = await db.insert(refunds).values(refund).returning();
    return newRefund;
  }

  async getRefundById(id: string): Promise<RefundWithOrder | undefined> {
    const [refund] = await db
      .select()
      .from(refunds)
      .leftJoin(orders, eq(refunds.orderId, orders.id))
      .leftJoin(users, eq(refunds.userId, users.id))
      .where(eq(refunds.id, id));
    
    if (!refund) return undefined;
    
    const orderWithItems = await this.getOrderById(refund.refunds.orderId);
    return {
      ...refund.refunds,
      order: orderWithItems!,
      user: refund.users!,
    };
  }

  async getUserRefunds(userId: string): Promise<RefundWithOrder[]> {
    const userRefunds = await db
      .select()
      .from(refunds)
      .leftJoin(orders, eq(refunds.orderId, orders.id))
      .leftJoin(users, eq(refunds.userId, users.id))
      .where(eq(refunds.userId, userId))
      .orderBy(desc(refunds.createdAt));

    const refundsWithOrders = await Promise.all(
      userRefunds.map(async (refund) => {
        const orderWithItems = await this.getOrderById(refund.refunds.orderId);
        return {
          ...refund.refunds,
          order: orderWithItems!,
          user: refund.users!,
        };
      })
    );

    return refundsWithOrders;
  }

  async getAllRefunds(): Promise<RefundWithOrder[]> {
    const allRefunds = await db
      .select()
      .from(refunds)
      .leftJoin(orders, eq(refunds.orderId, orders.id))
      .leftJoin(users, eq(refunds.userId, users.id))
      .orderBy(desc(refunds.createdAt));

    const refundsWithOrders = await Promise.all(
      allRefunds.map(async (refund) => {
        const orderWithItems = await this.getOrderById(refund.refunds.orderId);
        return {
          ...refund.refunds,
          order: orderWithItems!,
          user: refund.users!,
        };
      })
    );

    return refundsWithOrders;
  }

  async updateRefundStatus(id: string, status: string, adminNotes?: string, stripeRefundId?: string): Promise<Refund> {
    const [updatedRefund] = await db
      .update(refunds)
      .set({ 
        status, 
        adminNotes,
        stripeRefundId,
        updatedAt: new Date() 
      })
      .where(eq(refunds.id, id))
      .returning();
    return updatedRefund;
  }

  // Support ticket operations
  async createSupportTicket(ticket: InsertSupportTicket): Promise<SupportTicket> {
    const [newTicket] = await db.insert(supportTickets).values(ticket).returning();
    return newTicket;
  }

  async getSupportTicketById(id: string): Promise<SupportTicketWithMessages | undefined> {
    const [ticket] = await db
      .select()
      .from(supportTickets)
      .leftJoin(users, eq(supportTickets.userId, users.id))
      .leftJoin(orders, eq(supportTickets.orderId, orders.id))
      .where(eq(supportTickets.id, id));
    
    if (!ticket) return undefined;
    
    const messages = await this.getTicketMessages(id);
    const assignedUser = ticket.support_tickets.assignedTo ? await this.getUser(ticket.support_tickets.assignedTo) : undefined;
    
    return {
      ...ticket.support_tickets,
      messages,
      user: ticket.users!,
      order: ticket.orders || undefined,
      assignedUser,
    };
  }

  async getUserTickets(userId: string): Promise<SupportTicket[]> {
    return await db
      .select()
      .from(supportTickets)
      .where(eq(supportTickets.userId, userId))
      .orderBy(desc(supportTickets.createdAt));
  }

  async getAllTickets(): Promise<SupportTicketWithMessages[]> {
    const allTickets = await db
      .select()
      .from(supportTickets)
      .leftJoin(users, eq(supportTickets.userId, users.id))
      .leftJoin(orders, eq(supportTickets.orderId, orders.id))
      .orderBy(desc(supportTickets.createdAt));

    const ticketsWithMessages = await Promise.all(
      allTickets.map(async (ticket) => {
        const messages = await this.getTicketMessages(ticket.support_tickets.id);
        const assignedUser = ticket.support_tickets.assignedTo ? await this.getUser(ticket.support_tickets.assignedTo) : undefined;
        
        return {
          ...ticket.support_tickets,
          messages,
          user: ticket.users!,
          order: ticket.orders || undefined,
          assignedUser,
        };
      })
    );

    return ticketsWithMessages;
  }

  async updateTicketStatus(id: string, status: string): Promise<SupportTicket> {
    const [updatedTicket] = await db
      .update(supportTickets)
      .set({ status, updatedAt: new Date() })
      .where(eq(supportTickets.id, id))
      .returning();
    return updatedTicket;
  }

  async assignTicket(id: string, assignedTo: string): Promise<SupportTicket> {
    const [updatedTicket] = await db
      .update(supportTickets)
      .set({ assignedTo, updatedAt: new Date() })
      .where(eq(supportTickets.id, id))
      .returning();
    return updatedTicket;
  }

  // Ticket message operations
  async createTicketMessage(message: InsertTicketMessage): Promise<TicketMessage> {
    const [newMessage] = await db.insert(ticketMessages).values(message).returning();
    return newMessage;
  }

  async getTicketMessages(ticketId: string): Promise<(TicketMessage & { user: User })[]> {
    const messages = await db
      .select()
      .from(ticketMessages)
      .leftJoin(users, eq(ticketMessages.userId, users.id))
      .where(eq(ticketMessages.ticketId, ticketId))
      .orderBy(ticketMessages.createdAt);

    return messages.map(message => ({
      ...message.ticket_messages,
      user: message.users!,
    }));
  }

  // Dispute operations
  async createDispute(dispute: InsertDispute): Promise<Dispute> {
    const [newDispute] = await db.insert(disputes).values(dispute).returning();
    return newDispute;
  }

  async getDisputeById(id: string): Promise<DisputeWithOrder | undefined> {
    const [dispute] = await db
      .select()
      .from(disputes)
      .leftJoin(orders, eq(disputes.orderId, orders.id))
      .leftJoin(users, eq(disputes.userId, users.id))
      .where(eq(disputes.id, id));
    
    if (!dispute) return undefined;
    
    const orderWithItems = await this.getOrderById(dispute.disputes.orderId);
    return {
      ...dispute.disputes,
      order: orderWithItems!,
      user: dispute.users!,
    };
  }

  async getUserDisputes(userId: string): Promise<DisputeWithOrder[]> {
    const userDisputes = await db
      .select()
      .from(disputes)
      .leftJoin(orders, eq(disputes.orderId, orders.id))
      .leftJoin(users, eq(disputes.userId, users.id))
      .where(eq(disputes.userId, userId))
      .orderBy(desc(disputes.createdAt));

    const disputesWithOrders = await Promise.all(
      userDisputes.map(async (dispute) => {
        const orderWithItems = await this.getOrderById(dispute.disputes.orderId);
        return {
          ...dispute.disputes,
          order: orderWithItems!,
          user: dispute.users!,
        };
      })
    );

    return disputesWithOrders;
  }

  async getAllDisputes(): Promise<DisputeWithOrder[]> {
    const allDisputes = await db
      .select()
      .from(disputes)
      .leftJoin(orders, eq(disputes.orderId, orders.id))
      .leftJoin(users, eq(disputes.userId, users.id))
      .orderBy(desc(disputes.createdAt));

    const disputesWithOrders = await Promise.all(
      allDisputes.map(async (dispute) => {
        const orderWithItems = await this.getOrderById(dispute.disputes.orderId);
        return {
          ...dispute.disputes,
          order: orderWithItems!,
          user: dispute.users!,
        };
      })
    );

    return disputesWithOrders;
  }

  async updateDisputeStatus(id: string, status: string, resolution?: string): Promise<Dispute> {
    const [updatedDispute] = await db
      .update(disputes)
      .set({ 
        status, 
        resolution,
        updatedAt: new Date() 
      })
      .where(eq(disputes.id, id))
      .returning();
    return updatedDispute;
  }

  // Inventory alert operations
  async createInventoryAlert(alert: InsertInventoryAlert): Promise<InventoryAlert> {
    const [newAlert] = await db.insert(inventoryAlerts).values(alert).returning();
    return newAlert;
  }

  async getInventoryAlerts(): Promise<InventoryAlertWithProduct[]> {
    const alerts = await db
      .select()
      .from(inventoryAlerts)
      .leftJoin(products, eq(inventoryAlerts.productId, products.id))
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(eq(inventoryAlerts.isResolved, false))
      .orderBy(desc(inventoryAlerts.createdAt));

    return alerts.map(alert => ({
      ...alert.inventory_alerts,
      product: {
        ...alert.products!,
        category: alert.categories!,
      },
    }));
  }

  async resolveInventoryAlert(id: string): Promise<InventoryAlert> {
    const [updatedAlert] = await db
      .update(inventoryAlerts)
      .set({ isResolved: true, resolvedAt: new Date() })
      .where(eq(inventoryAlerts.id, id))
      .returning();
    return updatedAlert;
  }

  async checkLowStockProducts(): Promise<void> {
    // Check for products with low stock (less than 5)
    const lowStockProducts = await db
      .select()
      .from(products)
      .where(and(
        eq(products.isActive, true),
        sql`${products.stock} < 5 AND ${products.stock} > 0`
      ));

    // Check for products with no digital keys
    const productsWithNoKeys = await db
      .select({
        id: products.id,
        name: products.name,
        stock: products.stock,
      })
      .from(products)
      .leftJoin(digitalKeys, and(
        eq(digitalKeys.productId, products.id),
        eq(digitalKeys.isUsed, false)
      ))
      .where(and(
        eq(products.isActive, true),
        isNull(digitalKeys.id)
      ))
      .groupBy(products.id);

    // Create alerts for low stock products
    for (const product of lowStockProducts) {
      // Check if alert already exists for this product
      const existingAlert = await db
        .select()
        .from(inventoryAlerts)
        .where(and(
          eq(inventoryAlerts.productId, product.id),
          eq(inventoryAlerts.alertType, 'low_stock'),
          eq(inventoryAlerts.isResolved, false)
        ));

      if (existingAlert.length === 0) {
        await this.createInventoryAlert({
          productId: product.id,
          alertType: 'low_stock',
          threshold: product.stock || 0,
        });
      }
    }

    // Create alerts for products with no keys
    for (const product of productsWithNoKeys) {
      const existingAlert = await db
        .select()
        .from(inventoryAlerts)
        .where(and(
          eq(inventoryAlerts.productId, product.id),
          eq(inventoryAlerts.alertType, 'no_keys'),
          eq(inventoryAlerts.isResolved, false)
        ));

      if (existingAlert.length === 0) {
        await this.createInventoryAlert({
          productId: product.id,
          alertType: 'no_keys',
        });
      }
    }
  }
}

export const storage = new DatabaseStorage();
