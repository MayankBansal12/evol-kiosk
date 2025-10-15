"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BuyDialog } from "@/components/BuyDialog";
import { ConsultationChat } from "@/components/ConsultationChat";
import { generateProductContent } from "@/app/actions/generateProductContent";
import { ProductDetailsShimmer } from "@/components/ui/shimmer";

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
import { ImageWithFallback } from "@/components/ImageWithFallback";

const ProductDetailsPage = ({ product }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userRequirements = parseUrlTags(searchParams);
  const [showBuyDialog, setShowBuyDialog] = useState(false);
  const [productDescription, setProductDescription] = useState("");
  const [personalizedRecommendation, setPersonalizedRecommendation] =
    useState("");
  const [isGeneratingContent, setIsGeneratingContent] = useState(true);

  // Generate unified product content on component mount
  useEffect(() => {
    const generateContent = async () => {
      if (!product || !product.product_name) return;

      setIsGeneratingContent(true);
      try {
        // Get user context from localStorage
        const userContext = JSON.parse(
          localStorage.getItem("surveyData") || "{}"
        );

        // Generate both description and recommendation in one API call
        const result = await generateProductContent(product, userContext);

        if (result.success) {
          setProductDescription(result.data.description);
          setPersonalizedRecommendation(result.data.recommendation);
        }
      } catch (error) {
        console.error("Error generating content:", error);
      } finally {
        setIsGeneratingContent(false);
      }
    };

    generateContent();
  }, [product]);

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

  // Show shimmer while generating description
  if (isGeneratingContent) {
    return <ProductDetailsShimmer />;
  }

  return (
    <div className="min-h-screen hero-gradient flex items-center justify-center p-4">
      <div className="max-w-[80%] w-full">
        {/* Navigation */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Button
            variant="ghost"
            onClick={() => {
              const referrer = document.referrer;
              if (referrer.includes("/recommendations")) {
                router.back();
              } else {
                router.push("/recommendations");
              }
            }}
            className="text-charcoal hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Recommendations
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white/90 backdrop-blur-2xl rounded-2xl shadow-2xl overflow-hidden"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            {/* Product Image */}
            <div className="relative">
              <div className="aspect-square bg-pearl">
                <ImageWithFallback
                  src={product.image_url}
                  alt={product.product_name}
                  className="w-full h-full object-cover"
                  wrapperClassName="w-full h-full"
                  fallbackContent={(
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      <div className="text-center">
                        <div className="w-20 h-20 bg-gold/20 rounded-full mx-auto mb-4 flex items-center justify-center">
                          <span className="text-3xl">💎</span>
                        </div>
                        <p className="text-sm font-medium">Jewelry Image</p>
                        <p className="text-xs text-muted-foreground">Coming Soon</p>
                      </div>
                    </div>
                  )}
                />
              </div>
            </div>

            {/* Product Information */}
            <div className="p-8 flex flex-col justify-between">
              {/* Header */}
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <Badge variant="secondary" className="text-sm">
                    {getCategoryDisplayName(product.category)}
                  </Badge>
                  {product.collection_name && (
                    <Badge variant="outline" className="text-sm">
                      {product.collection_name}
                    </Badge>
                  )}
                </div>

                <h1 className="text-4xl font-light text-charcoal mb-4">
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

                <div className="text-4xl font-light text-charcoal mb-6">
                  {formatPrice(product.price)}
                </div>

                {/* Product Description */}
                <div className="mb-6">
                  {productDescription ? (
                    <p className="text-lg text-charcoal/80 leading-relaxed">
                      {productDescription}
                    </p>
                  ) : (
                    <p className="text-lg text-charcoal/80 leading-relaxed">
                      A beautiful piece of jewelry that combines elegance and
                      craftsmanship.
                    </p>
                  )}
                </div>

                {/* Product Tags */}
                {product.tags && product.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-6">
                    {product.tags.slice(0, 8).map((tag, index) => (
                      <Badge
                        key={index}
                        className="text-sm px-3 py-1.5 gold-gradient text-charcoal border-0 font-medium"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Why This is a Good Buy */}
                {personalizedRecommendation && (
                  <div className="bg-gradient-to-br from-gold/10 to-gold/5 rounded-xl p-6 border border-gold/30 shadow-sm mb-6">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-6 h-6 bg-gold/30 rounded-full flex items-center justify-center">
                        <span className="text-gold text-sm">💎</span>
                      </div>
                      <h4 className="text-sm font-semibold text-charcoal">
                        Why This is Perfect for You
                      </h4>
                    </div>
                    <p className=" text-charcoal/80 leading-relaxed">
                      {personalizedRecommendation}
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-6">
                <div className="flex gap-4">
                  <Button
                    onClick={() => setShowBuyDialog(true)}
                    className="flex-1 h-16 gold-gradient text-charcoal border-0 hover:shadow-[var(--shadow-glow)] text-lg font-medium"
                  >
                    <ShoppingBag className="w-6 h-6 mr-3" />
                    Click to Buy
                  </Button>

                  <ConsultationChat product={product}>
                    <button className="relative inline-flex h-16 overflow-hidden rounded-md p-[1px] focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2 focus:ring-offset-slate-50">
                      <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#FFD700_0%,#B8860B_50%,#FFD700_100%)]" />
                      <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-md bg-white px-6 text-lg font-medium text-charcoal backdrop-blur-3xl">
                        <MessageCircle className="w-6 h-6 mr-3" />
                        Speak to Evol-e
                      </span>
                    </button>
                  </ConsultationChat>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
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
