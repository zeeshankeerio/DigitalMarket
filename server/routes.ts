import type { Express } from "express";
import { createServer, type Server } from "http";
import Stripe from "stripe";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { 
  insertProductSchema, 
  insertCategorySchema, 
  insertDigitalKeySchema,
  insertRefundSchema,
  insertSupportTicketSchema,
  insertTicketMessageSchema,
  insertDisputeSchema,
  insertInventoryAlertSchema 
} from "@shared/schema";
import { z } from "zod";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-08-27.basil",
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // User order routes
  app.get('/api/orders', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const orders = await storage.getUserOrders(userId);
      res.json(orders);
    } catch (error) {
      console.error("Error fetching user orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.get('/api/user-stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const stats = await storage.getUserStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching user stats:", error);
      res.status(500).json({ message: "Failed to fetch user statistics" });
    }
  });

  // Category routes
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  app.post("/api/categories", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const validatedData = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory(validatedData);
      res.json(category);
    } catch (error) {
      console.error("Error creating category:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create category" });
    }
  });

  // Product routes
  app.get("/api/products", async (req, res) => {
    try {
      const { featured, category } = req.query;
      
      let products;
      if (featured === 'true') {
        products = await storage.getFeaturedProducts();
      } else if (category) {
        products = await storage.getProductsByCategory(category as string);
      } else {
        products = await storage.getProducts();
      }
      
      res.json(products);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const product = await storage.getProductById(req.params.id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      console.error("Error fetching product:", error);
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  app.post("/api/products", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const validatedData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(validatedData);
      res.json(product);
    } catch (error) {
      console.error("Error creating product:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create product" });
    }
  });

  app.put("/api/products/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const validatedData = insertProductSchema.partial().parse(req.body);
      const product = await storage.updateProduct(req.params.id, validatedData);
      res.json(product);
    } catch (error) {
      console.error("Error updating product:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update product" });
    }
  });

  app.delete("/api/products/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      await storage.deleteProduct(req.params.id);
      res.json({ message: "Product deleted successfully" });
    } catch (error) {
      console.error("Error deleting product:", error);
      res.status(500).json({ message: "Failed to delete product" });
    }
  });

  // Digital key routes
  app.post("/api/products/:id/keys", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const validatedData = insertDigitalKeySchema.parse({
        ...req.body,
        productId: req.params.id,
      });
      const digitalKey = await storage.createDigitalKey(validatedData);
      res.json(digitalKey);
    } catch (error) {
      console.error("Error creating digital key:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create digital key" });
    }
  });

  // Order routes
  app.get("/api/orders", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const orders = await storage.getUserOrders(userId);
      res.json(orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.get("/api/orders/:id", isAuthenticated, async (req: any, res) => {
    try {
      const order = await storage.getOrderById(req.params.id);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      // Check if user owns this order or is admin
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (order.userId !== userId && !user?.isAdmin) {
        return res.status(403).json({ message: "Access denied" });
      }

      res.json(order);
    } catch (error) {
      console.error("Error fetching order:", error);
      res.status(500).json({ message: "Failed to fetch order" });
    }
  });

  // Payment routes
  app.post("/api/create-payment-intent", async (req, res) => {
    try {
      const { cartItems, total } = req.body;
      
      // Validate cart items and calculate total
      let calculatedTotal = 0;
      for (const item of cartItems) {
        const product = await storage.getProductById(item.productId);
        if (!product) {
          return res.status(400).json({ message: `Product ${item.productId} not found` });
        }
        calculatedTotal += parseFloat(product.price) * item.quantity;
      }
      
      // Add small processing fee
      calculatedTotal += 2.99;

      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(calculatedTotal * 100), // Convert to cents
        currency: "usd",
        metadata: {
          cartItems: JSON.stringify(cartItems),
        },
      });

      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error: any) {
      console.error("Error creating payment intent:", error);
      res.status(500).json({ message: "Error creating payment intent: " + error.message });
    }
  });

  // Webhook to handle successful payments
  app.post("/api/stripe-webhook", async (req, res) => {
    const sig = req.headers['stripe-signature'] as string;
    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      
      try {
        // Create order from payment intent
        const cartItems = JSON.parse(paymentIntent.metadata.cartItems || '[]');
        const order = await storage.createOrder({
          email: paymentIntent.receipt_email || '',
          total: (paymentIntent.amount / 100).toString(),
          status: 'completed',
          paymentMethod: 'stripe',
          paymentIntentId: paymentIntent.id,
        });

        // Create order items and assign digital keys
        for (const item of cartItems) {
          for (let i = 0; i < item.quantity; i++) {
            // Get available digital key
            const digitalKey = await storage.getAvailableKeyForProduct(item.productId);
            let digitalKeyId = digitalKey?.id;

            if (digitalKey) {
              // Mark key as used
              await storage.markKeyAsUsed(digitalKey.id, order.id);
              digitalKeyId = digitalKey.id;
            }

            // Create order item
            await storage.createOrderItem({
              orderId: order.id,
              productId: item.productId,
              quantity: 1,
              price: item.price,
              digitalKeyId,
            });
          }
        }

        console.log('Order created successfully:', order.id);
      } catch (error) {
        console.error('Error processing payment success:', error);
      }
    }

    res.json({ received: true });
  });

  // Refund routes
  app.post('/api/refunds', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertRefundSchema.parse({
        ...req.body,
        userId,
      });
      const refund = await storage.createRefund(validatedData);
      res.json(refund);
    } catch (error) {
      console.error("Error creating refund:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create refund" });
    }
  });

  app.get('/api/refunds', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (user?.isAdmin) {
        const refunds = await storage.getAllRefunds();
        res.json(refunds);
      } else {
        const refunds = await storage.getUserRefunds(userId);
        res.json(refunds);
      }
    } catch (error) {
      console.error("Error fetching refunds:", error);
      res.status(500).json({ message: "Failed to fetch refunds" });
    }
  });

  app.get('/api/refunds/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      const refund = await storage.getRefundById(req.params.id);
      
      if (!refund) {
        return res.status(404).json({ message: "Refund not found" });
      }
      
      if (refund.userId !== userId && !user?.isAdmin) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      res.json(refund);
    } catch (error) {
      console.error("Error fetching refund:", error);
      res.status(500).json({ message: "Failed to fetch refund" });
    }
  });

  app.patch('/api/refunds/:id/status', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const { status, adminNotes, stripeRefundId } = req.body;
      const updatedRefund = await storage.updateRefundStatus(req.params.id, status, adminNotes, stripeRefundId);
      
      // If approved and status is 'processed', create actual Stripe refund
      if (status === 'processed' && updatedRefund) {
        const refund = await storage.getRefundById(req.params.id);
        if (refund?.order.paymentIntentId) {
          try {
            const stripeRefund = await stripe.refunds.create({
              payment_intent: refund.order.paymentIntentId,
              amount: Math.round(parseFloat(updatedRefund.amount) * 100),
            });
            await storage.updateRefundStatus(req.params.id, status, adminNotes, stripeRefund.id);
          } catch (stripeError) {
            console.error("Stripe refund error:", stripeError);
            return res.status(500).json({ message: "Failed to process Stripe refund" });
          }
        }
      }
      
      res.json(updatedRefund);
    } catch (error) {
      console.error("Error updating refund status:", error);
      res.status(500).json({ message: "Failed to update refund status" });
    }
  });

  // Support ticket routes
  app.post('/api/support-tickets', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertSupportTicketSchema.parse({
        ...req.body,
        userId,
      });
      const ticket = await storage.createSupportTicket(validatedData);
      res.json(ticket);
    } catch (error) {
      console.error("Error creating support ticket:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create support ticket" });
    }
  });

  app.get('/api/support-tickets', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (user?.isAdmin) {
        const tickets = await storage.getAllTickets();
        res.json(tickets);
      } else {
        const tickets = await storage.getUserTickets(userId);
        res.json(tickets);
      }
    } catch (error) {
      console.error("Error fetching support tickets:", error);
      res.status(500).json({ message: "Failed to fetch support tickets" });
    }
  });

  app.get('/api/support-tickets/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      const ticket = await storage.getSupportTicketById(req.params.id);
      
      if (!ticket) {
        return res.status(404).json({ message: "Support ticket not found" });
      }
      
      if (ticket.userId !== userId && !user?.isAdmin) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      res.json(ticket);
    } catch (error) {
      console.error("Error fetching support ticket:", error);
      res.status(500).json({ message: "Failed to fetch support ticket" });
    }
  });

  app.patch('/api/support-tickets/:id/status', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const { status } = req.body;
      const updatedTicket = await storage.updateTicketStatus(req.params.id, status);
      res.json(updatedTicket);
    } catch (error) {
      console.error("Error updating ticket status:", error);
      res.status(500).json({ message: "Failed to update ticket status" });
    }
  });

  app.patch('/api/support-tickets/:id/assign', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const { assignedTo } = req.body;
      const updatedTicket = await storage.assignTicket(req.params.id, assignedTo);
      res.json(updatedTicket);
    } catch (error) {
      console.error("Error assigning ticket:", error);
      res.status(500).json({ message: "Failed to assign ticket" });
    }
  });

  // Ticket message routes
  app.post('/api/support-tickets/:ticketId/messages', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      // Check if user can access this ticket
      const ticket = await storage.getSupportTicketById(req.params.ticketId);
      if (!ticket || (ticket.userId !== userId && !user?.isAdmin)) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const validatedData = insertTicketMessageSchema.parse({
        ...req.body,
        ticketId: req.params.ticketId,
        userId,
      });
      const message = await storage.createTicketMessage(validatedData);
      res.json(message);
    } catch (error) {
      console.error("Error creating ticket message:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create ticket message" });
    }
  });

  app.get('/api/support-tickets/:ticketId/messages', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      // Check if user can access this ticket
      const ticket = await storage.getSupportTicketById(req.params.ticketId);
      if (!ticket || (ticket.userId !== userId && !user?.isAdmin)) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const messages = await storage.getTicketMessages(req.params.ticketId);
      
      // Filter internal messages for non-admin users
      const filteredMessages = user?.isAdmin ? messages : messages.filter(msg => !msg.isInternal);
      
      res.json(filteredMessages);
    } catch (error) {
      console.error("Error fetching ticket messages:", error);
      res.status(500).json({ message: "Failed to fetch ticket messages" });
    }
  });

  // Dispute routes
  app.post('/api/disputes', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertDisputeSchema.parse({
        ...req.body,
        userId,
      });
      const dispute = await storage.createDispute(validatedData);
      res.json(dispute);
    } catch (error) {
      console.error("Error creating dispute:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create dispute" });
    }
  });

  app.get('/api/disputes', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (user?.isAdmin) {
        const disputes = await storage.getAllDisputes();
        res.json(disputes);
      } else {
        const disputes = await storage.getUserDisputes(userId);
        res.json(disputes);
      }
    } catch (error) {
      console.error("Error fetching disputes:", error);
      res.status(500).json({ message: "Failed to fetch disputes" });
    }
  });

  app.get('/api/disputes/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      const dispute = await storage.getDisputeById(req.params.id);
      
      if (!dispute) {
        return res.status(404).json({ message: "Dispute not found" });
      }
      
      if (dispute.userId !== userId && !user?.isAdmin) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      res.json(dispute);
    } catch (error) {
      console.error("Error fetching dispute:", error);
      res.status(500).json({ message: "Failed to fetch dispute" });
    }
  });

  app.patch('/api/disputes/:id/status', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const { status, resolution } = req.body;
      const updatedDispute = await storage.updateDisputeStatus(req.params.id, status, resolution);
      res.json(updatedDispute);
    } catch (error) {
      console.error("Error updating dispute status:", error);
      res.status(500).json({ message: "Failed to update dispute status" });
    }
  });

  // Inventory alert routes
  app.get('/api/inventory-alerts', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const alerts = await storage.getInventoryAlerts();
      res.json(alerts);
    } catch (error) {
      console.error("Error fetching inventory alerts:", error);
      res.status(500).json({ message: "Failed to fetch inventory alerts" });
    }
  });

  app.patch('/api/inventory-alerts/:id/resolve', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const updatedAlert = await storage.resolveInventoryAlert(req.params.id);
      res.json(updatedAlert);
    } catch (error) {
      console.error("Error resolving inventory alert:", error);
      res.status(500).json({ message: "Failed to resolve inventory alert" });
    }
  });

  app.post('/api/inventory-alerts/check', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      await storage.checkLowStockProducts();
      res.json({ message: "Inventory check completed" });
    } catch (error) {
      console.error("Error checking inventory:", error);
      res.status(500).json({ message: "Failed to check inventory" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
