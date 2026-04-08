import { motion } from "motion/react";
import { Minus } from "lucide-react";
import { useState } from "react";

const triggerHaptic = () => {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    navigator.vibrate(10);
  }
};

interface StyleToggleProps {
  activeStyle?: "minimal" | "extravagant";
  onStyleChange?: (style: "minimal" | "extravagant") => void;
}

export function StyleToggle({ activeStyle = "minimal", onStyleChange }: StyleToggleProps) {
  return (
    <div role="tablist" className="relative isolate grid grid-cols-2 w-full max-w-md rounded-full bg-white/5 backdrop-blur-md border border-white/10 p-1">
      <motion.div
        layout
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className="pointer-events-none absolute inset-0 p-1 grid grid-cols-2"
      >
        <div
          className={`rounded-full bg-gradient-to-b from-white/90 to-white/70 shadow-[0_8px_20px_rgba(255,255,255,0.18)] transition-all ${
            activeStyle === "minimal" ? "col-start-1" : "col-start-2"
          }`}
        />
      </motion.div>
      <button
        role="tab"
        aria-selected={activeStyle === "minimal"}
        onClick={() => {
          triggerHaptic();
          onStyleChange?.("minimal");
        }}
        className={`relative z-10 flex items-center justify-center whitespace-nowrap px-4 py-3 sm:px-6 text-xs sm:text-sm font-medium uppercase tracking-[0.2em] transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 active:scale-[0.98] ${
          activeStyle === "minimal"
            ? "text-black font-semibold"
            : "text-white/70 hover:text-white"
        }`}
      >
        Minimal
      </button>
      <button
        role="tab"
        aria-selected={activeStyle === "extravagant"}
        onClick={() => {
          triggerHaptic();
          onStyleChange?.("extravagant");
        }}
        className={`relative z-10 flex items-center justify-center whitespace-nowrap px-4 py-3 sm:px-6 text-xs sm:text-sm font-medium uppercase tracking-[0.2em] transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 active:scale-[0.98] ${
          activeStyle === "extravagant"
            ? "text-black font-semibold"
            : "text-white/70 hover:text-white"
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
        <div className="h-px w-12 bg-white"></div>
        <Minus size={16} className="text-white" />
        <div className="h-px w-12 bg-white"></div>
      </div>
      
      <div className="text-center space-y-2">
        <p className="text-xs tracking-[0.3em] uppercase text-gray-400">
          Select Your Style
        </p>
        <div role="tablist" className="relative isolate grid grid-cols-2 w-full max-w-md rounded-full bg-white/5 backdrop-blur-md border border-white/10 p-1">
          <motion.div
            layout
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="pointer-events-none absolute inset-0 p-1 grid grid-cols-2"
          >
            <div
              className={`rounded-full bg-gradient-to-b from-white/90 to-white/70 shadow-[0_8px_20px_rgba(255,255,255,0.18)] transition-all ${
                activeStyle === "minimal" ? "col-start-1" : "col-start-2"
              }`}
            />
          </motion.div>
          <button
            role="tab"
            aria-selected={activeStyle === "minimal"}
            onClick={() => {
              triggerHaptic();
              handleChange("minimal");
            }}
            className={`relative z-10 flex items-center justify-center whitespace-nowrap px-4 py-3 sm:px-6 text-xs sm:text-sm font-medium uppercase tracking-[0.2em] transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 active:scale-[0.98] ${
              activeStyle === "minimal"
                ? "text-black font-semibold"
                : "text-white/70 hover:text-white"
            }`}
          >
            Minimal
          </button>
          <button
            role="tab"
            aria-selected={activeStyle === "extravagant"}
            onClick={() => {
              triggerHaptic();
              handleChange("extravagant");
            }}
            className={`relative z-10 flex items-center justify-center whitespace-nowrap px-4 py-3 sm:px-6 text-xs sm:text-sm font-medium uppercase tracking-[0.2em] transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 active:scale-[0.98] ${
              activeStyle === "extravagant"
                ? "text-black font-semibold"
                : "text-white/70 hover:text-white"
            }`}
          >
            Extravagant
          </button>
        </div>
      </div>

      <div className="max-w-md text-center text-white">
        <p className="text-sm leading-relaxed">
          {activeStyle === "extravagant"
            ? "Bold statements, avant-garde designs. Where luxury meets audacity—pieces for the daring."
            : "Clean lines, timeless elegance. Pieces designed for everyday sophistication."}
        </p>
      </div>
    </motion.div>
  )
}
