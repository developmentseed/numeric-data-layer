import { Button } from "@chakra-ui/react";

export default function PlayButton({ onPlay, onClick }) {
  return <Button onClick={onClick}>{onPlay ? "Pause" : "Play"}</Button>;
}
