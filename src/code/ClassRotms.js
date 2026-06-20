import './ClassFire'  // Defining class fire
import {
    PlayMySound
} from './functions.js';
import ClassFire from './ClassFire';
import RotmsLevels from "../Rotms/levels.json";
import {A, B} from './constants';
import {MaxLevel} from "./globals";

class ClassRotms {    
    level = 1;
    maxLevel = MaxLevel.rotms;
    data_level = [];
    data_lev_gr = [];
    data_undo = [];
    start_time;
    cur_time;
    h_time;
    moves;
    score;
    score_undo;
    background;
    filename;
    curX;
    curY;
    flag_push = 0;
    error = 0;
    level_is_completed;
    refState = null;
    setState = null;
    setRotmsLevelData;

    constructor() {
        this.init();
    }

    init() {
        this.error = 0;
        this.data_level = RotmsLevels[this.level - 1].data.split('');
        this.start_time = new Date();
        this.score = 0;
        this.score_undo = 0;
        this.moves = 0;
        this.build_ground();
        this.member_last_move();
        this.level_is_completed = false;
    }
        
    NewGame() {
        PlayMySound("changepage.wav", this.refState.soundMode);
        this.init();
    }

    Undo() {
        if (this.level_is_completed) return;
        this.data_level = [...this.data_undo];
        this.score = this.score_undo;
        this.moves--;
        PlayMySound("move1.wav", this.refState.soundMode);
        this.setRotmsLevelData([...this.data_level]);
    }
        
    member_last_move() {
        this.data_undo = [...this.data_level];
        this.score_undo = this.score;
    }
    
    build_ground() {        
        for(let x=0; x<A; x++)
            for(let y=0; y<B; y++)
            {
                switch (this.data_level[x*B+y])
                {
                    case '0':
                    case '1':
                    case '2':
                    case '3':
                    case '4':
                    case '5': this.data_lev_gr[x*B+y] = this.data_level[x*B+y]; break;
                    default:  this.data_lev_gr[x*B+y] = ' ';
                }
                this.putthis(x, y, this.data_level[x*B+y]);
            }        
    }
    
    change_level(dir) {
        if ((this.level + dir) < 1 || (this.level + dir) > RotmsLevels.length) return;
        this.level += dir;
        PlayMySound("changepage.wav", this.refState.soundMode);
        this.init();
        this.refState.undoStates[2] = false;
        this.setState({...this.refState});
    }
    
    SaveGame(filename) {
    }
    
    LoadGame(filename) {
        this.filename = filename;
        return this.init();
    }
    
    pushbutton(x, y) {
        let isMoved = false;

        if (this.data_level[x*B+y]>'0' && this.data_level[x*B+y]<'6')
        {
            this.flag_push=1;
            this.putthis(x, y, this.data_level[x*B+y]);
            this.curX=x;
            this.curY=y;
        }
        else return;
        switch (this.data_level[x*B+y])
        {
            case '1': //Left
                      this.member_last_move();
                      isMoved = this.movetop('1');
                      break;

            case '2': //Right
                      this.member_last_move();
                      isMoved = this.movetop('2');
                      break;

            case '3': //Up
                      this.member_last_move();
                      isMoved = this.movetop('3');
                      break;

            case '4': //Down
                      this.member_last_move();
                      isMoved = this.movetop('4');
                      break;

            case '5': // (All) Left, Right, Up and Down
                      this.member_last_move();
                      isMoved = this.movetop('1');
                      isMoved = this.movetop('2') || isMoved;
                      isMoved = this.movetop('3') || isMoved;
                      isMoved = this.movetop('4') || isMoved;
                      break;

            default:
        }

        if (isMoved) {
            PlayMySound("move1.wav", this.refState.soundMode);
            this.switchUndoMode(true);
            this.setRotmsLevelData([...this.data_level]);
            setTimeout(() => {
                this.fire_all_on_pushing(x, y);
                this.setRotmsLevelData([...this.data_level]);
            }, 500);
        }
    }
    
    movetop(key) {
        let Xtemp;
        let Ytemp;
        let isMoved = false;

        switch (key)
        {
            case '2': // Moving left
                for (Ytemp = this.curY - 1; ((this.data_level[this.curX * B + Ytemp] < '0')
                || (this.data_level[this.curX * B + Ytemp] > '5')) && (Ytemp > 0); Ytemp--);
                while(Ytemp !== this.curY - 1)
                {
                    if (this.data_level[this.curX * B + Ytemp] === ' ')
                    {
                        this.putthis(this.curX, Ytemp, this.data_level[this.curX * B + Ytemp+1]);
                        this.putthis(this.curX, Ytemp+1, ' ');
                        isMoved = true;
                    }
                    Ytemp++;
                }
                break;

            case '1': // Moving right
                for (Ytemp = this.curY + 1; ((this.data_level[this.curX * B + Ytemp] < '0')
                || (this.data_level[this.curX * B + Ytemp] > '5')) && (Ytemp < (B-1)); Ytemp++);
                while(Ytemp !== this.curY + 1)
                {
                    if (this.data_level[this.curX * B + Ytemp] === ' ')
                    {
                        this.putthis(this.curX, Ytemp, this.data_level[this.curX * B + (Ytemp-1)]);
                        this.putthis(this.curX, Ytemp-1, ' ');
                        isMoved = true;
                    }
                    Ytemp--;
                }
                break;

            case '3': // Moving up
                for (Xtemp = this.curX-1; ((this.data_level[Xtemp * B + this.curY] < '0')
                || (this.data_level[Xtemp * B + this.curY] > '5')) && (Xtemp > 0); Xtemp--);
                while(Xtemp !== this.curX - 1)
                {
                    if (this.data_level[Xtemp * B + this.curY] === ' ')
                    {
                        this.putthis(Xtemp, this.curY, this.data_level[(Xtemp+1) * B + this.curY]);
                        this.putthis(Xtemp + 1, this.curY, ' ');
                        isMoved = true;
                    }
                    Xtemp++;
                }
                break;

            case '4': // Moving down
                for (Xtemp = this.curX + 1; ((this.data_level[Xtemp * B + this.curY] < '0')
                || (this.data_level[Xtemp * B + this.curY] > '5')) && (Xtemp < (A-1)); Xtemp++);
                while(Xtemp !== this.curX + 1)
                {
                    if (this.data_level[Xtemp * B + this.curY] === ' ')
                    {
                        this.putthis(Xtemp, this.curY, this.data_level[(Xtemp-1) * B + this.curY]);
                        this.putthis(Xtemp-1, this.curY, ' ');
                        isMoved = true;
                    }
                    Xtemp--;
                }
                break;

            default:
        }

        return isMoved;
    }

    switchUndoMode(mode) {
        let tempUndoStates = [...this.refState.undoStates];
        tempUndoStates[2] = mode;
        this.setState({
            ...this.refState,
            undoStates: tempUndoStates
        });
    }
    
    putthis(x, y, kode) {
        this.data_level[x*B+y] = kode;
    }

    retime() {
        this.cur_time = new Date();
        this.h_time = this.cur_time - this.start_time;
        return this.h_time/1000;
    }
    
    check_end() {
        for(let x=0; x<A; x++)
        {
            for(let y=0; y<B; y++)
            {
                if ((this.data_level[x*B+y]==='B') || (this.data_level[x*B+y]==='G')
                || (this.data_level[x*B+y]==='K') || (this.data_level[x*B+y]==='R')
                || (this.data_level[x*B+y]==='S') || (this.data_level[x*B+y]==='Y'))
                    return;
            }
        }
        this.level_is_completed = true;
        PlayMySound("winner.wav", this.refState.soundMode);
        this.switchUndoMode(false);
        
        setTimeout( () => {
            this.refState.bannerIs = "visible";
            this.refState.bannerText = "Level completed. Next level?";
            this.setState({...this.refState});
            /*if (window.confirm("Level completed. Next level?") === true)
            {
                if (this.level === this.maxLevel) // If this is the last level
                alert("Level completed. No more levels!");
                else
                {
                    this.change_level(1);  // Load next level.
                    //this.NewGame(); // Play again.
                    this.setRotmsLevelData([...this.data_level]);
                }
            }*/
        }, 500);
    }
    
    // My_Scrolling(wParam, lParam) {
    //     let prevlevel = this.level;
    //     switch (LOWORD(wParam))
    //     {
    //         case window.SB_LINEUP:
    //             if (this.level === 1)	return;
    //             else this.level--;
    //             break;
    //         case window.SB_LINEDOWN:
    //             if (this.level === 20) return;
    //             else this.level++;
    //             break;
    //         case window.SB_THUMBTRACK:
    //             this.level=HIWORD(wParam);
    //             break;
    //         case window.SB_PAGEUP:
    //             this.level-=1;
    //             if (this.level < 1) this.level=1;
    //             break;
    //         case window.SB_PAGEDOWN:
    //             this.level+=1;
    //             if (this.level > 20) this.level=20;
    //             break;
    //         default:
    //             return;
    //     }
    //     if (prevlevel === this.level) return;

    //     PlayMySound("move.wav");
    //     this.change_level();               // Change and load level.
    //     this.init();                       // New game.
    // }

    change_background(str) {
    // makeBackGround(hwnd1, this, str);
    }

    fire_all_on_pushing(x, y) {
        let Xtemp, Ytemp;
        switch (this.data_level[x*B+y])
        {
            case '5': this.moves-=3;
            case '2': // Search left
                for (Ytemp=this.curY-1; ((this.data_level[this.curX*B+Ytemp] < '0')
                || (this.data_level[this.curX*B+Ytemp] > '5')) && (Ytemp>-1); Ytemp--);
                Ytemp++;
                while(Ytemp !== this.curY)
                {
                    if (this.data_level[x*B+Ytemp] !== ' ')
                        {
                            let tempfire = new ClassFire(this); // this -> p3
                            tempfire.fire(x, Ytemp, this.refState.soundMode);
                        }
                    Ytemp++;
                }
                this.moves++;
                this.check_end();
                if (this.data_level[x*B+y] === '2') break;

            case '1': // Search up
                for (Ytemp=this.curY+1; ((this.data_level[this.curX*B+Ytemp] < '0')
                || (this.data_level[this.curX*B+Ytemp] > '5')) && (Ytemp<B); Ytemp++);
                Ytemp--;
                while(Ytemp !== this.curY)
                {
                    if (this.data_level[x*B+Ytemp] !== ' ')
                        {
                            let tempfire = new ClassFire(this);
                            tempfire.fire(x, Ytemp, this.refState.soundMode);
                        }
                    Ytemp--;
                }
                this.moves++;
                this.check_end();
                if (this.data_level[x*B+y] === '1') break;

            case '3': // Search left
                for (Xtemp=this.curX-1; ((this.data_level[Xtemp*B+this.curY] < '0')
                || (this.data_level[Xtemp*B+this.curY] > '5')) && (Xtemp>-1); Xtemp--);
                Xtemp++;
                while(Xtemp !== this.curX)
                {
                    if (this.data_level[Xtemp*B+y] !== ' ')
                        {
                            let tempfire = new ClassFire(this);
                            tempfire.fire(Xtemp, y, this.refState.soundMode);
                        }
                    Xtemp++;
                }
                this.moves++;
                this.check_end();
                if (this.data_level[x*B+y] === '3') break;

            case '4': // Search down
                for (Xtemp=this.curX+1; ((this.data_level[Xtemp*B+this.curY] < '0')
                || (this.data_level[Xtemp*B+this.curY] > '5')) && (Xtemp<A); Xtemp++);
                Xtemp--;
                while(Xtemp !== this.curX)
                {
                    if (this.data_level[Xtemp*B+y] !== ' ')
                        {
                            let tempfire = new ClassFire(this);
                            tempfire.fire(Xtemp, y, this.refState.soundMode);
                        }
                    Xtemp--;
                }
                this.moves++;
                this.check_end();
                break;

            default: break;
        }
    }

}

export default ClassRotms;
