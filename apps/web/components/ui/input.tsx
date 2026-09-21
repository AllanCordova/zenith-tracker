import type { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  id: string;
  label: string;
};

export function Input({ id, label, className, ...props }: InputProps) {
  return (
    <>
      <label className="zt-label" htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        className={className ? `zt-input ${className}` : "zt-input"}
        {...props}
      />
    </>
  );
}
