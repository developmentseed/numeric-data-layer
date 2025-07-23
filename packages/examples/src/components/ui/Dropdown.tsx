import { useState } from "react";
import { Portal, Select, createListCollection } from "@chakra-ui/react";

import { baseZIndex } from "../Panel";

export type Option<T = string | number> = {
  value: T;
  label: string;
};

interface DropdownProps<T = string | number> {
  label?: string;
  onChange: (value: T) => void;
  options?: Option<T>[];
  defaultValue?: T;
}

const colormapOptions: Option<string>[] = [
  { label: "VIRIDIS", value: "viridis" },
  { label: "CIVIDIS", value: "cividis" },
];

const Dropdown = <T extends string | number = string>({
  onChange,
  label = "Select colormap",
  options = colormapOptions as Option<T>[],
  defaultValue,
}: DropdownProps<T>) => {
  // Convert the value to string for Chakra UI Select
  const defaultStringValue =
    defaultValue?.toString() ?? options[0]?.value?.toString() ?? "";
  const [selected, setSelected] = useState<string>(defaultStringValue);

  // Create a map to convert string back to original type
  const valueMap = new Map<string, T>();
  options.forEach((option) => {
    valueMap.set(option.value.toString(), option.value);
  });

  const colorMaps = createListCollection({
    items: options.map((option) => ({
      label: option.label,
      value: option.value.toString(), // Convert to string for Chakra UI
    })),
  });

  const handleChange = (
    event: any
  ) => {
    const stringValue = event.value[0];
    setSelected(stringValue);

    // Convert back to original type using our map
    const originalValue = valueMap.get(stringValue);
    if (originalValue !== undefined && onChange) {
      onChange(originalValue);
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
      <Select.Label>{label}</Select.Label>
      <Select.Control>
        <Select.Trigger>
          <Select.ValueText />
        </Select.Trigger>
        <Select.IndicatorGroup>
          <Select.Indicator />
        </Select.IndicatorGroup>
      </Select.Control>
      <Portal>
        <Select.Positioner>
          <Select.Content>
            {colorMaps.items.map((colormap) => (
              // @ts-expect-error select.item doesn't have children as prop type?!
              <Select.Item item={colormap} key={colormap.label}>
                <span>{colormap.label}</span>
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
