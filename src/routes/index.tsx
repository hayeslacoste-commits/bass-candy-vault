import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { listBaits, type Bait } from "@/lib/admin.functions";
import heroBass from "@/assets/hero-bass.jpg.asset.json";
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

const CART_KEY = "chuck-cart-v1";
type Cart = Record<string, number>;

function readCart(): Cart {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(localStorage.getItem(CART_KEY) || "{}"); } catch { return {}; }
}
function writeCart(c: Cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(c));
  window.dispatchEvent(new Event("cart:update"));
}
const money = (cents: number) => `$${(cents / 100).toFixed(2)}`;

function Home() {
  const fetchBaits = useServerFn(listBaits);
  const { data: baits, isLoading } = useQuery({
    queryKey: ["baits"],
    queryFn: () => fetchBaits(),
  });

  const [cart, setCart] = useState<Cart>({});
  const [cartOpen, setCartOpen] = useState(false);

  useEffect(() => {
    setCart(readCart());
    const sync = () => setCart(readCart());
    window.addEventListener("cart:update", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("cart:update", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const cartCount = useMemo(() => Object.values(cart).reduce((a, b) => a + b, 0), [cart]);

  function addToCart(b: Bait) {
    const next = { ...readCart() };
    const current = next[b.id] || 0;
    if (current + 1 > b.stock) return;
    next[b.id] = current + 1;
    writeCart(next);
    setCartOpen(true);
  }
  function setQty(id: string, qty: number, max: number) {
    const next = { ...readCart() };
    const q = Math.max(0, Math.min(qty, max));
    if (q === 0) delete next[id]; else next[id] = q;
    writeCart(next);
  }

  return (
    <div className="min-h-screen bg-background">
      {/* NAV */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2">
            <span className="font-display text-2xl leading-none text-primary">Chuck's</span>
            <span className="font-display text-2xl leading-none text-accent">Bass Candy</span>
          </Link>
          <nav className="flex items-center gap-3 text-sm font-medium sm:gap-4">
            <a href="#baits" className="hover:text-primary">Baits</a>
            <a href="#gallery" className="hidden sm:inline hover:text-primary">Wall of Fame</a>
            <Link
              to="/admin"
              className="rounded-md border border-border bg-card px-3 py-1.5 hover:bg-accent hover:text-accent-foreground"
            >
              Owner sign in
            </Link>
            <button
              onClick={() => setCartOpen(true)}
              className="relative rounded-md bg-primary px-3 py-1.5 text-primary-foreground hover:bg-primary/90"
            >
              Cart
              {cartCount > 0 && (
                <span className="ml-1 rounded-full bg-accent px-1.5 py-0.5 text-xs text-accent-foreground">
                  {cartCount}
                </span>
              )}
            </button>
          </nav>
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-40"
          style={{ backgroundImage: `url(${heroBass.url})` }}
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
            {baits.map((b) => {
              const inCart = cart[b.id] || 0;
              const soldOut = b.stock <= 0;
              const maxed = inCart >= b.stock;
              return (
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
                          b.stock > 0 ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"
                        }`}
                      >
                        {b.stock > 0 ? `${b.stock} in stock` : "Sold out"}
                      </span>
                    </div>
                    {b.description && (
                      <p className="mt-2 text-sm text-muted-foreground">{b.description}</p>
                    )}
                    <div className="mt-3 flex items-center justify-between gap-3">
                      <span className="font-display text-2xl text-accent">{money(b.price_cents)}</span>
                      <button
                        onClick={() => addToCart(b)}
                        disabled={soldOut || maxed}
                        className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                      >
                        {soldOut ? "Sold out" : maxed ? "Max in cart" : "Add to cart"}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
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
        <button
          onClick={() => {
            const url = `https://mail.google.com/mail/?view=cm&fs=1&to=Charlieklutts2@gmail.com&su=${encodeURIComponent("Bass Candy inquiry")}`;
            window.open(url, "_blank", "noopener,noreferrer");
          }}
          className="mt-8 inline-flex items-center justify-center rounded-md bg-accent px-8 py-4 font-display text-2xl text-accent-foreground hover:brightness-110"
        >
          Contact Me
        </button>
      </section>

      <footer className="border-t border-border py-8 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Chuck's Bass Candy ·{" "}
        <Link to="/admin" className="hover:text-primary">Owner login</Link>
      </footer>

      {/* CART DRAWER */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/50" onClick={() => setCartOpen(false)} />
          <aside className="w-full max-w-md bg-background border-l border-border flex flex-col">
            <div className="flex items-center justify-between border-b border-border p-4">
              <h3 className="font-display text-2xl text-primary">Your Cart</h3>
              <button onClick={() => setCartOpen(false)} className="text-sm hover:text-primary">Close</button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {cartCount === 0 && (
                <p className="text-sm text-muted-foreground">Cart's empty. Go grab some candy.</p>
              )}
              {baits?.filter((b) => cart[b.id]).map((b) => {
                const qty = cart[b.id];
                return (
                  <div key={b.id} className="flex gap-3 rounded-md border border-border bg-card p-3">
                    <img src={b.image_url} alt={b.name} className="h-16 w-16 rounded-md object-cover" />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between gap-2">
                        <p className="font-display text-lg text-primary truncate">{b.name}</p>
                        <p className="text-sm text-accent">{money(b.price_cents * qty)}</p>
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <button onClick={() => setQty(b.id, qty - 1, b.stock)} className="rounded border border-border px-2">−</button>
                        <span className="text-sm w-6 text-center">{qty}</span>
                        <button onClick={() => setQty(b.id, qty + 1, b.stock)} disabled={qty >= b.stock} className="rounded border border-border px-2 disabled:opacity-40">+</button>
                        <button onClick={() => setQty(b.id, 0, b.stock)} className="ml-auto text-xs text-destructive hover:underline">Remove</button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            {cartCount > 0 && baits && (
              <div className="border-t border-border p-4 space-y-3">
                <div className="flex justify-between font-display text-xl">
                  <span>Total</span>
                  <span className="text-accent">
                    {money(baits.reduce((sum, b) => sum + (cart[b.id] || 0) * b.price_cents, 0))}
                  </span>
                </div>
                <button
                  onClick={() => {
                    const email = window.prompt("Enter your email so Chuck can confirm your order:");
                    if (!email) return;
                    const lines = baits.filter((b) => cart[b.id]).map((b) => `- ${b.name} × ${cart[b.id]} (${money(b.price_cents * cart[b.id])})`).join("\n");
                    const total = money(baits.reduce((s, b) => s + (cart[b.id] || 0) * b.price_cents, 0));
                    const url = `https://mail.google.com/mail/?view=cm&fs=1&to=Charlieklutts2@gmail.com&su=${encodeURIComponent("Bass Candy order")}&body=${encodeURIComponent(`From: ${email}\n\nHey Chuck, I'd like to order:\n\n${lines}\n\nTotal: ${total}\n`)}`;
                    window.open(url, "_blank", "noopener,noreferrer");
                  }}
                  className="block w-full rounded-md bg-primary py-3 text-center font-medium text-primary-foreground hover:bg-primary/90"
                >
                  Checkout via email
                </button>
                <button
                  onClick={() => writeCart({})}
                  className="w-full text-xs text-muted-foreground hover:text-destructive"
                >
                  Clear cart
                </button>
              </div>
            )}
          </aside>
        </div>
      )}
    </div>
  );
}
