<template>
    <svg :width="svg.width" :height="svg.height"
         :view-box.camel="'0 0 '+system.width+' '+system.height">
        <!-- rastral -->
        <line v-if="mode!=2" v-for="rastralLine in rastralLines" x1="0" :x2="system.width" :y1="rastralLine['y']"
              :y2="rastralLine['y']" :stroke-width="rastral['stroke-width']" stroke="black"/>
        <!-- note heads -->
        <ellipse v-if="mode == 0" v-for="note, noteIndex in notePositions" :cx="note.x" :cy="note.y" rx="4.40" ry="6.6"
                 :transform="'rotate(69,'+note.x+','+note.y+')'"
                 :class="{'note': true, 'highlighted': highlightNote(noteIndex)}"/>
        <!-- interval lines -->
        <line v-if="mode==1" v-for="linePos in intLinePositions" :x1="linePos.x1" :x2="linePos.x2" :y1="linePos.y1"
              :y2="linePos.y2" stroke="#000" stroke-width="5"/>
        <!-- direction arrows -->
        <g v-if="mode==2">
            <g v-for="dir, index in directions"
               :transform="'rotate('+dir+','+(getX(index, noteMargin,horizontalOffset)+8)+', '+(+ system['vertical-margin'] + rastral.size*3)+')'">
                <line :x1="getX(index, noteMargin,
horizontalOffset)"
                      :x2="getX(index, noteMargin,
horizontalOffset)+20"
                      :y1="system['vertical-margin'] + rastral.size*3"
                      :y2="system['vertical-margin'] + rastral.size*3" stroke="#000"/>
                <line :x1="getX(index, noteMargin,
horizontalOffset)+10"
                      :x2="getX(index, noteMargin,
horizontalOffset)+20"
                      :y1="system['vertical-margin'] + rastral.size*3-5"
                      :y2="system['vertical-margin'] + rastral.size*3" stroke="#000"/>
                <line :x1="getX(index, noteMargin,
horizontalOffset)+10"
                      :x2="getX(index, noteMargin,
horizontalOffset)+20"
                      :y1="system['vertical-margin'] + rastral.size*3+5"
                      :y2="system['vertical-margin'] + rastral.size*3" stroke="#000"/>
            </g>
        </g>
        <!-- ledger lines -->
        <g v-if="mode == 0">
            <line v-for="ledgerLine in ledgerLines" :x1="ledgerLine.x1" :x2="ledgerLine.x2" :y1="ledgerLine.y1"
                  :y2="ledgerLine.y2" stroke="black"/>
        </g>
        <!-- scrollbar -->
        <g v-if="maxNotesInView <= melodicInput.length">
            <rect :width='system.width-1' height='9' :transform='"translate(1,"+(system.height-9)+")"' stroke="#ccc"
                  stroke-width="1" fill="transparent"/>
            <rect :id='"scrollbar"+system["id"]' :width='scrollerWidth' height='5'
                  :transform='"translate("+(scrollbarXOffset+2)+","+(system.height-7)+")"' fill="#666"/>
        </g>
    </svg>
</template>
<script>
      const interact = require('interactjs')

      export default {
            name: 'InlineMelodyViewer',
            props: {
                  'melodicInput': {
                        type: Array,
                        default: _ => []
                  },
                  'highlightedNotes': {
                        type: Array,
                        default: _ => []
                  },
                  'mode': {
                        type: Number,
                        default: _ => 0
                  }
            },
            data: function () {
                  return {
                        svg: {width: 400, height: 80},
                        system: {
                              id: Math.ceil(Math.random() * 10000),
                              width: 500,
                              height: 100,
                              'vertical-margin': 14,
                              'horizontal-margin': 0,
                              'arrow-width': 2
                        },
                        noteOffset: 0,
                        rastral: {size: 10, 'stroke-width': 1},
                        systema: {
                              0: 'f',
                              1: 'e',
                              2: 'd',
                              3: 'c',
                              4: 'b',
                              5: 'a',
                              6: 'G',
                              7: 'F',
                              8: 'E',
                              9: 'D',
                              10: 'C',
                              11: 'B',
                              12: 'A',
                              13: 'GG'
                        },
                        scrollbarXOffset: 0,
                        scroll: {x: 0, y: 0}
                  }
            },
            computed: {
                  noteMargin: function () {
                        return 20 + this.scroll['y']
                  },
                  scrollerWidth: function () {
                        return (this.system['width'] - 3) * this.notesInView
                  },
                  // horizontal note offset in px
                  horizontalOffset: function () {
                        return -this.noteOffset * this.noteMargin
                  },
                  // percent of notes in view
                  notesInView: function () {
                        return (
                              this.system['width'] /
                              (this.noteMargin * this.melodicInput.length)
                        )
                  },
                  // number of notes in view
                  maxNotesInView: function () {
                        return Math.floor(this.system['width'] / 20)
                  },
                  maxOffset: function () {
                        return Math.ceil((this.melodicInput.length + 1) * (1 - this.notesInView))
                  },
                  notes: function () {
                        return this.melodicInput.map(pitch =>
                              Object.values(this.systema).indexOf(pitch)
                        )
                  },
                  rastralLines: function () {
                        return [...new Array(5)].map((a, index) => ({
                              y: index * this.rastral.size + this.system['vertical-margin']
                        }))
                  },
                  notePositions: function () {
                        return this.notes.map((note, index) => ({
                              x: this.getX(index, this.noteMargin, this.horizontalOffset),
                              y: this.getY(note, this.rastral.size, this.system['vertical-margin'])
                        }))
                  },
                  intLinePositions: function () {
                        return this.notes
                              .map((note, index) => {
                                    if (index === 0) return false
                                    return {
                                          x1: this.getX(
                                                index - 1,
                                                this.noteMargin,
                                                this.horizontalOffset
                                          ) + 5,
                                          x2: this.getX(
                                                index,
                                                this.noteMargin,
                                                this.horizontalOffset
                                          ),
                                          y1: this.getY(
                                                this.notes[index - 1],
                                                this.rastral.size,
                                                this.system['vertical-margin']
                                          ),
                                          y2: this.getY(
                                                note,
                                                this.rastral.size,
                                                this.system['vertical-margin']
                                          )
                                    }
                              })
                              .filter(e => e !== false)
                  },
                  directions: function () {
                        return this.notes
                              .map((note, index) => {
                                    if (index === 0) return false
                                    let deg = this.notes[index - 1] < note ? 90 : -90
                                    if (this.notes[index - 1] === note) deg = 0
                                    return deg
                              })
                              .filter(e => e !== false)
                  },
                  ledgerLines: function () {
                        const outerNotes = this.notes
                              .map((note, index) => [note, index])
                              .filter(note => note[0] > 9 || note[0] < -1)

                        if (!outerNotes.length) return []
                        return outerNotes
                              .map(note => {
                                    // note[0]: Pitch, note[1]: Index
                                    let result = []
                                    let yPosition = note[0]
                                    let i = 0
                                    while (yPosition >= 10 || (yPosition <= -2 && i < 20)) {
                                          i++
                                          if (yPosition >= 10) {
                                                if (yPosition % 2) yPosition -= 1 // to even
                                          } else {
                                                if (yPosition % 2) yPosition += 1
                                          }
                                          result.push({
                                                x1: this.getX(
                                                      note[1],
                                                      this.noteMargin,
                                                      this.horizontalOffset
                                                ) - 10,
                                                y1: this.getY(
                                                      yPosition,
                                                      this.rastral.size,
                                                      this.system['vertical-margin']
                                                ),
                                                x2: this.getX(
                                                      note[1],
                                                      this.noteMargin,
                                                      this.horizontalOffset
                                                ) + 10,
                                                y2: this.getY(
                                                      yPosition,
                                                      this.rastral.size,
                                                      this.system['vertical-margin']
                                                )
                                          })
                                          if (yPosition >= 10) yPosition -= 2
                                          else yPosition += 2
                                    }
                                    return result
                              })
                              .reduce(function (a, b) {
                                    return a.concat(b)
                              })
                  }
            },
            methods: {
                  highlightNote (noteIndex) {
                        return this.highlightedNotes.indexOf(noteIndex) !== -1
                  },
                  getX: function (noteIndex, horizontalNoteSpace, horizontalMargin) {
                        return noteIndex * horizontalNoteSpace + horizontalMargin + 20
                  },
                  getY: function (note, rastralSize, verticalMargin) {
                        return note * (rastralSize / 2) + verticalMargin
                  }
            },
            watch: {
                  melodicInput: function () {
                        if (this.maxNotesInView >= this.melodicInput.length) {
                              this.noteOffset = 0
                        }
                  }
            },
            mounted () {
                  const vuethis = this
                  interact('#scrollbar' + this.system['id']).draggable({
                        // enable inertial throwing
                        inertia: true,
                        onmove: function (event) {
                              // call this function on every move

                              const parentWidth = vuethis.system['width']
                              const elementWidth = vuethis.scrollerWidth
                              const distanceX = event.dx
                              const distanceY = event.dy * 0.7

                              if (vuethis.scrollbarXOffset < 1) vuethis.scrollbarXOffset = 0
                              else if (vuethis.scrollbarXOffset > parentWidth - elementWidth) {
                                    vuethis.scrollbarXOffset = parentWidth - elementWidth
                              }
                              vuethis.scrollbarXOffset = vuethis.scrollbarXOffset + distanceX
                              vuethis.noteOffset =
                                    vuethis.maxOffset *
                                    (vuethis.scroll['x'] / (parentWidth - elementWidth))
                              if (
                                    distanceX > 0 &&
                                    vuethis.scroll['x'] >= parentWidth - elementWidth
                              ) {
                                    vuethis.scroll['x'] = parentWidth - elementWidth
                              } else if (distanceX < 0 && vuethis.scroll['x'] <= 0) {
                                    vuethis.scroll['x'] = 0
                              } else {
                                    vuethis.scroll['x'] += distanceX
                              }
                              if (event.shiftKey) {
                                    vuethis.scroll['y'] += distanceY
                                    if (distanceY > 0 && vuethis.scroll['y'] >= 5) {
                                          vuethis.scroll['y'] = 5
                                    }
                                    if (distanceY < 0 && vuethis.scroll['y'] <= -8) {
                                          vuethis.scroll['y'] = -8
                                    }
                              }
                        }
                  })
            }
      }
</script>
<style>
    .scrollbar {
        transition: transform 0.05s ease;
    }

    .note {
        fill: black;
    }

    .highlighted {
        fill: red !important;
    }
</style>
