import { Heading, Stack, Text } from "@chakra-ui/react";
import type { Attributes } from "zarrita";
interface Info extends Attributes {
  title?: string;
  summary?: string;
  acknowledgment?: string;
}

type DescriptionProps = {
  info: Info;
};

export default function Description({ info }: DescriptionProps) {
  return (
    <Stack gap="2" align="flex-start">
      <Heading as="h1" size="lg">
        WOZ Viewer
      </Heading>
      <Heading as="h2" size="sm">
        {info.title}
      </Heading>
      <Text textStyle="sm"> {info.summary} </Text>
      <Text textStyle="sm">
        {info.acknowledgment?.split(":")[1] || info.acknowledgment}
      </Text>
    </Stack>
  );
}
