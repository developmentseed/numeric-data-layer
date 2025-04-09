import { Heading, Stack, Text } from "@chakra-ui/react";
export default function Description({ info }) {
  return (
    <Stack gap="2" align="flex-start">
      <Heading as="h1" size="lg">
        WOZ Viewer
      </Heading>
      <Heading as="h2" size="sm">
        {info.title}
      </Heading>
      <Text textStyle="sm"> {info.summary} </Text>
      <Text textStyle="sm"> {info.acknowledgment.split(":")[1]} </Text>
    </Stack>
  );
}
