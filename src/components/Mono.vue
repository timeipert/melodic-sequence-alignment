<template>
    <div class="seq-al">
        <div class="input-area">
            <input v-model="sequenceInput"/>
            <input v-model="patternInput"/>
        </div>
        <div class="input-area">
            <inline-melody-viewer :melodicInput="sequencePreview" :highlightedNotes="seqHighlight" :mode="0"/>
            <inline-melody-viewer :melodicInput="patternPreview" :highlightedNotes="patHighlight" :mode="0"/>
        </div>
        <table>
            <tr>
                <td v-for="char in reversedTrace">{{char.seqChar}}</td>
            </tr>
            <tr>
                <td v-for="char in reversedTrace">{{char.patChar}}</td>
            </tr>
        </table>
        <div class="options">
            <h1>Costs</h1>
            <div class="input-area">
                <v-slider label="match" :min="-5" :max="5" v-model="costs.match" thumb-label step="1" ticks></v-slider>
                <v-slider label="missmatch" :min="-5" :max="5" v-model="costs.missmatch" thumb-label step="1" ticks></v-slider>
                <v-slider label="gap" :min="-5" :max="5" v-model="costs.gap" thumb-label step="1" ticks></v-slider>
            </div>
        </div>
        <table>

            <tr>
                <th></th>

                <th v-for="seqel in sequenceTable" class="first-row">{{seqel}}</th>
            </tr>
            <tr v-for="patel, y in patternTable">

                <td class="first-column">{{patel}}</td>
                <td v-for="seqel, x in sequenceTable" :class="{'path-cell': isOnPath(x,y)}">{{matches[y][x]}}</td>
                <td class="last-column">{{y}}</td>
            </tr>
            <tr>
                <th></th>

                <th v-for="seqel, x in sequenceTable" class="last-row">{{x}}</th>
            </tr>
        </table>

    </div>
</template>
<script>
      import InlineMelodyViewer from './modules/imv'

      const costs = {gap: -1, match: 2, missmatch: -2};
      const evaluation = (charX, charY) =>
            charX == charY ? costs.match : costs.missmatch; // evaluation function
      const createMatrix = (length1, length2) =>
            [...new Array(length1)].map(a => [...new Array(length2)].map(b => 1));
      const initXAxis = (fields, value) =>
            fields.map((field, i) => (!i ? field.map(d => value) : field));
      const initYAxis = (fields, value) =>
            fields.map(xAxis =>
                  xAxis.map((yAxis, axisIndex) => (axisIndex === 0 ? value : 0))
            );
      const tracebackDirectionHash = ["d", "u", "l"];

      const F = (i, j, ma) => {
            let tracebackPoint = "";
            // console.log(ma.matches, i, j)
            // console.log(ma.sequence[i - 1], ma.pattern[j - 1])

            let matches = [
                  +ma.matches[j - 1][i - 1] +
                  evaluation(ma.sequence[i - 1], ma.pattern[j - 1]),
                  +ma.matches[j - 1][i] + costs.gap,
                  +ma.matches[j][i - 1] + costs.gap
            ];
            //console.log(i, j, matches);
            // Hole den besten Match
            let bestMatch = Math.max(...matches);

            // Falls es mehrere gleichwertige Matches gibt und der diagonale dabei ist, wähle diesen aus, sonst wähle den
            // mit dem besten Match
            if (
                  matches.filter(e => bestMatch === e).length > 1 &&
                  matches[0] === bestMatch &&
                  bestMatch > 0
            )
                  tracebackPoint = tracebackDirectionHash[0];
            else if (matches.filter(e => bestMatch === e).length == 1 && bestMatch > 0)
            // Diagonal
                  tracebackPoint = tracebackDirectionHash[matches.indexOf(bestMatch)];
            else if (bestMatch <= 0) {
                  tracebackPoint = 0;
                  bestMatch = 0;
            }

            return [bestMatch, tracebackPoint];
      };

      export default {
            components: {'inline-melody-viewer': InlineMelodyViewer},
            name: 'Mono',
            data: function () {
                  return {
                        sequenceInput: 'GdcddGaaGDEFGaFEDDEFGaGF',
                        patternInput: 'FGabcdef',
                        costs: {gap: -1, match: 2, missmatch: -2},
                        highestTraceback: {cell: [0, 0], value: 0},
                        trace: [],
                        matches: [],
                        traceback: [],
                        tracebackDirectionHash: ["d", "u", "l"]
                  }
            },
            computed: {
                  sequence: function () {
                        return this.sequenceInput.toLowerCase()
                  },
                  pattern: function () {
                        return this.patternInput.toLowerCase()
                  },
                  sequenceTable: function () {
                        return ['-'].concat(this.sequence.split(''))
                  },
                  patternTable: function () {
                        return ['-'].concat(this.pattern.split(''))
                  },
                  sequencePreview: function () {
                        return this.sequenceInput.split('')
                  },
                  patternPreview: function () {
                        return this.patternInput.split('')
                  },
                  reversedTrace: function () {
                        return this.trace.slice().reverse();
                  },
                  traceOuter: function () {
                        if (!this.trace.length) return false
                        let xHigh = this.trace[0]['seqIndex']
                        let yHigh = this.trace[0]['patIndex']
                        let xLow = this.trace[this.trace.length - 1]['seqIndex']
                        let yLow = this.trace[this.trace.length - 1]['patIndex']
                        return [xHigh, xLow, yHigh, yLow]
                  },
                  seqHighlight: function () {
                        if (!this.traceOuter) return []
                        return [...new Array(this.traceOuter[0] - this.traceOuter[1] + 1)].map((e, i) => i + this.traceOuter[1] - 1)
                  },
                  patHighlight: function () {
                        if (!this.traceOuter) return []
                        return [...new Array(this.traceOuter[2] - this.traceOuter[3] + 1)].map((e, i) => i + this.traceOuter[3] - 1)
                  }
            },
            methods: {
                  initalizeMatrix: function () {
                        this.matches = this.initXAxis(this.initYAxis(this.matches, 0), 0);
                        this.traceback = this.initXAxis(this.initYAxis(this.matches, 0), 0);
                        this.traceback[0][0] = 0;
                  },
                  computeScore: function () {
                        const tracebackMatrix = this.traceback;
                        this.traceback = tracebackMatrix.map((row, yIndex) => {
                              if (yIndex === 0) return row;
                              return row.map((element, xIndex) => {

                                    if (xIndex === 0) return element;
                                    let field = this.F(xIndex, yIndex);
                                    if (this.highestTraceback["value"] <= field[0]) {
                                          this.highestTraceback["value"] = field[0];
                                          this.highestTraceback["cell"] = [xIndex, yIndex];
                                    }
                                    this.matches[yIndex][xIndex] = field[0]; // match
                                    return field[1]; // traceback
                              });
                        });
                  },
                  getTrace: function () {
                        let it = 0;
                        let activeCell = this.highestTraceback["cell"];
                        while (this.traceback[activeCell[1]][activeCell[0]] !== 0) {
                            /*console.log(
                             "activeCell: %s - %s, %s",
                             activeCell[0],
                             activeCell[1],
                             this.traceback[activeCell[1]][activeCell[0]]
                             );*/

                              if (it > 20) break;
                              it += 1;
                              if (this.traceback[activeCell[1]][activeCell[0]] === "d") {
                                    this.trace.push({
                                          seqChar: this.sequence[activeCell[0] - 1],
                                          patChar: this.pattern[activeCell[1] - 1],
                                          seqIndex: activeCell[0],
                                          patIndex: activeCell[1]
                                    });
                                    activeCell[0] -= 1;
                                    activeCell[1] -= 1;
                              } else if (this.traceback[activeCell[1]][activeCell[0]] === "u") {
                                    this.trace.push({
                                          seqChar: "-",
                                          patChar: this.pattern[activeCell[1] - 1],
                                          seqIndex: activeCell[0],
                                          patIndex: activeCell[1]
                                    });
                                    activeCell[1] -= 1;
                              } else if (this.traceback[activeCell[1]][activeCell[0]] === "l") {
                                    this.trace.push({
                                          seqChar: this.sequence[activeCell[0] - 1],
                                          patChar: "-",
                                          seqIndex: activeCell[0],
                                          patIndex: activeCell[1]
                                    });
                                    activeCell[0] -= 1;
                              }
                        }
                  },
                  buildSW: function () {
                        this.trace = [];
                        this.highestTraceback = {cell: [0, 0], value: 0};
                        this.matches = createMatrix(this.pattern.length + 1, this.sequence.length + 1);
                        this.traceback = createMatrix(this.pattern.length + 1, this.sequence.length + 1);
                        this.initalizeMatrix();
                        this.computeScore();
                        this.getTrace();
                  },

                  isOnPath: function (x, y) {
                        //console.log(x,y)
                        return this.trace.filter(e => e['seqIndex'] === x && e['patIndex'] === y).length > 0
                  },
                  evaluation: function (charX, charY) {
                        return charX == charY ? +this.costs.match : +this.costs.missmatch; // evaluation function
                  },

                  createMatrix: function (length1, length2) {
                        return [...new Array(length1)].map(a => [...new Array(length2)].map(b => 1));
                  },
                  initXAxis: function (fields, value) {
                        return fields.map((field, i) => (!i ? field.map(d => value) : field));
                  },
                  initYAxis: function (fields, value) {
                        return fields.map(xAxis =>
                              xAxis.map((yAxis, axisIndex) => (axisIndex === 0 ? value : 0))
                        );
                  },

                  F: function (i, j) {
                        let tracebackPoint = "";
                        // console.log(ma.matches, i, j)
                        // console.log(ma.sequence[i - 1], ma.pattern[j - 1])

                        let matches = [
                              +this.matches[j - 1][i - 1] +
                              this.evaluation(this.sequence[i - 1], this.pattern[j - 1]),
                              +this.matches[j - 1][i] + (+this.costs.gap),
                              +this.matches[j][i - 1] + (+this.costs.gap)
                        ];
                        //console.log(i, j, matches);
                        // Hole den besten Match
                        let bestMatch = Math.max(...matches);

                        // Falls es mehrere gleichwertige Matches gibt und der diagonale dabei ist, wähle diesen aus, sonst wähle den
                        // mit dem besten Match
                        if (
                              matches.filter(e => bestMatch === e).length > 1 &&
                              matches[0] === bestMatch &&
                              bestMatch > 0
                        )
                              tracebackPoint = this.tracebackDirectionHash[0];
                        else if (matches.filter(e => bestMatch === e).length == 1 && bestMatch > 0)
                        // Diagonal
                              tracebackPoint = this.tracebackDirectionHash[matches.indexOf(bestMatch)];
                        else if (bestMatch <= 0) {
                              tracebackPoint = 0;
                              bestMatch = 0;
                        }

                        return [bestMatch, tracebackPoint];
                  }

            },
            created: function () {
                  this.buildSW()
            },
            watch: {
                  'pattern': function () {
                        this.buildSW()
                  },
                  'sequence': function () {
                        this.buildSW()
                  },
                  'costs': {
                        handler: function () {
                              this.buildSW()
                        },
                        deep: true
                  }

            }
      }
</script>
<style scoped>
    body {
        background: #fafafa;
    }

    table {
        width: 90%;
        margin: 30px auto;
        background: #b0bec5;
        box-shadow: 3px 3px 5px #000;
        border-collapse: separate;
        border-spacing: 0;
    }

    td,
    th {
        padding: 5px;
        text-align: center;
    }

    .first-column,
    .first-row,
    .last-column,
    .last-row {
        background: #78909C;
        color: #ECEFF1;
        font-weight: bold;
    }

    .first-column {
        border-right: 1px solid #aaa;
    }

    .first-row {
        border-bottom: 1px solid #aaa;
    }

    .last-column {
        border-left: 1px solid #aaa;
    }

    .last-row {
        border-top: 1px solid #aaa;
    }

    .input-area {
        display: flex;
        justify-content: space-around;
    }

    input {
        margin: 10px 0;
        width: 40%;
        padding: 20px;
        box-shadow: 3px 3px 20px #000;
        border: 0;
    }

    .path-cell {
        background: red;
    }

    .align-string {
        display: flex;
        width: 70%;
        justify-content: center;
        margin: 30px auto;

    }

    .align-string table {
        width: auto;
        margin: 0;
        box-shadow: none;
        height: 100px;

    }

    .align-string .before tr td {
        text-align: right;
    }

    .align-string .after tr td {
        text-align: left;
    }

    .inner-table {
        height: auto !important;
    }

    .options {
        margin: auto;
        width: 70%;
        text-align:center;
    }
</style>
