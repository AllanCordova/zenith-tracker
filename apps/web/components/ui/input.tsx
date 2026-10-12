import { forwardRef, type InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  id: string;
  label: string;
  error?: string;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { id, label, className, error, ...props },
  ref,
) {
  const errorId = `${id}-erro`;

  return (
    <div className="zt-campo">
      <label className="zt-label" htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        ref={ref}
        className={className ? `zt-input ${className}` : "zt-input"}
        aria-invalid={error ? true : undefined}
        aria-describedby={errorId}
        {...props}
      />
      <p id={errorId} className="zt-campo-erro" role={error ? "alert" : undefined}>
        {error ?? "\u00a0"}
      </p>
    </div>
  );
});
