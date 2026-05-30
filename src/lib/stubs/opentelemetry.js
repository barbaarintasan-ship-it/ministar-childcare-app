// Stub for @opentelemetry/api — not needed in React Native
module.exports = {
  context: { with: (c, fn) => fn(), bind: (f) => f },
  trace: { getTracer: () => ({ startSpan: () => ({ end: () => {}, setAttribute: () => {} }) }), getActiveSpan: () => null },
  propagation: { extract: (c) => c, inject: () => {} },
  diag: { setLogger: () => {}, error: () => {}, warn: () => {}, info: () => {}, debug: () => {}, verbose: () => {} },
  SpanStatusCode: { UNSET: 0, OK: 1, ERROR: 2 },
  DiagLogLevel: { ALL: 0, VERBOSE: 1, DEBUG: 5, INFO: 10, WARN: 20, ERROR: 30, NONE: 9999 },
};
