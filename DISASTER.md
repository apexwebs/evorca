# DISASTER

## Summary
This document captures the recent attempted fixes, what was modified, and why the changes were not successfully applied in the running app. The goal is to preserve the investigation context and enable a clean recovery after deployment.

## What we were trying to fix
1. Organizer registration flow
   - Move registration from client-side auth signup to Supabase service-role user creation.
   - Create a corresponding `profiles` row for new authenticated users.
   - Avoid email verification and make registration deterministic.

2. Account deletion behavior
   - Add a separate `Delete Account` endpoint and UI flow.
   - Ensure logout (`Terminate Session`) is distinct from full account deletion.
   - Use Supabase `auth.admin.deleteUser()` so auth user deletion cascades to `profiles`.

3. Tools UI
   - Add separate buttons in the account tab for session termination and account deletion.
   - Show a message when authenticated and prevent the account delete UI from appearing when logged out.

4. Schema / delete cascade documentation
   - Clarify that `auth.users` is separate from custom tables.
   - Document that deleting a profile row does not delete the auth user.
   - Emphasize deleting via auth admin delete user or Supabase Auth UI only.

## Files touched
- `src/app/api/auth/register/route.ts`
- `src/app/api/auth/delete/route.ts`
- `src/app/(app)/tools/page.tsx`
- `supabase/schema.sql`
- `next.config.ts`

## What was changed in code
- `register/route.ts` was modified to use `createServiceRoleClient()` and `supabase.auth.admin.createUser()`.
- The registration endpoint now attempts to insert a `profiles` row after creating the auth user.
- `delete/route.ts` was added to delete the current authenticated user using service-role admin delete.
- `tools/page.tsx` was modified to add `Delete Account` button and related state/handlers.
- `schema.sql` contained notes explaining the Supabase auth/profile relationship and cascade behavior.
- `next.config.ts` was updated to explicitly set the Turbopack root.

## What really went wrong
### 1. Wrong Next.js workspace root
- Next.js was inferring the workspace root incorrectly because there is a parent `package-lock.json` in `C:\Users\user`.
- The app build began resolving dependencies from the wrong folder: `C:\Users\user\OneDrive\Desktop\WebBee`.
- This caused module resolution failures such as `Cannot resolve 'tailwindcss'` even though the package exists in the project.
- The dev server warnings and repeated build failures were symptoms of this root inference issue.

### 2. Changes were in the code, but not reliably visible
- The files in the repository do contain the intended changes, but the running app did not reflect them consistently.
- This was partly due to dev server caching, port conflicts, and the incorrect root config.
- After restarting the server, the app still may have been serving stale or wrong build data.

### 3. Auth flow issues were still unresolved
- The registration endpoint returned `email_exists` because the email still existed in Supabase auth.
- This means the account was not fully deleted from the auth backend, or a duplicate attempt was made.
- The delete endpoint was only usable when authenticated, so it could not help if the session or auth state was already broken.

### 4. UI behavior depends on auth state
- The account page shows the Delete Account button only when a valid `user` exists.
- If you are logged out, the page correctly shows only session-related controls and login prompts.
- The fact that you only saw the Terminate Session button means the page was rendering for a logged-out or partially authenticated session.

## Current state
- The repository contains the attempted changes, but the app is not confirmed to be running them successfully.
- The dev server was failing because of a dependency/root resolution issue, not because the new code was absent.
- The registration flow still fails for existing emails.
- The account delete feature exists in code, but its live behavior is unverified.

## Important caution
- There is no deployment yet, and no production update has been made.
- Do not assume the current running app reflects the repository changes until the root inference and build issues are fixed.
- The key risk is that `next dev` was serving from the wrong root and using wrong dependency resolution.

## Suggested commit message
- `fix: add account deletion flow and service-role registration; document auth/profile cascade and fix root inference`

## Notes for recovery after deploy
1. Confirm the app is served from `C:\Users\user\OneDrive\Desktop\WebBee\Evorca`.
2. Ensure `next.config.ts` has a correct `turbopack.root` or run Next from the exact project folder.
3. Verify `npm install` completes in `Evorca` and `node_modules` exists there.
4. Test the auth delete endpoint only after a successful login.
5. If preserving data, manually remove the affected Supabase auth user from the dashboard before re-testing registration.

---

This document is intended as a recovery reference, not a fix log. Do not apply further code changes until the environment and deployment basics are verified.


## RESOLVER: Resolved & Cleaned

- **Lint & Types:** Strict TS/ESLint audit completed. Next.js 15 Async Params migration issue fixed. All stray 'lucide-react' imports pruned.
- **Bug Fix:** Fixed the Guest Pass extraction bug where a registration success wasn't persisting the ticket in the URL after a UI reload.
- **Data Integrity:** Supabase schema confirmed.
- **DEPLOYMENT READY:** The codebase has explicitly cleared `npm run lint` and `npx tsc` cleanly. Ready for Vercel push.
