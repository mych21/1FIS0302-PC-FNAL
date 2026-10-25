# Bitácora de interacciones con Copilot

Registro cronológico de las solicitudes y del trabajo realizado para este proyecto académico. Fechas de conversación en hora local (UTC-05:00), salvo que se indique otra zona horaria.

## 24 de octubre de 2026

### Borrador inicial de la especificación

- Se solicitó documentar un onboarding académico para nuevas personas de GitLab, de aproximadamente 15 minutos, con ocho temas: bienvenida, misión y visión, valores, trabajo remoto, comunicación, proceso de onboarding y buddy, seguridad y primera semana.
- Se pidió que cada diapositiva tuviera título, entre tres y cuatro viñetas en palabras propias y un enlace oficial del GitLab Handbook.
- También se definieron los requisitos del quiz y del agente: banco de al menos 25 preguntas, mínimo tres por tema, diez preguntas aleatorias por intento, aprobación desde 8/10, fuentes limitadas a `fuentes.json`, actualización según cambios de fuente y revisión humana mediante pull request.
- Se creó `ESPECIFICACION.md` con esos requisitos. Se renombró la rama de trabajo a `mych21-gitlab-onboarding-spec`.
- El usuario confirmó que el resultado era correcto.

### Requisitos adicionales y commit de la especificación

- Se añadieron requisitos para navegar las diapositivas con botones y flechas, guardar progreso en `localStorage`, mostrar avance y ofrecer el quiz al terminar.
- Se especificaron la retroalimentación por respuesta y el registro de versiones HTML, historial y página de entrada.
- Se ampliaron las reglas del agente para no generar versiones si las fuentes no cambiaron y para limitar enlaces a `agente/fuentes.json`.
- Los cambios se guardaron en el commit `6ceb30d` (`docs: ampliar especificación del onboarding`).
- Cuando el usuario indicó que no veía los cambios en la rama, se comprobó que el commit todavía no estaba publicado y se subió la rama a `origin`.

### Fuentes oficiales y generación del onboarding

- Se identificaron y consultaron páginas públicas del GitLab Handbook para los ocho temas. Las URLs seleccionadas están registradas en `agente/fuentes.json`.
- Se crearon:
  - `agente/fuentes.json`, con id, título, URL y hash vacío para cada tema.
  - `datos/slides.json`, con una diapositiva por tema y enlaces a sus fuentes.
  - `datos/quiz.json`, con 32 preguntas, cuatro opciones, índice de respuesta correcta y explicación.
  - `agente/plantilla.html`, con HTML, CSS y JavaScript sin librerías.
  - `agente/construir.js`, generador sin dependencias de Node que valida los requisitos antes de generar el contenido.
- El generador produjo `versiones/v1.0.0/onboarding.html`, `versiones/historial.json` e `index.html`.
- Se verificaron las cantidades de fuentes, diapositivas y preguntas, la sintaxis JavaScript generada y los flujos de presentación y quiz en navegador.

### Ampliación visual de las diapositivas

- Se pidió ampliar la información y añadir dibujos y diagramas para facilitar la comprensión.
- Se ampliaron las cuatro viñetas de cada diapositiva y se añadieron ilustraciones y diagramas adaptables a pantallas pequeñas: flujos, ciclo, cuadrículas de valores y seguridad, red de comunicación, ruta de onboarding y cronología de las primeras semanas.
- Se actualizó el generador para conservar el historial de versiones existentes y validar los datos visuales.
- Según la regla de versionado, el contenido actualizado se generó como `versiones/v1.1.0/onboarding.html`; `versiones/historial.json` conserva las versiones 1.0.0 y 1.1.0, e `index.html` dirige a la última.
- Se probaron la navegación, el progreso, el quiz aleatorio de diez preguntas sin repetición, la retroalimentación, la aprobación, el resultado no aprobado y los temas para repasar. También se comprobó el diseño en una ventana estrecha.

### Pull request

- Se guardó el onboarding y sus datos en el commit `1d5cb92` (`feat: crear onboarding interactivo de GitLab`), se publicó la rama y se abrió el pull request [#1](https://github.com/mych21/1FIS0302-PC-FNAL/pull/1).
- GitHub notificó que el pull request se fusionó en `main` el 25 de octubre de 2026 a las 01:17:55 UTC.

### README como documento principal

- El usuario indicó que `ESPECIFICACION.md` debía ser el README.
- Se trasladó la especificación completa a `README.md`, se actualizó la referencia a la especificación para que apuntara al README y se eliminó `ESPECIFICACION.md`, evitando mantener copias separadas.
- Esta actualización posterior al pull request quedó sin commit en el worktree al redactar la presente bitácora.

### Registro de interacciones

- El usuario solicitó registrar las interacciones de este trabajo en `docs/bitacora-copilot.md`.
- Este archivo se creó para conservar el historial de solicitudes, cambios, verificaciones y estado de revisión descritos arriba.

## Solicitud posterior: automatización de actualización de fuentes

- Se solicitó crear `agente/actualizar.js` para descargar el texto principal de cada página de `agente/fuentes.json`, calcular hashes SHA-256, actualizar solo los temas cuya fuente cambió y generar una nueva versión menor mediante `agente/construir.js`.
- Se pidió una opción `--inicializar` que guarde los hashes actuales sin crear una versión, además de un workflow manual que abra un pull request o un issue si falla la validación.
- Durante la investigación se confirmó que el endpoint de GitHub Models solicitado ya no es una opción operativa. Se prepararon provisionalmente un actualizador y un workflow que dependían de ese servicio, pero se retiraron para no dejar una integración rota.
- Después se solicitó cambiar el enfoque a un agente personalizado de Copilot que trabaje a partir de un issue con los temas cambiados, limite las fuentes a `agente/fuentes.json`, actualice solo los temas afectados y abra un pull request únicamente tras validar la nueva versión.
- Se creó `.github/agents/actualizador-onboarding.agent.md` con esas reglas, la comparación de hashes, la actualización de los datos y la revisión humana obligatoria mediante pull request. Si no cambia ningún hash, el agente debe detenerse sin crear una versión.
- Se actualizó `agente/construir.js` para aceptar una versión y los temas modificados desde variables de entorno, validar hashes SHA-256 para temas actualizados y rechazar versiones o listas de temas mal formadas.
- Se reemplazó la documentación provisional de GitHub Models y del workflow en `README.md` por el procedimiento del agente personalizado. No se conserva un workflow programado ni se usa un servicio externo de generación.

### Detector manual de cambios en las fuentes

- Se solicitó implementar `agente/actualizar.js` sin dependencias ni APIs de IA para extraer el texto principal de cada fuente, comparar hashes SHA-256, guardar hashes iniciales con `--inicializar` y generar un archivo de salida con los temas modificados.
- Se añadió `.github/workflows/agente-onboarding.yml`, ejecutable solo mediante `workflow_dispatch`, con permisos `contents: write` e `issues: write`; crea un issue con los temas y URLs detectados, y guarda los nuevos hashes.
- Se actualizó la guía del agente para recibir del issue los temas afectados, y el README para documentar el workflow y el comando de inicialización.
- A solicitud del usuario, el workflow se ajustó para no modificar ni hacer commit de `agente/fuentes.json` y se retiró `contents: write`. Ahora el issue incluye los hashes detectados y el agente actualizador guarda los hashes de los temas afectados en el mismo pull request que las diapositivas y preguntas.
- Se registró el ajuste en el commit `c5c223a` (`fix: evitar cambios de fuentes desde workflow`) y se abrió el pull request [#4](https://github.com/mych21/1FIS0302-PC-FNAL/pull/4), que se fusionó en `main` el 25 de octubre de 2026 a las 01:50:45 UTC.

### Registro completo de la bitácora

- El usuario pidió registrar toda la bitácora de interacciones en este archivo; se mantiene aquí el historial cronológico de requisitos, cambios, validaciones, commits y revisiones de pull request.
- El usuario aclaró que la actualización del contenido se realiza con el agente de Copilot en GitHub, desde la pestaña **Agents**, disponible de forma limitada en Copilot Free. Se corrigió la descripción correspondiente en `README.md`.
- El usuario aclaró que el agente en la nube está desactivado por el administrador de la cuenta institucional y pidió que el agente personalizado trabaje desde la app de escritorio de GitHub Copilot: ejecutar localmente el detector, detenerse si no hay cambios y, si los hay, actualizar solo esos temas, validar, crear una rama, commit y pull request.
- Se actualizaron las instrucciones de `.github/agents/actualizador-onboarding.agent.md` y la sección correspondiente del README. El workflow de Actions se documenta como detector opcional; no sustituye el flujo local del agente.
- El usuario solicitó crear una rama y un commit con el título `Onboarding vX.Y.Z` y abrir un pull request con ese mismo título después de validar la nueva versión. Las instrucciones del agente reflejan ese requisito.
- Se pidió completar el README con una guía numerada para ejecutar el agente en la app de escritorio, instrucciones de uso del onboarding, dos funcionalidades adicionales, la versión de Node.js instalada y cómo abrir el HTML generado. La versión comprobada con `node --version` es `v26.12.1`.
- Se añadió la sección `Cómo ejecutar el agente` con los cuatro pasos de inicio, solicitud, revisión/fusión del pull request y comportamiento cuando no hay cambios. Se añadieron también las indicaciones de uso del quiz, las funcionalidades de agente e historial y la apertura local del HTML.
- El usuario pidió completar la tabla `Uso de GitHub Copilot` con siete decisiones sobre especificación, fuentes, diseño, GitHub Models, detector, ejecución y frecuencia. Se incorporaron las filas proporcionadas en `README.md`.
- El usuario solicitó hacer commit y guardar la bitácora completa. Se registraron estas solicitudes y cambios para incluirlos junto con el README en el commit correspondiente.
- El usuario solicitó que “Forzar actualización de [tema]” active una actualización aunque el hash no cambie, con selección por ID, lista separada por comas o `todos`, y error con IDs válidos para nombres desconocidos. Se añadió `--forzar` a `agente/actualizar.js`, se actualizaron las instrucciones del agente y se documentó la opción en `README.md`.
- Se probaron `--forzar valores,comunicacion`, `--forzar todos` y un tema inexistente. Los dos primeros generaron reportes correctos sin modificar `agente/fuentes.json`; el tema inválido falló e indicó la lista de IDs permitidos.
- El usuario aclaró que cada solicitud exacta “Actualizar onboarding” debe crear una versión nueva aunque no haya cambios en las páginas fuente. Se actualizó el README y las instrucciones del agente para que esa petición ejecute `node agente/actualizar.js --forzar todos` y regenere los ocho temas; la regla general de no crear versiones sin cambios conserva esta excepción explícita.
- En una nueva solicitud “Actualizar onboarding” se forzó la revisión de los ocho temas y se consultaron sus URL autorizadas del Handbook. Se reescribieron las ocho diapositivas y las 32 preguntas con palabras propias, conservando los IDs, la estructura y los enlaces; los hashes reportados coincidieron con los ya registrados.
- El generador validó el banco y creó la versión `1.2.0`, con los ocho temas en `versiones/historial.json` e `index.html` apuntando a la versión nueva. Se comprobó que `git diff --check` no reportara errores.
- Los cambios se guardaron en el commit `565aee8` (`Onboarding v1.2.0`) y se abrió el pull request [#10](https://github.com/mych21/1FIS0302-PC-FNAL/pull/10) para revisión humana.
- Tras la fusión de la versión 1.2.0, se atendió otra solicitud “Actualizar onboarding”: se forzó la revisión de los ocho temas y se consultaron de nuevo las ocho fuentes autorizadas. Los hashes no cambiaron; aun así, se actualizaron las diapositivas y preguntas para reflejar el contenido vigente, incluidos la misión para la era de la IA, la colaboración en más de 65 países, las responsabilidades del buddy y las etapas del onboarding remoto.
- El generador validó 8 diapositivas, 32 preguntas y 8 fuentes, y creó la versión `1.3.0`. `index.html` apunta a esa versión y `versiones/historial.json` registra los ocho temas.
- La versión 1.3.0 se guardó en el commit `6e4df45` (`Onboarding v1.3.0`) y se abrió el pull request [#11](https://github.com/mych21/1FIS0302-PC-FNAL/pull/11) para revisión humana.
