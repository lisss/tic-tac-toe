import React, { useRef, useState } from 'react';
import { Select } from '../Select';
import { Game, GameMethods } from '../Game';
import { Player, GameMode } from '../../types';
import './styles.css';
import { ReactComponent as Reset } from '../Icons/reset.svg';
import { ReactComponent as Logo } from '../Icons/logo.svg';

export const Main = () => {
    const [player, setPlayer] = useState<Player>(Player.X);
    const [gameMode, setGameMode] = useState<GameMode>(GameMode.Single);
    const matrixRef = useRef<GameMethods>(null);

    return (
        <div className="main-wrapper">
            <div className="header">
                <Logo className="logo" />
                <div className="header-inner">
                    <div className="select-group">
                        <Select
                            value={gameMode}
                            options={Object.values(GameMode)}
                            onChange={x => {
                                setGameMode(x.currentTarget.value as GameMode);
                                matrixRef.current?.reset();
                            }}
                        />
                        <Select
                            value={player}
                            options={Object.values(Player)}
                            onChange={x => setPlayer(x.currentTarget.value as Player)}
                        />
                    </div>
                    <Reset
                        className="reset-btn"
                        title="Reset"
                        onClick={() => matrixRef.current?.reset()}
                    />
                </div>
            </div>
            <Game {...{ player }} mode={gameMode} ref={matrixRef} />
        </div>
    );
};
