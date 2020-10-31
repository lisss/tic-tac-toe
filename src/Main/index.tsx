import React, { useRef, useState } from 'react';
import { Select } from '../components/Select';
import { Game, GameMethods } from '../Game';
import { Player, GameMode } from '../types';
import './styles.css';
import { ReactComponent as Reset } from '../components/Icons/reset.svg';

export const Main = () => {
    const [player, setPlayer] = useState<Player>(Player.X);
    const [gameMode, setGameMode] = useState<GameMode>(GameMode.Single);
    const matrixRef = useRef<GameMethods>(null);

    return (
        <div className="main-wrapper">
            <div className="header">
                <div className="select-group">
                    <Select
                        value={gameMode}
                        options={Object.values(GameMode)}
                        onChange={x => setGameMode(x.currentTarget.value as GameMode)}
                    />
                    <Select
                        value={player}
                        options={Object.values(Player)}
                        onChange={x => setPlayer(x.currentTarget.value as Player)}
                    />
                </div>
                <div className="reset">
                    <Reset
                        className="reset-btn"
                        width="2rem"
                        title="Reset"
                        onClick={() => matrixRef.current?.reset()}
                    />
                </div>
            </div>
            <Game {...{ player }} mode={gameMode} ref={matrixRef} />
        </div>
    );
};
