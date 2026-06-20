
import {
    PlayMySound
} from './functions.js'

import SpotsLevels from "../Spot/levels.json";
import {Asp, Bsp} from './constants';
import {PlayerDlg, ComputerDlg, MaxLevel, spotRandomLevel, Backgrounds, host, debugMode} from "./globals";

// For finding the best place to put spot.
const PLACE = {
    x : 0,
    y : 0,
    num : -1,
    next : 0
};

class ClassSpot {
    maxLevel = MaxLevel.spot;
    data_lev_gr = []; //[Asp][Bsp];
    data_undo = []; //[Asp][Bsp];
    start_time;
    cur_time;
    h_time;
    moves;
    background = "";
    filename;
    curX;
    curY;
    who_is_now;
    error;
    first_step = true;
    first_X;
    first_Y;
    kakoe_iz_odinakovux_vubrat = 0;
    first_time = true;
    best = Object.create(PLACE);
    table = 1;
    refState = null;
    setState = null;
    setSpotLevelData = null;
    setWaitFlag = false;
    needUpdateTrigger;
    setNeedUpdateTrigger;
    //////////////////////////////////////////////////////////////////////////
    // Constructor builds a window, background and fills a map of level.
    //////////////////////////////////////////////////////////////////////////
    constructor()
    {
        this.level = 1;
        this.Player = {
            color: 2, // Color of player in level array
            is: 1,    // Moving by default
            spots: 0
        };
        this.Computer = {
            color: 3, // Color of computer in level array
            is: 2,    // Moving by default
            spots: 0
        };
        this.spotRandomLevel = spotRandomLevel;
        this.init();
    }

    init() {
        this.table_was_changed = false; // Background changed "table"/pictures
        this.level_is_completed = false;
        this.error = 0;
        this.data_level = [...SpotsLevels[this.level - 1].data.split('')];
        ///////////////////////
        // Test level
        /*for(let x=1; x<6; x++) {
            for(let y=1; y<5; y++) {
                this.data_level[x*Bsp+y] = '2';
            }
        }
        for(let x=1; x<6; x++) {
            for(let y=7; y<11; y++) {
                this.data_level[x*Bsp+y] = '3';
            }
        }*/
        ///////////////////////
        // Random level
        if (this.spotRandomLevel) {
            for(let x=1; x<(Asp-1); x++) {
                for(let y=1; y<(Bsp-1); y++) {
                    this.data_level[x*Bsp+y] = ' ';
                }
            }

            let randomSpotsCount = 2 + Math.floor(Math.random()*10) % 5;
            for(let c= 1; c < randomSpotsCount; c++) {
                let a = 1 + Math.floor(Math.random()*10) % (Asp-2); // Place in array
                let b = 1 + Math.floor(Math.random()*10) % ((Bsp-3)/2); // Place in array
                let j = 2 + Math.floor(Math.random()*10) % 2; // Player or Computer
                if (j === 2) {
                    this.data_level[Bsp*a + b] = '2';
                    this.data_level[Asp*Bsp - (Bsp*a + b) - 1] = '3';
                } else {
                    this.data_level[Bsp*a + b] = '3';
                    this.data_level[Asp*Bsp - (Bsp*a + b) - 1] = '2';
                }
            }
        }
        ///////////////////////
        //console.log(this.data_level)
        this.start_time = new Date(); // Init. timer
        this.moves = 0;
        this.first_step = true;
        this.who_is_now = (PlayerDlg.is === 1) ? 1 : 2;
        this.Player.is = PlayerDlg.is;        // First or second?
        this.Computer.is = ComputerDlg.is;    // First or second?
        this.check_spots_number();            // Init. spots number
        this.member_last_move();              // Save last moving

        if (ComputerDlg.is === 1) {
            setTimeout(
                () => this.computer_move(),
                0
            );
        }

        return 0;
    }

    NewGame() {
        if (debugMode) {
            console.log('New game function');
        }
        PlayMySound("changepage.wav", this.refState.soundMode);
        this.init();
    }

    Undo() {
        this.data_level = [...this.data_undo];
        this.moves--;
        this.first_step = true;
        this.check_spots_number();
    }

    member_last_move() {
        this.data_undo = [...this.data_level];
    }

    change_level(dir) {
        if ((this.level + dir) < 1 || (this.level + dir) > SpotsLevels.length) return;
        this.level += dir;
        this.data_level = SpotsLevels[this.level - 1].data.split('');
    }

    SaveGame(filename) {
    }

    LoadGame(filename) {
        this.filename = filename;
        return this.init();
    }

    putthis(x, y, kode) {
        let str;

        this.data_level[x*Bsp+y] = '' + kode; // '' - To convert any kode always to string

        switch (kode) {
            case '0': // Stown(border)
                str = '#tabs-2 div.board div:nth-child(' + (x*Bsp+y+1) + ')';
                document.querySelector(str).className = "div-spo-"+kode;
                break;

            case ' ': // Empty place
                kode = 'Z';
                if (this.table === 2) {
                    str = '#tabs-2 div.board div:nth-child(' + (x*Bsp+y+1) + ')';
                    document.querySelector(str).className = "div-spo-"+kode;
                }
                else {
                    str = '#tabs-2 div.board div:nth-child(' + (x*Bsp+y+1) + ')';
                    document.querySelector(str).className = "div-spo-"+kode;
                }
                break;

            default:  // Player's or computer's spot
                if (kode == 2) kode = PlayerDlg.color;
                else kode = ComputerDlg.color;

                str = '#tabs-2 div.board div:nth-child(' + (x*Bsp+y+1) + ')';
                document.querySelector(str).className = "div-spo-"+kode;
        }
    }

    retime() {
        if (this.level_is_completed) return this.h_time/1000;
        this.cur_time = new Date();
        this.h_time = this.cur_time - this.start_time;
        return this.h_time/1000;
    }

    check_end() {
        if ((this.Player.spots !== 0) && (this.Computer.spots !== 0) && (!this.level_is_completed)) {
            if ((this.who_is_now === 1) && (!this.player_cant_move)) return 0;

            for(let x=1; x<(Asp-1); x++)
                for(let y=1; y<(Bsp-1); y++) {
                    if (this.data_level[x*Bsp+y] === ' ') return 0;
                }
        }

        this.level_is_completed = true;
        this.refState.undoStates[1] = false;
        this.setState({...this.refState});
        if (debugMode) {
            console.log("Level is completed!");
        }

        // Sleep(4000);
        setTimeout( () => {
            let result;
            // Checking for a winner
            if (this.Player.spots === this.Computer.spots) result = "Draw!!!";
            else if (this.Player.spots < this.Computer.spots) result = "Computer won!!!";
                else if (this.Player.spots > this.Computer.spots) {
                            PlayMySound("winner.wav", this.refState.soundMode);
                            result = "You are the winner!!!";
                            if (Backgrounds.list && Backgrounds.list.length > 0) {
                                const randomIndex = Math.floor(Math.random() * 10) % Backgrounds.list.length;
                                Backgrounds.backgroundTab2 = host + Backgrounds.backgroundsPath + Backgrounds.list[randomIndex];
                            }
                        }
            this.refState.bannerIs = "visible";
            this.refState.bannerText = result;
            this.setState({...this.refState});
            //alert(result + "\n\n Party complete.");
            //if (this.level === this.maxLevel) alert("Level completed. \n\n No more levels!");
        }, 500);
        return 1;
    }

    change_background(str) {
        //makeBackGround(hwnd1, this, str);
    }

    player_move(x, y) {
        this.who_is_now = 1; // chey hod
        if (this.first_step || this.table_was_changed) {
            this.first_X = x;
            this.first_Y = y;
            if (this.data_level[x*Bsp+y] != this.Player.color) return;
            PlayMySound("poper.wav", this.refState.soundMode);
            let str = '#tabs-2 div.board div:nth-child(' + (x * Bsp + y + 1) + ')';
            document.querySelector(str).className = 'div-spo-' + PlayerDlg.color + 'big';
            this.first_step = false;
            this.table_was_changed = false;
            return;
        }
        else {
            if ((x === this.first_X) && (y === this.first_Y)) { // Same place. Drop down the spot.
                this.putthis(x, y, this.Player.color);
                this.first_step = true;
                return;
            }
            else {
                if (this.check_the_place(x, y, this.first_X, this.first_Y)) { // If place is empty
                    this.member_last_move();
                    //EnableMenuItem(GetMenu(hwnd), IDM_Undo, MF_ENABLED);
                    this.refState.undoStates[1] = true;
                    this.setState({...this.refState});

                    if ((Math.abs(this.first_X-x) === 2) || (Math.abs(this.first_Y-y) === 2)) { // If spot jumps
                        this.putthis(this.first_X, this.first_Y, ' ');
                    }
                    else { // Draw new spot.
                            this.putthis(this.first_X, this.first_Y, this.Player.color);
                         }
                    let str = '#tabs-2 div.board div:nth-child(' + (x*Bsp+y+1) + ')';
                    let kode = this.data_level[x*Bsp+y];
                    document.querySelector(str).className = 'div-spo-' + PlayerDlg.color + 'big';

                    setTimeout(() => {
                            this.putthis(x, y, this.Player.color);

                            PlayMySound("move1.wav", this.refState.soundMode);
                            this.fill_around(x, y, this.Computer.color); // Paint around all enemy
                            this.first_step = true;
                            this.check_spots_number();
                            this.setNeedUpdateTrigger(!this.needUpdateTrigger);
                            //InitStatus();
                            if (this.level_is_completed) return;
                            //Sleep(1000);
                            //----computer is beginning now----
                                this.computer_move();

                                if (debugMode) {
                                    console.log("after computer_move");
                                }
                                this.check_spots_number();
                                this.setSpotLevelData([...this.data_level]);
                    },500);


                    return;
                }

                this.putthis(this.first_X, this.first_Y, this.Player.color);
                this.first_step = true;
            }
        }
    }

    player_cant_move() {
        let x, y;
        if (debugMode) {
            console.log("Player spots: " + this.Player.spots);
            console.log("Computer spots: " + this.Computer.spots);
        }
        for (x=1; x<(Asp-1); x++)
            for (y=1; y<(Bsp-1); y++) {
                if (this.data_level[x*Bsp+y] == this.Player.color) {
                    let i, j;
                    for (i=x-2; i<=(x+2); i++)
                        for (j=y-2; j<=(y+2); j++) {
                            if (i<1 || i>=(Asp-1) || j<1 || j>=(Bsp-1)) continue;
                            if ((x === i) && (y === j)) continue;
                            if (this.data_level[i*Bsp+j] === ' ') return false;
                        }
                }
            }
        if (debugMode) {
            console.log("Player can't move");
        }
        return true;
    }

    computer_move() {
        this.setWaitFlag(true); // Block player moving and pressing on some buttons. Waiting while computer completes her move.
        document.querySelector('#btn-new').setAttribute('disabled', true);
        document.querySelector('#btn-undo').setAttribute('disabled', true);

        this.who_is_now = 2;
        let X_from, Y_from;
        let best = Object.create(PLACE);
        let choyse;
        let i,j;
        for (i=1; i<(Asp-1); i++) {
            for (j=1; j<(Bsp-1); j++) {
                if (this.data_level[i*Bsp+j] == this.Computer.color) {
                    choyse = this.check_around(i, j);
                    if (best.num < choyse.num) {
                        best.x = choyse.x;
                        best.y = choyse.y;
                        best.num = choyse.num;
                        best.next = choyse.next;

                        X_from = i;
                        Y_from = j;
                    }
                }
            }
        }

        if (best.num !== -1) // If found place
        {
            //Sleep(300);
            setTimeout(() => {
                    this.draw_computer_moving(X_from, Y_from, best); // Computer moves.
                }, 1000);
        }
        if (debugMode) {
            console.log("exit from computer_move()");
        }
    }

    draw_computer_moving(x, y, best) {
        PlayMySound("poper.wav", this.refState.soundMode);

        let str = '#tabs-2 div.board div:nth-child(' + (x*Bsp+y+1) + ')';
        //let kode = this.data_level[x*Bsp+y]; // TODO: Delete later
        document.querySelector(str).className = 'div-spo-' + ComputerDlg.color + 'big';
        //Sleep(5000);
        setTimeout(() => {
            //-----------------------
            //console.log(best);
            if ((Math.abs(best.x-x) === 2) || (Math.abs(best.y-y) === 2)) {
                this.putthis(x, y, ' ');
            }
            else {
                this.putthis(x, y, this.Computer.color);
            }

            //-----------------------
            str = '#tabs-2 div.board div:nth-child(' + (best.x*Bsp+best.y+1) + ')';
            //kode = this.data_level[best.x*Bsp+best.y]; // TODO: Delete later
            document.querySelector(str).className = 'div-spo-' + ComputerDlg.color + 'big';
            //-----------------------

            setTimeout(() => {
            //-----------------------
                this.putthis(best.x, best.y, this.Computer.color);

                setTimeout(() => {
                    //-----------------------
                    PlayMySound("move1.wav", this.refState.soundMode);
                    this.fill_around(best.x, best.y, this.Player.color);
                    this.setSpotLevelData([...this.data_level]);
                    document.querySelector('#btn-new').removeAttribute('disabled');
                    if (!this.level_is_completed) document.querySelector('#btn-undo').removeAttribute('disabled');
                    else {
                        this.refState.undoStates[1] = false;
                        this.setState({...this.refState});
                    }
                    this.setWaitFlag(false); //Cancel blocking player actions
                    this.moves++;
                    setTimeout(() => {
                        if (debugMode) {
                            console.log("Loop for case when player can't move and computer can");
                        }
                        if (!this.level_is_completed && this.player_cant_move()) this.computer_move();
                    },0); // Loop for case when player can't move and computer can

                }, 500);

            }, 500);

        }, 300);
    }

    check_around(x, y) {
        let i, j, bonus=0, num=0;
        let scolko_odinakovux=0;

        if (this.first_time) this.best.num=-1;

        for (i=x-2; i<=x+2; i++)
            for (j=y-2; j<=y+2; j++) {
                if (i<1 || i>=(Asp-1) || j<1 || j>=(Bsp-1)) continue;
                if ((x === i) && (y === j)) continue;
                if ((Math.abs(x-i) <= 1) && (Math.abs(y-j) <= 1)) bonus=1;
                else bonus=0;

                if (this.data_level[i*Bsp+j] === ' ') {
                    num = this.calculate_Players_spots_to_draw(i, j);
                    num += bonus;
                    if (num >= this.best.num) {
                        if (this.first_time) {
                            if (num > this.best.num) scolko_odinakovux = 1;
                            else scolko_odinakovux++;
                            this.best.num = num;
                        }
                        else {
                            if (num === this.best.num) {
                                scolko_odinakovux++;
                                if (scolko_odinakovux === this.kakoe_iz_odinakovux_vubrat) {
                                    this.best.x = i;
                                    this.best.y = j;
                                    this.best.num = num;
                                    this.best.next = 0;
                                    this.first_time = true;
                                    return this.best;
                                }
                            }
                        }
                    }
                }
            }
        if (this.best.num !== -1) {
            this.kakoe_iz_odinakovux_vubrat = Math.floor(1 + (Math.random()*10 % scolko_odinakovux));
            this.first_time = false;
            this.check_around(x, y);
        }
        this.first_time = true;
        return this.best;
    }

    calculate_Players_spots_to_draw(x, y) {
        let i, j, num=0;
        for (i=x-1; i<=x+1; i++)
            for (j=y-1; j<=y+1; j++) {
                if (i<1 || i>=(Asp-1) || j<1 || j>=(Bsp-1)) continue;
                if ((x === i) && (y === j)) continue;
                if (this.data_level[i*Bsp+j] == this.Player.color) num++;
            }
        return num;
    }

    check_the_place(x, y, first_X, first_Y) {
        if (this.data_level[x*Bsp+y] !== ' ') return false;
        if (Math.abs(first_X-x)>2 || Math.abs(first_Y-y)>2) return false;
        return true;
    }

    fill_around(x, y, color) {
        let i, j;
        for (i=x-1; i<=x+1; i++)
            for (j=y-1; j<=y+1; j++)
                if (this.data_level[i*Bsp+j] == color) {
                    this.putthis(i, j, this.data_level[x*Bsp+y]);
                }

        this.check_spots_number();

        if ((this.who_is_now === 2) && this.player_cant_move() && (this.Computer.spots > this.Player.spots)) {
            this.level_is_completed = true;
        }

        this.check_end();
    }

    check_spots_number() {
        this.Player.spots = 0;
        this.Computer.spots = 0;
        for(let x=1; x<Asp; x++)
            for(let y=1; y<Bsp; y++) {
                if (this.data_level[x*Bsp+y] == this.Player.color) this.Player.spots++;
                if (this.data_level[x*Bsp+y] == this.Computer.color) this.Computer.spots++;
            }

        const playerScoreElem = document.getElementById('player-score');
        if (playerScoreElem) {
            playerScoreElem.text = this.Player.spots;
        }

        const computerScoreElem = document.getElementById('computer-score');
        if (computerScoreElem) {
            computerScoreElem.text = this.Computer.spots;
        }
    }


}

export {
    ClassSpot
}
