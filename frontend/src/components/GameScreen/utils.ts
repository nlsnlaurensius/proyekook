export function importAll(r: any) {
  if ('keys' in r) {
    return r.keys().map(r);
  } else {
    return Object.values(r);
  }
}

export function getImageDimensions(src: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.onload = () => resolve({ width: img.width, height: img.height });
    img.src = src;
  });
}
