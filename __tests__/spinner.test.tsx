import { render, screen } from "@testing-library/react";
import { Spinner } from "@/components/ui/spinner";

describe("Spinner Component", () => {
  it("renders spinner with animation class", () => {
    const { container } = render(<Spinner />);
    const spinner = container.firstChild as HTMLElement;
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveClass("animate-spin");
  });

  it("applies custom className", () => {
    const { container } = render(<Spinner className="custom-class" />);
    const spinner = container.firstChild as HTMLElement;
    expect(spinner).toHaveClass("custom-class");
    expect(spinner).toHaveClass("animate-spin");
  });

  it("renders with custom size via className", () => {
    const { container } = render(<Spinner className="h-8 w-8" />);
    const spinner = container.firstChild as HTMLElement;
    expect(spinner).toHaveClass("h-8", "w-8");
  });

  it("has rounded and border styles", () => {
    const { container } = render(<Spinner />);
    const spinner = container.firstChild as HTMLElement;
    expect(spinner).toHaveClass("rounded-full");
    expect(spinner).toHaveClass("border-b-2");
  });
});
