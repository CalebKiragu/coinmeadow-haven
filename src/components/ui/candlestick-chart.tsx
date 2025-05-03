
import * as React from "react";
import { ChartContainer } from "@/components/ui/chart";

interface CandlestickChartProps extends React.HTMLAttributes<HTMLDivElement> {
  data: any[];
  children: React.ReactNode;
}

export function CandlestickChart({ data, children, ...props }: CandlestickChartProps) {
  return (
    <ChartContainer
      {...props}
      config={{
        candlestick: {
          theme: {
            light: "#10b981",
            dark: "#10b981",
          },
        },
        upward: {
          theme: {
            light: "#10b981",
            dark: "#10b981",
          },
        },
        downward: {
          theme: {
            light: "#ef4444",
            dark: "#ef4444",
          },
        },
      }}
    >
      {children}
    </ChartContainer>
  );
}

// Fix the interface to not extend any SVG attributes
interface CandlestickProps {
  data?: any[];
  yAccessor: (d: any) => [number, number, number, number];
  xAccessor?: (d: any, index: number) => number;
  width?: number;
  horizontalPadding?: number;
  fill?: string | ((d: any) => string);
  stroke?: string | ((d: any) => string);
  className?: string;
}

export function Candlestick({
  data = [],
  yAccessor,
  xAccessor = (_, i) => i,
  width = 10,
  horizontalPadding = 2,
  className,
  fill,
  stroke,
}: CandlestickProps) {
  return (
    <g className={className}>
      {data.map((d: any, i: number) => {
        const [low, open, close, high] = yAccessor(d);
        const x = xAccessor(d, i);
        const isUpward = close > open;

        // Default colors from the theme
        const defaultFill = isUpward ? "var(--color-upward, #10b981)" : "var(--color-downward, #ef4444)";
        const defaultStroke = isUpward ? "var(--color-upward, #10b981)" : "var(--color-downward, #ef4444)";

        // Compute fill and stroke colors
        const fillColor = typeof fill === "function" ? fill(d) : fill || defaultFill;
        const strokeColor = typeof stroke === "function" ? stroke(d) : stroke || defaultStroke;

        return (
          <React.Fragment key={i}>
            {/* Upper wick */}
            <line
              x1={x}
              y1={isUpward ? close : open}
              x2={x}
              y2={high}
              stroke={strokeColor}
              strokeWidth={1}
            />

            {/* Lower wick */}
            <line
              x1={x}
              y1={isUpward ? open : close}
              x2={x}
              y2={low}
              stroke={strokeColor}
              strokeWidth={1}
            />

            {/* Body */}
            <rect
              x={x - width / 2 + horizontalPadding}
              y={isUpward ? close : open}
              width={width - 2 * horizontalPadding}
              height={Math.max(1, Math.abs(close - open))}
              fill={fillColor}
              stroke={strokeColor}
              strokeWidth={1}
            />
          </React.Fragment>
        );
      })}
    </g>
  );
}
