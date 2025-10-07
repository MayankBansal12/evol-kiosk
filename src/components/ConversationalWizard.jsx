"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft } from "lucide-react";
import { getAIResponse } from "@/app/actions/aiResponse";
import { Loader } from "@/components/ui/loader";

const ConversationalWizard = ({ userName, onComplete, onBack }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [products, setProducts] = useState(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    const initializeConversation = async () => {
      setIsLoading(true);
      try {
        const initialMessages = [
          {
            role: "system",
            content:
              "You are a friendly jewellery stylist helping the user find the perfect piece.",
            metadata: { name: userName },
          },
        ];

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
        }
      } catch (error) {
        console.error("Error initializing conversation:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeConversation();
  }, [userName]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, currentQuestion]);

  const handleOptionSelect = async (option) => {
    if (isLoading) return;

    setIsLoading(true);
    const userMessage = {
      role: "user",
      content: option.label,
    };

    try {
      const updatedMessages = [...messages, userMessage];
      setMessages(updatedMessages);

      const response = await getAIResponse(updatedMessages);
      if (response.success) {
        const aiMessage = {
          role: "assistant",
          content: response.data.content,
        };

        setMessages([...updatedMessages, aiMessage]);

        if (response.data.type !== "products") {
          setCurrentQuestion(response.data);
        } else {
          setProducts(response.data.products);
          setCurrentQuestion(null);

          onComplete({
            name: userName,
            products: response.data.products,
            tags: response.data.tags,
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
    <div className="min-h-screen hero-gradient px-4 py-8">
      <div className="max-w-4xl mx-auto">
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
                  msg.content != currentQuestion?.content,
              )
              .map((message, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className={`mb-6 ${message.role === "user" ? "text-right" : "text-left"}`}
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
              className="mb-12"
            >
              <Card className="premium-card luxury-shadow mb-6">
                <p className="text-xl text-charcoal">
                  {currentQuestion.content}
                </p>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AnimatePresence>
                  {currentQuestion.options &&
                    currentQuestion.options.map((option, index) => (
                      <motion.div
                        key={option.value}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.2 + index * 0.1 }}
                      >
                        <Card
                          className={`premium-card cursor-pointer transition-all duration-300 hover:scale-105 hover:luxury-shadow ${isLoading ? "opacity-50 pointer-events-none" : ""}`}
                          onClick={() => handleOptionSelect(option)}
                        >
                          <div className="text-center p-4">
                            <h3 className="text-lg font-medium text-charcoal">
                              {option.label}
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
          {isLoading && <Loader />}

          <div ref={bottomRef} />
        </div>

        {/* Navigation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex justify-center"
        >
          <Button
            variant="outline"
            onClick={onBack}
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

export default ConversationalWizard;
