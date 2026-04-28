import lume from "lume/mod.ts";
import esbuild from "lume/plugins/esbuild.ts";
import text from "lume/core/loaders/text.ts";
import { songPreprocessor } from "./song_preprocessor.ts";
import pagefind from "lume/plugins/pagefind.ts";
import relativeUrls from "lume/plugins/relative_urls.ts";


let location = new URL("http://localhost:3000/");


const repo = Deno.env.get("GITHUB_REPOSITORY");
if (repo !== undefined) {
    const [owner, name] = repo.split("/");

    const isUserSite = name === `${owner}.github.io`;

    const basePath = isUserSite ? "/" : `/${name}/`;
    location = new URL(`https://${owner}.github.io${basePath}`);
}

const site = lume({
  location,
});

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
