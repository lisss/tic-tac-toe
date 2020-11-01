import React, { useCallback, useEffect, useImperativeHandle, useState } from 'react';
import cloneDeep from 'lodash/cloneDeep';
import { Player, GameMode } from '../types';
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
    mode: GameMode;
    filledCells: Point[];
    availableCells: Point[];
    isComputerTurn: boolean;
    lastMultiplayerTurn: Player | null;
    result: 'win' | 'loss' | 'draw' | 'need_change' | null;
}

interface GameProps {
    mode: GameMode;
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
    mode: GameMode.Single,
    filledCells: [],
    availableCells: matrix.flat().map(x => x.coords),
    isComputerTurn: false,
    lastMultiplayerTurn: null,
    result: null,
};

export const GameComponent = ({
    mode,
    player,
    forwardedRef,
}: GameProps & { forwardedRef: React.Ref<GameMethods> }) => {
    const initialState = cloneDeep(baseState);
    const [gameState, setGameState] = useState<State>(initialState);

    const getAvailableCells = useCallback(
        (coord: Point) => {
            return gameState.availableCells.filter(x => !(x.x === coord.x && x.y === coord.y));
        },
        [gameState],
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
                setGameState({
                    ...gameState,
                    filledCells: filled,
                    result,
                    isComputerTurn: false,
                });
            }
        },
        [gameState, player],
    );

    useEffect(() => {
        // We changed the player, so enabling the game
        if (mode === GameMode.Multiple && player !== gameState.lastMultiplayerTurn) {
            setGameState({
                ...gameState,
                lastMultiplayerTurn: player,
                result: null,
            });
        }
        if (mode === GameMode.Single && gameState.isComputerTurn) {
            const { availableCells } = gameState;
            const timer = setTimeout(() => {
                const { x, y } = availableCells[Math.floor(Math.random() * availableCells.length)];
                const copy = [...gameState.matrix];
                const value = player === Player.O ? Player.X : Player.O;
                copy[x][y].value = value;
                setGameState({
                    ...gameState,
                    matrix: copy,
                    availableCells: getAvailableCells({ x, y }),
                    isComputerTurn: false,
                });
                checkIsSuccess({ coords: { x, y }, value });
            }, 300);

            return () => clearTimeout(timer);
        }
    }, [gameState, mode, player, getAvailableCells, checkIsSuccess]);

    useImperativeHandle(
        forwardedRef,
        () => {
            return {
                reset: () => setGameState(initialState),
            };
        },
        [initialState],
    );

    const onClick = useCallback(
        (cellItem: CellItem) => {
            const { x, y } = cellItem.coords;
            const copy = [...gameState.matrix];
            if (!copy[x][y].value) {
                copy[x][y].value = player;
                const isLastCell = gameState.availableCells.length === 1;
                const result = isLastCell
                    ? 'draw'
                    : mode === GameMode.Multiple && gameState.lastMultiplayerTurn === player
                    ? 'need_change'
                    : null;

                setGameState({
                    ...gameState,
                    matrix: copy,
                    availableCells: getAvailableCells({ x, y }),
                    isComputerTurn: !isLastCell,
                    result,
                });
                checkIsSuccess(cellItem);
            }
        },
        [gameState, mode, player, getAvailableCells, checkIsSuccess],
    );

    const { filledCells, result } = gameState;
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
                          resultMessage: "Sorry, you've lost :(",
                          resultClass: 'result-loss',
                      };
                  case 'draw':
                      return { resultMessage: 'Draw ¯\\_(ツ)_/¯', resultClass: 'result-draw' };
                  case 'need_change':
                      return {
                          resultMessage: 'Please chose another player',
                          resultClass: 'result-draw',
                      };
              }
          })()
        : { resultMessage: null, resultClass: undefined };

    return (
        <div className="game-wrapper">
            <div className={`matrix ${result ? 'disabled' : ''}`}>
                {gameState.matrix.map((row, i) => (
                    <div className="matrix-row" key={i}>
                        {row.map(cell => (
                            <div
                                className={`matrix-cell ${
                                    filledCells.some(x => x === cell.coords)
                                        ? resultClass
                                        : result === 'draw'
                                        ? 'result-draw'
                                        : ''
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
