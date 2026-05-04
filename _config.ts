import lume from "lume/mod.ts";
import esbuild from "lume/plugins/esbuild.ts";
import text from "lume/core/loaders/text.ts";
import { songPreprocessor } from "./song_preprocessor.ts";
import pagefind from "lume/plugins/pagefind.ts";
import relativeUrls from "lume/plugins/relative_urls.ts";
import googleFonts from "lume/plugins/google_fonts.ts";

const base = Deno.env.get("BASE_PATH") ?? "/";

const site = lume();

site.loadPages([".song"], {
    loader: text,
});

site.preprocess([".song"], songPreprocessor);

site.preprocess("*", (pages) => {
    for (const page of pages) {
        page.data.base = base;
    }
});

site.use(esbuild({
    options: {
        minify: false,
    }
}));
site.add("transpose.ts");
site.add("main.ts");
site.add("searchbar.ts");
site.add("song.css");
site.add("sw.js");
site.add("manifest.json");
site.add("img");

site.use(pagefind());
site.use(relativeUrls());
site.use(googleFonts({
  fonts: "https://fonts.googleapis.com/css2?family=Noto+Sans:ital,wdth,wght@0,62.5,100..900;1,62.5,100..900"
}));

site.process([".json"], (pages) => {
    for (const page of pages) {
        page.text = page.text.replace(/{{\s*base\s*}}/g, base);
    }
});

site.process([".js"], (pages) => {
    for (const page of pages) {
        page.text = page.text.replace(/{{\s*base\s*}}/g, base);
    }
});

site.addEventListener("afterBuild", () => {
    const urls = site.pages.map(page => page.outputPath)
        .map(path => base + path.substring(1));
    const indexUrls = urls.filter(url => url.endsWith("index.html")).map(url => url.substring(0, url.length - "index.html".length));
    urls.push(...indexUrls);
    Deno.writeTextFileSync("_site/cache.json", JSON.stringify(urls));
});

export default site;
