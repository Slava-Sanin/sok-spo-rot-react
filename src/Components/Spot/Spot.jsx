import React from 'react';
import '../../CSS/spot.css';
import {debugMode, ComputerDlg, PlayerDlg} from "../../code/globals";

const Spot = ({level, handleClick}) => {
    if (debugMode) {
        console.log("Redrawing Component Spot");
    }

    return (
        <>
          {level.map((number, index) => (
            <div className={`div-spo-${(number === ' ') ? 'Z' : 
                ((number === '2') ? PlayerDlg.color :
                    ((number === '3') ? ComputerDlg.color : number))}`}
                 key={'spo'+index}
                 onClick={[' ', '2', '3', '4', '5', '6'].includes(number) ? handleClick : null}
            ></div>
          ))}
        </>
    );
}

export default Spot;