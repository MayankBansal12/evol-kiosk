import { motion } from "motion/react";

export const Loader = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="text-center my-8"
    >
      <div className="flex justify-center items-center space-x-2">
        <div className="w-3 h-3 rounded-full bg-gold animate-bounce [animation-delay:-0.3s]"></div>
        <div className="w-3 h-3 rounded-full bg-gold animate-bounce [animation-delay:-0.15s]"></div>
        <div className="w-3 h-3 rounded-full bg-gold animate-bounce"></div>
      </div>
    </motion.div>
  );
};
