import { Slider } from "@chakra-ui/react";

type RangeSliderUIProps = {
  minMax: [number, number];
  onValueChange: (param: { min: number; max: number }) => void;
};

export default function RangeSliderUI({
  minMax,
  onValueChange,
}: RangeSliderUIProps) {
  const step = (minMax[1] - minMax[0]) / 20;

  const handleChange = (detail: Slider.ValueChangeDetails) => {
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
      minStepsBetweenThumbs={step}
      onValueChangeEnd={handleChange}
    >
      <Slider.Label> Scale </Slider.Label>
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
