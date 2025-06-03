import { CSSProperties } from "react";

interface SkeletonProps {
  width?: string;
  height?: string;
  className?: string;
  style?: CSSProperties;
}

const Skeleton: React.FC<SkeletonProps> = ({
  width = "w-full",
  height = "h-4",
  className = "",
  style = {},
  ...props
}) => {
  return (
    <div
      className={`bg-gray-300 dark:bg-gray-800 animate-pulse rounded ${width} ${height} ${className}`}
      style={{ ...style }}
      {...props}
    />
  );
};

export { Skeleton };
