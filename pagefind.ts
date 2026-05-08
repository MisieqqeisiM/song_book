import type Site from "lume/core/site.ts";
import * as pagefind from 'pagefind';


export default (site: Site) => {
    site.process([".song"], async (songs) => {
        const index = (await pagefind.createIndex()).index!;

        for (const song of songs) {
            index.addCustomRecord({
                url: song.outputPath.replace("index.html", ""),
                content: song.data.lyrics,
                meta: {
                    title: song.data.title ?? "Untitled",
                    author: song.data.author ?? "Unknown",
                },
                language: "pl",
            });
        }

        const  { files } = await index.getFiles();
        for (const file of files) {
            const page = await site.getOrCreatePage("pagefind/" + file.path);
            page.bytes = toArrayBufferView(file.content);
        }
    });
}

function toArrayBufferView(
  arr: Uint8Array<ArrayBufferLike>
): Uint8Array<ArrayBuffer> {
  if (arr.buffer instanceof ArrayBuffer) {
    return arr as Uint8Array<ArrayBuffer>;
  }

  return new Uint8Array(new Uint8Array(arr));
}

