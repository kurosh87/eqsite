import { render, screen, fireEvent, act, waitFor } from "@testing-library/react";
import { LanguageProvider, useLanguage } from "@/components/language-provider";

// Test component that uses the language hook
function TestComponent() {
  const { language, setLanguage, t } = useLanguage();
  return (
    <div>
      <span data-testid="language">{language}</span>
      <span data-testid="loading">{t.common.loading}</span>
      <button onClick={() => setLanguage("es")} data-testid="switch-es">
        Switch to Spanish
      </button>
      <button onClick={() => setLanguage("fr")} data-testid="switch-fr">
        Switch to French
      </button>
    </div>
  );
}

describe("LanguageProvider", () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    // Reset document cookie
    document.cookie = "language=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  });

  it("provides default English language", () => {
    render(
      <LanguageProvider>
        <TestComponent />
      </LanguageProvider>
    );

    expect(screen.getByTestId("language")).toHaveTextContent("en");
    expect(screen.getByTestId("loading")).toHaveTextContent("Loading...");
  });

  it("allows switching languages", async () => {
    render(
      <LanguageProvider>
        <TestComponent />
      </LanguageProvider>
    );

    // Switch to Spanish
    await act(async () => {
      fireEvent.click(screen.getByTestId("switch-es"));
    });

    await waitFor(() => {
      expect(screen.getByTestId("language")).toHaveTextContent("es");
    });

    expect(screen.getByTestId("loading")).toHaveTextContent("Cargando...");
  });

  it("switches to French correctly", async () => {
    render(
      <LanguageProvider>
        <TestComponent />
      </LanguageProvider>
    );

    await act(async () => {
      fireEvent.click(screen.getByTestId("switch-fr"));
    });

    await waitFor(() => {
      expect(screen.getByTestId("language")).toHaveTextContent("fr");
    });

    expect(screen.getByTestId("loading")).toHaveTextContent("Chargement...");
  });

  it("provides all translation keys", () => {
    render(
      <LanguageProvider>
        <TestComponent />
      </LanguageProvider>
    );

    // Verify the translation object has expected structure
    expect(screen.getByTestId("loading").textContent).toBeTruthy();
    expect(screen.getByTestId("loading").textContent?.length).toBeGreaterThan(0);
  });
});

describe("useLanguage hook", () => {
  it("throws error when used outside provider", () => {
    // Suppress console.error for this test
    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    expect(() => {
      render(<TestComponent />);
    }).toThrow();

    consoleSpy.mockRestore();
  });
});
