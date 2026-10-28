function createCube() {
  const positions = new Float32Array([
    -1, -1,  1,   1, -1,  1,   1,  1,  1,  -1,  1,  1,   // front
     1, -1, -1,  -1, -1, -1,  -1,  1, -1,   1,  1, -1,   // back
    -1,  1,  1,   1,  1,  1,   1,  1, -1,  -1,  1, -1,   // top
    -1, -1, -1,   1, -1, -1,   1, -1,  1,  -1, -1,  1,   // bottom
     1, -1,  1,   1, -1, -1,   1,  1, -1,   1,  1,  1,   // right
    -1, -1, -1,  -1, -1,  1,  -1,  1,  1,  -1,  1, -1    // left
  ]);
  const faceNormals = [[0, 0, 1], [0, 0, -1], [0, 1, 0], [0, -1, 0], [1, 0, 0], [-1, 0, 0]];
  const normals = new Float32Array(faceNormals.flatMap(n => [...n, ...n, ...n, ...n]));

  // Tangent; bitangent = cross(N, T)
  const faceTangents = [[1, 0, 0], [-1, 0, 0], [1, 0, 0], [1, 0, 0], [0, 0, -1], [0, 0, 1]];
  const tangents = new Float32Array(faceTangents.flatMap(t => [...t, ...t, ...t, ...t]));

  const texCoords = new Float32Array(faceNormals.flatMap(() => [0, 0, 1, 0, 1, 1, 0, 1]));

  const indices = new Uint16Array([
     0,  1,  2,   0,  2,  3,   // front
     4,  5,  6,   4,  6,  7,   // back
     8,  9, 10,   8, 10, 11,   // top
    12, 13, 14,  12, 14, 15,   // bottom
    16, 17, 18,  16, 18, 19,   // right
    20, 21, 22,  20, 22, 23    // left
  ]);
  return { positions, normals, tangents, texCoords, indices };
}


function createCylinder(segments = 64, uRepeat = 3) {
  const positions = [], normals = [], tangents = [], texCoords = [], indices = [];

  // Side: theta grows with u, so T points along the circle and B = cross(N, T) points up
  for (let i = 0; i <= segments; i++) {
    const u = i / segments, theta = 2 * Math.PI * u;
    const s = Math.sin(theta), c = Math.cos(theta);
    for (const y of [-1, 1]) {
      positions.push(s, y, c);
      normals.push(s, 0, c);
      tangents.push(c, 0, -s);
      texCoords.push(u * uRepeat, (y + 1) / 2);
    }
  }
  for (let i = 0; i < segments; i++) {
    const k = 2 * i;
    indices.push(k, k + 2, k + 3, k, k + 3, k + 1);
  }

  // Caps: planar mapping of x, z into the texture, T = +x on both
  for (const y of [1, -1]) {
    const center = positions.length / 3;
    positions.push(0, y, 0);
    normals.push(0, y, 0);
    tangents.push(1, 0, 0);
    texCoords.push(0.5, 0.5);
    for (let i = 0; i <= segments; i++) {
      const theta = 2 * Math.PI * i / segments;
      const s = Math.sin(theta), c = Math.cos(theta);
      positions.push(s, y, c);
      normals.push(0, y, 0);
      tangents.push(1, 0, 0);
      texCoords.push(0.5 + 0.5 * s, 0.5 - 0.5 * y * c);  // keeps cross(N, T) along +v
    }
    for (let i = 0; i < segments; i++) {
      const a = center + 1 + i, b = a + 1;
      if (y > 0) indices.push(center, a, b);
      else indices.push(center, b, a);
    }
  }

  return {
    positions: new Float32Array(positions),
    normals: new Float32Array(normals),
    tangents: new Float32Array(tangents),
    texCoords: new Float32Array(texCoords),
    indices: new Uint16Array(indices)
  };
}

function createSphere(segments=64, rings=32, uRepeat=3) {
  const positions = [], normals = [], tangents = [], texCoords = [], indices = [];

  for (let j = 0; j <= rings; j++) {
    const phi = j/rings*Math.PI;
    const cp = Math.cos(phi);
    const sp = Math.sin(phi);
    for (let i = 0; i <= segments; i++) {
      const u = i/segments, theta = u * Math.PI * 2, ct = Math.cos(theta), st = Math.sin(theta);
      const x =sp*st, y=cp, z=sp*ct;
      positions.push(x, y, z);
      normals.push(x, y, z);
      tangents.push(ct, 0, -st);
      texCoords.push(u*uRepeat, 1-j/rings);
    }
  }

  for (let j = 0; j < rings; j++) {
    for (let i = 0; i < segments; i++) {
      const a = j*(segments+1) +i;
      const b = a + segments + 1;
      indices.push(a, b, a+1, a+1, b, b+1);
    }
  }
  
  return {
    positions: new Float32Array(positions),
    normals: new Float32Array(normals),
    tangents: new Float32Array(tangents),
    texCoords: new Float32Array(texCoords),
    indices: new Uint16Array(indices)
  };
}

function createCone(segments=64, uRepeat=3, radius=1, height=2) {
  const positions = [], normals = [], tangents = [], texCoords = [], indices = [];
  const yBase = -height/2, yApex = height/2;
  const inv = 1/Math.sqrt(height*height + radius*radius);

  // Side
  for (let i = 0; i <= segments; i++) {
    const u = i/segments, theta = u*Math.PI*2;
    const c = Math.cos(theta), s = Math.sin(theta);
    const n = [height*s*inv, radius*inv, height*c*inv];

    positions.push(radius*s, yBase, radius*c);
    normals.push(...n);
    tangents.push(c, 0, -s);
    texCoords.push(u*uRepeat, 0);

    positions.push(0, yApex, 0);
    normals.push(...n);
    tangents.push(c, 0, -s);
    texCoords.push(u*uRepeat, 1);
  }
  for (let i = 0; i < segments; i++) {
    const b = i * 2;
    indices.push(b, b + 3, b + 2);
  }

  // Cap
  let center = positions.length/3;
  positions.push(0, yBase, 0);
  normals.push(0, -1, 0);
  tangents.push(1, 0, 0);
  texCoords.push(0.5, 0.5);
  
  for (let i = 0; i <= segments; i++) {
    const a = (i / segments) * Math.PI * 2;
    const s = Math.sin(a), c = Math.cos(a);
    positions.push(radius*s, yBase, radius*c);
    normals.push(0, -1, 0);
    tangents.push(1, 0, 0);
    texCoords.push(0.5+0.5*s, 0.5+0.5*c);
  }
  for (let i = 0; i < segments; i++) {
    indices.push(center, center + 1, center + i + 1);
  }  

  return {
    positions: new Float32Array(positions),
    normals: new Float32Array(normals),
    tangents: new Float32Array(tangents),
    texCoords: new Float32Array(texCoords),
    indices: new Uint16Array(indices)
  };
}

function createTorus(segments=64, tubeSegments=32, Radius=1, radius=0.4, uRepeat=3)
{
  const positions = [], normals = [], tangents = [], texCoords = [], indices = [];

  for(let j=0; j<= tubeSegments; j++)
  {
    let v = j/tubeSegments, phi = 2 * Math.PI * v;
    let sp = Math.sin(phi);
    let cp = Math.cos(phi);
    for(let i=0; i<=segments; i++)
    {
      let u = i/segments, theta = 2 * Math.PI * u;
      let st = Math.sin(theta);
      let ct = Math.cos(theta);
      let x = (Radius + radius * cp) * st;
      let z = (Radius + radius * cp) * ct;
      let y = radius * sp;
      positions.push(x, y, z);
      normals.push(cp*st, sp, cp*ct);
      tangents.push(ct, 0, -st);
      texCoords.push(u*uRepeat, v);
    }
  }

  for(let i=0; i<tubeSegments; i++)
  {
    for(let j=0; j<segments; j++)
    {
      let first = (i * (segments + 1)) + j;
      let second = first + segments + 1;
      indices.push(first, first+1, second+1, first, second+1, second);
    }
  }

  return {
    positions: new Float32Array(positions),
    normals: new Float32Array(normals),
    tangents: new Float32Array(tangents),
    texCoords: new Float32Array(texCoords),
    indices: new Uint16Array(indices)
  };
}