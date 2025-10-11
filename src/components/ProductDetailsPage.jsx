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
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-muted rounded-full mx-auto mb-4"></div>
                      <p>Image coming soon</p>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Image Actions */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 border-2 border-gold/30 bg-white"
              >
                <Heart className="w-4 h-4 mr-2" />
                Save
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 border-2 border-gold/30 bg-white"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </motion.div>

          {/* Product Information */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-8 min-h-[80vh] flex flex-col justify-between"
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

            {/* Key Features - Style & Features tags */}
            {product.tags && product.tags.length > 0 && (
              <Card className="p-6 border-2 border-gold/20 bg-gradient-to-br from-gold/5 to-white shadow-sm">
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
                      key={index * 2}
                      className="text-xs px-3 py-1.5 gold-gradient text-charcoal border-0 font-medium"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </Card>
            )}

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
                <Button
                  variant="outline"
                  className="flex-1 h-14 border-2 border-gold/30 bg-white text-base font-medium"
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Consult
                </Button>
              </ConsultationChat>
            </div>
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

          {/* Match Analysis */}
          {userRequirements.allTags && userRequirements.allTags.length > 0 && (
            <Card className="p-6 border-2 border-gold/30 bg-gradient-to-br from-gold/5 to-white shadow-sm">
              <h4 className="text-base font-semibold text-charcoal mb-4 flex items-center gap-2">
                <span className="text-2xl">🎯</span> Perfect Match Analysis
              </h4>

              {/* Match Scores Grid - Improved Design */}
              <div className="grid grid-cols-3 gap-6 mb-8">
                {/* Overall Match */}
                <div className="text-center">
                  <div className="relative w-20 h-20 mx-auto mb-3">
                    <div className="w-20 h-20 rounded-full border-4 border-gray-200 flex items-center justify-center bg-gradient-to-br from-gold/10 to-gold/5">
                      <div className="w-16 h-16 rounded-full border-4 border-gold flex items-center justify-center bg-white shadow-sm">
                        <span className="text-lg font-bold text-charcoal">
                          {product.matchPercentage || 0}%
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-charcoal">
                    Overall Match
                  </p>
                </div>

                {/* Tags Match */}
                <div className="text-center">
                  <div className="relative w-20 h-20 mx-auto mb-3">
                    <div className="w-20 h-20 rounded-full border-4 border-gray-200 flex items-center justify-center bg-gradient-to-br from-green-100 to-green-50">
                      <div className="w-16 h-16 rounded-full border-4 border-green-500 flex items-center justify-center bg-white shadow-sm">
                        <span className="text-lg font-bold text-charcoal">
                          75%
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-charcoal">
                    Tags Match
                  </p>
                </div>

                {/* Metadata Match */}
                <div className="text-center">
                  <div className="relative w-20 h-20 mx-auto mb-3">
                    <div className="w-20 h-20 rounded-full border-4 border-gray-200 flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-50">
                      <div className="w-16 h-16 rounded-full border-4 border-blue-500 flex items-center justify-center bg-white shadow-sm">
                        <span className="text-lg font-bold text-charcoal">
                          85%
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-charcoal">
                    Metadata Match
                  </p>
                </div>
              </div>

              {/* Matched Features */}
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-semibold text-charcoal/80 mb-3">
                    What Matches:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {product.matchedTags &&
                      product.matchedTags.slice(0, 6).map((tag, index) => (
                        <Badge
                          key={index}
                          className="text-xs px-3 py-1.5 bg-green-100 text-green-800 border-green-300 font-medium"
                        >
                          ✓ {tag}
                        </Badge>
                      ))}
                  </div>
                </div>

                {product.additionalFeatures &&
                  product.additionalFeatures.length > 0 && (
                    <div>
                      <p className="text-sm font-semibold text-charcoal/80 mb-3">
                        Bonus Features:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {product.additionalFeatures
                          .slice(0, 4)
                          .map((feature, index) => (
                            <Badge
                              key={index}
                              className="text-xs px-3 py-1.5 bg-gold/10 text-gold border border-gold/30 font-medium"
                            >
                              + {feature}
                            </Badge>
                          ))}
                      </div>
                    </div>
                  )}
              </div>
            </Card>
          )}

          {/* Product Details */}
          {product.metadata && (
            <div className="space-y-5">
              <h3 className="text-lg font-semibold text-charcoal flex items-center gap-2">
                <div className="w-2 h-2 bg-gold rounded-full"></div>
                Product Details
              </h3>

              {/* Main Metrics Row */}
              <div className="grid grid-cols-2 gap-4">
                {/* Style Intensity */}
                {product.metadata.style_intensity && (
                  <Card className="p-5 border-2 border-gold/30 bg-gradient-to-br from-gold/5 to-gold/10">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gold/20 rounded-full flex items-center justify-center">
                          <TrendingUp className="w-4 h-4 text-gold" />
                        </div>
                        <span className="text-sm font-semibold text-charcoal">
                          Style Intensity
                        </span>
                      </div>
                      <div className="text-2xl font-bold text-charcoal">
                        {product.metadata.style_intensity}/10
                      </div>
                    </div>
                    <div className="w-full bg-white/60 rounded-full h-2 mb-2">
                      <div
                        className="bg-gradient-to-r from-gold to-gold/80 h-2 rounded-full transition-all duration-500"
                        style={{
                          width: `${product.metadata.style_intensity * 10}%`,
                        }}
                      ></div>
                    </div>
                    <p className="text-xs text-charcoal/70 font-medium">
                      {product.metadata.style_intensity >= 8
                        ? "Dramatic & Eye-catching"
                        : product.metadata.style_intensity >= 6
                        ? "Bold & Confident"
                        : product.metadata.style_intensity >= 4
                        ? "Moderate & Balanced"
                        : "Subtle & Refined"}
                    </p>
                  </Card>
                )}

                {/* Formality Level */}
                {product.metadata.formality_level && (
                  <Card className="p-5 border-2 border-gold/30 bg-gradient-to-br from-gold/5 to-gold/10">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gold/20 rounded-full flex items-center justify-center">
                          <Award className="w-4 h-4 text-gold" />
                        </div>
                        <span className="text-sm font-semibold text-charcoal">
                          Formality Level
                        </span>
                      </div>
                      <div className="text-2xl font-bold text-charcoal">
                        {product.metadata.formality_level}/10
                      </div>
                    </div>
                    <div className="w-full bg-white/60 rounded-full h-2 mb-2">
                      <div
                        className="bg-gradient-to-r from-gold to-gold/80 h-2 rounded-full transition-all duration-500"
                        style={{
                          width: `${
                            (product.metadata.formality_level / 9) * 100
                          }%`,
                        }}
                      ></div>
                    </div>
                    <p className="text-xs text-charcoal/70 font-medium">
                      {product.metadata.formality_level >= 8
                        ? "Formal & Elegant"
                        : product.metadata.formality_level >= 6
                        ? "Smart Casual"
                        : product.metadata.formality_level >= 4
                        ? "Casual & Comfortable"
                        : "Relaxed & Everyday"}
                    </p>
                  </Card>
                )}
              </div>

              {/* Secondary Details Row */}
              <div className="grid grid-cols-2 gap-4">
                {/* Materials */}
                {product.metadata.materials && (
                  <Card className="p-5 border-2 border-gold/20 bg-white/50">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-6 h-6 bg-gold/20 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-gold rounded-full"></div>
                      </div>
                      <span className="text-sm font-semibold text-charcoal">
                        Materials
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {product.metadata.materials.map((material, index) => (
                        <Badge
                          key={index}
                          className="text-xs px-3 py-1.5 gold-gradient text-charcoal border-0 capitalize font-medium"
                        >
                          {material}
                        </Badge>
                      ))}
                    </div>
                  </Card>
                )}

                {/* Investment Value */}
                {product.metadata.investment_value && (
                  <Card className="p-5 border-2 border-gold/20 bg-white/50">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-6 h-6 bg-gold/20 rounded-full flex items-center justify-center">
                        <TrendingUp className="w-3 h-3 text-gold" />
                      </div>
                      <span className="text-sm font-semibold text-charcoal">
                        Investment Value
                      </span>
                    </div>
                    <Badge className="text-sm px-4 py-2 gold-gradient text-charcoal border-0 uppercase font-bold">
                      {product.metadata.investment_value}
                    </Badge>
                  </Card>
                )}
              </div>

              {/* Additional Metadata Row */}
              <div className="grid grid-cols-3 gap-3">
                {/* Size Category */}
                {product.metadata.size_category && (
                  <Card className="p-3 border border-gold/20 bg-white/30">
                    <div className="text-xs font-medium text-muted-foreground mb-1">
                      Size
                    </div>
                    <div className="text-sm font-semibold text-charcoal capitalize">
                      {product.metadata.size_category}
                    </div>
                  </Card>
                )}

                {/* Weight Range */}
                {product.metadata.weight_range && (
                  <Card className="p-3 border border-gold/20 bg-white/30">
                    <div className="text-xs font-medium text-muted-foreground mb-1">
                      Weight
                    </div>
                    <div className="text-sm font-semibold text-charcoal capitalize">
                      {product.metadata.weight_range}
                    </div>
                  </Card>
                )}

                {/* Maintenance Level */}
                {product.metadata.maintenance_level && (
                  <Card className="p-3 border border-gold/20 bg-white/30">
                    <div className="text-xs font-medium text-muted-foreground mb-1">
                      Care
                    </div>
                    <div className="text-sm font-semibold text-charcoal capitalize">
                      {product.metadata.maintenance_level}
                    </div>
                  </Card>
                )}
              </div>
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
