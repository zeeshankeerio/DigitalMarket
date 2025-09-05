import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CustomerService } from "@/components/CustomerService";
import { isUnauthorizedError } from "@/lib/authUtils";
import { 
  User, 
  Package, 
  Download, 
  CreditCard, 
  Key, 
  Copy, 
  Eye, 
  EyeOff,
  Calendar,
  CheckCircle,
  Clock,
  ShoppingBag
} from "lucide-react";
import { format } from "date-fns";

export default function Profile() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [revealedKeys, setRevealedKeys] = useState<{ [key: string]: boolean }>({});

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: orders = [], isLoading: ordersLoading } = useQuery<any[]>({
    queryKey: ["/api/orders"],
    enabled: !!isAuthenticated,
    retry: (failureCount, error) => {
      if (isUnauthorizedError(error as Error)) {
        return false;
      }
      return failureCount < 3;
    },
  });

  const { data: userStats } = useQuery<{
    totalOrders: number;
    totalSpent: string;
    totalKeys: number;
  }>({
    queryKey: ["/api/user-stats"],
    enabled: !!isAuthenticated,
    retry: (failureCount, error) => {
      if (isUnauthorizedError(error as Error)) {
        return false;
      }
      return failureCount < 3;
    },
  });

  const copyToClipboard = (text: string, keyId: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Copied to Clipboard",
        description: "Digital key copied successfully!",
      });
    });
  };

  const toggleKeyVisibility = (keyId: string) => {
    setRevealedKeys(prev => ({
      ...prev,
      [keyId]: !prev[keyId]
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Profile</h1>
        <p className="text-muted-foreground">Manage your account and view your orders</p>
      </div>

      <Tabs defaultValue="orders" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="orders" data-testid="tab-orders">Orders</TabsTrigger>
          <TabsTrigger value="support" data-testid="tab-support">Support</TabsTrigger>
          <TabsTrigger value="profile" data-testid="tab-profile">Profile</TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="space-y-6">
          <Card data-testid="card-order-history">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Order History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {ordersLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
                </div>
              ) : orders.length > 0 ? (
                <div className="space-y-4">
                  {orders.map((order: any) => (
                    <div key={order.id} className="border border-border rounded-lg p-4" data-testid={`order-${order.id}`}>
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-foreground" data-testid={`order-id-${order.id}`}>
                            Order #{order.id.slice(-8)}
                          </h4>
                          <p className="text-sm text-muted-foreground" data-testid={`order-date-${order.id}`}>
                            {format(new Date(order.createdAt), "PPP")}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge
                            variant={order.status === 'completed' ? 'default' : 'secondary'}
                            data-testid={`order-status-${order.id}`}
                          >
                            {order.status}
                          </Badge>
                          <p className="text-lg font-bold text-accent mt-1" data-testid={`order-total-${order.id}`}>
                            ${order.total}
                          </p>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        {order.orderItems?.map((item: any, index: number) => (
                          <div key={index} className="flex items-center justify-between py-2 border-t border-border first:border-t-0">
                            <div>
                              <p className="font-medium text-foreground" data-testid={`order-item-name-${order.id}-${index}`}>
                                {item.product?.name}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Quantity: {item.quantity}
                              </p>
                              {item.digitalKey && (
                                <div className="flex items-center gap-2 mt-1">
                                  <Download className="w-4 h-4 text-accent" />
                                  <span className="text-sm text-accent font-mono bg-muted px-2 py-1 rounded">
                                    {item.digitalKey.keyValue}
                                  </span>
                                </div>
                              )}
                            </div>
                            <p className="font-medium" data-testid={`order-item-price-${order.id}-${index}`}>
                              ${item.price}
                            </p>
                          </div>
                        ))}
                      </div>

                      {order.paymentMethod && (
                        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
                          <CreditCard className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground capitalize">
                            Paid with {order.paymentMethod}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">No orders found</p>
                  <Button onClick={() => window.location.href = '/'} data-testid="button-start-shopping">
                    Start Shopping
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="support" className="space-y-6">
          <CustomerService orders={orders} />
        </TabsContent>

        <TabsContent value="profile" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card data-testid="card-profile-info">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Account Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-4">
                  {user.profileImageUrl ? (
                    <img
                      src={user.profileImageUrl}
                      alt="Profile"
                      className="w-16 h-16 rounded-full object-cover"
                      data-testid="img-profile-avatar"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                      <User className="w-8 h-8 text-primary-foreground" />
                    </div>
                  )}
                  <div>
                    <h3 className="text-lg font-semibold text-foreground" data-testid="text-user-name">
                      {user.firstName && user.lastName
                        ? `${user.firstName} ${user.lastName}`
                        : user.email}
                    </h3>
                    <p className="text-muted-foreground" data-testid="text-user-email">
                      {user.email}
                    </p>
                    {user.isAdmin && (
                      <Badge className="mt-2" data-testid="badge-admin">
                        Administrator
                      </Badge>
                    )}
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Member since: {format(new Date(user.createdAt!), "MMMM yyyy")}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Total Orders: {orders.length}
                  </p>
                </div>

                {user.isAdmin && (
                  <>
                    <Separator />
                    <Button
                      className="w-full"
                      onClick={() => window.location.href = '/admin'}
                      data-testid="button-admin-dashboard"
                    >
                      Admin Dashboard
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>

            <Card data-testid="card-account-stats">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5" />
                  Account Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {userStats ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Total Orders:</span>
                      <span className="font-semibold" data-testid="stat-total-orders">
                        {userStats.totalOrders}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Total Spent:</span>
                      <span className="font-semibold" data-testid="stat-total-spent">
                        ${userStats.totalSpent}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Digital Keys:</span>
                      <span className="font-semibold" data-testid="stat-total-keys">
                        {userStats.totalKeys}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <div className="animate-spin w-6 h-6 border-4 border-primary border-t-transparent rounded-full mx-auto" />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
