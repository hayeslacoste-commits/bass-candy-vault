import { createServerFn } from "@tanstack/react-start";
import { randomUUID } from "node:crypto";

export const unlockAdmin = createServerFn({ method: "POST" })
  .inputValidator((data: { password: string }) => data)
  .handler(async ({ data }) => {
    const { passwordMatches, getGateSession } = await import("./admin-gate.server");
    const expected = process.env.SITE_PASSWORD;
    if (!expected) throw new Error("SITE_PASSWORD not set");
    if (!passwordMatches(data.password, expected)) return { ok: false as const };
    const session = await getGateSession();
    await session.update({ unlocked: true });
    return { ok: true as const };
  });

export const lockAdmin = createServerFn({ method: "POST" }).handler(async () => {
  const { getGateSession } = await import("./admin-gate.server");
  const session = await getGateSession();
  await session.clear();
  return { ok: true as const };
});

export const isUnlocked = createServerFn({ method: "GET" }).handler(async () => {
  const { getGateSession } = await import("./admin-gate.server");
  const session = await getGateSession();
  return { unlocked: !!session.data.unlocked };
});

export type Bait = {
  id: string;
  name: string;
  description: string | null;
  stock: number;
  price_cents: number;
  image_url: string;
  created_at: string;
};

export const listBaits = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("baits")
    .select("id, name, description, stock, image_url, created_at")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  const rows = data ?? [];
  const results: Bait[] = [];
  for (const row of rows) {
    const { data: signed } = await supabaseAdmin.storage
      .from("bait-images")
      .createSignedUrl(row.image_url, 60 * 60 * 24 * 7);
    results.push({ ...row, image_url: signed?.signedUrl ?? "" });
  }
  return results;
});

export const addBait = createServerFn({ method: "POST" })
  .inputValidator(
    (data: {
      name: string;
      description: string;
      stock: number;
      imageBase64: string;
      imageType: string;
    }) => data,
  )
  .handler(async ({ data }) => {
    const { requireUnlocked } = await import("./admin-gate.server");
    await requireUnlocked();
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const ext = (data.imageType.split("/")[1] || "jpg").replace(/[^a-z0-9]/gi, "");
    const path = `${randomUUID()}.${ext}`;
    const bytes = Buffer.from(data.imageBase64, "base64");
    const { error: upErr } = await supabaseAdmin.storage
      .from("bait-images")
      .upload(path, bytes, { contentType: data.imageType, upsert: false });
    if (upErr) throw new Error(upErr.message);
    const { error: insErr } = await supabaseAdmin.from("baits").insert({
      name: data.name,
      description: data.description || null,
      stock: data.stock,
      image_url: path,
    });
    if (insErr) throw new Error(insErr.message);
    return { ok: true as const };
  });

export const deleteBait = createServerFn({ method: "POST" })
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    const { requireUnlocked } = await import("./admin-gate.server");
    await requireUnlocked();
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row } = await supabaseAdmin
      .from("baits")
      .select("image_url")
      .eq("id", data.id)
      .maybeSingle();
    if (row?.image_url) {
      await supabaseAdmin.storage.from("bait-images").remove([row.image_url]);
    }
    const { error } = await supabaseAdmin.from("baits").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const updateStock = createServerFn({ method: "POST" })
  .inputValidator((data: { id: string; stock: number }) => data)
  .handler(async ({ data }) => {
    const { requireUnlocked } = await import("./admin-gate.server");
    await requireUnlocked();
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("baits")
      .update({ stock: data.stock })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });
