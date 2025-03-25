import { useState, ChangeEvent } from "react";

interface Option {
  value: string;
  label: string;
}

interface DropdownProps {
  onChange: (colormapName: string) => void;
  options?: Option[];
  defaultValue?: string;
}

const colormaps = [
  {
    value: "viridis",
    label: "Viridis",
  },
  {
    value: "cividis",
    label: "Cividis",
  },
];

const Dropdown = ({
  onChange,
  options = colormaps,
  defaultValue = "viridis",
}: DropdownProps) => {
  const [selected, setSelected] = useState(defaultValue);

  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const newValue = event.target.value;
    setSelected(newValue);

    if (onChange) {
      onChange(newValue);
    }
  };

  return (
    <div style={{ position: "absolute", top: "0", right: "0", zIndex: 100000 }}>
      <select value={selected} onChange={handleChange}>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default Dropdown;
