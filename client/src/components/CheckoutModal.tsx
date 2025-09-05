import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { CreditCard, Bitcoin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: string;
  quantity: number;
}

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  total: number;
}

export function CheckoutModal({ isOpen, onClose, cartItems, total }: CheckoutModalProps) {
  const [paymentMethod, setPaymentMethod] = useState("stripe");
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 3000));

      toast({
        title: "Payment Successful",
        description: "Check your email for download instructions.",
      });

      onClose();
    } catch (error) {
      toast({
        title: "Payment Failed",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const processingFee = 2.99;
  const subtotal = total - processingFee;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="modal-checkout">
        <DialogHeader>
          <DialogTitle>Checkout</DialogTitle>
        </DialogHeader>

        <form onSubmit={handlePayment} className="space-y-6">
          {/* Payment Methods */}
          <div>
            <Label className="text-base font-medium">Payment Method</Label>
            <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="mt-2">
              <div className="flex items-center space-x-2 p-4 border border-border rounded-lg cursor-pointer hover:bg-muted">
                <RadioGroupItem value="stripe" id="stripe" data-testid="radio-stripe" />
                <Label htmlFor="stripe" className="flex items-center cursor-pointer">
                  <CreditCard className="w-5 h-5 mr-2 text-blue-500" />
                  Credit Card (Stripe)
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-4 border border-border rounded-lg cursor-pointer hover:bg-muted">
                <RadioGroupItem value="crypto" id="crypto" data-testid="radio-crypto" />
                <Label htmlFor="crypto" className="flex items-center cursor-pointer">
                  <Bitcoin className="w-5 h-5 mr-2 text-orange-500" />
                  Cryptocurrency
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Payment Form */}
          {paymentMethod === "stripe" && (
            <div className="space-y-4">
              <Label className="text-base font-medium">Card Information</Label>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor="cardNumber">Card Number</Label>
                  <Input
                    id="cardNumber"
                    placeholder="1234 5678 9012 3456"
                    required
                    data-testid="input-card-number"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="expiry">Expiry Date</Label>
                    <Input
                      id="expiry"
                      placeholder="MM/YY"
                      required
                      data-testid="input-expiry"
                    />
                  </div>
                  <div>
                    <Label htmlFor="cvc">CVC</Label>
                    <Input
                      id="cvc"
                      placeholder="123"
                      required
                      data-testid="input-cvc"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {paymentMethod === "crypto" && (
            <div className="space-y-4">
              <Label className="text-base font-medium">Select Cryptocurrency</Label>
              <div className="grid grid-cols-3 gap-4">
                <Button
                  type="button"
                  variant="outline"
                  className="p-6 h-auto flex flex-col items-center"
                  data-testid="button-bitcoin"
                >
                  <Bitcoin className="w-8 h-8 text-orange-500 mb-2" />
                  <span className="text-sm font-medium">Bitcoin</span>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="p-6 h-auto flex flex-col items-center"
                  data-testid="button-ethereum"
                >
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mb-2">
                    <span className="text-white text-xs font-bold">Ξ</span>
                  </div>
                  <span className="text-sm font-medium">Ethereum</span>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="p-6 h-auto flex flex-col items-center"
                  data-testid="button-usdc"
                >
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mb-2">
                    <span className="text-white text-xs font-bold">$</span>
                  </div>
                  <span className="text-sm font-medium">USDC</span>
                </Button>
              </div>
            </div>
          )}

          {/* Order Summary */}
          <div className="p-4 bg-muted rounded-lg">
            <Label className="text-base font-medium">Order Summary</Label>
            <div className="space-y-2 mt-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal:</span>
                <span className="font-medium" data-testid="text-order-subtotal">
                  ${subtotal.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Processing Fee:</span>
                <span className="font-medium" data-testid="text-order-processing-fee">
                  ${processingFee.toFixed(2)}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium">Total:</span>
                <span className="text-xl font-bold text-accent" data-testid="text-order-total">
                  ${total.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={isProcessing}
            data-testid="button-complete-purchase"
          >
            {isProcessing ? (
              <div className="flex items-center">
                <div className="loading-spinner w-5 h-5 mr-2"></div>
                Processing...
              </div>
            ) : (
              "Complete Purchase"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
