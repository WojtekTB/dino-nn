class PRandom{
    constructor(sequencelen = 1000){
        this.randSequence = [];
        this.numOrder = 0;
        for (let i = 0; i < sequencelen; i++) {
            this.randSequence.push(Math.random());
        }
    }

    nextNum(){
        let o = this.randSequence[this.numOrder % this.randSequence.length];
        this.numOrder++;
        return o;
    }

    reset(){
        this.numOrder = 0;
    }
}