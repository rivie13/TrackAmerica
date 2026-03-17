/**
 * Point-in-Polygon Hit Detection
 *
 * Uses the Ray Casting algorithm to determine if a point lies inside a polygon.
 * This is used for reliable SVG state click detection on mobile.
 *
 * Reference: https://en.wikipedia.org/wiki/Point_in_polygon
 */

/**
 * Represents a 2D coordinate [x, y]
 */
type Coordinate = [number, number];

/**
 * Ray Casting algorithm for point-in-polygon detection
 *
 * How it works:
 * 1. Draw an imaginary ray from the test point to infinity
 * 2. Count how many times the ray crosses polygon edges
 * 3. If odd crossings = point is inside
 * 4. If even crossings = point is outside
 *
 * @param point - The point to test [x, y]
 * @param polygon - Array of coordinates forming a closed polygon
 * @returns true if point is inside polygon, false otherwise
 */
function rayCastingAlgorithm(point: Coordinate, polygon: Coordinate[]): boolean {
  const [x, y] = point;
  let inside = false;

  // Iterate through polygon edges
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i];
    const [xj, yj] = polygon[j];

    // Check if point's y-coordinate is between the two edge vertices
    const isYInRange = yi > y !== yj > y;

    if (isYInRange) {
      // Calculate if the point crosses the edge
      // Intersection condition uses the line equation to check if ray crosses edge
      const xIntersection = ((xj - xi) * (y - yi)) / (yj - yi) + xi;

      if (x < xIntersection) {
        inside = !inside;
      }
    }
  }

  return inside;
}

/**
 * Flattens multi-part geometries (e.g., Polygon or MultiPolygon)
 * into individual linear rings for checking
 *
 * @param coordinates - Raw geometry coordinates from GeoJSON
 * @returns Array of polygon coordinate arrays
 */
function flattenCoordinates(coordinates: any[], depth: number = 0): Coordinate[][] {
  // If this is a point, return empty
  if (coordinates.length === 0) return [];

  // If coordinates are numbers, this is a single point - shouldn't reach here
  if (typeof coordinates[0] === 'number') {
    return [];
  }

  // Determine nesting level
  const firstElement = coordinates[0];
  if (typeof firstElement[0] === 'number') {
    // We have an array of coordinates [x, y, ...] - this is a ring
    return [coordinates as Coordinate[]];
  } else if (Array.isArray(firstElement)) {
    // Recursively flatten nested arrays
    const result: Coordinate[][] = [];
    for (const coord of coordinates) {
      result.push(...flattenCoordinates(coord, depth + 1));
    }
    return result;
  }

  return [];
}

/**
 * Checks if a point is inside a GeoJSON geometry (Polygon or MultiPolygon)
 *
 * Handles:
 * - Simple polygons
 * - Polygons with holes
 * - MultiPolygons (like states with islands)
 *
 * @param point - The point to test [x, y]
 * @param geometry - GeoJSON geometry object
 * @returns true if point is inside geometry
 */
export function isPointInGeometry(
  point: Coordinate,
  geometry: {
    type: 'Polygon' | 'MultiPolygon';
    coordinates: any[];
  }
): boolean {
  // Handle different geometry types
  if (geometry.type === 'Polygon') {
    const rings = flattenCoordinates(geometry.coordinates);

    if (rings.length === 0) return false;

    // Check exterior ring (must be inside)
    const exteriorRing = rings[0];
    if (!rayCastingAlgorithm(point, exteriorRing)) {
      return false;
    }

    // Check interior rings (holes) - must be outside any holes
    for (let i = 1; i < rings.length; i++) {
      if (rayCastingAlgorithm(point, rings[i])) {
        return false; // Inside a hole, so not in polygon
      }
    }

    return true;
  } else if (geometry.type === 'MultiPolygon') {
    // Point in MultiPolygon if it's in ANY of the polygons
    for (const polygonCoords of geometry.coordinates) {
      const rings = flattenCoordinates(polygonCoords);

      if (rings.length === 0) continue;

      // Check exterior ring
      const exteriorRing = rings[0];
      if (!rayCastingAlgorithm(point, exteriorRing)) {
        continue; // Not in this polygon
      }

      // Check interior rings (holes)
      let inHole = false;
      for (let i = 1; i < rings.length; i++) {
        if (rayCastingAlgorithm(point, rings[i])) {
          inHole = true;
          break;
        }
      }

      if (!inHole) {
        return true; // Found in one of the polygons
      }
    }

    return false;
  }

  return false;
}

/**
 * Finds which state (feature) contains a given point
 * Useful for map click detection
 *
 * @param point - The tap/click point [x, y]
 * @param features - Array of GeoJSON features (states)
 * @returns The state feature ID if found, null otherwise
 */
export function findFeatureAtPoint(
  point: Coordinate,
  features: Array<{ id: string; geometry: any }>
): string | null {
  for (const feature of features) {
    if (
      isPointInGeometry(point, {
        type: feature.geometry.type,
        coordinates: feature.geometry.coordinates,
      })
    ) {
      return feature.id;
    }
  }

  return null;
}

/**
 * Test point-in-polygon detection
 * Used for development and debugging
 */
export function testPointInPolygon() {
  // Simple square polygon: [0,0] -> [10,0] -> [10,10] -> [0,10] -> [0,0]
  const square: Coordinate[] = [
    [0, 0],
    [10, 0],
    [10, 10],
    [0, 10],
    [0, 0],
  ];

  // Test points
  const testCases = [
    { point: [5, 5] as Coordinate, expected: true, label: 'center' },
    { point: [0, 0] as Coordinate, expected: true, label: 'corner' },
    { point: [15, 15] as Coordinate, expected: false, label: 'outside' },
    { point: [5, 0] as Coordinate, expected: true, label: 'edge' },
  ];

  let passed = 0;
  for (const testCase of testCases) {
    const result = rayCastingAlgorithm(testCase.point, square);
    const success = result === testCase.expected;
    if (success) passed++;
    console.log(`[${success ? '✓' : '✗'}] Point ${testCase.label}: ${testCase.point} -> ${result}`);
  }

  return passed === testCases.length;
}
