"use client";

import { motion } from "motion/react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Star, TrendingUp } from "lucide-react";
import {
  calculateMatch,
  getStyleIntensityDescription,
  getFormalityDescription,
} from "@/lib/productHelpers";

const MatchVisualization = ({ product, userRequirements }) => {
  const matchAnalysis = calculateMatch(
    userRequirements.allTags || [],
    product.tags || [],
    product.metadata || {}
  );

  const getMatchColor = (percentage) => {
    if (percentage >= 80) return "text-green-600";
    if (percentage >= 60) return "text-yellow-600";
    if (percentage >= 40) return "text-orange-600";
    return "text-red-600";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="space-y-6"
    >
      {/* Match Score Header */}
      <Card className="premium-card luxury-shadow p-6">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Star className="w-5 h-5 text-gold" />
            <h3 className="text-xl font-medium text-charcoal">
              Perfect Match Analysis
            </h3>
          </div>
          <div className="flex items-center justify-center gap-4 mb-4">
            <div
              className={`text-4xl font-bold ${getMatchColor(
                matchAnalysis.matchPercentage
              )}`}
            >
              {matchAnalysis.matchPercentage}%
            </div>
            <div className="text-sm text-muted-foreground">
              <div>Match Score</div>
              <div className="text-xs">
                {matchAnalysis.matchPercentage >= 80 && "Excellent match!"}
                {matchAnalysis.matchPercentage >= 60 &&
                  matchAnalysis.matchPercentage < 80 &&
                  "Good match"}
                {matchAnalysis.matchPercentage >= 40 &&
                  matchAnalysis.matchPercentage < 60 &&
                  "Partial match"}
                {matchAnalysis.matchPercentage < 40 && "Limited match"}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Side-by-side Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* What You Requested */}
        <Card className="premium-card luxury-shadow p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <h4 className="font-medium text-charcoal">What You Requested</h4>
          </div>

          {userRequirements.allTags && userRequirements.allTags.length > 0 ? (
            <div className="space-y-3">
              {userRequirements.allTags.map((tag, index) => {
                const isMatch = matchAnalysis.matches.some(
                  (match) =>
                    match.toLowerCase().includes(tag.toLowerCase()) ||
                    tag.toLowerCase().includes(match.toLowerCase())
                );

                return (
                  <div key={index} className="flex items-center gap-2">
                    {isMatch ? (
                      <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                    ) : (
                      <div className="w-4 h-4 border border-muted-foreground rounded-full flex-shrink-0"></div>
                    )}
                    <Badge
                      variant={isMatch ? "default" : "secondary"}
                      className="text-sm"
                    >
                      {tag}
                    </Badge>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic">
              No specific requirements provided
            </p>
          )}
        </Card>

        {/* This Product Offers */}
        <Card className="premium-card luxury-shadow p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 bg-gold rounded-full"></div>
            <h4 className="font-medium text-charcoal">This Product Offers</h4>
          </div>

          <div className="space-y-3">
            {matchAnalysis.matches.map((match, index) => (
              <div key={index} className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                <Badge variant="default" className="text-sm">
                  {match}
                </Badge>
              </div>
            ))}

            {matchAnalysis.additionalFeatures.map((feature, index) => (
              <div
                key={`additional-${index}`}
                className="flex items-center gap-2"
              >
                <div className="w-4 h-4 border border-muted-foreground rounded-full flex-shrink-0"></div>
                <Badge variant="secondary" className="text-sm">
                  {feature}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Product Attributes */}
      {product.metadata && (
        <Card className="premium-card luxury-shadow p-6">
          <h4 className="font-medium text-charcoal mb-4">Product Details</h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Style Intensity */}
            {product.metadata.style_intensity && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-charcoal">
                    Style Intensity
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {product.metadata.style_intensity}/10
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-gold h-2 rounded-full transition-all duration-500"
                    style={{
                      width: `${
                        (product.metadata.style_intensity / 10) * 100
                      }%`,
                    }}
                  ></div>
                </div>
                <p className="text-xs text-muted-foreground">
                  {getStyleIntensityDescription(
                    product.metadata.style_intensity
                  )}
                </p>
              </div>
            )}

            {/* Formality Level */}
            {product.metadata.formality_level && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-charcoal">
                    Formality Level
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {product.metadata.formality_level}/10
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-gold h-2 rounded-full transition-all duration-500"
                    style={{
                      width: `${
                        (product.metadata.formality_level / 10) * 100
                      }%`,
                    }}
                  ></div>
                </div>
                <p className="text-xs text-muted-foreground">
                  {getFormalityDescription(product.metadata.formality_level)}
                </p>
              </div>
            )}

            {/* Materials */}
            {product.metadata.materials && (
              <div className="md:col-span-2">
                <span className="text-sm font-medium text-charcoal">
                  Materials
                </span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {product.metadata.materials.map((material, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {material}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Investment Value */}
            {product.metadata.investment_value && (
              <div className="md:col-span-2">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-gold" />
                  <span className="text-sm font-medium text-charcoal">
                    Investment Value
                  </span>
                </div>
                <Badge
                  variant={
                    product.metadata.investment_value === "very-high"
                      ? "default"
                      : "secondary"
                  }
                  className="mt-1"
                >
                  {product.metadata.investment_value
                    .replace("-", " ")
                    .toUpperCase()}
                </Badge>
              </div>
            )}
          </div>
        </Card>
      )}
    </motion.div>
  );
};

export { MatchVisualization };
