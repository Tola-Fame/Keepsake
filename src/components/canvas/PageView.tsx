"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Konva from "konva";
import { Ellipse, Group, Image as KImage, Layer, Line, Rect, Stage, Text, Transformer } from "react-konva";
import type { KonvaEventObject } from "konva/lib/Node";
import type { AlbumDoc, AlbumElement, Page, PhotoEl, PhotoMap } from "@/lib/types";
import { pageDims } from "@/lib/pageSizes";
import { loadImage } from "@/lib/image";
import { stickerDataUrl } from "@/lib/stickers";
import { PATTERN_TILE_SCALE, patternTile } from "@/lib/backgrounds";
import { ensureFonts, fontOption } from "@/lib/fonts";
import { pageFonts } from "@/lib/doc";

export interface PageViewProps {
  doc: AlbumDoc;
  page: Page;
  photos: PhotoMap;
  scale: number;
  /** resolution multiplier used for cached (filtered) photos */
  pixelRatio?: number;
  editable?: boolean;
  showPlaceholders?: boolean;
  selectedId?: string | null;
  hiddenIds?: string[];
  useThumbs?: boolean;
  onSelect?: (id: string | null) => void;
  onChange?: (id: string, patch: Partial<AlbumElement>) => void;
  onTextEdit?: (id: string) => void;
  onReady?: (stage: Konva.Stage) => void;
  stageRef?: React.RefObject<Konva.Stage | null>;
}

function useImg(src: string | null | undefined) {
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  useEffect(() => {
    let alive = true;
    if (!src) {
      setImg(null);
      return;
    }
    loadImage(src)
      .then((i) => alive && setImg(i))
      .catch(() => alive && setImg(null));
    return () => {
      alive = false;
    };
  }, [src]);
  return img;
}

export function coverCrop(iw: number, ih: number, w: number, h: number, zoom: number, fx: number, fy: number) {
  const s = Math.max(w / iw, h / ih) * Math.max(1, zoom);
  const cw = Math.min(iw, w / s);
  const ch = Math.min(ih, h / s);
  return { x: (iw - cw) * fx, y: (ih - ch) * fy, width: cw, height: ch };
}

function hasFilters(el: PhotoEl) {
  const f = el.filters;
  return f.grayscale || f.sepia || f.brightness !== 0 || f.contrast !== 0;
}

function PhotoContent({ el, src, pixelRatio, showPlaceholders }: { el: PhotoEl; src: string | null; pixelRatio: number; showPlaceholders: boolean }) {
  const img = useImg(src);
  const ref = useRef<Konva.Image>(null);
  const filtered = hasFilters(el);
  const crop = img ? coverCrop(img.naturalWidth, img.naturalHeight, el.width, el.height, el.zoom, el.focusX, el.focusY) : null;

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (filtered) node.cache({ pixelRatio });
    else node.clearCache();
    node.getLayer()?.batchDraw();
  }, [filtered, img, pixelRatio, el.width, el.height, el.zoom, el.focusX, el.focusY, el.cornerRadius, el.filters.grayscale, el.filters.sepia, el.filters.brightness, el.filters.contrast]);

  const bw = Math.min(el.borderWidth, el.width / 3, el.height / 3);

  if (!img || !crop) {
    if (!showPlaceholders) return null;
    const min = Math.min(el.width, el.height);
    return (
      <>
        <Rect width={el.width} height={el.height} fill="#ece6dc" stroke="#b9ae9c" strokeWidth={Math.max(1.5, min * 0.006)} dash={[8, 6]} cornerRadius={el.cornerRadius} />
        <Text
          text={src ? "Loading…" : "+ Add photo"}
          width={el.width}
          height={el.height}
          align="center"
          verticalAlign="middle"
          fontFamily="Inter"
          fontSize={Math.max(10, Math.min(28, min * 0.09))}
          fill="#8a7f6e"
          listening={false}
        />
      </>
    );
  }

  const filters = [
    ...(el.filters.grayscale ? [Konva.Filters.Grayscale] : []),
    ...(el.filters.sepia ? [Konva.Filters.Sepia] : []),
    ...(el.filters.brightness !== 0 ? [Konva.Filters.Brighten] : []),
    ...(el.filters.contrast !== 0 ? [Konva.Filters.Contrast] : []),
  ];

  return (
    <>
      {el.shadow && (
        <Rect
          width={el.width}
          height={el.height}
          fill="#ffffff"
          cornerRadius={el.cornerRadius}
          shadowColor="#000"
          shadowOpacity={0.28}
          shadowBlur={Math.min(el.width, el.height) * 0.05}
          shadowOffsetY={Math.min(el.width, el.height) * 0.015}
          listening={false}
        />
      )}
      <KImage
        ref={ref}
        image={img}
        width={el.width}
        height={el.height}
        crop={crop}
        cornerRadius={el.cornerRadius}
        filters={filters}
        brightness={el.filters.brightness}
        contrast={el.filters.contrast}
      />
      {bw > 0 && (
        <Rect
          x={bw / 2}
          y={bw / 2}
          width={el.width - bw}
          height={el.height - bw}
          stroke={el.borderColor}
          strokeWidth={bw}
          cornerRadius={Math.max(0, el.cornerRadius - bw / 2)}
          listening={false}
        />
      )}
    </>
  );
}

function StickerContent({ el }: { el: Extract<AlbumElement, { type: "sticker" }> }) {
  const img = useImg(stickerDataUrl(el.stickerId, el.color, el.dieCut));
  if (!img) return <Rect width={el.width} height={el.height} fill="transparent" />;
  return <KImage image={img} width={el.width} height={el.height} />;
}

function ElementNode(props: {
  el: AlbumElement;
  photos: PhotoMap;
  pixelRatio: number;
  editable: boolean;
  showPlaceholders: boolean;
  hidden: boolean;
  useThumbs: boolean;
  pageW: number;
  pageH: number;
  scale: number;
  onSelect?: (id: string) => void;
  onChange?: (id: string, patch: Partial<AlbumElement>) => void;
  onTextEdit?: (id: string) => void;
  setGuides: (g: { v: number[]; h: number[] }) => void;
}) {
  const { el, editable } = props;

  const onDragMove = (e: KonvaEventObject<DragEvent>) => {
    const node = e.target;
    const layer = node.getLayer();
    if (!layer) return;
    const box = node.getClientRect({ relativeTo: layer as unknown as Konva.Container });
    const th = 6 / props.scale;
    const v: number[] = [];
    const h: number[] = [];
    const xs = [0, props.pageW / 2, props.pageW];
    const ys = [0, props.pageH / 2, props.pageH];
    const edgesX = [box.x, box.x + box.width / 2, box.x + box.width];
    const edgesY = [box.y, box.y + box.height / 2, box.y + box.height];
    let dx = 0;
    let dy = 0;
    outerX: for (const t of xs)
      for (const ex of edgesX)
        if (Math.abs(t - ex) < th) {
          dx = t - ex;
          v.push(t);
          break outerX;
        }
    outerY: for (const t of ys)
      for (const ey of edgesY)
        if (Math.abs(t - ey) < th) {
          dy = t - ey;
          h.push(t);
          break outerY;
        }
    if (dx || dy) node.position({ x: node.x() + dx, y: node.y() + dy });
    props.setGuides({ v, h });
  };

  const onDragEnd = (e: KonvaEventObject<DragEvent>) => {
    props.setGuides({ v: [], h: [] });
    props.onChange?.(el.id, { x: Math.round(e.target.x()), y: Math.round(e.target.y()) });
  };

  const onTransformEnd = (e: KonvaEventObject<Event>) => {
    const node = e.target;
    const sx = node.scaleX();
    const sy = node.scaleY();
    node.scale({ x: 1, y: 1 });
    const base = { x: Math.round(node.x()), y: Math.round(node.y()), rotation: Math.round(node.rotation() * 10) / 10 };
    if (el.type === "text") {
      const fontChange = Math.abs(sy - 1) > 0.01;
      const fontSize = fontChange ? Math.max(6, Math.round(el.fontSize * sy)) : el.fontSize;
      props.onChange?.(el.id, { ...base, width: Math.max(20, Math.round(el.width * sx)), fontSize });
    } else {
      props.onChange?.(el.id, { ...base, width: Math.max(10, Math.round(el.width * sx)), height: Math.max(10, Math.round(el.height * sy)) });
    }
  };

  let content: React.ReactNode = null;
  if (el.type === "photo") {
    const p = el.photoId ? props.photos[el.photoId] : undefined;
    const src = p ? (props.useThumbs ? p.thumb : p.src) : null;
    content = <PhotoContent el={el} src={src} pixelRatio={props.pixelRatio} showPlaceholders={props.showPlaceholders} />;
  } else if (el.type === "text") {
    const opt = fontOption(el.fontFamily);
    let style: string = el.fontStyle;
    if (!opt.bold) style = style.replace("bold", "").trim() || "normal";
    if (!opt.italic) style = style.replace("italic", "").trim() || "normal";
    content = (
      <Text
        text={el.text}
        width={el.width}
        fontFamily={el.fontFamily}
        fontSize={el.fontSize}
        fontStyle={style}
        fill={el.fill}
        align={el.align}
        lineHeight={el.lineHeight}
        letterSpacing={el.letterSpacing}
        wrap="word"
      />
    );
  } else if (el.type === "sticker") {
    content = <StickerContent el={el} />;
  } else if (el.type === "shape") {
    if (el.shape === "rect")
      content = <Rect width={el.width} height={el.height} fill={el.fill} stroke={el.stroke} strokeWidth={el.strokeWidth} cornerRadius={el.cornerRadius} />;
    else if (el.shape === "ellipse")
      content = <Ellipse x={el.width / 2} y={el.height / 2} radiusX={el.width / 2} radiusY={el.height / 2} fill={el.fill} stroke={el.stroke} strokeWidth={el.strokeWidth} />;
    else
      content = (
        <>
          <Rect width={el.width} height={el.height} fill="transparent" />
          <Line points={[0, el.height / 2, el.width, el.height / 2]} stroke={el.stroke} strokeWidth={el.strokeWidth} lineCap="round" />
        </>
      );
  }

  return (
    <Group
      id={el.id}
      name="el"
      x={el.x}
      y={el.y}
      rotation={el.rotation}
      opacity={el.opacity ?? 1}
      visible={!props.hidden}
      draggable={editable}
      listening={editable}
      onMouseDown={() => props.onSelect?.(el.id)}
      onTap={() => props.onSelect?.(el.id)}
      onDblClick={() => el.type === "text" && props.onTextEdit?.(el.id)}
      onDblTap={() => el.type === "text" && props.onTextEdit?.(el.id)}
      onDragStart={() => props.onSelect?.(el.id)}
      onDragMove={onDragMove}
      onDragEnd={onDragEnd}
      onTransformEnd={onTransformEnd}
    >
      {content}
    </Group>
  );
}

function BackgroundRect({ page, w, h, onClick }: { page: Page; w: number; h: number; onClick?: () => void }) {
  const bg = page.background;
  const [tile, setTile] = useState<HTMLCanvasElement | null>(null);
  useEffect(() => {
    if (bg.type === "pattern") setTile(patternTile(bg.pattern, bg.color, bg.bg));
  }, [bg]);
  const common = { width: w, height: h, onMouseDown: onClick, onTap: onClick, name: "bg" };
  if (bg.type === "color") return <Rect {...common} fill={bg.color} />;
  if (bg.type === "gradient") {
    const a = (bg.angle * Math.PI) / 180;
    const dx = Math.sin(a);
    const dy = -Math.cos(a);
    const half = (Math.abs(w * dx) + Math.abs(h * dy)) / 2;
    return (
      <Rect
        {...common}
        fillLinearGradientStartPoint={{ x: w / 2 - dx * half, y: h / 2 - dy * half }}
        fillLinearGradientEndPoint={{ x: w / 2 + dx * half, y: h / 2 + dy * half }}
        fillLinearGradientColorStops={[0, bg.from, 1, bg.to]}
      />
    );
  }
  return (
    <>
      <Rect {...common} fill={bg.bg} />
      {tile && <Rect width={w} height={h} fillPatternImage={tile as unknown as HTMLImageElement} fillPatternScale={{ x: PATTERN_TILE_SCALE, y: PATTERN_TILE_SCALE }} fillPatternRepeat="repeat" listening={false} />}
    </>
  );
}

/** Renders one album page. Used by the editor, thumbnails, the share viewer and export. */
export default function PageView(props: PageViewProps) {
  const { doc, page, photos, scale, editable = false, showPlaceholders = editable, selectedId = null } = props;
  const { w, h } = pageDims(doc.size);
  const pixelRatio = props.pixelRatio ?? Math.min(3, scale * (typeof window !== "undefined" ? window.devicePixelRatio : 1));
  const stageRef = useRef<Konva.Stage>(null);
  const trRef = useRef<Konva.Transformer>(null);
  const [guides, setGuides] = useState<{ v: number[]; h: number[] }>({ v: [], h: [] });
  const [fontsReady, setFontsReady] = useState(false);

  // Wait for fonts (and, for export, every image) before reporting "ready".
  const neededSrcs = useMemo(() => {
    const s: string[] = [];
    for (const e of page.elements) {
      if (e.type === "photo" && e.photoId && photos[e.photoId]) s.push(props.useThumbs ? photos[e.photoId].thumb : photos[e.photoId].src);
      if (e.type === "sticker") s.push(stickerDataUrl(e.stickerId, e.color, e.dieCut));
    }
    return s;
  }, [page.elements, photos, props.useThumbs]);
  const fontKey = JSON.stringify(pageFonts(page));

  useEffect(() => {
    let alive = true;
    ensureFonts(JSON.parse(fontKey)).then(() => {
      if (!alive) return;
      setFontsReady(true);
      stageRef.current?.batchDraw();
    });
    return () => {
      alive = false;
    };
  }, [fontKey]);

  const { onReady } = props;
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (!onReady) return;
    let alive = true;
    Promise.all(neededSrcs.map((s) => loadImage(s).catch(() => null)))
      .then(() => ensureFonts(JSON.parse(fontKey)))
      .then(() => alive && setReady(true));
    return () => {
      alive = false;
    };
  }, [neededSrcs, fontKey, onReady]);

  useEffect(() => {
    if (!ready || !onReady) return;
    // two frames: let React commit image state and caches, then draw
    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        const st = stageRef.current;
        if (st) {
          st.draw();
          onReady(st);
        }
      });
    });
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, [ready, onReady]);

  useEffect(() => {
    if (props.stageRef) props.stageRef.current = stageRef.current;
  });

  // Attach the transformer to the selected element.
  const selected = page.elements.find((e) => e.id === selectedId);
  useEffect(() => {
    const tr = trRef.current;
    const st = stageRef.current;
    if (!tr || !st) return;
    const node = selectedId ? st.findOne((n: Konva.Node) => n.id() === selectedId && n.name() === "el") : null;
    tr.nodes(node ? [node] : []);
    tr.getLayer()?.batchDraw();
  }, [selectedId, page.elements]);

  const anchors =
    selected?.type === "text"
      ? ["top-left", "top-right", "bottom-left", "bottom-right", "middle-left", "middle-right"]
      : selected?.type === "sticker"
        ? ["top-left", "top-right", "bottom-left", "bottom-right"]
        : undefined;

  const staticExport = !!onReady;
  const showElements = !staticExport || ready;

  return (
    <Stage ref={stageRef} width={Math.round(w * scale)} height={Math.round(h * scale)} scaleX={scale} scaleY={scale} listening={editable}>
      <Layer>
        <BackgroundRect page={page} w={w} h={h} onClick={editable ? () => props.onSelect?.(null) : undefined} />
        {showElements &&
          page.elements.map((el) => (
            <ElementNode
              key={el.id + (fontsReady ? "-f" : "")}
              el={el}
              photos={photos}
              pixelRatio={pixelRatio}
              editable={editable}
              showPlaceholders={showPlaceholders}
              hidden={props.hiddenIds?.includes(el.id) ?? false}
              useThumbs={props.useThumbs ?? false}
              pageW={w}
              pageH={h}
              scale={scale}
              onSelect={props.onSelect ? (id) => props.onSelect!(id) : undefined}
              onChange={props.onChange}
              onTextEdit={props.onTextEdit}
              setGuides={setGuides}
            />
          ))}
        {editable && (
          <>
            {guides.v.map((x) => (
              <Line key={"v" + x} points={[x, 0, x, h]} stroke="#e0457b" strokeWidth={1 / scale} dash={[4 / scale, 4 / scale]} listening={false} />
            ))}
            {guides.h.map((y) => (
              <Line key={"h" + y} points={[0, y, w, y]} stroke="#e0457b" strokeWidth={1 / scale} dash={[4 / scale, 4 / scale]} listening={false} />
            ))}
            <Transformer
              ref={trRef}
              rotationSnaps={[0, 90, 180, 270]}
              rotationSnapTolerance={4}
              keepRatio={selected?.type !== "photo" && selected?.type !== "shape"}
              enabledAnchors={anchors}
              anchorSize={10}
              anchorCornerRadius={5}
              borderStroke="#c2593b"
              anchorStroke="#c2593b"
              anchorFill="#ffffff"
              padding={2}
              ignoreStroke
              boundBoxFunc={(oldBox, newBox) => (Math.abs(newBox.width) < 12 || Math.abs(newBox.height) < 12 ? oldBox : newBox)}
            />
          </>
        )}
      </Layer>
    </Stage>
  );
}
