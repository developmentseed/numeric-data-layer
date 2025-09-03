import { Slider } from "@chakra-ui/react";
import type { SliderUIProps } from "./Slider";

type RangeSliderUIProps = Omit<
  SliderUIProps,
  "onValueChange" | "currentValue"
> & {
  onValueChange: (param: { min: number; max: number }) => void;
};

export default function RangeSliderUI({
  minMax,
  step = 20,
  label,
  onValueChange,
}: RangeSliderUIProps) {
  const oneStep = (minMax[1] - minMax[0]) / step;

  const handleChange = (detail: any) => {
    onValueChange({
      min: detail.value[0],
      max: detail.value[1],
    });
  };
  return (
    <Slider.Root
      maxW="100%"
      width="100%"
      defaultValue={minMax}
      max={minMax[1]}
      min={minMax[0]}
      minStepsBetweenThumbs={oneStep}
      onValueChangeEnd={handleChange}
    >
      <Slider.Label> {label} </Slider.Label>
      <Slider.Control>
        <Slider.Track>
          <Slider.Range />
        </Slider.Track>
        <Slider.Thumbs />
      </Slider.Control>
      <Slider.ValueText />
    </Slider.Root>
  );
}
