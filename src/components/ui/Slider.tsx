import { Slider } from "@chakra-ui/react";

export type SliderUIProps = {
  minMax: [number, number];
  step?: number;
  label?: string;
  onValueChange: (param: number) => void;
};

export default function SingleSlider({
  minMax,
  step,
  label,
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
        <Slider.Marks marks={[0, 1, 2]} />
      </Slider.Control>
    </Slider.Root>
  );
}
