const transposeValueElement = document.getElementById("transpose-value") as HTMLElement;
const transposeUpButton = document.getElementById("transpose-up") as HTMLButtonElement;
const transposeDownButton = document.getElementById("transpose-down") as HTMLButtonElement;

const chordElements = document.querySelectorAll(".chord");

let transposeValue = 0;

function updateTransposeValue(newValue: number) {
    transposeValue = newValue;
    transposeValueElement.innerText = getTransposeValueString();
    chordElements.forEach(chordElement => {
        const originalChord = chordElement.getAttribute("data-original-chord");
        if (originalChord) {
            const transposedChord = transposeChord(originalChord, transposeValue);
            chordElement.textContent = transposedChord;
        }
    });
}

function getTransposeValueString(): string {
    return transposeValue > 0 ? `+${transposeValue}` : transposeValue.toString();
}

const minorNoteNames = ["a", "b", "h", "c", "cis", "d", "dis", "e", "f", "fis", "g", "gis"];
const majorNoteNames = ["A", "B", "H", "C", "Cis", "D", "Dis", "E", "F", "Fis", "G", "Gis"];

const sortedMinor = [...minorNoteNames].sort((a, b) => b.length - a.length);
const sortedMajor = [...majorNoteNames].sort((a, b) => b.length - a.length);

const minorNoteRegex = new RegExp(`(${sortedMinor.join("|")})`, "g");
const majorNoteRegex = new RegExp(`(${sortedMajor.join("|")})`, "g");

function getNotePlacement(chord: string): { n: number, start: number, end: number, major: boolean }[] {
    const placements: { n: number, start: number, end: number, major: boolean }[] = [];

    for (const match of chord.matchAll(minorNoteRegex)) {
        const start = match.index!;
        const end = start + match[0].length;
        placements.push({ n: minorNoteNames.indexOf(match[0]), start, end, major: false });
    }

    for (const match of chord.matchAll(majorNoteRegex)) {
        const start = match.index!;
        const end = start + match[0].length;
        placements.push({ n: majorNoteNames.indexOf(match[0]), start, end, major: true });
    }

    return placements;
}


function transposeChord(chord: string, semitones: number): string {
    const placements = getNotePlacement(chord);
    placements.sort((a, b) => b.start - a.start);

    for (const { n, start, end, major } of placements) {
        if (major) {
            const newN = (n + semitones) % 12;
            chord = chord.slice(0, start) + majorNoteNames[newN] + chord.slice(end);
        } else {
            const newN = (n + semitones) % 12;
            chord = chord.slice(0, start) + minorNoteNames[newN] + chord.slice(end);
        }
    }
    return chord;
}

transposeUpButton.addEventListener("click", () => {
    let newTransposeValue = transposeValue + 1;
    if (newTransposeValue == 12)
        newTransposeValue = 0;
    updateTransposeValue(newTransposeValue);
});

transposeDownButton.addEventListener("click", () => {
    let newTransposeValue = transposeValue - 1;
    if (newTransposeValue == -1)
        newTransposeValue = 11;
    updateTransposeValue(newTransposeValue);
});