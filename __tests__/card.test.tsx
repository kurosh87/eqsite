import { render, screen } from "@testing-library/react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";

describe("Card Component", () => {
  it("renders card with all subcomponents", () => {
    render(
      <Card data-testid="card">
        <CardHeader>
          <CardTitle>Test Title</CardTitle>
          <CardDescription>Test Description</CardDescription>
        </CardHeader>
        <CardContent>Test Content</CardContent>
        <CardFooter>Test Footer</CardFooter>
      </Card>
    );

    expect(screen.getByTestId("card")).toBeInTheDocument();
    expect(screen.getByText("Test Title")).toBeInTheDocument();
    expect(screen.getByText("Test Description")).toBeInTheDocument();
    expect(screen.getByText("Test Content")).toBeInTheDocument();
    expect(screen.getByText("Test Footer")).toBeInTheDocument();
  });

  it("applies custom className to Card", () => {
    render(<Card className="custom-class" data-testid="card">Content</Card>);
    expect(screen.getByTestId("card")).toHaveClass("custom-class");
  });

  it("renders card header with correct styles", () => {
    render(
      <CardHeader data-testid="header">
        <CardTitle>Title</CardTitle>
      </CardHeader>
    );
    expect(screen.getByTestId("header")).toHaveClass("flex", "flex-col", "space-y-1.5");
  });

  it("renders card title with correct styling", () => {
    render(<CardTitle>Test Title</CardTitle>);
    const title = screen.getByText("Test Title");
    expect(title).toHaveClass("font-semibold");
  });
});
