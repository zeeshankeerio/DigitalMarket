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
import { AlertTriangle, DollarSign, Package } from "lucide-react";
import { OrderWithItems } from "@shared/schema";

interface RefundRequestProps {
  isOpen: boolean;
  onClose: () => void;
  order: OrderWithItems;
}

export function RefundRequest({ isOpen, onClose, order }: RefundRequestProps) {
  const [reason, setReason] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createRefundMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/refunds", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Refund Request Submitted",
        description: "Your refund request has been submitted and will be reviewed by our team.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/refunds"] });
      onClose();
      setReason("");
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Submit Refund",
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
        description: "Please provide a reason for your refund request.",
        variant: "destructive",
      });
      return;
    }

    createRefundMutation.mutate({
      orderId: order.id,
      reason,
      amount: order.total,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl" data-testid="modal-refund-request">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Request Refund
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

          {/* Refund Policy Notice */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-yellow-800 dark:text-yellow-200 mb-1">
                  Refund Policy
                </p>
                <p className="text-yellow-700 dark:text-yellow-300">
                  Digital products can be refunded within 14 days of purchase if the product keys haven't been redeemed. 
                  Refunds are processed within 5-7 business days after approval.
                </p>
              </div>
            </div>
          </div>

          {/* Reason for Refund */}
          <div className="space-y-2">
            <Label htmlFor="reason">
              Reason for Refund Request <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="reason"
              placeholder="Please explain why you are requesting a refund. Include any details about issues with the product or service."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              required
              data-testid="textarea-refund-reason"
            />
            <p className="text-xs text-muted-foreground">
              Minimum 10 characters required. Be specific about your concerns.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              data-testid="button-cancel-refund"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createRefundMutation.isPending || reason.length < 10}
              className="flex-1"
              data-testid="button-submit-refund"
            >
              {createRefundMutation.isPending ? "Submitting..." : "Submit Refund Request"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}