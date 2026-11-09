/** Small looping scenes for the three "how it works" steps. Decorative. */

export function DropInPhotos() {
  return (
    <div className="step-scene" aria-hidden>
      {["01", "04", "06"].map((n, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img key={n} src={`/brand/ribbon/${n}.jpg`} alt="" className="drop-photo" style={{ left: `${14 + i * 24}%`, ["--r" as string]: `${[-8, 4, 10][i]}deg`, animationDelay: `${i * 0.35}s` }} />
      ))}
    </div>
  );
}

export function AutoLayout() {
  const boxes = [
    { label: "DAY 2", style: { left: "8%", top: "10%", width: "50%", height: "58%" }, delay: 0 },
    { label: "SUNSET", style: { left: "62%", top: "10%", width: "30%", height: "38%" }, delay: 0.5 },
    { label: "CAPTION", style: { left: "8%", top: "76%", width: "84%", height: "14%" }, delay: 1 },
  ];
  return (
    <div className="step-scene" aria-hidden>
      <div className="layout-page">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/ribbon/05.jpg" alt="" style={{ left: "8%", top: "10%", width: "50%", height: "58%" }} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/ribbon/02.jpg" alt="" style={{ left: "62%", top: "10%", width: "30%", height: "38%" }} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/ribbon/09.jpg" alt="" style={{ left: "62%", top: "52%", width: "30%", height: "16%" }} />
        <span className="layout-caption" />
        {boxes.map((b) => (
          <span key={b.label} className="layout-box" style={{ ...b.style, animationDelay: `${b.delay}s` }}>
            <em>{b.label}</em>
          </span>
        ))}
      </div>
    </div>
  );
}

export function ShipIt() {
  return (
    <div className="step-scene" aria-hidden>
      <div className="ship-book">
        <span className="ship-book-title" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/ribbon/03.jpg" alt="" />
      </div>
      <span className="ship-stamp">
        Shipped
        <br />
        to you
      </span>
    </div>
  );
}
