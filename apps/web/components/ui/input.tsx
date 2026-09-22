import { forwardRef, type InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  id: string;
  label: string;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { id, label, className, ...props },
  ref,
) {
  return (
    <>
      <label className="zt-label" htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        ref={ref}
        className={className ? `zt-input ${className}` : "zt-input"}
        {...props}
      />
    </>
  );
});
