import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { listBaits } from "@/lib/admin.functions";
import catch1 from "@/assets/82748A28-9213-4E9D-B4A7-3AE825EF66E2.jpg.asset.json";
import catch2 from "@/assets/F547A16B-B798-466E-A5B4-DB3098B4C5A5.jpg.asset.json";
import catch3 from "@/assets/45585ECA-8E37-4D8F-B791-D08308CED42D.jpg.asset.json";
import catch4 from "@/assets/AF3A7214-FAB4-4369-9106-0EE15DBC3317.jpg.asset.json";

export const Route = createFileRoute("/")({
  component: Home,
});

const galleryImages = [
  { src: catch1.url, caption: "Pondside pig — bagged on a Chuck's original." },
  { src: catch4.url, caption: "Dad's afternoon slab." },
  { src: catch3.url, caption: "Brothers, one rod, one fat bass." },
  { src: catch2.url, caption: "First cast, first fish. That's the candy." },
];

function Home() {
  const fetchBaits = useServerFn(listBaits);
  const { data: baits, isLoading } = useQuery({
    queryKey: ["baits"],
    queryFn: () => fetchBaits(),
  });

  return (
    <div className="min-h-screen bg-background">
      {/* NAV */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2">
            <span className="font-display text-2xl leading-none text-primary">Chuck's</span>
            <span className="font-display text-2xl leading-none text-accent">Bass Candy</span>
          </Link>
          <nav className="flex items-center gap-4 text-sm font-medium">
            <a href="#baits" className="hover:text-primary">Baits</a>
            <a href="#gallery" className="hidden sm:inline hover:text-primary">Wall of Fame</a>
            <a href="#contact" className="rounded-md bg-primary px-3 py-1.5 text-primary-foreground hover:bg-primary/90">
              Contact
            </a>
          </nav>
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-40"
          style={{ backgroundImage: `url(${catch1.url})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/70 to-background" />
        <div className="relative mx-auto max-w-6xl px-4 py-24 sm:py-32">
          <p className="text-sm uppercase tracking-[0.3em] text-accent">Small-batch bass bait</p>
          <h1 className="mt-3 font-display text-5xl leading-[0.95] sm:text-7xl">
            Bait so good<br />the bass call it candy.
          </h1>
          <p className="mt-6 max-w-xl text-base text-muted-foreground sm:text-lg">
            Hand-tied, pond-tested, and stocked in short runs. Every lure in the shop was designed
            to get bit — no filler, no fluff, no shelf-warmers.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#baits" className="rounded-md bg-primary px-5 py-3 font-medium text-primary-foreground hover:bg-primary/90">
              Shop the drop
            </a>
            <a href="#contact" className="rounded-md border border-border bg-card px-5 py-3 font-medium hover:bg-accent hover:text-accent-foreground">
              Contact Chuck
            </a>
          </div>
        </div>
      </section>

      {/* BAITS */}
      <section id="baits" className="mx-auto max-w-6xl px-4 py-16">
        <div className="flex items-end justify-between border-b border-border pb-4">
          <div>
            <h2 className="font-display text-4xl text-primary">The Tackle Box</h2>
            <p className="mt-1 text-sm text-muted-foreground">Everything currently in stock at Chuck's.</p>
          </div>
        </div>

        {isLoading && <p className="mt-10 text-muted-foreground">Loading the box…</p>}

        {!isLoading && (!baits || baits.length === 0) && (
          <div className="mt-10 rounded-lg border-2 border-dashed border-border bg-card p-12 text-center">
            <p className="font-display text-2xl text-primary">Fresh drop coming soon.</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Chuck is at the bench right now. Check back — or hit the contact button to get on the list.
            </p>
          </div>
        )}

        {baits && baits.length > 0 && (
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {baits.map((b) => (
              <article key={b.id} className="group overflow-hidden rounded-lg border border-border bg-card shadow-sm transition hover:shadow-md">
                <div className="aspect-square overflow-hidden bg-muted">
                  <img
                    src={b.image_url}
                    alt={b.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-display text-2xl leading-tight text-primary">{b.name}</h3>
                    <span
                      className={`shrink-0 rounded-full px-2 py-1 text-xs font-semibold ${
                        b.stock > 0
                          ? "bg-primary/10 text-primary"
                          : "bg-destructive/10 text-destructive"
                      }`}
                    >
                      {b.stock > 0 ? `${b.stock} in stock` : "Sold out"}
                    </span>
                  </div>
                  {b.description && (
                    <p className="mt-2 text-sm text-muted-foreground">{b.description}</p>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* GALLERY */}
      <section id="gallery" className="bg-secondary/60 py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="font-display text-4xl text-primary">Wall of Fame</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Real anglers. Real bass. Real Chuck's Bass Candy.
          </p>
          <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
            {galleryImages.map((img) => (
              <figure key={img.src} className="overflow-hidden rounded-lg border border-border bg-card">
                <img src={img.src} alt={img.caption} className="aspect-[3/4] w-full object-cover" loading="lazy" />
                <figcaption className="p-2 text-xs text-muted-foreground">{img.caption}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="mx-auto max-w-3xl px-4 py-20 text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-accent">Get in touch</p>
        <h2 className="mt-3 font-display text-5xl text-primary">Talk to Chuck</h2>
        <p className="mt-4 text-muted-foreground">
          Custom orders, restock questions, pond stories — send it over. Chuck reads everything.
        </p>
        <a
          href="mailto:chuck@bass-candy.com"
          className="mt-8 inline-flex items-center justify-center rounded-md bg-accent px-8 py-4 font-display text-2xl text-accent-foreground hover:brightness-110"
        >
          Contact Me
        </a>
      </section>

      <footer className="border-t border-border py-8 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Chuck's Bass Candy ·{" "}
        <Link to="/admin" className="hover:text-primary">Owner login</Link>
      </footer>
    </div>
  );
}
