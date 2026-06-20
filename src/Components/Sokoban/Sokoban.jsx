import React from 'react';
import '../../CSS/sokoban.css';
import {debugMode} from "../../code/globals";

const Sokoban = (props) => {
    if (debugMode) {
        console.log("Redrawing Component Sokoban");
    }

    return (
        <>
            {props.level.map((number, index) => (
            <div className={`div-sok-${(number === ' ') ? 'Z' : number}`} key={'sok'+index}></div>
            ))}
        </>
    );
}

export default Sokoban;

