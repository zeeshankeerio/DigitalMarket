import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, XCircle, Package } from "lucide-react";
import { OrderWithItems } from "@shared/schema";

interface OrderCancellationProps {
  isOpen: boolean;
  onClose: () => void;
  order: OrderWithItems;
}

export function OrderCancellation({ isOpen, onClose, order }: OrderCancellationProps) {
  const [reason, setReason] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const cancelOrderMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/order-cancellations", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Cancellation Request Submitted",
        description: "Your order cancellation request has been submitted for review.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/order-cancellations"] });
      onClose();
      setReason("");
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Cancel Order",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      toast({
        title: "Reason Required",
        description: "Please provide a reason for cancelling your order.",
        variant: "destructive",
      });
      return;
    }

    cancelOrderMutation.mutate({
      orderId: order.id,
      reason,
    });
  };

  const canCancelOrder = () => {
    // Orders can typically be cancelled if they're not yet completed or delivered
    return order.status === 'pending' || order.status === 'processing';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl" data-testid="modal-order-cancellation">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <XCircle className="w-5 h-5" />
            Cancel Order
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Order Summary */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-semibold text-foreground" data-testid="order-id">
                    Order #{order.id.slice(-8)}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <div className="text-right">
                  <Badge variant="secondary" data-testid="order-status">
                    {order.status}
                  </Badge>
                  <p className="text-lg font-bold text-foreground mt-1" data-testid="order-total">
                    ${order.total}
                  </p>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium">Items in this order:</Label>
                {order.orderItems?.map((item, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-t border-border first:border-t-0">
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm" data-testid={`item-name-${index}`}>
                        {item.product?.name}
                      </span>
                    </div>
                    <span className="text-sm font-medium" data-testid={`item-price-${index}`}>
                      ${item.price}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Cancellation Policy */}
          {canCancelOrder() ? (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Package className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-blue-800 dark:text-blue-200 mb-1">
                    Cancellation Policy
                  </p>
                  <p className="text-blue-700 dark:text-blue-300">
                    Orders that haven't been processed can be cancelled without penalty. 
                    Once digital keys are delivered, cancellations require refund approval.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-yellow-800 dark:text-yellow-200 mb-1">
                    Cannot Cancel
                  </p>
                  <p className="text-yellow-700 dark:text-yellow-300">
                    This order cannot be cancelled as it has already been processed or completed. 
                    Please submit a refund request instead if you need assistance.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Reason for Cancellation */}
          {canCancelOrder() && (
            <>
              <div className="space-y-2">
                <Label htmlFor="reason">
                  Reason for Cancellation <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="reason"
                  placeholder="Please explain why you want to cancel this order."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={4}
                  required
                  data-testid="textarea-cancellation-reason"
                />
                <p className="text-xs text-muted-foreground">
                  This information helps us improve our service.
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="flex-1"
                  data-testid="button-cancel-cancellation"
                >
                  Keep Order
                </Button>
                <Button
                  type="submit"
                  disabled={cancelOrderMutation.isPending || reason.length < 5}
                  variant="destructive"
                  className="flex-1"
                  data-testid="button-submit-cancellation"
                >
                  {cancelOrderMutation.isPending ? "Cancelling..." : "Cancel Order"}
                </Button>
              </div>
            </>
          )}

          {/* Actions for non-cancellable orders */}
          {!canCancelOrder() && (
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
                data-testid="button-close-cancellation"
              >
                Close
              </Button>
            </div>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}