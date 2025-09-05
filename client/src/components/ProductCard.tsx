import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";
import { ProductWithCategory } from "@shared/schema";

interface ProductCardProps {
  product: ProductWithCategory;
  onAddToCart: (product: ProductWithCategory) => void;
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const hasDiscount = product.originalPrice && parseFloat(product.originalPrice) > parseFloat(product.price);

  return (
    <Card className="product-card bg-card rounded-lg overflow-hidden border border-border hover:shadow-lg transition-all duration-300 hover:-translate-y-2" data-testid={`card-product-${product.id}`}>
      <img
        src={product.imageUrl || "https://images.unsplash.com/photo-1542751371-adc38448a05e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=225"}
        alt={product.name}
        className="w-full h-48 object-cover"
        data-testid={`img-product-${product.id}`}
      />
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
            size="sm"
            onClick={() => onAddToCart(product)}
            className="hover:opacity-90 transition-opacity"
            data-testid={`button-add-to-cart-${product.id}`}
          >
            Add to Cart
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
