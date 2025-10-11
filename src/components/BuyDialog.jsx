"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ShoppingBag, X, CheckCircle, Loader2 } from "lucide-react";
import PropTypes from "prop-types";

const BuyDialog = ({ isOpen, onClose, product }) => {
  const [paymentState, setPaymentState] = useState("idle"); // idle, processing, success
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);

  if (!product) return null;

  // Reset state when dialog opens
  useEffect(() => {
    if (isOpen) {
      setPaymentState("idle");
      setProgress(0);
      setCurrentStep(0);
    }
  }, [isOpen]);

  const handleConfirm = async () => {
    setPaymentState("processing");

    // Simulate payment progress
    const steps = [
      { message: "Processing your selection...", progress: 33 },
      { message: "Secure payment processing...", progress: 66 },
      { message: "Finalizing your order...", progress: 100 },
    ];

    for (let i = 0; i < steps.length; i++) {
      setCurrentStep(i);
      setProgress(steps[i].progress);
      await new Promise((resolve) => setTimeout(resolve, 800));
    }

    setPaymentState("success");

    // Redirect after 1.5 seconds
    setTimeout(() => {
      window.location.href = "/recommendations";
    }, 1500);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={onClose}
          />

          {/* Dialog */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.3, type: "spring" }}
              className="w-full max-w-lg"
            >
              <Card className="premium-card luxury-shadow overflow-hidden">
                {/* Close Button */}
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 z-10 p-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5 text-charcoal" />
                </button>

                {/* Header */}
                <div className="gold-gradient p-6 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-white rounded-full flex items-center justify-center">
                    {paymentState === "success" ? (
                      <CheckCircle className="w-8 h-8 text-green-600" />
                    ) : paymentState === "processing" ? (
                      <Loader2 className="w-8 h-8 text-gold animate-spin" />
                    ) : (
                      <ShoppingBag className="w-8 h-8 text-gold" />
                    )}
                  </div>
                  <h2 className="text-2xl font-medium text-charcoal">
                    {paymentState === "success"
                      ? "Order Confirmed!"
                      : paymentState === "processing"
                      ? "Processing Payment..."
                      : "Confirm Your Selection"}
                  </h2>
                  <p className="text-sm text-charcoal/70 mt-2">
                    {paymentState === "success"
                      ? "Your order has been successfully placed!"
                      : paymentState === "processing"
                      ? "Please wait while we process your payment"
                      : "You're about to select this beautiful piece"}
                  </p>
                </div>

                {/* Product Summary */}
                <div className="p-6 space-y-6">
                  {/* Progress Bar - Show only during processing */}
                  {paymentState === "processing" && (
                    <div className="space-y-4">
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <motion.div
                          className="bg-gradient-to-r from-gold to-gold/80 h-3 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: 0.5 }}
                        />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium text-charcoal">
                          {currentStep === 0 && "Processing your selection..."}
                          {currentStep === 1 && "Secure payment processing..."}
                          {currentStep === 2 && "Finalizing your order..."}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {progress}% Complete
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Product Image - Hide during processing */}
                  {paymentState !== "processing" &&
                    (product.image_url || product.image) && (
                      <div className="aspect-square w-full max-w-xs mx-auto overflow-hidden rounded-lg bg-pearl">
                        <img
                          src={product.image_url || product.image}
                          alt={product.product_name || product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                  {/* Product Details - Hide during processing */}
                  {paymentState !== "processing" && (
                    <div className="text-center space-y-3">
                      <h3 className="text-xl font-medium text-charcoal">
                        {product.product_name || product.name}
                      </h3>

                      {product.collection_name && (
                        <p className="text-sm text-muted-foreground">
                          {product.collection_name}
                        </p>
                      )}

                      <div className="flex items-center justify-center gap-2">
                        <span className="text-3xl font-bold text-charcoal">
                          ₹{product.price?.toLocaleString("en-IN")}
                        </span>
                      </div>

                      {product.matchPercentage && (
                        <div className="inline-block">
                          <div className="px-4 py-2 rounded-full bg-green-100 border border-green-200">
                            <span className="text-sm font-medium text-green-800">
                              {product.matchPercentage}% Match for You
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Action Buttons - Show only when not processing */}
                  {paymentState !== "processing" && (
                    <div className="flex gap-3 pt-4">
                      <Button
                        onClick={onClose}
                        variant="outline"
                        className="flex-1 h-12 text-base"
                        disabled={paymentState === "success"}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleConfirm}
                        className="flex-1 h-12 text-base gold-gradient text-charcoal border-0"
                        disabled={paymentState === "success"}
                      >
                        <ShoppingBag className="w-5 h-5 mr-2" />
                        Confirm Selection
                      </Button>
                    </div>
                  )}

                  {/* Additional Info - Hide during processing */}
                  {paymentState !== "processing" && (
                    <p className="text-xs text-center text-muted-foreground pt-2">
                      A consultant will assist you with your purchase
                    </p>
                  )}
                </div>
              </Card>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

BuyDialog.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  product: PropTypes.object,
};

export { BuyDialog };
