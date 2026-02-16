/**
 * Triggers on-demand revalidation of the live frontend after CMS content updates.
 * Calls the admin's API route (which keeps the secret server-side).
 */
export async function revalidateFrontend(): Promise<boolean> {
  try {
    const res = await fetch('/api/revalidate-frontend', { method: 'POST' });
    return res.ok;
  } catch {
    return false;
  }
}
