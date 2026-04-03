import { motion } from "motion/react";
import { Minus } from "lucide-react";

interface StyleToggleProps {
  activeStyle: "minimal" | "extravagant";
  onStyleChange: (style: "minimal" | "extravagant") => void;
}

export function StyleToggle({ activeStyle, onStyleChange }: StyleToggleProps) {
  return (
    <div className="inline-flex border-2 border-black">
      <button
        onClick={() => onStyleChange("minimal")}
        className={`px-8 py-4 uppercase tracking-[0.2em] text-sm transition-all duration-300 ${
          activeStyle === "minimal"
            ? "bg-black text-white"
            : "bg-white text-black hover:bg-gray-100"
        }`}
      >
        Minimal
      </button>
      <div className="w-px bg-black"></div>
      <button
        onClick={() => onStyleChange("extravagant")}
        className={`px-8 py-4 uppercase tracking-[0.2em] text-sm transition-all duration-300 ${
          activeStyle === "extravagant"
            ? "bg-black text-white"
            : "bg-white text-black hover:bg-gray-100"
        }`}
      >
        Extravagant
      </button>
    </div>
  );
}

interface StyleSwitchProps {
  activeStyle: "minimal" | "extravagant";
  onStyleChange: (style: "minimal" | "extravagant") => void;
}

export function StyleSwitch({ activeStyle, onStyleChange }: StyleSwitchProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center gap-6"
    >
      <div className="flex items-center gap-4">
        <div className="w-12 h-[1px] bg-black"></div>
        <Minus size={16} />
        <div className="w-12 h-[1px] bg-black"></div>
      </div>
      
      <div className="text-center space-y-2">
        <p className="text-xs tracking-[0.3em] uppercase text-gray-500">
          Select Your Style
        </p>
        <StyleToggle
          activeStyle={activeStyle}
          onStyleChange={onStyleChange}
        />
      </div>

      <div className="text-center max-w-md">
        <p className="text-sm text-gray-600 leading-relaxed">
          {activeStyle === "minimal"
            ? "Clean lines, timeless elegance. Pieces designed for everyday sophistication."
            : "Bold statements, avant-garde designs. For those who dare to be different."}
        </p>
      </div>
    </motion.div>
  );
}
