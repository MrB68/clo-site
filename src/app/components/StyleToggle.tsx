import { motion } from "motion/react";
import { Minus } from "lucide-react";
import { useState } from "react";

interface StyleToggleProps {
  activeStyle?: "minimal" | "extravagant";
  onStyleChange?: (style: "minimal" | "extravagant") => void;
}

export function StyleToggle({ activeStyle = "minimal", onStyleChange }: StyleToggleProps) {
  return (
    <div className="inline-flex flex-nowrap border-2 border-white">
      <button
        onClick={() => onStyleChange?.("minimal")}
        className={`whitespace-nowrap border-r border-white px-6 py-4 text-xs font-medium uppercase tracking-[0.2em] transition-all duration-300 sm:px-8 sm:text-sm ${
          activeStyle === "minimal"
            ? "bg-white text-black"
            : "bg-transparent text-white"
        }`}
      >
        Minimal
      </button>
      <button
        onClick={() => onStyleChange?.("extravagant")}
        className={`whitespace-nowrap px-6 py-4 text-xs font-medium uppercase tracking-[0.2em] transition-all duration-300 sm:px-8 sm:text-sm ${
          activeStyle === "extravagant"
            ? "bg-white text-black"
            : "bg-transparent text-white"
        }`}
      >
        Extravagant
      </button>
    </div>
  );
}

interface StyleSwitchProps {
  activeStyle?: "minimal" | "extravagant";
  onStyleChange?: (style: "minimal" | "extravagant") => void;
}

export function StyleSwitch({ activeStyle: propActiveStyle, onStyleChange: propOnStyleChange }: StyleSwitchProps) {
  const [internalStyle, setInternalStyle] = useState<"minimal" | "extravagant">("minimal");
  
  // Use provided activeStyle if available, otherwise use internal state
  const activeStyle = propActiveStyle !== undefined ? propActiveStyle : internalStyle;
  
  // Use provided onChange if available, otherwise use internal state setter
  const handleChange = (style: "minimal" | "extravagant") => {
    if (propOnStyleChange) {
      propOnStyleChange(style);
    } else {
      setInternalStyle(style);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center gap-6 px-8 py-16 transition-all duration-500"
    >
      <div className="flex items-center gap-4 opacity-50">
        <div className="h-px w-12 bg-black transition-colors duration-300 dark:bg-white"></div>
        <Minus size={16} className="text-black transition-colors duration-300 dark:text-white" />
        <div className="h-px w-12 bg-black transition-colors duration-300 dark:bg-white"></div>
      </div>
      
      <div className="text-center space-y-2">
        <p className="text-xs tracking-[0.3em] uppercase text-gray-600 dark:text-gray-400">
          Select Your Style
        </p>
        <div className="inline-flex flex-nowrap border-2 border-black transition-colors duration-300 dark:border-white">
          <button
            onClick={() => handleChange("minimal")}
            className={`whitespace-nowrap border-r px-6 py-4 text-xs font-medium uppercase tracking-[0.2em] transition-all duration-300 sm:px-8 sm:text-sm ${
              activeStyle === "minimal"
                ? "border-black bg-black text-white dark:border-white dark:bg-white dark:text-black"
                : "border-black bg-transparent text-black dark:border-white dark:text-white"
            }`}
          >
            Minimal
          </button>
          <button
            onClick={() => handleChange("extravagant")}
            className={`whitespace-nowrap px-6 py-4 text-xs font-medium uppercase tracking-[0.2em] transition-all duration-300 sm:px-8 sm:text-sm ${
              activeStyle === "extravagant"
                ? "bg-black text-white dark:bg-white dark:text-black"
                : "bg-transparent text-black dark:text-white"
            }`}
          >
            Extravagant
          </button>
        </div>
      </div>

      <div className="max-w-md text-center text-black transition-colors duration-500 dark:text-white">
        <p className="text-sm leading-relaxed">
          {activeStyle === "extravagant"
            ? "Bold statements, avant-garde designs. Where luxury meets audacity—pieces for the daring."
            : "Clean lines, timeless elegance. Pieces designed for everyday sophistication."}
        </p>
      </div>
    </motion.div>
  )
}
