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
            html += part.type === "paren"
                ? `<span class="paren">${escaped}</span>`
                : `<span class="chord" data-original-chord="${escaped}">${escaped}</span>`;
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

        // Check for full parenthesized group like "(F G)"
        if (/^\(.+\)$/.test(token)) {
            const inner = token.slice(1, -1).trim();
            parts.push({ type: "paren", value: "(" });
            if (inner) {
                const innerTokens = inner.split(/\s+/);
                for (const t of innerTokens) {
                    if (t) parts.push({ type: "chord", value: t });
                }
            }
            parts.push({ type: "paren", value: ")" });
            continue;
        }

        // Handle "(F" - starts with paren
        if (token.startsWith("(")) {
            parts.push({ type: "paren", value: "(" });
            const inner = token.slice(1);
            if (inner) parts.push({ type: "chord", value: inner });
        }
        // Handle "G)" - ends with paren
        else if (token.endsWith(")")) {
            const inner = token.slice(0, -1);
            if (inner) parts.push({ type: "chord", value: inner });
            parts.push({ type: "paren", value: ")" });
        }
        // Regular chord
        else {
            parts.push({ type: "chord", value: token });
        }
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
