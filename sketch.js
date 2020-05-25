var w_g = 500;
var h_g = 500;
var floor_y = w_g * (2 / 3)
var speed_g = 5;
var startSpeed = 5;

// var p;
var cactus_array = [];
var players = [];
var populationSize = 1000;
var closestCactusDistance;

var cycles = 1;

var c;

function setup() {
    createCanvas(w_g, h_g);
    background(100);
    fill(200);
    rect(0, floor_y, w_g, h_g - floor_y);

    cactus_array.push(new cactus());

    for (let i = 0; i < populationSize; i++) {
        players.push(new player());
    }
}

function draw() {
    closestCactusDistance = getClosestCactus();

    background(100);
    fill(200);
    rect(0, floor_y, w_g, h_g - floor_y);
    let alldead = true;
    for (let i = 0; i < players.length; i++) {
        if (players[i].alive) {
            players[i].show();
        }
    }
    for (let i = cactus_array.length - 1; i > 0; i--) {
        cactus_array[i].show();
    }

    for (let i = 0; i < cycles; i++) {
        for (let i = 0; i < players.length; i++) {
            if (players[i].alive) {
                players[i].update()
                alldead = false;
            }
        }
        if (alldead) {
            cactus_array = [new cactus()];
            makeNewGen();
            return;
        }
        // p.show();
        // p.update();
        // cactus_array[0].show();
        // cactus_array[0].update();


        for (let i = cactus_array.length - 1; i > 0; i--) {
            // cactus_array[i].show();
            cactus_array[i].update();
            if (cactus_array[i].x < 0) {
                cactus_array.splice(i, 1);
            }
        }

        if (cactus_array.length < 10) {
            let newC = new cactus();
            newC.x = cactus_array[cactus_array.length - 1].x + 200 + (Math.random() * 500);
            cactus_array.push(newC)
        }
        speed_g += 0.002;
    }

    fill(255, 0, 0);
    rect(getClosestCactus() + w_g * (1 / 5), floor_y, 10, 10)
}

function makeNewGen() {
    speed_g = startSpeed;
    let totalFitness = 0;
    let bestFit = 0;
    let bestPlayer;
    for (let p of players) {
        totalFitness += p.fitness;
        if (p.fitness > bestFit) {
            bestPlayer = p;
            bestFit = p.fitness;
        }
    }

    let newPop = [bestPlayer];//add best from last gen to this

    for (let i = 0; i < populationSize - 1; i++) {
        let parentA = pickParent(totalFitness);
        let parentB = pickParent(totalFitness);
        newPop.push(player.cross(parentA, parentB));
    }
    players = newPop;
}

function pickParent(totalFitness) {
    let tFit = totalFitness;
    let parent;

    while (tFit > 0) {
        // console.log("ree")
        parent = players[Math.floor(Math.random() * players.length)];
        tFit -= parent.fitness;
    }
    return parent;
}

function getClosestCactus() {
    let lowestDist = Infinity;
    for (let i = 0; i < cactus_array.length; i++) {
        let dist = (cactus_array[i].x - w_g * (1 / 5));
        if (dist < 0) {
            continue;
        }
        if (dist < lowestDist) {
            lowestDist = (cactus_array[i].x - w_g * (1 / 5));
        }
    }
    return lowestDist;
}

class cactus {
    constructor() {
        this.x = w_g + Math.random() * 1000;
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
        this.alive = true;
        this.nn = new NeuralNetwork(4);
        this.nn.addLayer(4);
        this.nn.addLayer(1);

        this.fitness = 0;
    }

    static cross(a, b) {
        let newPlayer = new player();
        let newBrain = NeuralNetwork.cross(a.nn, b.nn);
        newPlayer.nn = newBrain;
        return newPlayer;
    }

    show() {
        fill(0, 80);
        rect(this.x, this.y - this.h, this.w, this.h);
    }

    makeDecision() {
        let d = this.nn.feedForward([closestCactusDistance / w_g, this.y / h_g, this.vy / 20, speed_g / 20]);
        if (d[0] > 0) {
            this.jump();
        }
    }

    update() {

        this.makeDecision();

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
            // console.log("hit");
            this.alive = false;
        }
        this.fitness++;

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