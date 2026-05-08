import lume from "lume/mod.ts";
import esbuild from "lume/plugins/esbuild.ts";
import text from "lume/core/loaders/text.ts";
import googleFonts from "lume/plugins/google_fonts.ts";
import pagefind from "./pagefind.ts"
import { walk } from "lume/deps/fs.ts";
import Song from "./lib/song.ts";
import relativeUrls from "lume/plugins/relative_urls.ts";

const site = lume({server: {
    debugBar: false,
}});

site.loadPages([".song"], {
    loader: text,
});

site.preprocess([".song"], (pages) => {
    for (const page of pages) {
        const song = new Song(page.data.content as string);
        page.data.title = song.title;
        page.data.author = song.author;
        page.data.content = song.html();
        page.data.lyrics = song.lyrics();
        page.data.layout = "song.vto";
    }
});

site.use(pagefind);

site.use(esbuild({
    options: {
        minify: false,
    }
}));

site.add("styles");
site.add("client_scripts");
site.add("img");

site.add("sw.js");
site.add("manifest.json");


site.use(googleFonts({
  fonts: {
    inter: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900", 
  }
}));

site.process([".json"], (pages) => {
    for (const page of pages) {
        page.text = page.text.replace(/{{\s*base\s*}}/g, page.data.base);
    }
});


site.process([".js"], (pages) => {
    for (const page of pages) {
        page.text = page.text
            .replace(/{{\s*base\s*}}/g, page.data.base)
            .replace(/{{\s*buildHash\s*}}/g, page.data.buildHash);

    }
});

site.use(relativeUrls());

site.addEventListener("afterBuild", async () => {
    const files = walk("_site");

    const urls: string[] = [];

    for await (const entry of files) {
        if (entry.isFile) {
            const url = entry.path.substring("_site/".length);
            urls.push(url);
        }
    }
    
    const indexUrls = urls.filter(url => url.endsWith("index.html")).map(url => url.substring(0, url.length - "index.html".length));
    urls.push(...indexUrls);
    Deno.writeTextFileSync("_site/cache.json", JSON.stringify(urls));
});

export default site;
