import { useState, ChangeEvent } from "react";
import { Portal, Select, createListCollection } from "@chakra-ui/react";

import { baseZIndex } from "../Panel";

interface Option {
  value: string;
  label: string;
}

interface DropdownProps {
  onChange: (colormapName: string) => void;
  options?: Option[];
  defaultValue?: string;
}

const colorMaps = createListCollection({
  items: [
    { label: "VIRIDIS", value: "viridis", id: "viridis" },
    { label: "CIVIDIS", value: "cividis", id: "cividis" },
  ],
});

const Dropdown = ({
  onChange,
  options = colorMaps,
  defaultValue = "viridis",
}: DropdownProps) => {
  const [selected, setSelected] = useState(defaultValue);

  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const newValue = event.value;
    setSelected(newValue[0]);

    if (onChange) {
      onChange(newValue[0]);
    }
  };

  return (
    <Select.Root
      zIndex={baseZIndex}
      collection={colorMaps}
      width="100%"
      value={[selected]}
      onValueChange={(e) => handleChange(e)}
    >
      <Select.HiddenSelect />
      <Select.Label>Select colormap</Select.Label>
      <Select.Control>
        <Select.Trigger>
          <Select.ValueText placeholder="Select " />
        </Select.Trigger>
        <Select.IndicatorGroup>
          <Select.Indicator />
        </Select.IndicatorGroup>
      </Select.Control>
      <Portal>
        <Select.Positioner>
          <Select.Content>
            {options.items.map((colormap) => (
              <Select.Item item={colormap} key={colormap.value}>
                {colormap.label}
                <Select.ItemIndicator />
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Positioner>
      </Portal>
    </Select.Root>
  );
};

export default Dropdown;
