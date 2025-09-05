import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ProductWithCategory } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Gamepad2, Monitor, Gift, Puzzle, Search, Filter, SortAsc } from "lucide-react";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [priceRange, setPriceRange] = useState("all");
  const { toast } = useToast();

  const { data: allProducts = [], isLoading: productsLoading } = useQuery<ProductWithCategory[]>({
    queryKey: ["/api/products"],
  });

  const filteredAndSortedProducts = useMemo(() => {
    let filtered = allProducts;

    // Apply category filter
    if (selectedCategory) {
      filtered = filtered.filter(product => product.categoryId === selectedCategory);
    }

    // Apply featured filter
    if (showFeatured) {
      filtered = filtered.filter(product => product.isFeatured);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(query) ||
        product.description?.toLowerCase().includes(query) ||
        product.platform?.toLowerCase().includes(query)
      );
    }

    // Apply price range filter
    if (priceRange !== "all") {
      const price = parseFloat(priceRange);
      filtered = filtered.filter(product => {
        const productPrice = parseFloat(product.price);
        if (priceRange === "under-20") return productPrice < 20;
        if (priceRange === "20-50") return productPrice >= 20 && productPrice <= 50;
        if (priceRange === "50-100") return productPrice >= 50 && productPrice <= 100;
        if (priceRange === "over-100") return productPrice > 100;
        return true;
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return parseFloat(a.price) - parseFloat(b.price);
        case "price-high":
          return parseFloat(b.price) - parseFloat(a.price);
        case "rating":
          return (parseFloat(b.rating || "0") - parseFloat(a.rating || "0"));
        case "name":
        default:
          return a.name.localeCompare(b.name);
      }
    });

    return filtered;
  }, [allProducts, selectedCategory, showFeatured, searchQuery, priceRange, sortBy]);

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

      {/* Search and Filter Section */}
      <section className="py-8 border-b border-border bg-muted/30">
        <div className="container mx-auto px-4">
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search games, software, gift cards..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 text-lg"
                data-testid="input-search"
              />
            </div>
          </div>

          {/* Filters and Sort */}
          <div className="flex flex-wrap justify-center gap-4 mb-6">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40" data-testid="select-sort">
                <SortAsc className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name A-Z</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="rating">Best Rated</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priceRange} onValueChange={setPriceRange}>
              <SelectTrigger className="w-40" data-testid="select-price-range">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Price Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Prices</SelectItem>
                <SelectItem value="under-20">Under $20</SelectItem>
                <SelectItem value="20-50">$20 - $50</SelectItem>
                <SelectItem value="50-100">$50 - $100</SelectItem>
                <SelectItem value="over-100">Over $100</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Category Filter Tabs */}
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
              {searchQuery ? `Search Results` : showFeatured ? "Featured Products" : selectedCategory ? "Filtered Products" : "All Products"}
              {searchQuery && <span className="text-muted-foreground text-lg ml-2">for "{searchQuery}"</span>}
            </h2>
            <Badge variant="secondary" data-testid="product-count">
              {filteredAndSortedProducts.length} products
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
          ) : filteredAndSortedProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredAndSortedProducts.map((product: ProductWithCategory) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-muted-foreground mb-4">
                {searchQuery ? `No products found for "${searchQuery}"` : "No products found with current filters."}
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setShowFeatured(false);
                  setSelectedCategory(null);
                  setSearchQuery("");
                  setPriceRange("all");
                  setSortBy("name");
                }}
                data-testid="button-clear-filters"
              >
                Clear All Filters
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
