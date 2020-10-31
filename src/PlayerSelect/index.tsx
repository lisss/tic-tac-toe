import React from 'react';
import './styles.css';

export enum Player {
    'X' = 'X',
    'O' = 'O',
}

export const PlayerSelect = ({
    player,
    onSelectPlayer,
}: {
    player: Player;
    onSelectPlayer: (value: string) => void;
}) => {
    return (
        <div className="player-wrapper">
            <div className="label">Select a player</div>
            <select
                className="select"
                value={player}
                onChange={e => onSelectPlayer(e.currentTarget.value)}
            >
                {Object.keys(Player).map(x => (
                    <option key={x}>{x}</option>
                ))}
            </select>
        </div>
    );
};
