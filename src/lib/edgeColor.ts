const SIZE = 24;

export const edgeColor = (data: Uint8ClampedArray, size: number) => {
  const sum = [0, 0, 0];
  let n = 0;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (x > 0 && y > 0 && x < size - 1 && y < size - 1) continue;
      const i = (y * size + x) * 4;
      const a = data[i + 3];
      for (let c = 0; c < 3; c++) sum[c] += data[i + c] * a;
      n += a;
    }
  }
  return `rgb(${sum.map((s) => Math.round(s / (n || 1))).join(" ")})`;
};

export const frontEdgeColor = (src: string) =>
  new Promise<string | null>((resolve) => {
    const img = new Image();
    img.onerror = () => resolve(null);
    img.onload = () => {
      try {
        const ctx = document.createElement("canvas").getContext("2d");
        if (!ctx) return resolve(null);
        ctx.canvas.width = ctx.canvas.height = SIZE;
        ctx.drawImage(img, 0, 0, SIZE, SIZE);
        resolve(edgeColor(ctx.getImageData(0, 0, SIZE, SIZE).data, SIZE));
      } catch {
        resolve(null);
      }
    };
    img.src = src;
  });
