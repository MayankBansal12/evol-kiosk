import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { User } from "lucide-react";
import { useState } from "react";

interface UserDetailsFormProps {
  onNext: (name: string) => void;
  onBack: () => void;
}

const UserDetailsForm = ({ onNext, onBack }: UserDetailsFormProps) => {
  const [name, setName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onNext(name.trim());
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center hero-gradient px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <Card className="premium-card luxury-shadow">
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mx-auto w-16 h-16 bg-gold rounded-full flex items-center justify-center mb-6"
            >
              <User className="w-8 h-8 text-charcoal" />
            </motion.div>
            
            <h2 className="text-3xl font-light text-charcoal mb-2">
              Welcome to Our Boutique
            </h2>
            <p className="text-muted-foreground">
              Let's personalize your experience
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-base font-medium">
                Your Name
              </Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your first name"
                className="h-14 text-lg border-2 border-border/50 focus:border-gold"
                required
              />
            </div>
            
            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onBack}
                className="flex-1 kiosk-button border-2"
              >
                Back
              </Button>
              <Button
                type="submit"
                className="flex-1 kiosk-button gold-gradient text-charcoal border-0"
                disabled={!name.trim()}
              >
                Continue
              </Button>
            </div>
          </form>
        </Card>
      </motion.div>
    </div>
  );
};

export default UserDetailsForm;