#!/usr/bin/env node
// Coteja una página legal construida (dist/) contra su fuente en docs/legal/fuente/
// y cuenta las diferencias.
//
// Uso (después de `npm run build`):
//   node scripts/cotejo-legal.mjs terminos
//   node scripts/cotejo-legal.mjs politica
//   node scripts/cotejo-legal.mjs terminos --dist=/ruta/a/otra/copia/de/dist
//
// Qué se compara:
//   1. Dist al día: si el .astro de la página, o cualquiera de los archivos de los que
//      sale su texto (`origen`: el componente y el dato de los Términos), es más nuevo que
//      su index.html en dist, el cotejo se niega (código 2) y pide `npm run build`.
//   2. Texto: el cuerpo es el <div> cuya clase incluye el token exacto `legal` (no
//      `legal-x`). Se quitan las etiquetas, se decodifican las entidades y se colapsan
//      los espacios, así que los saltos de línea del PDF no cuentan. Palabra por palabra.
//      La primera línea de la fuente (el título) se compara contra el <h1>, sin
//      distinguir mayúsculas. Las viñetas «•» no cuentan; «a)» y «12.1.» sí.
//   3. Estructura: dentro del bloque `legal`, los h2 y h3 (texto y orden), y la cantidad
//      de ul, li y ol, contra lo que se deduce de la fuente: títulos «N. …» = h2,
//      «N.N. …» = h3, y cada corrida de viñetas «•» o incisos «a)» = un ul con un li por
//      ítem. Un h2 convertido en p, o una lista en párrafos, da diferencia.
//      Subtítulo sin número: una línea de la fuente que empieza con «### » es un h3. El
//      script quita esos tres caracteres y el espacio antes de comparar el texto (la marca
//      no es parte del texto de la Política) y compara el resto de la línea con el texto
//      del h3 de la página, en el mismo orden que los h3 numerados.
//   4. Contacto: cada href mailto: debe ser un correo de la fuente y cada tel: debe ser
//      un teléfono de la fuente, por dígitos completos (incluido el 506). En el texto, el
//      teléfono se compara solo por dígitos (+506 8675-2713 = +506 8675 2713).
//   5. Índice (el <nav> con aria-label «Índice…»): cada enlace #id debe apuntar a un h2
//      existente, con el mismo texto; cada h2 debe tener un enlace; y la página no puede
//      repetir ids.
//
// Salida: una línea por diferencia y el total. Código de salida 0 si hay 0 diferencias,
// 1 si hay alguna, 2 si falta un archivo, el bloque `legal`, o el dist está viejo.

import { readFileSync, existsSync, statSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const PAGINAS = {
  terminos: {
    ruta: 'terminos-y-condiciones',
    astro: 'src/pages/terminos-y-condiciones.astro',
    // Otros archivos que fabrican el HTML de la página (la fuente única de los Términos).
    origen: ['src/components/TerminosCuerpo.astro', 'src/data/terminos.ts'],
    fuente: 'docs/legal/fuente/tyc-2026-10.txt',
    indice: true, // la página debe traer el índice de anclas
    // Control de la deducción desde la fuente: si cambia, el script avisa en vez de callar.
    esperado: { h2: 25, h3: 6, ul: 6, li: 34 },
  },
  politica: {
    ruta: 'politica-de-privacidad',
    astro: 'src/pages/politica-de-privacidad.astro',
    fuente: 'docs/legal/fuente/politica-2026-07.txt',
    indice: false,
  },
};

const args = process.argv.slice(2);
const clave = args.find((x) => !x.startsWith('--'));
const optDist = args.find((x) => x.startsWith('--dist='));
if (!PAGINAS[clave]) {
  console.error(`Uso: node scripts/cotejo-legal.mjs <${Object.keys(PAGINAS).join('|')}> [--dist=DIR]`);
  process.exit(2);
}
const pagina = PAGINAS[clave];
const rutaHtml = join(optDist ? resolve(optDist.slice(7)) : resolve(raiz, 'dist'), pagina.ruta, 'index.html');
const rutaAstro = resolve(raiz, pagina.astro);
const rutaFuente = resolve(raiz, pagina.fuente);
const etiqueta = (r) => r.replace(raiz + '/', '');

for (const r of [rutaHtml, rutaFuente]) {
  if (!existsSync(r)) {
    console.error(`No existe ${etiqueta(r)}${r === rutaHtml ? ' (corré antes `npm run build`)' : ''}`);
    process.exit(2);
  }
}
// 1. Dist viejo: la página o algo de lo que la fabrica cambió después de construir.
for (const r of [rutaAstro, ...(pagina.origen ?? []).map((x) => resolve(raiz, x))]) {
  if (existsSync(r) && statSync(r).mtimeMs > statSync(rutaHtml).mtimeMs) {
    console.error(
      `${etiqueta(r)} es más nuevo que ${etiqueta(rutaHtml)}: el dist está viejo. Corré \`npm run build\` y volvé a cotejar.`,
    );
    process.exit(2);
  }
}

const ENTIDADES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };
function decodificar(s) {
  return s
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&([a-z]+);/gi, (m, n) => ENTIDADES[n.toLowerCase()] ?? m);
}

function aTexto(htmlFragmento) {
  return decodificar(
    htmlFragmento
      .replace(/<(script|style)\b[\s\S]*?<\/\1>/gi, ' ')
      .replace(/<!--[\s\S]*?-->/g, ' ')
      // Las etiquetas en línea no separan palabras («<a>x</a>.» es «x.»); el resto sí.
      .replace(/<\/?(a|strong|b|em|i|u|span|small|mark|abbr|code)\b[^>]*>/gi, '')
      .replace(/<[^>]+>/g, ' '),
  );
}

function normalizar(texto) {
  return texto
    .replace(/ /g, ' ')
    .replace(/\+506[\s-]*8675[\s-]*2713/g, '+50686752713')
    .replace(/•/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const atributo = (etiquetaAbierta, nombre) => {
  const m = new RegExp(`\\s${nombre}=(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, 'i').exec(etiquetaAbierta);
  return m ? (m[1] ?? m[2] ?? m[3]) : null;
};

// Interior del primer <div> con el token de clase exacto `legal`, balanceando divs.
function bloqueLegal(html) {
  const aperturas = /<div\b[^>]*>/gi;
  let a;
  while ((a = aperturas.exec(html))) {
    const clase = atributo(a[0], 'class');
    if (clase && clase.split(/\s+/).includes('legal')) {
      const inicio = a.index + a[0].length;
      const etiquetas = /<(\/?)div\b[^>]*>/gi;
      etiquetas.lastIndex = inicio;
      let nivel = 1;
      let m;
      while ((m = etiquetas.exec(html))) {
        nivel += m[1] ? -1 : 1;
        if (nivel === 0) return html.slice(inicio, m.index);
      }
      return null;
    }
  }
  return null;
}

const html = readFileSync(rutaHtml, 'utf8');
const fuenteCruda = readFileSync(rutaFuente, 'utf8').replace(/\r\n?/g, '\n');

const cuerpoHtml = bloqueLegal(html);
if (cuerpoHtml === null) {
  console.error(`No se encontró un bloque con la clase exacta "legal" en ${etiqueta(rutaHtml)}`);
  process.exit(2);
}

// Los PDF dejan saltos de página (\f) pegados al inicio de alguna línea.
const lineas = fuenteCruda.replace(/\f/g, '').split('\n');
const iTitulo = lineas.findIndex((l) => l.trim() !== '');
const lineasCuerpo = lineas.slice(iTitulo + 1);
const tituloFuente = normalizar(lineas[iTitulo]);
// «### » marca un subtítulo sin número (h3); la marca no es texto de la fuente.
const MARCA_H3 = /^###[ \t]+/;
const cuerpoFuente = normalizar(lineasCuerpo.map((l) => l.replace(MARCA_H3, '')).join('\n'));
const h1 = /<h1\b[^>]*>([\s\S]*?)<\/h1>/i.exec(html);
const tituloHtml = h1 ? normalizar(aTexto(h1[1])) : '';

// ---------- 2. Texto ----------
const a = cuerpoFuente.split(' ').filter(Boolean); // fuente
const b = normalizar(aTexto(cuerpoHtml)).split(' ').filter(Boolean); // página

let pre = 0;
while (pre < a.length && pre < b.length && a[pre] === b[pre]) pre++;
let suf = 0;
while (suf < a.length - pre && suf < b.length - pre && a[a.length - 1 - suf] === b[b.length - 1 - suf]) suf++;
const A = a.slice(pre, a.length - suf);
const B = b.slice(pre, b.length - suf);

const n = A.length;
const k = B.length;
const ancho = k + 1;
const L = new Uint32Array((n + 1) * ancho);
for (let i = n - 1; i >= 0; i--) {
  for (let j = k - 1; j >= 0; j--) {
    L[i * ancho + j] =
      A[i] === B[j] ? L[(i + 1) * ancho + j + 1] + 1 : Math.max(L[(i + 1) * ancho + j], L[i * ancho + j + 1]);
  }
}

const ops = [];
{
  let i = 0;
  let j = 0;
  while (i < n && j < k) {
    if (A[i] === B[j]) {
      ops.push({ t: '=', w: A[i] });
      i++;
      j++;
    } else if (L[(i + 1) * ancho + j] >= L[i * ancho + j + 1]) {
      ops.push({ t: '-', w: A[i++] });
    } else {
      ops.push({ t: '+', w: B[j++] });
    }
  }
  while (i < n) ops.push({ t: '-', w: A[i++] });
  while (j < k) ops.push({ t: '+', w: B[j++] });
}

const contexto = (arr, desde, hasta) => arr.slice(Math.max(0, desde), hasta).join(' ');
let diferenciasTexto = 0;
let hunks = 0;
{
  let pos = pre;
  let i = 0;
  while (i < ops.length) {
    if (ops[i].t === '=') {
      pos++;
      i++;
      continue;
    }
    const faltan = [];
    const sobran = [];
    const desde = pos;
    while (i < ops.length && ops[i].t !== '=') {
      if (ops[i].t === '-') {
        faltan.push(ops[i].w);
        pos++;
      } else {
        sobran.push(ops[i].w);
      }
      i++;
    }
    hunks++;
    diferenciasTexto += faltan.length + sobran.length;
    console.log(`#${hunks} ...${contexto(a, desde - 6, desde)} [`);
    if (faltan.length) console.log(`    fuente: ${faltan.join(' ')}`);
    if (sobran.length) console.log(`    página: ${sobran.join(' ')}`);
    console.log(`  ] ${contexto(a, pos, pos + 6)}...`);
  }
}

let otras = 0; // diferencias que no son palabras: título, estructura, contacto, índice
const reportar = (msg) => {
  otras++;
  console.log(`  ! ${msg}`);
};

if (tituloFuente.toLocaleLowerCase('es') !== tituloHtml.toLocaleLowerCase('es')) {
  reportar(`Título: fuente «${tituloFuente}» vs <h1> «${tituloHtml}»`);
}

// ---------- 3. Estructura ----------
function estructuraDeFuente(ls) {
  const h2 = [];
  const h3 = [];
  let ul = 0;
  let li = 0;
  let enLista = false;
  for (const l of ls) {
    const t = l.trim();
    if (t === '') {
      enLista = false;
      continue;
    }
    if (MARCA_H3.test(l)) {
      h3.push(normalizar(l.replace(MARCA_H3, '')));
      enLista = false;
      continue;
    }
    const indentada = /^\s/.test(l);
    if (/^\s*•\s/.test(l) || /^\s*[a-z]\)\s/.test(l)) {
      if (!enLista) {
        ul++;
        enLista = true;
      }
      li++;
      continue;
    }
    if (enLista && indentada) continue; // continuación de un ítem
    enLista = false;
    if (indentada) continue;
    if (/^\d+\.\d+\.\s/.test(t)) h3.push(normalizar(t));
    else if (/^\d+\.\s/.test(t)) h2.push(normalizar(t));
  }
  return { h2, h3, ul, li };
}

const cuenta = (fragmento, etiq) => (fragmento.match(new RegExp(`<${etiq}\\b`, 'gi')) ?? []).length;
const titulos = (fragmento, etiq) =>
  [...fragmento.matchAll(new RegExp(`<${etiq}\\b([^>]*)>([\\s\\S]*?)</${etiq}>`, 'gi'))].map((m) => ({
    id: atributo(`<${etiq}${m[1]}>`, 'id'),
    texto: normalizar(aTexto(m[2])),
  }));

const fuenteEst = estructuraDeFuente(lineasCuerpo);
if (pagina.esperado) {
  for (const clave2 of ['h2', 'h3', 'ul', 'li']) {
    const deducido = Array.isArray(fuenteEst[clave2]) ? fuenteEst[clave2].length : fuenteEst[clave2];
    if (deducido !== pagina.esperado[clave2]) {
      console.error(
        `El script dedujo ${deducido} ${clave2} de la fuente y esperaba ${pagina.esperado[clave2]}: revisá la fuente o actualizá \`esperado\` en el script.`,
      );
      process.exit(2);
    }
  }
}
const h2Html = titulos(cuerpoHtml, 'h2');
const h3Html = titulos(cuerpoHtml, 'h3');
const cmp = [
  ['h2', fuenteEst.h2.length, h2Html.length],
  ['h3', fuenteEst.h3.length, h3Html.length],
  ['ul', fuenteEst.ul, cuenta(cuerpoHtml, 'ul')],
  ['li', fuenteEst.li, cuenta(cuerpoHtml, 'li')],
  ['ol', 0, cuenta(cuerpoHtml, 'ol')],
];
for (const [nombre, deFuente, dePagina] of cmp) {
  if (deFuente !== dePagina) reportar(`Estructura: <${nombre}> fuente ${deFuente} vs página ${dePagina}`);
}
for (const [nombre, deFuente, dePagina] of [
  ['h2', fuenteEst.h2, h2Html.map((x) => x.texto)],
  ['h3', fuenteEst.h3, h3Html.map((x) => x.texto)],
]) {
  if (deFuente.length === dePagina.length) {
    deFuente.forEach((t, i) => {
      if (t !== dePagina[i]) reportar(`Estructura: ${nombre} #${i + 1} fuente «${t}» vs página «${dePagina[i]}»`);
    });
  }
}

// ---------- 4. Contacto (href) ----------
const correosFuente = new Set((fuenteCruda.match(/[\w.+-]+@[\w-]+(?:\.[\w-]+)+/g) ?? []).map((x) => x.toLowerCase()));
const telefonosFuente = new Set(
  (fuenteCruda.match(/\+\d{3}[\s-]*\d{4}[\s-]*\d{4}/g) ?? []).map((x) => x.replace(/\D/g, '')),
);
for (const m of cuerpoHtml.matchAll(/<a\b[^>]*>/gi)) {
  const href = atributo(m[0], 'href');
  if (!href) continue;
  if (/^mailto:/i.test(href)) {
    let dir = href.slice(7).split('?')[0];
    try {
      dir = decodeURIComponent(dir);
    } catch {}
    if (!correosFuente.has(dir.toLowerCase())) reportar(`Contacto: ${href} no es un correo de la fuente (${[...correosFuente].join(', ')})`);
  } else if (/^tel:/i.test(href)) {
    const digitos = href.slice(4).replace(/\D/g, '');
    if (!telefonosFuente.has(digitos)) reportar(`Contacto: ${href} no es un teléfono de la fuente (${[...telefonosFuente].join(', ')})`);
  }
}

// ---------- 5. Índice e ids ----------
{
  const sinGuion = html.replace(/<(script|style)\b[\s\S]*?<\/\1>/gi, ' ').replace(/<!--[\s\S]*?-->/g, ' ');
  const vistos = new Map();
  for (const m of sinGuion.matchAll(/<[a-z][^>]*>/gi)) {
    const id = atributo(m[0], 'id');
    if (id) vistos.set(id, (vistos.get(id) ?? 0) + 1);
  }
  for (const [id, veces] of vistos) if (veces > 1) reportar(`Ids: «${id}» aparece ${veces} veces en la página`);

  const nav = /<nav\b[^>]*aria-label="[^"]*[ÍI]ndice[^"]*"[^>]*>([\s\S]*?)<\/nav>/i.exec(html);
  if (!nav) {
    if (pagina.indice) reportar('Índice: no hay un <nav aria-label="Índice …"> con las anclas');
  } else {
    const porId = new Map(h2Html.map((x) => [x.id, x.texto]));
    const enlazados = new Map();
    for (const m of nav[1].matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)) {
      const href = atributo(`<a${m[1]}>`, 'href');
      const texto = normalizar(aTexto(m[2]));
      if (!href || !href.startsWith('#')) {
        reportar(`Índice: «${texto}» no tiene un enlace #ancla (href=${href})`);
        continue;
      }
      const id = href.slice(1);
      enlazados.set(id, (enlazados.get(id) ?? 0) + 1);
      if (!porId.has(id)) reportar(`Índice: «${texto}» apunta a #${id}, que no es el id de ningún h2`);
      else if (porId.get(id) !== texto) reportar(`Índice: #${id} dice «${texto}» pero el h2 dice «${porId.get(id)}»`);
    }
    for (const [id, texto] of porId) {
      const veces = enlazados.get(id) ?? 0;
      if (veces !== 1) reportar(`Índice: el h2 #${id} («${texto}») tiene ${veces} enlaces en el índice`);
    }
  }
}

const total = diferenciasTexto + otras;
console.log(
  `${clave}: ${a.length} palabras en la fuente, ${b.length} en ${etiqueta(rutaHtml)}; ` +
    `${diferenciasTexto} palabras distintas en ${hunks} lugares; ${otras} diferencias de título, estructura, contacto o índice.`,
);
console.log(`Diferencias: ${total}`);
process.exit(total === 0 ? 0 : 1);
