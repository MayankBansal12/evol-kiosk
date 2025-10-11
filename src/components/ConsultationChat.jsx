"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import * as Dialog from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Send, X, Bot } from "lucide-react";

const ConsultationChat = ({ product, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: "assistant",
      content: `Hello! I'm Evol-e, your personal jewelry consultant. I'd be happy to help you learn more about the ${product.product_name}. What would you like to know?`,
      timestamp: new Date(),
    },
  ]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    // Add user message
    const userMessage = {
      id: Date.now(),
      role: "user",
      content: message.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setMessage("");

    // Simulate AI response (placeholder)
    setTimeout(() => {
      const aiResponse = {
        id: Date.now() + 1,
        role: "assistant",
        content:
          "Thank you for your question! I'm currently learning about this product. For now, I can tell you that this piece features beautiful craftsmanship and would make a wonderful addition to your collection. Is there anything specific about the design or materials you'd like to know more about?",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiResponse]);
    }, 1000);
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
      <Dialog.Trigger asChild>{children}</Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-md h-[600px] z-50">
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
              </div>

              {/* Input Area */}
              <div className="p-4 border-t">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Ask about this product..."
                    className="flex-1"
                    disabled
                  />
                  <Button
                    type="submit"
                    size="sm"
                    className="gold-gradient text-charcoal border-0"
                    disabled={!message.trim()}
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </form>
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  Chat functionality coming soon
                </p>
              </div>
            </Card>
          </motion.div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export { ConsultationChat };
