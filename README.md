# Onboarding de GitLab

Proyecto académico para el examen final del curso 1FIS0302. No es oficial ni está afiliado a GitLab; no se utiliza su logotipo.

## Problemática

Las personas recién contratadas en GitLab trabajan en una empresa 100 % remota y deben orientarse entre miles de páginas del Handbook. En su proceso de incorporación pueden perder tiempo buscando información y no siempre tienen una forma directa de confirmar qué aprendieron.

## Usuario objetivo

Empleados nuevos de GitLab que necesitan conocer los aspectos esenciales de la empresa, su cultura y sus prácticas de trabajo, y comprobar su comprensión durante la primera etapa de incorporación.

## Funcionalidades principales

- Presentación interactiva de ocho temas del onboarding.
- Navegación con botones y flechas del teclado, contador y barra de progreso.
- Guardado del avance en el navegador para retomar la presentación.
- Enlaces a las páginas oficiales del GitLab Handbook usadas como fuente.
- Quiz aleatorio de diez preguntas con retroalimentación inmediata.
- Resultado de aprobación, temas por repasar y opción de reintento.
- Agente que detecta cambios en las páginas del Handbook y propone una versión nueva mediante un pull request.
- Historial de versiones con fecha y temas cambiados.

## Cómo usarlo

Abre [el onboarding de GitLab](https://mych21.github.io/1FIS0302-PC-FNAL/).

Avanza por las 8 diapositivas y, al final, responde el quiz de 10 preguntas; necesitas 8 correctas para aprobar. Si no apruebas, verás qué temas repasar y podrás reintentar.

## Cómo ejecutarlo localmente

Requisito: Node.js **v26.12.1** (versión instalada en este equipo; compruébala con `node --version`). Desde la raíz del repositorio, ejecuta:

```sh
node agente/construir.js
```

El generador valida los datos y crea el HTML autocontenido de la versión configurada en `versiones/`, además de actualizar el historial y `index.html`. Abre directamente en el navegador el archivo generado `versiones/vX.Y.Z/onboarding.html`.

## Estructura del proyecto

```text
.
├── .github/
│   ├── agents/
│   │   └── actualizador-onboarding.agent.md
│   └── workflows/
│       └── agente-onboarding.yml
├── agente/
│   ├── actualizar.js
│   ├── construir.js
│   ├── fuentes.json
│   └── plantilla.html
├── datos/
│   ├── quiz.json
│   └── slides.json
├── docs/
│   └── bitacora-copilot.md
├── versiones/
│   ├── historial.json
│   └── vX.Y.Z/
│       └── onboarding.html
└── index.html
```

## Cómo funciona el agente

La actualización la realiza el agente personalizado de Copilot en la app de escritorio, siguiendo este README y usando únicamente las URL autorizadas en `agente/fuentes.json`. El agente en la nube está desactivado por el administrador de la cuenta institucional; por eso el trabajo se ejecuta localmente en la app de escritorio.

Al escribir **Actualizar onboarding**, el agente corre `node agente/actualizar.js --forzar todos`: consulta las fuentes y genera una versión nueva aunque no hayan cambiado los hashes. Actualiza los ocho temas con la información vigente de sus URL y guarda sus hashes; luego valida y genera la versión, crea una rama, hace commit y abre un pull request titulado `Onboarding vX.Y.Z` para revisión humana. En una ejecución normal del detector sin forzar, si no encuentra cambios, no se genera una versión.

El workflow de GitHub Actions queda como detector opcional y solo se ejecuta a demanda. Si se inicia manualmente desde **Actions**, revisa las fuentes y abre un issue con los temas y hashes detectados; no modifica ni hace commit de archivos del repositorio.

Para inicializar los hashes manualmente, ejecuta `node agente/actualizar.js --inicializar`. Esta opción solo guarda los hashes actuales y no genera una versión.

## Cómo ejecutar el agente

1. Abre el repositorio en la app de escritorio de GitHub Copilot.
2. Inicia una sesión nueva y elige el agente **actualizador-onboarding**.
3. Escribe **Actualizar onboarding**.
4. Revisa el pull request **Onboarding vX.Y.Z** y fusiónalo; GitHub Pages publicará la versión nueva. La solicitud **Actualizar onboarding** siempre genera una versión nueva, incluso si las fuentes no cambiaron.

Para actualizar intencionalmente temas aunque sus fuentes no hayan cambiado, solicita **Forzar actualización de [tema]**. El agente ejecutará `node agente/actualizar.js --forzar valores`; para varios temas puede usar IDs separados por comas (por ejemplo, `--forzar valores,comunicacion`) o `--forzar todos`.

## Uso de GitHub Copilot

| Tarea | Qué pedí | Qué sugirió | Mi decisión y por qué |
|---|---|---|---|
| Especificación | Definir temas, formato y reglas del quiz antes de programar | Creó `ESPECIFICACION.md` | La amplié con presentación, versiones y reglas del agente, y luego la uní al README para tener un solo documento de referencia. |
| Contenido | Encontrar las páginas oficiales del Handbook para los 8 temas | Revisó más de 40 páginas y eligió 8 fuentes | Revisé los enlaces antes de aceptarlos. |
| Diseño | Más información, dibujos y diagramas | Amplió las diapositivas sin pasar de 4 viñetas y generó la v1.1.0 | Acepté, porque respetaba la especificación y conservaba la v1.0.0 en el historial. |
| Agente con IA | Usar GitHub Models para reescribir el contenido | Avisó que GitHub Models se retiró el 30/07/2026 y preguntó qué proveedor usar | No usé proveedores externos, para evitar claves y costos. |
| Detector | Workflow que avise cuando cambien las fuentes | El workflow guardaba los hashes nuevos al detectar cambios | Lo cambié para que solo abra un issue; si no, un cambio podía perderse sin aviso. |
| Ejecución | Usar el agente en la nube de GitHub | La pestaña Agents mostró que está desactivado por el administrador | Ejecuto el agente en la app de escritorio, donde sí funciona con mi cuenta. |
| Frecuencia | Que el agente corra a demanda | El primer diseño corría cada lunes | Lo dejé solo a demanda para controlar cuándo se actualiza. |

El registro de las interacciones está en [`docs/bitacora-copilot.md`](docs/bitacora-copilot.md).

## Especificación

### Objetivo

Crear un onboarding breve para que una persona recién contratada en GitLab comprenda los aspectos esenciales de la empresa y de su forma de trabajar en aproximadamente 15 minutos. La persona confirmará su comprensión mediante un quiz.

### Contenido

El onboarding tendrá 8 diapositivas, una por cada tema:

1. **Bienvenida:** qué es GitLab y cómo se usa este onboarding.
2. **Misión y visión.**
3. **Valores de la empresa.**
4. **Trabajo 100 % remoto.**
5. **Comunicación:** trabajo asíncrono y principio de “primero el handbook”.
6. **Proceso de onboarding y buddy.**
7. **Seguridad y uso aceptable de herramientas.**
8. **Primera semana:** lista de tareas.

Cada diapositiva incluirá:

- Un título.
- 3 o 4 viñetas breves, redactadas con palabras propias; no se copiarán párrafos de las fuentes.
- Un enlace a la página oficial correspondiente del GitLab Handbook.

### Presentación

- Se avanza con los botones **Anterior** y **Siguiente**, y con las flechas del teclado.
- Se muestra “Diapositiva X de 8” junto con una barra de progreso.
- El progreso se guarda en el navegador (`localStorage`) para poder retomar donde se quedó.
- Al terminar la última diapositiva aparece el botón **Comenzar quiz**.

### Quiz

- El banco tendrá al menos 25 preguntas y al menos 3 preguntas por cada uno de los 8 temas.
- Cada pregunta tendrá exactamente 4 opciones, una sola respuesta correcta, una explicación breve y el tema al que pertenece.
- Todas las preguntas deberán poder contestarse usando únicamente la información presentada en las diapositivas.
- Cada intento presentará 10 preguntas elegidas al azar, sin repetir preguntas dentro del mismo intento. El orden de las opciones también se mezclará.
- Al responder cada pregunta, se indicará si la respuesta es correcta y se mostrará su explicación.
- Se aprobará con un resultado de 80 % o más (8 de 10 respuestas correctas).
- Si no se aprueba, se indicarán los temas que conviene repasar y se permitirá iniciar otro intento.

### Versiones

- Cada versión será un único archivo HTML autocontenido en `versiones/vX.Y.Z/onboarding.html`.
- La primera versión será la 1.0.0. Si cambia el contenido, se incrementará el número del medio (por ejemplo, 1.0.0 → 1.1.0).
- Cada versión mostrará al pie su número, la fecha de generación y las páginas fuente utilizadas.
- `versiones/historial.json` registrará la versión, la fecha y los temas cambiados; `index.html` abrirá la última versión.

### Reglas para el agente

- Usar exclusivamente las páginas enumeradas en `agente/fuentes.json`.
- Actualizar únicamente los temas cuyas páginas de fuente hayan cambiado.
- Si ninguna página cambió, no crear una versión nueva, excepto cuando el usuario solicite explícitamente **Actualizar onboarding**, que fuerza la actualización de los ocho temas y genera una versión.
- No agregar enlaces que no estén en `agente/fuentes.json`.
- No publicar una versión si no cumple todos los requisitos del quiz descritos en este README.
- Proponer cada versión nueva mediante un pull request que deberá revisar una persona antes de publicarse.
- Ejecutar el workflow solo a demanda, sin ejecuciones programadas.

### Actualización de fuentes

- El agente personalizado `.github/agents/actualizador-onboarding.agent.md` ejecuta localmente `node agente/actualizar.js` y consulta solo las URL autorizadas en `agente/fuentes.json`; no depende de un issue de Actions para iniciar.
- El workflow compara los hashes SHA-256 y abre un issue con los temas cambiados, sus URL y los hashes detectados. No modifica ni hace commit de archivos del repositorio; si ninguna página cambió, no abre un issue.
- El agente actualiza únicamente las diapositivas, preguntas y hashes de los temas reportados por el detector local, todo en el mismo pull request.
- Si la validación de `node agente/construir.js` falla, no debe generar ni proponer una versión.
- Una actualización válida genera la siguiente versión menor y se propone mediante un pull request para revisión humana. No se publica directamente en la rama predeterminada.
- El generador permite especificar la versión y los temas cambiados mediante `ONBOARDING_VERSION` y `ONBOARDING_CHANGED_TOPICS`; el agente debe pasar ambos valores al ejecutar `node agente/construir.js`.
- No hay una integración con servicios externos de generación de texto.
