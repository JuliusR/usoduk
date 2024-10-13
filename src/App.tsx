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

type Digit = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

type RepNine<T> = [T, T, T, T, T, T, T, T, T];

type BoardRow = RepNine<null | Digit>;

type Board = RepNine<BoardRow>;

const newBoardRow = () => [...Array(9)].map((_) => null) as BoardRow;

const newBoard = () => [...Array(9)].map((_) => newBoardRow()) as Board;

export const App: React.FC = () => {
  const [activeDigit, setActiveDigit] = React.useState<null | Digit>(null);

  const [board, setBoard] = React.useState<Board>(newBoard);

  const handleActiveDigitChange = React.useCallback(
    (e: React.BaseSyntheticEvent, digit: null | Digit) => {
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
                  setBoard={setBoard}
                  activeDigit={activeDigit}
                ></BoardTableRow>
              ))}
            </TableBody>
          ))}
        </Table>
      </TableContainer>
    </Container>
  );
};

const BoardTableRow: React.FC<{
  rowIdx: number;
  boardRow: RepNine<null | Digit>;
  setBoard: React.Dispatch<React.SetStateAction<Board>>;
  activeDigit: null | Digit;
}> = (props) => {
  const { rowIdx, boardRow, setBoard, activeDigit } = props;

  const setBoardRow = React.useCallback(
    (action: React.SetStateAction<BoardRow>) => {
      setBoard((prevBoard) => {
        const prevBoardRow = prevBoard[rowIdx];
        const nextBoardRow =
          action instanceof Function ? action(prevBoardRow) : action;
        if (nextBoardRow === prevBoardRow) return prevBoard;
        return prevBoard.map((row, idx) =>
          idx !== rowIdx ? row : nextBoardRow,
        ) as Board;
      });
    },
    [rowIdx, setBoard],
  );

  return (
    <TableRow>
      {[...Array(9)].map((_, colIdx) => (
        <TableCell key={`col_${colIdx}`}>
          <BoardButton
            rowIdx={rowIdx}
            colIdx={colIdx}
            value={boardRow[colIdx]}
            setBoardRow={setBoardRow}
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
  setBoardRow: React.Dispatch<React.SetStateAction<BoardRow>>;
  activeDigit: null | Digit;
}> = (props) => {
  const { colIdx, value, setBoardRow, activeDigit } = props;

  const setValue = React.useCallback(
    (action: React.SetStateAction<null | Digit>) => {
      setBoardRow((prevBoardRow) => {
        const prevValue = prevBoardRow[colIdx];
        const nextValue =
          action instanceof Function ? action(prevValue) : action;
        if (nextValue === prevValue) return prevBoardRow;
        return prevBoardRow.map((val, idx) =>
          idx !== colIdx ? val : nextValue,
        ) as BoardRow;
      });
    },
    [colIdx, setBoardRow],
  );

  const handleClick = React.useCallback(
    (e: React.BaseSyntheticEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setValue((prevValue) => (prevValue === activeDigit ? null : activeDigit));
    },
    [setValue, activeDigit],
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
