#!/usr/bin/env node
// Coteja el texto visible de una página legal construida (dist/) contra su fuente
// en docs/legal/fuente/ y cuenta las diferencias, palabra por palabra.
//
// Uso (después de `npm run build`):
//   node scripts/cotejo-legal.mjs terminos
//   node scripts/cotejo-legal.mjs politica
//
// Qué se compara:
//   - El cuerpo es el bloque con clase `legal` de la página (el índice de anclas y el
//     hero quedan fuera). Se quitan las etiquetas, se decodifican las entidades y se
//     colapsan los espacios, así que los saltos de línea del PDF no cuentan.
//   - La primera línea de la fuente (el título) se compara contra el <h1>, sin
//     distinguir mayúsculas.
//   - Los viñetas «•» de la fuente no cuentan. Los incisos «a)», «12.1.» sí cuentan.
//   - Datos de contacto: el teléfono se compara solo por sus dígitos
//     (+506 8675-2713 = +506 8675 2713); el resto (correo, sitio, domicilio) se compara
//     tal cual.
//
// Salida: una línea por diferencia (con contexto) y el total. Código de salida 0 si hay
// 0 diferencias, 1 si hay alguna, 2 si falta un archivo o el bloque `legal`.

import { readFileSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const PAGINAS = {
  terminos: {
    html: 'dist/terminos-y-condiciones/index.html',
    fuente: 'docs/legal/fuente/tyc-2026-10.txt',
  },
  politica: {
    html: 'dist/politica-de-privacidad/index.html',
    fuente: 'docs/legal/fuente/politica-2026-07.txt',
  },
};

const clave = process.argv[2];
if (!PAGINAS[clave]) {
  console.error(`Uso: node scripts/cotejo-legal.mjs <${Object.keys(PAGINAS).join('|')}>`);
  process.exit(2);
}
const { html: rutaHtml, fuente: rutaFuente } = PAGINAS[clave];
for (const r of [rutaHtml, rutaFuente]) {
  if (!existsSync(resolve(raiz, r))) {
    console.error(`No existe ${r}${r.startsWith('dist/') ? ' (corré antes `npm run build`)' : ''}`);
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

// Devuelve el interior del primer <div> cuya clase incluye `legal`, balanceando divs.
function bloqueLegal(html) {
  const apertura = /<div\b[^>]*\bclass="[^"]*\blegal\b[^"]*"[^>]*>/i.exec(html);
  if (!apertura) return null;
  const inicio = apertura.index + apertura[0].length;
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

function normalizar(texto) {
  return texto
    .replace(/ /g, ' ')
    .replace(/\+506[\s-]*8675[\s-]*2713/g, '+50686752713')
    .replace(/•/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const html = readFileSync(resolve(raiz, rutaHtml), 'utf8');
const fuenteCruda = readFileSync(resolve(raiz, rutaFuente), 'utf8').replace(/\r\n?/g, '\n');

const cuerpoHtml = bloqueLegal(html);
if (cuerpoHtml === null) {
  console.error(`No se encontró el bloque con clase "legal" en ${rutaHtml}`);
  process.exit(2);
}

// Título: primera línea no vacía de la fuente contra el <h1>.
const lineas = fuenteCruda.split('\n');
const iTitulo = lineas.findIndex((l) => l.trim() !== '');
const tituloFuente = normalizar(lineas[iTitulo]);
const cuerpoFuente = normalizar(lineas.slice(iTitulo + 1).join('\n'));
const h1 = /<h1\b[^>]*>([\s\S]*?)<\/h1>/i.exec(html);
const tituloHtml = h1 ? normalizar(aTexto(h1[1])) : '';

const a = cuerpoFuente.split(' ').filter(Boolean); // fuente
const b = normalizar(aTexto(cuerpoHtml)).split(' ').filter(Boolean); // página

// Diferencias palabra por palabra (LCS) tras recortar el prefijo y el sufijo comunes.
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

const ops = []; // {t: '=' | '-' | '+', w}
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

// Agrupar en hunks consecutivos y contar palabras distintas.
const contexto = (arr, desde, hasta) => arr.slice(Math.max(0, desde), hasta).join(' ');
let diferencias = 0;
let hunks = 0;
let pos = pre; // posición en la fuente (palabras) para el contexto
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
  diferencias += faltan.length + sobran.length;
  console.log(`#${hunks} ...${contexto(a, desde - 6, desde)} [`);
  if (faltan.length) console.log(`    fuente: ${faltan.join(' ')}`);
  if (sobran.length) console.log(`    página: ${sobran.join(' ')}`);
  console.log(`  ] ${contexto(a, pos, pos + 6)}...`);
}

let tituloDifiere = 0;
if (tituloFuente.toLocaleLowerCase('es') !== tituloHtml.toLocaleLowerCase('es')) {
  tituloDifiere = 1;
  console.log(`Título: fuente «${tituloFuente}» vs <h1> «${tituloHtml}»`);
}

console.log(
  `${clave}: ${a.length} palabras en la fuente, ${b.length} en ${rutaHtml}; ` +
    `${diferencias} palabras distintas en ${hunks} lugares; título ${tituloDifiere ? 'DIFIERE' : 'igual'}.`,
);
console.log(`Diferencias: ${diferencias + tituloDifiere}`);
process.exit(diferencias + tituloDifiere === 0 ? 0 : 1);
