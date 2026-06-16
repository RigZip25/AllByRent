import { MASCOT_NAME } from "../../lib/brand";
import mrRentanoImg from "../../imports/No_back_rentano.png";

export function MrRentano({ size = 120, className = "", waving = false }: { size?: number; className?: string; waving?: boolean }) {
  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      <img
        src={mrRentanoImg}
        alt={MASCOT_NAME}
        className="w-full h-full object-contain"
      />
    </div>
  );
}
