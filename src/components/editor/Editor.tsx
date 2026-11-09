"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type Konva from "konva";
import {
  ArrowLeft,
  Check,
  CloudOff,
  Download,
  Eye,
  Package,
  FileImage,
  FileText,
  Images,
  LayoutGrid,
  Loader2,
  Minus,
  PaintBucket,
  Plus,
  Printer,
  Redo2,
  Share2,
  Smile,
  Type,
  Undo2,
  X,
} from "lucide-react";
import type { Album, AlbumDoc, AlbumElement, Page, Photo, PhotoMap, TextEl } from "@/lib/types";
import { pageDims } from "@/lib/pageSizes";
import { applyLayout, blankPage, clonePage, docCover, hitTest, newPhotoEl, photoStyleOf, removePhotoRefs, uid } from "@/lib/doc";
import { templateById } from "@/lib/templates";
import { storeFor, moveLocalAlbumToCloud } from "@/lib/store";
import { cloudStore } from "@/lib/store/cloud";
import { exportImages, exportPdf, printAlbum } from "@/lib/export";
import { useHistory } from "./useHistory";
import type { EditorApi, UploadItem } from "./api";
import PhotosPanel from "./panels/PhotosPanel";
import LayoutsPanel from "./panels/LayoutsPanel";
import TextPanel from "./panels/TextPanel";
import StickersPanel from "./panels/StickersPanel";
import BackgroundPanel from "./panels/BackgroundPanel";
import Properties from "./Properties";
import PageStrip from "./PageStrip";
import ShareDialog from "./ShareDialog";
import AlbumViewer from "../AlbumViewer";
import Buddy from "../motion/Buddy";
import { IconButton } from "./controls";
import { useApp } from "../AppProvider";

const PageView = dynamic(() => import("../canvas/PageView"), { ssr: false });

type PanelId = "photos" | "layouts" | "text" | "stickers" | "background";
const PANELS: { id: PanelId; label: string; icon: typeof Images }[] = [
  { id: "photos", label: "Photos", icon: Images },
  { id: "layouts", label: "Layouts", icon: LayoutGrid },
  { id: "text", label: "Text", icon: Type },
  { id: "stickers", label: "Stickers", icon: Smile },
  { id: "background", label: "Background", icon: PaintBucket },
];

function useIsDesktop() {
  const [d, setD] = useState(true);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const on = () => setD(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return d;
}

export default function Editor({ album }: { album: Album }) {
  const router = useRouter();
  const { config, user } = useApp();
  const store = storeFor(album.source);
  const history = useHistory<AlbumDoc>(album.doc);
  const doc = history.value;
  const [title, setTitle] = useState(album.title);
  const [photos, setPhotos] = useState<Photo[]>(album.photos);
  const [pageIndex, setPageIndexRaw] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [panel, setPanel] = useState<PanelId | null>("photos");
  const [uploads, setUploads] = useState<UploadItem[]>([]);
  const [saveState, setSaveState] = useState<"saved" | "saving" | "unsaved" | "error">("saved");
  const [toast, setToast] = useState("");
  const [exporting, setExporting] = useState<{ label: string; done: number; total: number } | null>(null);
  const [menu, setMenu] = useState(false);
  const [preview, setPreview] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [moving, setMoving] = useState<string | null>(null);
  const [share, setShare] = useState({
    shareToken: album.shareToken ?? null,
    shareEnabled: album.shareEnabled ?? false,
    allowGuestUploads: album.allowGuestUploads ?? false,
    allowDownload: album.allowDownload ?? true,
  });
  const [editingText, setEditingText] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const isDesktop = useIsDesktop();
  const stageRef = useRef<Konva.Stage | null>(null);
  const canvasArea = useRef<HTMLDivElement>(null);
  const [area, setArea] = useState({ w: 0, h: 0 });

  const { w: pageW, h: pageH } = pageDims(doc.size);
  const safeIndex = Math.min(pageIndex, doc.pages.length - 1);
  const page = doc.pages[safeIndex];
  const photoMap: PhotoMap = useMemo(() => Object.fromEntries(photos.map((p) => [p.id, p])), [photos]);
  const selected = page.elements.find((e) => e.id === selectedId) ?? null;

  const notify = useCallback((m: string) => {
    setToast(m);
    window.setTimeout(() => setToast((t) => (t === m ? "" : t)), 4000);
  }, []);

  const setPageIndex = useCallback((i: number) => {
    setPageIndexRaw(i);
    setSelectedId(null);
    setEditingText(null);
  }, []);

  // ---------- document updates ----------
  const updateDoc = history.set;
  const updatePage = useCallback(
    (fn: (p: Page) => Page, key?: string) => updateDoc((d) => ({ ...d, pages: d.pages.map((p, i) => (i === safeIndex ? fn(p) : p)) }), key),
    [updateDoc, safeIndex],
  );
  const updateElement = useCallback(
    (id: string, patch: Partial<AlbumElement>, key?: string) =>
      updatePage((p) => ({ ...p, elements: p.elements.map((e) => (e.id === id ? ({ ...e, ...patch } as AlbumElement) : e)) }), key),
    [updatePage],
  );
  const addElement = useCallback(
    (el: AlbumElement) => {
      updatePage((p) => ({ ...p, elements: [...p.elements, el] }));
      setSelectedId(el.id);
      if (!isDesktop) setPanel(null);
    },
    [updatePage, isDesktop],
  );

  const deleteSelected = useCallback(() => {
    if (!selectedId) return;
    updatePage((p) => ({ ...p, elements: p.elements.filter((e) => e.id !== selectedId) }));
    setSelectedId(null);
  }, [selectedId, updatePage]);

  const duplicateSelected = useCallback(() => {
    if (!selected) return;
    const copy = { ...structuredClone(selected), id: uid(), x: selected.x + 20, y: selected.y + 20 };
    addElement(copy);
  }, [selected, addElement]);

  const arrange = useCallback(
    (a: "front" | "forward" | "backward" | "back") => {
      if (!selectedId) return;
      updatePage((p) => {
        const els = [...p.elements];
        const i = els.findIndex((e) => e.id === selectedId);
        if (i < 0) return p;
        const [el] = els.splice(i, 1);
        const to = a === "front" ? els.length : a === "back" ? 0 : a === "forward" ? Math.min(els.length, i + 1) : Math.max(0, i - 1);
        els.splice(to, 0, el);
        return { ...p, elements: els };
      });
    },
    [selectedId, updatePage],
  );

  // ---------- photos ----------
  const placePhoto = useCallback(
    (photoId: string, point?: { x: number; y: number }) => {
      const photo = photos.find((p) => p.id === photoId);
      if (!photo) return;
      const fill = (id: string) => {
        updateElement(id, { photoId, zoom: 1, focusX: 0.5, focusY: 0.5 } as Partial<AlbumElement>);
        setSelectedId(id);
      };
      if (point) {
        const target = [...page.elements].reverse().find((e) => e.type === "photo" && hitTest(e, point.x, point.y));
        if (target) return fill(target.id);
      } else {
        if (selected?.type === "photo") return fill(selected.id);
        const empty = page.elements.find((e) => e.type === "photo" && !e.photoId);
        if (empty) return fill(empty.id);
      }
      const max = 0.5;
      const ratio = photo.width / photo.height;
      let w = pageW * max;
      let h = w / ratio;
      if (h > pageH * max) {
        h = pageH * max;
        w = h * ratio;
      }
      const cx = point?.x ?? pageW / 2;
      const cy = point?.y ?? pageH / 2;
      addElement(newPhotoEl({ x: Math.round(cx - w / 2), y: Math.round(cy - h / 2), width: Math.round(w), height: Math.round(h), rotation: 0 }, photoStyleOf(page), photoId));
    },
    [photos, page, selected, updateElement, addElement, pageW, pageH],
  );

  const uploadFiles = useCallback(
    async (files: File[]): Promise<Photo[]> => {
      const images = files.filter((f) => f.type.startsWith("image/") || /\.(jpe?g|png|webp|heic|heif)$/i.test(f.name));
      if (!images.length) {
        if (files.length) notify("Those files are not images.");
        return [];
      }
      const items = images.map((f) => ({ id: uid(), name: f.name, status: "uploading" as const }));
      setUploads((u) => [...u.filter((x) => x.status === "uploading"), ...items]);
      // Upload 3 at a time, but add finished photos in the order they were chosen.
      const results: (Photo | null | undefined)[] = images.map(() => undefined);
      let flushed = 0;
      const flush = () => {
        const ready: Photo[] = [];
        while (flushed < results.length && results[flushed] !== undefined) {
          const r = results[flushed++];
          if (r) ready.push(r);
        }
        if (ready.length) setPhotos((ps) => [...ps, ...ready]);
      };
      const out: Photo[] = [];
      const queue = images.map((f, i) => ({ f, item: items[i], i }));
      await Promise.all(
        Array.from({ length: Math.min(3, queue.length) }, async () => {
          while (queue.length) {
            const { f, item, i } = queue.shift()!;
            try {
              const p = await store.addPhoto(album.id, f);
              out.push(p);
              results[i] = p;
              flush();
              setUploads((u) => u.filter((x) => x.id !== item.id));
            } catch (e) {
              results[i] = null;
              flush();
              setUploads((u) => u.map((x) => (x.id === item.id ? { ...x, status: "error", error: `${f.name}: ${(e as Error).message}` } : x)));
            }
          }
        }),
      );
      if (out.length) notify(`Added ${out.length} photo${out.length === 1 ? "" : "s"}. Drag onto a page or use Auto-fill.`);
      return results.filter((r): r is Photo => !!r);
    },
    [album.id, store, notify],
  );

  const removePhoto = useCallback(
    async (photoId: string) => {
      try {
        await store.removePhoto(album.id, photoId);
        setPhotos((ps) => ps.filter((p) => p.id !== photoId));
        updateDoc((d) => removePhotoRefs(d, photoId));
      } catch (e) {
        notify((e as Error).message);
      }
    },
    [album.id, store, updateDoc, notify],
  );

  // ---------- pages ----------
  const addPage = useCallback(
    (layoutId = "two-side") => {
      const theme = templateById(doc.templateId).theme;
      const base = blankPage(page.background);
      base.elements = [newPhotoEl({ x: 0, y: 0, width: 10, height: 10, rotation: 0 }, photoStyleOf(doc.pages[Math.max(1, safeIndex)] ?? page))];
      const np = applyLayout(base, layoutId, doc, { fontFamily: theme.body, fill: theme.text });
      updateDoc((d) => {
        const pages = [...d.pages];
        pages.splice(safeIndex + 1, 0, np);
        return { ...d, pages };
      });
      setPageIndex(safeIndex + 1);
    },
    [doc, page, safeIndex, updateDoc, setPageIndex],
  );

  const duplicatePage = () => {
    const np = clonePage(page);
    updateDoc((d) => {
      const pages = [...d.pages];
      pages.splice(safeIndex + 1, 0, np);
      return { ...d, pages };
    });
    setPageIndex(safeIndex + 1);
  };

  const deletePage = () => {
    if (doc.pages.length <= 1) return;
    if (page.elements.some((e) => e.type !== "photo" || e.photoId) && !confirm("Delete this page?")) return;
    updateDoc((d) => ({ ...d, pages: d.pages.filter((_, i) => i !== safeIndex) }));
    setPageIndex(Math.max(0, safeIndex - 1));
  };

  const movePage = (from: number, to: number) => {
    if (to < 0 || to >= doc.pages.length) return;
    updateDoc((d) => {
      const pages = [...d.pages];
      const [p] = pages.splice(from, 1);
      pages.splice(to, 0, p);
      return { ...d, pages };
    });
    setPageIndex(to);
  };

  // ---------- autosave ----------
  const firstRender = useRef(true);
  const saveSeq = useRef(0);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    setSaveState("unsaved");
    const t = window.setTimeout(async () => {
      const seq = ++saveSeq.current;
      setSaveState("saving");
      try {
        await store.save(album.id, { doc, title: title.trim() || "Untitled album", cover: docCover(doc, photos) });
        if (seq === saveSeq.current) setSaveState("saved");
      } catch {
        if (seq === saveSeq.current) setSaveState("error");
      }
    }, 900);
    return () => window.clearTimeout(t);
    // photos only affect the cover thumbnail; saving on doc/title changes is enough
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doc, title]);

  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => {
      if (saveState !== "saved") e.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [saveState]);

  // ---------- guest photos (cloud) ----------
  useEffect(() => {
    if (album.source !== "cloud" || !share.allowGuestUploads) return;
    const t = window.setInterval(async () => {
      try {
        const latest = await cloudStore.listPhotos(album.id);
        setPhotos((ps) => {
          const have = new Set(ps.map((p) => p.id));
          const fresh = latest.filter((p) => !have.has(p.id));
          if (fresh.length) notify(`${fresh.length} new guest photo${fresh.length === 1 ? "" : "s"} arrived.`);
          return fresh.length ? [...ps, ...fresh] : ps;
        });
      } catch {
        /* ignore */
      }
    }, 20000);
    return () => window.clearInterval(t);
  }, [album.id, album.source, share.allowGuestUploads, notify]);

  // ---------- keyboard ----------
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t.closest("input, textarea, select, [contenteditable=true]")) return;
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) history.redo();
        else history.undo();
      } else if (mod && e.key.toLowerCase() === "y") {
        e.preventDefault();
        history.redo();
      } else if (mod && e.key.toLowerCase() === "d" && selected) {
        e.preventDefault();
        duplicateSelected();
      } else if ((e.key === "Delete" || e.key === "Backspace") && selected) {
        e.preventDefault();
        deleteSelected();
      } else if (e.key === "Escape") {
        setSelectedId(null);
      } else if (selected && e.key.startsWith("Arrow")) {
        e.preventDefault();
        const step = e.shiftKey ? 10 : 1;
        const d = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] }[e.key] ?? [0, 0];
        updateElement(selected.id, { x: selected.x + d[0], y: selected.y + d[1] }, `nudge-${selected.id}`);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [history, selected, deleteSelected, duplicateSelected, updateElement]);

  // ---------- canvas sizing ----------
  useEffect(() => {
    const el = canvasArea.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setArea({ w: e.contentRect.width, h: e.contentRect.height }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const pad = isDesktop ? 48 : 24;
  const fit = area.w ? Math.max(0.05, Math.min((area.w - pad) / pageW, (area.h - pad) / pageH)) : 0;
  const scale = fit * zoom;

  const toPagePoint = (clientX: number, clientY: number) => {
    const c = stageRef.current?.container().getBoundingClientRect();
    if (!c) return undefined;
    return { x: (clientX - c.left) / scale, y: (clientY - c.top) / scale };
  };

  const onCanvasDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const point = toPagePoint(e.clientX, e.clientY);
    const photoId = e.dataTransfer.getData("application/x-keepsake-photo");
    if (photoId) return placePhoto(photoId, point);
    if (e.dataTransfer.files.length) {
      const added = await uploadFiles(Array.from(e.dataTransfer.files));
      if (added[0]) placePhoto(added[0].id, point);
    }
  };

  // ---------- export ----------
  async function runExport(kind: "pdf" | "images" | "print") {
    setMenu(false);
    const label = kind === "pdf" ? "Creating your PDF" : kind === "images" ? "Creating page images" : "Preparing to print";
    setExporting({ label, done: 0, total: doc.pages.length });
    const progress = (done: number, total: number) => setExporting({ label, done, total });
    try {
      if (kind === "pdf") await exportPdf(doc, photoMap, title, progress);
      else if (kind === "images") await exportImages(doc, photoMap, title, progress);
      else await printAlbum(doc, photoMap, title, progress);
    } catch (err) {
      notify(`Export failed: ${(err as Error).message}`);
    } finally {
      setExporting(null);
    }
  }

  async function moveToCloud(then: "edit" | "order" = "edit") {
    setShareOpen(false);
    setMoving("Saving…");
    try {
      await store.save(album.id, { doc, title: title.trim() || "Untitled album", cover: docCover(doc, photos) });
      setSaveState("saved");
      const id = await moveLocalAlbumToCloud(album.id, (d, t) => setMoving(`Uploading photos ${d} of ${t}…`));
      router.replace(then === "order" ? `/order/${id}` : `/edit/${id}`);
    } catch (e) {
      setMoving(null);
      notify(`Could not save to your account: ${(e as Error).message}`);
    }
  }

  /** Printed copies need the book in the customer's account, so the team can open it. */
  async function orderPrint() {
    if (album.source === "cloud") {
      setMoving("Saving…");
      try {
        await store.save(album.id, { doc, title: title.trim() || "Untitled album", cover: docCover(doc, photos) });
        router.push(`/order/${album.id}`);
      } catch (e) {
        setMoving(null);
        notify(`Could not save your book: ${(e as Error).message}`);
      }
    } else if (!user) {
      if (confirm("To order a printed copy, sign in first. Your book will be saved to your account so we can print it.")) router.push(`/signin?next=${encodeURIComponent(`/edit/local/${album.id}`)}`);
    } else if (confirm("We'll save this book to your account first, so our printing team can open it. Continue?")) {
      moveToCloud("order");
    }
  }

  const ed: EditorApi = {
    album,
    doc,
    page,
    pageIndex: safeIndex,
    pageW,
    pageH,
    photos,
    photoMap,
    selected,
    uploads,
    updateDoc,
    updatePage,
    updateElement,
    addElement,
    select: setSelectedId,
    uploadFiles: async (f) => {
      await uploadFiles(f);
    },
    placePhoto,
    removePhoto,
    addPage,
    setPageIndex,
    notify,
  };

  const editingEl = editingText ? (page.elements.find((e) => e.id === editingText) as TextEl | undefined) : undefined;
  const showPanel = panel !== null && (isDesktop || !selected);
  const showProps = !!selected && (isDesktop || panel === null);

  const panelContent =
    panel === "photos" ? <PhotosPanel ed={ed} /> : panel === "layouts" ? <LayoutsPanel ed={ed} /> : panel === "text" ? <TextPanel ed={ed} /> : panel === "stickers" ? <StickersPanel ed={ed} /> : panel === "background" ? <BackgroundPanel ed={ed} /> : null;

  const togglePanel = (id: PanelId) => {
    setPanel((p) => (p === id && !isDesktop ? null : id));
    if (!isDesktop) setSelectedId(null);
  };

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-paper">
      {/* top bar */}
      <header className="flex h-14 shrink-0 items-center gap-1 border-b border-line bg-white px-2 sm:gap-2 sm:px-3">
        <Link href="/albums" className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-black/5" aria-label="Back to my albums">
          <ArrowLeft className="h-5 w-5" aria-hidden />
        </Link>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="min-w-0 flex-1 rounded-md bg-transparent px-2 py-1 font-display text-base font-bold outline-none hover:bg-paper focus:bg-paper sm:max-w-xs sm:text-lg"
          aria-label="Album title"
          maxLength={120}
        />
        <span className="hidden items-center gap-1 text-xs text-muted md:flex" aria-live="polite">
          {saveState === "saving" || saveState === "unsaved" ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden /> Saving
            </>
          ) : saveState === "error" ? (
            <span className="flex items-center gap-1 text-red-600">
              <CloudOff className="h-3.5 w-3.5" aria-hidden /> Not saved, will retry on next change
            </span>
          ) : (
            <>
              <Check className="h-3.5 w-3.5" aria-hidden /> {album.source === "cloud" ? "Saved" : "Saved in this browser"}
            </>
          )}
        </span>
        <div className="ml-auto flex items-center gap-0.5 sm:gap-1">
          <IconButton label="Undo" onClick={history.undo} disabled={!history.canUndo}>
            <Undo2 className="h-4 w-4" />
          </IconButton>
          <IconButton label="Redo" onClick={history.redo} disabled={!history.canRedo}>
            <Redo2 className="h-4 w-4" />
          </IconButton>
          <button className="btn-ghost hidden sm:inline-flex" onClick={() => setPreview(true)}>
            <Eye className="h-4 w-4" aria-hidden /> Preview
          </button>
          {config.cloud && (
            <button className="btn-ghost hidden sm:inline-flex" onClick={orderPrint} aria-label="Order a printed copy">
              <Package className="h-4 w-4" aria-hidden /> <span className="hidden lg:inline">Order print</span>
            </button>
          )}
          {(config.cloud || album.source === "cloud") && (
            <button className="btn-ghost" onClick={() => setShareOpen(true)} aria-label="Share">
              <Share2 className="h-4 w-4" aria-hidden /> <span className="hidden sm:inline">Share</span>
            </button>
          )}
          <div className="relative">
            <button className="btn-primary px-3 sm:px-4" onClick={() => setMenu((m) => !m)} aria-haspopup="menu" aria-expanded={menu}>
              <Download className="h-4 w-4" aria-hidden /> <span className="hidden sm:inline">Download</span>
            </button>
            {menu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setMenu(false)} />
                <div className="absolute right-0 z-50 mt-2 w-72 max-w-[calc(100vw-1rem)] rounded-xl border border-line bg-white p-2 shadow-xl" role="menu">
                  <button className="flex w-full items-start gap-3 rounded-lg p-3 text-left hover:bg-paper" onClick={() => runExport("pdf")} role="menuitem">
                    <FileText className="mt-0.5 h-5 w-5 text-accent" aria-hidden />
                    <span>
                      <span className="block text-sm font-semibold">PDF for printing</span>
                      <span className="block text-xs text-muted">High quality (300 DPI). Take it to a print shop or print at home.</span>
                    </span>
                  </button>
                  <button className="flex w-full items-start gap-3 rounded-lg p-3 text-left hover:bg-paper" onClick={() => runExport("images")} role="menuitem">
                    <FileImage className="mt-0.5 h-5 w-5 text-accent" aria-hidden />
                    <span>
                      <span className="block text-sm font-semibold">Page images (JPG)</span>
                      <span className="block text-xs text-muted">Every page as a picture, in one zip file.</span>
                    </span>
                  </button>
                  {config.cloud && (
                    <button
                      className="flex w-full items-start gap-3 rounded-lg p-3 text-left hover:bg-paper sm:hidden"
                      onClick={() => {
                        setMenu(false);
                        orderPrint();
                      }}
                      role="menuitem"
                    >
                      <Package className="mt-0.5 h-5 w-5 text-accent" aria-hidden />
                      <span>
                        <span className="block text-sm font-semibold">Order a printed book</span>
                        <span className="block text-xs text-muted">We print it and ship it to your door.</span>
                      </span>
                    </button>
                  )}
                  <button className="flex w-full items-start gap-3 rounded-lg p-3 text-left hover:bg-paper" onClick={() => runExport("print")} role="menuitem">
                    <Printer className="mt-0.5 h-5 w-5 text-accent" aria-hidden />
                    <span>
                      <span className="block text-sm font-semibold">Print now</span>
                      <span className="block text-xs text-muted">Opens your printer settings. Choose &quot;Actual size&quot; and no margins.</span>
                    </span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      <div className="relative flex min-h-0 flex-1 flex-col lg:flex-row">
        {/* tool rail (desktop) */}
        <nav className="hidden w-[76px] shrink-0 flex-col items-center gap-1 border-r border-line bg-white py-2 lg:flex" aria-label="Tools">
          {PANELS.map((p) => (
            <button
              key={p.id}
              onClick={() => togglePanel(p.id)}
              className={`flex w-16 flex-col items-center gap-1 rounded-lg py-2 text-[11px] font-medium transition ${panel === p.id ? "bg-accent-soft text-accent-dark" : "text-muted hover:bg-paper hover:text-ink"}`}
            >
              <p.icon className="h-5 w-5" aria-hidden />
              {p.label}
            </button>
          ))}
        </nav>

        {/* tool panel */}
        {showPanel && (
          <aside className="order-2 h-[46dvh] shrink-0 overflow-y-auto overscroll-contain rounded-t-2xl border-t border-line bg-white p-4 shadow-[0_-8px_24px_rgba(0,0,0,0.08)] lg:order-none lg:h-auto lg:shrink-0 lg:rounded-none lg:border-t-0 lg:shadow-none lg:w-80 lg:border-r">
            <div className="sticky -top-4 z-10 -mx-4 -mt-4 mb-3 flex items-center justify-between bg-white px-4 pb-2 pt-3 lg:hidden">
              <h2 className="font-semibold">{PANELS.find((p) => p.id === panel)?.label}</h2>
              <button onClick={() => setPanel(null)} className="-mr-2 rounded-full p-2.5 hover:bg-paper" aria-label="Close panel">
                <X className="h-5 w-5" aria-hidden />
              </button>
            </div>
            {panelContent}
          </aside>
        )}

        {/* canvas */}
        <div ref={canvasArea} className="relative order-1 min-h-0 min-w-0 flex-1 overflow-auto bg-[#ebe5dc] lg:order-none" onDragOver={(e) => e.preventDefault()} onDrop={onCanvasDrop}>
          <div className="flex min-h-full min-w-full items-center justify-center" style={{ padding: pad / 2 }} onMouseDown={(e) => e.target === e.currentTarget && setSelectedId(null)}>
            {scale > 0 && (
              <div className="relative shadow-xl" style={{ width: Math.round(pageW * scale), height: Math.round(pageH * scale) }}>
                <PageView
                  doc={doc}
                  page={page}
                  photos={photoMap}
                  scale={scale}
                  editable
                  selectedId={selectedId}
                  hiddenIds={editingText ? [editingText] : undefined}
                  onSelect={(id) => {
                    setSelectedId(id);
                    if (id && !isDesktop) setPanel(null);
                    if (editingText && id !== editingText) setEditingText(null);
                  }}
                  onChange={(id, patch) => updateElement(id, patch)}
                  onTextEdit={(id) => setEditingText(id)}
                  stageRef={stageRef}
                />
                {editingEl && (
                  <textarea
                    autoFocus
                    defaultValue={editingEl.text}
                    onBlur={(e) => {
                      updateElement(editingEl.id, { text: e.target.value });
                      setEditingText(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Escape" || (e.key === "Enter" && (e.metaKey || e.ctrlKey))) (e.target as HTMLTextAreaElement).blur();
                    }}
                    className="absolute resize-none overflow-hidden border border-dashed border-accent bg-white/60 p-0 outline-none"
                    style={{
                      left: editingEl.x * scale,
                      top: editingEl.y * scale,
                      width: editingEl.width * scale,
                      minHeight: editingEl.fontSize * editingEl.lineHeight * scale * 1.2,
                      height: "auto",
                      transform: `rotate(${editingEl.rotation}deg)`,
                      transformOrigin: "top left",
                      fontFamily: editingEl.fontFamily,
                      fontSize: editingEl.fontSize * scale,
                      fontWeight: editingEl.fontStyle.includes("bold") ? 700 : 400,
                      fontStyle: editingEl.fontStyle.includes("italic") ? "italic" : "normal",
                      color: editingEl.fill,
                      textAlign: editingEl.align,
                      lineHeight: editingEl.lineHeight,
                      letterSpacing: editingEl.letterSpacing * scale,
                    }}
                    rows={Math.max(1, editingEl.text.split("\n").length)}
                  />
                )}
              </div>
            )}
          </div>
          <div className="pointer-events-none sticky bottom-3 flex justify-end px-3">
            <div className="pointer-events-auto flex items-center gap-1 rounded-full bg-white/95 px-1 py-0.5 shadow">
              <IconButton label="Zoom out" onClick={() => setZoom((z) => Math.max(0.5, +(z - 0.25).toFixed(2)))}>
                <Minus className="h-4 w-4" />
              </IconButton>
              <button className="h-9 w-12 text-xs font-semibold" onClick={() => setZoom(1)} title="Fit to screen">
                {Math.round(zoom * 100)}%
              </button>
              <IconButton label="Zoom in" onClick={() => setZoom((z) => Math.min(3, +(z + 0.25).toFixed(2)))}>
                <Plus className="h-4 w-4" />
              </IconButton>
            </div>
          </div>
        </div>

        {/* properties */}
        {showProps && selected && (
          <aside className="order-2 h-[46dvh] shrink-0 overflow-y-auto overscroll-contain rounded-t-2xl border-t border-line bg-white p-4 shadow-[0_-8px_24px_rgba(0,0,0,0.08)] lg:order-none lg:h-auto lg:shrink-0 lg:rounded-none lg:border-t-0 lg:shadow-none lg:w-72 lg:border-l">
            <div className="sticky -top-4 z-10 -mx-4 -mt-4 mb-1 flex justify-end bg-white px-4 pt-2 lg:hidden">
              <button className="rounded-full px-3 py-2 text-sm font-semibold text-accent-dark hover:bg-paper" onClick={() => setSelectedId(null)}>
                Done
              </button>
            </div>
            <Properties ed={ed} el={selected} onDelete={deleteSelected} onDuplicate={duplicateSelected} onArrange={arrange} />
          </aside>
        )}
      </div>

      <div className={showPanel || showProps ? "hidden lg:block" : undefined}>
        <PageStrip doc={doc} photos={photoMap} index={safeIndex} onSelect={setPageIndex} onAdd={() => addPage()} onDuplicate={duplicatePage} onDelete={deletePage} onMove={movePage} />
      </div>

      {/* tool rail (mobile) */}
      <nav className="flex shrink-0 justify-around border-t border-line bg-white pb-[env(safe-area-inset-bottom)] lg:hidden" aria-label="Tools">
        {PANELS.map((p) => (
          <button key={p.id} onClick={() => togglePanel(p.id)} className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] font-medium ${panel === p.id && showPanel ? "text-accent-dark" : "text-muted"}`}>
            <p.icon className="h-5 w-5" aria-hidden />
            {p.label}
          </button>
        ))}
        <button onClick={() => setPreview(true)} className="flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] font-medium text-muted sm:hidden">
          <Eye className="h-5 w-5" aria-hidden />
          Preview
        </button>
      </nav>

      {toast && (
        <div className="fixed left-1/2 top-16 z-50 max-w-[90vw] -translate-x-1/2 rounded-full bg-ink px-4 py-2 text-sm text-white shadow-lg" role="status">
          {toast}
        </div>
      )}

      {(exporting || moving) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-xl">
            <Buddy size={64} className="mx-auto" />
            <p className="mt-3 font-semibold">{exporting ? exporting.label : "Saving to your account"}</p>
            <p className="mt-1 text-sm text-muted">{exporting ? `Page ${Math.min(exporting.done + 1, exporting.total)} of ${exporting.total}` : moving}</p>
            {exporting && (
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-line">
                <div className="h-full bg-accent transition-all" style={{ width: `${(exporting.done / exporting.total) * 100}%` }} />
              </div>
            )}
            <p className="mt-3 text-xs text-muted">Keep this tab open.</p>
          </div>
        </div>
      )}

      {preview && (
        <div className="fixed inset-0 z-50 flex flex-col bg-[#2a2622]/95 p-4">
          <div className="flex justify-end">
            <button onClick={() => setPreview(false)} className="rounded-full bg-white/10 p-2 text-white hover:bg-white/20" aria-label="Close preview">
              <X className="h-5 w-5" aria-hidden />
            </button>
          </div>
          <div className="flex flex-1 items-center justify-center text-white [&_p]:text-white/70">
            <div className="w-full max-w-5xl">
              <AlbumViewer doc={doc} photos={photoMap} reserve={160} outsideArrows />
            </div>
          </div>
        </div>
      )}

      {shareOpen && <ShareDialog album={album} settings={share} onChange={(s) => setShare({ shareToken: s.shareToken ?? null, shareEnabled: !!s.shareEnabled, allowGuestUploads: !!s.allowGuestUploads, allowDownload: s.allowDownload ?? true })} onClose={() => setShareOpen(false)} onMoveToCloud={() => moveToCloud()} />}
    </div>
  );
}
