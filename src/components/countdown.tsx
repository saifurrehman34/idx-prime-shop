"use client";

import { useState, useEffect } from 'react';

interface CountdownProps {
  targetDate: Date;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const calculateTimeLeft = (targetDate: Date): TimeLeft | null => {
  const difference = +targetDate - +new Date();
  if (difference > 0) {
    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    };
  }
  return null;
};

const TimeValue = ({ value, label }: { value: number; label: string }) => (
  <div className="flex flex-col items-center">
    <span className="font-bold text-3xl">{String(value).padStart(2, '0')}</span>
    <span className="text-xs">{label}</span>
  </div>
);

export function Countdown({ targetDate }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);
  
  useEffect(() => {
    // Set initial value on client mount to avoid hydration mismatch
    setTimeLeft(calculateTimeLeft(targetDate));

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(targetDate));
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  if (!timeLeft) {
    return <span>Sale has ended!</span>;
  }

  return (
    <div className="flex items-end gap-3">
        <TimeValue value={timeLeft.days} label="Days" />
        <span className="text-3xl font-bold text-primary">:</span>
        <TimeValue value={timeLeft.hours} label="Hours" />
        <span className="text-3xl font-bold text-primary">:</span>
        <TimeValue value={timeLeft.minutes} label="Minutes" />
        <span className="text-3xl font-bold text-primary">:</span>
        <TimeValue value={timeLeft.seconds} label="Seconds" />
    </div>
  );
}
