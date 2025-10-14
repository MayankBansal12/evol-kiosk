import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

const WelcomeScreen = ({ onStart }) => {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden hero-gradient">
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover opacity-100"
        >
          <source
            src="https://cdn.shopify.com/videos/c/o/v/23b550b7f86d4ac7b812b44b9824d6d6.mp4"
            type="video/mp4"
          />
        </video>
        <div className="absolute inset-0 bg-gradient-to-br from-warm-white/90 via-pearl/80 to-warm-white/90" />
      </div>

      <div className="relative z-10 text-center max-w-4xl mx-auto px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-8"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            className="mx-auto w-20 h-20  rounded-full flex items-center justify-center mb-8 luxury-shadow"
          >
            <span className="text-8xl">✨</span>
          </motion.div>

          <h1 className="text-6xl md:text-8xl font-light text-charcoal mb-6 tracking-tight">
            Discover Your
            <span className="block font-medium gold-gradient bg-clip-text text-transparent">
              Perfect Jewellery
            </span>
          </h1>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed"
        >
          Evol-e is here to help you find jewellery pieces that perfectly match
          your style, occasion, and preferences.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <Button
            onClick={onStart}
            size="lg"
            className="kiosk-button px-12 py-6 text-xl gold-gradient text-charcoal font-medium luxury-shadow hover:shadow-[var(--shadow-glow)] border-0"
          >
            Talk to Evol-e
          </Button>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-sm text-muted-foreground mt-8"
        >
          Takes just 2 minutes • Personalized recommendations
        </motion.p>
      </div>
    </div>
  );
};

export { WelcomeScreen };
