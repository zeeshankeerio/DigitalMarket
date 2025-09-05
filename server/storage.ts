import {
  users,
  categories,
  products,
  digitalKeys,
  orders,
  orderItems,
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
}

export const storage = new DatabaseStorage();
