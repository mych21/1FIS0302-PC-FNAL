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

## Cómo usarlo

Abre [el onboarding de GitLab](https://mych21.github.io/1FIS0302-PC-FNAL/).

## Cómo ejecutarlo localmente

Con Node.js instalado, ejecuta desde la raíz del repositorio:

```sh
node agente/construir.js
```

El generador valida los datos y crea el HTML autocontenido de la versión configurada en `versiones/`, además de actualizar el historial y `index.html`.

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

El workflow de detección se ejecuta solo a demanda desde **Actions**. Ejecuta `node agente/actualizar.js`, que consulta las páginas registradas en `agente/fuentes.json`, compara sus hashes SHA-256 y escribe los temas afectados en un archivo temporal de salida. Si detecta cambios, abre un issue con los temas, sus URL y los hashes SHA-256 detectados. El workflow no modifica ni hace commit de archivos del repositorio; si no hay cambios, no abre un issue.

Después, la actualización del contenido la realiza el agente de Copilot en GitHub, desde la pestaña **Agents**, siguiendo este README y usando únicamente las fuentes autorizadas. Está disponible de forma limitada en Copilot Free. El agente actualizador guarda los hashes de los temas afectados en `agente/fuentes.json`, junto con los cambios de `datos/slides.json` y `datos/quiz.json`, y propone todo en un mismo pull request que debe revisar una persona antes de publicarse.

Para inicializar los hashes manualmente, ejecuta `node agente/actualizar.js --inicializar`. Esta opción solo guarda los hashes actuales y no genera una versión.

## Uso de GitHub Copilot

| Tarea | Qué pedí | Qué sugirió | Mi decisión y por qué |
|---|---|---|---|

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
- Si ninguna página cambió, no crear una versión nueva.
- No agregar enlaces que no estén en `agente/fuentes.json`.
- No publicar una versión si no cumple todos los requisitos del quiz descritos en este README.
- Proponer cada versión nueva mediante un pull request que deberá revisar una persona antes de publicarse.
- Ejecutar el workflow solo a demanda, sin ejecuciones programadas.

### Actualización de fuentes

- El agente personalizado `.github/agents/actualizador-onboarding.agent.md` procesa el issue del workflow y consulta solo las URL de los temas indicados que coincidan con `agente/fuentes.json`.
- El workflow compara los hashes SHA-256 y abre un issue con los temas cambiados, sus URL y los hashes detectados. No modifica ni hace commit de archivos del repositorio; si ninguna página cambió, no abre un issue.
- El agente actualiza únicamente las diapositivas y preguntas de los temas indicados en el issue y guarda sus hashes nuevos en `agente/fuentes.json`, todo en el mismo pull request.
- Si la validación de `node agente/construir.js` falla, no debe generar ni proponer una versión.
- Una actualización válida genera la siguiente versión menor y se propone mediante un pull request para revisión humana. No se publica directamente en la rama predeterminada.
- El generador permite especificar la versión y los temas cambiados mediante `ONBOARDING_VERSION` y `ONBOARDING_CHANGED_TOPICS`; el agente debe pasar ambos valores al ejecutar `node agente/construir.js`.
- No hay una integración con servicios externos de generación de texto.
