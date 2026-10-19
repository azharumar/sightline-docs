#!/usr/bin/env bash
# Creates or updates the Sightline labels on a repository. Usage: setup-labels.sh owner/repo
set -euo pipefail
repo="${1:?usage: setup-labels.sh owner/repo}"
label() { gh label create "$1" --repo "$repo" --color "$2" --description "$3" --force >/dev/null; echo "label $1"; }
label "type:epic" "5319e7" "Epic from the build plan; holds sub-issues"
label "type:task" "1d76db" "About one hour of work, one pull request"
label "type:spike" "0e8a16" "Time-boxed experiment"
label "type:question" "d93f0b" "Needs a decision from Azhar; has a default"
label "type:bug" "b60205" "Defect found after merge"
label "status:ready" "0e8a16" "Ready for an agent"
label "status:in-progress" "fbca04" "An agent is working on it"
label "status:in-review" "c5def5" "Pull request open"
label "status:blocked" "b60205" "Blocked; see the latest comment"
label "needs-human" "d93f0b" "For Azhar; does not block the loop"
label "gate" "000000" "Review gate from the build plan"
label "security" "b60205" "Independent agent review before merge"
for a in backend frontend infra docs tests; do label "area:$a" "bfdadc" "Area: $a"; done
label "size:s" "ededed" "About 30 minutes"
label "size:m" "ededed" "About one hour"
for e in $(seq 0 13); do label "epic:E$e" "f9d0c4" "Epic E$e"; done
