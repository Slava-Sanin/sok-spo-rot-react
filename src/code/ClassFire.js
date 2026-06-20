import {
    PlayMySound
} from './functions.js'

import {A, B} from './constants';

const rotm = {
    x : 0, 
	y : 0
};

// Firing rotms class.
class ClassFire {
    constructor(refP3) {
        this.p3 = refP3;
        this.mat = [Object.create(rotm), Object.create(rotm), Object.create(rotm), Object.create(rotm)];
        this.count = 0;
        this.points = 0;
    }
        
    fire(x, y, soundMode) {
        this.init();
        this.check_around(x, y); // Find more rotms around this rotm.
        if (this.count > 1)
        {
            PlayMySound("fire.wav", soundMode);
            this.points = this.count * this.count * 10; // Points of player.
            this.p3.score += this.points;
            while(this.count) // Remove rotms from board.
            {
                this.p3.putthis(this.mat[this.count-1].x, this.mat[this.count-1].y, ' ');
                this.count--;
            }
        }
    }
        
    init() {
        this.points = 0;
        this.count = 0;
        for(let i=1; i<4; i++)
        {
            this.mat[i].x = -1;
            this.mat[i].y = -1;
        }
    }
    
    find(x, y) {
        for(let i=0; i < this.count; i++)
        {
            if ((this.mat[i].x === x) && (this.mat[i].y === y)) return 1;
        }
        return 0;
    }
    
    
    check_around(x, y) {
        if (!this.find(x, y)) // If yet not in "matrix-data base".
        {
            this.mat[this.count].x = x; //  Put coordinates of rotm in to
            this.mat[this.count].y = y; //  "matrix-data base".
            this.count++; // Counts rotms that is found and must been fired.
            if (x-1 > -1) // Check place from left of rotm.
            {
                if (this.p3.data_level[(x-1)*B+y] === this.p3.data_level[x*B+y])
                    this.check_around(x-1, y);
            }

            if ((y+1) < B)  // Check place from right of rotm.
            {
                if (this.p3.data_level[x*B+(y+1)] === this.p3.data_level[x*B+y])
                    this.check_around(x, y+1);
            }

            if ((x+1) < A)  // Check place from up of rotm.
            {
                if (this.p3.data_level[(x+1)*B+y] === this.p3.data_level[x*B+y])
                    this.check_around(x+1, y);
            }

            if ((y-1) > -1)  // Check place from down of rotm.
            {
                if (this.p3.data_level[x*B+(y-1)] === this.p3.data_level[x*B+y])
                    this.check_around(x, y-1);
            }
        }
    }

}

export default ClassFire;