#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectDirectory = path.dirname(scriptDirectory);
const archiveDirectory = path.join(projectDirectory, "_archive", "distill-posts");
const postsDirectory = path.join(projectDirectory, "posts");

function frontMatterValue(source, key) {
  const frontMatter = source.match(/^---\s*\n([\s\S]*?)\n---/);
  if (!frontMatter) {
    throw new Error("Missing front matter");
  }

  const match = frontMatter[1].match(
    new RegExp(`^${key}:\\s*(?:"([^"]*)"|'([^']*)'|([^\\n]+))\\s*$`, "m"),
  );
  if (!match) {
    throw new Error(`Missing ${key} in front matter`);
  }

  return (match[1] ?? match[2] ?? match[3]).trim();
}

function articleBody(source) {
  const match = source.match(
    /<div class="d-article">\s*([\s\S]*?)\s*<!--radix_placeholder_article_footer-->/,
  );
  if (!match) {
    throw new Error("Could not find the rendered article body");
  }

  return match[1]
    .replace(
      /<div class="sourceCode" id="cb1"><pre\s+class="sourceCode r distill-force-highlighting-css"><code class="sourceCode r"><\/code><\/pre><\/div>\s*$/,
      "",
    )
    .trim();
}

function repairHistoricalMarkup(slug, body) {
  if (slug === "2022-04-23-inf-ecologica-2") {
    return body
      .replace(
        "<p>(Se puede hacer click en el mapa.)</p>",
        '<div id="container" style="min-height: 640px;"></div>\n<p>(Se puede hacer click en el mapa.)</p>',
      )
      .replace(
        "<p>Modelo:",
        '<div class="interactive-map-layout">\n<div class="interactive-map-sidebar">\n<p>Modelo:',
      )
      .replace(
        '<div id="container" style="min-height: 640px;"></div>',
        '</div>\n<div class="interactive-map-panel">\n<div id="container" style="min-height: 640px;"></div>',
      )
      .replace(
        "<p>(Se puede hacer click en el mapa.)</p>",
        '<p class="map-note">(Se puede hacer click en el mapa.)</p>\n</div>\n</div>',
      )
      .replace(
        `    plotOptions: { map: { events: { click: function(e) {
        for(i in keys) if(keys[i] == e.point['hc-key']) prov = i;
        fill_tables();      
    }}}},
`,
        `    plotOptions: {
        map: {
            point: {
                events: {
                    click: function() {
                        for(i in keys) if(keys[i] == this['hc-key']) prov = i;
                        fill_tables();
                    }
                }
            }
        }
    },
`,
      )
      .replace(
        `    $("#provincia option[value="+prov+"]").attr('selected', 'selected');`,
        `    $("#provincia").val(prov);`,
      )
      .replace(
        `$("#provincia").change(function() {
    prov = $("#provincia").val();
    fill_tables();
});
`,
        `$("#provincia").change(function() {
    prov = $("#provincia").val();
    fill_tables();
});
$("#container").on("click", ".highcharts-point", function() {
    var class_name = this.getAttribute("class") || "";
    var key_match = class_name.match(/highcharts-key-(ar-[a-z]{2})/);
    if(!key_match) return;
    for(i in keys) if(keys[i] == key_match[1]) prov = i;
    fill_tables();
});
`,
      );
  }

  if (slug === "2022-04-23-voto-provincia") {
    return body
      .replace(
        /(<p>Distribución de votos[\s\S]*?<\/p>)\s*<div id="hist">\s*<\/div>\s*<div id="tabla">\s*<\/div>/,
        `<div class="interactive-map-layout">
<div class="interactive-map-sidebar">
$1
<div id="hist"></div>
<div id="tabla"></div>
</div>
<div class="interactive-map-panel">
<div id="mapa"></div>
</div>
</div>`,
      )
      .replace(
        `    plotOptions: { map: { events: { click: function(e) {
        for(i in keys) if(keys[i] == e.point['hc-key']) prov = i;
        restart();      
    }}}},
`,
        `    plotOptions: {
        map: {
            point: {
                events: {
                    click: function() {
                        for(i in keys) if(keys[i] == this['hc-key']) prov = i;
                        restart();
                    }
                }
            }
        }
    },
`,
      )
      .replace(
        `    $("#provincia option[value="+prov+"]").attr('selected', 'selected');`,
        `    $("#provincia").val(prov);`,
      )
      .replace(
        `    html += '</table><div id="mapa" stye="height:1000px"></div>';
    $("#container").html(html);`,
        `    html += '</table>';
    $("#tabla").html(html);`,
      );
  }

  return body;
}

function repairHistoricalLinks(body) {
  const replacements = new Map([
    [
      "http://www.juventudinformada.com.ar/",
      "https://web.archive.org/web/20161119172902/http://www.juventudinformada.com.ar/",
    ],
    [
      "http://jornadasdesociologia2015.sociales.uba.ar/wp-content/uploads/ponencias/1707_141.pdf",
      "https://www.aacademica.org/000-061/1156.pdf",
    ],
    [
      "http://www.hoy.com.py/politica/en-encarnacion-oposicion-gano-por-100-votos-aclaran",
      "https://www.hoy.com.py/politica/en-encarnacion-oposicion-gano-por-100-votos-aclaran/amp/",
    ],
    [
      "http://www.hoy.com.py/politica/lugo-piensa-dejar-frente-guasu-para-negociar-con-todos-la-reeleccin",
      "https://www.hoy.com.py/politica/lugo-piensa-dejar-frente-guasu-para-negociar-con-todos-la-reeleccin/amp/",
    ],
    [
      "http://gking.harvard.edu/files/abs/binom-abs.shtml",
      "https://gking.harvard.edu/publication/binomial-beta-hierarchical-models-for-ecological-inference/",
    ],
    [
      "http://gking.harvard.edu/files/abs/rosen-abs.shtml",
      "https://gking.harvard.edu/publication/bayesian-and-frequentist-inference-for-ecological-inference-the-rxc-case/",
    ],
    [
      "http://gking.harvard.edu/files/gking/files/em.pdf?m=1360038990",
      "https://gking.harvard.edu/publication/bayesian-and-frequentist-inference-for-ecological-inference-the-rxc-case/",
    ],
    [
      "http://ar.bastiondigital.com/notas/los-gatos-se-estaban-peleando",
      "https://web.archive.org/web/20180521222206/http://ar.bastiondigital.com/notas/los-gatos-se-estaban-peleando",
    ],
    [
      "http://rpackages.ianhowson.com/cran/eiPack/",
      "https://CRAN.R-project.org/package=eiPack",
    ],
    [
      "http://www.lanacion.com.ar/1848689-como-fue-el-resultado-del-ballottage-en-la-escuela-donde-votaste",
      "https://www.lanacion.com.ar/politica/como-fue-el-resultado-del-ballottage-en-la-escuela-donde-votaste-nid1848689/",
    ],
    [
      "http://gking.harvard.edu/files/abs/ecinf04-abs.shtml",
      "https://gking.harvard.edu/files/ecinf04.pdf",
    ],
    [
      "http://resultados.tsje.gov.py/divulgacion.html",
      "https://web.archive.org/web/20211011102335/https://resultados.tsje.gov.py/divulgacion.html",
    ],
    [
      "https://es.wikipedia.org/wiki/Anexo:Ciudades_de_Paraguay_por_poblaci%C3%B3",
      "https://es.wikipedia.org/wiki/Anexo:Ciudades_de_Paraguay_por_poblaci%C3%B3n",
    ],
    [
      "http://www.imomath.com/index.php?options=249&amp;lmm=1",
      "https://artofproblemsolving.com/wiki/index.php/Burnside%27s_Lemma",
    ],
    [
      "http://web.cs.elte.hu/~csiki/generating_functions_Novakovic.pdf",
      "https://web.archive.org/web/20171215035718/http://web.cs.elte.hu/~csiki/generating_functions_Novakovic.pdf",
    ],
    [
      "https://blogs.sch.gr/sotskot/files/2011/01/Vieta_Jumping.pdf",
      "https://en.wikipedia.org/wiki/Vieta_jumping",
    ],
  ]);

  let repaired = body;
  for (const [oldUrl, newUrl] of replacements) {
    repaired = repaired.replaceAll(oldUrl, newUrl);
  }

  return repaired.replace(
    '<a href="https://t.co/nxuPmn5pAR">acá</a>',
    "en un archivo que ya no está disponible",
  );
}

fs.mkdirSync(postsDirectory, { recursive: true });

for (const slug of fs.readdirSync(archiveDirectory).sort()) {
  const archivePost = path.join(archiveDirectory, slug);
  if (!fs.statSync(archivePost).isDirectory()) {
    continue;
  }

  const files = fs.readdirSync(archivePost);
  const rmdName = files.find((name) => name.endsWith(".Rmd"));
  const htmlName = files.find((name) => name.endsWith(".html"));
  if (!rmdName || !htmlName) {
    throw new Error(`Missing source files for ${slug}`);
  }

  const rmd = fs.readFileSync(path.join(archivePost, rmdName), "utf8");
  const html = fs.readFileSync(path.join(archivePost, htmlName), "utf8");
  const title = frontMatterValue(rmd, "title");
  const date = frontMatterValue(rmd, "date");
  const body = repairHistoricalLinks(
    repairHistoricalMarkup(slug, articleBody(html)),
  );
  const outputDirectory = path.join(postsDirectory, slug);
  const canonicalUrl = `https://juandodyk.github.io/posts/${slug}/`;
  const qmd = `---
title: ${JSON.stringify(title)}
date: ${date}
date-format: "MMMM D, YYYY"
canonical-url: ${JSON.stringify(canonicalUrl)}
---

::: {.math-trigger aria-hidden="true"}
$0$
:::

\`\`\`{=html}
<div class="historical-note">
${body}
</div>
\`\`\`
`;

  fs.mkdirSync(outputDirectory, { recursive: true });
  fs.writeFileSync(path.join(outputDirectory, "index.qmd"), qmd);
}

console.log(`Migrated ${fs.readdirSync(postsDirectory).length} historical notes.`);
