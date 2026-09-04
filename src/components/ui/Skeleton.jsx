import React from "react";

export function SkeletonItem({
  className = "",
  style,
  width,
  height,
  circle = false,
  shimmer = true,
  pulse = true,
  ...props
}) {
  const inlineStyles = {
    ...style,
    ...(width !== undefined ? { width: typeof width === "number" ? `${width}px` : width } : {}),
    ...(height !== undefined ? { height: typeof height === "number" ? `${height}px` : height } : {}),
  };

  const classes = [
    "skeleton-base",
    shimmer ? "skeleton-shimmer" : "",
    pulse ? "skeleton-pulse" : "",
    circle ? "rounded-full" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return <div className={classes} style={inlineStyles} {...props} />;
}

export function TableRowsSkeleton({ rows = 5, columns = 5 }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, rIdx) => (
        <tr key={rIdx}>
          {Array.from({ length: columns }).map((_, cIdx) => (
            <td key={cIdx} style={{ padding: "14px 16px" }}>
              <SkeletonItem
                height={16}
                width={cIdx === 0 ? "40%" : cIdx === 1 ? "80%" : "60%"}
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

export default function Skeleton({
  variant = "generic",
  count = 1,
  className = "",
  rows = 5,
  columns = 5,
  width,
  height,
  circle = false,
  shimmer = true,
  pulse = true,
  ...props
}) {
  if (variant === "table-rows") {
    return <TableRowsSkeleton rows={rows || count} columns={columns} />;
  }

  if (count > 1) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }} className={className} {...props}>
        {Array.from({ length: count }).map((_, i) => (
          <SkeletonItem
            key={i}
            width={width}
            height={height || 20}
            circle={circle}
            shimmer={shimmer}
            pulse={pulse}
          />
        ))}
      </div>
    );
  }

  return (
    <SkeletonItem
      width={width}
      height={height}
      circle={circle}
      shimmer={shimmer}
      pulse={pulse}
      className={className}
      {...props}
    />
  );
}

