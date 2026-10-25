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
