import lume from "lume/mod.ts";
import esbuild from "lume/plugins/esbuild.ts";
import text from "lume/core/loaders/text.ts";
import { songPreprocessor } from "./song_preprocessor.ts";
import pagefind from "lume/plugins/pagefind.ts";
import relativeUrls from "lume/plugins/relative_urls.ts";

const site = lume();


site.loadPages([".song"], {
    loader: text,
});

site.preprocess([".song"], songPreprocessor);

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

export default site;
