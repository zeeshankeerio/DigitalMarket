import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { CreditCard, Bitcoin, ArrowLeft, Lock, Shield } from "lucide-react";
import { Link } from "wouter";

// Load Stripe
if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: string;
  quantity: number;
  imageUrl?: string;
  platform?: string;
}

const CheckoutForm = ({ cartItems, total }: { cartItems: CartItem[], total: number }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/profile`,
          receipt_email: user?.email || undefined,
        },
      });

      if (error) {
        toast({
          title: "Payment Failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Payment Successful",
          description: "Check your email for download instructions!",
        });
      }
    } catch (error) {
      toast({
        title: "Payment Failed",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-muted/50 p-4 rounded-lg">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-5 h-5 text-accent" />
          <span className="text-sm font-medium">Secure Payment</span>
        </div>
        <PaymentElement />
      </div>

      <Button 
        type="submit" 
        className="w-full" 
        size="lg"
        disabled={!stripe || isProcessing}
        data-testid="button-complete-payment"
      >
        {isProcessing ? (
          <div className="flex items-center">
            <div className="animate-spin w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full mr-2"></div>
            Processing...
          </div>
        ) : (
          <>
            <Lock className="w-4 h-4 mr-2" />
            Complete Purchase - ${total.toFixed(2)}
          </>
        )}
      </Button>
    </form>
  );
};

export default function Checkout() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [paymentMethod, setPaymentMethod] = useState("stripe");
  const [clientSecret, setClientSecret] = useState("");
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoadingCart, setIsLoadingCart] = useState(true);
  
  // Load cart items from localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem('digitalstore-cart');
    const checkoutItems = localStorage.getItem('checkout-items');
    
    if (checkoutItems) {
      try {
        const items = JSON.parse(checkoutItems);
        setCartItems(items);
        // Clear checkout items after loading
        localStorage.removeItem('checkout-items');
      } catch (e) {
        console.error('Failed to parse checkout items:', e);
      }
    } else if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (e) {
        console.error('Failed to parse saved cart:', e);
      }
    }
    
    setIsLoadingCart(false);
  }, []);

  const subtotal = cartItems.reduce((sum, item) => sum + parseFloat(item.price) * item.quantity, 0);
  const processingFee = 2.99;
  const total = subtotal + processingFee;

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please log in to continue with checkout.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  // Create payment intent
  useEffect(() => {
    if (isAuthenticated && cartItems.length > 0) {
      const createPaymentIntent = async () => {
        try {
          const response = await apiRequest("POST", "/api/create-payment-intent", {
            cartItems: cartItems.map(item => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
            })),
            total,
          });
          const data = await response.json();
          setClientSecret(data.clientSecret);
        } catch (error) {
          if (isUnauthorizedError(error as Error)) {
            toast({
              title: "Session Expired",
              description: "Please log in again.",
              variant: "destructive",
            });
            setTimeout(() => {
              window.location.href = "/api/login";
            }, 500);
            return;
          }
          toast({
            title: "Error",
            description: "Failed to initialize payment. Please try again.",
            variant: "destructive",
          });
        }
      };

      createPaymentIntent();
    }
  }, [isAuthenticated, cartItems, total, toast]);

  if (isLoading || isLoadingCart) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        <span className="ml-3 text-muted-foreground">
          {isLoading ? 'Loading...' : 'Loading cart...'}
        </span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Your cart is empty</h1>
          <p className="text-muted-foreground mb-8">Add some products to your cart to continue.</p>
          <Link href="/" data-testid="link-back-to-shop">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Shop
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Link href="/" data-testid="link-back-home">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Shop
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-foreground mb-2">Checkout</h1>
        <p className="text-muted-foreground">Complete your purchase securely</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Order Summary */}
        <div>
          <Card data-testid="card-order-summary">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-center space-x-4" data-testid={`checkout-item-${item.id}`}>
                  {item.imageUrl && (
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                  )}
                  <div className="flex-1">
                    <h4 className="font-medium text-foreground" data-testid={`checkout-item-name-${item.id}`}>
                      {item.name}
                    </h4>
                    {item.platform && (
                      <p className="text-sm text-muted-foreground">
                        {item.platform}
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground">
                      Qty: {item.quantity}
                    </p>
                  </div>
                  <p className="font-medium text-accent" data-testid={`checkout-item-price-${item.id}`}>
                    ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal:</span>
                  <span className="font-medium" data-testid="checkout-subtotal">
                    ${subtotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Processing Fee:</span>
                  <span className="font-medium" data-testid="checkout-processing-fee">
                    ${processingFee.toFixed(2)}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-lg font-medium">Total:</span>
                  <span className="text-2xl font-bold text-accent" data-testid="checkout-total">
                    ${total.toFixed(2)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payment Form */}
        <div>
          <Card data-testid="card-payment-form">
            <CardHeader>
              <CardTitle>Payment Method</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Payment Method Selection */}
              <div className="mb-6">
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                  <div className="flex items-center space-x-2 p-4 border border-border rounded-lg cursor-pointer hover:bg-muted">
                    <RadioGroupItem value="stripe" id="stripe" data-testid="radio-stripe" />
                    <Label htmlFor="stripe" className="flex items-center cursor-pointer flex-1">
                      <CreditCard className="w-5 h-5 mr-2 text-blue-500" />
                      Credit Card (Stripe)
                      <Badge variant="secondary" className="ml-auto text-xs">Recommended</Badge>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-4 border border-border rounded-lg cursor-pointer hover:bg-muted opacity-50">
                    <RadioGroupItem value="crypto" id="crypto" disabled data-testid="radio-crypto" />
                    <Label htmlFor="crypto" className="flex items-center cursor-pointer flex-1">
                      <Bitcoin className="w-5 h-5 mr-2 text-orange-500" />
                      Cryptocurrency
                      <Badge variant="outline" className="ml-auto text-xs">Coming Soon</Badge>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Stripe Payment Form */}
              {paymentMethod === "stripe" && (
                <div>
                  {!clientSecret ? (
                    <div className="text-center py-8">
                      <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
                      <p className="text-muted-foreground">Initializing secure payment...</p>
                    </div>
                  ) : (
                    <Elements 
                      stripe={stripePromise} 
                      options={{ 
                        clientSecret,
                        appearance: {
                          theme: 'stripe',
                          variables: {
                            colorPrimary: 'hsl(217 91% 60%)',
                            colorBackground: 'hsl(222 20% 11%)',
                            colorText: 'hsl(213 31% 91%)',
                            colorDanger: 'hsl(0 63% 31%)',
                            fontFamily: 'Inter, system-ui, sans-serif',
                            spacingUnit: '4px',
                            borderRadius: '12px',
                          }
                        }
                      }}
                    >
                      <CheckoutForm cartItems={cartItems} total={total} />
                    </Elements>
                  )}
                </div>
              )}

              {/* Crypto Payment (Disabled) */}
              {paymentMethod === "crypto" && (
                <div className="text-center p-8 border border-border rounded-lg bg-muted/20">
                  <Bitcoin className="w-16 h-16 text-orange-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Cryptocurrency Payments</h3>
                  <p className="text-muted-foreground">
                    Crypto payments are coming soon. Please use credit card for now.
                  </p>
                </div>
              )}

              {/* Security Notice */}
              <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Shield className="w-4 h-4" />
                  <span>
                    Your payment information is encrypted and secure. 
                    Digital products will be delivered instantly after payment confirmation.
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
