# Requisitos del proyecto

El proyecto consiste en desarrollar una aplicación móvil que consuma la API de películas y series de TMDB y muestre la información de forma clara y eficiente. Queremos ver cómo aplicas tus habilidades en el desarrollo móvil, utilizando buenas prácticas y técnicas que garanticen una app eficiente y escalable.

Esperamos que desarrolles la aplicación utilizando React Native CLI y TypeScript (obligatorio), junto con Redux (o el gestor de estado global que prefieras, justificando la elección) y React Navigation para la navegación entre pantallas.

## Especificaciones del proyecto

- La aplicación debe mostrar un listado de películas o series obtenido a través de la API de TMDB, pudiendo elegir el endpoint que consideres más conveniente (populares, mejor valoradas, en cartelera, etc.).
- Cada elemento de la lista debe mostrar la imagen del póster, el título y la valoración de la película o serie.
- Al hacer tap en un elemento, se debe mostrar una pantalla de detalles con información adicional: sinopsis, géneros, fecha de estreno, e imagen en mayor resolución.
- La aplicación debe contar con una barra de búsqueda que permita buscar películas o series por nombre.
- La aplicación debe ser compatible con dispositivos Android e iOS.
- El manejo de estados de UI es parte de la evaluación: se espera que la aplicación gestione correctamente los estados de carga, error y lista vacía de forma visible para el usuario.

## Documentación de la API

- TMDB API: https://developer.themoviedb.org/docs/getting-started
- El registro para obtener una API key es gratuito.

## Criterios de evaluación

Tu entrega será evaluada en los siguientes aspectos, en orden de importancia:

1. **Funcionalidad** — La app cumple con todas las especificaciones y compila sin errores en Android e iOS.
2. **Calidad del código** — Uso correcto de TypeScript, componentes bien estructurados, separación de responsabilidades.
3. **Arquitectura** — Cómo organizas el proyecto, la lógica de negocio, y la gestión del estado.
4. **Experiencia de usuario** — Manejo de estados de carga/error, navegación fluida, interfaz clara.
5. **Buenas prácticas de React Native** — Uso apropiado de listas optimizadas, manejo de imágenes, y consideraciones de rendimiento.

## Entrega

- La entrega de este proyecto puede hacerse hasta el lunes 13 de julio por la mañana.
- Subí el código a un repositorio de GitHub (puede ser privado, en ese caso compartí el acceso).
- Incluí en el README las instrucciones necesarias para compilar y correr la aplicación sin inconvenientes. Es importante recalcar que forma parte importante de la evaluación que la aplicación se pueda compilar sin problemas.
