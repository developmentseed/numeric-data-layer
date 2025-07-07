import { Slider } from "@chakra-ui/react";

export type SliderUIProps = {
  minMax: [number, number];
  step?: number;
  label?: string;
  currentValue: number;
  onValueChange: (param: number) => void;
};

export default function SingleSlider({
  minMax,
  step,
  label,
  currentValue,
  onValueChange,
}: SliderUIProps) {
  const handleChange = (detail: Slider.ValueChangeDetails) => {
    onValueChange(detail.value[0]);
  };
  return (
    <Slider.Root
      defaultValue={[minMax[0]]}
      min={minMax[0]}
      max={minMax[1]}
      value={[currentValue]}
      maxW="100%"
      width="100%"
      step={step}
      onValueChange={handleChange}
    >
      <Slider.Label> {label} </Slider.Label>
      <Slider.Control>
        <Slider.Track>
          <Slider.Range />
        </Slider.Track>
        <Slider.Thumb index={0} boxSize={6} shadow="md"></Slider.Thumb>
        <Slider.Marks
          marks={new Array(minMax[1] - minMax[0] + 1)
            .fill(0)
            .map((_e, idx) => idx)}
        />
      </Slider.Control>
    </Slider.Root>
  );
}
