import { motion } from "motion/react";

const Shimmer = ({ className = "", variant = "default" }) => {
  const shimmerClasses = {
    default:
      "bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-[shimmer_2s_infinite]",
    gold: "bg-gradient-to-r from-gold/20 via-gold/40 to-gold/20 animate-[shimmer-gold_2.5s_infinite]",
    pearl:
      "bg-gradient-to-r from-pearl/30 via-warm-white/50 to-pearl/30 animate-[shimmer-pearl_2.2s_infinite]",
    luxury:
      "bg-gradient-to-r from-charcoal/10 via-charcoal/20 to-charcoal/10 animate-[shimmer-luxury_2.8s_infinite]",
  };

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <div
        className={`${shimmerClasses[variant]} bg-[length:200%_100%] rounded h-full w-full`}
      ></div>
    </div>
  );
};

const ProductDetailsShimmer = () => {
  return (
    <div className="min-h-screen hero-gradient flex items-center justify-center p-4">
      <div className="max-w-[80%] w-full">
        {/* Navigation Shimmer */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Shimmer variant="luxury" className="h-8 w-32 rounded-lg" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white/90 backdrop-blur-2xl rounded-2xl shadow-2xl overflow-hidden"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            {/* Product Image Shimmer */}
            <div className="relative">
              <Shimmer
                variant="pearl"
                className="aspect-square w-full rounded-none"
              />
              {/* Floating shimmer overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.3, 0.6, 0.3],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="w-16 h-16 bg-gold/20 rounded-full"
                />
              </div>
            </div>

            {/* Product Information Shimmer */}
            <div className="p-8 flex flex-col justify-between">
              {/* Header Shimmer */}
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <Shimmer variant="gold" className="h-6 w-16 rounded-full" />
                  <Shimmer variant="gold" className="h-6 w-20 rounded-full" />
                </div>

                <Shimmer
                  variant="luxury"
                  className="h-12 w-3/4 mb-4 rounded-lg"
                />
                <Shimmer
                  variant="default"
                  className="h-6 w-24 mb-4 rounded-lg"
                />
                <Shimmer variant="gold" className="h-10 w-32 mb-6 rounded-lg" />

                {/* Description Shimmer */}
                <div className="mb-6 space-y-3">
                  <Shimmer variant="luxury" className="h-4 w-full rounded" />
                  <Shimmer variant="luxury" className="h-4 w-5/6 rounded" />
                  <Shimmer variant="luxury" className="h-4 w-4/5 rounded" />
                </div>
              </div>

              {/* Action Buttons Shimmer */}
              <div className="space-y-6">
                <div className="flex gap-4">
                  <Shimmer variant="gold" className="flex-1 h-16 rounded-md" />
                  <Shimmer variant="pearl" className="flex-1 h-16 rounded-md" />
                </div>

                {/* Key Features Shimmer */}
                <div className="bg-gold/5 rounded-xl p-6 border border-gold/20">
                  <div className="flex items-center gap-2 mb-4">
                    <Shimmer variant="gold" className="w-6 h-6 rounded-full" />
                    <Shimmer variant="luxury" className="h-4 w-24 rounded" />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Shimmer variant="gold" className="h-6 w-16 rounded-full" />
                    <Shimmer variant="gold" className="h-6 w-20 rounded-full" />
                    <Shimmer variant="gold" className="h-6 w-14 rounded-full" />
                    <Shimmer variant="gold" className="h-6 w-18 rounded-full" />
                    <Shimmer variant="gold" className="h-6 w-12 rounded-full" />
                    <Shimmer variant="gold" className="h-6 w-16 rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Floating jewelry elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <motion.div
            animate={{
              y: [0, -20, 0],
              rotate: [0, 5, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute top-20 right-20 text-4xl opacity-20"
          >
            💎
          </motion.div>
          <motion.div
            animate={{
              y: [0, 15, 0],
              rotate: [0, -3, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1,
            }}
            className="absolute bottom-32 left-16 text-3xl opacity-15"
          >
            💍
          </motion.div>
          <motion.div
            animate={{
              y: [0, -10, 0],
              x: [0, 10, 0],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.5,
            }}
            className="absolute top-1/2 right-8 text-2xl opacity-10"
          >
            ✨
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export { Shimmer, ProductDetailsShimmer };
