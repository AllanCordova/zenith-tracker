import type { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "danger";
  loading?: boolean;
};

export function Button({
  variant = "primary",
  loading = false,
  disabled,
  className,
  children,
  type = "button",
  ...props
}: ButtonProps) {
  const base = variant === "danger" ? "zt-btn-perigo" : "zt-btn";
  return (
    <button
      type={type}
      className={className ? `${base} ${className}` : base}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? "Aguarde…" : children}
    </button>
  );
}
