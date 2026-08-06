import React from 'react';

interface InputFieldProps {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  type?: 'text' | 'number';
  icon?: React.ReactNode;
}

export function InputField({ label, value, onChange, type = 'text', icon }: InputFieldProps) {
  return (
    <label className="block text-sm text-white/70">
      <span className="mb-2 flex items-center justify-between text-xs uppercase tracking-[0.24em] text-white/40">
        {label}
      </span>
      <div className="flex items-center gap-3 rounded-3xl border border-white/10 bg-[#0D0D0D] px-4 py-3 text-sm transition focus-within:border-accent/60">
        {icon ? <span className="text-white/50">{icon}</span> : null}
        <input
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/25"
        />
      </div>
    </label>
  );
}
