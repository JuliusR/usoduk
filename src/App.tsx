import React from "react";
import {
  Button,
  Container,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";

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
        color="primary"
      >
        {[...Array(9)].map((_, idx) => (
          <ToggleButton
            key={`digit_${idx + 1}`}
            value={idx + 1}
            sx={{ height: "7vmin", aspectRatio: 1 }}
          >
            {idx + 1}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
      <TableContainer>
        <Table
          size="small"
          sx={{
            maxWidth: "90vmin",
            borderCollapse: "collapse",
            "& td": { border: "1px solid gray", padding: 0 },
            "& tbody": { border: "3px solid black" },
            "& colgroup": { border: "3px solid black" },
            "& td > button": {
              aspectRatio: 1,
              width: "100%",
            },
          }}
        >
          {[...Array(3)].map((_, rowIdx) => (
            <colgroup>
              <col span={3} />
            </colgroup>
          ))}
          {[...Array(3)].map((_, rowGroupIdx) => (
            <TableBody key={`rowGroup_${rowGroupIdx}`}>
              {[...Array(3)].map((_, rowIdx) => (
                <TableRow key={`row_${rowIdx}`}>
                  {[...Array(9)].map((_, colIdx) => (
                    <TableCell key={`col_${colIdx}`}>
                      <Button size="small"></Button>
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          ))}
        </Table>
      </TableContainer>
    </Container>
  );
};
