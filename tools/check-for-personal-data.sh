#!/usr/bin/env bash
#
# Fails if anything personal has reached the repository.
#
# This is a public repository for an app other people use. What belongs in it is what somebody needs
# in order to understand Simple Pitch Counter, build it, and run it — and nothing whatsoever about
# the machine it happens to be developed on, or about the people who use it.
#
# The author's own name is allowed here on purpose: Simple Pitch Counter is published under it, and
# the docs, website and publisher credit say so. Contact addresses, machine paths, the server's
# layout and credentials are not.
#
# Run by CI on every push and pull request, because a rule nobody checks is a rule that holds until
# the first time somebody is in a hurry.
#
#     tools/check-for-personal-data.sh
#
set -uo pipefail

cd "$(dirname "$0")/.."

fail=0

report() {
  fail=1
  echo
  echo "FOUND: $1"
  echo "$2"
}

# Things that are allowed to look like a match: the repository's own URL, the support link, and the
# placeholder address in the beta sign-up form. All are public on purpose.
allowed='mrthames/simple-pitch-counter|you@gmail\.com|buymeacoffee\.com/thames_|check-for-personal-data|AppPublisher=|Users.(someone|you|user|player)'

find_in_tracked() {
  git grep -n -I -i -E "$1" -- . ':!tools/check-for-personal-data.sh' ':!LICENSE' 2>/dev/null \
    | grep -vE "$allowed" || true
}

# --- A contact address. (The author's name is allowed; see the top of this file.)
hits=$(find_in_tracked '@gmail\.com|@outlook\.com|@hotmail\.com')
[ -n "$hits" ] && report "a contact address" "$hits"

# --- Paths from somebody's own machine.
hits=$(find_in_tracked 'C:\\Users\\|/home/[a-z]|/Users/[a-z]')
[ -n "$hits" ] && report "a path from a developer's machine" "$hits"

# A whole dotted quad: "10.0.19041" is a Windows version, and matching it made this shout about
# every project file in the repository.
hits=$(find_in_tracked '\b192\.168\.[0-9]{1,3}\.[0-9]{1,3}\b|\b10\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\b|\b[A-Za-z0-9-]+\.local\b')
[ -n "$hits" ] && report "an address on a private network" "$hits"

# --- Anything that looks like a credential. Not exhaustive, and not meant to be: the point is to
# --- catch the obvious mistake before it is public, not to replace reading what you commit.
hits=$(find_in_tracked 'ghp_[A-Za-z0-9]{20}|github_pat_[A-Za-z0-9_]{20}|BEGIN (RSA |EC |OPENSSH |DSA )?PRIVATE KEY|xox[baprs]-|AKIA[0-9A-Z]{16}|AIza[0-9A-Za-z_-]{30}|script\.google\.com/macros/s/AKfy')
[ -n "$hits" ] && report "something shaped like a credential" "$hits"

# --- How the self-hosted server is laid out: its folders, SSH port, and DNS zone IDs.
hits=$(find_in_tracked '/volume[0-9]+/|\bport[ =:]+2222\b|-p 2222\b|hostedzone/[A-Z0-9]{10,}|\bZ0[0-9A-Z]{12,}\b')
[ -n "$hits" ] && report "a detail of the private server" "$hits"

# --- Key or deploy files that should never be tracked at all.
hits=$(git ls-files | grep -E '(^|/)(deploy\.env|\.env(\..*)?|id_(rsa|ed25519|ecdsa)[^/]*|known_hosts|[^/]+\.(pem|key|ppk|p12))$' || true)
[ -n "$hits" ] && report "a key or settings file" "$hits"

# --- Files that hold a player's own progress. These belong in %LOCALAPPDATA%, never here.
hits=$(git ls-files | grep -E '(^|/)(settings|tracking|progress|waypoints)\.json$|(^|/)plans/|\.log$' || true)
[ -n "$hits" ] && report "a file holding somebody's own progress" "$hits"

# --- Screenshots from the game, which carry coordinates in their names and a stash in their pixels.
hits=$(git ls-files | grep -E '[0-9]{4}-[0-9]{2}-[0-9]{2}\[[0-9]' || true)
[ -n "$hits" ] && report "a game screenshot" "$hits"

echo
if [ "$fail" -eq 0 ]; then
  echo "Nothing personal in the repository."
else
  echo "Personal data found. It does not belong in a public repository — take it out, and if it has"
  echo "already been pushed, say so rather than quietly removing it from the tip."
fi

exit "$fail"
