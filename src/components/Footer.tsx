import { Disclaimer } from "./Disclaimer";
import { Container } from "./Container";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-surface">
      <Container className="py-10 space-y-4">
        <div className="flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-lg brand-gradient text-white font-display font-bold text-sm">
            ৳
          </span>
          <span className="font-display font-semibold">BD Invest Hub</span>
        </div>
        <Disclaimer />
        <p className="text-xs text-muted">
          An independent comparison tool, not affiliated with any bank, Bangladesh Bank, or
          investment organization listed.
        </p>
        <p className="text-xs text-muted/80 pt-2 border-t border-border">
          &copy; {new Date().getFullYear()} BD Invest Hub. Built by Atiqul Islam Chowdhury.
        </p>
      </Container>
    </footer>
  );
}
