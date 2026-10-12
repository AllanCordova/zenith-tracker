type FormErrorProps = {
  children?: string;
};

export function FormError({ children }: FormErrorProps) {
  if (!children) {
    return null;
  }

  return (
    <p className="zt-erro" role="alert">
      {children}
    </p>
  );
}
