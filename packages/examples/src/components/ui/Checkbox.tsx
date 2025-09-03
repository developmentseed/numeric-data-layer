import { Checkbox, useCheckbox } from "@chakra-ui/react";

type CheckBoxUIProps = {
  onCheckedChange: (param: boolean) => void;
};

export default function CheckBoxUI({ onCheckedChange }: CheckBoxUIProps) {
  const checkbox = useCheckbox();
  const handleChange = (event: any) => {
    onCheckedChange(!!event.checked);
  };

  return (
    <Checkbox.RootProvider value={checkbox}>
      <Checkbox.Root onCheckedChange={handleChange} defaultChecked>
        <Checkbox.HiddenInput />
        <Checkbox.Control />
        <Checkbox.Label>Show values on hover</Checkbox.Label>
      </Checkbox.Root>
    </Checkbox.RootProvider>
  );
}
