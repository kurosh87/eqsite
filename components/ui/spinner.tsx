export function Spinner({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-spin rounded-full border-b-2 border-current ${className}`}
      style={{ width: "1em", height: "1em" }}
    />
  );
}

export function LoadingSpinner({ text = "Loading..." }: { text?: string }) {
  return (
    <div className="flex items-center justify-center space-x-2">
      <Spinner className="h-5 w-5" />
      <span>{text}</span>
    </div>
  );
}
