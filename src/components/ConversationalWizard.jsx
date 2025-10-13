"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  RotateCcw,
  ShoppingBag,
  ArrowLeft,
  Mic,
  MicOff,
  Square,
} from "lucide-react";
import { getAIResponse } from "@/app/actions/aiResponse";
import { speechToText } from "@/app/actions/speechToText";
import { Loader } from "@/components/ui/loader";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { toast } from "sonner";
import PropTypes from "prop-types";
import { TextToSpeechPlayer } from "@/components/TextToSpeechPlayer";
import { EvoleCharacter } from "@/components/EvoleCharacter";
import {
  saveSessionData,
  getSessionData,
  getCurrentSessionId,
  updateLastActivity,
  getTimeUntilExpiry,
  isSessionAboutToExpire,
  clearCurrentSession,
} from "@/lib/sessionManager";

const ConversationalWizard = ({
  userName,
  languageCode = "en",
  onComplete,
  onTimeout,
  onBack,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [showRestartDialog, setShowRestartDialog] = useState(false);
  const [showSkipButton, setShowSkipButton] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [mascotState, setMascotState] = useState("idle");
  const ttsRef = useRef(null);
  const bottomRef = useRef(null);
  const inactivityTimerRef = useRef(null);
  const warningShownRef = useRef(false);
  const sessionIdRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

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
          const response = await getAIResponse(
            initialMessages,
            userName,
            languageCode
          );
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
          // Kick off TTS immediately for low latency
          try {
            if (response?.data?.content) {
              ttsRef.current?.playText(response.data.content, languageCode);
            }
          } catch (e) {
            // no-op
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
      // Stop recording if active
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
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

  // Cleanup recording on unmount
  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
      }
    };
  }, [isRecording]);

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

      const response = await getAIResponse(
        updatedMessages,
        userName,
        languageCode
      );
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
          const forceProductsResponse = await getAIResponse(
            [
              ...newMessages,
              { role: "user", content: "Please show me jewelry products now" },
            ],
            userName,
            languageCode
          );

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

    setMascotState("listening");
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

      const response = await getAIResponse(
        updatedMessages,
        userName,
        languageCode
      );
      if (response.success) {
        const aiMessage = {
          role: "assistant",
          content: response.data.content,
        };

        const newMessages = [...updatedMessages, aiMessage];
        setMessages(newMessages);

        if (response.data.type !== "products") {
          setCurrentQuestion(response.data);
          // Kick off TTS immediately for low latency
          try {
            if (response?.data?.content) {
              ttsRef.current?.playText(response.data.content, languageCode);
            }
          } catch (e) {
            // no-op
          }

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

  // Speech-to-text functions
  // These functions handle voice recording, conversion to base64, and transcription
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });
        await processAudioBlob(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      toast.success("Recording started...");
    } catch (error) {
      console.error("Error starting recording:", error);
      toast.error(
        "Failed to start recording. Please check microphone permissions."
      );
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      toast.success("Recording stopped. Processing...");
    }
  };

  const processAudioBlob = async (audioBlob) => {
    setIsTranscribing(true);
    try {
      // Convert blob to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Audio = reader.result;
        const base64Url = `data:audio/webm;base64,${base64Audio.split(",")[1]}`;

        // Send to speech-to-text API
        const result = await speechToText(base64Url);

        if (result.success && result.text) {
          // Use the transcribed text as user response
          await handleVoiceResponse(result.text);
        } else {
          toast.error("Failed to transcribe audio. Please try again.");
        }
        setIsTranscribing(false);
      };
      reader.readAsDataURL(audioBlob);
    } catch (error) {
      console.error("Error processing audio:", error);
      toast.error("Error processing audio. Please try again.");
      setIsTranscribing(false);
    }
  };

  const handleVoiceResponse = async (transcribedText) => {
    // Reset inactivity timer on user interaction
    resetInactivityTimer();
    if (isLoading) return;

    setMascotState("listening");
    setIsLoading(true);
    const userMessage = {
      role: "user",
      content: transcribedText,
    };

    try {
      const updatedMessages = [...messages, userMessage];
      setMessages(updatedMessages);
      setCurrentQuestion(null);

      const response = await getAIResponse(
        updatedMessages,
        userName,
        languageCode
      );
      if (response.success) {
        const aiMessage = {
          role: "assistant",
          content: response.data.content,
        };

        const newMessages = [...updatedMessages, aiMessage];
        setMessages(newMessages);

        if (response.data.type !== "products") {
          setCurrentQuestion(response.data);
          // Kick off TTS immediately for low latency
          try {
            if (response?.data?.content) {
              ttsRef.current?.playText(response.data.content, languageCode);
            }
          } catch (e) {
            // no-op
          }

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
      console.error("Error handling voice response:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen hero-gradient">
      {/* Luxury Top Navbar */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-b border-gold/20 shadow-lg"
      >
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Left side - Back button */}
            <div className="flex items-center space-x-4">
              {onBack && (
                <Button
                  onClick={onBack}
                  variant="outline"
                  className="h-10 px-4 text-sm font-medium border-2 border-gold/30 bg-white text-charcoal hover:bg-gold/10 hover:border-gold/50 transition-all duration-300 rounded-full"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              )}
            </div>

            {/* Center - Logo */}
            <div className="flex items-center">
              <h1 className="text-2xl font-light text-charcoal">
                <span className="font-medium">Evol-</span> e
              </h1>
            </div>

            {/* Right side - Start Over button */}
            <div className="flex items-center space-x-4">
              <Button
                onClick={handleRestart}
                className="h-10 px-4 text-sm font-medium gold-gradient text-charcoal border-0 hover:shadow-lg transition-all duration-300 rounded-full"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Start Over
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Content with top padding for navbar */}
      <div className="pt-20 px-4 py-8 pb-32">
        {/* Floating Evole Mascot */}
        <div className="fixed top-20 right-4 z-20">
          <EvoleCharacter
            state={isLoading ? "thinking" : mascotState}
            size="medium"
            showSpeechBubble={isLoading}
            speechText={isLoading ? "Beep boop! Evole is thinking..." : ""}
          />
        </div>

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

          {/* Conversation History - Chat Style */}
          <div className="mb-12 max-w-4xl mx-auto">
            <div className="space-y-6">
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
                      className={`flex ${
                        message.role === "user"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      {message.role === "user" ? (
                        <div className="flex items-end space-x-2 max-w-[70%]">
                          <div className="bg-gradient-to-r from-gold to-yellow-400 text-charcoal px-5 py-3 rounded-2xl rounded-br-md shadow-lg border border-gold/20">
                            <p className="text-base font-medium leading-relaxed">
                              {message.content}
                            </p>
                          </div>
                          <div className="w-8 h-8 bg-gradient-to-r from-gold to-yellow-400 rounded-full flex items-center justify-center shadow-md border border-gold/20">
                            <span className="text-charcoal font-bold text-sm">
                              U
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-end space-x-2 max-w-[70%]">
                          <div className="bg-white border border-charcoal/20 px-5 py-3 rounded-2xl rounded-br-md shadow-lg backdrop-blur-sm">
                            <p className="text-base text-charcoal leading-relaxed">
                              {message.content}
                            </p>
                          </div>
                          <div className="w-16 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg border-2 border-white flex-shrink-0">
                            <span className="text-white font-bold text-xs leading-none">
                              Evol-e
                            </span>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ))}
              </AnimatePresence>
            </div>

            {/* Current Question - Chat Style */}
            {currentQuestion && (
              <motion.div
                key="current-question"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
              >
                {/* AI Question Message */}
                <div className="flex justify-start mb-6">
                  <div className="flex items-end space-x-2 max-w-[70%]">
                    <div className="bg-white border border-charcoal/20 px-5 py-3 rounded-2xl rounded-br-md shadow-lg backdrop-blur-sm">
                      <p className="text-lg font-medium text-charcoal leading-relaxed">
                        {currentQuestion.content}
                      </p>
                    </div>
                    <div className="w-16 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg border-2 border-white flex-shrink-0">
                      <span className="text-white font-bold text-xs leading-none">
                        Evol-e
                      </span>
                    </div>
                  </div>
                  {/* Auto-play TTS for the current AI question text */}
                  <div className="sr-only" aria-hidden>
                    <TextToSpeechPlayer
                      ref={ttsRef}
                      text={currentQuestion.content}
                      languageCode={languageCode}
                    />
                  </div>
                </div>

                {/* Options aligned with AI message */}
                <div className="flex justify-start">
                  <div className="flex flex-wrap gap-4 max-w-4xl">
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
                            transition={{
                              duration: 0.3,
                              delay: 0.2 + index * 0.1,
                            }}
                          >
                            <Card
                              className={`premium-card cursor-pointer transition-all duration-300 hover:scale-105 hover:luxury-shadow ${
                                isLoading || isRecording || isTranscribing
                                  ? "opacity-50 pointer-events-none"
                                  : ""
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
                </div>
              </motion.div>
            )}

            {/* Loading State */}
            {isLoading && <Loader position="bottom" />}
          </div>

          {/* Floating Voice Recording Button - Right Bottom */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.6 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <div className="flex flex-col items-end space-y-3">
              {!isRecording ? (
                <div className="flex flex-col items-end space-y-2">
                  <Button
                    onClick={startRecording}
                    disabled={isLoading || isTranscribing}
                    className="bg-gradient-to-r from-gold to-yellow-400 text-charcoal border-2 border-gold/30 w-14 h-14 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 flex items-center justify-center p-0"
                  >
                    <Mic className="w-6 h-6" />
                  </Button>
                  <div className="bg-white/95 backdrop-blur-md rounded-full px-3 py-1 shadow-lg border border-gold/20">
                    <p className="text-xs text-charcoal/70 font-medium whitespace-nowrap">
                      Voice
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-end space-y-3">
                  <Button
                    onClick={stopRecording}
                    className="bg-red-500 hover:bg-red-600 text-white border-0 w-14 h-14 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 flex items-center justify-center p-0"
                  >
                    <Square className="w-6 h-6" />
                  </Button>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center space-x-2 bg-red-50/95 backdrop-blur-md px-3 py-2 rounded-full shadow-lg border border-red-200"
                  >
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-xs text-red-600 font-bold">
                      Recording...
                    </span>
                  </motion.div>
                </div>
              )}
            </div>
          </motion.div>

          <div ref={bottomRef} />
        </div>
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
