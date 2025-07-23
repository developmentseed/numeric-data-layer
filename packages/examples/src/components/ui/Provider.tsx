import { ChakraProvider, ChakraProviderProps } from "@chakra-ui/react";

export function Provider(props: ChakraProviderProps) {
  return <ChakraProvider value={props.value}>{props.children}</ChakraProvider>;
}
