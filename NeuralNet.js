var SIGMOID_FUNCTION = function (n) {
    return 1 / (1 + Math.pow(2.71828, -n));
}

var UN_SUGMOID_FUNCTION = function (y) {
    return y * (1 - y)
}

var SIGN_FUNCTION = function (n) {
    return Math.sign(n);
}

class NeuralNetwork {
    constructor(numberOfInputs) {
        this.numberOfInputs = numberOfInputs;
        this.hiddenFunction = SIGMOID_FUNCTION;
        this.outputFunction = SIGN_FUNCTION;
        this.layers = [];
    }

    static cross(a, b) {
        let newNN = new NeuralNetwork(a.numberOfInputs);
        for (let i = 0; i < a.layers.length; i++) {
            newNN.layers.push(Matrix.cross(a.layers[i], b.layers[i]));
        }
        return newNN;
    }

    feedForward(input) {
        let input_array = input.concat([1]);
        let input_matrix = Matrix.fromArray(input_array);
        for (let i = 0; i < this.layers.length; i++) {
            input_matrix = Matrix.multiply(input_matrix, Matrix.transpose(this.layers[i]));
            input_array = Matrix.toArray(input_matrix);
            input_array = input_array.concat([1]);
            input_matrix = Matrix.fromArray(input_array);
            if (i < this.layers.length - 1) {
                input_matrix = Matrix.applyToAll(input_matrix, this.hiddenFunction);
            }
        }
        input_matrix = Matrix.applyToAll(input_matrix, this.outputFunction);
        input_array = Matrix.toArray(input_matrix);
        input_array.pop();//remove the bias 1 at the end
        return input_array;
    }

    addLayer(numberNodes) {
        if (this.layers.length === 0) {
            let m = new Matrix(numberNodes, this.numberOfInputs + 1);
            m.randomize();
            this.layers.push(m);// +1 because of bias
        } else {
            let m = new Matrix(numberNodes, this.layers[this.layers.length - 1].rows + 1);
            m.randomize();
            this.layers.push(m);
        }
    }

    // addOutput(numberOfOutputs) {
    //     let m = new Matrix(numberNodes, this.layers[this.layers.length - 1].rows + 1);
    //     m.randomize();
    //     this.layers.push(m);
    // }

    setOutputFunction(f) {
        this.outputFunction = f;
    }

    setHiddenFunction(f) {
        this.hiddenFunction = f;
    }
}

class Matrix {
    constructor(rows, columns) {
        this.rows = rows;
        this.columns = columns;
        this.data = [];

        //init data
        for (let i = 0; i < rows; i++) {
            let newRow = [];
            for (let j = 0; j < columns; j++) {
                newRow.push(0);
            }
            this.data.push(newRow);
        }
    }

    print() {
        console.table(this.data);
    }

    set(data, r, c) {
        this.data[r][c] = data;
    }

    randomize() {
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.columns; j++) {
                this.set((Math.random() * 2) - 1, i, j);
            }
        }
    }

    static cross(a, b) {
        //this is a really shitty implementation of this but I am too lazy to figure out how to do it cleanly right now
        let mA;
        let mB;
        let r = Math.random();
        if (r > 0) {
            mA = a;
            mB = b;
        } else {
            mA = b;
            mB = a;
        }

        let arrayA = Matrix.matrixToOneDArray(mA)
        let arrayB = Matrix.matrixToOneDArray(mB)
        let n = [];
        let start = 0;
        let len = Math.floor((arrayA.length / 3) * Math.random());
        let chosenArray = arrayA;
        while (true) {
            // console.log("ree");
            if (start + len > arrayA.length) {
                len = arrayA.length - start;
                n = n.concat(chosenArray.slice(start, start + len + 1));
                break;
            }
            n = n.concat(chosenArray.slice(start, start + len + 1));

            if (chosenArray === arrayA) {
                chosenArray = arrayB;
            } else {
                chosenArray = arrayA;
            }

            start += len;
            len = Math.floor((arrayA.length / 3) * Math.random());

        }
        let output = Matrix.toMatrix(a.rows, a.columns, n);;
        // console.log(output)

        return output;
    }

    static toMatrix(r, c, data) {
        let n = new Matrix(r, c);
        for (let i = 0; i < n.rows; i++) {
            for (let j = 0; j < n.columns; j++) {
                n.data[i][j] = data[(i * c) + j];
            }
        }
        return n;
    }

    static matrixToOneDArray(m) {
        let a = [];
        for (let i = 0; i < m.rows; i++) {
            for (let j = 0; j < m.columns; j++) {
                a.push(m.data[i][j]);
            }
        }
        return a;
    }

    static copy(m) {
        let n = new Matrix(m.rows, m.columns);
        for (let i = 0; i < n.rows; i++) {
            for (let j = 0; j < n.columns; j++) {
                n.data[i][j] = m.data[i][j];
            }
        }
        return n;
    }

    static applyToAll(m, f) {
        let n = new Matrix(m.rows, m.columns);
        for (let i = 0; i < n.rows; i++) {
            for (let j = 0; j < n.columns; j++) {
                n.data[i][j] = f(m.data[i][j]);
            }
        }
        return n;
    }

    static fromArray(a) {
        let n = new Matrix(1, a.length);
        for (let i = 0; i < a.length; i++) {
            n.set(a[i], 0, i);
        }
        return n;
    }

    static toArray(m) {
        let a = [];
        for (let i = 0; i < m.columns; i++) {
            a.push(m.data[0][i]);
        }
        return a;
    }

    static transpose(m) {
        let n = new Matrix(m.columns, m.rows);
        for (let i = 0; i < n.rows; i++) {
            for (let j = 0; j < n.columns; j++) {
                n.data[i][j] = m.data[j][i];
            }
        }
        return n;
    }

    static multiply(a, b) {
        let matrixA = a;
        let matrixB = b;
        if (matrixA.columns !== matrixB.rows) {//check if you can do dot product
            console.error("Matrices are not the right size!");
            return;
        }
        let n = new Matrix(a.rows, b.columns);

        for (let i = 0; i < n.rows; i++) {
            for (let j = 0; j < n.columns; j++) {
                let newVal = 0;
                for (let k = 0; k < a.columns; k++) {
                    newVal += matrixA.data[i][k] * matrixB.data[k][j];
                }
                n.set(newVal, i, j);
            }
        }
        return n;
    }

    static add(a, b) {
        let matrixA = a;
        let matrixB = b;
        let n = new Matrix(a.rows, b.columns);

        for (let i = 0; i < n.rows; i++) {
            for (let j = 0; j < n.columns; j++) {
                let newVal = matrixA[i][j] * matrixB[i][j];
                n.set(newVal, i, j);
            }
        }
        return n;
    }
}