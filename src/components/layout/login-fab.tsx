import { LogIn } from "lucide-react";
import Link from "next/link";

export function LoginFab() {
  return (
    <Link
      href="/login"
      aria-label="Member Login"
      className="fixed bottom-5 left-5 z-40 flex size-14 items-center justify-center rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white shadow-[0_10px_30px_rgba(0,0,0,0.25)] transition-all duration-300 hover:bg-primary hover:scale-105"
    >
      <LogIn className="size-6" />
    </Link>
  );
}
