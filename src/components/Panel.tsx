import type { ReactNode } from "react";
import { Box, Stack } from "@chakra-ui/react";

export const baseZIndex = 1000;

type UIPanelProps = {
  children: ReactNode[];
};

export default function UIPanel({ children }: UIPanelProps) {
  return (
    <Box
      background="lightgray"
      width="300px"
      padding="4"
      margin="2"
      color="black"
      position="absolute"
      top="0"
      right="0"
      zIndex={baseZIndex}
    >
      <Stack gap="4" align="flex-start">
        {children}
      </Stack>
    </Box>
  );
}
