# Push this app to GitHub (one-time from your Mac/PC)

This Cloud Agent cannot push to `RigZip25/RigZipnew` (token scoped to AllByRent only).

## Option A — from your machine (fastest)

```bash
git clone https://github.com/RigZip25/RigZipnew.git
cd RigZipnew
# unzip agent artifact over this folder (keep .git), or:
# copy files from /home/ubuntu/RigZipnew excluding node_modules/dist/.git

git add -A
git commit -m "Initial RigZIP premium frontend shell"
git push origin main
```

## Option B — next Cloud Agent

Start a **new** Cloud Agent with repository **RigZip25/RigZipnew** selected.  
Paste: “Continue RigZIP premium frontend from scratch; previous agent had the shell at splash → path → gate → email OTP → explore.”

## Option C — environment

Add `github.com/RigZip25/RigZipnew` to the Cloud Agent environment, then re-run push from an agent bound to that env.
