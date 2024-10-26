import React from "react";
import {
  Button,
  Container,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  ToggleButton,
} from "@mui/material";
import NewIcon from "@mui/icons-material/AddCircleOutline";
import AppRegistrationIcon from "@mui/icons-material/AppRegistration";
import SaveIcon from "@mui/icons-material/Save";
import SaveAsIcon from "@mui/icons-material/SaveAs";
import { FullscreenToggleButton } from "./FullscreenToggleButton";
import { usePersistentReducer } from "./usePersistentReducer";
import { neverIdentity } from "./neverIdentity";

type Digit = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

type RepNine<T> = [T, T, T, T, T, T, T, T, T];

type BoardRow = RepNine<null | Digit>;

type Board = RepNine<BoardRow>;

const newBoardRow = () => [...Array(9)].map((_) => null) as BoardRow;

const newBoard = () => [...Array(9)].map((_) => newBoardRow()) as Board;

type BoardCellDigitToggleAction = {
  type: "digit_toggle";
  rowIdx: number;
  colIdx: number;
  activeDigit: Digit;
};

type BoardResetAction = {
  type: "reset";
};

type BoardAction = BoardCellDigitToggleAction | BoardResetAction;

function boardReducer(prev: Board, action: BoardAction) {
  switch (action.type) {
    case "digit_toggle":
      const prevRow = prev[action.rowIdx];
      const prevDigit = prevRow[action.colIdx];
      const nextDigit =
        prevDigit === action.activeDigit ? null : action.activeDigit;
      const nextRow = prevRow.map((digit, colIdx) =>
        colIdx !== action.colIdx ? digit : nextDigit,
      );
      return prev.map((row, rowIdx) =>
        rowIdx !== action.rowIdx ? row : nextRow,
      ) as Board;
    case "reset":
      return newBoard();
  }
  return neverIdentity(action);
}

export const App: React.FC = () => {
  const [activeDigit, setActiveDigit] = React.useState<null | Digit>(null);

  const [board, dispatch] = usePersistentReducer(
    "board",
    boardReducer,
    newBoard,
  );

  const handleActiveDigitChange = React.useCallback(
    (e: React.BaseSyntheticEvent, digit: null | Digit) => {
      e.stopPropagation();
      e.preventDefault();
      setActiveDigit((prev) => {
        return digit === prev ? null : digit;
      });
    },
    [setActiveDigit],
  );

  const handleNew = React.useCallback(
    (e: React.BaseSyntheticEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dispatch({ type: "reset" });
    },
    [dispatch],
  );

  return (
    <Container
      sx={{
        aspectRatio: 0.7,
        width: "auto",
        maxHeight: "98vh",
      }}
    >
      <Stack spacing={1}>
        <Stack direction="row" sx={{ justifyContent: "space-between" }}>
          <Button onClick={handleNew} variant="outlined">
            <NewIcon />
          </Button>
          <Button disabled variant="outlined">
            <SaveIcon />
          </Button>
          <Button disabled variant="outlined">
            <SaveAsIcon />
          </Button>
          <FullscreenToggleButton />
        </Stack>
        <TableContainer>
          <Table
            size="small"
            sx={{
              maxWidth: "90vmin",
              borderCollapse: "collapse",
              "& td": { border: "1px solid gray", padding: "1px" },
              "& tbody": { border: "3px solid black" },
              "& colgroup": { border: "3px solid black" },
              "& td > button": {
                aspectRatio: 1,
                width: "100%",
              },
            }}
          >
            {[...Array(3)].map((_, colGroupIdx) => (
              <colgroup key={`colGroup_${colGroupIdx}`}>
                <col span={3} />
              </colgroup>
            ))}
            {[...Array(3)].map((_, rowGroupIdx) => (
              <TableBody key={`rowGroup_${rowGroupIdx}`}>
                {[...Array(3)].map((_, subRowIdx) => (
                  <BoardTableRow
                    key={`subRow_${subRowIdx}`}
                    rowIdx={rowGroupIdx * 3 + subRowIdx}
                    boardRow={board[rowGroupIdx * 3 + subRowIdx]}
                    dispatch={dispatch}
                    activeDigit={activeDigit}
                  ></BoardTableRow>
                ))}
              </TableBody>
            ))}
          </Table>
        </TableContainer>
        <Stack direction="row" sx={{ flexWrap: "wrap" }}>
          {[...Array(9)].map((_, idx) => (
            <ToggleButton
              key={`digit_${idx + 1}`}
              value={idx + 1}
              selected={activeDigit === idx + 1}
              sx={{ width: "20%", aspectRatio: 1 }}
              onChange={handleActiveDigitChange}
              color="primary"
            >
              {idx + 1}
            </ToggleButton>
          ))}
          <ToggleButton
            value={10}
            sx={{ width: "20%", aspectRatio: 1 }}
            color="primary"
            disabled
          >
            <AppRegistrationIcon />
          </ToggleButton>
        </Stack>
      </Stack>
    </Container>
  );
};

const BoardTableRow: React.FC<{
  rowIdx: number;
  boardRow: RepNine<null | Digit>;
  dispatch: React.Dispatch<BoardAction>;
  activeDigit: null | Digit;
}> = (props) => {
  const { rowIdx, boardRow, dispatch, activeDigit } = props;

  return (
    <TableRow>
      {[...Array(9)].map((_, colIdx) => (
        <TableCell key={`col_${colIdx}`}>
          <BoardButton
            rowIdx={rowIdx}
            colIdx={colIdx}
            value={boardRow[colIdx]}
            dispatch={dispatch}
            activeDigit={activeDigit}
          ></BoardButton>
        </TableCell>
      ))}
    </TableRow>
  );
};

const BoardButton: React.FC<{
  rowIdx: number;
  colIdx: number;
  value: null | Digit;
  dispatch: React.Dispatch<BoardAction>;
  activeDigit: null | Digit;
}> = (props) => {
  const { rowIdx, colIdx, value, dispatch, activeDigit } = props;

  const handleClick = React.useCallback(
    (e: React.BaseSyntheticEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (activeDigit === null) return;
      dispatch({ type: "digit_toggle", rowIdx, colIdx, activeDigit });
    },
    [dispatch, rowIdx, colIdx, activeDigit],
  );

  const variant = value === activeDigit ? "contained" : "text";

  return (
    <Button
      onClick={handleClick}
      disabled={activeDigit === null}
      variant={variant}
      sx={{ minWidth: "1em", padding: 0 }}
    >
      {value}
    </Button>
  );
};
