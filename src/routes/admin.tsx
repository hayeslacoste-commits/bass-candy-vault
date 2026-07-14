import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  unlockAdmin,
  lockAdmin,
  isUnlocked,
  listBaits,
  addBait,
  deleteBait,
  updateStock,
} from "@/lib/admin.functions";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Owner · Chuck's Bass Candy" }] }),
  component: Admin,
});

function fileToBase64(file: File): Promise<{ base64: string; type: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(",")[1] ?? "";
      resolve({ base64, type: file.type || "image/jpeg" });
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function Admin() {
  const checkUnlocked = useServerFn(isUnlocked);
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["admin-status"],
    queryFn: () => checkUnlocked(),
  });

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">…</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto max-w-4xl px-4 py-4 flex items-center justify-between">
          <Link to="/" className="font-display text-xl text-primary">← Chuck's Bass Candy</Link>
          <span className="text-xs uppercase tracking-widest text-muted-foreground">Owner</span>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-4 py-10">
        {data?.unlocked ? <Dashboard onLocked={() => refetch()} /> : <LoginForm onUnlocked={() => refetch()} />}
      </main>
    </div>
  );
}

function LoginForm({ onUnlocked }: { onUnlocked: () => void }) {
  const unlock = useServerFn(unlockAdmin);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    try {
      const { ok } = await unlock({ data: { password } });
      if (ok) onUnlocked();
      else setError("Wrong code.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mx-auto max-w-sm rounded-lg border border-border bg-card p-8 shadow-sm">
      <h1 className="font-display text-3xl text-primary">Owner login</h1>
      <p className="mt-1 text-sm text-muted-foreground">Enter the code Chuck gave you.</p>
      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <input
          type="password"
          autoFocus
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Access code"
          className="w-full rounded-md border border-input bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring"
        />
        {error && <p className="text-sm text-destructive">{error}</p>}
        <button
          type="submit"
          disabled={pending || !password}
          className="w-full rounded-md bg-primary py-2.5 font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {pending ? "Checking…" : "Unlock"}
        </button>
      </form>
    </div>
  );
}

function Dashboard({ onLocked }: { onLocked: () => void }) {
  const qc = useQueryClient();
  const fetchBaits = useServerFn(listBaits);
  const lockFn = useServerFn(lockAdmin);
  const addFn = useServerFn(addBait);
  const delFn = useServerFn(deleteBait);
  const stockFn = useServerFn(updateStock);

  const { data: baits } = useQuery({
    queryKey: ["baits"],
    queryFn: () => fetchBaits(),
  });

  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [stock, setStock] = useState(1);
  const [file, setFile] = useState<File | null>(null);
  const [pending, setPending] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function onAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!file) { setMsg("Add a photo."); return; }
    setPending(true);
    setMsg(null);
    try {
      const { base64, type } = await fileToBase64(file);
      await addFn({ data: { name, description: desc, stock, imageBase64: base64, imageType: type } });
      setName(""); setDesc(""); setStock(1); setFile(null);
      (document.getElementById("bait-file") as HTMLInputElement | null)?.value && ((document.getElementById("bait-file") as HTMLInputElement).value = "");
      await qc.invalidateQueries({ queryKey: ["baits"] });
      setMsg("Added.");
    } catch (err) {
      setMsg((err as Error).message);
    } finally {
      setPending(false);
    }
  }

  async function onDelete(id: string) {
    if (!confirm("Delete this bait?")) return;
    await delFn({ data: { id } });
    await qc.invalidateQueries({ queryKey: ["baits"] });
  }

  async function onStockChange(id: string, s: number) {
    await stockFn({ data: { id, stock: s } });
    await qc.invalidateQueries({ queryKey: ["baits"] });
  }

  async function onLock() {
    await lockFn();
    onLocked();
  }

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-4xl text-primary">The Bench</h1>
          <p className="text-sm text-muted-foreground">Add baits, set stock, keep the box current.</p>
        </div>
        <button onClick={onLock} className="text-sm underline underline-offset-4 hover:text-primary">
          Log out
        </button>
      </div>

      <section className="rounded-lg border border-border bg-card p-6">
        <h2 className="font-display text-2xl text-primary">Add a bait</h2>
        <form onSubmit={onAdd} className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block text-sm">
            Name
            <input required value={name} onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2" />
          </label>
          <label className="block text-sm">
            Stock
            <input required type="number" min={0} value={stock}
              onChange={(e) => setStock(parseInt(e.target.value || "0", 10))}
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2" />
          </label>
          <label className="block text-sm sm:col-span-2">
            Description (optional)
            <textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={2}
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2" />
          </label>
          <label className="block text-sm sm:col-span-2">
            Photo
            <input id="bait-file" required type="file" accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="mt-1 w-full text-sm" />
          </label>
          <div className="sm:col-span-2 flex items-center gap-3">
            <button type="submit" disabled={pending}
              className="rounded-md bg-primary px-5 py-2.5 font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
              {pending ? "Uploading…" : "Add to shop"}
            </button>
            {msg && <span className="text-sm text-muted-foreground">{msg}</span>}
          </div>
        </form>
      </section>

      <section>
        <h2 className="font-display text-2xl text-primary">Current stock</h2>
        {(!baits || baits.length === 0) && (
          <p className="mt-4 text-sm text-muted-foreground">No baits yet. Add your first one above.</p>
        )}
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {baits?.map((b) => (
            <div key={b.id} className="flex gap-4 rounded-lg border border-border bg-card p-4">
              <img src={b.image_url} alt={b.name} className="h-24 w-24 rounded-md object-cover" />
              <div className="flex-1 min-w-0">
                <h3 className="font-display text-xl text-primary truncate">{b.name}</h3>
                {b.description && <p className="text-xs text-muted-foreground line-clamp-2">{b.description}</p>}
                <div className="mt-2 flex items-center gap-2">
                  <label className="text-xs text-muted-foreground">Stock</label>
                  <input type="number" min={0} defaultValue={b.stock}
                    onBlur={(e) => {
                      const v = parseInt(e.target.value || "0", 10);
                      if (v !== b.stock) onStockChange(b.id, v);
                    }}
                    className="w-20 rounded-md border border-input bg-background px-2 py-1 text-sm" />
                  <button onClick={() => onDelete(b.id)}
                    className="ml-auto text-xs text-destructive hover:underline">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
