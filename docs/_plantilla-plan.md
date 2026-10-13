---
tags:
  - plantilla
Area: Costa Coders
---
# Plan · {proyecto} · {cambio}

> Plan de desarrollo: lo que necesitan los agentes para construir. Lo del cliente (qué se entrega, fechas, cobro) vive en el compromiso del vault, y lo que el cliente dijo, en su registro. Lo llena el planificador y lo aprueba Randall. **No se escribe código hasta que las seis secciones de la puerta están completas.** Todo lo que entra al alcance después pasa por acá: se agrega una unidad, con su estimación.

**Qué se construye.** Una o dos frases. **Compromiso:** [[{compromiso}]].

**Estimación total.** N h **de trabajo**, la suma de las unidades. **Aprobado por Randall:** AAAA-MM-DD.

> **Toda estimación dice de qué es.** *Horas de trabajo:* lo que cuesta hacerla, corran las unidades en fila o en paralelo; es lo que se estima y lo que se suma acá. *Horas de reloj:* las que pasan para Randall entre que arranca y termina, y las mide sola el hook de las horas (#073). Con cuatro constructores en paralelo, ocho horas de trabajo pueden ser dos de reloj. Las dos se anotan en el `ESTADO.md`, separadas por una barra.

## La puerta

### 1. El arranque: la U0

El arranque depende de si el proyecto nace en un repo vacío o cuelga de un árbol que ya existe. Se marca cuál de los dos es y se borra el otro.

**Repo nuevo.** La U0 crea el repo, el commit inicial y el núcleo compartido: el esquema, la autenticación base y el `CLAUDE.md` del proyecto. La construye la sesión principal, en fila; nada corre en paralelo con ella.

**Sobre un árbol que ya existe.** La U0 no construye el núcleo: cuelga la rama nueva de la raíz, escribe su contrato, agrega sus tablas al esquema de la raíz y declara de qué tablas es dueña. Va en fila con la sesión principal porque toca el esquema. Antes de escribirla, la regla de profundidad decide si esto es de verdad un proyecto aparte: si lo nuevo cabe en la raíz y dos niveles, es el mismo proyecto y va como rama, no como repo nuevo.

### 2. Unidades y archivos

| Unidad | Qué hace | Rama dueña | Quién la construye | Archivos que le tocan | KB de código | Contrato con el frontend | Datos de DEV | Estimación (h de trabajo) |
|---|---|---|---|---|---|---|---|---|
| U1 | … | `{rama}` | constructor | `ruta/…` | N KB | aditivo, o rompe | `seed-u1` | N h |

- **Cada unidad dice quién la construye: un constructor, o la sesión principal.** Por defecto es un constructor; la sesión principal se queda con el núcleo, las costuras y las unidades que no se pueden hacer aisladas. Una unidad de rama asignada a la principal lleva el porqué en una línea. Sin esa columna, el trabajo de la principal no tiene unidad, no tiene rama y no se puede atribuir: es el 90,8% del gasto contra el que el método no puede decir nada (H16).
- Un archivo compartido (el esquema, la autenticación, los componentes base) tiene un solo dueño a la vez. Si dos unidades lo necesitan, van en fila.
- Si el contrato **rompe**, se despliega en dos pasos: primero lo nuevo sin quitar lo viejo, después el frontend, y al final se retira lo viejo.
- Solo se trabajan en paralelo las unidades marcadas como independientes.
- **Una unidad que necesita salir de su worktree se marca acá.** Leer otro repo, mirar carpetas de afuera, abrir un navegador o correr una herramienta del sistema: un constructor trabaja aislado y no puede. O la orden lleva la excepción declarada, o la unidad la hace la sesión principal. Un constructor aislado no recibe una unidad que solo se puede hacer saliendo, porque lo que hace entonces es buscarle la vuelta al aislamiento.
- **Una unidad de código se parte si sus archivos pasan unos 60 KB.** Los 20 KB de trabajo son para las tareas de lectura delegadas, no para construir. Los dos números son parámetros y se ajustan con lo medido.

**Unidades que cruzan ramas: la costura va aparte.** Si una unidad toca dos ramas, no se manda entera a la sesión principal. El trabajo se queda en la rama que lo tiene, con un constructor y en paralelo, y la línea que une las dos ramas se separa como una unidad chica que va en fila, con los contratos de las dos a mano. Ahí es donde se rompen los contratos, así que ahí va la atención de la sesión principal.

| Costura | Qué une | Contratos que carga | Quién la construye | Estimación (h de trabajo) |
|---|---|---|---|---|
| C1 | `{rama A}` con `{rama B}` | `{rama A}` y `{rama B}` | sesión principal | N h |

**Archivos imán.** El generador reporta los archivos que citan decisiones de tres ramas o más. Por cada uno se decide acá: darle rama propia o partirlo. Un archivo de tipos cuenta como contrato, no como dueño, así que tocarlo no vuelve la decisión de todos.

| Archivo imán | Ramas que lo citan | Qué se hace |
|---|---|---|
| `ruta/…` | … | rama propia `{nombre}`, o partir |

### 3. Dueño por tabla

«Un archivo, un dueño» no alcanza para los datos: dos constructores pueden no tocar el mismo archivo y aun así pisarse por la misma tabla. Cada tabla tiene una rama dueña de su forma, y las demás ramas que escriben en ella se declaran por campo.

| Tabla | Rama dueña | Otras ramas que escriben | Qué campos escriben |
|---|---|---|---|
| `{tabla}` | `{rama}` | `{rama}` | `{campo}`, `{campo}` |

Quién **lee** cada tabla no se escribe a mano: el generador lo arma con grep, y esos son los backlinks que carga un cambio de esquema.

### 4. Criterio de aceptación

| Requerimiento | Se cumple cuando | Quién lo comprueba | Cada cifra: definición, universo y el comando que lo reproduce |
|---|---|---|---|
| R1 | Lo que el verificador puede comprobar, bordes incluidos | U3, con su prueba | «Conversión = … sobre …», 19 de 31 · `grep -c … \| wc -l` |

**Un conteo que no salió de correr su definición contra la fuente no cierra la puerta.** Cada cifra con universo lleva el comando que lo reproduce, no solo el número: la definición y el conteo se escriben en el mismo renglón y es fácil que nunca se crucen. Si el comando da otra cosa, está mal la definición o está mal el dato, y las dos se arreglan antes de construir, no al integrar.

**Un requerimiento sin unidad que lo compruebe no pasa la puerta.** La columna del medio nombra la unidad que lo entrega, y si se comprueba con una prueba y no a ojo, esa prueba es parte de lo que esa unidad entrega. Si ninguna lo cubre, falta una unidad o sobra el requerimiento; las dos cosas se deciden acá, no al final.

Para cada cifra que ve el cliente: qué va a hacer con ella.

### 5. Supuestos y riesgos del terreno

| Supuesto o riesgo | Cómo se verificó | Resultado | Fecha |
|---|---|---|---|
| Los datos de DEV se parecen a los de PROD | … | … | … |

Revisar siempre: qué calculan solas las fuentes vivas, quién más escribe en los mismos datos y, si conviven con un sistema que se reemplaza, la fecha de fin y el dueño de cada campo.

### 6. Datos de DEV y lo que falta de afuera

Qué script genera cada muestra y a partir de qué forma de PROD: volúmenes, distribuciones y casos raros. Nunca datos de personas.

| Qué falta | De quién: cliente o tercero | Pedido el | Hace falta para |
|---|---|---|---|

Cada pregunta al cliente queda anotada en su registro el mismo día.

**Antes de entregar el plan, cada pregunta abierta se contrasta con lo que el plan ya resolvió.** Si el criterio de aceptación, los supuestos o las unidades la responden, deja de ser pregunta y pasa a ser decisión propuesta, que Randall aprueba o cambia. Una puerta con preguntas que el propio plan ya contestó es ruido, y el ruido es lo que hace que una puerta se apruebe sin leerla.

### 7. Cómo se ve

Lo que el plan propone en pantalla, **antes** de que se construya. No es una pregunta abierta: es una primera versión concreta que Randall ordena, cambia o descarta. Un plan sin esta sección deja el diseño para después, y después entra como alcance nuevo.

| Pantalla | Qué pregunta contesta | Qué va primero, arriba | Qué no va |
|---|---|---|---|
| `{nombre}` | «{la pregunta que trae el usuario}» | {lo que se mira todos los días} | {lo que se pidió y no entra, con el porqué} |

**El boceto.** Bloque por bloque, de arriba hacia abajo, con cifras de ejemplo puestas. Alcanza con texto: lo que importa es la distribución y la jerarquía, no el dibujo. Una lista por pantalla.

**Cuando no hay nada que mostrar.** Qué se ve con cero datos, con un dato roto y mientras carga. Una pantalla que solo se diseñó llena miente el día que está vacía.

**De dónde sale la cara.** Colores y tipografías, con su respaldo si no hay red. De la marca del cliente en el vault, o de `Plantillas/generador/marca.css` si es interno.

**Qué se mide.** Cada pantalla al ancho mínimo declarado (375 px salvo que el plan diga otro) y en claro y oscuro. Lo comprueba el verificador, nunca un constructor: un constructor está aislado y no tiene navegador.

## Documentación

Dónde queda lo que se aprende al construir:

- Las decisiones técnicas, en `decisiones/` del repo, una por archivo, con su `origen`.
- Lo real de cada unidad (horas, hallazgos, desvíos), en `ESTADO.md`.
- Lo que dijo el cliente, en su registro del vault.
- Las horas, en la bitácora del vault.

## Al cerrar el proyecto

Un post-proyecto hecho con la documentación de arriba: qué costó, de dónde salió cada retrabajo y qué se ajusta del método. Las cinco medidas salen solas si durante el proyecto se llenaron el `origen` de cada decisión y las dos líneas de commit del cierre (`Hallado-por` y `Conflicto`). Es el mismo ejercicio que [[Post-proyecto SmartCheck BI]].
