// Menyusun bentuk poligon wilayah supaya tidak saling menumpuk
import polygonClipping from "polygon-clipping";

const toClosedXY = (ring) => {
  const xy = ring.map(([lat, lng]) => [lng, lat]);
  xy.push(xy[0]);
  return xy;
};

const toLatLng = (ring) => ring.map(([lng, lat]) => [lat, lng]);

function measure(xy) {
  let sum = 0;
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (let i = 0; i < xy.length - 1; i++) {
    const [x1, y1] = xy[i];
    const [x2, y2] = xy[i + 1];
    sum += x1 * y2 - x2 * y1;
    minX = Math.min(minX, x1);
    maxX = Math.max(maxX, x1);
    minY = Math.min(minY, y1);
    maxY = Math.max(maxY, y1);
  }
  return { area: Math.abs(sum) / 2, minX, minY, maxX, maxY };
}

const boxesOverlap = (a, b) =>
  a.minX <= b.maxX && b.minX <= a.maxX && a.minY <= b.maxY && b.minY <= a.maxY;

export function cutShapes(items) {
  const shapes = items
    .map((it) => {
      const xy = toClosedXY(it.ring);
      return { id: it.id, xy, ...measure(xy) };
    })
    .sort((a, b) => b.area - a.area);

  const result = [];
  shapes.forEach((s, i) => {
    const cutters = shapes.slice(i + 1).filter((t) => boxesOverlap(s, t));

    let multi = [[s.xy]]; 
    if (cutters.length) {
      try {
        multi = polygonClipping.difference([s.xy], ...cutters.map((t) => [t.xy]));
      } catch (err) {
        console.warn("Pemotongan poligon gagal, memakai bentuk utuh:", s.id, err);
      }
    }
    if (!multi.length) return; 

    const positions =
      multi.length === 1 ? multi[0].map(toLatLng) : multi.map((poly) => poly.map(toLatLng));
    result.push({ id: s.id, positions });
  });

  return result;
}