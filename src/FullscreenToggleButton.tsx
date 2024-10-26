import React from "react";
import { Button } from "@mui/material";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import FullscreenExitIcon from "@mui/icons-material/FullscreenExit";
import { useIsFullscreen } from "./useIsFullscreen";

export const FullscreenToggleButton: React.FC = (props) => {
  const handle = React.useMemo(
    () => ({
      enterFullscreen: (e: React.BaseSyntheticEvent) => {
        e.stopPropagation();
        e.preventDefault();
        document.documentElement.requestFullscreen();
      },
      exitFullscreen: (e: React.BaseSyntheticEvent) => {
        e.stopPropagation();
        e.preventDefault();
        document.exitFullscreen();
      },
    }),
    [],
  );

  const isFullscreen = useIsFullscreen();

  return (
    <Button
      onClick={isFullscreen ? handle.exitFullscreen : handle.enterFullscreen}
      variant="outlined"
    >
      {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
    </Button>
  );
};
