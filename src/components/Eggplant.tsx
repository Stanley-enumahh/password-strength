import { useEffect, useRef, useState } from "react";

/* ---------- SHAPE SETTINGS: tweak these ---------- */

const BULB_R = 38; // half-height of the fat end (bigger number = fatter bulb)
const NECK_H = 17; // half-height of the thin end near the stem
const BULB_LEN = 1; // how long the bulb is (1 = round, bigger = more oval)
const BEND = 50; // how far the stem end hooks upward (0 = perfectly straight)
const BEND_SHARPNESS = 2.6; // higher = straighter body with a tighter hook at the neck

/* ------------------------------------------------- */

const CENTER_Y = 72;

type EggplantProps = {
  length: number; // target body length in px
};

type Point = { x: number; h: number };

const f = (n: number) => n.toFixed(1);

// Spine height at position x. Flat at the bulb, hooking upward toward the stem.
const spineY = (x: number, L: number) => {
  const t = Math.max(0, 1 - x / L);
  return CENTER_Y - BEND * Math.pow(t, BEND_SHARPNESS);
};

// Slope of the spine at x
const spineSlope = (x: number, L: number) => {
  const t = Math.max(0, 1 - x / L);
  return (BEND * BEND_SHARPNESS * Math.pow(t, BEND_SHARPNESS - 1)) / L;
};

// Half-height of the body at position x
function halfHeight(x: number, L: number) {
  const bulbW = BULB_R * BULB_LEN;
  const bx = L - bulbW; // where the bulb starts
  if (x <= bx) {
    const t = Math.max(0, x / bx);
    const s = t * t * (3 - 2 * t); // smooth neck-to-bulb swell
    return NECK_H + (BULB_R - NECK_H) * s;
  }
  const u = Math.min(1, (x - bx) / bulbW);
  return BULB_R * Math.sqrt(1 - u * u);
}

// Sample points along the body: rounded stem end, neck, bulb
function samplePoints(L: number): Point[] {
  const bulbW = BULB_R * BULB_LEN;
  const bx = L - bulbW;
  const capW = NECK_H * 0.4;
  const pts: Point[] = [];

  for (let i = 0; i <= 6; i++) {
    const a = (i / 6) * (Math.PI / 2);
    pts.push({ x: -capW * Math.cos(a), h: NECK_H * Math.sin(a) });
  }
  pts.reverse();

  for (let i = 1; i <= 56; i++) {
    const x = (i / 56) * bx;
    pts.push({ x, h: halfHeight(x, L) });
  }

  for (let i = 1; i <= 24; i++) {
    const th = (i / 24) * (Math.PI / 2);
    pts.push({
      x: bx + bulbW * Math.sin(th),
      h: BULB_R * Math.cos(th),
    });
  }

  return pts;
}

// Offset a spine point sideways along its normal so the thickness stays
// even while the body curves
function edgePoint(p: Point, L: number, side: 1 | -1) {
  const slope = spineSlope(Math.max(0, p.x), L);
  const norm = Math.sqrt(1 + slope * slope);
  const nx = -slope / norm; // normal pointing down-left of the spine
  const ny = 1 / norm;
  const sx = p.x;
  const sy = spineY(Math.max(0, p.x), L);
  return {
    x: sx + nx * p.h * side,
    y: sy + ny * p.h * side,
  };
}

function outlinePath(L: number) {
  const pts = samplePoints(L);
  const top = pts.map((p) => {
    const e = edgePoint(p, L, -1);
    return `${f(e.x)} ${f(e.y)}`;
  });
  const bottom = pts
    .slice()
    .reverse()
    .map((p) => {
      const e = edgePoint(p, L, 1);
      return `${f(e.x)} ${f(e.y)}`;
    });
  return `M ${top.join(" L ")} L ${bottom.join(" L ")} Z`;
}

function shinePath(L: number) {
  const bulbW = BULB_R * BULB_LEN;
  const bx = L - bulbW;
  const x0 = bx * 0.3;
  const x1 = bx + bulbW * 0.45;
  const pts: string[] = [];
  for (let i = 0; i <= 30; i++) {
    const x = x0 + ((x1 - x0) * i) / 30;
    const e = edgePoint({ x, h: 0.58 * halfHeight(x, L) }, L, -1);
    pts.push(`${f(e.x)} ${f(e.y)}`);
  }
  return `M ${pts.join(" L ")}`;
}

// One pointed sepal (leaf) of the cap
function sepal(len: number, width: number) {
  return (
    `M 0 0 C ${f(len * 0.3)} ${f(-width)} ${f(len * 0.75)} ${f(-width * 0.85)} ${f(len)} 0 ` +
    `C ${f(len * 0.75)} ${f(width * 0.85)} ${f(len * 0.3)} ${f(width)} 0 0 Z`
  );
}

export default function Eggplant({ length }: EggplantProps) {
  const [current, setCurrent] = useState(length);
  const currentRef = useRef(length);

  // Ease toward the target length every frame: fast start, soft landing
  useEffect(() => {
    let frame = 0;

    const tick = () => {
      const diff = length - currentRef.current;
      if (Math.abs(diff) < 0.1) {
        currentRef.current = length;
        setCurrent(length);
        return;
      }
      currentRef.current += diff * 0.1;
      setCurrent(currentRef.current);
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [length]);

  const L = current;
  const capAngle = (Math.atan(spineSlope(0, L)) * 180) / Math.PI;
  const shadowY = CENTER_Y + BULB_R + 9;

  return (
    <svg
      width={L + 90}
      height={130}
      viewBox={`-60 0 ${L + 90} 130`}
      style={{ overflow: "visible", display: "block" }}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="pp-egg-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#a45cc4" />
          <stop offset="0.55" stopColor="#8240a3" />
          <stop offset="1" stopColor="#5e2c78" />
        </linearGradient>
        <linearGradient id="pp-egg-leaf" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#58c97a" />
          <stop offset="1" stopColor="#2c8f4e" />
        </linearGradient>
      </defs>

      {/* ground shadow */}
      <ellipse
        cx={L / 2}
        cy={shadowY}
        rx={L / 2 + 8}
        ry={5}
        fill="rgba(0, 0, 0, 0.12)"
      />

      {/* curved, stretching body */}
      <path
        d={outlinePath(L)}
        fill="url(#pp-egg-body)"
        stroke="#3b1851"
        strokeWidth={1}
        strokeLinejoin="round"
      />
      <path
        d={shinePath(L)}
        fill="none"
        stroke="rgba(255, 255, 255, 0.4)"
        strokeWidth={6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* fixed-size stem and sepals, tilted to follow the curve */}
      <g
        transform={`translate(0, ${f(spineY(0, L))}) rotate(${f(capAngle)})`}
        stroke="#1b5b31"
        strokeWidth={1}
        strokeLinejoin="round"
      >
        {/* stem */}
        <path
          d="M -4 -8 C -14 -8 -22 -11 -30 -21 L -21 -27 C -16 -20 -11 -16 -3 -15 Z"
          fill="#3aa65c"
        />
        <ellipse
          cx={-26}
          cy={-24}
          rx={5}
          ry={3.6}
          transform="rotate(-38 -26 -24)"
          fill="#cfe8a8"
        />

        {/* back sepals (behind) */}
        <g transform="translate(-2 -6) rotate(-48)">
          <path d={sepal(30, 8)} fill="#2c8f4e" />
        </g>
        <g transform="translate(-2 6) rotate(48)">
          <path d={sepal(30, 8)} fill="#2c8f4e" />
        </g>

        {/* dome the stem grows out of */}
        <ellipse cx={-1} cy={0} rx={9} ry={NECK_H + 4} fill="#2f9a53" />

        {/* front sepals */}
        <g transform="translate(-2 -3) rotate(-24)">
          <path d={sepal(38, 9)} fill="url(#pp-egg-leaf)" />
        </g>
        <g transform="translate(-2 3) rotate(24)">
          <path d={sepal(38, 9)} fill="url(#pp-egg-leaf)" />
        </g>
        <g transform="translate(-2 0) rotate(0)">
          <path d={sepal(44, 10)} fill="url(#pp-egg-leaf)" />
        </g>
      </g>
    </svg>
  );
}
