"use client";

import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect } from "react";
import Image from "next/image";
import PropTypes from "prop-types";

const EvoleCharacter = ({
  state = "idle",
  size = "medium",
  showSpeechBubble = false,
  speechText = "",
  className = "",
  onAnimationComplete,
}) => {
  const [eyeBlink, setEyeBlink] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Auto-blink effect for idle state
  useEffect(() => {
    if (state === "idle") {
      const blinkInterval = setInterval(() => {
        setEyeBlink(true);
        setTimeout(() => setEyeBlink(false), 150);
      }, 3000 + Math.random() * 2000);

      return () => clearInterval(blinkInterval);
    }
  }, [state]);

  // Entrance animation
  useEffect(() => {
    setIsVisible(true);
  }, []);

  const sizeClasses = {
    small: "w-12 h-12",
    medium: "w-20 h-20",
    large: "w-32 h-32",
    xlarge: "w-40 h-40",
  };

  const getAnimationVariants = () => {
    const baseVariants = {
      idle: {
        y: [0, -4, 0],
        rotate: [0, 1, 0],
        transition: {
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        },
      },
      talking: {
        y: [0, -6, 0],
        scale: [1, 1.05, 1],
        transition: {
          duration: 0.6,
          repeat: Infinity,
          ease: "easeInOut",
        },
      },
      listening: {
        rotate: [-5, 5, -5],
        scale: [1, 1.02, 1],
        transition: {
          duration: 1,
          repeat: Infinity,
          ease: "easeInOut",
        },
      },
      thinking: {
        rotate: [0, 360],
        scale: [1, 1.1, 1],
        transition: {
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        },
      },
      excited: {
        y: [0, -12, 0],
        scale: [1, 1.15, 1],
        rotate: [0, 5, -5, 0],
        transition: {
          duration: 0.8,
          repeat: 2,
          ease: "easeOut",
        },
      },
      waving: {
        rotate: [0, 15, -15, 0],
        y: [0, -8, 0],
        transition: {
          duration: 1.2,
          repeat: 1,
          ease: "easeInOut",
        },
      },
    };

    return baseVariants;
  };

  const getEyeAnimation = () => {
    if (eyeBlink) {
      return {
        scaleY: [1, 0.1, 1],
        transition: { duration: 0.15 },
      };
    }
    return {};
  };

  const getSpeechBubbleContent = () => {
    if (!showSpeechBubble || !speechText) return null;

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: 10 }}
        className="absolute -top-16 left-1/2 transform -translate-x-1/2 bg-white rounded-lg px-3 py-2 shadow-lg border-2 border-gold/30 max-w-xs"
      >
        <div className="text-sm text-charcoal font-medium text-center">
          {speechText}
        </div>
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white"></div>
      </motion.div>
    );
  };

  const animationVariants = getAnimationVariants();

  return (
    <div className={`relative ${className}`}>
      <motion.div
        initial={{ opacity: 0, scale: 0.5, y: 20 }}
        animate={{
          opacity: isVisible ? 1 : 0,
          scale: isVisible ? 1 : 0.5,
          y: isVisible ? 0 : 20,
        }}
        variants={animationVariants}
        animate={state}
        onAnimationComplete={onAnimationComplete}
        className={`${sizeClasses[size]} relative`}
      >
        {/* Main mascot body */}
        <div className="relative w-full h-full">
          {/* Placeholder for WALL-E style robot - using a simple geometric shape for now */}
          <div className="w-full h-full bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 rounded-lg shadow-lg border-2 border-yellow-700/30 relative overflow-hidden">
            {/* Robot body details */}
            <div className="absolute inset-2 bg-yellow-300/20 rounded-md"></div>

            {/* Eyes */}
            <motion.div
              animate={getEyeAnimation()}
              className="absolute top-2 left-2 w-3 h-3 bg-black rounded-full"
            ></motion.div>
            <motion.div
              animate={getEyeAnimation()}
              className="absolute top-2 right-2 w-3 h-3 bg-black rounded-full"
            ></motion.div>

            {/* Eye highlights */}
            <div className="absolute top-2.5 left-2.5 w-1 h-1 bg-white rounded-full"></div>
            <div className="absolute top-2.5 right-2.5 w-1 h-1 bg-white rounded-full"></div>

            {/* Robot details */}
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-8 h-2 bg-yellow-700/50 rounded-sm"></div>
            <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-6 h-1 bg-yellow-800/70 rounded-sm"></div>

            {/* Arms */}
            <div className="absolute top-1/2 -left-1 w-2 h-4 bg-yellow-600 rounded-sm"></div>
            <div className="absolute top-1/2 -right-1 w-2 h-4 bg-yellow-600 rounded-sm"></div>
          </div>
        </div>

        {/* Speech bubble */}
        <AnimatePresence>{getSpeechBubbleContent()}</AnimatePresence>
      </motion.div>
    </div>
  );
};

EvoleCharacter.propTypes = {
  state: PropTypes.oneOf([
    "idle",
    "talking",
    "listening",
    "thinking",
    "excited",
    "waving",
  ]),
  size: PropTypes.oneOf(["small", "medium", "large", "xlarge"]),
  showSpeechBubble: PropTypes.bool,
  speechText: PropTypes.string,
  className: PropTypes.string,
  onAnimationComplete: PropTypes.func,
};

export { EvoleCharacter };
