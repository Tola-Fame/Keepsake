// Reads the date a photo was taken from its EXIF data (JPEG only), falling back to the file's date.

export async function photoTakenAt(file: File): Promise<number> {
  try {
    const t = exifDate(new DataView(await file.slice(0, 256 * 1024).arrayBuffer()));
    if (t) return t;
  } catch {
    // unreadable or truncated EXIF: use the file date
  }
  return file.lastModified || Date.now();
}

function exifDate(v: DataView): number | null {
  if (v.byteLength < 4 || v.getUint16(0) !== 0xffd8) return null;
  let o = 2;
  while (o + 10 <= v.byteLength) {
    const marker = v.getUint16(o);
    if ((marker & 0xff00) !== 0xff00 || marker === 0xffda) return null;
    if (marker === 0xffe1 && v.getUint32(o + 4) === 0x45786966) return readTiff(v, o + 10); // "Exif"
    o += 2 + v.getUint16(o + 2);
  }
  return null;
}

function readTiff(v: DataView, start: number): number | null {
  const le = v.getUint16(start) === 0x4949;
  const u16 = (p: number) => v.getUint16(start + p, le);
  const u32 = (p: number) => v.getUint32(start + p, le);
  // tag -> offset of its value field
  const ifd = (at: number) => {
    const tags = new Map<number, number>();
    for (let i = 0, n = u16(at); i < n; i++) tags.set(u16(at + 2 + i * 12), at + 10 + i * 12);
    return tags;
  };
  const ifd0 = ifd(u32(4));
  const ptr = ifd0.get(0x8769);
  const exif = ptr === undefined ? null : ifd(u32(ptr));
  const at = exif?.get(0x9003) ?? exif?.get(0x9004) ?? ifd0.get(0x0132); // DateTimeOriginal, DateTimeDigitized, DateTime
  if (at === undefined) return null;
  const off = u32(at);
  let s = "";
  for (let i = 0; i < 19; i++) s += String.fromCharCode(v.getUint8(start + off + i));
  const m = /^(\d{4}):(\d{2}):(\d{2}) (\d{2}):(\d{2}):(\d{2})/.exec(s);
  if (!m || m[1] === "0000") return null;
  const t = new Date(+m[1], +m[2] - 1, +m[3], +m[4], +m[5], +m[6]).getTime();
  return Number.isNaN(t) ? null : t;
}
