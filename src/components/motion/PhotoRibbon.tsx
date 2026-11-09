/** A "camera roll" of trip photos drifting along a gentle wave. Decorative. */
const PHOTOS = Array.from({ length: 11 }, (_, i) => `/brand/ribbon/${String(i + 1).padStart(2, "0")}.jpg`);
const LABELS = ["Day 1", "", "Day 2", "", "", "Day 3", "", "", "Day 4", "", ""];

export default function PhotoRibbon() {
  const cards = [...PHOTOS, ...PHOTOS]; // two copies for a seamless loop
  return (
    <div className="photo-ribbon" aria-hidden>
      <div className="photo-ribbon-track">
        {cards.map((src, i) => {
          const k = i % PHOTOS.length;
          const wave = Math.sin((i / PHOTOS.length) * Math.PI * 2);
          return (
            <figure key={i} className="photo-ribbon-card" style={{ transform: `translateY(${Math.round(wave * 18)}px) rotate(${(wave * 4).toFixed(1)}deg)` }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" width={160} height={120} loading="lazy" />
              <figcaption>{LABELS[k]}</figcaption>
            </figure>
          );
        })}
      </div>
    </div>
  );
}
