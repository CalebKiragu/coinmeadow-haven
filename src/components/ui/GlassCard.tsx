import { cn } from "@/lib/utils";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

const GlassCard = ({ children, className, ...props }: GlassCardProps) => {
  return (
    <div
      className={cn(
        "backdrop-blur-md bg-white/30 rounded-2xl border border-white/20 shadow-xl p-6",
        "hover:bg-white/40 transition-all duration-300",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export default GlassCard;