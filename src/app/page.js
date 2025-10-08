"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { WelcomeScreen } from "@/components/WelcomeScreen";
import { UserDetailsForm } from "@/components/UserDetailsForm";
import { ConversationalWizard } from "@/components/ConversationalWizard";
import { AIRecommendationsPage } from "@/components/AIRecommendationsPage";
import "./globals.css";

export default function Home() {
  const [currentState, setCurrentState] = useState("welcome");
  const [surveyData, setSurveyData] = useState(null);

  const handleStart = () => {
    setCurrentState("userDetails");
  };

  const handleUserDetailsSubmit = (name) => {
    setSurveyData((prev) => ({ ...prev, name }));
    setCurrentState("survey");
  };

  const handleSurveyComplete = (data) => {
    setSurveyData(data);
    setCurrentState("recommendations");
  };

  const handleRestart = () => {
    setSurveyData(null);
    setCurrentState("welcome");
  };

  const handleBack = () => {
    switch (currentState) {
      case "userDetails":
        setCurrentState("welcome");
        break;
      case "survey":
        setCurrentState("userDetails");
        break;
      default:
        break;
    }
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
              onBack={handleBack}
            />
          </motion.div>
        )}

        {currentState === "recommendations" && surveyData && (
          <motion.div
            key="recommendations"
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
          >
            <AIRecommendationsPage
              surveyData={surveyData}
              onRestart={handleRestart}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
