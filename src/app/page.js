"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { WelcomeScreen } from "@/components/WelcomeScreen";
import { UserDetailsForm } from "@/components/UserDetailsForm";
import { ConversationalWizard } from "@/components/ConversationalWizard";
import { initSession, clearCurrentSession } from "@/lib/sessionManager";
import "./globals.css";

export default function Home() {
  const [currentState, setCurrentState] = useState("welcome");
  const [surveyData, setSurveyData] = useState(null);

  // Initialize or restore session on mount
  useEffect(() => {
    const session = initSession();

    if (session.isRestored && session.data) {
      // Restore state from session
      if (session.data.userName) {
        setSurveyData({ name: session.data.userName });
      }

      if (session.data.state === "survey" && session.data.userName) {
        setCurrentState("survey");
      } else if (session.data.state === "userDetails") {
        setCurrentState("userDetails");
      }
    }
  }, []);

  const handleStart = () => {
    // Clear any existing session when starting fresh
    clearCurrentSession();

    // Initialize new session
    initSession();

    setCurrentState("userDetails");
  };

  const handleUserDetailsSubmit = (name) => {
    setSurveyData((prev) => ({ ...prev, name }));
    setCurrentState("survey");
  };

  const handleSurveyComplete = (data) => {
    // Store data in localStorage for the recommendations page
    localStorage.setItem("surveyData", JSON.stringify(data));

    window.location.href = `/recommendations`;
  };

  const handleTimeout = () => {
    // Clear session and return to welcome
    clearCurrentSession();
    setSurveyData(null);
    setCurrentState("welcome");
  };

  const handleBack = () => {
    // Clear session and return to welcome for both cases
    clearCurrentSession();
    setCurrentState("welcome");
  };

  const handleBackFromSurvey = () => {
    // Go back to user details form, preserving session data
    setCurrentState("userDetails");
  };

  const pageVariants = {
    initial: { opacity: 0, x: 50 },
    in: { opacity: 1, x: 0 },
    out: { opacity: 0, x: -50 },
  };

  const pageTransition = {
    type: "tween",
    ease: "anticipate",
    duration: 0.6,
  };

  return (
    <div className="min-h-screen">
      <AnimatePresence mode="wait">
        {currentState === "welcome" && (
          <motion.div
            key="welcome"
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
          >
            <WelcomeScreen onStart={handleStart} />
          </motion.div>
        )}

        {currentState === "userDetails" && (
          <motion.div
            key="userDetails"
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
          >
            <UserDetailsForm
              onNext={handleUserDetailsSubmit}
              onBack={handleBack}
            />
          </motion.div>
        )}

        {currentState === "survey" && surveyData && (
          <motion.div
            key="survey"
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
          >
            <ConversationalWizard
              userName={surveyData.name}
              onComplete={handleSurveyComplete}
              onTimeout={handleTimeout}
              onBack={handleBackFromSurvey}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
