import { useState } from "react";
import { Portal, Select, createListCollection } from "@chakra-ui/react";

import { baseZIndex } from "../Panel";

type Option = {
  value: string;
  label: string;
};

interface DropdownProps {
  onChange: (colormapName: string) => void;
  options?: Option[];
  defaultValue?: string;
}

const colormapOptions = [
  { label: "VIRIDIS", value: "viridis" },
  { label: "CIVIDIS", value: "cividis" },
];

const Dropdown = ({
  onChange,
  options = colormapOptions,
  defaultValue = "viridis",
}: DropdownProps) => {
  const [selected, setSelected] = useState(defaultValue);

  const colorMaps = createListCollection({
    items: options,
  });

  const handleChange = (event: Select.ValueChangeDetails<Option>) => {
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
      onValueChange={handleChange}
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
          <Select.Content color="black">
            {colorMaps.items.map((colormap) => (
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
