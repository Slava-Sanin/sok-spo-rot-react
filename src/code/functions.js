import {PlayerDlg, ComputerDlg, debugMode} from "./globals";
import {soundPath} from './globals';

/*function loadDoc(filename) {
  let xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (xhttp.readyState === 4 && xhttp.status === 200) {
        let level_in_text_format = xhttp.responseText;
    }
  };
  xhttp.open("GET", filename, false);
  xhttp.send();
}*/

const fetchTXTFile = async (path) => {
    return new Promise((resolve, reject) => {
        fetch(path)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.text();
            })
            .then(data => {
                // Обработка полученного текстового файла
                resolve(data);
            })
            .catch(error => {
                // Обработка ошибки
                console.error('Ошибка при загрузке файла:', error);
                reject(error);
            });
    });
}

function extractVariables(obj, exclude) {
    let variablesObj = {};

    for (let prop in obj) {
        if (obj.hasOwnProperty(prop) && typeof obj[prop] !== 'function') {
            if (exclude.includes(prop)) {
                if (debugMode) {
                    console.log('exclude', prop);
                }
                continue;
            }
            variablesObj[prop] = obj[prop];
        }
    }

    return variablesObj;
}

function InitStatus(props)
{
    let sec,s;
    let gamecode = props.selectedTab + 1;
    const strStyle = {font: "caption", fontSize: 20, fontWeight: "bold"};

    switch (gamecode)
    {
        case 1: // Sokoban status
            sec = props.p1.retime();
            s = parseInt(sec%60);

            return (
                <div id="status_sokoban">

                    <div className="time">
                        <div>Time of the game</div>
                        <span style={strStyle}>{parseInt(sec/3600)}</span><span style={{fontWeight: "lighter"}}> Hours </span>
                        <span style={strStyle}>{parseInt(sec/60%60)}</span><span style={{fontWeight: "lighter"}}> Minutes </span>
                        <span style={strStyle}>{(s<10)?'0'+s:s}</span><span style={{fontWeight: "lighter"}}> Seconds</span>
                    </div>

                    <div className="level">
                        <div>Level</div>
                        <span style={strStyle}>{props.p1.level}</span>
                    </div>

                    <div className="moves">
                        <div>Moves</div>
                        <span style={strStyle}>{props.p1.moves}</span>
                    </div>

                </div>);

        case 2: // Spot status
            let playerIs = props.p2.Player.is === 1 ? "first" : "second";
            let computerIs = props.p2.Computer.is === 1 ? "first" : "second";

            sec = props.p2.retime();
            s = parseInt(sec%60);
            props.p2.check_spots_number();

            return (
                <div id="status_spot">

                    <div className="time">
                        <div>Time of the game</div>
                        <span style={strStyle}>{parseInt(sec/3600)}</span><span style={{fontWeight: "lighter"}}> Hours </span>
                        <span style={strStyle}>{parseInt(sec/60%60)}</span><span style={{fontWeight: "lighter"}}> Minutes </span>
                        <span style={strStyle}>{(s<10)?'0'+s:s}</span><span style={{fontWeight: "lighter"}}> Seconds</span>
                    </div>

                    <div className="player">
                        <span style={{color: GetColor(PlayerDlg.color)}}>Player</span>
                        <span style={{fontWeight: "lighter"}}> ({playerIs})</span>
                        <div id="player-score" style={{...strStyle}}>{props.p2.Player.spots}</div>
                    </div>

                    <div className="player">
                        <span style={{color: GetColor(ComputerDlg.color)}}>Computer</span>
                        <span style={{fontWeight: "lighter"}}> ({computerIs})</span>
                        <div id="computer-score" style={{...strStyle}}>{props.p2.Computer.spots}</div>
                    </div>

                </div>
            );

        case 3: // Rotms status
            sec = props.p3.retime();
            s = parseInt(sec%60);

            return (
                <div id="status_rotms">

                    <div className="time">
                        <div>Time of the game</div>
                        <span style={strStyle}>{parseInt(sec/3600)}</span><span style={{fontWeight: "lighter"}}> Hours </span>
                        <span style={strStyle}>{parseInt(sec/60%60)}</span><span style={{fontWeight: "lighter"}}> Minutes </span>
                        <span style={strStyle}>{(s<10)?'0'+s:s}</span><span style={{fontWeight: "lighter"}}> Seconds</span>
                    </div>

                    <div className="level">
                        <div>Level</div>
                        <span style={strStyle}>{props.p3.level}</span>
                    </div>

                    <div className="moves">
                        <div>Moves</div>
                        <span style={strStyle}>{props.p3.moves}</span>
                    </div>

                    <div className="score">
                        <div>Score</div>
                        <span style={strStyle}>{props.p3.score}</span>
                    </div>
                </div>
            );

        default: break;
    }
}


function PlayMySound(soundName, soundMode)
{
    if (soundMode)
    {
        let myAudio = new Audio(soundPath + soundName);
        myAudio.play();
    }
}


function Sleep(milliseconds)
{
  let start = new Date().getTime();
  do
  {
    if ((new Date().getTime() - start) > milliseconds) return;
  }
  while(1);
}


function GetColor(color)
{
    switch (color) {
        case 2:  return "red";
        case 3:  return "blue";
        case 4:  return "cadetblue";
        case 5:  return "yellow";
        case 6:  return "green";
        case 7:  return "yellow";
        default: break;
    }
}


export {
    fetchTXTFile,
    extractVariables,
    InitStatus,   
    PlayMySound,
    Sleep,
    GetColor
}