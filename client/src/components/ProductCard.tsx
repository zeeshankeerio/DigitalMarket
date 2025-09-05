import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Heart, ShoppingCart, Zap } from "lucide-react";
import { ProductWithCategory } from "@shared/schema";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

interface ProductCardProps {
  product: ProductWithCategory;
  onAddToCart: (product: ProductWithCategory) => void;
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const { toast } = useToast();
  
  const hasDiscount = product.originalPrice && parseFloat(product.originalPrice) > parseFloat(product.price);
  const discountPercentage = hasDiscount ? Math.round(((parseFloat(product.originalPrice!) - parseFloat(product.price)) / parseFloat(product.originalPrice!)) * 100) : 0;
  const isLowStock = product.stock && product.stock < 10;
  
  useEffect(() => {
    const wishlist = JSON.parse(localStorage.getItem('digitalstore-wishlist') || '[]');
    setIsInWishlist(wishlist.some((item: any) => item.productId === product.id));
  }, [product.id]);
  
  const handleAddToCart = async () => {
    if (product.stock === 0) {
      toast({
        title: "Out of Stock",
        description: "This product is currently out of stock.",
        variant: "destructive",
      });
      return;
    }
    
    setIsAdding(true);
    onAddToCart(product);
    
    // Simulate quick loading state
    setTimeout(() => setIsAdding(false), 300);
  };
  
  const handleWishlistToggle = () => {
    const wishlist = JSON.parse(localStorage.getItem('digitalstore-wishlist') || '[]');
    
    if (isInWishlist) {
      const newWishlist = wishlist.filter((item: any) => item.productId !== product.id);
      localStorage.setItem('digitalstore-wishlist', JSON.stringify(newWishlist));
      setIsInWishlist(false);
      toast({
        title: "Removed from Wishlist",
        description: `${product.name} has been removed from your wishlist.`,
      });
    } else {
      const newItem = {
        id: `wishlist-${Date.now()}`,
        productId: product.id,
        name: product.name,
        price: product.price,
        imageUrl: product.imageUrl,
        platform: product.platform,
      };
      wishlist.push(newItem);
      localStorage.setItem('digitalstore-wishlist', JSON.stringify(wishlist));
      setIsInWishlist(true);
      toast({
        title: "Added to Wishlist",
        description: `${product.name} has been added to your wishlist.`,
      });
    }
  };

  return (
    <Card className="product-card bg-card rounded-lg overflow-hidden border border-border hover:shadow-lg transition-all duration-300 hover:-translate-y-2 group relative" data-testid={`card-product-${product.id}`}>
      <div className="relative">
        <img
          src={product.imageUrl || "https://images.unsplash.com/photo-1542751371-adc38448a05e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=225"}
          alt={product.name}
          className="w-full h-48 object-cover"
          data-testid={`img-product-${product.id}`}
        />
        
        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <div className="flex space-x-2">
            <Button
              size="sm"
              onClick={handleWishlistToggle}
              variant={isInWishlist ? "default" : "secondary"}
              data-testid={`button-wishlist-${product.id}`}
            >
              <Heart className={`w-4 h-4 ${isInWishlist ? 'fill-current' : ''}`} />
            </Button>
            <Button
              size="sm"
              onClick={handleAddToCart}
              disabled={isAdding || product.stock === 0}
              data-testid={`button-quick-add-${product.id}`}
            >
              <ShoppingCart className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col space-y-1">
          {product.isFeatured && (
            <Badge className="bg-yellow-500 text-black" data-testid={`badge-featured-${product.id}`}>
              <Zap className="w-3 h-3 mr-1" />
              Featured
            </Badge>
          )}
          {hasDiscount && (
            <Badge variant="destructive" data-testid={`badge-discount-${product.id}`}>
              -{discountPercentage}%
            </Badge>
          )}
          {isLowStock && product.stock! > 0 && (
            <Badge variant="secondary" className="bg-orange-500 text-white" data-testid={`badge-low-stock-${product.id}`}>
              Only {product.stock} left
            </Badge>
          )}
          {product.stock === 0 && (
            <Badge variant="secondary" className="bg-gray-500 text-white" data-testid={`badge-out-of-stock-${product.id}`}>
              Out of Stock
            </Badge>
          )}
        </div>
      </div>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <Badge variant="secondary" className="text-xs" data-testid={`badge-category-${product.id}`}>
            {product.category.name}
          </Badge>
          {product.rating && parseFloat(product.rating) > 0 && (
            <div className="flex items-center text-yellow-400">
              <Star className="w-4 h-4 fill-current" />
              <span className="text-xs text-muted-foreground ml-1" data-testid={`text-rating-${product.id}`}>
                {product.rating}
              </span>
            </div>
          )}
        </div>
        
        <h3 className="font-semibold text-card-foreground mb-2 line-clamp-2" data-testid={`text-title-${product.id}`}>
          {product.name}
        </h3>
        
        {product.description && (
          <p className="text-muted-foreground text-sm mb-3 line-clamp-2" data-testid={`text-description-${product.id}`}>
            {product.description}
          </p>
        )}
        
        {product.platform && (
          <p className="text-xs text-muted-foreground mb-2" data-testid={`text-platform-${product.id}`}>
            {product.platform}
          </p>
        )}
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {hasDiscount && (
                <span className="text-sm text-muted-foreground line-through" data-testid={`text-original-price-${product.id}`}>
                  ${product.originalPrice}
                </span>
              )}
              <span className="text-lg font-bold text-accent" data-testid={`text-price-${product.id}`}>
                ${product.price}
              </span>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleWishlistToggle}
              className={`p-2 ${isInWishlist ? 'text-red-500' : 'text-muted-foreground'}`}
              data-testid={`button-wishlist-mobile-${product.id}`}
            >
              <Heart className={`w-4 h-4 ${isInWishlist ? 'fill-current' : ''}`} />
            </Button>
          </div>
          
          <Button
            className="w-full hover:opacity-90 transition-opacity"
            onClick={handleAddToCart}
            disabled={isAdding || product.stock === 0}
            data-testid={`button-add-to-cart-${product.id}`}
          >
            {isAdding ? (
              <div className="flex items-center">
                <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full mr-2"></div>
                Adding...
              </div>
            ) : product.stock === 0 ? (
              'Out of Stock'
            ) : (
              <>
                <ShoppingCart className="w-4 h-4 mr-2" />
                Add to Cart
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
