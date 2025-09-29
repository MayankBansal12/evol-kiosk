import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { SurveyData, SURVEY_OPTIONS } from "@/types/survey";

interface SurveyWizardProps {
  userName: string;
  onComplete: (data: SurveyData) => void;
  onBack: () => void;
}

const SurveyWizard = ({ userName, onComplete, onBack }: SurveyWizardProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [surveyData, setSurveyData] = useState<Partial<SurveyData>>({
    name: userName,
  });

  const steps = [
    {
      key: 'jewelryType',
      title: 'What type of jewellery interests you?',
      options: SURVEY_OPTIONS.jewelryType,
    },
    {
      key: 'occasion',
      title: 'What\'s the occasion?',
      options: SURVEY_OPTIONS.occasion,
    },
    {
      key: 'recipient',
      title: 'Who is this for?',
      options: SURVEY_OPTIONS.recipient,
    },
    {
      key: 'priceRange',
      title: 'What\'s your preferred price range?',
      options: SURVEY_OPTIONS.priceRange,
    },
    {
      key: 'stylePreference',
      title: 'What style speaks to you?',
      options: SURVEY_OPTIONS.stylePreference,
    },
  ];

  const currentStepData = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  const handleOptionSelect = (value: string) => {
    const updatedData = {
      ...surveyData,
      [currentStepData.key]: value,
    };
    setSurveyData(updatedData);

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete(updatedData as SurveyData);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      onBack();
    }
  };

  return (
    <div className="min-h-screen hero-gradient px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-2xl font-light text-charcoal mb-4">
            Hi {userName}, let's find your perfect piece
          </h1>
          <div className="max-w-md mx-auto">
            <Progress value={progress} className="h-2" />
            <p className="text-sm text-muted-foreground mt-2">
              Step {currentStep + 1} of {steps.length}
            </p>
          </div>
        </motion.div>

        {/* Question */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-light text-charcoal mb-4">
              {currentStepData.title}
            </h2>
          </motion.div>
        </AnimatePresence>

        {/* Options */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12"
          >
            {currentStepData.options.map((option, index) => (
              <motion.div
                key={option.value}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card
                  className="premium-card cursor-pointer transition-all duration-300 hover:scale-105 hover:luxury-shadow"
                  onClick={() => handleOptionSelect(option.value)}
                >
                  <div className="text-center p-6">
                    <h3 className="text-xl font-medium text-charcoal mb-2">
                      {option.label}
                    </h3>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex justify-center"
        >
          <Button
            variant="outline"
            onClick={handleBack}
            className="kiosk-button border-2 px-8"
          >
            <ChevronLeft className="w-5 h-5 mr-2" />
            Back
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default SurveyWizard;