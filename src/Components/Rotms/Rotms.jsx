import React from 'react';
import '../../CSS/rotms.css';
import {debugMode} from "../../code/globals";

const Rotms = ({level, handleClick}) => {
    if (debugMode) {
        console.log("Redrawing Component Rotms");
    }

    return (
        <>
            {level.map((number, index) => (
            <div className={`div-rot-${(number === ' ') ? 'Z' : number}`}
                 key={'rot'+index}
                 onClick={['1', '2', '3', '4', '5'].includes(number) ? handleClick : null}
            ></div>
            ))}
        </>
    );
}

export default Rotms;