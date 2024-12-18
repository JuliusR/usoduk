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
import RedoIcon from "@mui/icons-material/Redo";
import SaveIcon from "@mui/icons-material/Save";
import SaveAsIcon from "@mui/icons-material/SaveAs";
import UndoIcon from "@mui/icons-material/Undo";
import { FullscreenToggleButton } from "./FullscreenToggleButton";
import { usePersistentReducer } from "./usePersistentReducer";
import { neverIdentity } from "./neverIdentity";
import {
  History,
  newHistory,
  advanceHistory,
  redoHistory,
  undoHistory,
} from "./history";

type Digit = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

type RepNine<T> = [T, T, T, T, T, T, T, T, T];

type BoardRow = RepNine<number>;

function testMarker(value: number, digit: Digit): boolean {
  return !!(value & (8 << digit));
}

function addMarker(value: number, digit: Digit): number {
  return value | (8 << digit);
}

function clearMarker(value: number, digit: Digit): number {
  return value & ~(8 << digit);
}

function flipMarker(value: number, digit: Digit): number {
  return value ^ (8 << digit);
}

function setMarker(value: number, digit: Digit, nextState: boolean): number {
  return nextState ? addMarker(value, digit) : clearMarker(value, digit);
}

function getMarkerBits(value: number): number {
  const markerMask = (1 << 9) - 1;
  return (value >>> 4) & markerMask;
}

function getDigit(value: number): null | Digit {
  const digit = value & 15;
  return digit >= 1 && digit <= 9 ? (digit as Digit) : null;
}

function setDigit(value: number, digit: null | Digit): number {
  value &= ~15;
  if (digit === null) return value;
  value |= digit;
  return value;
}

function tweakRow(
  prevRow: BoardRow,
  colIdx: number,
  nextValue: number,
): BoardRow {
  return prevRow.map((val, i) => (i !== colIdx ? val : nextValue)) as BoardRow;
}

type Board = RepNine<BoardRow>;

type Game = {
  board: History<Board>;
};

const newBoardRow = () => [...Array(9)].map((_) => 0) as BoardRow;

const newBoard = () => [...Array(9)].map((_) => newBoardRow()) as Board;

const newGame = (): Game => ({
  board: newHistory(newBoard()),
});

type BoardCellDigitToggleAction = {
  type: "digit_toggle";
  rowIdx: number;
  colIdx: number;
  activeDigit: Digit;
  isCommiting: boolean;
};

type BoardRedoAction = {
  type: "redo";
};

type BoardResetAction = {
  type: "reset";
};

type BoardUndoAction = {
  type: "undo";
};

type BoardAction =
  | BoardCellDigitToggleAction
  | BoardRedoAction
  | BoardResetAction
  | BoardUndoAction;

function reduceDigitToggle(
  prev: Game,
  action: BoardCellDigitToggleAction,
): Game {
  const prevRow = prev.board.present[action.rowIdx];
  const prevValue = prevRow[action.colIdx];
  const nextValue = (() => {
    if (!action.isCommiting) return flipMarker(prevValue, action.activeDigit);
    return action.activeDigit === getDigit(prevValue)
      ? setDigit(prevValue, null)
      : setDigit(prevValue, action.activeDigit);
  })();
  const nextRow = tweakRow(prevRow, action.colIdx, nextValue);
  const board = prev.board.present.map((row, rowIdx) =>
    rowIdx !== action.rowIdx ? row : nextRow,
  ) as Board;
  return {
    board: advanceHistory(prev.board, board),
  };
}

function reduceRedo(prev: Game, action: BoardRedoAction): Game {
  return { board: redoHistory(prev.board) };
}

function reduceReset(prev: Game, action: BoardResetAction): Game {
  return {
    board: advanceHistory(prev.board, newBoard()),
  };
}

function reduceUndo(prev: Game, action: BoardUndoAction): Game {
  return { board: undoHistory(prev.board) };
}

function gameReducer(prev: Game, action: BoardAction): Game {
  switch (action.type) {
    case "digit_toggle":
      return reduceDigitToggle(prev, action);
    case "redo":
      return reduceRedo(prev, action);
    case "reset":
      return reduceReset(prev, action);
    case "undo":
      return reduceUndo(prev, action);
  }
  return neverIdentity(action);
}

export const App: React.FC = () => {
  const [activeDigit, setActiveDigit] = React.useState<null | Digit>(null);
  const [isCommiting, setIsCommiting] = React.useState<boolean>(true);

  const [game, dispatch] = usePersistentReducer("game2", gameReducer, newGame);

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

  const handleUndo = React.useCallback(
    (e: React.BaseSyntheticEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dispatch({ type: "undo" });
    },
    [dispatch],
  );

  const handleRedo = React.useCallback(
    (e: React.BaseSyntheticEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dispatch({ type: "redo" });
    },
    [dispatch],
  );

  const handleIsCommitingChange = React.useCallback(
    (e: React.BaseSyntheticEvent, value: boolean) => {
      e.stopPropagation();
      e.preventDefault();
      setIsCommiting(value);
    },
    [setIsCommiting],
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
          <Button
            disabled={!game.board.past.length}
            onClick={handleUndo}
            variant="outlined"
          >
            <UndoIcon />
          </Button>
          <Button
            disabled={!game.board.future.length}
            onClick={handleRedo}
            variant="outlined"
          >
            <RedoIcon />
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
                    boardRow={game.board.present[rowGroupIdx * 3 + subRowIdx]}
                    dispatch={dispatch}
                    activeDigit={activeDigit}
                    isCommiting={isCommiting}
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
              onChange={handleActiveDigitChange}
              sx={{ width: "20%", aspectRatio: 1 }}
              color="primary"
            >
              {idx + 1}
            </ToggleButton>
          ))}
          <ToggleButton
            value={!isCommiting}
            selected={!isCommiting}
            onChange={handleIsCommitingChange}
            sx={{ width: "20%", aspectRatio: 1 }}
            color="primary"
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
  boardRow: BoardRow;
  dispatch: React.Dispatch<BoardAction>;
  activeDigit: null | Digit;
  isCommiting: boolean;
}> = (props) => {
  const { rowIdx, boardRow, dispatch, activeDigit, isCommiting } = props;

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
            isCommiting={isCommiting}
          ></BoardButton>
        </TableCell>
      ))}
    </TableRow>
  );
};

const BoardButton: React.FC<{
  rowIdx: number;
  colIdx: number;
  value: number;
  dispatch: React.Dispatch<BoardAction>;
  activeDigit: null | Digit;
  isCommiting: boolean;
}> = (props) => {
  const { rowIdx, colIdx, value, dispatch, activeDigit, isCommiting } = props;

  const digit = getDigit(value);

  const handleClick = React.useCallback(
    (e: React.BaseSyntheticEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (activeDigit === null) return;
      dispatch({
        type: "digit_toggle",
        rowIdx,
        colIdx,
        activeDigit,
        isCommiting,
      });
    },
    [dispatch, rowIdx, colIdx, activeDigit, isCommiting],
  );

  const variant = digit === activeDigit ? "contained" : "text";

  return (
    <Button
      onClick={handleClick}
      disabled={activeDigit === null}
      variant={variant}
      sx={{ minWidth: "1em", padding: 0 }}
    >
      {digit ?? <MarkerText markerBits={getMarkerBits(value)} />}
    </Button>
  );
};

const MarkerText: React.FC<{
  markerBits: number;
}> = (props) => {
  const { markerBits } = props;

  return (
    <pre style={{ lineHeight: "1em" }}>
      {(markerBits | (1 << 9))
        .toString(2)
        .slice(1)
        .split("")
        .reverse()
        .map((c, i) => (c === "0" ? " " : i + 1))
        .join("")
        .match(/[ 1-9]{3}/g)
        ?.join("\n")}
    </pre>
  );
};
