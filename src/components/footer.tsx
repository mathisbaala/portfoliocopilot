export function Footer() {
  return (
    <footer className="border-t bg-white">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 text-sm text-slate-500">
        <p>© {new Date().getFullYear()} Portfolio Copilot. Tous droits réservés.</p>
      </div>
    </footer>
  );
}
