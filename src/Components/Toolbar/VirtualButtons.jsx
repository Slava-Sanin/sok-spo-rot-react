import React, {useState} from 'react';
import {throttle} from 'lodash';
import '../../CSS/virtual_buttons.css';

const VirtualButtonSettings = {
    isWasDragged: false,
    //x: 430,
    //y: 31,
}

 const VirtualButtons = ({state, setSokobanLevelData}) => {
     const [dragging, setDragging] = useState(false);
     const [position, setPosition] = useState({});

     const handleMouseDown = () => {
        setDragging(true);
     }

     const handleMouseMove = throttle((event) => {
         if (dragging) {
             VirtualButtonSettings.isWasDragged = true;
             const { clientX, clientY } = event;
             setPosition({ x: clientX - 137/2, y: clientY - 137/2 });
         }
     }, 10);

     const handleMouseUp = () => {
        setDragging(false);
     }

     const handleArrowPress = (arrow) => {
         if (state.selectedTab !== 0) return;
         let movesBefore = state.p1.moves;

         if (arrow === 'ArrowUp') {
             state.p1.movetop(72);
         } else if (arrow === 'ArrowDown') {
             state.p1.movetop(80);
         } else if (arrow === 'ArrowLeft') {
             state.p1.movetop(75);
         } else if (arrow === 'ArrowRight') {
             state.p1.movetop(77);
         }

         if (state.p1.moves === movesBefore) return;
         if (state.p1.level_is_completed) return;

         setSokobanLevelData([...state.p1.data_level]);
     };

    return (
        <div
             className="virtual_buttons"
             style={{
                 display: (state.selectedTab === 0) ? "block" : "none",
                 position: VirtualButtonSettings.isWasDragged ? "fixed" : "absolute",
                 left: position.x,
                 top: position.y,
             }}>
            <table>
                <tbody>
                    <tr>
                        <th></th>
                        <th id="virtual_up" onClick={ () => {handleArrowPress('ArrowUp')} }></th>
                        <th></th>
                    </tr>

                    <tr>
                        <th id="virtual_left" onClick={ () => {handleArrowPress('ArrowLeft')} }></th>
                        <th id="virtual_move"
                            className={dragging ? "virtual_move_on" : "virtual_move_off"}
                            //onMouseMoveCapture
                            onMouseDown={ handleMouseDown }
                            onMouseMove={ handleMouseMove }
                            onMouseUp={ handleMouseUp }
                        >+<span className="mytooltiptext">You can drag it to any place</span></th>
                        <th id="virtual_right" onClick={ () => {handleArrowPress('ArrowRight')} }></th>
                    </tr>

                    <tr>
                        <th></th>
                        <th id="virtual_down" onClick={ () => {handleArrowPress('ArrowDown')} }></th>
                        <th></th>
                    </tr>
                </tbody>
            </table>
        </div>
    );
}

export default VirtualButtons;