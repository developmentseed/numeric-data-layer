import { Button } from "@chakra-ui/react";

type PlayButtonProps = {
  onPlay: boolean;
  onClick: () => void;
};

export default function PlayButton({ onPlay, onClick }: PlayButtonProps) {
  return <Button onClick={onClick}>{onPlay ? "Pause" : "Play"}</Button>;
}
