
-- Restrict bait-images bucket: deny all anon/authenticated access.
-- Only service_role (used server-side by the owner admin flow) can access, which bypasses RLS.
CREATE POLICY "bait-images no anon access"
ON storage.objects FOR SELECT TO anon, authenticated
USING (bucket_id <> 'bait-images' AND false);

CREATE POLICY "bait-images no anon insert"
ON storage.objects FOR INSERT TO anon, authenticated
WITH CHECK (bucket_id <> 'bait-images' AND false);

CREATE POLICY "bait-images no anon update"
ON storage.objects FOR UPDATE TO anon, authenticated
USING (bucket_id <> 'bait-images' AND false)
WITH CHECK (bucket_id <> 'bait-images' AND false);

CREATE POLICY "bait-images no anon delete"
ON storage.objects FOR DELETE TO anon, authenticated
USING (bucket_id <> 'bait-images' AND false);
