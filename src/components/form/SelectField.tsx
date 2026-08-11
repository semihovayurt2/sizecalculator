interface Option {
  label: string;
  value: string;
}

interface SelectFieldProps {
  label: string;
  value: string;
  options: Option[];
  onChange: (value: string) => void;
}

export function SelectField({ label, value, options, onChange }: SelectFieldProps) {
  return (
    <label className="block text-sm text-blue-200/75">
      <span className="mb-2 flex items-center justify-between text-xs uppercase tracking-[0.24em] text-blue-200/40">{label}</span>
      <div className="rounded-3xl border border-white/10 bg-[#0D0D0D] px-4 py-3">
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="w-full bg-transparent text-sm text-blue-200/90 outline-none"
        >
          {options.map((option) => (
            <option key={option.value} value={option.value} className="bg-[#0B0B0B] text-blue-200/90">
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </label>
  );
}
