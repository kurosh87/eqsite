"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { subDays, subMonths, format } from "date-fns";

interface DateRangeSelectorProps {
  onRangeChange: (start: Date, end: Date) => void;
}

export function DateRangeSelector({ onRangeChange }: DateRangeSelectorProps) {
  const [activeRange, setActiveRange] = useState<string>("30d");

  const ranges = [
    { label: "7 Days", value: "7d", days: 7 },
    { label: "30 Days", value: "30d", days: 30 },
    { label: "90 Days", value: "90d", days: 90 },
    { label: "1 Year", value: "1y", days: 365 },
  ];

  const handleRangeClick = (value: string, days: number) => {
    setActiveRange(value);
    const end = new Date();
    const start = subDays(end, days);
    onRangeChange(start, end);
  };

  return (
    <div className="flex gap-2 flex-wrap">
      {ranges.map((range) => (
        <Button
          key={range.value}
          variant={activeRange === range.value ? "default" : "outline"}
          size="sm"
          onClick={() => handleRangeClick(range.value, range.days)}
        >
          {range.label}
        </Button>
      ))}
    </div>
  );
}
