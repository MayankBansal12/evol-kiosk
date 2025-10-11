"use client";

import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { User } from "lucide-react";
import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  saveSessionData,
  getCurrentSessionId,
  getSessionData,
} from "@/lib/sessionManager";

const UserDetailsForm = ({ onNext, onBack }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  // Restore data from session if available
  useEffect(() => {
    const sessionId = getCurrentSessionId();
    if (sessionId) {
      const sessionData = getSessionData(sessionId);
      if (sessionData) {
        if (sessionData.userName) {
          setName(sessionData.userName);
        }
        if (sessionData.email) {
          setEmail(sessionData.email);
        }
      }
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim()) {
      // Save to session
      const sessionId = getCurrentSessionId();
      if (sessionId) {
        saveSessionData(sessionId, {
          userName: name.trim(),
          email: email.trim() || null,
          state: "userDetails",
        });
      }
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
              Welcome to Evol Jewels
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
                placeholder="your name please..."
                className="h-14 text-lg border-2 border-border/50 focus:border-gold"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-base font-medium">
                Email Address{" "}
                <span className="text-muted-foreground">(Optional)</span>
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email (optional)"
                className="h-14 text-lg border-2 border-border/50 focus:border-gold"
              />
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                className="flex-1 kiosk-button gold-gradient text-charcoal border-0 h-12"
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

UserDetailsForm.propTypes = {
  onNext: PropTypes.func.isRequired,
  onBack: PropTypes.func.isRequired,
};

export { UserDetailsForm };
