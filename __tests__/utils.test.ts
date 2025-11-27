import { cn } from "@/lib/utils";

describe("cn utility function", () => {
  it("merges class names correctly", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("handles conditional classes", () => {
    expect(cn("foo", false && "bar", "baz")).toBe("foo baz");
    expect(cn("foo", true && "bar", "baz")).toBe("foo bar baz");
  });

  it("handles undefined and null values", () => {
    expect(cn("foo", undefined, null, "bar")).toBe("foo bar");
  });

  it("merges Tailwind classes correctly", () => {
    // Later classes should override earlier conflicting ones
    expect(cn("px-2 py-1", "px-4")).toBe("py-1 px-4");
    expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500");
  });

  it("handles arrays of classes", () => {
    expect(cn(["foo", "bar"], "baz")).toBe("foo bar baz");
  });

  it("handles objects with conditional classes", () => {
    expect(cn({ foo: true, bar: false, baz: true })).toBe("foo baz");
  });

  it("handles empty inputs", () => {
    expect(cn()).toBe("");
    expect(cn("")).toBe("");
  });

  it("handles complex Tailwind merging scenarios", () => {
    // Background colors
    expect(cn("bg-red-500", "bg-blue-500")).toBe("bg-blue-500");

    // Padding
    expect(cn("p-4", "px-2")).toBe("p-4 px-2");

    // Hover states
    expect(cn("hover:bg-red-500", "hover:bg-blue-500")).toBe("hover:bg-blue-500");
  });
});
