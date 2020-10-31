import React, { useCallback, useEffect, useImperativeHandle, useState } from 'react';
import { Player } from '../PlayerSelect';
import cloneDeep from 'lodash/cloneDeep';
import './styles.css';

const DIMENSION = 3;

export interface GameMethods {
    reset: () => void;
}

interface Point {
    x: number;
    y: number;
}

interface CellItem {
    coords: Point;
    value: Player | null;
}

type Matrix = CellItem[][];

interface State {
    matrix: Matrix;
    isComputerTurn: boolean;
    result: 'win' | 'loss' | 'draw' | null;
}

interface GameProps {
    player: Player;
}

const matrix: Matrix = Array.from({
    length: DIMENSION,
}).map((_, i) =>
    Array.from({ length: DIMENSION }).map<CellItem>((_, j) => ({
        coords: {
            x: i,
            y: j,
        },
        value: null,
    })),
);

const baseState: State = {
    matrix,
    isComputerTurn: false,
    result: null,
};

export const GameComponent = ({
    player,
    forwardedRef,
}: GameProps & { forwardedRef: React.Ref<GameMethods> }) => {
    const initialState = cloneDeep(baseState);
    const [gameState, setGameState] = useState<State>(initialState);
    const [filledCells, setFilledCells] = useState<Point[]>([]);

    const availableCellsInit = gameState.matrix.flat().map(x => x.coords);

    const [availableCells, setAvailableCells] = useState(availableCellsInit);

    const updateAvailableCells = useCallback(
        (coord: Point) => {
            const newCells = availableCells.filter(x => !(x.x === coord.x && x.y === coord.y));
            setAvailableCells(newCells);
        },
        [availableCells],
    );

    const checkIsSuccess = useCallback(
        (cellItem: CellItem) => {
            const { x, y } = cellItem.coords;

            const getFilledCells = (cells: CellItem[]) =>
                cells.filter(x => x.value === cellItem.value).map(x => x.coords);

            const filled = (() => {
                const filledRow = getFilledCells(gameState.matrix[x]);
                if (filledRow.length === DIMENSION) {
                    return filledRow;
                }

                const filledColumn = getFilledCells(gameState.matrix.map(x => x[y]));
                if (filledColumn.length === DIMENSION) {
                    return filledColumn;
                }

                const filledDiagTopLeft = getFilledCells(gameState.matrix.map((x, i) => x[i]));
                if (filledDiagTopLeft.length === DIMENSION) {
                    return filledDiagTopLeft;
                }

                const filledDiagTopRight = getFilledCells(
                    gameState.matrix.map((x, i) => x[x.length - 1 - i]),
                );
                if (filledDiagTopRight.length === DIMENSION) {
                    return filledDiagTopRight;
                }
            })();

            if (filled) {
                const result = cellItem.value === player ? 'win' : 'loss';
                setFilledCells(filled);
                setGameState({
                    ...gameState,
                    result,
                    isComputerTurn: false,
                });
            }
        },
        [gameState, player],
    );

    useEffect(() => {
        if (gameState.isComputerTurn) {
            const timer = setTimeout(() => {
                const { x, y } = availableCells[Math.floor(Math.random() * availableCells.length)];
                const copy = [...gameState.matrix];
                const value = player === Player.O ? Player.X : Player.O;
                copy[x][y].value = value;
                updateAvailableCells({ x, y });
                setGameState({
                    ...gameState,
                    matrix: copy,
                    isComputerTurn: false,
                });
                checkIsSuccess({ coords: { x, y }, value });
            }, 300);

            return () => clearTimeout(timer);
        }
    }, [availableCells, gameState, player, updateAvailableCells, checkIsSuccess]);

    useImperativeHandle(
        forwardedRef,
        () => {
            return {
                reset: () => {
                    setGameState(initialState);
                    setAvailableCells(availableCellsInit);
                },
            };
        },
        [initialState, availableCellsInit],
    );

    const onClick = useCallback(
        (cellItem: CellItem) => {
            const { x, y } = cellItem.coords;
            const copy = [...gameState.matrix];
            if (!copy[x][y].value) {
                copy[x][y].value = player;
                const isLastCell = availableCells.length === 1;
                setGameState({
                    ...gameState,
                    matrix: copy,
                    isComputerTurn: !isLastCell,
                    result: isLastCell ? 'draw' : null,
                });
                updateAvailableCells({ x, y });
                checkIsSuccess(cellItem);
            }
        },
        [gameState, player, availableCells, updateAvailableCells, checkIsSuccess],
    );

    const { result } = gameState;
    const { resultMessage, resultClass } = result
        ? (() => {
              switch (result) {
                  case 'win':
                      return {
                          resultMessage: 'Congrats! You won!',
                          resultClass: 'result-win',
                      };
                  case 'loss':
                      return {
                          resultMessage: "Sorry, you've lost",
                          resultClass: 'result-loss',
                      };
                  case 'draw':
                      return { resultMessage: 'Draw', resultClass: 'result-draw' };
              }
          })()
        : { resultMessage: null, resultClass: undefined };

    return (
        <div className="game-wrapper">
            <div className={`matrix ${result ? 'matrix-disabled' : ''}`}>
                {gameState.matrix.map((row, i) => (
                    <div className="matrix-row" key={i}>
                        {row.map(cell => (
                            <div
                                className={`matrix-cell ${
                                    filledCells.some(x => x === cell.coords)
                                        ? resultClass
                                        : undefined
                                }`}
                                key={cell.coords.y}
                                id={`cell_${cell.coords.x}_${cell.coords.y}`}
                                onClick={() => onClick(cell)}
                            >
                                {cell.value}
                            </div>
                        ))}
                    </div>
                ))}
            </div>
            {resultMessage && (
                <div className={`result-message ${resultClass}`}>{resultMessage}</div>
            )}
        </div>
    );
};

export const Game = React.forwardRef((props: GameProps, ref: React.Ref<GameMethods>) => (
    <GameComponent {...props} forwardedRef={ref} />
));
