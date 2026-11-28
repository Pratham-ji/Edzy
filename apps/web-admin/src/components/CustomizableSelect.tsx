import React, { useEffect, useState } from 'react';

export interface CustomizableSelectOption {
  value: string;
  label: string;
}

interface CustomizableSelectProps {
  id: string;
  name?: string;
  label: React.ReactNode;
  value: string;
  onChange: (nextValue: string) => void;
  options: Array<string | CustomizableSelectOption>;
  customOptionLabel?: string;
  customPlaceholder?: string;
  customInputLabel?: string;
  hintText?: string;
  required?: boolean;
  disabled?: boolean;
  saveChecked?: boolean;
  onSaveCheckedChange?: (checked: boolean) => void;
  saveLabel?: string;
  selectClassName?: string;
  inputClassName?: string;
}

const CUSTOM_SENTINEL = '__CUSTOM__';

export default function CustomizableSelect({
  id,
  name,
  label,
  value,
  onChange,
  options,
  customOptionLabel = 'Other (Specify Custom)...',
  customPlaceholder = 'Type custom value...',
  customInputLabel,
  hintText,
  required = false,
  disabled = false,
  saveChecked,
  onSaveCheckedChange,
  saveLabel,
  selectClassName,
  inputClassName,
}: CustomizableSelectProps) {
  const normalizedOptions: CustomizableSelectOption[] = options.map((opt) =>
    typeof opt === 'string' ? { value: opt, label: opt } : opt
  );

  const findMatchedOption = (val: string) => {
    const clean = (val || '').trim();
    if (!clean) return undefined;
    return normalizedOptions.find(
      (opt) => opt.value === clean || opt.value.toLowerCase() === clean.toLowerCase()
    );
  };

  const matchedOption = findMatchedOption(value);
  const [customMode, setCustomMode] = useState<boolean>(
    () => Boolean(value && value.trim()) && !matchedOption
  );

  useEffect(() => {
    if (matchedOption) {
      setCustomMode(false);
    } else if (value && value.trim()) {
      setCustomMode(true);
    }
  }, [value, Boolean(matchedOption)]);

  const isCustomActive = customMode || (Boolean(value && value.trim()) && !matchedOption);
  const selectValue = isCustomActive ? CUSTOM_SENTINEL : matchedOption ? matchedOption.value : '';
  const customInputId = `${id}-custom`;

  const baseSelectClasses =
    selectClassName ||
    'w-full px-3.5 py-2.5 bg-[#F6F8FC] dark:bg-[#1A2336] border border-[#E2E8F0] dark:border-[#232E44] rounded-xl text-sm font-medium text-slate-900 dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#4F46E5]';

  const baseInputClasses =
    inputClassName ||
    'w-full px-3.5 py-2.5 bg-white dark:bg-[#0D1322] border border-[#4F46E5] dark:border-[#6366F1] rounded-xl text-sm font-medium text-slate-900 dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#4F46E5]';

  return (
    <div className="space-y-2">
      <label
        htmlFor={id}
        className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-[#94A3B8]"
      >
        {label}
      </label>

      <select
        id={id}
        name={name || id}
        value={selectValue}
        disabled={disabled}
        required={required && !isCustomActive}
        aria-describedby={hintText ? `${id}-hint` : undefined}
        onChange={(e) => {
          const picked = e.target.value;
          if (picked === CUSTOM_SENTINEL) {
            setCustomMode(true);
            if (findMatchedOption(value)) {
              onChange('');
            }
          } else {
            setCustomMode(false);
            onChange(picked);
          }
        }}
        className={baseSelectClasses}
      >
        {!selectValue && !required && <option value="">Select an option...</option>}
        {normalizedOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
        <option value={CUSTOM_SENTINEL}>{customOptionLabel}</option>
      </select>

      {isCustomActive && (
        <div className="space-y-2 pt-0.5 animate-in fade-in duration-150">
          <label htmlFor={customInputId} className="visually-hidden">
            {customInputLabel || `Custom value for ${typeof label === 'string' ? label : id}`}
          </label>
          <input
            id={customInputId}
            name={`${name || id}_custom`}
            type="text"
            value={value}
            disabled={disabled}
            required={required}
            placeholder={customPlaceholder}
            onChange={(e) => onChange(e.target.value)}
            className={baseInputClasses}
          />
          {onSaveCheckedChange && saveLabel && (
            <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={Boolean(saveChecked)}
                onChange={(e) => onSaveCheckedChange(e.target.checked)}
                className="accent-[#4F46E5] w-4 h-4 rounded"
              />
              <span>{saveLabel}</span>
            </label>
          )}
        </div>
      )}

      {hintText && (
        <p id={`${id}-hint`} className="text-[11px] text-slate-500 dark:text-[#94A3B8]">
          {hintText}
        </p>
      )}
    </div>
  );
}
