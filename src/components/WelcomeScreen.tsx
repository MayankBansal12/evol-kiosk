import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import heroImage from "@/assets/hero-jewelry.jpg";

interface WelcomeScreenProps {
  onStart: () => void;
}

const WelcomeScreen = ({ onStart }: WelcomeScreenProps) => {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden hero-gradient">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img 
          src={heroImage} 
          alt="Elegant jewelry collection" 
          className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-warm-white/90 via-pearl/80 to-warm-white/90" />
      </div>
      
      {/* Content */}
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
            className="mx-auto w-20 h-20 bg-gold rounded-full flex items-center justify-center mb-8 luxury-shadow"
          >
            <Sparkles className="w-10 h-10 text-charcoal" />
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
          Take our personalized survey to find jewellery pieces that perfectly match your style, occasion, and preferences.
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
            Start Your Journey
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

export default WelcomeScreen;