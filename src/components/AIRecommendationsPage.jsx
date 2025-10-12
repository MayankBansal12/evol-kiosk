"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Star,
  ShoppingBag,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Home,
} from "lucide-react";
import { useRouter } from "next/navigation";
import PropTypes from "prop-types";

const AIRecommendationsPage = ({ surveyData, onRestart }) => {
  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const router = useRouter();

  const PRODUCTS_PER_PAGE = 9;

  // Initialize products from surveyData
  useEffect(() => {
    if (surveyData?.products) {
      setProducts(surveyData.products);
    } else {
      // Fallback to mock products if no products are provided
      setProducts([
        {
          id: "mock-1",
          product_name: "Classic Diamond Solitaire Ring",
          price: 2495,
          image_url: "/product-ring.jpg",
          description: "Timeless elegance with a brilliant cut diamond",
        },
        {
          id: "mock-2",
          product_name: "Elegant Gold Chain Necklace",
          price: 1295,
          image_url: "/product-necklace.jpg",
          description: "Sophisticated 18k gold chain with delicate pendant",
        },
        {
          id: "mock-3",
          product_name: "Pearl Drop Earrings",
          price: 895,
          image_url: "/product-earrings.jpg",
          description: "Lustrous pearls set in premium gold settings",
        },
      ]);
    }
  }, [surveyData]);

  // Extract tags from survey data
  const tags = surveyData?.tags || [];

  // Calculate pagination
  const totalPages = Math.ceil(products.length / PRODUCTS_PER_PAGE);
  const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
  const endIndex = startIndex + PRODUCTS_PER_PAGE;
  const currentProducts = products.slice(startIndex, endIndex);

  // Format tags for display
  const formatTag = (tag) => {
    switch (tag) {
      case "ring":
      case "necklace":
      case "bracelet":
      case "earrings":
      case "watch":
        return tag.charAt(0).toUpperCase() + tag.slice(1);
      case "budget":
        return "Under $500";
      case "mid-range":
        return "$500 - $2,000";
      case "premium":
        return "$2,000 - $5,000";
      case "luxury":
        return "Over $5,000";
      default:
        return tag.charAt(0).toUpperCase() + tag.slice(1);
    }
  };

  // Get match score color
  const getMatchScoreColor = (percentage) => {
    if (percentage >= 80) return "bg-green-100 text-green-800 border-green-200";
    if (percentage >= 60)
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    return "bg-gray-100 text-gray-800 border-gray-200";
  };

  // Pagination handlers
  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const goToPreviousPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  };

  const goToNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
  };

  // Handle product click to navigate to details page
  const handleProductClick = (product) => {
    const id = product.id || product.product_id;
    const userTags = tags.join(",");
    const url = `/product/${id}?userTags=${userTags}`;
    router.push(url);
  };

  return (
    <div className="min-h-screen hero-gradient px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Top Navigation */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-start mb-8"
        >
          <Button
            onClick={() => {
              // Clear ALL localStorage and session data
              localStorage.removeItem("surveyData");
              // Also clear session if sessionManager is available
              try {
                const { clearCurrentSession } = require("@/lib/sessionManager");
                clearCurrentSession();
              } catch (error) {
                console.error("Error clearing session:", error);
              }
              window.location.href = "/";
            }}
            className="gold-gradient text-charcoal border-0 hover:shadow-[var(--shadow-glow)] px-6 py-3 rounded-full font-medium text-base"
          >
            <Home className="w-5 h-5 mr-2" />
            Home
          </Button>
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-6xl font-light text-charcoal mb-4">
            Perfect Matches for
            <span className="block font-medium gold-gradient bg-clip-text text-transparent">
              {surveyData.name}
            </span>
          </h1>
          <p className="text-xl text-muted-foreground mb-6">
            Evol-e recommends you these products
          </p>
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {tags.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="text-sm px-4 py-2"
              >
                {formatTag(tag)}
              </Badge>
            ))}
          </div>
        </motion.div>

        {/* Products Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12"
        >
          {currentProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card className="premium-card overflow-hidden group hover:scale-105 transition-all duration-500 luxury-shadow h-full flex flex-col">
                <div className="aspect-square overflow-hidden bg-pearl relative flex-shrink-0">
                  <img
                    src={product.image_url || product.image}
                    alt={product.product_name || product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  {/* Match Score Badge */}
                  {product.matchPercentage && (
                    <div className="absolute top-2 right-2">
                      <Badge
                        className={`text-xs font-medium border ${getMatchScoreColor(
                          product.matchPercentage
                        )}`}
                      >
                        {product.matchPercentage}% match
                      </Badge>
                    </div>
                  )}
                </div>
                <div className="p-6 flex flex-col flex-grow">
                  <div className="flex items-center gap-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={`star-${i}`}
                        className="w-4 h-4 fill-gold text-gold"
                      />
                    ))}
                  </div>
                  <h3 className="text-xl font-medium text-charcoal mb-2 line-clamp-2 min-h-[3.5rem]">
                    {product.product_name || product.name}
                  </h3>
                  <p className="text-muted-foreground mb-4 text-sm line-clamp-3 flex-grow">
                    {product.description}
                  </p>
                  <div className="flex items-center justify-between mt-auto">
                    <span className="text-2xl font-light text-charcoal">
                      {typeof product.price === "number"
                        ? `$${product.price.toLocaleString()}`
                        : product.price}
                    </span>
                    <Button
                      size="sm"
                      className="gold-gradient text-charcoal border-0 hover:shadow-[var(--shadow-glow)] flex-shrink-0"
                      onClick={() => handleProductClick(product)}
                    >
                      <ShoppingBag className="w-4 h-4 mr-2" />
                      View More
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Pagination */}
        {totalPages > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex justify-center items-center gap-4 mb-12"
          >
            <Button
              variant="outline"
              size="sm"
              onClick={goToPreviousPage}
              disabled={currentPage === 1}
              className="kiosk-button"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>

            <div className="flex gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => goToPage(page)}
                    className={`kiosk-button w-12 h-4 p-0 flex items-center justify-center ${
                      currentPage === page
                        ? "gold-gradient text-charcoal border-0"
                        : ""
                    }`}
                  >
                    {page}
                  </Button>
                )
              )}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
              className="kiosk-button"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </motion.div>
        )}

        {/* Results Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center mb-8"
        >
          <p className="text-muted-foreground">
            Showing {startIndex + 1}-{Math.min(endIndex, products.length)} of{" "}
            {products.length} products
          </p>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="text-center"
        >
          <p className="text-muted-foreground mb-6">
            Not quite what you're looking for?
          </p>
          <Button
            onClick={() => {
              // Clear ALL localStorage and session data
              localStorage.removeItem("surveyData");
              // Also clear session if sessionManager is available
              try {
                const { clearCurrentSession } = require("@/lib/sessionManager");
                clearCurrentSession();
              } catch (error) {
                console.error("Error clearing session:", error);
              }
              window.location.href = "/";
            }}
            variant="outline"
            className="kiosk-button border-2 px-8"
          >
            <RotateCcw className="w-5 h-5 mr-2" />
            Speak to Evol-e again
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

AIRecommendationsPage.propTypes = {
  surveyData: PropTypes.shape({
    name: PropTypes.string,
    products: PropTypes.array,
    tags: PropTypes.array,
    metadata: PropTypes.object,
  }),
  onRestart: PropTypes.func,
};

export { AIRecommendationsPage };
