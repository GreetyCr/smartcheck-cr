# Borrador de la Política de Privacidad · para la revisión de Randall

Estado: borrador del 13 de octubre de 2026, vuelta 2 (U2 del plan `docs/planes/2026-10-13-raiz.md`). No está publicado: la página `src/pages/politica-de-privacidad.astro` ya tiene este texto en la rama, pero nada se enciende hasta que Randall lo revise (U7).

Fuente: `docs/legal/fuente/politica-2026-07.txt`, la Política del .docx que Esteban confirmó el 13 de octubre. Las 11 secciones están **tal cual**, con un solo cambio decidido por Randall (el domicilio, punto 1 de abajo). Lo único que se agregó es el complemento de la sección 10, marcado abajo con el recuadro «NUEVO». La fecha de «Última actualización» pasa a ser el 13 de octubre de 2026.

## 1. Qué cambió respecto del .docx

**Cambio decidido por Randall el 13-oct (no está en el .docx):**

- **Domicilio: «San José, Costa Rica»** en lugar de «Heredia, Costa Rica» (sección 1). Los Términos y Condiciones finales de octubre dicen San José. El cambio está también en la fuente `docs/legal/fuente/politica-2026-07.txt` (línea 5), para que el cotejo siga en 0.

**Nuevo, todo dentro de la sección 10**, que pide el complemento por sí sola («Si el sitio utiliza herramientas adicionales de seguimiento, analítica o publicidad, esta Política deberá complementarse»):

1. **Analítica web: PostHog.** Proveedor, servidores en EE. UU., qué mide (páginas vistas, tiempo en cada página y hasta dónde se baja; clics a WhatsApp con botón y página; datos técnicos del navegador y del dispositivo; página de origen y parámetros de campaña; ubicación aproximada con ciudad o región), qué no hace (cookies, perfiles, grabación; la IP se descarta y solo sirve para estimar la ubicación) y la oposición.
2. **Oposición, sin prometer lo que no se puede cumplir.** No hay mecanismo de opt-out y los datos no identifican a la persona. El texto dice que, como no permiten identificarle, SmartCheck no puede asociarlos a una persona; que quien no quiera ser medido puede bloquear los scripts de analítica en su navegador; y que las consultas van por los canales de la sección 11.
3. **Almacenamiento de Informes y fotografías: Convex.** Proveedor de base de datos con servidores en EE. UU. **La región es inferida** (por confirmar, ver el punto 3 de abajo).
4. **Alojamiento y tipografía: Vercel y Google Fonts** (decisión de Randall del 13-oct). Vercel aloja el sitio, en EE. UU., y recibe la IP y datos técnicos de cada visita en sus registros. Google recibe la IP y los datos del navegador porque la tipografía se carga desde sus servidores.

Además, solo en la versión publicada: un índice de anclas arriba (fuera del bloque de texto de la Política) y la fecha nueva. No hay ninguna frase que diga que no se comparten datos con terceros (la sección 6 del .docx dice cuándo sí se comunican, y el complemento dice quién recibe qué).

## 2. Lo que en el .docx quedó desactualizado o falta frente al sitio real

El texto del .docx no se tocó. Esto es lo que Randall puede querer decidir con Esteban:

1. **Proveedores del sitio.** Resuelto en esta vuelta: el complemento nombra a Vercel y a Google Fonts. Sigue genérico en la sección 10 del .docx lo de «mensajería, correo electrónico, facturación o procesamiento de pagos»: no se nombró a Gmail ni a ningún proveedor de pagos porque no los verifiqué en el sitio.
2. **WhatsApp y redes sociales.** Los enlaces de contacto del sitio llevan a WhatsApp (Meta) y el pie y la página de contacto a Facebook, Instagram y TikTok. La Política solo da el número como medio de contacto; no dice que al tocar el enlace se sale a un servicio de terceros con su propia política.
3. **Oposición.** La sección 8 enumera acceso, rectificación, actualización y supresión, pero no nombra la **oposición**. Como no hay forma de excluir a una persona de la medición, el complemento ya no promete ese derecho: explica el bloqueo de scripts. Si se quiere reconocer la oposición, hay que decidir cómo se cumpliría.
4. **Boletín del blog.** `src/pages/blog/index.astro` (líneas 231 a 246) muestra un formulario «Suscríbete a nuestro newsletter» que pide un correo. No tiene acción ni código que lo envíe (no hay `fetch(` en `src`), así que hoy no recoge nada. Si se conecta, la Política no cubre ese uso del correo ni su consentimiento (sección 4).
5. **Plazo de conservación de los Informes.** La sección 7 da cinco años para los datos de contacto, pero para Informes y fotografías (que viven en Convex) solo dice «los límites temporales establecidos por la normativa vigente», sin un plazo. La Política publicada hasta hoy decía «de forma indefinida».
6. **Tratamiento fuera de Costa Rica.** PostHog y Convex (y, sin nombrarse, Vercel y Google) están en EE. UU. El .docx no dice que los datos se traten fuera del país. Si hace falta decirlo o contar con una base específica es una consulta para Esteban o su abogada; yo no la resuelvo en el texto.
7. **Consulta de placa.** La Política publicada hasta hoy tenía una sección propia sobre datos de fuentes públicas por placa y cómo pedir su rectificación. El .docx la cubre solo en una viñeta de la sección 2 («Información consultada en fuentes oficiales…»).

## 3. Pendientes antes de publicar (de los que depende este texto)

- **Convex, región:** EE. UU. se infirió de la URL del deployment (`*.convex.cloud`, sin sufijo de región). Confirmar en el panel de Convex antes de U7.
- **IP descartada y sin cookies:** son verdad solo cuando U5a deja en la cuenta de PostHog «Discard client IP data» y «Cookieless server hash mode» encendidos. El verificador lo mide (R4).
- **Qué mide:** el texto cubre el tiempo en cada página (evento `$pageleave` de la configuración de U3) y, según la revisión, los datos técnicos, la página de origen, los parámetros de campaña, hasta dónde se baja y la ubicación con ciudad o región. Si U3 cambia la configuración, hay que releer esa lista.
- **Vercel, EE. UU.:** es la decisión de Randall. Vercel sirve el sitio desde una red de servidores distribuida, así que la ubicación exacta de los registros no está verificada.
- **No se afirmó:** que el identificador de visitante rote cada día (sin verificar en la doc de PostHog), ni cuánto tiempo conserva PostHog los eventos.

---

# Texto de la Política

> Todo lo que está fuera de los recuadros «NUEVO» es el .docx tal cual, salvo el domicilio de la sección 1 (en negrita). La página publicada agrega un índice de las 11 secciones arriba del texto.

## POLÍTICA DE PRIVACIDAD

Última actualización: 13 de octubre de 2026

La presente Política de Privacidad regula el tratamiento de los datos personales que se recopilan como consecuencia del uso del sitio web, la contratación y coordinación de los servicios de SmartCheck y la elaboración de informes de inspección de vehículos.

Su finalidad es informar de manera clara qué datos se recopilan, para qué se utilizan, durante cuánto tiempo se conservan, en qué casos pueden ser compartidos y cuáles derechos pueden ejercer las personas titulares, de conformidad con la Ley N.° 8968 de Protección de la Persona frente al Tratamiento de sus Datos Personales y su Reglamento.

## 1. Responsable del tratamiento

El responsable del tratamiento de los datos personales es 3-102-939601 SOCIEDAD DE RESPONSABILIDAD LIMITADA, cédula jurídica 3-102-939601, que opera comercialmente bajo el nombre de SmartCheck Costa Rica, con domicilio en **San José, Costa Rica.** *(Cambio decidido por Randall el 13-oct; el .docx decía Heredia.)*

Medios de contacto:

- Correo electrónico: smartcheckcr@gmail.com
- Teléfono / WhatsApp: +506 8675-2713
- Sitio web: smartcheckcr.com

## 2. Datos que se pueden recopilar

Dependiendo del servicio solicitado, SmartCheck podrá recopilar:

- Nombre, teléfono, WhatsApp, correo electrónico y datos necesarios para identificar y contactar al cliente.
- Datos necesarios para la facturación y gestión del pago.
- Marca, modelo, año, placa, número de identificación vehicular cuando corresponda y demás datos técnicos del vehículo.
- Kilometraje observado, fotografías, videos, lecturas, códigos de diagnóstico y observaciones obtenidas durante la inspección.
- Datos mínimos del propietario, poseedor o encargado cuando el cliente no sea el dueño del vehículo y ello resulte necesario para coordinar o autorizar la inspección.
- Información consultada en fuentes oficiales o legítimamente accesibles cuando sea necesaria para complementar el servicio.

Cuando un dato relacionado con el vehículo permita identificar directa o indirectamente a una persona física, SmartCheck lo tratará como dato personal y aplicará las reglas de protección correspondientes.

## 3. Para qué se utilizan los datos

Los datos podrán utilizarse para:

- Atender consultas, preparar cotizaciones y coordinar citas.
- Prestar el servicio de inspección y elaborar el Informe correspondiente.
- Contactar al cliente antes, durante y después de la prestación del servicio.
- Gestionar pagos, facturación, reclamos o consultas posteriores.
- Conservar respaldo técnico del servicio realizado y de los hallazgos observados en la fecha de inspección.
- Cumplir obligaciones legales, administrativas o judiciales.
- Mantener, cuando sea legalmente procedente, antecedentes técnicos de vehículos previamente inspeccionados.
- Ofrecer a un tercero un Informe Preexistente del mismo vehículo, siempre que se cumplan las reglas de protección de datos establecidas en esta Política.

SmartCheck no utilizará los datos personales para finalidades distintas o incompatibles con aquellas informadas, salvo que exista una base legal suficiente o se obtenga el consentimiento adicional que corresponda.

## 4. Consentimiento

Cuando la legislación requiera consentimiento, este deberá ser libre, informado, específico e inequívoco. La persona deberá conocer previamente qué datos se recopilan, para qué se utilizarán y, cuando corresponda, si pueden ser comunicados a terceros.

La aceptación de esta Política no implica una autorización general para utilizar los datos personales para cualquier finalidad futura.

## 5. Informes e información del vehículo

SmartCheck podrá conservar el Informe y la información técnica generada durante una inspección como respaldo del servicio, para atención de reclamos, control de calidad y trazabilidad de los hallazgos.

La contratación de una inspección no autoriza a SmartCheck a vender o compartir libremente los datos personales del cliente.

Si SmartCheck ofrece posteriormente a otra persona un Informe Preexistente relativo al mismo vehículo, deberá:

- Omitir los datos personales del cliente que originalmente contrató la inspección.
- Excluir datos personales de terceros que no sean necesarios para la finalidad del Informe.
- Indicar de manera clara la fecha en que se realizó la inspección original.
- No presentar el Informe como si reflejara necesariamente el estado actual del vehículo.
- Anonimizar o eliminar información personal cuando sea necesario.
- Obtener el consentimiento correspondiente cuando la transferencia de un dato personal lo requiera.

SmartCheck podrá abstenerse de entregar un Informe Preexistente cuando no pueda separar adecuadamente la información personal o cuando su antigüedad o contenido pueda inducir a error.

## 6. Comunicación de datos a terceros

SmartCheck no comercializará los datos personales del cliente como producto independiente.

Los datos personales únicamente podrán ser comunicados cuando:

- Sea necesario para prestar el servicio contratado.
- Un proveedor tecnológico o administrativo necesite acceso limitado para prestar un servicio a SmartCheck.
- Exista una obligación legal, administrativa o judicial.
- La persona titular haya dado el consentimiento requerido.
- Exista otro supuesto expresamente permitido por la legislación.

Cuando la comunicación de datos personales a un tercero requiera consentimiento, SmartCheck deberá contar con dicho consentimiento antes de realizarla.

## 7. Conservación de la información

SmartCheck conservará los datos personales únicamente durante el tiempo necesario para cumplir las finalidades para las cuales fueron recopilados, atender obligaciones legales o responder a reclamos.

Como criterio interno, los datos ordinarios de contacto y de la relación contractual podrán conservarse hasta por cinco años después del último servicio o interacción relevante, salvo que exista una razón legal que justifique otro plazo.

Cuando un Informe o expediente técnico contenga datos personales capaces de afectar a su titular, SmartCheck aplicará los límites temporales establecidos por la normativa vigente. La información debidamente anonimizada podrá conservarse por un período mayor mientras no permita identificar razonablemente a una persona física.

## 8. Derechos de las personas titulares

Las personas titulares podrán ejercer los derechos reconocidos por la Ley N.° 8968, incluyendo solicitar acceso, rectificación, actualización o supresión de sus datos, así como conocer y controlar su eventual cesión o transferencia.

Las solicitudes deberán enviarse a smartcheckcr@gmail.com e incluir información suficiente para identificar al solicitante y precisar qué dato o tratamiento desea revisar.

SmartCheck atenderá las solicitudes dentro de los plazos establecidos por la normativa aplicable.

## 9. Seguridad y confidencialidad

SmartCheck adoptará medidas razonables para proteger la información contra pérdida, acceso no autorizado, alteración, divulgación indebida o uso contrario a las finalidades informadas.

El acceso a los datos deberá limitarse a las personas o proveedores que lo necesiten para la prestación del servicio, quienes deberán mantener la confidencialidad correspondiente.

## 10. Herramientas tecnológicas y proveedores

SmartCheck podrá utilizar herramientas de mensajería, correo electrónico, almacenamiento, alojamiento web, facturación o procesamiento de pagos para prestar sus servicios.

Cuando un proveedor tenga acceso a datos personales, SmartCheck deberá procurar que dicho acceso se limite a lo necesario y que la información se maneje bajo condiciones adecuadas de seguridad.

Si el sitio utiliza herramientas adicionales de seguimiento, analítica o publicidad, esta Política deberá complementarse para informar su uso de manera adecuada.

<div class="nuevo" markdown="1">

**NUEVO respecto del .docx · inicio del complemento de la sección 10**

### Analítica web: PostHog

Este sitio utiliza **PostHog** como proveedor de analítica web, con servidores en Estados Unidos de América. Su finalidad es conocer cómo se usa el sitio y qué botones de contacto resultan útiles. PostHog mide:

- las páginas vistas, el tiempo que se permanece en cada página y hasta dónde se baja en ella;
- los clics en los botones de WhatsApp, con el botón que se tocó y la página en que se encontraba;
- datos técnicos del navegador y del dispositivo, como el navegador, el sistema operativo, el tamaño de la pantalla, el idioma y la zona horaria;
- la página desde la que se llegó al sitio y los parámetros de campaña de la dirección web; y
- la ubicación aproximada (país y ciudad o región).

Esta analítica no utiliza cookies ni guarda información en su navegador, no crea perfiles de personas y no graba sesiones. La dirección IP se descarta y no se conserva; solo se usa para estimar la ubicación aproximada. El identificador anónimo de visitante lo calcula el servidor de PostHog, sin que quede almacenado en su dispositivo. Los datos de esta medición se comunican a PostHog únicamente para prestar este servicio de analítica.

Como los datos de esta medición no permiten identificarle, SmartCheck no puede asociarlos a una persona determinada. Si no desea que se mida su visita, puede evitarlo bloqueando los scripts de analítica en su navegador. Para consultas sobre este tema, puede utilizar los canales indicados en la sección 11 de esta Política.

### Almacenamiento de Informes y fotografías: Convex

Los Informes y las fotografías de las inspecciones se guardan en **Convex**, un proveedor de base de datos con servidores en Estados Unidos de América. SmartCheck procurará que el acceso de ese proveedor se limite a lo necesario para prestar el servicio de almacenamiento, conforme a lo indicado en esta sección.

**POR CONFIRMAR:** la región de Convex (Estados Unidos de América) es inferida de la URL del deployment, no confirmada en el panel. Esta marca solo está en el borrador; la página publicada no la lleva.

### Alojamiento del sitio y tipografía: Vercel y Google Fonts

El sitio está alojado en **Vercel**, un proveedor de alojamiento web con servidores en Estados Unidos de América. Vercel recibe la dirección IP y datos técnicos de cada visita al sitio, que quedan en sus registros de funcionamiento.

La tipografía del sitio se carga desde los servidores de Google (**Google Fonts**). Por esta razón, Google recibe la dirección IP y los datos del navegador de quien visita el sitio.

**NUEVO · fin del complemento**

</div>

## 11. Cambios a esta Política y contacto

SmartCheck podrá actualizar esta Política cuando cambie la legislación, los servicios ofrecidos o la forma en que se tratan los datos. La versión vigente deberá indicar su fecha de actualización.

Para consultas relacionadas con privacidad o para ejercer derechos sobre datos personales, puede utilizarse el correo smartcheckcr@gmail.com o el teléfono / WhatsApp +506 8675-2713.

Lo anterior no limita el derecho de la persona titular de acudir ante la Agencia de Protección de Datos de los Habitantes (PRODHAB) o ante las autoridades competentes.
