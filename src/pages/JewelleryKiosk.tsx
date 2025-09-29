import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import WelcomeScreen from "@/components/WelcomeScreen";
import UserDetailsForm from "@/components/UserDetailsForm";
import SurveyWizard from "@/components/SurveyWizard";
import RecommendationsPage from "@/components/RecommendationsPage";
import { SurveyData } from "@/types/survey";

type AppState = 'welcome' | 'userDetails' | 'survey' | 'recommendations';

const JewelleryKiosk = () => {
  const [currentState, setCurrentState] = useState<AppState>('welcome');
  const [surveyData, setSurveyData] = useState<SurveyData | null>(null);

  const handleStart = () => {
    setCurrentState('userDetails');
  };

  const handleUserDetailsSubmit = (name: string) => {
    setSurveyData(prev => ({ ...prev, name } as SurveyData));
    setCurrentState('survey');
  };

  const handleSurveyComplete = (data: SurveyData) => {
    setSurveyData(data);
    setCurrentState('recommendations');
  };

  const handleRestart = () => {
    setSurveyData(null);
    setCurrentState('welcome');
  };

  const handleBack = () => {
    switch (currentState) {
      case 'userDetails':
        setCurrentState('welcome');
        break;
      case 'survey':
        setCurrentState('userDetails');
        break;
      default:
        break;
    }
  };

  const pageVariants = {
    initial: { opacity: 0, x: 50 },
    in: { opacity: 1, x: 0 },
    out: { opacity: 0, x: -50 }
  };

  const pageTransition = {
    type: "tween" as const,
    ease: "anticipate" as const,
    duration: 0.6
  };

  return (
    <div className="min-h-screen">
      <AnimatePresence mode="wait">
        {currentState === 'welcome' && (
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

        {currentState === 'userDetails' && (
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

        {currentState === 'survey' && surveyData && (
          <motion.div
            key="survey"
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
          >
            <SurveyWizard 
              userName={surveyData.name}
              onComplete={handleSurveyComplete}
              onBack={handleBack}
            />
          </motion.div>
        )}

        {currentState === 'recommendations' && surveyData && (
          <motion.div
            key="recommendations"
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
          >
            <RecommendationsPage 
              surveyData={surveyData}
              onRestart={handleRestart}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default JewelleryKiosk;