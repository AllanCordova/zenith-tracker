"use client";

import { Dumbbell, GraduationCap } from "lucide-react";
import { Select } from "./select";

const PAPEIS = [
  { value: "STUDENT" as const, label: "Aluno", icon: GraduationCap },
  { value: "TRAINER" as const, label: "Treinador", icon: Dumbbell },
];

type Role = "STUDENT" | "TRAINER";

export function RoleSelect({
  value,
  onChange,
}: {
  value: Role;
  onChange: (value: Role) => void;
}) {
  return (
    <Select
      id="role"
      name="role"
      label="Papel"
      value={value}
      options={PAPEIS}
      onChange={onChange}
    />
  );
}
