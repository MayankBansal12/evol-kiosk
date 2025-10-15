"use client";

import { getAIResponse } from "@/app/actions/aiResponse";
import { speechToText } from "@/app/actions/speechToText";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { TextToSpeechPlayer } from "@/components/TextToSpeechPlayer";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader } from "@/components/ui/loader";
import { ConversationalWizardShimmer } from "@/components/ui/shimmer";
import {
  clearCurrentSession,
  getCurrentSessionId,
  getSessionData,
  getTimeUntilExpiry,
  isSessionAboutToExpire,
  saveSessionData,
  updateLastActivity,
} from "@/lib/sessionManager";
import { Mic, RotateCcw, ShoppingBag, Square } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import PropTypes from "prop-types";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

const ConversationalWizard = ({
  userName,
  languageCode = "English",
  onComplete,
  onTimeout,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [showRestartDialog, setShowRestartDialog] = useState(false);
  const [showSkipButton, setShowSkipButton] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const ttsRef = useRef(null);
  const questionRef = useRef(null);
  const inactivityTimerRef = useRef(null);
  const warningShownRef = useRef(false);
  const sessionIdRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const initializationRef = useRef(false);

  useEffect(() => {
    const initializeConversation = async () => {
      // Prevent duplicate initialization
      if (initializationRef.current) return;
      initializationRef.current = true;

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
          setIsInitialLoading(false);
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
            setIsInitialLoading(false);

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
        setIsInitialLoading(false);
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
  }, [userName, languageCode]);

  useEffect(() => {
    questionRef.current?.scrollIntoView({ behavior: "smooth" });
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
        const result = await speechToText(base64Url, languageCode);

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

  // Show shimmer during initial loading
  if (isInitialLoading) {
    return <ConversationalWizardShimmer />;
  }

  return (
    <div className="min-h-screen hero-gradient px-4 py-8 pb-12">
      <div className="max-w-4xl mx-auto">
        {/* Skip to Products Button - Floating */}
        <AnimatePresence>
          {showSkipButton && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              transition={{ duration: 0.3 }}
              className="fixed bottom-12 right-4 z-20"
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

        <Button
          onClick={handleRestart}
          variant="outline"
          className="fixed right-10 top-8 gold-gradient text-charcoal border-2 px-10 py-4 hover:shadow-lg transition-all duration-300"
        >
          <RotateCcw className="w-5 h-5 mr-2" />
          Start again!
        </Button>

        {/* Conversation History */}
        <div className="my-12 max-w-2xl mx-auto">
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
                    <div className="w-full flex items-end gap-3 justify-end">
                      <Card className="inline-flex gold-gradient text-charcoal max-w-[50%] p-4 luxury-shadow">
                        {message.content}
                      </Card>
                      <Avatar className="w-8 h-8 bg-gradient-to-r from-gold to-yellow-400 rounded-full flex items-center justify-center shadow-md border border-gold/20">
                        <AvatarFallback>
                          {userName?.charAt(0) || "👤"}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  ) : (
                    <div className="flex items-end gap-3">
                      <Avatar className="w-10 h-10 text-black/40 text-xs text-center bg-gold/20 rounded-sm flex justify-center items-center">
                        Evol-e
                      </Avatar>
                      <Card className="inline-block premium-card max-w-[85%] p-4 luxury-shadow">
                        <p className="text-lg text-charcoal">
                          {message.content}
                        </p>
                      </Card>
                    </div>
                  )}
                </motion.div>
              ))}
          </AnimatePresence>

          <div ref={questionRef} />

          {/* Current Question Options */}
          {currentQuestion && (
            <motion.div
              key="current-question"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="my-12 flex flex-col items-center"
            >
              <Card className="premium-card luxury-shadow mb-6 max-w-2xl w-full text-center">
                <p className="text-2xl font-medium text-charcoal leading-relaxed">
                  {currentQuestion.content}
                </p>
                {/* Auto-play TTS for the current AI question text */}
                <div className="sr-only" aria-hidden>
                  <TextToSpeechPlayer
                    ref={ttsRef}
                    text={currentQuestion.content}
                    languageCode={languageCode}
                  />
                </div>
              </Card>

              <div className="w-[90%] grid grid-cols-1 md:grid-cols-2 gap-4">
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

                  {/* Voice Recording Button */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                  >
                    <Card className="premium-card luxury-shadow">
                      <div className="p-4 text-center">
                        <p className="text-sm text-charcoal/70 mb-3">
                          Or speak your answer:
                        </p>
                        {!isRecording ? (
                          <Button
                            onClick={startRecording}
                            disabled={isLoading || isTranscribing}
                            className="gold-gradient text-charcoal border-0 px-6 py-3 shadow-lg hover:shadow-xl transition-all duration-300"
                          >
                            <Mic className="w-5 h-5 mr-2" />
                            {isTranscribing
                              ? "Processing..."
                              : "Start Recording"}
                          </Button>
                        ) : (
                          <Button
                            onClick={stopRecording}
                            className="bg-red-500 hover:bg-red-600 text-white border-0 px-6 py-3 shadow-lg hover:shadow-xl transition-all duration-300"
                          >
                            <Square className="w-5 h-5 mr-2" />
                            Stop Recording
                          </Button>
                        )}
                        {isRecording && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="mt-3 flex items-center justify-center"
                          >
                            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse mr-2"></div>
                            <span className="text-sm text-red-600 font-medium">
                              Recording...
                            </span>
                          </motion.div>
                        )}
                      </div>
                    </Card>
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>
          )}

          {/* Loading State */}
          {isLoading && <Loader position="bottom" />}
        </div>
      </div>
    </div>
  );
};

ConversationalWizard.propTypes = {
  userName: PropTypes.string,
  onComplete: PropTypes.func.isRequired,
  onTimeout: PropTypes.func,
};

export { ConversationalWizard };
