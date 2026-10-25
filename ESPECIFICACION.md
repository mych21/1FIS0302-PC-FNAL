# Especificación: onboarding de GitLab

## Objetivo

Crear un onboarding breve para que una persona recién contratada en GitLab comprenda los aspectos esenciales de la empresa y de su forma de trabajar en aproximadamente 15 minutos. La persona confirmará su comprensión mediante un quiz.

## Contenido

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

## Presentación

- Se avanza con los botones **Anterior** y **Siguiente**, y con las flechas del teclado.
- Se muestra “Diapositiva X de 8” junto con una barra de progreso.
- El progreso se guarda en el navegador (`localStorage`) para poder retomar donde se quedó.
- Al terminar la última diapositiva aparece el botón **Comenzar quiz**.

## Quiz

- El banco tendrá al menos 25 preguntas y al menos 3 preguntas por cada uno de los 8 temas.
- Cada pregunta tendrá exactamente 4 opciones, una sola respuesta correcta, una explicación breve y el tema al que pertenece.
- Todas las preguntas deberán poder contestarse usando únicamente la información presentada en las diapositivas.
- Cada intento presentará 10 preguntas elegidas al azar, sin repetir preguntas dentro del mismo intento. El orden de las opciones también se mezclará.
- Al responder cada pregunta, se indicará si la respuesta es correcta y se mostrará su explicación.
- Se aprobará con un resultado de 80 % o más (8 de 10 respuestas correctas).
- Si no se aprueba, se indicarán los temas que conviene repasar y se permitirá iniciar otro intento.

## Versiones

- Cada versión será un único archivo HTML autocontenido en `versiones/vX.Y.Z/onboarding.html`.
- La primera versión será la 1.0.0. Si cambia el contenido, se incrementará el número del medio (por ejemplo, 1.0.0 → 1.1.0).
- Cada versión mostrará al pie su número, la fecha de generación y las páginas fuente utilizadas.
- `versiones/historial.json` registrará la versión, la fecha y los temas cambiados; `index.html` abrirá la última versión.

## Reglas para el agente

- Usar exclusivamente las páginas enumeradas en `agente/fuentes.json`.
- Actualizar únicamente los temas cuyas páginas de fuente hayan cambiado.
- Si ninguna página cambió, no crear una versión nueva.
- No agregar enlaces que no estén en `agente/fuentes.json`.
- No publicar una versión si no cumple todos los requisitos del quiz descritos en esta especificación.
- Proponer cada versión nueva mediante un pull request que deberá revisar una persona antes de publicarse.

## Aviso

Este es un proyecto académico, no oficial y no afiliado a GitLab. No se utilizará el logotipo de GitLab.
