import { Card } from "@/components/ui/card";
import { ArrowUp, ArrowDown, Minus, LucideIcon } from "lucide-react";

interface KPICardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: LucideIcon;
  prefix?: string;
  suffix?: string;
  description?: string;
}

export function KPICard({
  title,
  value,
  change,
  changeLabel = "vs last period",
  icon: Icon,
  prefix = "",
  suffix = "",
  description,
}: KPICardProps) {
  const formattedValue = typeof value === "number" ? value.toLocaleString() : value;

  const changeColor =
    change === undefined
      ? ""
      : change > 0
      ? "text-green-600"
      : change < 0
      ? "text-red-600"
      : "text-gray-600";

  const ChangeIcon =
    change === undefined
      ? null
      : change > 0
      ? ArrowUp
      : change < 0
      ? ArrowDown
      : Minus;

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className="mt-2 flex items-baseline gap-2">
            <p className="text-3xl font-bold">
              {prefix}
              {formattedValue}
              {suffix}
            </p>
            {change !== undefined && ChangeIcon && (
              <span className={`flex items-center text-sm font-medium ${changeColor}`}>
                <ChangeIcon className="h-4 w-4 mr-1" />
                {Math.abs(change).toFixed(1)}%
              </span>
            )}
          </div>
          {(change !== undefined || description) && (
            <p className="mt-1 text-xs text-muted-foreground">
              {description || changeLabel}
            </p>
          )}
        </div>
        {Icon && (
          <div className="ml-4 p-3 rounded-lg bg-primary/10">
            <Icon className="h-6 w-6 text-primary" />
          </div>
        )}
      </div>
    </Card>
  );
}
