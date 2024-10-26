import React from "react";

export function useIsFullscreen() {
  const [isFullscreen, setIsFullscreen] = React.useState(false);

  React.useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    document.addEventListener("fullscreenchange", onFullscreenChange);

    return () =>
      document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, [setIsFullscreen]);

  return isFullscreen;
}
