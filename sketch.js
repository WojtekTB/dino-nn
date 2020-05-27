var w_g = innerHeight * 0.45;
var h_g = w_g * 0.6;
var floor_y = h_g * (7 / 8)
var speed_g = 5;
var startSpeed = 5;

// var p;
var cactus_array = [];
var players = [];
var populationSize = 100;
var mutationRate = 0.01;
var closestCactusDistance;

var fitnessHistory = [];
var genNumber = 1;
var bestFitness = 0;
var playersAlive = populationSize;

var cycles = 1;

var c;
var clouds = [];


//Animation stuff
var dino_animations = [];
var cloud;
var ground;
var cactusImage;
var global_x = 0;
var pretty = true;


function preload() {
    dino_animations.push(loadImage("./images/dino_animation/frame_0.png"));
    dino_animations.push(loadImage("./images/dino_animation/frame_1.png"));
    dino_animations.push(loadImage("./images/dino_animation/frame_2.png"));

    cloud = loadImage("./images/cloud.png");
    cloud = loadImage("./images/cloud.png");

    ground = loadImage("./images/floor.png");

    cactusImage = loadImage("./images/cactus/cactus.png");
}

function setup() {
    // ground.resize(w_g, (w_g/ground.width) * ground.height);

    let c = createCanvas(w_g, h_g);
    c.parent("mainCanvas");
    background(100);
    fill(200);
    rect(0, floor_y, w_g, h_g - floor_y);

    cactus_array.push(new cactus());

    for (let i = 0; i < populationSize; i++) {
        players.push(new player());
    }
    drawChart(fitnessHistory);


    let Mutation = document.getElementById("Mutation");
    Mutation.value = mutationRate;
    let Speed = document.getElementById("Speed");
    Speed.value = cycles;
    let NumberOfPlayersPerGen = document.getElementById("NumberOfPlayersPerGen");
    NumberOfPlayersPerGen.value = populationSize;
    for (let i = 0; i < 3; i++) {
        clouds.push({ x: w_g + w_g * Math.random(), y: (h_g - (h_g - floor_y)) * Math.random() });
    }
}

function draw() {
    let alldead = true;


    if (pretty) {
        background(255);
        for (let i = 0; i < 3; i++) {
            image(cloud, clouds[i].x, clouds[i].y);
            clouds[i].x -= 1;
            if (clouds[i].x + cloud.width < 0) {
                clouds[i] = { x: w_g + w_g * Math.random(), y: (h_g - (h_g - floor_y)) * Math.random() };
            }
        }


        image(ground, w_g - global_x % (ground.width * 2), floor_y - 15);
        image(ground, w_g - global_x % (ground.width * 2) + ground.width, floor_y - 15);
        image(ground, w_g - global_x % (ground.width * 2) - ground.width, floor_y - 15);
    } else {
        background(240);
        fill(200);
        rect(0, floor_y, w_g, h_g - floor_y);
    }

    for (let i = 0; i < players.length; i++) {
        if (players[i].alive) {
            players[i].show();
        }
    }
    for (let i = cactus_array.length - 1; i > 0; i--) {
        cactus_array[i].show();
    }

    for (let i = 0; i < cycles; i++) {
        closestCactusDistance = getClosestCactus();
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
        global_x += speed_g;

        if (cactus_array.length < 5) {
            let newC = new cactus();
            newC.x = cactus_array[cactus_array.length - 1].x + 250 + (Math.random() * 500);
            cactus_array.push(newC);

            // for (let i = 0; i < players.length; i++) {
            //     if (players[i].alive) {
            //         players[i].fitness++;
            //     }
            // }
        }
        speed_g += 0.001;
    }
    // fill(255, 0, 0);
    // rect(closestCactusDistance.lowestDist + w_g * (1 / 5), floor_y, 10, 10)
    // rect(closestCactusDistance.secondLowestDist + w_g * (1 / 5), floor_y, 10, 10)

    playersAlive = 0;
    for (let i = 0; i < players.length; i++) {
        if (players[i].alive) {
            playersAlive++;
        }
    }
    updateLabels();

}

function updateLabels() {
    let GenNum = document.getElementById("GenNum");
    GenNum.innerHTML = `Generation number: ${genNumber}`;

    let BestFit = document.getElementById("BestFit");
    BestFit.innerHTML = `Best fitness so far: ${bestFitness}`;

    let PlayersAlive = document.getElementById("PlayersAlive");
    PlayersAlive.innerHTML = `Players alive: ${playersAlive}`;
}

function makeNewGen() {
    console.log("New gen");
    speed_g = startSpeed;
    let totalFitness = 0;
    let bestFit = 0;
    let bestPlayer;
    for (let p of players) {
        p.fitness = Math.pow(p.fitness, 2);
    }
    for (let p of players) {
        totalFitness += p.fitness;
        if (p.fitness > bestFit) {
            bestPlayer = p;
            bestFit = p.fitness;
        }
    }

    if (bestFitness < bestFit) {
        bestFitness = bestFit;
    }

    fitnessHistory.push(bestPlayer.fitness);
    genNumber++;
    let copyOfBest = new player();
    copyOfBest.nn = NeuralNetwork.copy(bestPlayer.nn);
    let newPop = [copyOfBest];//add best from last gen to this
    // let newPop = [];//add best from last gen to this

    for (let i = 0; i < populationSize - 1; i++) {
        if (Math.random() < mutationRate) {
            newPop.push(new player());
            continue;
        }
        let parentA = pickParent(totalFitness);
        // let parentA = bestPlayer;
        let parentB = pickParent(totalFitness);
        let newPlayer = player.cross(parentA, parentB);
        // if (Math.random() < mutationRate) {
        newPlayer.nn.mutate(mutationRate);
        // }
        newPop.push(newPlayer);

        // let newPlayer = new player();
        // let newNN = NeuralNetwork.copy(bestPlayer.nn);
        // newNN.mutate(mutationRate);
        // newPlayer.nn = newNN;
        // newPop.push(newPlayer);

        // let newPlayer = new player();
        // let newNN = NeuralNetwork.copy(pickParent(totalFitness).nn);
        // newNN.mutate(mutationRate);
        // newPlayer.nn = newNN;
        // newPop.push(newPlayer);
    }

    players = newPop.slice();
    drawChart(fitnessHistory);
}

// function keyPressed() {
//     players[0].jump();
//   }

function pickParent(totalFitness) {
    let tFit = totalFitness * Math.random();
    let parent;
    let id = 0;
    while (tFit > 0) {
        // console.log("ree")
        parent = players[id];
        tFit -= parent.fitness;
        id++;
    }
    return parent;
}

function getClosestCactus() {
    let lowestDist = Infinity;
    let secondLowestDist = Infinity;
    for (let i = 0; i < cactus_array.length; i++) {
        let dist = (cactus_array[i].x - w_g * (1 / 5));
        if (dist < 0) {
            continue;
        }
        if (dist < lowestDist) {
            secondLowestDist = lowestDist;
            lowestDist = (cactus_array[i].x - w_g * (1 / 5));
        }
    }
    return { lowestDist: lowestDist, secondLowestDist: secondLowestDist };
}

class cactus {
    constructor() {
        this.x = w_g;
        this.w = 22;
        this.h = 47;
    }

    show() {
        if (pretty) {
            image(cactusImage, this.x, floor_y - this.h, this.w, this.h)
        } else {
            fill(0, 100, 0);
            rect(this.x, floor_y - this.h, this.w, this.h)
        }
    }

    update() {
        this.x -= speed_g;
    }
}


var playerRation = 0.85;
class player {
    constructor() {
        this.vy = 0;
        this.y = 0;
        this.x = w_g * (1 / 5);
        this.w = 50;
        this.h = 50;
        this.canJump = false;
        this.alive = true;
        this.nn = new NeuralNetwork(5);
        // this.nn.addLayer(4);
        this.nn.addLayer(1);

        this.fitness = 0;



        this.w *= playerRation;

    }

    static cross(a, b) {
        let newPlayer = new player();
        let newBrain = NeuralNetwork.cross(a.nn, b.nn);
        newPlayer.nn = newBrain;
        return newPlayer;
    }

    show() {
        if (pretty) {
            image(dino_animations[Math.floor(frameCount * 0.1 % dino_animations.length)], this.x, this.y - this.h, this.w / playerRation, this.h);
        } else {
            fill(0, 255 / populationSize);
            rect(this.x, this.y - this.h, this.w, this.h);
        }
    }

    makeDecision() {
        let d = this.nn.feedForward([closestCactusDistance.lowestDist / w_g, closestCactusDistance.secondLowestDist / w_g, this.y / h_g, this.vy / 20, speed_g / 20]);
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
            let RectA = { x1: this.x, y1: this.y - this.h, x2: this.x + this.w, y2: this.y + this.h };
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
        // this.fitness += (speed_g / 10);
        this.fitness++;

    }

    gravity() {
        this.vy += 0.4;
    }

    jump() {
        if (this.canJump) {
            this.canJump = false;
            this.vy = -10
            // this.fitness -= 0.001;
        }
    }
}