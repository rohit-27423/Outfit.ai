import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 text-zinc-100 overflow-hidden relative">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>

      <header className="px-4 lg:px-6 h-14 flex items-center z-10 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md">
        <Link className="flex items-center justify-center" href="#">
          <span className="font-bold text-xl tracking-tight">Outfit.ai</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link className="text-sm font-medium hover:text-zinc-300 flex items-center" href="/login">
            Login
          </Link>
          <Link href="/signup">
            <Button variant="outline" className="bg-white text-zinc-950 hover:bg-zinc-200">
              Get Started
            </Button>
          </Link>
        </nav>
      </header>
      
      <main className="flex-1 flex items-center justify-center z-10">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2 max-w-3xl">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-500">
                  Your AI Personal Stylist
                </h1>
                <p className="mx-auto max-w-[700px] text-zinc-400 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Digitize your wardrobe, get weather-aware outfit recommendations, and discover your unique style with Gemini AI.
                </p>
              </div>
              <div className="space-x-4 pt-8">
                <Link href="/signup">
                  <Button size="lg" className="bg-white text-zinc-950 hover:bg-zinc-200 shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                    Start Styling
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t border-zinc-800 z-10">
        <p className="text-xs text-zinc-500">© 2026 Outfit.ai. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link className="text-xs text-zinc-500 hover:text-zinc-300" href="#">
            Terms of Service
          </Link>
          <Link className="text-xs text-zinc-500 hover:text-zinc-300" href="#">
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  )
}
