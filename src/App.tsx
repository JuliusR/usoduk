import React from "react";
import { Container, ToggleButton, ToggleButtonGroup } from "@mui/material";

type ActiveDigit = null | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export const App: React.FC = () => {
  const [activeDigit, setActiveDigit] = React.useState<ActiveDigit>(null);

  const handleActiveDigitChange = React.useCallback(
    (e: React.BaseSyntheticEvent, digit: ActiveDigit) => {
      e.stopPropagation();
      e.preventDefault();
      setActiveDigit(digit);
    },
    [setActiveDigit],
  );

  return (
    <Container>
      <ToggleButtonGroup
        exclusive
        value={activeDigit}
        onChange={handleActiveDigitChange}
        size="large"
        color="primary"
      >
        {[...Array(9)].map((_, idx) => (
          <ToggleButton key={`digit_${idx + 1}`} value={idx + 1}>
            {idx + 1}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    </Container>
  );
};
