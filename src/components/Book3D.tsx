import clsx from "clsx";
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
} from "react";

import { getGetImageUrl } from "#/generated/api/endpoints";
import type { BookDTO } from "#/generated/api/models";
import { coverPaletteIndex } from "#/lib/cover";

import { Cover } from "./Cover";

const DRAG_THRESHOLD = 5;
const TURN_SPEED = 0.7;
const PITCH_SPEED = 0.6;
const MAX_PITCH = 75;
const TILT_SPEED = 0.3;
const MAX_TILT = 24;
const QUARTER_TURN = 90;
const SPINE_RATIO = 0.2;
const BACK_OPEN_DELAY = 160;
const SPINE_CLOSE_DELAY = 140;

const clamp = (v: number, m: number) => Math.max(-m, Math.min(m, v));

export const Book3D = ({ book: { isbn, title, authors } }: { book: BookDTO }) => {
  const [failed, setFailed] = useState<{ spine?: boolean; back?: boolean }>({});
  const [loaded, setLoaded] = useState<{ spine?: boolean; back?: boolean }>({});
  const full = !failed.spine && !failed.back;

  const [rot, setRot] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [open, setOpen] = useState(false);
  const drag = useRef<{ x: number; y: number; rx: number; ry: number; moved: boolean } | null>(
    null,
  );
  const suppressClick = useRef(false);
  const button = useRef<HTMLButtonElement>(null);
  const [shift, setShift] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!open) return;
    const onKey = (e: globalThis.KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const center = () => {
    const r = button.current!.getBoundingClientRect();
    setShift({
      x: document.documentElement.clientWidth / 2 - (r.left + r.width / 2),
      y: window.innerHeight / 2 - (r.top + r.height / 2),
    });
  };

  const show = () => {
    document.body.style.overflow = "hidden";
    center();
    setOpen(true);
  };

  useEffect(() => {
    if (!open) return;
    window.addEventListener("resize", center);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("resize", center);
    };
  }, [open]);

  const unfold = () => {
    const ty = Math.round(rot.y / 360) * 360;
    if (Math.abs(rot.y - ty) > 1 || Math.abs(rot.x) > 1) {
      setRot({ x: 0, y: ty });
    }
    show();
  };

  const onPointerDown = (e: PointerEvent<HTMLButtonElement>) => {
    if (open) return;
    drag.current = { x: e.clientX, y: e.clientY, rx: rot.x, ry: rot.y, moved: false };
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragging(true);
  };
  const onPointerMove = (e: PointerEvent<HTMLButtonElement>) => {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    if (Math.abs(dx) > DRAG_THRESHOLD || Math.abs(dy) > DRAG_THRESHOLD) d.moved = true;
    if (!d.moved) return;
    setRot(
      full
        ? { y: d.ry + dx * TURN_SPEED, x: clamp(d.rx - dy * PITCH_SPEED, MAX_PITCH) }
        : {
            y: clamp(d.ry + dx * TILT_SPEED, MAX_TILT),
            x: clamp(d.rx - dy * TILT_SPEED, MAX_TILT),
          },
    );
  };
  const onPointerUp = () => {
    const d = drag.current;
    drag.current = null;
    setDragging(false);
    if (!d?.moved) return;
    suppressClick.current = true;
    setRot((r) => ({ x: 0, y: full ? Math.round(r.y / QUARTER_TURN) * QUARTER_TURN : 0 }));
  };
  const onClick = () => {
    if (suppressClick.current) {
      suppressClick.current = false;
      return;
    }
    if (!full) return;
    if (open) setOpen(false);
    else unfold();
  };
  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (!full || open) return;
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      e.preventDefault();
      setRot((r) => ({ x: 0, y: r.y + (e.key === "ArrowRight" ? QUARTER_TURN : -QUARTER_TURN) }));
    }
  };

  const yaw = (rot.y * Math.PI) / 180;
  const shadowWidth = Math.abs(Math.cos(yaw)) + SPINE_RATIO * Math.abs(Math.sin(yaw));

  const plain: CSSProperties | undefined = full
    ? undefined
    : { background: `var(--cover-${coverPaletteIndex(isbn)}-bg)` };

  const group: CSSProperties = {
    transform: `translate(${open ? `calc(${shift.x}px + var(--w) * 0.48), ${shift.y}px` : "0px, 0px"}) scale(${open ? 0.8 : 1}) rotateX(${rot.x}deg) rotateY(${rot.y}deg)`,
  };
  const hinge = (openDelay: number, closeDelay: number): CSSProperties => ({
    transform: `rotateY(${open ? 0 : -90}deg)`,
    transitionDelay: `${open ? openDelay : closeDelay}ms`,
  });

  return (
    <div className="flex flex-col items-center gap-3.5 [--w:210px] md:[--w:280px] lg:[--w:300px]">
      <div
        className="lb-book3d-scrim"
        data-open={open}
        onClick={() => setOpen(false)}
        aria-hidden
      />
      <button
        ref={button}
        type="button"
        className="lb-book3d"
        style={{ "--shadow-width": shadowWidth } as CSSProperties}
        data-mode={full ? "full" : "tilt"}
        data-dragging={dragging}
        data-open={open}
        aria-label={
          full
            ? open
              ? `Fold the cover of ${title}`
              : `Cover of ${title}. Drag or use arrow keys to turn, Enter to unfold.`
            : `Cover of ${title}`
        }
        aria-expanded={full ? open : undefined}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onClick={onClick}
        onDragStart={(e) => e.preventDefault()}
        onKeyDown={onKeyDown}
      >
        <div className="lb-book3d__group" style={group}>
          <div className="lb-book3d__face lb-book3d__front">
            <Cover
              isbn={isbn}
              title={title}
              authors={authors}
              src={getGetImageUrl(isbn, { side: "front" })}
              className="w-full"
              priority
            />
          </div>
          <div className="lb-book3d__pages-r" />
          <div className="lb-book3d__pages-t" />
          <div className="lb-book3d__pages-b" />
          <div className="lb-book3d__hinge" style={hinge(0, SPINE_CLOSE_DELAY)}>
            <div className="lb-book3d__face" style={plain}>
              {full && (
                <img
                  src={getGetImageUrl(isbn, { side: "spine" })}
                  alt=""
                  draggable={false}
                  onLoad={() => setLoaded((l) => ({ ...l, spine: true }))}
                  onError={() => setFailed((f) => ({ ...f, spine: true }))}
                />
              )}
            </div>
            <div
              className="lb-book3d__hinge lb-book3d__hinge--back"
              style={hinge(BACK_OPEN_DELAY, 0)}
            >
              <div className="lb-book3d__face lb-book3d__back" style={plain}>
                {full && (
                  <img
                    src={getGetImageUrl(isbn, { side: "back" })}
                    alt=""
                    draggable={false}
                    onLoad={() => setLoaded((l) => ({ ...l, back: true }))}
                    onError={() => setFailed((f) => ({ ...f, back: true }))}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </button>
      {full && loaded.spine && loaded.back && (
        <p className={clsx("lb-field__hint m-0", open && "invisible")} aria-hidden>
          Drag to turn · <span className="pointer-fine:hidden">tap</span>
          <span className="pointer-coarse:hidden">click</span> to open
        </p>
      )}
    </div>
  );
};
