"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import * as Popover from "@radix-ui/react-popover";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ShoppingBag, Check, Loader2, X } from "lucide-react";
import { formatPrice } from "@/lib/productHelpers";

const PurchasePopover = ({ product, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handlePurchase = async () => {
    setIsProcessing(true);

    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 2500));

    setIsProcessing(false);
    setIsSuccess(true);

    // Auto-close after success
    setTimeout(() => {
      setIsSuccess(false);
      setIsOpen(false);
    }, 2000);
  };

  const handleClose = () => {
    setIsOpen(false);
    setIsProcessing(false);
    setIsSuccess(false);
  };

  return (
    <Popover.Root open={isOpen} onOpenChange={setIsOpen}>
      <Popover.Trigger asChild>{children}</Popover.Trigger>

      <Popover.Portal>
        <Popover.Content className="w-80 z-50" sideOffset={5}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="premium-card luxury-shadow p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-gold" />
                  <h3 className="text-lg font-medium text-charcoal">
                    Confirm Purchase
                  </h3>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClose}
                  className="h-6 w-6 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <AnimatePresence mode="wait">
                {!isProcessing && !isSuccess && (
                  <motion.div
                    key="confirmation"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-4"
                  >
                    {/* Product Summary */}
                    <div className="flex gap-3">
                      <div className="w-16 h-16 bg-pearl rounded-lg overflow-hidden flex-shrink-0">
                        {product.image_url && (
                          <img
                            src={product.image_url}
                            alt={product.product_name}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-charcoal truncate">
                          {product.product_name}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {product.category}
                        </p>
                        <div className="text-lg font-medium text-charcoal mt-1">
                          {formatPrice(product.price)}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      <Button
                        onClick={handleClose}
                        variant="outline"
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handlePurchase}
                        className="flex-1 gold-gradient text-charcoal border-0"
                      >
                        <ShoppingBag className="w-4 h-4 mr-2" />
                        Confirm Purchase
                      </Button>
                    </div>
                  </motion.div>
                )}

                {isProcessing && (
                  <motion.div
                    key="processing"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center py-8"
                  >
                    <Loader2 className="w-8 h-8 text-gold animate-spin mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-charcoal mb-2">
                      Processing Payment
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Please wait while we process your purchase...
                    </p>
                  </motion.div>
                )}

                {isSuccess && (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="text-center py-8"
                  >
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Check className="w-8 h-8 text-green-600" />
                    </div>
                    <h4 className="text-lg font-medium text-charcoal mb-2">
                      Purchase Successful!
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Your order has been confirmed. You'll receive an email
                      shortly.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </motion.div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};

export { PurchasePopover };
