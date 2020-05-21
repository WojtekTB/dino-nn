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

    addOutput(numberOfOutputs) {
        let m = new Matrix(numberNodes, this.layers[this.layers.length - 1].rows + 1);
        m.randomize();
        this.layers.push(m);
    }

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