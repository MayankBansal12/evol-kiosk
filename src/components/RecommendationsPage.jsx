import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, ShoppingBag, RotateCcw } from "lucide-react";

const MOCK_PRODUCTS = [
  {
    id: "1",
    name: "Classic Diamond Solitaire Ring",
    price: "$2,495",
    image: "/product-ring.jpg",
    description: "Timeless elegance with a brilliant cut diamond",
  },
  {
    id: "2",
    name: "Elegant Gold Chain Necklace",
    price: "$1,295",
    image: "/product-necklace.jpg",
    description: "Sophisticated 18k gold chain with delicate pendant",
  },
  {
    id: "3",
    name: "Pearl Drop Earrings",
    price: "$895",
    image: "/product-earrings.jpg",
    description: "Lustrous pearls set in premium gold settings",
  },
];

const RecommendationsPage = ({ surveyData, onRestart }) => {
  return (
    <div className="min-h-screen hero-gradient px-4 py-8">
      <div className="max-w-6xl mx-auto">
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
            Based on your preferences for {surveyData.jewelryType} •{" "}
            {surveyData.occasion} • {surveyData.stylePreference}
          </p>
          <Badge variant="secondary" className="text-sm px-4 py-2">
            {surveyData.priceRange
              .replace("-", " - $")
              .replace("under", "Under $")
              .replace("over", "Over $")}
          </Badge>
        </motion.div>

        {/* Products Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12"
        >
          {MOCK_PRODUCTS.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
            >
              <Card className="premium-card overflow-hidden group hover:scale-105 transition-all duration-500 luxury-shadow">
                <div className="aspect-square overflow-hidden bg-pearl">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-gold text-gold" />
                    ))}
                  </div>
                  <h3 className="text-xl font-medium text-charcoal mb-2">
                    {product.name}
                  </h3>
                  <p className="text-muted-foreground mb-4 text-sm">
                    {product.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-light text-charcoal">
                      {product.price}
                    </span>
                    <Button
                      size="sm"
                      className="gold-gradient text-charcoal border-0 hover:shadow-[var(--shadow-glow)]"
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
            onClick={onRestart}
            variant="outline"
            className="kiosk-button border-2 px-8"
          >
            <RotateCcw className="w-5 h-5 mr-2" />
            Retake Survey
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default RecommendationsPage;
