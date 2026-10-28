// Ikon Font Awesome (gaya solid) untuk CMS. Selalu dekoratif: teks di sebelahnya, atau aria-label
// pada tombol, yang dibaca pembaca layar. Stylesheet-nya hanya dimuat di layout admin.
export default function Icon({ name, className }: { name: string; className?: string }) {
  return <i className={className ? `fa-solid fa-${name} ${className}` : `fa-solid fa-${name}`} aria-hidden="true" />;
}
