import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MagnifyingGlassIcon } from "@phosphor-icons/react/dist/ssr";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 flex flex-col items-center justify-center p-6 bg-slate-50 text-center">
        <div className="max-w-3xl space-y-6">
          <div className="flex justify-center mb-4 text-primary">
            <MagnifyingGlassIcon size={64} weight="duotone" />
          </div>
          <h1 className="text-5xl font-extrabold tracking-tight text-slate-900 sm:text-6xl">
            Lost something? <br />
            <span className="text-primary">Find it here.</span>
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            The community-driven platform to report lost items and return found ones.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <Button asChild size="lg" className="rounded-full">
              <Link href="/register">Get Started</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-full bg-white">
              <Link href="/login">Sign In</Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
