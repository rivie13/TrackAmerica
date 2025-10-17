/**
 * Map Geometry Utilities
 *
 * Helper functions for working with TopoJSON/GeoJSON geometries
 * Used by map components to render state shapes
 */

/**
 * Convert TopoJSON geometry to SVG path string
 * Handles both Polygon and MultiPolygon geometry types
 */
export function geoPath(geometry: any): string {
  if (!geometry || !geometry.coordinates) return '';

  const drawRing = (ring: any[]) => {
    return ring
      .map((point, i) => {
        const [x, y] = point;
        return `${i === 0 ? 'M' : 'L'}${x},${y}`;
      })
      .join('');
  };

  if (geometry.type === 'Polygon') {
    return geometry.coordinates.map(drawRing).join('') + 'Z';
  } else if (geometry.type === 'MultiPolygon') {
    return (
      geometry.coordinates.map((polygon: any[]) => polygon.map(drawRing).join('') + 'Z').join('') ||
      ''
    );
  }
  return '';
}

/**
 * Calculate bounding box for a geometry
 * Returns min/max coordinates and dimensions
 */
export interface BoundingBox {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
}

export function getGeometryBounds(geometry: any): BoundingBox {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  const processRing = (ring: any[]) => {
    ring.forEach(([x, y]) => {
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    });
  };

  if (geometry.type === 'Polygon') {
    geometry.coordinates.forEach(processRing);
  } else if (geometry.type === 'MultiPolygon') {
    geometry.coordinates.forEach((polygon: any[]) => polygon.forEach(processRing));
  }

  return {
    minX,
    minY,
    maxX,
    maxY,
    width: maxX - minX,
    height: maxY - minY,
  };
}

/**
 * Create SVG viewBox string from bounding box
 * Adds optional padding around the bounds
 */
export function createViewBox(bounds: BoundingBox, padding: number = 20): string {
  return `${bounds.minX - padding} ${bounds.minY - padding} ${bounds.width + padding * 2} ${bounds.height + padding * 2}`;
}

/**
 * Get the center point of a bounding box
 */
export function getBoundsCenter(bounds: BoundingBox): { x: number; y: number } {
  return {
    x: bounds.minX + bounds.width / 2,
    y: bounds.minY + bounds.height / 2,
  };
}
