"use client";

export function PasswordStrength({ password }: { password: string }) {
  const getStrength = (pwd: string) => {
    if (!pwd) return { score: 0, label: "", color: "" };

    let score = 0;
    if (pwd.length >= 8) score++;
    if (pwd.length >= 12) score++;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^a-zA-Z0-9]/.test(pwd)) score++;

    if (score === 0) return { score: 0, label: "", color: "" };
    if (score <= 2)
      return { score, label: "Weak", color: "bg-red-500" };
    if (score <= 3)
      return { score, label: "Medium", color: "bg-yellow-500" };
    return { score, label: "Strong", color: "bg-green-500" };
  };

  const strength = getStrength(password);

  if (!password) return null;

  return (
    <div className="mt-2">
      <div className="flex items-center gap-2 mb-1">
        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full ${strength.color} transition-all duration-300`}
            style={{ width: `${(strength.score / 5) * 100}%` }}
          />
        </div>
        <span className={`text-xs font-medium ${strength.color.replace('bg-', 'text-')}`}>
          {strength.label}
        </span>
      </div>
      {strength.score < 4 && (
        <p className="text-xs text-gray-500">
          {strength.score < 3 && "Try adding uppercase, numbers, and symbols"}
          {strength.score === 3 && "Add symbols for a stronger password"}
        </p>
      )}
    </div>
  );
}
