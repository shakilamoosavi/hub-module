import React from "react";

const SIZE_STYLES = {
  sm: {
    track: "w-10 h-5",
    thumb: "w-4 h-4 left-0.5 top-0.5",
    translate: "peer-checked:translate-x-[22px]",
  },
  md: {
    track: "w-12 h-6",
    thumb: "w-5 h-5 left-0.5 top-0.5",
    translate: "peer-checked:translate-x-[24px]",
  },
} as const;

export type ToggleSize = keyof typeof SIZE_STYLES;

type ToggleProps = {
  label?: React.ReactNode;
  description?: React.ReactNode;
  name?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  size?: ToggleSize;
  className?: string;
};

export default function Toggle({
  label,
  description,
  name,
  checked,
  onChange,
  disabled = false,
  size = "md",
  className = "",
}: ToggleProps) {
  const inputId = React.useId();
  const descriptionId = description ? `${inputId}-description` : undefined;
  const sizeConfig = SIZE_STYLES[size];

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) {
      return;
    }

    onChange(event.target.checked);
  };

  return (
    <label
      htmlFor={inputId}
      className={`flex items-center gap-3 ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"} ${className}`}
    >
      <span className="relative inline-flex items-center">
        <input
          id={inputId}
          type="checkbox"
          name={name}
          className="peer sr-only"
          checked={checked}
          onChange={handleChange}
          disabled={disabled}
          aria-checked={checked}
          aria-describedby={descriptionId}
        />
        <span
          className={`block rounded-full bg-gray-300 transition-colors duration-200 peer-checked:bg-blue-600 peer-disabled:bg-gray-200 ${sizeConfig.track}`}
          aria-hidden="true"
        ></span>
        <span
          className={`absolute rounded-full bg-white shadow-sm transition-transform duration-200 ${sizeConfig.thumb} ${sizeConfig.translate}`}
          aria-hidden="true"
        ></span>
      </span>
      {(label || description) && (
        <span className="flex flex-col select-none">
          {label && <span className="text-sm font-medium text-gray-900">{label}</span>}
          {description && (
            <span id={descriptionId} className="text-xs text-gray-500">
              {description}
            </span>
          )}
        </span>
      )}
    </label>
  );
}
