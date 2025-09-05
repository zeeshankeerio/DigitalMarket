import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertProductSchema, insertCategorySchema, insertDigitalKeySchema } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { AdminCustomerService } from "@/components/AdminCustomerService";
import { BarChart3, Package, ShoppingBag, Plus, Key, HelpCircle } from "lucide-react";
import { z } from "zod";

export default function AdminDashboard() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
  const [selectedProductForKeys, setSelectedProductForKeys] = useState<string>("");

  // Redirect if not authenticated or not admin
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
    
    if (!isLoading && isAuthenticated && !user?.isAdmin) {
      toast({
        title: "Access Denied",
        description: "Admin access required.",
        variant: "destructive",
      });
      window.location.href = "/";
      return;
    }
  }, [isAuthenticated, isLoading, user, toast]);

  const { data: products = [], isLoading: productsLoading } = useQuery<any[]>({
    queryKey: ["/api/products"],
    enabled: !!isAuthenticated && !!user?.isAdmin,
  });

  const { data: categories = [] } = useQuery<any[]>({
    queryKey: ["/api/categories"],
    enabled: !!isAuthenticated && !!user?.isAdmin,
  });

  const { data: customerServiceStats } = useQuery<any>({
    queryKey: ["/api/support-tickets", "/api/refunds", "/api/disputes"],
    queryFn: async () => {
      const [ticketsResponse, refundsResponse, disputesResponse] = await Promise.all([
        apiRequest("GET", "/api/support-tickets"),
        apiRequest("GET", "/api/refunds"),
        apiRequest("GET", "/api/disputes")
      ]);
      
      const tickets = await ticketsResponse.json();
      const refunds = await refundsResponse.json();
      const disputes = await disputesResponse.json();
      
      return {
        openTickets: tickets.filter((t: any) => t.status === 'open').length,
        pendingRefunds: refunds.filter((r: any) => r.status === 'pending').length,
        activeDisputes: disputes.filter((d: any) => d.status === 'open').length,
        totalIssues: tickets.length + refunds.length + disputes.length
      };
    },
    enabled: !!isAuthenticated && !!user?.isAdmin,
  });

  // Forms
  const productForm = useForm({
    resolver: zodResolver(insertProductSchema),
    defaultValues: {
      name: "",
      description: "",
      price: "",
      originalPrice: "",
      categoryId: "",
      imageUrl: "",
      platform: "",
      stock: 0,
      isFeatured: false,
    },
  });

  const categoryForm = useForm({
    resolver: zodResolver(insertCategorySchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
    },
  });

  const keyForm = useForm({
    resolver: zodResolver(insertDigitalKeySchema.omit({ productId: true })),
    defaultValues: {
      keyValue: "",
    },
  });

  // Mutations
  const createProductMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/products", data);
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Product created successfully" });
      setIsProductModalOpen(false);
      productForm.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error as Error)) {
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
      toast({
        title: "Error",
        description: "Failed to create product",
        variant: "destructive",
      });
    },
  });

  const createCategoryMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/categories", data);
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Category created successfully" });
      setIsCategoryModalOpen(false);
      categoryForm.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error as Error)) {
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
      toast({
        title: "Error",
        description: "Failed to create category",
        variant: "destructive",
      });
    },
  });

  const createKeyMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", `/api/products/${selectedProductForKeys}/keys`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Digital key added successfully" });
      setIsKeyModalOpen(false);
      keyForm.reset();
      setSelectedProductForKeys("");
    },
    onError: (error) => {
      if (isUnauthorizedError(error as Error)) {
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
      toast({
        title: "Error",
        description: "Failed to add digital key",
        variant: "destructive",
      });
    },
  });

  const onProductSubmit = (data: any) => {
    createProductMutation.mutate(data);
  };

  const onCategorySubmit = (data: any) => {
    createCategoryMutation.mutate(data);
  };

  const onKeySubmit = (data: any) => {
    createKeyMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated || !user?.isAdmin) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage your digital products store</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card data-testid="card-total-products">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Total Products</p>
                <p className="text-2xl font-bold text-foreground" data-testid="stat-total-products">
                  {products.length}
                </p>
              </div>
              <Package className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-categories">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Categories</p>
                <p className="text-2xl font-bold text-foreground" data-testid="stat-categories">
                  {categories.length}
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-accent" />
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-featured-products">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Featured Products</p>
                <p className="text-2xl font-bold text-foreground" data-testid="stat-featured">
                  {products.filter((p: any) => p.isFeatured).length}
                </p>
              </div>
              <ShoppingBag className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-customer-service">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Support Issues</p>
                <p className="text-2xl font-bold text-foreground" data-testid="stat-support-issues">
                  {customerServiceStats?.totalIssues || 0}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {customerServiceStats?.openTickets || 0} tickets • {customerServiceStats?.pendingRefunds || 0} refunds
                </p>
              </div>
              <HelpCircle className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Management Tabs */}
      <Tabs defaultValue="products" className="space-y-6">
        <TabsList>
          <TabsTrigger value="products" data-testid="tab-products">Products</TabsTrigger>
          <TabsTrigger value="categories" data-testid="tab-categories">Categories</TabsTrigger>
          <TabsTrigger value="support" data-testid="tab-support">Customer Service</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-foreground">Products</h2>
            <Dialog open={isProductModalOpen} onOpenChange={setIsProductModalOpen}>
              <DialogTrigger asChild>
                <Button data-testid="button-add-product">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Product
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add New Product</DialogTitle>
                </DialogHeader>
                <Form {...productForm}>
                  <form onSubmit={productForm.handleSubmit(onProductSubmit)} className="space-y-4">
                    <FormField
                      control={productForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Product Name</FormLabel>
                          <FormControl>
                            <Input {...field} data-testid="input-product-name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={productForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea {...field} data-testid="input-product-description" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={productForm.control}
                        name="price"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Price</FormLabel>
                            <FormControl>
                              <Input type="number" step="0.01" {...field} data-testid="input-product-price" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={productForm.control}
                        name="originalPrice"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Original Price (Optional)</FormLabel>
                            <FormControl>
                              <Input type="number" step="0.01" {...field} data-testid="input-product-original-price" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={productForm.control}
                      name="categoryId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-product-category">
                                <SelectValue placeholder="Select a category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {categories.map((category: any) => (
                                <SelectItem key={category.id} value={category.id}>
                                  {category.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={productForm.control}
                      name="platform"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Platform</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="e.g. PC, PlayStation 5, etc." data-testid="input-product-platform" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={productForm.control}
                      name="imageUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Image URL</FormLabel>
                          <FormControl>
                            <Input {...field} type="url" data-testid="input-product-image" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button type="submit" disabled={createProductMutation.isPending} data-testid="button-submit-product">
                      {createProductMutation.isPending ? "Creating..." : "Create Product"}
                    </Button>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {productsLoading ? (
              <div className="col-span-full text-center py-8">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
              </div>
            ) : products.length > 0 ? (
              products.map((product: any) => (
                <Card key={product.id} data-testid={`admin-product-${product.id}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg">{product.name}</CardTitle>
                      {product.isFeatured && (
                        <Badge variant="secondary" className="text-xs">Featured</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-2">{product.category?.name}</p>
                    <p className="text-lg font-bold text-accent">${product.price}</p>
                    <div className="flex gap-2 mt-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedProductForKeys(product.id);
                          setIsKeyModalOpen(true);
                        }}
                        data-testid={`button-add-keys-${product.id}`}
                      >
                        <Key className="w-4 h-4 mr-1" />
                        Add Keys
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-8">
                <p className="text-muted-foreground">No products found</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-foreground">Categories</h2>
            <Dialog open={isCategoryModalOpen} onOpenChange={setIsCategoryModalOpen}>
              <DialogTrigger asChild>
                <Button data-testid="button-add-category">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Category
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Category</DialogTitle>
                </DialogHeader>
                <Form {...categoryForm}>
                  <form onSubmit={categoryForm.handleSubmit(onCategorySubmit)} className="space-y-4">
                    <FormField
                      control={categoryForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category Name</FormLabel>
                          <FormControl>
                            <Input {...field} data-testid="input-category-name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={categoryForm.control}
                      name="slug"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Slug</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="category-slug" data-testid="input-category-slug" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={categoryForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea {...field} data-testid="input-category-description" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button type="submit" disabled={createCategoryMutation.isPending} data-testid="button-submit-category">
                      {createCategoryMutation.isPending ? "Creating..." : "Create Category"}
                    </Button>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category: any) => (
              <Card key={category.id} data-testid={`admin-category-${category.id}`}>
                <CardHeader>
                  <CardTitle className="text-lg">{category.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-2">
                    Slug: {category.slug}
                  </p>
                  {category.description && (
                    <p className="text-sm">{category.description}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="support" className="space-y-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-foreground mb-2">Customer Service</h2>
            <p className="text-muted-foreground">Manage refunds, support tickets, disputes, and inventory alerts</p>
          </div>
          <AdminCustomerService />
        </TabsContent>
      </Tabs>

      {/* Digital Key Modal */}
      <Dialog open={isKeyModalOpen} onOpenChange={setIsKeyModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Digital Key</DialogTitle>
          </DialogHeader>
          <Form {...keyForm}>
            <form onSubmit={keyForm.handleSubmit(onKeySubmit)} className="space-y-4">
              <FormField
                control={keyForm.control}
                name="keyValue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Digital Key</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter the digital key/license" data-testid="input-digital-key" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={createKeyMutation.isPending} data-testid="button-submit-key">
                {createKeyMutation.isPending ? "Adding..." : "Add Key"}
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
