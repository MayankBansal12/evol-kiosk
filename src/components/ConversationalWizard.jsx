"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RotateCcw, ShoppingBag, ArrowLeft } from "lucide-react";
import { getAIResponse } from "@/app/actions/aiResponse";
import { Loader } from "@/components/ui/loader";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { toast } from "sonner";
import PropTypes from "prop-types";
import {
  saveSessionData,
  getSessionData,
  getCurrentSessionId,
  updateLastActivity,
  getTimeUntilExpiry,
  isSessionAboutToExpire,
  clearCurrentSession,
} from "@/lib/sessionManager";

const ConversationalWizard = ({ userName, onComplete, onTimeout, onBack }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [showRestartDialog, setShowRestartDialog] = useState(false);
  const [showSkipButton, setShowSkipButton] = useState(false);
  const bottomRef = useRef(null);
  const inactivityTimerRef = useRef(null);
  const warningShownRef = useRef(false);
  const sessionIdRef = useRef(null);

  useEffect(() => {
    const initializeConversation = async () => {
      setIsLoading(true);
      try {
        // Get or create session
        const sessionId = getCurrentSessionId();
        sessionIdRef.current = sessionId;

        // Try to restore from session
        const sessionData = getSessionData(sessionId);

        if (
          sessionData &&
          sessionData.messages &&
          sessionData.messages.length > 0
        ) {
          // Restore conversation from session
          setMessages(sessionData.messages);
          setCurrentQuestion(sessionData.currentQuestion);
          toast.success("Conversation restored from previous session", {
            duration: 2000,
          });
        } else {
          // Start new conversation
          const initialMessages = [];

          // Get AI response for the first question
          const response = await getAIResponse(initialMessages, userName);
          if (response.success) {
            const aiMessage = {
              role: "assistant",
              content: response.data.content,
            };

            const updatedMessages = [...initialMessages, aiMessage];
            setCurrentQuestion(response.data);
            setMessages(updatedMessages);

            // Save initial state
            saveSessionData(sessionId, {
              userName,
              messages: updatedMessages,
              currentQuestion: response.data,
              state: "survey",
            });
          }
        }

        // Start inactivity timer
        startInactivityTimer();
      } catch (error) {
        console.error("Error initializing conversation:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeConversation();

    // Cleanup on unmount
    return () => {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
    };
  }, [userName]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, currentQuestion]);

  // Track user messages to show skip button after 5
  useEffect(() => {
    const userMessageCount = messages.filter(
      (msg) => msg.role === "user"
    ).length;
    setShowSkipButton(userMessageCount >= 5);
  }, [messages]);

  // Inactivity timer functions
  const startInactivityTimer = () => {
    // Clear existing timer
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }

    warningShownRef.current = false;

    const checkInactivity = () => {
      const sessionId = sessionIdRef.current;
      if (!sessionId) return;

      const timeRemaining = getTimeUntilExpiry(sessionId);

      // Show warning at 30 seconds
      if (isSessionAboutToExpire(sessionId) && !warningShownRef.current) {
        warningShownRef.current = true;
        toast.warning(
          "Your session will expire in 30 seconds due to inactivity",
          {
            duration: 30000,
            action: {
              label: "I'm here",
              onClick: () => {
                resetInactivityTimer();
              },
            },
          }
        );
      }

      // Session expired
      if (timeRemaining <= 0) {
        handleSessionTimeout();
        return;
      }

      // Check again in 1 second
      inactivityTimerRef.current = setTimeout(checkInactivity, 1000);
    };

    // Start checking
    inactivityTimerRef.current = setTimeout(checkInactivity, 1000);
  };

  const resetInactivityTimer = () => {
    const sessionId = sessionIdRef.current;
    if (sessionId) {
      updateLastActivity(sessionId);
      startInactivityTimer();
      warningShownRef.current = false;
    }
  };

  const handleSessionTimeout = () => {
    toast.error("Session timed out due to inactivity", {
      duration: 3000,
    });

    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }

    // Call parent timeout handler
    if (onTimeout) {
      onTimeout();
    }
  };

  const handleRestart = () => {
    setShowRestartDialog(true);
  };

  const confirmRestart = () => {
    setShowRestartDialog(false);

    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }

    // Clear ALL localStorage and session data
    localStorage.removeItem("surveyData");
    clearCurrentSession();

    // Redirect to home for fresh start
    window.location.href = "/";
  };

  const cancelRestart = () => {
    setShowRestartDialog(false);
    resetInactivityTimer(); // Reset timer when user interacts
  };

  const handleSkipToProducts = async () => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      // Add a skip message to context
      const skipMessage = {
        role: "user",
        content: "I'd like to skip to see products now",
      };

      const updatedMessages = [...messages, skipMessage];
      setMessages(updatedMessages);
      setCurrentQuestion(null);

      const response = await getAIResponse(updatedMessages);
      if (response.success) {
        const aiMessage = {
          role: "assistant",
          content: response.data.content,
        };

        const newMessages = [...updatedMessages, aiMessage];
        setMessages(newMessages);

        if (response.data.type === "products") {
          setCurrentQuestion(null);
          onComplete({
            name: userName,
            products: response.data.products,
            category: response.data.category,
            tags: response.data.tags,
            metadata: response.data.metadata,
          });
        } else {
          // If AI doesn't return products, force it by calling with a direct request
          const forceProductsResponse = await getAIResponse([
            ...newMessages,
            { role: "user", content: "Please show me jewelry products now" },
          ]);

          if (
            forceProductsResponse.success &&
            forceProductsResponse.data.type === "products"
          ) {
            onComplete({
              name: userName,
              products: forceProductsResponse.data.products,
              category: forceProductsResponse.data.category,
              tags: forceProductsResponse.data.tags,
              metadata: forceProductsResponse.data.metadata,
            });
          }
        }
      }
    } catch (error) {
      console.error("Error skipping to products:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOptionSelect = async (option) => {
    // Reset inactivity timer on user interaction
    resetInactivityTimer();
    if (isLoading) return;

    setIsLoading(true);
    const optionValue =
      typeof option === "string" ? option : option.value || option.label;
    const userMessage = {
      role: "user",
      content: optionValue,
    };

    try {
      const updatedMessages = [...messages, userMessage];
      setMessages(updatedMessages);
      setCurrentQuestion(null);

      const response = await getAIResponse(updatedMessages);
      if (response.success) {
        const aiMessage = {
          role: "assistant",
          content: response.data.content,
        };

        const newMessages = [...updatedMessages, aiMessage];
        setMessages(newMessages);

        if (response.data.type !== "products") {
          setCurrentQuestion(response.data);

          // Save to session
          const sessionId = sessionIdRef.current;
          if (sessionId) {
            saveSessionData(sessionId, {
              userName,
              messages: newMessages,
              currentQuestion: response.data,
              state: "survey",
            });
          }
        } else {
          setCurrentQuestion(null);

          onComplete({
            name: userName,
            products: response.data.products,
            category: response.data.category,
            tags: response.data.tags,
            metadata: response.data.metadata,
          });
        }
      }
    } catch (error) {
      console.error("Error handling option selection:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen hero-gradient px-4 py-8 pb-32">
      <div className="max-w-4xl mx-auto">
        {/* Skip to Products Button - Floating */}
        <AnimatePresence>
          {showSkipButton && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              transition={{ duration: 0.3 }}
              className="fixed bottom-24 right-4 z-20"
            >
              <Button
                onClick={handleSkipToProducts}
                disabled={isLoading}
                className="gold-gradient text-charcoal border-0 px-6 py-3 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <ShoppingBag className="w-4 h-4 mr-2" />
                Skip to Products
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Confirmation Dialog */}
        <ConfirmDialog
          isOpen={showRestartDialog}
          onConfirm={confirmRestart}
          onCancel={cancelRestart}
          title="Are you sure you want to start over?"
          message="Your current conversation will be lost and you'll return to the welcome screen."
        />

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-light text-charcoal mb-4">
            <span className="font-medium">Evol-</span> e
          </h1>
        </motion.div>

        {/* Conversation History */}
        <div className="mb-12 max-w-2xl mx-auto">
          <AnimatePresence>
            {messages
              .filter(
                (msg) =>
                  msg.role !== "system" &&
                  msg.content != currentQuestion?.content
              )
              .map((message, index) => (
                <motion.div
                  key={`message-${index}-${message.content.slice(0, 20)}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className={`mb-6 ${
                    message.role === "user" ? "text-right" : "text-left"
                  }`}
                >
                  {message.role === "user" ? (
                    <div className="flex justify-end">
                      <Badge
                        variant="secondary"
                        className="inline-block py-2 px-4 text-base bg-secondary/80"
                      >
                        {message.content}
                      </Badge>
                    </div>
                  ) : (
                    <Card className="inline-block premium-card max-w-[85%] p-4 luxury-shadow">
                      <p className="text-lg text-charcoal">{message.content}</p>
                    </Card>
                  )}
                </motion.div>
              ))}
          </AnimatePresence>

          {/* Current Question Options */}
          {currentQuestion && (
            <motion.div
              key="current-question"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-12 flex flex-col items-center"
            >
              <Card className="premium-card luxury-shadow mb-6 max-w-2xl w-full text-center">
                <p className="text-2xl font-medium text-charcoal leading-relaxed">
                  {currentQuestion.content}
                </p>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AnimatePresence>
                  {currentQuestion.options &&
                    currentQuestion.options.map((option, index) => (
                      <motion.div
                        key={`option-${index}-${
                          typeof option === "string"
                            ? option
                            : option.value || option.label
                        }`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.2 + index * 0.1 }}
                      >
                        <Card
                          className={`premium-card cursor-pointer transition-all duration-300 hover:scale-105 hover:luxury-shadow ${
                            isLoading ? "opacity-50 pointer-events-none" : ""
                          }`}
                          onClick={() => handleOptionSelect(option)}
                        >
                          <div className="text-center p-4">
                            <h3 className="text-lg font-medium text-charcoal">
                              {typeof option === "string"
                                ? option
                                : option.label || option.value}
                            </h3>
                          </div>
                        </Card>
                      </motion.div>
                    ))}
                </AnimatePresence>
              </div>
            </motion.div>
          )}

          {/* Loading State */}
          {isLoading && <Loader position="bottom" />}

          <div ref={bottomRef} />
        </div>

        {/* Fixed Bottom Bar */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="fixed bottom-0 left-0 right-0 z-30"
        >
          <Card className="premium-card luxury-shadow mx-4 mb-2 border-2 border-gold/20">
            <div className="flex justify-center gap-4 p-3">
              {onBack && (
                <Button
                  onClick={onBack}
                  variant="outline"
                  className="h-12 px-4 text-sm font-medium border-2 border-gold/30 bg-white text-charcoal hover:bg-gold/10 hover:border-gold/50 transition-all duration-300 flex-shrink-0"
                  style={{ minWidth: "80px", maxWidth: "120px" }}
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Back
                </Button>
              )}
              <Button
                onClick={handleRestart}
                className="h-12 px-6 text-sm font-medium gold-gradient text-charcoal border-0 hover:shadow-[var(--shadow-glow)] transition-all duration-300 flex-shrink-0"
                style={{ minWidth: "120px", maxWidth: "180px" }}
              >
                <RotateCcw className="w-4 h-4 mr-1" />
                Start Over
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

ConversationalWizard.propTypes = {
  userName: PropTypes.string,
  onComplete: PropTypes.func.isRequired,
  onTimeout: PropTypes.func,
  onBack: PropTypes.func,
};

export { ConversationalWizard };
