import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, expect, test, vi } from "vitest";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { RoleSelect } from "@/components/ui/role-select";
import { Select } from "@/components/ui/select";

beforeEach(() => {
  cleanup();
});

test("Input associa o rótulo ao campo", () => {
  render(<Input id="name" label="Nome" name="name" value="" onChange={() => undefined} />);
  expect(screen.getByLabelText("Nome")).toBeDefined();
});

test("Button dispara o clique e o de perigo continua sendo um botão", () => {
  const onClick = vi.fn();
  render(
    <>
      <Button type="button" onClick={onClick}>
        Confirmar
      </Button>
      <Button type="button" variant="danger">
        Sair
      </Button>
    </>,
  );

  fireEvent.click(screen.getByRole("button", { name: "Confirmar" }));
  expect(onClick).toHaveBeenCalledTimes(1);
  expect(screen.getByRole("button", { name: "Sair" })).toBeDefined();
});

test("Card envolve o conteúdo", () => {
  render(<Card>painel</Card>);
  expect(screen.getByText("painel")).toBeDefined();
});

test("Select avisa a mudança e mostra os rótulos das opções", () => {
  const onChange = vi.fn();
  render(
    <Select
      id="fruta"
      label="Fruta"
      value="a"
      onChange={onChange}
      options={[
        { value: "a", label: "Maçã" },
        { value: "b", label: "Banana" },
      ]}
    />,
  );

  fireEvent.click(screen.getByLabelText("Fruta"));
  fireEvent.click(screen.getByRole("option", { name: "Banana" }));

  expect(onChange).toHaveBeenCalledWith("b");
});

test("RoleSelect oferece Aluno e Treinador no Papel", () => {
  const onChange = vi.fn();
  render(<RoleSelect value="STUDENT" onChange={onChange} />);

  fireEvent.click(screen.getByLabelText("Papel"));
  expect(screen.getByRole("option", { name: "Aluno" })).toBeDefined();
  fireEvent.click(screen.getByRole("option", { name: "Treinador" }));

  expect(onChange).toHaveBeenCalledWith("TRAINER");
});
