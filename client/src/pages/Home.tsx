import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProductWithCategory } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Gamepad2, Monitor, Gift, Puzzle } from "lucide-react";

interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: string;
  quantity: number;
  imageUrl?: string;
  platform?: string;
}

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showFeatured, setShowFeatured] = useState(false);
  const { toast } = useToast();

  const { data: products = [], isLoading: productsLoading } = useQuery<ProductWithCategory[]>({
    queryKey: showFeatured 
      ? ["/api/products", "featured=true"]
      : selectedCategory
      ? ["/api/products", `category=${selectedCategory}`]
      : ["/api/products"],
  });

  const { data: categories = [] } = useQuery<any[]>({
    queryKey: ["/api/categories"],
  });

  const handleAddToCart = (product: ProductWithCategory) => {
    toast({
      title: "Added to Cart",
      description: `${product.name} has been added to your cart.`,
    });
  };

  const categoryStats = [
    { name: "PC Games", icon: Gamepad2, color: "bg-primary", count: "2,450+ titles" },
    { name: "Software", icon: Monitor, color: "bg-accent", count: "850+ programs" },
    { name: "Gift Cards", icon: Gift, color: "bg-orange-500", count: "50+ brands" },
    { name: "DLC & Addons", icon: Puzzle, color: "bg-purple-500", count: "1,200+ items" },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-secondary to-accent/20"></div>
        <div className="relative container mx-auto px-4 py-16">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Digital Gaming Marketplace
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Discover the best deals on PC games, software licenses, gift cards, and digital content
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button
                size="lg"
                onClick={() => setShowFeatured(true)}
                variant={showFeatured ? "default" : "outline"}
                data-testid="button-browse-games"
              >
                Browse Games
              </Button>
              <Button
                size="lg"
                onClick={() => setShowFeatured(true)}
                variant={!showFeatured ? "outline" : "secondary"}
                data-testid="button-view-deals"
              >
                View Deals
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Filter Tabs */}
      <section className="py-8 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-4">
            <Button
              variant={!showFeatured && !selectedCategory ? "default" : "outline"}
              onClick={() => {
                setShowFeatured(false);
                setSelectedCategory(null);
              }}
              data-testid="filter-all"
            >
              All Products
            </Button>
            <Button
              variant={showFeatured ? "default" : "outline"}
              onClick={() => {
                setShowFeatured(true);
                setSelectedCategory(null);
              }}
              data-testid="filter-featured"
            >
              Featured
            </Button>
            {categories.map((category: any) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                onClick={() => {
                  setSelectedCategory(category.id);
                  setShowFeatured(false);
                }}
                data-testid={`filter-category-${category.slug}`}
              >
                {category.name}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-foreground">
              {showFeatured ? "Featured Products" : selectedCategory ? "Filtered Products" : "All Products"}
            </h2>
            <Badge variant="secondary" data-testid="product-count">
              {products.length} products
            </Badge>
          </div>

          {productsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-muted h-48 rounded-t-lg"></div>
                  <div className="p-4 bg-card border border-border rounded-b-lg">
                    <div className="h-4 bg-muted rounded mb-2"></div>
                    <div className="h-4 bg-muted rounded mb-4 w-3/4"></div>
                    <div className="h-8 bg-muted rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product: ProductWithCategory) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-muted-foreground mb-4">No products found.</p>
              <Button
                variant="outline"
                onClick={() => {
                  setShowFeatured(false);
                  setSelectedCategory(null);
                }}
                data-testid="button-clear-filters"
              >
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-muted">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-foreground">Browse Categories</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categoryStats.map((category, index) => {
              const IconComponent = category.icon;
              return (
                <div
                  key={index}
                  className="text-center group cursor-pointer"
                  onClick={() => {
                    const matchingCategory = categories.find((cat: any) => 
                      cat.name.toLowerCase().includes(category.name.toLowerCase().split(' ')[0])
                    );
                    if (matchingCategory) {
                      setSelectedCategory(matchingCategory.id);
                      setShowFeatured(false);
                    }
                  }}
                  data-testid={`category-${category.name.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <div className={`w-16 h-16 ${category.color} rounded-lg mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <IconComponent className="text-2xl text-white w-8 h-8" />
                  </div>
                  <h3 className="font-semibold text-foreground">{category.name}</h3>
                  <p className="text-sm text-muted-foreground">{category.count}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
