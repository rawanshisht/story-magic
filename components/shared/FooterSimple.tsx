export function FooterSimple() {
  return (
    <footer className="absolute bottom-8 left-0 right-0 text-center pb-4">
      <p className="text-sm text-muted-foreground">
        &copy; {new Date().getFullYear()} Story Magic. All rights reserved.
      </p>
    </footer>
  );
}
