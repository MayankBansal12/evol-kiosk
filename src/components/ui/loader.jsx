import { motion } from "motion/react";

export const Loader = ({ position = "center" }) => {
  const positionClasses =
    position === "bottom"
      ? "fixed bottom-20 left-1/2 transform -translate-x-1/2 z-20"
      : "text-center my-8";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={positionClasses}
    >
      <div className="flex justify-center items-center space-x-2">
        <div className="w-3 h-3 rounded-full bg-gold animate-bounce [animation-delay:-0.3s]"></div>
        <div className="w-3 h-3 rounded-full bg-gold animate-bounce [animation-delay:-0.15s]"></div>
        <div className="w-3 h-3 rounded-full bg-gold animate-bounce"></div>
      </div>
    </motion.div>
  );
};
