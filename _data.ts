const pagefindResultTemplate = `
    <li class="pf-result">
        <div class="pf-result-card">
            <div class="pf-result-content">
                <p class="pf-result-title">
                    <a class="pf-result-link" href ="{{ url | safeUrl }}">
                        <b> {{ meta.title }} </b>
                    </a>
                    <span style="font-size: 0.8em; color: gray;"> ({{ meta.author }}) </span>
                </p>
                <p class="pf-result-excerpt">{{+ excerpt +}}</p>
            </div>
        </div>
    </li>
`;

const buildHash = crypto.randomUUID(); // TODO: Generate hash based on content
const base = Deno.env.get("BASE_PATH") ?? "/";

export default {
    pagefindResultTemplate,
    buildHash,
    base,
};


