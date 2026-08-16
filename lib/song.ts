export default class Song {
    verses: Verse[] = [];
    title: string = "";
    author: string = "";

    constructor(content: string) {
        let lines = content.split("\n");
        lines = lines.filter(line => {
            if (line.startsWith("title:")) {
                this.title = line.replace("title:", "").trim();
                return false;
            } else if (line.startsWith("author:")) {
                this.author = line.replace("author:", "").trim();
                return false;
            }
            return true;
        });
        this.verses = splitIntoVerses(lines);
    }

    lyrics(): string {
        return this.verses.map(verse => verse.lyrics()).join("\n\n");
    }

    html(): string {
        return this.verses.map(verse => verse.html()).join("<br/>");
    }
}

function splitIntoVerses(lines: string[]): Verse[] {
    const verses: Verse[] = [];
    let currentVerse: string[] = [];

    for (const line of lines) {
        if (line.trim() === "") {
            if (currentVerse.length > 0) {
                verses.push(new Verse(currentVerse));
                currentVerse = [];
            }
        } else {
            currentVerse.push(line);
        }
    }

    if (currentVerse.length > 0) {
        verses.push(new Verse(currentVerse));
    }

    return verses;
}

class Verse {
    readonly lines: Line[];

    constructor(lines: string[]) {
        this.lines = lines.map(line => new Line(line));
    }

    lyrics(): string {
        return this.lines.map(line => line.lyrics).join("\n");
    }

    html(): string {
        const linesHtml = this.lines.map(line => line.html()).join("\n");
        return `
            <table>
                <tbody>
                    ${linesHtml}
                </tbody>
            </table>
        `;
    }
}

// TODO: handle chord placement in the middle of the line, e.g. "This is a [C]line with chords [G]in the middle"
class Line {
    readonly lyrics: string;
    readonly chordParts: ChordPart[];

    constructor (content: string) {
        const match = content.match(/^(.*?)\s*\[(.*?)\]\s*$/);
        const lyrics = match ? match[1].trim() : content.trim();
        const chordsRaw = match ? match[2].trim() : "";
        this.lyrics = lyrics;
        const normalized = normalizeChords(chordsRaw);
        this.chordParts = parseChords(normalized);
    }

    html(): string {
        // Group paren with its immediately adjacent chord
        // (C) → single group of 3, (A → group of 2, B) → group of 2
        const groups: ChordPart[][] = [];
        for (const part of this.chordParts) {
            if (groups.length === 0) {
                groups.push([part]);
            } else {
                const lastGroup = groups[groups.length - 1];
                const lastPart = lastGroup[lastGroup.length - 1];
                if ((lastPart.type === "paren" && part.type === "chord") ||
                    (lastPart.type === "chord" && part.type === "paren")) {
                    if (lastPart.value === "(" && part.type === "chord" && lastGroup.length === 1) {
                        lastGroup.push(part);
                    } else if (lastPart.type === "chord" && part.value === ")" && lastGroup[0].value === "(" && lastGroup.length === 2) {
                        lastGroup.push(part);
                    } else if (lastGroup.length < 2) {
                        lastGroup.push(part);
                    } else {
                        groups.push([part]);
                    }
                } else {
                    groups.push([part]);
                }
            }
        }

        let html = "";
        for (let i = 0; i < this.chordParts.length; i++) {
            const part = this.chordParts[i];
            const escaped = escapeHtml(part.value);
            const prevPart = i > 0 ? this.chordParts[i - 1] : null;

            let needsSpace = false;
            if (i > 0) {
                if (part.type === "paren" && part.value === "(") {
                    needsSpace = true;
                } else if (part.type === "chord") {
                    needsSpace = prevPart?.type === "chord" || prevPart?.value === ")";
                }
            }

            if (needsSpace) html += " ";

            // Find which group this part belongs to
            const partGroup = groups.find(g => g.includes(part));
            if (partGroup) {
                const isFirst = partGroup[0] === part;
                const isLast = partGroup[partGroup.length - 1] === part;
                if (isFirst) {
                    html += `<span class="chord-group">`;
                }
                html += part.type === "paren"
                    ? `<span class="paren">${escaped}</span>`
                    : `<span class="chord" data-original-chord="${escaped}">${escaped}</span>`;
                if (isLast) {
                    html += `</span>`;
                }
            }
        }

        return `
            <tr>
                <td>${escapeHtml(this.lyrics)}</td>
                <td class="chords">${html}</td>
            </tr>
        `;
    }
}

interface ChordPart {
    type: "chord" | "paren";
    value: string;
}

function normalizeChords(chords: string): string {
    let result = chords;
    // Convert flat chords to sharp equivalents (German notation)
    result = result.replace(/\bBes/g, "A");
    result = result.replace(/\bEs/g, "Dis");
    result = result.replace(/\bDes/g, "Cis");
    result = result.replace(/\bAs/g, "Gis");
    result = result.replace(/\bGes/g, "Fis");
    result = result.replace(/\bes\b/g, "dis");
    result = result.replace(/\bdes\b/g, "cis");
    result = result.replace(/\bas\b/g, "gis");
    result = result.replace(/\bges\b/g, "fis");
    // Remove space after opening paren
    result = result.replace(/\(\s+/, "(");
    // Remove space before closing paren
    result = result.replace(/\s+\)/, ")");
    // Add space before opening paren if no space before it
    result = result.replace(/(\S)\(/g, "$1 (");
    // Add space after closing paren if no space after it
    result = result.replace(/\)(\S)/g, ") $1");
    // Collapse multiple spaces
    result = result.replace(/\s+/g, " ");
    return result.trim();
}

function parseChords(chords: string): ChordPart[] {
    const parts: ChordPart[] = [];
    const tokens = chords.split(/\s+/);

    for (const token of tokens) {
        if (!token) continue;
        parts.push({ type: "chord", value: token });
    }

    return parts;
}

function escapeHtml(text: string): string {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
