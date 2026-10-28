// Pita teknologi yang bergeser pelan. Salinan kedua hanya untuk
// menyambung putaran, jadi disembunyikan dari pembaca layar.
export default function Marquee({
  items,
  label,
}: {
  items: string[];
  label: string;
}) {
  const row = (hidden: boolean) => (
    <ul
      className={hidden ? "marquee-copy marquee-copy-2" : "marquee-copy"}
      aria-hidden={hidden ? true : undefined}
    >
      {items.map((item) => (
        <li key={item} className="marquee-item">
          <span className="marquee-dot" aria-hidden="true" />
          {item}
        </li>
      ))}
    </ul>
  );

  return (
    <div className="marquee" role="group" aria-label={label}>
      <div className="marquee-track">
        {row(false)}
        {row(true)}
      </div>
    </div>
  );
}
