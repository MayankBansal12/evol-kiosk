"use client";

import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  saveSessionData,
  getCurrentSessionId,
  getSessionData,
} from "@/lib/sessionManager";
import languages from "@/data/languages.json";

const UserDetailsForm = ({ onNext, onBack }) => {
  const [name, setName] = useState("");
  const [language, setLanguage] = useState("en");

  // Restore data from session if available
  useEffect(() => {
    const sessionId = getCurrentSessionId();
    if (sessionId) {
      const sessionData = getSessionData(sessionId);
      if (sessionData) {
        if (sessionData.userName) {
          setName(sessionData.userName);
        }
        if (sessionData.language) {
          setLanguage(sessionData.language);
        }
      }
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Use name if provided, otherwise use empty string for generic greetings
    const userName = name.trim() || "";

    // Save to session
    const sessionId = getCurrentSessionId();
    if (sessionId) {
      saveSessionData(sessionId, {
        userName: userName,
        language: language,
        state: "userDetails",
      });
    }
    onNext(userName, language);
  };

  return (
    <div className="min-h-screen flex bg-[url('https://evoljewels.com/cdn/shop/products/SNEC340237-RG-PV.jpg?v=1755327577&width=1100')] items-center justify-center hero-gradient px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <Card className="premium-card luxury-shadow ">
          <div className="text-center mb-10">
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-8"
            >
              <img
                src="/evol.jpg"
                alt="EVOL Logo"
                className="h-16 w-16 mx-auto border-2 border-gold rounded-full p-2 shadow-lg object-cover"
              />
            </motion.div>

            <h2 className="text-4xl font-light text-charcoal mb-3">
              Welcome to Evol Jewels
            </h2>
            <p className="text-muted-foreground text-lg">
              Let's personalize your experience
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-3">
              <Label
                htmlFor="name"
                className="text-lg font-medium text-charcoal"
              >
                Your Name
              </Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name (optional) or leave blank for generic greetings..."
                className="h-14 text-lg bg-white border-2 border-border/50 focus:border-gold transition-all duration-200"
              />
            </div>

            <div className="space-y-3">
              <Label
                htmlFor="language"
                className="text-base font-medium text-charcoal"
              >
                Preferred Language
              </Label>
              <select
                id="language"
                value={language}
                onChange={(e) => {
                  setLanguage(e.target.value);
                }}
                className="h-14 text-lg border-2 border-border/50 focus:border-gold rounded-md px-3 w-full bg-white transition-all duration-200"
              >
                {languages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.value}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-4 pt-8">
              <Button
                type="submit"
                className="flex-1 kiosk-button gold-gradient text-charcoal border-0 h-14 text-lg font-medium transition-all duration-200 hover:scale-[1.02]"
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
