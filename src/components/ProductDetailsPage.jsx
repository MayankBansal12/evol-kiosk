"use client";

import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PurchasePopover } from "@/components/PurchasePopover";
import { ConsultationChat } from "@/components/ConsultationChat";
import { MatchVisualization } from "@/components/MatchVisualization";
import {
  ShoppingBag,
  MessageCircle,
  Star,
  ArrowLeft,
  Heart,
  Share2,
} from "lucide-react";
import {
  formatPrice,
  getCategoryDisplayName,
  parseUrlTags,
} from "@/lib/productHelpers";
import { useRouter, useSearchParams } from "next/navigation";

const ProductDetailsPage = ({ product }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userRequirements = parseUrlTags(searchParams);

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
            onClick={() => router.back()}
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
              <Button variant="outline" size="sm" className="flex-1">
                <Heart className="w-4 h-4 mr-2" />
                Save
              </Button>
              <Button variant="outline" size="sm" className="flex-1">
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
            className="space-y-6"
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

            {/* Product Tags */}
            {product.tags && product.tags.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-charcoal mb-3">
                  Style & Features
                </h3>
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-sm">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4">
              <PurchasePopover product={product}>
                <Button className="flex-1 gold-gradient text-charcoal border-0 hover:shadow-[var(--shadow-glow)]">
                  <ShoppingBag className="w-5 h-5 mr-2" />
                  Click to Buy
                </Button>
              </PurchasePopover>

              <ConsultationChat product={product}>
                <Button variant="outline" className="flex-1">
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Consult with Evol-e
                </Button>
              </ConsultationChat>
            </div>

            {/* Product Details */}
            {product.metadata && (
              <Card className="premium-card luxury-shadow p-6">
                <h3 className="text-lg font-medium text-charcoal mb-4">
                  Product Details
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {product.metadata.materials && (
                    <div>
                      <span className="text-muted-foreground">Materials:</span>
                      <p className="font-medium text-charcoal">
                        {product.metadata.materials.join(", ")}
                      </p>
                    </div>
                  )}
                  {product.metadata.gemstone_count && (
                    <div>
                      <span className="text-muted-foreground">Gemstones:</span>
                      <p className="font-medium text-charcoal">
                        {product.metadata.gemstone_count}
                      </p>
                    </div>
                  )}
                  {product.metadata.size_category && (
                    <div>
                      <span className="text-muted-foreground">Size:</span>
                      <p className="font-medium text-charcoal">
                        {product.metadata.size_category}
                      </p>
                    </div>
                  )}
                  {product.metadata.weight_range && (
                    <div>
                      <span className="text-muted-foreground">Weight:</span>
                      <p className="font-medium text-charcoal">
                        {product.metadata.weight_range}
                      </p>
                    </div>
                  )}
                </div>
              </Card>
            )}
          </motion.div>
        </div>

        {/* Match Visualization */}
        {userRequirements.allTags && userRequirements.allTags.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-16"
          >
            <MatchVisualization
              product={product}
              userRequirements={userRequirements}
            />
          </motion.div>
        )}
      </div>
    </div>
  );
};

export { ProductDetailsPage };
