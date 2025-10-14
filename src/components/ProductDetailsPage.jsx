"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BuyDialog } from "@/components/BuyDialog";
import { ConsultationChat } from "@/components/ConsultationChat";

import {
  ShoppingBag,
  MessageCircle,
  Star,
  ArrowLeft,
  Heart,
  Share2,
  TrendingUp,
  Award,
} from "lucide-react";
import {
  formatPrice,
  getCategoryDisplayName,
  parseUrlTags,
} from "@/lib/productHelpers";
import { useRouter, useSearchParams } from "next/navigation";
import PropTypes from "prop-types";

const ProductDetailsPage = ({ product }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userRequirements = parseUrlTags(searchParams);
  const [showBuyDialog, setShowBuyDialog] = useState(false);

  if (!product) {
    return (
      <div className="min-h-screen hero-gradient flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-medium text-charcoal mb-4">
            Product Not Found
          </h1>
          <Button
            onClick={() => router.back()}
            className="gold-gradient text-charcoal border-0"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen hero-gradient">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Navigation */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Button
            variant="ghost"
            onClick={() => {
              // Check if we came from recommendations page
              const referrer = document.referrer;
              if (referrer.includes("/recommendations")) {
                router.back();
              } else {
                // If no referrer or not from recommendations, go to recommendations page
                router.push("/recommendations");
              }
            }}
            className="text-charcoal hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Recommendations
          </Button>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Image */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-4"
          >
            <Card className="premium-card luxury-shadow overflow-hidden">
              <div className="aspect-square bg-pearl">
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.product_name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.nextSibling.style.display = "flex";
                    }}
                  />
                ) : null}
                <div
                  className="w-full h-full flex items-center justify-center text-muted-foreground"
                  style={{ display: product.image_url ? "none" : "flex" }}
                >
                  <div className="text-center">
                    <div className="w-20 h-20 bg-gold/20 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <span className="text-3xl">💎</span>
                    </div>
                    <p className="text-sm font-medium">Jewelry Image</p>
                    <p className="text-xs text-muted-foreground">Coming Soon</p>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Product Information */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-12 min-h-[80vh] flex flex-col"
          >
            {/* Product Header */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary" className="text-sm">
                  {getCategoryDisplayName(product.category)}
                </Badge>
                {product.collection_name && (
                  <Badge variant="outline" className="text-sm">
                    {product.collection_name}
                  </Badge>
                )}
              </div>

              <h1 className="text-3xl font-light text-charcoal mb-2">
                {product.product_name}
              </h1>

              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-gold text-gold" />
                ))}
                <span className="text-sm text-muted-foreground ml-2">
                  (4.9)
                </span>
              </div>

              <div className="text-3xl font-light text-charcoal mb-6">
                {formatPrice(product.price)}
              </div>
            </div>

            {/* ACTION BUTTONS - MOVED TO TOP */}
            <div className="flex gap-4">
              <Button
                onClick={() => setShowBuyDialog(true)}
                className="flex-1 h-14 gold-gradient text-charcoal border-0 hover:shadow-[var(--shadow-glow)] text-base font-medium"
              >
                <ShoppingBag className="w-5 h-5 mr-2" />
                Click to Buy
              </Button>

              <ConsultationChat product={product}>
                <button className="relative inline-flex h-[56px] overflow-hidden rounded-md p-[1px] focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2 focus:ring-offset-slate-50">
                  <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#FFD700_0%,#B8860B_50%,#FFD700_100%)]" />
                  <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-md bg-white px-3 py-1 text-sm font-medium text-charcoal backdrop-blur-3xl">
                    <MessageCircle className="w-5 h-5 mr-2" />
                    Speak to Evol-e
                  </span>
                </button>
              </ConsultationChat>
            </div>

            {/* Key Features - Moved after action buttons */}
            {product.tags && product.tags.length > 0 && (
              <Card className="p-6 border border-gold/20 bg-white/50 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 bg-gold/20 rounded-full flex items-center justify-center">
                    <Star className="w-3 h-3 text-gold fill-gold" />
                  </div>
                  <h4 className="text-sm font-semibold text-charcoal">
                    Key Features
                  </h4>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.tags.slice(0, 8).map((tag, index) => (
                    <Badge
                      key={index}
                      className="text-xs px-3 py-1.5 gold-gradient text-charcoal border-0 font-medium"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </Card>
            )}
          </motion.div>
        </div>

        {/* BOTTOM SECTION - Stats & Details */}
        <div className="mt-16 space-y-12">
          {/* Tags Comparison */}
          {userRequirements.allTags && userRequirements.allTags.length > 0 && (
            <div className="grid grid-cols-2 gap-8">
              {/* What You Requested */}
              <Card className="p-8 border-2 border-blue-200 bg-gradient-to-br from-blue-50/80 to-white shadow-sm">
                <h4 className="text-sm font-semibold text-blue-900 mb-4 flex items-center">
                  <span className="w-2.5 h-2.5 bg-blue-500 rounded-full mr-2"></span>
                  What You Requested
                </h4>
                <div className="flex flex-wrap gap-2">
                  {userRequirements.allTags.slice(0, 6).map((tag, index) => (
                    <Badge
                      key={index}
                      className="text-xs px-3 py-1.5 bg-blue-100 text-blue-900 border-blue-300 font-medium"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </Card>

              {/* This Product Offers */}
              <Card className="p-8 border-2 border-amber-200 bg-gradient-to-br from-amber-50/80 to-white shadow-sm">
                <h4 className="text-sm font-semibold text-amber-900 mb-4 flex items-center">
                  <span className="w-2.5 h-2.5 bg-amber-500 rounded-full mr-2"></span>
                  This Product Offers
                </h4>
                <div className="flex flex-wrap gap-2">
                  {product.tags &&
                    product.tags.slice(0, 6).map((tag, index) => (
                      <Badge
                        key={index}
                        className="text-xs px-3 py-1.5 bg-amber-100 text-amber-900 border-amber-300 font-medium"
                      >
                        {tag}
                      </Badge>
                    ))}
                </div>
              </Card>
            </div>
          )}
        </div>

        {/* Match Visualization */}
        {userRequirements.allTags && userRequirements.allTags.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-12"
          ></motion.div>
        )}
      </div>

      {/* Buy Dialog */}
      <BuyDialog
        isOpen={showBuyDialog}
        onClose={() => setShowBuyDialog(false)}
        product={product}
      />
    </div>
  );
};

ProductDetailsPage.propTypes = {
  product: PropTypes.shape({
    id: PropTypes.string,
    category: PropTypes.string,
    product_name: PropTypes.string,
    price: PropTypes.number,
    collection_name: PropTypes.string,
    image_url: PropTypes.string,
    tags: PropTypes.arrayOf(PropTypes.string),
    metadata: PropTypes.object,
    matchPercentage: PropTypes.number,
    matchedTags: PropTypes.arrayOf(PropTypes.string),
    additionalFeatures: PropTypes.arrayOf(PropTypes.string),
  }),
};

export { ProductDetailsPage };
