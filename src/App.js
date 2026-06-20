import React, {useState, useEffect, useRef, useCallback} from 'react';
import {Tab, Tabs, TabList, TabPanel} from 'react-tabs';
import 'react-tabs/style/react-tabs.css';

import './App.css';
import './CSS/spot_toolbar.css';
import './CSS/tabs.css';
import './CSS/scroll.css';
import './CSS/status.css';
import './CSS/mobile.css';

import logo from './assets/images/logo64.png';
import Toolbar from './Components/Toolbar/Toolbar';
import Status from './Components/Status/Status';
import SpotColorDialog from './Components/Toolbar/SpotColorDialog';
import Sokoban from './Components/Sokoban/Sokoban';
import Spot from './Components/Spot/Spot';
import Rotms from './Components/Rotms/Rotms';
import ClassSokoban from './code/ClassSokoban';
import {ClassSpot} from './code/ClassSpot';
import ClassRotms from './code/ClassRotms';

import {
    RotmsBlockWidth,
    RotmsBlockHeight,
    SpotBlockWidth,
    SpotBlockHeight
} from "./code/constants";

import {
    host,
    Backgrounds,
    glob_sound,
    PlayerDlg,
    ComputerDlg,
    toolbarMode,
    debugMode
} from "./code/globals";

import {
    fetchTXTFile
} from "./code/functions";

const
    _localStorage = (() => {
        try {
            const item = localStorage.getItem('sok-spo-rot');
            return item ? JSON.parse(item) : null;
        } catch (error) {
            console.error('Ошибка при чтении localStorage:', error);
            return null;
        }
    })(),
    p1 = new ClassSokoban(),
    p2 = new ClassSpot(),
    p3 = new ClassRotms();

if (debugMode) {
    console.log('_localStorage from localStorage:', _localStorage);
}

if (_localStorage) {
    for(let prop in _localStorage.p1) p1[prop] = _localStorage.p1[prop];
    for(let prop in _localStorage.p2) p2[prop] = _localStorage.p2[prop];
    for(let prop in _localStorage.p3) p3[prop] = _localStorage.p3[prop];

    for(let prop in _localStorage.PlayerDlg) PlayerDlg[prop] = _localStorage.PlayerDlg[prop];
    for(let prop in _localStorage.ComputerDlg) ComputerDlg[prop] = _localStorage.ComputerDlg[prop];
    for(let prop in _localStorage.Backgrounds) Backgrounds[prop] = _localStorage.Backgrounds[prop];
}


const App = () => {
    if (debugMode) {
        console.log('------------------------')
        console.log("Redrawing App");
    }

    const refApp = useRef(null);
    const [state, setState] = useState(_localStorage ? {..._localStorage.state,p1,p2,p3} : {
     selectedTab: 0,
     soundMode: glob_sound,
     toolbarMode: toolbarMode,
     backgroundModes: [3,3,3],
     undoStates: [false,false,false],
     bannerIs: "hidden",
     bannerText: "",
     p1,p2,p3
    });
    const [sokobanLevelData, setSokobanLevelData] = useState(p1.data_level);
    const [spotLevelData, setSpotLevelData] = useState(p2.data_level);
    const [rotmsLevelData, setRotmsLevelData] = useState(p3.data_level);
    const { selectedTab, backgroundModes } = state;
    const [spotSettingsDialogMode, setSpotSettingsDialogMode] = useState(false);
    const [waitFlag, setWaitFlag] = useState(false);
    const [needUpdateTrigger, setNeedUpdateTrigger] = useState(false);

    p1.refState = state;
    p1.setState = setState;
    p1.setSokobanLevelData = setSokobanLevelData;

    p2.refState = state;
    p2.setState = setState;
    p2.setSpotLevelData = setSpotLevelData;
    p2.setWaitFlag = setWaitFlag;
    p2.needUpdateTrigger = needUpdateTrigger;
    p2.setNeedUpdateTrigger = setNeedUpdateTrigger;

    p3.refState = state;
    p3.setState = setState;
    p3.setRotmsLevelData = setRotmsLevelData;

    const handleTabSelect = (tab) => {
        if (tab !== 1) { // When some spot was selected for moving but not moved yet and we gone to another game it cancel selection
            state.p2.first_step = true;
            state.p2.table_was_changed = false;
        }
        setState({
            ...state,
            selectedTab: tab,
        });
    }

    const handleKeyDown = useCallback((event) => {
        event.preventDefault();
        if (state.selectedTab !== 0) return;
        let movesBefore = p1.moves;

        if (event.key === 'ArrowUp') {
            p1.movetop(72);
        } else if (event.key === 'ArrowDown') {
            p1.movetop(80);
        } else if (event.key === 'ArrowLeft') {
            p1.movetop(75);
        } else if (event.key === 'ArrowRight') {
            p1.movetop(77);
        }

        if (p1.moves === movesBefore) return;
        if (p1.level_is_completed) return;

        setSokobanLevelData([...p1.data_level]);
    }, [state.selectedTab]);

    useEffect(() => {
        fetchTXTFile(Backgrounds.backgroundsList)
            .then(data => {
                Backgrounds.list = data.split("\r\n").filter(item => item.trim() !== '');
                console.log('Загружен список фонов:', Backgrounds.list.length, 'изображений');
                if (Backgrounds.list.length > 0) {
                    const randomIndex = Math.floor(Math.random() * 10) % Backgrounds.list.length;
                    const imageUrl = `${host}${Backgrounds.backgroundsPath}${Backgrounds.list[randomIndex]}`;
                    console.log('Устанавливается фон:', imageUrl);
                    document.body.style.background = `url('${imageUrl}') center center / contain no-repeat fixed`;
                } else {
                    console.warn('Список фонов пуст');
                }
            })
            .catch(error => {
                // Handle any errors
                console.error('Ошибка при загрузке списка фонов:', error);
            });

        if (!debugMode) {
            document.addEventListener('contextmenu', function(e) {
                e.preventDefault();
            });
        }

        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [handleKeyDown]);

    const changeSokobanLevel = (direction) => {
        p1.change_level(direction);
        setSokobanLevelData([...p1.data_level]);
    };

    const changeRotmsLevel = (direction) => {
        p3.change_level(direction);
        setRotmsLevelData([...p3.data_level]);
    };


    const handleClick = (event) => {
        if (selectedTab === 0) return;

        let element = event.target;
        let parentElement = element.parentElement;
        let elementRect = element.getBoundingClientRect();
        let parentRect = parentElement.getBoundingClientRect();
        let offsetX = elementRect.left - parentRect.left;
        let offsetY = elementRect.top - parentRect.top;

        if (selectedTab === 1) {
            if (debugMode) {
                console.log('Clicked mouse in Spot');
            }
            let x = parseInt((offsetY-42) / SpotBlockWidth);
            let y = parseInt((offsetX-3) / SpotBlockHeight);
            p2.player_move(x, y);
            setSpotLevelData([...p2.data_level]);
        }

        if (selectedTab === 2) {
            if (debugMode) {
                console.log('Clicked mouse in Rotms');
            }
            let x = parseInt(offsetY / RotmsBlockWidth);
            let y = parseInt(offsetX / RotmsBlockHeight);
            p3.pushbutton(x, y);
        }
    }

    const handleSpotDialogTrigger = () => setSpotSettingsDialogMode(!spotSettingsDialogMode);

    const handleHideBanner = () => {
        state.bannerIs = "hidden";
        state.bannerText = "";
        setState({...state});
    }

    const handleNextLevel = () => {
                state.bannerIs = "hidden";
                state.bannerText = "";
                setState({...state});

                switch (state.selectedTab) {
                    case 0:  p1.change_level(1);  // Load next level.
                             if (Backgrounds.list && Backgrounds.list.length > 0) {
                                 const randomIndex = Math.floor(Math.random() * 10) % Backgrounds.list.length;
                                 Backgrounds.backgroundTab1 = host + Backgrounds.backgroundsPath + Backgrounds.list[randomIndex];
                             }
                             setSokobanLevelData([...p1.data_level]);
                             break;

                    case 2:  p3.change_level(1);  // Load next level.
                             if (Backgrounds.list && Backgrounds.list.length > 0) {
                                 const randomIndex = Math.floor(Math.random() * 10) % Backgrounds.list.length;
                                 Backgrounds.backgroundTab3 = host + Backgrounds.backgroundsPath + Backgrounds.list[randomIndex];
                             }
                             setRotmsLevelData([...p3.data_level]);
                             break;

                    default:
                }
    }
    const handleNotNextLevel = () => {
                state.bannerIs = "hidden";
                state.bannerText = "";
                setState({...state});
    }

    return (
      <div ref={refApp} className="App" style={{backgroundColor: state.toolbarMode ? 'rgb(234,220,187,0.5)' : 'transparent'}}>

        <div className="wrapper">
            <header className="App-header">
            <img src={logo} className="App-logo" alt="logo" />
            <p className="App-header-p"><a className="App-link" href="https://sok-spo-rot.game" target="_blank" rel="noopener noreferrer"> Sok-Spo-Rot </a></p>
            </header>
            <hr/>

            <Toolbar state={state}
                     setState={setState}
                     setSokobanLevelData={setSokobanLevelData}
                     setSpotLevelData={setSpotLevelData}
                     setRotmsLevelData={setRotmsLevelData}
                     handleSpotDialogTrigger={handleSpotDialogTrigger}
            />

            {waitFlag && <div className="protector"></div>}

            <div className="main-window"
                 style={{background: (backgroundModes[selectedTab] !== 1) ? `url("${Backgrounds.backgroundDefault}")` : 'none'}}>

                    <Tabs selectedIndex={selectedTab} onSelect={handleTabSelect} disableUpDownKeys disableLeftRightKeys focusTabOnClick>

                      <TabList>
                        <Tab>Sokoban</Tab>
                        <Tab>Spot</Tab>
                        <Tab>Rotms</Tab>
                      </TabList>

                      <TabPanel>
                        <div id="tabs-1" style={{
                            display: (selectedTab === 0) ? "block" : "none",
                            background: (backgroundModes[0] === 3) ? `url("${Backgrounds.backgroundTab1}")` : "none"
                        }}>
                            <div id="sokoban-board" className="board">
                              <Sokoban level={sokobanLevelData} />
                            </div>
                            <div className="scroll">
                                <button type="button" className="up" onClick={() => changeSokobanLevel(-1)}></button>
                                <div className="lev-position"
                                     style={{height: `${state.p1.level/state.p1.maxLevel*305}px`}}
                                ></div>
                                <button type="button" className="down" onClick={() => changeSokobanLevel(1)}></button>
                            </div>
                        </div>
                      </TabPanel>

                      <TabPanel>
                        <div id="tabs-2" style={{
                            display: (selectedTab === 1) ? "block" : "none",
                            background: (backgroundModes[1] === 3) ? `url("${Backgrounds.backgroundTab2}")` : "none"
                        }}>
                            <div className="board">
                              <Spot level={spotLevelData} handleClick={handleClick} />
                            </div>
                        </div>
                      </TabPanel>

                      <TabPanel>
                        <div id="tabs-3" style={{
                            display: (selectedTab === 2) ? "block" : "none",
                            background: (backgroundModes[2] === 3) ? `url("${Backgrounds.backgroundTab3}")` : "none"
                        }}>
                            <div className="board">
                              <Rotms level={rotmsLevelData} handleClick={handleClick} />
                            </div>
                            <div className="scroll">
                                <button type="button"
                                        className="up"
                                        onClick={()=> changeRotmsLevel(-1)}
                                ></button>
                                <div className="lev-position"
                                     style={{height: `${state.p3.level/state.p3.maxLevel*305}px`}}
                                ></div>
                                <button type="button"
                                        className="down"
                                        onClick={()=> changeRotmsLevel(1)}
                                ></button>
                            </div>
                        </div>
                      </TabPanel>

                    </Tabs>

                </div>
            </div>

          <Status state={state} needUpdateTrigger={needUpdateTrigger}/>

          {spotSettingsDialogMode && <SpotColorDialog handleSpotDialogTrigger={handleSpotDialogTrigger} state={state} setState={setState} />}

          <div className="footer">
              <p> © Viacheslav Sanin - 2023 - <a
                      style={{color: "blue", textDecoration: "none"}}
                      rel="author"
                      type="text/html"
                      target="_blank"
                      href="https://www.linkedin.com/in/slava1974/">
                      www.linkedin.com/in/slava1974
                  </a>
              </p>
          </div>

          <div className="banner" style={{visibility: state.bannerIs}}>
              <div>{state.bannerText}</div>
              {(state.selectedTab === 1) && <div><button onClick={handleHideBanner}>OK</button></div>}
              {(state.selectedTab !== 1) && <div><button onClick={handleNextLevel}>Yes</button><button onClick={handleNotNextLevel}>No</button></div>}
          </div>

      </div>
      );
}

export default App;
