/**
 * Type declarations for importing JSON and TopoJSON files
 */

declare module '*.json' {
  const value: any;
  export default value;
}

declare module '*.topojson' {
  import type { Topology } from 'topojson-specification';
  const value: Topology;
  export default value;
}
