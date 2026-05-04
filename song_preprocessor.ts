import { Page } from "lume/core/file.ts";

export function songPreprocessor(pages: Page[]): void {
    for (const page of pages) {
        const songData = songToHtmlTable(page.data.content as string);
        page.data.content = songData.table;
        page.data.title = songData.title;
        page.data.author = songData.author;
        page.data.lyrics = songData.lyrics;
        page.data.layout = "song.vto";
    }
}

interface SongData {
    title: string;
    author: string;
    table: string;
    lyrics: string;
}

function splitIntoVerses(lines: string[]): string[][] {
    const verses: string[][] = [];
    for (const line of lines) {
        if (line.trim() === "") {
            if (verses.length === 0 || verses[verses.length - 1].length > 0) {
                verses.push([]);
            }
        } else {
            if (verses.length === 0) {
                verses.push([]);
            }
            verses[verses.length - 1].push(line);
        }
    }
    return verses;
}

function verseToHtmlTable(verse: string[]): string {
    const rows = verse.map(line => {
        if (line.trim() === "") {
            return "<tr><td colspan='2' style='height: 1em;'>&nbsp;</td></tr>";
        }

        // Match lyrics and chords
        const match = line.match(/^(.*?)\s*\[(.*?)\]\s*$/);

        if (!match) {
            return `
                <tr>
                    <td>${escapeHtml(line)}</td>
                    <td></td>
                </tr>
            `;
        }

        const lyrics = match[1].trim();
        const chordsRaw = match[2].trim();

        const chordsHtml = chordsRaw
            .split(/\s+/)
            .map(chord => escapeHtml(chord))
            .map(chord => `<span class="chord" data-original-chord="${chord}">${chord}</span>`)
            .join(" ");

        return `
            <tr>
                <td>${escapeHtml(lyrics)}</td>
                <td class="chords">${chordsHtml}</td>
            </tr>
        `;
    });

    return `
        <table>
            <tbody>
                ${rows.join("\n")}
            </tbody>
        </table>
    `;
}

function songToHtmlTable(song: string): SongData {
    let lines = song.split("\n");
    let title = "";
    let author = "";

    lines = lines.filter(line => {
        if (line.startsWith("title:")) {
            title = line.replace("title:", "").trim();
            return false;
        } else if (line.startsWith("author:")) {
            author = line.replace("author:", "").trim();
            return false;
        }
        return true;
    });

    const verses = splitIntoVerses(lines);
    const table = verses.map(verse => verseToHtmlTable(verse)).join("<br/>");
    const lyrics = extractLyrics(song);


    return { title, author, table, lyrics };
}

function extractLyrics(song: string): string {
    const lines = song.split("\n");
    const lyricsLines = lines.filter(line => !line.startsWith("title:") && !line.startsWith("author:"));
    const withoutChords = lyricsLines.map(line => line.replace(/\s*\[.*?\]\s*/g, "").trim());
    return withoutChords.join("\n");
}

// Simple HTML escaping to avoid injection issues
function escapeHtml(text: string): string {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}