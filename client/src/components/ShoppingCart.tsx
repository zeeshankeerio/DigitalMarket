import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Minus, Plus, Trash2 } from "lucide-react";
import { Link } from "wouter";

interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: string;
  quantity: number;
  imageUrl?: string;
  platform?: string;
}

interface ShoppingCartProps {
  items: CartItem[];
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemoveItem: (id: string) => void;
}

export function ShoppingCart({ items, onUpdateQuantity, onRemoveItem }: ShoppingCartProps) {
  const subtotal = items.reduce((sum, item) => sum + parseFloat(item.price) * item.quantity, 0);
  const processingFee = 2.99;
  const total = subtotal + processingFee;

  if (items.length === 0) {
    return (
      <div className="h-full flex flex-col">
        <div className="p-6 border-b border-border">
          <h3 className="text-xl font-bold text-card-foreground">Shopping Cart</h3>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">Your cart is empty</p>
            <Link href="/" data-testid="link-continue-shopping">
              <Button>Continue Shopping</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-6 border-b border-border">
        <h3 className="text-xl font-bold text-card-foreground">Shopping Cart</h3>
      </div>

      {/* Cart Items */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="flex items-center space-x-4 p-4 bg-muted rounded-lg" data-testid={`cart-item-${item.id}`}>
              {item.imageUrl && (
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-16 h-16 rounded-lg object-cover"
                  data-testid={`img-cart-item-${item.id}`}
                />
              )}
              
              <div className="flex-1">
                <h4 className="font-medium text-card-foreground" data-testid={`text-cart-item-name-${item.id}`}>
                  {item.name}
                </h4>
                {item.platform && (
                  <p className="text-sm text-muted-foreground" data-testid={`text-cart-item-platform-${item.id}`}>
                    {item.platform}
                  </p>
                )}
                
                <div className="flex items-center mt-2">
                  <Button
                    size="icon"
                    variant="outline"
                    className="w-8 h-8"
                    onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                    data-testid={`button-decrease-${item.id}`}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="mx-3 font-medium min-w-[2rem] text-center" data-testid={`text-quantity-${item.id}`}>
                    {item.quantity}
                  </span>
                  <Button
                    size="icon"
                    variant="outline"
                    className="w-8 h-8"
                    onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                    data-testid={`button-increase-${item.id}`}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              <div className="text-right">
                <p className="font-bold text-accent" data-testid={`text-cart-item-price-${item.id}`}>
                  ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemoveItem(item.id)}
                  className="text-destructive hover:text-destructive mt-1 p-0 h-auto"
                  data-testid={`button-remove-${item.id}`}
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Remove
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cart Footer */}
      <div className="p-6 border-t border-border bg-card">
        <div className="space-y-2 mb-4">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal:</span>
            <span className="font-medium" data-testid="text-subtotal">
              ${subtotal.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Processing Fee:</span>
            <span className="font-medium" data-testid="text-processing-fee">
              ${processingFee.toFixed(2)}
            </span>
          </div>
          <Separator />
          <div className="flex justify-between items-center">
            <span className="text-lg font-medium text-card-foreground">Total:</span>
            <span className="text-2xl font-bold text-accent" data-testid="text-total">
              ${total.toFixed(2)}
            </span>
          </div>
        </div>
        
        <Link href="/checkout" data-testid="link-checkout">
          <Button className="w-full" size="lg">
            Proceed to Checkout
          </Button>
        </Link>
        
        <p className="text-xs text-muted-foreground text-center mt-2">
          Secure checkout with Stripe & crypto payments
        </p>
      </div>
    </div>
  );
}
