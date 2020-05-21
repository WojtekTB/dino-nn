var w_g = 500;
var h_g = 500;
var floor_y = w_g * (2 / 3)
var speed_g = 5;

var p;
var cactus_array = [];

var c;

function setup() {
    createCanvas(w_g, h_g);
    background(100);
    fill(200);
    rect(0, floor_y, w_g, h_g - floor_y);
    p = new player();

    cactus_array.push(new cactus());
}

function draw() {
    background(100);
    fill(200);
    rect(0, floor_y, w_g, h_g - floor_y);
    p.show();
    p.update();
    cactus_array[0].show();
    cactus_array[0].update();
}

class cactus {
    constructor() {
        this.x = 400;
        this.w = 22;
        this.h = 47;
    }

    show() {
        fill(0, 100, 0);
        rect(this.x, floor_y - this.h, this.w, this.h)
    }

    update() {
        this.x -= speed_g;
    }
}

class player {
    constructor() {
        this.vy = 0;
        this.y = 0;
        this.x = w_g * (1 / 5);
        this.w = 25;
        this.h = 50;
        this.canJump = false;
    }

    show() {
        fill(0);
        rect(this.x, this.y - this.h, this.w, this.h);
    }

    update() {
        this.gravity();
        this.y += this.vy;
        if (this.y > floor_y) {
            this.y = floor_y;
            this.vy = 0;
            this.canJump = true;
        }

        let d = false;

        for (let c of cactus_array) {
            let RectA = { x1: this.x, y1: this.y - this.h, x2: this.x + this.w, y2: this.y + this.w };
            let RectB = { x1: c.x, y1: floor_y - c.h, x2: c.x + c.w, y2: floor_y };
            let aLeftOfB = RectA.x2 < RectB.x1;
            let aRightOfB = RectA.x1 > RectB.x2;
            let aAboveB = RectA.y1 > RectA.y2;
            let aBelowB = RectA.y2 < RectB.y1;

            if (!(aLeftOfB || aRightOfB || aAboveB || aBelowB)) {
                d = true;
                break;
            }
        }
        if (d) {
            console.log("hit");
        }

    }

    gravity() {
        this.vy += 0.5;
    }

    jump() {
        if (this.canJump) {
            this.canJump = false;
            this.vy = -10
        }
    }
}