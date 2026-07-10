# Plan del proyecto

Este documento registra las decisiones de arquitectura, librerías y el plan de trabajo para el challenge. Se irá actualizando a medida que avance el desarrollo.

## Alcance funcional

Alcance final:

- **Movies + TV shows**: no solo películas, también series, con la misma UX (listado, búsqueda, detalle).
- **Favoritos**: marcar/desmarcar ítems como favoritos, persistidos localmente, con una pantalla dedicada.
- **Tests**: cobertura con Jest + React Native Testing Library sobre componentes y lógica clave, no solo verificación manual de build.
- **`expo-image`**: se acepta el riesgo de linking nativo extra (instalar un módulo de Expo en un proyecto RN CLI puro) a cambio de mejor caché/performance de imágenes, ya que hay margen de tiempo para resolver problemas de build si aparecen. Se eligió sobre `react-native-fast-image` porque este último no soporta la New Architecture (ver sección "Imágenes: expo-image").
- **i18n completo (es/en)**: textos de la UI vía `react-i18next`, con regla de lint que prohíbe strings hardcodeados en JSX. Además de buena práctica de código, el idioma activo también controla el parámetro `language` que se manda a TMDB, así que cambiar de idioma cambia interfaz **y** contenido (sinopsis, títulos, géneros).
- **Tests E2E/integración con Maestro + CI en GitHub Actions**: además de Jest/RNTL (que no levantan la app real) y de `mobile-mcp` (que depende de que un agente esté presente para manejarlo), se suman flujos de Maestro versionados en el repo que corren solos en CI — cubre el hueco de verificación automática y repetible que ni los tests unitarios ni la exploración con el agente resuelven.

Sigue siendo prioridad #1 que la app compile sin errores en Android e iOS — si algún extra pone eso en riesgo cerca de la entrega, se recorta primero (orden de recorte al final del documento).

## Stack técnico

| Área | Elección | Justificación |
|---|---|---|
| Framework | React Native CLI + TypeScript (`strict: true`) | Requerido por el challenge. |
| Estado global | **Redux Toolkit + RTK Query** | Redux es la opción sugerida por el challenge. RTK Query evita boilerplate de thunks/reducers manuales para llamadas HTTP y expone `isLoading` / `isError` / `isSuccess` / caché por query key de forma nativa — encaja directamente con el requisito de manejar estados de carga/error/vacío. También da cancelación automática de requests obsoletos, clave para el buscador. |
| Persistencia | `redux-persist` + `@react-native-async-storage/async-storage` | `redux-persist` persiste a `AsyncStorage` sin escribir código manual de lectura/escritura ni sincronización con el store. Se persisten dos cosas con distinto propósito: el slice `favorites` (datos del usuario) y el reducer de `tmdbApi` (caché de RTK Query, para mostrar contenido ya visto al instante al reabrir la app). Ver sección "Caché offline". |
| Navegación | React Navigation: Bottom Tabs (`Movies`, `TV Shows`, `Favorites`) + Native Stack por tab | Cada tab tiene su propio stack `List → Details`, permitiendo mantener el historial de navegación independiente por sección. Estándar de facto en RN, requerido por el challenge. |
| Cliente HTTP | `fetch` nativo vía `fetchBaseQuery` de RTK Query, auth con **Bearer token** (`Authorization: Bearer <TMDB_READ_ACCESS_TOKEN>` en `prepareHeaders`) | Evita dependencia extra (axios) cuando RTK Query ya cubre la necesidad. TMDB recomienda el *API Read Access Token* (v4, Bearer) sobre el viejo `api_key` como query param (v3) — es el método vigente. |
| Imágenes | `expo-image` | Mejor caché en disco/memoria que el `Image` core de RN, relevante ahora que hay más pantallas con imágenes (movies + tv + favoritos). Se usa en vez de `react-native-fast-image` (el paquete original no soporta Fabric/New Architecture, que es obligatoria desde RN 0.82). Mantenido por el equipo de Expo, con soporte de primera clase para New Arch; se instala como módulo Expo individual en el proyecto RN CLI puro (`npx install-expo-modules`). Requiere `pod install` en iOS; se documenta el paso en el README. Si cerca de la entrega genera problemas de build, el plan de contingencia es volver a `Image` core (ver "orden de recorte"). |
| Listas | `FlatList` optimizada | `keyExtractor`, `renderItem` memoizado, `initialNumToRender`/`windowSize` ajustados, evitar funciones inline. |
| Estilos | `NativeWind` (Tailwind para RN) | Clases utilitarias vía transform de Babel/Metro — sin código nativo, así que no suma riesgo de `pod install` como sí lo hace `expo-image`. Reemplaza `StyleSheet.create` como forma principal de estilar; se documentan los ajustes que esto implica (lint, tokens, componentes de terceros) en la sección "Estilos". |
| Internacionalización | `i18next` + `react-i18next` + `react-native-localize` | `react-native-localize` detecta el idioma del dispositivo para el valor inicial; `i18next`/`react-i18next` resuelven los textos vía `useTranslation()`. Todo local (sin backend de traducciones), dos locales: `es` (default) y `en`. |
| Config / API key | `react-native-dotenv` (o `react-native-config` si hay problemas con iOS) | La API key de TMDB no debe hardcodearse ni commitearse. `.env.example` se versiona, `.env` va en `.gitignore`. |
| Lint / formato | ESLint (`@react-native/eslint-config` + `@typescript-eslint`) + Prettier | Reglas de calidad maduras para TS/React (import hygiene, complejidad, tipos estrictos), adaptadas a las particularidades de RN. Detalle completo en la sección "Linting". |
| Testing | Jest + React Native Testing Library | Parte del alcance, no stretch. Ver sección "Plan de testing". |
| Testing E2E/integración | **Maestro** | Flujos declarativos en YAML que manejan la app real (instalada en un emulador/simulador) vía accessibility tree — no necesita cambios en el build nativo (a diferencia de Detox), así que agrega poco riesgo de compilación. Corren igual localmente y en CI. Ver sección "Testing E2E: Maestro". |
| CI | GitHub Actions | El challenge ya pide subir el código a GitHub; un pipeline de lint + typecheck + tests (y opcionalmente Maestro) en cada push es la forma estándar de demostrar que "compila sin errores" no es solo una afirmación manual. Ver sección "CI/CD". |
| Detección de red | `@react-native-community/netinfo` | Complementa la caché offline: en vez de esperar a que un fetch falle para saber que no hay conexión, se sabe de antemano y se puede mostrar un banner persistente en vez de depender solo del error de la request. Ver sección "Caché offline". |
| Orientación | Portrait-only (config nativa, sin librería) | Ninguna pantalla está diseñada para landscape y el challenge no lo pide; se lockea en `AndroidManifest.xml` (`android:screenOrientation="portrait"`) y en Info.plist/project settings de iOS — cero dependencias nuevas, evita tener que testear layouts que no se van a usar. |
| Animaciones | `react-native-reanimated` (v3+) | Corre en el UI thread (no se traba con el JS thread, a diferencia de la `Animated` API clásica para casos complejos), y sus *layout animations* (`entering`/`exiting`/`layout`) dan transiciones de calidad con muy poco código. Es el estándar de facto del ecosistema RN para esto. Ver sección "Animaciones". |

### Alternativas consideradas y descartadas

- **Zustand / React Query** en vez de Redux Toolkit: técnicamente válido y más liviano, pero el challenge sugiere explícitamente Redux y pide justificar la elección — se prioriza mostrar dominio de Redux Toolkit/RTK Query.
- **Axios**: no aporta nada que `fetchBaseQuery` no resuelva ya para este caso de uso.
- **Guardar favoritos como objeto completo de la película/serie**: se descarta; se guarda solo `{ id, mediaType }` y el detalle se resuelve contra la API (o contra la caché de RTK Query si ya está tibia) para no tener datos duplicados/desactualizados en `AsyncStorage`.
- **Solo archivo de labels sin librería de i18n**: hubiese cubierto "no hardcodear strings" con menos dependencias, pero se descarta porque no permite cambiar de idioma en runtime ni sincronizar con el parámetro `language` de TMDB — se prioriza la solución completa dado que hay margen de tiempo.
- **`StyleSheet.create` a mano**: cero dependencias y cero riesgo de build, pero se descarta a favor de NativeWind (ver sección "Estilos") por preferencia explícita. **Shopify Restyle** (theming tipado sobre `StyleSheet`) también se consideró como alternativa intermedia, pero se descarta por ser una librería/patrón adicional a aprender sin el beneficio de familiaridad que sí da Tailwind.
- **Detox** en vez de Maestro para E2E: es el framework "gray-box" más establecido en el ecosistema RN (sincroniza con el event loop de la app, similar en espíritu a Playwright), pero requiere modificar el build nativo (config de Detox en Android/iOS, compilar variantes específicas para test) — más riesgo de build justo en el área que es prioridad #1 del challenge, y más lento de dejar funcionando antes del lunes. Se documenta como alternativa por si en algún momento Maestro se queda corto para un flujo puntual, pero no se implementa.
- **`react-native-shared-element` / `react-navigation-shared-element`**: fue durante años la forma estándar de hacer shared element transitions en RN, pero es una librería más chica, con mantenimiento menos activo, y pensada para el stack navigator basado en JS — no para `native-stack` (que usamos acá). Se descarta a favor de la API de shared element transitions integrada en Reanimated 3+ (vía `react-native-screens`), que sí está pensada para `native-stack` y es la que se mantiene activamente hoy.

## Estructura de carpetas propuesta

Eje principal: **separar el árbol visual (`ui/`, organizado con atomic design) de la lógica de negocio (`api/`, `store/`, `hooks/`, `types/`, `navigation/`)**. Ver la sección siguiente para la justificación completa.

```
src/
  api/
    tmdbApi.ts          # RTK Query apiSlice: getPopularMovies, searchMovies, getMovieDetails,
                         # getPopularTv, searchTv, getTvDetails
                         # (sin endpoints de géneros: /movie/{id} y /tv/{id} ya devuelven
                         #  genres: [{id, name}] completo, no hace falta resolverlo aparte)
  store/
    index.ts            # configureStore + redux-persist; exporta RootState, AppDispatch
    favoritesSlice.ts   # add/remove/toggle, persistido (whitelist)
  hooks/
    useAppDispatch.ts    # useDispatch tipado con AppDispatch
    useAppSelector.ts    # useSelector tipado con RootState
    useDebouncedValue.ts
    useIsFavorite.ts     # selector granular por id (favoritesSlice)
    useFavoriteActions.ts # toggle/add/remove (favoritesSlice)
  types/
    media.ts             # Media, MediaDetails, Genre (unión movie/tv normalizada)
    common.ts             # MediaType, Locale, PaginatedResponse<T>
  navigation/
    RootNavigator.tsx    # Bottom Tabs: Movies | TV Shows | Favorites
    MoviesStackNavigator.tsx
    TvStackNavigator.tsx
    FavoritesStackNavigator.tsx
    routes.ts             # ROUTES const centralizado
    types.ts             # ParamLists tipados por stack + *ScreenProps
  app/
    App.tsx              # <ErrorBoundary><AppProviders><RootNavigator /></AppProviders></ErrorBoundary>
    ErrorBoundary.tsx    # class component, getDerivedStateFromError/componentDidCatch, fallback con ErrorState
    providers/
      AppProviders.tsx   # compone Gesture/SafeArea/Redux+PersistGate/I18next/NavigationContainer
  i18n/
    index.ts             # init de i18next (detección de idioma, fallback, recursos)
    locales/
      es.json
      en.json
  theme/
    tokens.ts             # colores/spacing/tipografía como valores planos — fuente única, la importa tailwind.config.js
  global.css               # directivas @tailwind, entry point de NativeWind
  config/
    env.ts               # lectura tipada de variables de entorno
  utils/
    image.ts             # helpers para armar URLs de imagen TMDB (w342, w500, original, etc.)
  ui/                     # árbol visual, atomic design (ver sección debajo)
    atoms/
      Poster.tsx
      RatingBadge.tsx
      Badge.tsx
    molecules/
      SearchBar.tsx
      FavoriteButton.tsx
      LanguageSwitcher.tsx
      LoadingState.tsx
      ErrorState.tsx
      EmptyState.tsx
      OfflineBanner.tsx
    organisms/
      MediaListItem.tsx
      MediaDetailsHeader.tsx
    templates/
      ListTemplate.tsx        # layout de búsqueda + lista + estados, sin datos reales
      DetailsTemplate.tsx     # layout de header + sinopsis + géneros dentro de un ScrollView, sin datos reales
    pages/
      MoviesListScreen.tsx
      TvListScreen.tsx
      MovieDetailsScreen.tsx
      TvDetailsScreen.tsx
      FavoritesScreen.tsx
tailwind.config.js          # raíz del repo, no en src/ — theme.extend importa theme/tokens.ts
babel.config.js             # agrega el preset de nativewind
metro.config.js             # withNativeWind(config, { input: './src/global.css' })
nativewind-env.d.ts         # tipos de TS para la prop `className`
```

## Estilos: NativeWind

Se usa **NativeWind** (Tailwind compilado a estilos RN vía Babel/Metro, sin código nativo) en vez de `StyleSheet.create` a mano:

- **Tokens de diseño únicos**: `theme/tokens.ts` exporta colores/spacing/tipografía como objetos planos de TS; `tailwind.config.js` los importa en `theme.extend` para que las clases (`bg-primary`, `p-md`, etc.) usen los mismos valores que cualquier lugar que necesite el valor crudo (por ejemplo `tabBarActiveTintColor` de React Navigation, que no acepta `className`).
- **Componentes de terceros sin soporte nativo de `className`**: `expo-image` no es un primitivo que NativeWind envuelva por defecto (sí lo hace con `View`, `Text`, el `Image` core, `ScrollView`, `Pressable`, `TouchableOpacity`, `SafeAreaView`). Para poder usar `className` en el `Image` de `expo-image` hay que registrarlo explícitamente con `cssInterop` de NativeWind al importarlo (un wrapper chico en `ui/atoms/Poster.tsx`, que es el único lugar que lo usa directamente).
- **React Navigation**: los `screenOptions` de tabs/stacks (colores de header, tab bar) se configuran con objetos de estilo normales, no `className` — usan los valores de `theme/tokens.ts` directamente, no hay forma de evitar ese punto de fricción con ninguna librería de estilos.
- **Riesgo asumido y mitigación**: NativeWind es solo transform de build (sin `pod install`), así que el riesgo de build es menor que el de `expo-image`, pero como toca *todos* los componentes visuales, revertirlo tarde en el desarrollo sería costoso. Por eso se verifica que compile en Android e iOS con un componente de prueba **al principio** (parte del paso 2 del plan de trabajo), no se deja para el final.

## Imágenes: expo-image

Se cambió el plan original (`react-native-fast-image`) tras confirmar que el paquete original **no soporta Fabric/New Architecture** (issue abierto y sin resolver en el repo de DylanVann) — y desde RN 0.82 la New Architecture ya no es opcional, la arquitectura vieja fue eliminada del todo. Cualquier proyecto inicializado ahora la usa por default y sin forma de desactivarla, así que un módulo nativo sin soporte de Fabric directamente no compila o no funciona en runtime.

- **Elegido**: `expo-image`, mantenido por el equipo de Expo (uno de los equipos más grandes y activos del ecosistema RN), con soporte de Fabric/TurboModules de primera clase. Se puede usar en un proyecto RN CLI puro (sin adoptar el framework completo de Expo) instalando el módulo individual — `npx install-expo-modules@latest` agrega la config nativa necesaria (autolinking de `ExpoModulesCore` en Podfile/`settings.gradle`), después `npx expo install expo-image` como cualquier otra dependencia.
- **Descartado**: `@d11/react-native-fast-image` (fork comunitario que sí agrega soporte de Fabric, API 100% compatible con el original) — es una opción válida y más liviana en términos de setup (drop-in replacement, sin infraestructura de Expo), pero se prioriza `expo-image` por tener un mantenedor institucionalmente más sólido a largo plazo.
- **API**: `Image` de `expo-image` (importado como `Image` desde `'expo-image'`, alias `ExpoImage` para no chocar con el `Image` core de RN) usa `contentFit="cover"` en vez de `resizeMode`, `cachePolicy="memory-disk"` en vez del `priority: immutable` de FastImage, y soporta `placeholder` (blurhash/thumbhash) y `transition` (fade-in nativo al cargar) — no se usan estos últimos dos para no sumar alcance, pero quedan disponibles si hace falta pulir más adelante.
- **Con Reanimated**: para el shared element transition del poster (ver "Animaciones"), el `Image` de `expo-image` necesita envolverse con `Animated.createAnimatedComponent()` para aceptar `sharedTransitionTag` y demás props animadas de Reanimated — no es un componente `Animated.*` nativamente, igual que no lo era `FastImage`.

### New Architecture: auditoría del resto de dependencias nativas

El problema de `react-native-fast-image` (sin soporte de Fabric) hizo evidente que hay que revisar esto para *toda* dependencia con módulo nativo del stack, no asumir que "ya viene resuelto". Estado conocido de cada una (a confirmar en la práctica en el paso 1/5 del plan, instalando e inicializando cada una contra la versión de RN CLI real):

| Dependencia | Mantenedor | Riesgo esperado |
|---|---|---|
| `react-native-screens`, `react-native-gesture-handler`, `react-native-safe-area-context` | Software Mansion (core de React Navigation) | Bajo — soporte de Fabric maduro desde hace tiempo, son de los primeros en adoptarlo. |
| `react-native-reanimated` | Software Mansion | Bajo, con una salvedad: si se termina usando Reanimated 4 (vs. 3.x), esa versión **requiere** New Architecture — no es opcional ahí. Como la New Arch ya es obligatoria en el proyecto de todas formas, no cambia la decisión, pero si por algún motivo hubiera que forzar la arquitectura vieja, habría que pinnear Reanimated a 3.x. |
| `@react-native-async-storage/async-storage`, `@react-native-community/netinfo` | Comunidad (React Native Community) | Bajo — paquetes muy usados, alta prioridad de mantenimiento, soporte de Fabric ya establecido. |
| `expo-image` | Expo | Bajo (razón por la que se eligió, ver arriba). |
| `react-native-localize` | Comunidad (zoontek) | Medio — módulo nativo simple (solo lee configuración de idioma del dispositivo), superficie chica así que el riesgo de incompatibilidad es bajo en la práctica, pero no se verificó puntualmente como sí se hizo con fast-image. Se confirma al instalar. |
| `redux-persist` | — | Ninguno — es JS puro, no tiene módulo nativo propio (usa el `storage` engine que se le pase, acá `AsyncStorage`). |
| NativeWind | NativeWind team | Bajo — es transform de build, no un módulo nativo con lógica en Fabric/TurboModules; se construyó pensando en New Arch desde la v4. |

Ninguna otra dependencia del stack quedó con el mismo nivel de alarma que `react-native-fast-image`, pero la lección queda como pendiente de proceso: verificar Fabric/New Arch **antes** de comprometerse a una librería nativa, no después de que algo no compile.

## `ui/`: atomic design solo para el árbol visual

La duda inicial era si convenía organizar todo el proyecto con atomic design (atoms → molecules → organisms → templates → pages) o feature-based (`movies/`, `tv/`, `favorites/`). La resolución: **son ejes ortogonales, no alternativas excluyentes**. Atomic design clasifica *componentes visuales* por nivel de complejidad; no dice nada sobre dónde vive un slice de Redux, un endpoint de RTK Query o un tipo de dominio — eso sigue necesitando su propio criterio de organización (co-locación por módulo, ver sección "Types e interfaces"). Separando ambos ejes:

- **`ui/`** contiene *solo* componentes visuales, clasificados por complejidad:
  - `atoms/`: piezas mínimas sin lógica (`Poster`, `RatingBadge`, `Badge`).
  - `molecules/`: combinan atoms o agregan una interacción chica (`SearchBar`, `FavoriteButton`, `LanguageSwitcher`, y los tres estados `LoadingState`/`ErrorState`/`EmptyState`).
  - `organisms/`: piezas compuestas con conocimiento del dominio pero sin fetching propio — reciben datos y callbacks por props (`MediaListItem`, `MediaDetailsHeader`).
  - `templates/`: esqueleto de layout reusable sin datos reales — `ListTemplate` (buscador + lista + los 3 estados) lo comparten `MoviesListScreen`/`TvListScreen`/`FavoritesScreen`; `DetailsTemplate` (header + sinopsis + géneros) lo comparten `MovieDetailsScreen`/`TvDetailsScreen`. Como `Media` ya normaliza movies/tv al mismo shape, esto no se duplica por dominio.
  - `pages/`: los "screens" reales, el único lugar dentro de `ui/` con lógica conectada — llaman a los hooks de RTK Query/Redux y le pasan los datos ya resueltos al `template` correspondiente. Esto es intencional y coincide con el rol de "pages" en atomic design (la capa que conecta datos reales a la composición visual).
- **Todo lo que no es visual queda afuera de `ui/`**: `api/`, `store/`, `hooks/`, `types/`, `navigation/` — organizados por dominio/responsabilidad, no por complejidad. Esto es lo que le da a la app la separación de lógica de negocio que pide el criterio de evaluación "Arquitectura", sin que atomic design tenga que resolverlo (no le compete).

**Trade-off que asumimos conscientemente**: `organisms/`, `templates/` y `pages/` quedan como carpetas planas sin subcarpeta por dominio (no hay `organisms/movies/` separado de `organisms/tv/`). Para esta app (~5 pages, ~10 componentes en `ui/`) es más fácil de navegar así que si estuviera subdividida; si el proyecto creciera mucho más, ahí sí valdría la pena reagrupar por feature dentro de `ui/`.

## Types e interfaces: dónde viven

Regla general: **co-locados junto al módulo dueño del tipo**, no un archivo gigante de tipos compartidos:

- `navigation/types.ts`: `ParamList` por stack/tab y `*ScreenProps` (ver sección "Navegación").
- `types/media.ts`: `Media`, `MediaDetails`, `Genre` — el dominio de TMDB, usado por `api/`, `store/`, y por `ui/organisms`, `ui/templates` y `ui/pages`.
- `store/favoritesSlice.ts`: exporta su propio `FavoriteEntry` junto al slice que lo usa.
- `api/tmdbApi.ts`: tipos de request/response crudos de TMDB (antes de normalizar a `Media`), privados del módulo salvo que otro módulo los necesite.

Excepción: `types/common.ts`, un archivo chico para los pocos tipos genuinamente **cross-cutting** que no son dueños de ningún módulo — `MediaType = 'movie' | 'tv'` (lo usan movies, tv y favorites por igual), `Locale = 'es' | 'en'` (lo usan `i18n/` y `api/tmdbApi.ts`), y un genérico `PaginatedResponse<T>` si varios endpoints de TMDB comparten esa forma.

`RootState` y `AppDispatch` no van en `types/`: se exportan directamente desde `store/index.ts` (patrón estándar de Redux Toolkit), y los hooks tipados `useAppDispatch`/`useAppSelector` en `hooks/` los consumen — evita el típico `useSelector((state: RootState) => ...)` repetido sin tipar en cada componente.

## Providers: composición de la raíz

`App.tsx` no compone providers inline — los junta todos en `app/providers/AppProviders.tsx`, un único componente que envuelve `children` y mantiene `App.tsx` como una sola línea legible (`<ErrorBoundary><AppProviders><RootNavigator /></AppProviders></ErrorBoundary>`). Orden de anidado (de afuera hacia adentro, importa por dependencias):

0. `ErrorBoundary` (`app/ErrorBoundary.tsx`) — el más externo de todos, para poder capturar errores incluso si algo falla dentro de los providers.
1. `GestureHandlerRootView` — tiene que ser el más externo (después del boundary) para que React Navigation con gestos funcione.
2. `SafeAreaProvider` — necesario antes de cualquier UI que use `useSafeAreaInsets`.
3. `Provider` (Redux) + `PersistGate` (redux-persist, con `LoadingState` como fallback mientras hidrata `AsyncStorage`).
4. `I18nextProvider` (i18next).
5. `NavigationContainer` — el más interno, ya con store/i18n listos.

Separar esto en `providers/` (en vez de anidar todo en `App.tsx`) deja `App.tsx` como punto de entrada trivial y hace que testear pantallas sueltas con RNTL sea más fácil: los tests envuelven el componente en `AppProviders` (o un subconjunto) en vez de reconstruir el árbol de providers a mano en cada test.

### `ErrorBoundary`: red de contención ante errores de render

Sin esto, una excepción no capturada en cualquier render (un dato inesperado de TMDB, un bug) tira abajo toda la app con la pantalla roja/blanca de React Native, sin forma de recuperarse sin reiniciar el proceso. `ErrorBoundary` es un class component (sigue siendo el único mecanismo de React para `getDerivedStateFromError`/`componentDidCatch`, no tiene equivalente en hooks) que:

- Cuando captura un error, muestra un fallback reusando el propio `ui/molecules/ErrorState` (mensaje genérico + botón "reintentar" que resetea el estado del boundary y vuelve a montar `children`) — no hace falta un componente de error distinto para este caso.
- Loguea el error por `console.error` (suficiente para este alcance; no se suma un servicio de crash reporting como Sentry, fuera de alcance del challenge).
- Es un único boundary global, no uno por pantalla — para el tamaño de esta app, granularidad por página no aporta y complica la composición de providers.

## Navegación: tipado y convenciones

Para tipar bien tabs + stacks anidados:

- Un `ROUTES` const object centralizado en `navigation/routes.ts` (`{ MOVIES_LIST: 'MoviesList', MOVIE_DETAILS: 'MovieDetails', ... }`) en vez de strings sueltos repetidos por todos lados — evita typos y facilita renombrar rutas.
- `RootTabParamList` (bottom tabs) + un `ParamList` por stack (`MoviesStackParamList`, `TvStackParamList`, `FavoritesStackParamList`) en `navigation/types.ts`, y tipos de props por pantalla compuestos con `CompositeScreenProps` (combinando el tipo del stack con el del tab padre), no `NativeStackScreenProps` a secas — así una pantalla dentro de un stack anidado en un tab tiene acceso tipado a la navegación de ambos niveles.
- Cada page de `ui/pages/` exporta/usa su propio tipo de props (`MovieDetailsScreenProps`) derivado de esos genéricos, en vez de tipar `navigation`/`route` sueltos en cada archivo.
- **Título dinámico del header**: `MovieDetailsScreen`/`TvDetailsScreen` llaman a `navigation.setOptions({ title: media.title })` una vez resuelto el dato (o lo pasan como `options` de la ruta), en vez de dejar el header con el nombre técnico de la ruta (`"MovieDetails"`).

## Manejo de estados de UI

Tres componentes reutilizables en `ui/molecules/` (`LoadingState`, `ErrorState` con botón de reintentar, `EmptyState`), consumidos por `ui/templates/ListTemplate.tsx` y `ui/templates/DetailsTemplate.tsx`:

- **Carga**: se muestra mientras `isLoading` (RTK Query) es `true` — es decir, **no hay datos todavía** (ni frescos ni cacheados) y hay un fetch en curso. No confundir con `isFetching` (ver "Caché offline"): con caché persistida, `isLoading` casi nunca se ve tras el primer uso de la app.
- **Error**: se muestra si `isError` es `true` **y no hay datos cacheados para mostrar en su lugar** — con datos cacheados, un fetch fallido se degrada a un aviso chico no bloqueante en vez de tapar el contenido (ver "Caché offline"). `ErrorState` recibe el `status` del error de RTK Query y distingue el caso **401** (`"Verificá tu API key de TMDB en el archivo .env"`) del resto (`"Algo salió mal, reintentar"` genérico) — quien corra el proyecto va a usar **su propia** key, así que un 401 es el error más probable si algo quedó mal configurado, y un mensaje genérico no ayuda a diagnosticarlo.
- **Vacío**: cuando el listado/búsqueda devuelve `0` resultados, o cuando no hay favoritos guardados — mensaje distinto en cada caso.

Todos los textos de estos componentes salen de `i18n` (ver más abajo), no hardcodeados.

## Caché offline: mostrar datos ya vistos al reabrir la app

Sin esto, cada vez que se cierra y reabre la app, las listas de Movies/TV arrancan de cero — la caché de RTK Query vive solo en memoria del proceso. Se persiste también, además de `favorites`:

- **Qué se persiste**: el reducer de `tmdbApi` (RTK Query) vía `redux-persist`, con un transform que guarda solo el sub-estado `queries` (los resultados ya resueltos) — no `subscriptions` ni `config`, que son estado transitorio de la librería y no aportan nada persistidos.
- **Comportamiento al reabrir la app**: si ya existe una entrada de caché para la query actual (mismo endpoint + params + idioma, que es el cache key), el listado se pinta de inmediato con esos datos — sin `LoadingState` de pantalla completa — mientras en paralelo se dispara un refetch en segundo plano.
- **Indicador de refresh en segundo plano**: se usa `isFetching` (true en cualquier fetch en curso, tenga o no datos previos) para mostrar algo chico y no bloqueante — una barra de progreso fina arriba de la lista, por ejemplo — en vez de re-mostrar el spinner grande. La lista ya visible no se reemplaza ni parpadea mientras tanto.
- **Si el refetch en segundo plano falla**: como ya hay `data` (la cacheada), no se muestra `ErrorState` — se deja la lista vieja visible con un aviso chico ("no se pudo actualizar, mostrando datos guardados") en vez de bloquear la pantalla.
- **`keepUnusedDataFor`**: no afecta lo persistido en sí (eso depende de que `redux-persist` haya escrito a `AsyncStorage` antes de que la app se cierre, algo que hace con debounce en cada cambio de store), pero sí cuánto tiempo se mantiene la caché *en memoria* mientras la app está en primer plano sin esa pantalla montada — se sube un poco por encima del default (60s) para que navegar entre tabs no dispare refetches innecesarios.
- **Banner de "sin conexión"**: `@react-native-community/netinfo` avisa de entrada que no hay red (`NetInfo.addEventListener`), en vez de depender de que un fetch falle para saberlo. Con eso, un banner chico y persistente (no un modal, no bloquea nada) se muestra mientras `isConnected` es `false`, montado a nivel global (cerca de `AppProviders`, visible sin importar en qué tab/pantalla esté el usuario) — complementa el aviso puntual de "no se pudo actualizar" del punto anterior: uno informa *por qué* probablemente el refresh de fondo va a fallar, el otro confirma que ya falló.

## Buscador

- Input controlado con debounce (~400ms) vía hook `useDebouncedValue`.
- Cada tab (Movies/TV) busca contra su propio endpoint (`/search/movie` o `/search/tv`).
- Mientras el texto de búsqueda esté vacío, se muestra el listado por defecto (populares); si hay texto, se dispara la query de búsqueda correspondiente.
- RTK Query cancela automáticamente queries obsoletas al cambiar el query key (el término de búsqueda), evitando race conditions.
- `include_adult=false` fijo en todos los endpoints de búsqueda/listado — default de seguridad de contenido, no configurable desde la UI.

## Paginación

TMDB pagina de a 20 resultados (`page` como parámetro), tanto en listados por defecto como en búsqueda — se implementa scroll infinito en `ListTemplate` con `FlatList`:

- **Footer de carga**: `ListFooterComponent` con un spinner chico mientras se pide la página siguiente — no el `LoadingState` de pantalla completa, que es solo para la carga inicial.
- **Guard contra fetches duplicados**: `onEndReached` de `FlatList` puede dispararse más de una vez para el mismo "final de lista" (scroll rápido, re-render). Se guarda `page` actual + un flag `isFetchingNextPage` (deriva de RTK Query) y no se dispara un nuevo pedido de página si ya hay uno en curso.
- `onEndReachedThreshold` ajustado (ej. `0.5`) para que la página siguiente se pida un poco antes de llegar literalmente al final, evitando que el usuario vea un salto.
- Las páginas ya traídas se van concatenando en el cache de RTK Query bajo la misma query key (`merge` en la config del endpoint), no se re-piden ni se duplican al hacer scroll hacia atrás.
- **Guard de fin de paginación**: TMDB devuelve `total_pages` en cada respuesta — no se dispara `onEndReached` (ni se muestra el footer de carga) una vez que `page >= total_pages`, para no seguir pidiendo páginas vacías al llegar al final de una lista ya agotada.
- **Teclado**: `keyboardShouldPersistTaps="handled"` en el `FlatList` de `ListTemplate` — sin esto, tocar un ítem de la lista de resultados con el teclado de búsqueda todavía abierto solo lo cierra en vez de navegar al detalle (hay que tocar dos veces), un bug clásico de RN al combinar `TextInput` + lista de resultados.

## Favoritos

- `favoritesSlice` (`store/favoritesSlice.ts`, Redux Toolkit) guarda un array de `{ id: number; mediaType: 'movie' | 'tv' }`.
- `FavoriteButton` (`ui/molecules/`) hace `toggle` sobre el slice vía `useFavoriteActions()`; se usa tanto en `MediaListItem` como en `MediaDetailsHeader`.
- `FavoritesScreen` (`ui/pages/`) lee el slice, y por cada entrada resuelve los datos vía RTK Query (`getMovieDetails`/`getTvDetails`) para mostrarlos con `MediaListItem` dentro de `ListTemplate`; si TMDB devuelve 404 (el ítem ya no existe), se filtra silenciosamente.
- **`keyExtractor` compuesto**: como esta lista mezcla movies y tv, y TMDB usa IDs numéricos independientes por tipo (un movie `id: 550` y un tv `id: 550` son entidades distintas), el `keyExtractor` de `FavoritesScreen` tiene que ser `` `${mediaType}-${id}` ``, no `id` solo — si no, colisionan claves de `FlatList` entre un movie y un tv con el mismo id numérico. El resto de las listas (`MoviesListScreen`, `TvListScreen`) no tienen este problema porque son de un solo `mediaType`.
- Persistencia automática vía `redux-persist` (whitelist solo del slice `favorites`).

## Internacionalización (i18n)

- **Librerías**: `i18next`, `react-i18next`, `react-native-localize` (detección de idioma del dispositivo/OS). Se evalúa en el setup si Hermes necesita el polyfill `@formatjs/intl-pluralrules` para reglas de plural (depende de la versión de RN/Hermes al inicializar el proyecto).
- **Locales**: `es` (default/fallback) y `en`, como JSON planos en `src/i18n/locales/`. Namespace único (`common`) alcanza para el tamaño de la app; no hace falta lazy-loading de traducciones.
- **Uso**: todo componente que renderiza texto usa `useTranslation()` y `t('clave.anidada')`. Sin strings de UI literales en JSX (reforzado por lint, ver siguiente sección).
- **Sincronización con TMDB**: el idioma activo de `i18next` se mapea a un código TMDB (`es` → `es-ES`, `en` → `en-US`) y se inyecta como parámetro `language` en todos los endpoints de `tmdbApi.ts`. Al cambiar de idioma se invalida la caché de RTK Query correspondiente (las queries usan el idioma como parte del cache key, así que esto es automático).
- **Selector de idioma**: `LanguageSwitcher` (`ui/molecules/`, dos opciones ES/EN) accesible desde algún header o la pantalla de Favoritos; persiste la preferencia (vía el propio `AsyncStorage` que usa el language detector de `i18next`, no hace falta un slice de Redux aparte).
- **Alcance explícitamente fuera**: pluralización compleja, RTL, más de 2 idiomas — no lo pide el challenge y agregaría complejidad sin valor evaluable.

## Rendimiento / buenas prácticas RN

- `FlatList` con `keyExtractor` por `id`, `removeClippedSubviews`, y `renderItem` memoizado con `React.memo`.
- Evitar renders innecesarios: selectors de RTK Query ya memoizan por caché; componentes de item memoizados; `FavoriteButton` no debe re-renderizar toda la lista al togglear (selector granular por id).
- Convención de hooks separados para estado vs. acciones sobre `favoritesSlice` (`useIsFavorite(id)` de solo lectura y granular, `useFavoriteActions()` para `toggle`/`add`/`remove`) para que un componente que solo dispara la acción no se suscriba a cambios de estado.
- `expo-image` con `contentFit="cover"` y `cachePolicy="memory-disk"` dado que los posters de TMDB no cambian de URL por id.
- Imágenes con tamaño solicitado acorde al contexto (poster chico en lista `w342`, grande en detalle `w780`/`original`) para no descargar más peso del necesario.
- `react-native-safe-area-context` para compatibilidad iOS/Android (notch, status bar, tab bar inferior).
- **Fallback de imagen**: `Poster.tsx` cubre dos casos — `poster_path: null` (frecuente en resultados de búsqueda de contenido poco popular) y error de carga (`onError` de `expo-image`, red caída a mitad de descarga). En ambos casos, en vez de un ícono/asset extra, un placeholder de texto simple: fondo neutro (token de `theme/tokens.ts`) + la inicial del título centrada. Cero assets nuevos, cubre el caso sin dejar espacios en blanco en la lista.
- **`vote_average: 0` (sin votos todavía)**: cuando `vote_count === 0`, TMDB devuelve `vote_average: 0` — mostrarlo tal cual en `RatingBadge` se lee como "calificación pésima" en vez de "sin calificar". Se muestra "Sin votos"/`N/A` (vía `i18n`) en ese caso puntual, no el número.
- **Géneros en el detalle**: `FlatList` horizontal (no `.map()` suelto), igual que el resto de las listas de datos de la app, aunque el array de géneros normalmente tenga solo 2-3 ítems — se prioriza un único patrón consistente para renderizar listas de datos (todas `FlatList`) en vez de decidir caso por caso según el tamaño esperado, que es más fácil de romper si el dato cambia (una película puede tener más géneros de los esperados).
- `DetailsTemplate` envuelve su contenido en un `ScrollView` — la sinopsis no tiene límite de longitud en TMDB, sin scroll se corta en pantallas chicas.

## Animaciones

Cinco animaciones concretas, todas con `react-native-reanimated` (UI thread, no bloquea con JS):

1. **Shared element transition del poster (list → detail)**: al tocar un `MediaListItem`, el poster "vuela" y crece hasta la posición del header en `MediaDetailsHeader` durante la transición de navegación, en vez de un corte seco entre pantallas. Se implementa taggeando el `Animated.Image` del poster en ambos componentes con el mismo `sharedTransitionTag` (`` `poster-${mediaType}-${id}` ``) — Reanimated matchea el tag entre pantallas vía `react-native-screens` (que ya usamos por React Navigation) y anima la morph automáticamente, sin coordenadas manuales.
   - **Es la pieza más experimental de este documento**: la integración de shared element transitions con `native-stack` es más nueva y menos probada en producción que el resto de lo que aparece acá. Si al implementarla resulta flaky entre Android/iOS (timing, glitches visuales), el fallback es un cross-fade simple del header de detalle (`entering={FadeIn}`) sin shared element real — no bloquea nada más del desarrollo, es una decisión aislada a validar apenas se llegue a esa pantalla.
2. **Entrada escalonada en las listas**: `Animated.FlatList` (de Reanimated) con `entering={FadeInDown.delay(index * 30)}` por ítem — aparición sutil y escalonada al cargar/paginar, sin animación manual.
3. **`FavoriteButton`**: `withSpring` sobre `scale` al togglear (bounce breve), con `useSharedValue`.
4. **`OfflineBanner`**: `entering={SlideInDown}` / `exiting={SlideOutUp}` — entra/sale deslizando en vez de aparecer de golpe.
5. **Indicador de refresh en segundo plano** (de "Caché offline"): barra de progreso indeterminada con `withRepeat(withTiming(...))` en vez de un spinner estático.

**Integraciones a tener en cuenta**:
- Los componentes `Animated.*` de Reanimated usados acá también necesitan registrarse con `cssInterop` de NativeWind para aceptar `className` — mismo caso que el `Image` de `expo-image` (ver sección "Estilos").
- Requiere el plugin de Babel `react-native-reanimated/plugin` (último en la lista de plugins de `babel.config.js`) — riesgo de build moderado, pero es una librería muy establecida en el ecosistema, bastante menor que el riesgo del shared element transition en sí.
- Los flujos de Maestro deberían tolerar bien estas animaciones (espera a que los elementos aparezcan en vez de asumir timing fijo), pero si alguna introduce flakiness en CI, se puede desactivar la duración de animaciones bajo una env var de test.

## Plan de testing

- **Unit**: `favoritesSlice` (reducers/selectors), helpers de `utils/image.ts`, normalización de `Media` en `api/tmdbApi.ts`, mapeo de idioma `i18next` → parámetro TMDB.
- **Component**: `MediaListItem` (título, rating, imagen), `LoadingState`/`ErrorState`/`EmptyState` (se renderiza lo esperado según props), `FavoriteButton` (toggle visual) — todos en `ui/`.
- **Screen (integración liviana)**: `MoviesListScreen` (`ui/pages/`) con RTK Query mockeado (msw o mocks manuales) cubriendo los 3 estados: carga, error, listado con resultados y listado vacío.
- No se apunta a cobertura total; se prioriza que lo evaluable (estados de UI, listas, favoritos) tenga tests, no boilerplate de configuración.

### Verificación interactiva en el emulador (Android MCP)

Además de Jest/RNTL (tests automatizados), se usa **`mobile-mcp`** (`mobile-next/mobile-mcp`) como servidor MCP para que el agente pueda controlar el emulador de Android directamente durante el desarrollo: tap, scroll, escribir texto, sacar screenshots y leer el árbol de accesibilidad, para verificar a ojo los flujos (listado, búsqueda, detalle, favoritos, cambio de idioma) igual que lo haría un tester manual. No reemplaza la suite de tests, es un complemento para validar UX real en el simulador durante el paso 15 del plan de trabajo.

- **Instalación**: `claude mcp add mobile -- npx -y @mobilenext/mobile-mcp@latest`.
- **Prerrequisitos** (verificados en esta máquina: **no están instalados todavía**): Android Platform Tools (`adb`), variable de entorno `$ANDROID_HOME` apuntando al SDK, y un AVD (Android Virtual Device) booteado. `mobile-mcp` habla con el emulador vía `adb`, así que sin esto no funciona.
- Antes de poder usarlo hace falta instalar Android Studio (o al menos el SDK + platform-tools + un AVD) — se deja anotado en "Pendientes".

### Testing E2E: Maestro

Tres capas de verificación, cada una cubre algo que las otras no:

| Capa | Herramienta | Corre en CI | Necesita agente |
|---|---|---|---|
| Unit / component | Jest + RNTL | Sí | No |
| Interactiva / exploratoria | `mobile-mcp` | No | Sí — la maneja el agente |
| E2E / integración | **Maestro** | Sí | No — flujos versionados, deterministas |

`mobile-mcp` es exploración dirigida por el agente durante el desarrollo, no queda como artefacto repetible. Maestro sí: flujos declarativos en YAML bajo `.maestro/`, corridos contra un build real (debug APK / app del simulador), que se pueden ejecutar tanto localmente como en CI sin que haya un agente presente — es lo que efectivamente cierra el hueco de integración automática.

- **Instalación**: `curl -Ls "https://get.maestro.mobile.dev" | bash` (CLI), no requiere cambios en el proyecto RN ni en el build nativo — se conecta al emulador/simulador ya corriendo, igual que `mobile-mcp`.
- **Flujos** (`.maestro/*.yaml`), uno por camino crítico:
  - `movies-list-and-search.yaml`: abre la app, ve el listado de populares, busca una película, ve resultados.
  - `movie-details.yaml`: tap en un ítem del listado, verifica que se muestran sinopsis/géneros/fecha.
  - `favorites.yaml`: marca un favorito desde el listado, navega a la tab de Favoritos, lo encuentra ahí; lo desmarca, verifica que desaparece.
  - `language-switch.yaml`: cambia el idioma con `LanguageSwitcher`, verifica que un texto conocido de la UI cambió.
- **Alcance**: solo Android en CI (ver sección "CI/CD" — un runner macOS para iOS en GitHub Actions es mucho más lento/caro, no se justifica para este challenge). En local, sí se puede correr contra el simulador de iOS.

## CI/CD (GitHub Actions)

El challenge pide subir el código a GitHub, así que agregar un pipeline básico es casi gratis y demuestra que "compila sin errores" no es solo una afirmación en el README. Un workflow (`.github/workflows/ci.yml`) con jobs independientes:

1. **lint-and-typecheck**: `eslint .` + `tsc --noEmit`. Rápido, corre siempre.
2. **unit-tests**: `jest` (unit + component). Rápido, corre siempre.
3. **e2e** (Android, opcional/cuttable — ver "Orden de recorte"): bootea un emulador Android en el runner (acción `reactivecircus/android-emulator-runner`), instala el debug APK, corre los flujos de Maestro. Este job es el más lento y el más propenso a flakiness de infra (boot de emulador en CI), así que se separa de los otros dos para que un fallo ahí no bloquee la señal rápida de lint/tests.

No se arma build de iOS en CI (necesita runner macOS, mucho más lento/caro en minutos de GitHub Actions) — la verificación de iOS queda manual + `mobile-mcp`/Maestro local, consistente con lo ya decidido para el job de E2E.

## Linting

Config pensada para TypeScript/React con reglas de calidad estrictas, adaptando lo que en un proyecto web (React DOM) no aplica directamente a React Native:

**Se reutiliza tal cual (adaptado a RN donde corresponde):**
- `@typescript-eslint/no-explicit-any: error`, `consistent-type-imports`, `no-unused-vars` con `argsIgnorePattern`/`varsIgnorePattern: '^_'`.
- `import/order` (agrupado, alfabético, `newlines-between: always`) e `import/no-default-export`.
- `react/function-component-definition` (solo arrow functions), `react-hooks/recommended`.
- `no-nested-ternary` + regla custom `no-restricted-syntax` que prohíbe ternarios dentro de `JSXExpressionContainer` — en RN evita además el bug clásico de `condition && <Text>0</Text>` renderizando el string `"0"` cuando `condition` es un número falsy.
- `max-lines` (~500), `max-lines-per-function` (~160), `complexity` (~20) como `warn` — excepto en `ui/`, que tiene límites propios más estrictos (ver "Tamaño y descomposición de componentes" abajo).
- `eqeqeq`, `no-console` (allow `warn`/`error`), `prefer-const`, `no-var`, `no-magic-numbers` (warn, con ignore list de números "obvios").
- `i18next/no-literal-string` (plugin `eslint-plugin-i18next`) — ahora tiene sentido real (no solo lint-por-las-dudas) porque el proyecto sí tiene `react-i18next` integrado. Se ajusta `ignoreAttribute` a props de RN (`testID`, `accessibilityHint`) en vez de las de DOM (`aria-*`, `href`, etc.).

**Se reemplaza (específico de web/Vite):**
- `react-refresh/only-export-components` (HMR de Vite) → se elimina, no aplica a Metro.
- Se agrega `eslint-plugin-react-native` (oficial) con `split-platform-components` — pega directo con el criterio de evaluación "buenas prácticas de React Native". `no-inline-styles` y `no-unused-styles` quedan afuera: asumen `StyleSheet.create`, que dejó de ser la forma principal de estilar al elegir NativeWind (ver sección "Estilos"); su reemplazo funcional es `eslint-plugin-tailwindcss` (ver abajo).
- `eslint-plugin-tailwindcss`: `no-contradicting-classname` (evita `p-2 p-4` en la misma clase), `no-custom-classname` (fuerza a usar solo clases del theme de `tailwind.config.js`, no valores arbitrarios sueltos), `classnames-order` (aunque el orden real lo resuelve Prettier, ver abajo).

**Base**: `@react-native/eslint-config` (la del template oficial RN CLI) en vez de `eslint:recommended` + `plugin:react/recommended` a mano, porque ya viene alineada con Metro/Hermes.

### Convenciones de nombres

- `@typescript-eslint/naming-convention`: camelCase para variables/funciones, PascalCase para tipos/interfaces/enums/componentes, `UPPER_CASE` permitido para constantes de módulo. **Sin regla** sobre `objectLiteralProperty`/`typeProperty` — TMDB devuelve `release_date`, `first_air_date`, `vote_average` en snake_case, y forzar camelCase ahí haría pelear al linter contra la forma cruda de la API antes de normalizarla a `Media` en `api/tmdbApi.ts`.
- `react/jsx-pascal-case`: un componente usado en JSX con minúscula (`<mediaListItem />`) React lo interpreta como tag nativo y rompe en runtime — esto lo agarra en lint, antes de correr.
- `eslint-plugin-unicorn` → `unicorn/filename-case`: archivos en `ui/**` deben llamarse igual que el componente que exportan (PascalCase); hooks/utils en camelCase. Ata el nombre de archivo a la convención de nombres del componente.
- `@typescript-eslint/no-use-before-define`: usar una variable/función antes de declararla — más relevante con `const` por el temporal dead zone.
- `one-var: ['error', 'never']`: una declaración por statement, nunca `let a, b;`.
- `no-multi-assign`: prohíbe encadenar `a = b = c`.
- `func-style: ['warn', 'expression', { allowArrowFunctions: true }]`: extiende "arrow function, no `function`" más allá de componentes React — también a helpers/utils sueltos, para consistencia en todo el codebase (complementa a `react/function-component-definition`, que ya fuerza esto específicamente en componentes).

### Tamaño y descomposición de componentes

El anti-patrón concreto a evitar: un componente grande con varias secciones de JSX, cada una marcada con un comentario en vez de estar extraída a su propio componente —

```tsx
<ComponenteGrande>
  {/* sección a */}
  <Container>...</Container>
  {/* sección b */}
  <Container>...</Container>
</ComponenteGrande>
```

— en vez de eso, cada sección se extrae a un componente con nombre propio (`SeccionA`, `SeccionB`), y `ComponenteGrande` queda como la composición de ambos. La regla no es solo una cuestión de líneas: un comentario que solo *etiqueta* el bloque siguiente (no explica un porqué no obvio) es la señal de que ahí falta extraer un componente.

Límites concretos para `ui/**/*.tsx` (más estrictos que el resto del proyecto, vía override de ESLint por path):
- `max-lines-per-function`: **80** (vs. ~160 general) — el cuerpo de un componente no debería necesitar más.
- `max-lines`: **150** por archivo (vs. ~500 general) — si un archivo de componente pasa esto, casi seguro tiene más de un componente adentro.
- `react/jsx-max-depth: ['warn', { max: 4 }]` — la señal más directa de "esto necesita subcomponentes": JSX anidado más allá de 4 niveles suele ser justo el caso de secciones con su propio árbol interno metidas todas en el mismo `return`.
- `no-restricted-syntax` con selector `JSXExpressionContainer > JSXEmptyExpression` (el nodo AST exacto de `{/* comentario */}` dentro de JSX): **prohibido**, mensaje `"No uses comentarios como separadores de secciones en JSX — extraé la sección a un componente con nombre."`. Un comentario real explicando un workaround no obvio va como `//` antes de la línea, fuera del árbol JSX, o mejor, documentando el componente extraído.

`ui/pages/*` en particular deben quedar "delgadas": mayormente wiring de hooks (RTK Query, Redux, navegación) + pasar props al `template` correspondiente, casi sin JSX propio más allá de eso.

### Accesibilidad

Sí se puede lintear en React Native: `eslint-plugin-react-native-a11y` es el equivalente RN de `jsx-a11y` (que es DOM-only y no aplica acá). Se incluye como `warn` (no bloqueante para la entrega, pero visible durante el desarrollo):

- Detecta elementos táctiles (`TouchableOpacity`, `Pressable`, botones custom) sin `accessibilityLabel` ni `accessibilityRole`.
- Detecta imágenes (`Image` core o de `expo-image`) de contenido informativo sin `accessibilityLabel` (equivalente al `alt` de `<img>` en web).
- Verifica que `accessibilityRole` tenga un valor válido del set que reconoce RN (`button`, `link`, `image`, `header`, etc.).
- Marca `View`s que manejan `onPress` pero no están marcadas `accessible` ni tienen rol — un patrón común y fácil de olvidar en RN al armar filas de lista custom (justo el caso de `MediaListItem`).

Relevante en particular para `MediaListItem` (fila táctil con imagen) y `FavoriteButton` (ícono táctil sin texto visible, necesita `accessibilityLabel` para no ser un botón "mudo" para un lector de pantalla).

**Prettier**: `singleQuote`, `trailingComma: all`, `printWidth: 100`, `semi: true`, `arrowParens: always`, + `prettier-plugin-tailwindcss` (ordena las clases de `className` de forma determinística en cada format, evita diffs de ruido por orden de clases).

### Tooling adicional

- **husky + lint-staged**: hook de pre-commit (`.husky/pre-commit` → `npx lint-staged`) que corre `eslint --fix` + `prettier --write` solo sobre los archivos `.ts`/`.tsx` en stage. Barato de configurar y evita commitear código que rompe lint.
- **`tsconfig.json` más estricto** que el default del template RN: además de `strict: true`, sumar `noUncheckedIndexedAccess`, `noImplicitReturns`, `noFallthroughCasesInSwitch`.
- **Path alias `@/*`** apuntando a `src/` (en `tsconfig.json` `paths`, espejado en `babel.config.js` con `babel-plugin-module-resolver` y en `jest.config.ts` con `moduleNameMapper`) para evitar imports relativos largos (`../../../ui/atoms/...`).
- **`npx react-native doctor`**: viene con el RN CLI (no requiere instalar nada aparte), corre un chequeo del entorno (Node, Watchman, JDK, Android SDK/`adb`, Xcode, CocoaPods, etc.) y puede intentar arreglar lo que encuentra con `--fix`. Se usa como primer paso de troubleshooting cuando el build falla por el entorno (no por el código) — evita perder tiempo diagnosticando a mano algo que el propio CLI ya sabe chequear. Se referencia en el README en vez de duplicar instrucciones de setup.

## Plan de trabajo (pasos)

1. Inicializar proyecto RN CLI + TypeScript, lockear orientación portrait-only en `AndroidManifest.xml`/Info.plist, verificar build limpio en Android e iOS.
2. Instalar y configurar NativeWind (`babel.config.js`, `metro.config.js`, `tailwind.config.js`, `global.css`, `nativewind-env.d.ts`) y verificar con un componente de prueba que compila en Android **e** iOS — se hace temprano porque es la base de todo el árbol visual y revertirlo tarde sería costoso (ver sección "Estilos").
3. Setup de lint/formato: `@react-native/eslint-config` + `@typescript-eslint` + plugins (`import`, `react-native`, `react-native-a11y`, `i18next`, `unicorn`, `tailwindcss`) adaptados según la sección "Linting"; Prettier con la config de referencia + `prettier-plugin-tailwindcss`; husky + lint-staged.
4. Estructura de carpetas (`ui/atoms|molecules|organisms|templates|pages` + `api/`, `store/`, `hooks/`, `types/`, `navigation/`), `tsconfig.json` estricto (`noUncheckedIndexedAccess`, `noImplicitReturns`, `noFallthroughCasesInSwitch`) + alias `@/*`, `.env.example`, lectura tipada de env var.
5. Instalar y configurar Redux Toolkit + RTK Query + redux-persist + AsyncStorage, React Navigation (bottom tabs + native stack, safe-area-context, screens, gesture-handler), `expo-image` (vía `npx install-expo-modules@latest` + `cssInterop` para que soporte `className`), `@react-native-community/netinfo`, `react-native-reanimated` (+ plugin de Babel); implementar `app/ErrorBoundary.tsx` y armar `AppProviders` con el orden definido en "Providers".
6. Configurar `i18next` + `react-i18next` + `react-native-localize`: locales `es`/`en`, detección de idioma inicial, mapeo a parámetro TMDB.
7. Definir tipos de dominio compartidos (`types/media.ts`, `types/common.ts`) y el `apiSlice` de TMDB (movies + tv, con `language` dinámico).
8. Definir `theme/tokens.ts` (colores, tipografía, spacing) e importarlos en `theme.extend` de `tailwind.config.js`; construir `ui/atoms` + `ui/molecules` (`LoadingState`, `ErrorState`, `EmptyState`, `Poster`, `RatingBadge`, `Badge`, `SearchBar`, `LanguageSwitcher`) estilados con `className` — todos sus textos vía `t()`.
9. Implementar `favoritesSlice` + hooks (`useIsFavorite`, `useFavoriteActions`) + `FavoriteButton`.
10. Implementar `ui/organisms` (`MediaListItem`, `MediaDetailsHeader`) y `ui/templates` (`ListTemplate`, `DetailsTemplate`).
11. Implementar `ui/pages`: `MoviesListScreen`/`TvListScreen` (listado + buscador sobre `ListTemplate`), `MovieDetailsScreen`/`TvDetailsScreen` (sobre `DetailsTemplate`), `FavoritesScreen`.
12. Configurar navegación completa (`ROUTES`, bottom tabs + stacks, tipado de params).
13. Pasada de performance: memoización, verificación de listas grandes, revisión de imágenes/caché.
14. Implementar las animaciones de la sección "Animaciones" (shared element transition, entrada escalonada de listas, bounce de `FavoriteButton`, `OfflineBanner`, indicador de refresh) — al final, sobre componentes ya funcionando sin animar, para no debuggear lógica y animación a la vez.
15. Escribir tests (unit + component) según el plan de testing.
16. Probar build y funcionamiento en simulador/emulador Android e iOS (incluyendo pod install para `expo-image`); registrar `mobile-mcp` y usarlo para verificar los flujos principales en el emulador Android.
17. Escribir flujos de Maestro (`.maestro/*.yaml`) para los caminos críticos y el workflow de CI (`.github/workflows/ci.yml`) con los jobs de lint/typecheck, unit tests y E2E Android.
18. Escribir `README.md` según la sección "README" de este documento.

## README: contenido planeado

El challenge remarca que compilar sin problemas siguiendo el README es parte importante de la evaluación, así que no queda como un paso genérico al final — estructura concreta:

1. **Descripción corta** de la app + 1-2 screenshots o un GIF corto (se puede generar con `mobile-mcp`/mientras se prueba en el emulador).
2. **Prerrequisitos**: versión de Node, RN CLI (`npx react-native --version` esperado), Xcode (versión mínima) para iOS, Android Studio/SDK/JDK para Android — enlazando a la [guía oficial de entorno de RN](https://reactnative.dev/docs/set-up-your-environment) en vez de duplicar instrucciones de setup que no son específicas de este proyecto. Se sugiere correr `npx react-native doctor` como primer chequeo si algo falla al compilar — diagnostica el entorno (Node/Watchman/JDK/Android SDK/Xcode/CocoaPods) y puede arreglar varios problemas solo con `--fix`.
3. **Obtener API key de TMDB**: registrarse en TMDB (gratis), generar un *API Read Access Token* (v4, no el `api_key` v3) desde la sección de API de la cuenta.
4. **Variables de entorno**: copiar `.env.example` a `.env`, completar `TMDB_ACCESS_TOKEN`.
5. **Instalación**: `npm install` (o `yarn`), `bundle install && bundle exec pod install` en `ios/` (necesario por `expo-image`).
6. **Correr la app**: comandos separados para Android (`npm run android`, con emulador ya corriendo) e iOS (`npm run ios`).
7. **Correr tests**: unit/component (`npm test`), E2E (`maestro test .maestro/`, con el emulador/simulador y la app ya instalados).
8. **Decisiones de arquitectura**: enlace a `docs/planning.md` en vez de duplicar el contenido acá.
9. **Limitaciones conocidas** (si quedó algo en el "orden de recorte" sin implementar, se documenta acá explícitamente en vez de que el evaluador lo descubra solo).

## Orden de recorte si falta tiempo

Si la fecha límite se acerca y algo compromete el build o la funcionalidad base, se recorta en este orden (el primero en la lista es el primero que se sacrifica):

1. Animaciones → puro pulido cosmético, cero valor funcional, y es lo más experimental técnicamente (sobre todo el shared element transition). Si genera fricción, se sacan del todo antes de tocar cualquier otra cosa — con el fallback de cross-fade ya cubre la mayor parte del beneficio visual de cualquier forma.
2. Maestro + CI → es lo más nuevo y lo que menos pega directo con los criterios de evaluación (el challenge no pide CI); se puede entregar solo con verificación manual + `mobile-mcp`.
3. Tests (Jest/RNTL) → se puede entregar sin, priorizando funcionalidad.
4. `expo-image` → revertir a `Image` core de RN si da problemas de instalación/config de módulos Expo en el proyecto bare.
5. i18n completo → recortar a un solo idioma (es) manteniendo el archivo de labels y la regla de lint `i18next/no-literal-string`, pero sin `react-native-localize`, sin selector de idioma ni sincronización con TMDB.
6. Favoritos → se puede omitir sin romper el flujo principal (listado + búsqueda + detalle).
7. TV shows → se puede recortar a solo Movies, que es el mínimo pedido por el challenge.

## Pendientes / decisiones abiertas

- Confirmar `react-native-dotenv` vs `react-native-config` una vez se inicialice el proyecto (depende de qué tan simple sea la config en iOS).
- Decidir si "top_rated" o "popular" es el endpoint por defecto del listado principal (para movies y para tv).
- Definir criterio exacto de normalización `Media` (campos comunes vs específicos de movie/tv) al escribir `api/tmdbApi.ts`.
- Confirmar si Hermes en la versión de RN que se use necesita el polyfill de `Intl.PluralRules` para `i18next`.
- Decidir dónde vive el `LanguageSwitcher` en la UI (header global vs. pantalla de Favoritos/settings).
- Instalar Android Studio/SDK (`adb`, `$ANDROID_HOME`) y crear un AVD antes de poder usar `mobile-mcp` en el emulador — no está instalado en esta máquina todavía.
- Evaluar si conviene unificar `MoviesListScreen`/`TvListScreen` (y sus contrapartes de detalle) en una sola page parametrizada por `mediaType`, ya que ambas comparten `ListTemplate`/`DetailsTemplate` casi por completo — quedó fuera del alcance inicial para no sobre-optimizar antes de ver el código real.
- Verificar apenas se inicialice el proyecto que NativeWind compila sin fricción en Android **e** iOS (paso 2 del plan) — es la dependencia más transversal de todas (toca cada componente visual), así que si algo falla hay que decidirlo temprano, no cerca de la entrega.
- Probar el escenario de caché offline a mano en el emulador: cargar el listado, cerrar la app, activar modo avión, reabrir — debería verse el listado cacheado de inmediato y (al no haber red) el aviso chico de "no se pudo actualizar" en vez de `ErrorState` de pantalla completa.
- Confirmar el nombre exacto de la variable de entorno del token de TMDB (`TMDB_ACCESS_TOKEN` propuesto) y que el Read Access Token (v4) generado en la cuenta de TMDB funciona con `Authorization: Bearer`.
- Verificar apenas se instale `react-native-reanimated` que la versión de `react-native-screens` en uso soporta shared element transitions sobre `native-stack` (feature relativamente nueva) — si no, aplicar el fallback de cross-fade documentado en "Animaciones" sin bloquear el resto del desarrollo.
- Confirmar que `cssInterop` de NativeWind registra bien los componentes `Animated.*` de Reanimated (mismo mecanismo que para el `Image` de `expo-image`).
- Verificar que `npx install-expo-modules` funciona sin fricción sobre un proyecto RN CLI recién inicializado (paso 5) — es la primera vez que se mezcla infraestructura de Expo dentro de un proyecto bare en este plan.
- Confirmar en la práctica el estado de Fabric/New Architecture de `react-native-localize` al instalarlo (ver tabla en "New Architecture: auditoría de dependencias nativas") — es la única dependencia nativa del stack sin confirmación explícita.
