import { ReadableStream } from 'web-streams-polyfill';

// expo-image transitively loads Expo's Winter runtime (`Expo.fx`), which
// replaces the global `fetch` with a streaming-capable implementation that
// assumes `ReadableStream` already exists as a global. Hermes doesn't
// provide it, so every fetch() call (including RTK Query's) throws a
// ReferenceError unless this runs before anything imports expo-image.
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- ReadableStream isn't declared on globalThis in RN's lib.dom-less TS types
const untypedGlobal = globalThis as any;

if (typeof untypedGlobal.ReadableStream === 'undefined') {
  untypedGlobal.ReadableStream = ReadableStream;
}
