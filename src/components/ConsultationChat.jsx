"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import * as Dialog from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Send, X, Bot } from "lucide-react";
import { getProductChatResponse } from "@/app/actions/aiResponse";
import PropTypes from "prop-types";

const ConsultationChat = ({ product, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: "assistant",
      content: `Hey there! 👋 I'm Evol-e, your jewelry buddy! This ${product.product_name} is pretty special - what's on your mind? ✨`,
      timestamp: new Date(),
    },
  ]);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;

    // Add user message
    const userMessage = {
      id: Date.now(),
      role: "user",
      content: message.trim(),
      timestamp: new Date(),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setMessage("");
    setIsLoading(true);

    try {
      // Get AI response
      const response = await getProductChatResponse(updatedMessages, product);

      if (response.success) {
        const aiResponse = {
          id: Date.now() + 1,
          role: "assistant",
          content: response.data.content,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, aiResponse]);
      } else {
        // Handle error
        const errorResponse = {
          id: Date.now() + 1,
          role: "assistant",
          content:
            response.error ||
            "I'm having trouble responding right now. Please try again.",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorResponse]);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      const errorResponse = {
        id: Date.now() + 1,
        role: "assistant",
        content: "I'm having trouble responding right now. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorResponse]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
      <Dialog.Trigger asChild>{children}</Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
        <Dialog.Content
          className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-md h-[600px] z-50"
          aria-describedby="chat-description"
        >
          <Dialog.Title className="sr-only">
            Chat with Evol-e about {product.product_name}
          </Dialog.Title>
          <div id="chat-description" className="sr-only">
            Ask questions about this product's materials, styling, and care
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="h-full flex flex-col"
          >
            <Card className="premium-card luxury-shadow h-full flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gold rounded-full flex items-center justify-center">
                    <Bot className="w-4 h-4 text-charcoal" />
                  </div>
                  <div>
                    <h3 className="font-medium text-charcoal">
                      Evol-e Assistant
                    </h3>
                    <p className="text-xs text-muted-foreground">Online now</p>
                  </div>
                </div>
                <Dialog.Close asChild>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <X className="w-4 h-4" />
                  </Button>
                </Dialog.Close>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <AnimatePresence>
                  {messages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className={`flex ${
                        msg.role === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      {msg.role === "user" ? (
                        <div className="max-w-[80%]">
                          <Badge
                            variant="secondary"
                            className="inline-block py-2 px-3 text-sm bg-secondary/80"
                          >
                            {msg.content}
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-1 text-right">
                            {formatTime(msg.timestamp)}
                          </p>
                        </div>
                      ) : (
                        <div className="max-w-[80%]">
                          <Card className="premium-card p-3 inline-block">
                            <p className="text-sm text-charcoal">
                              {msg.content}
                            </p>
                          </Card>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatTime(msg.timestamp)}
                          </p>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* Loading Animation */}
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-start"
                  >
                    <Card className="premium-card p-3 inline-block">
                      <div className="flex items-center space-x-2">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 rounded-full bg-gold animate-bounce [animation-delay:-0.3s]"></div>
                          <div className="w-2 h-2 rounded-full bg-gold animate-bounce [animation-delay:-0.15s]"></div>
                          <div className="w-2 h-2 rounded-full bg-gold animate-bounce"></div>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          Evol-e is typing...
                        </span>
                      </div>
                    </Card>
                  </motion.div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-4 border-t">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={
                      isLoading
                        ? "Evol-e is responding..."
                        : "Ask about materials, styling, or care..."
                    }
                    className="flex-1"
                    disabled={isLoading}
                  />
                  <Button
                    type="submit"
                    size="sm"
                    className="gold-gradient text-charcoal border-0"
                    disabled={!message.trim() || isLoading}
                  >
                    {isLoading ? (
                      <div className="w-4 h-4 flex items-center justify-center">
                        <div className="w-3 h-3 border-2 border-charcoal border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </form>
              </div>
            </Card>
          </motion.div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

ConsultationChat.propTypes = {
  product: PropTypes.shape({
    product_name: PropTypes.string,
    price: PropTypes.number,
    category: PropTypes.string,
    description: PropTypes.string,
    tags: PropTypes.array,
    metadata: PropTypes.object,
  }).isRequired,
  children: PropTypes.node.isRequired,
};

export { ConsultationChat };
