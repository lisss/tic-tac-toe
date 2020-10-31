import React, { useRef, useState } from 'react';
import { Game, GameMethods } from '../Game';
import { Player, PlayerSelect } from '../PlayerSelect';
import './styles.css';

export const Main = () => {
    const [player, setPlayer] = useState<Player>(Player.X);
    const matrixRef = useRef<GameMethods>(null);
    return (
        <div className="main-wrapper">
            <div className="header">
                <PlayerSelect player={player} onSelectPlayer={x => setPlayer(x as Player)} />
                <button className="reset-btn" onClick={() => matrixRef.current?.reset()}>
                    Reset
                </button>
            </div>
            <Game {...{ player }} ref={matrixRef} />
        </div>
    );
};
