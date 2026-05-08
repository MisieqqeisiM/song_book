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
    readonly chords: string[];

    constructor (content: string) {
        const match = content.match(/^(.*?)\s*\[(.*?)\]\s*$/);
        const lyrics = match ? match[1].trim() : content.trim();
        const chordsRaw = match ? match[2].trim() : "";
        this.lyrics = lyrics;
        this.chords = chordsRaw
            .split(/\s+/)
            .map(chord => chord.trim())
            .filter(chord => chord !== "");
    }

    html(): string {
        const chordsHtml = this.chords
            .map(chord => escapeHtml(chord))
            .map(chord => `<span class="chord" data-original-chord="${chord}">${chord}</span>`).join(" ");

        return `
            <tr>
                <td>${escapeHtml(this.lyrics)}</td>
                <td class="chords">${chordsHtml}</td>
            </tr>
        `;
    }
}

function escapeHtml(text: string): string {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}