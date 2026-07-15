# Decisions — PurePastures G-1 (Data Entry Tool)

## Goals

### OBJ-1: Deliver a persisted, role-scoped GHG activity-data entry tool (G-1) for PurePastures Dairy Cooperative, supporting both manual and bulk-CSV data entry, ready for G-4's calculation engine.

- **Scope:** [compliance: GHG Protocol Corporate Standard, compliance: SBTi FLAG, client: PurePastures Dairy Cooperative, tool-dependency: G-4 calculation engine, tool-dependency: G-2 dashboard, deadline: TBD]
- **Status:** active

> **Open item:** deadline is not yet set — fill in before Claude Code's first build session, or confirm "no fixed deadline" explicitly so future decisions aren't evaluated against a blank constraint.

### G-3: Upgrade the PurePastures Data Entry Tool to D3 (Supabase) and add an EF database + calculation logic + emissions dashboard tool, sharing one schema.

- **Scope:** [no auth: A1 holds, curriculum: AI Lab, supersedes: OBJ-1's persisted/role-scoped (Tier 3) scope for the Data Entry Tool — note: the tool is currently Tier 1 (D2+A1) per product-spec.md v3.0/v4.0; no goal object was ever logged for that downgrade, so this supersession references OBJ-1 directly rather than an intermediate goal that doesn't exist in this registry]
- **Status:** active

---

## D-1: Add bulk CSV upload to G-1 Data Entry Tool

- **Date:** 2026-07-10
- **Goal:** OBJ-1
- **Spec section affected:** product-spec-g1.md Sections 6, 8, 9, 12, 13
- **Status:** adopted
- **Trigger:** Andrea requested the ability to bulk-upload raw activity data (e.g. fuel purchase exports) instead of manual typed entry only, to reduce transcription effort for high-volume raw data sources.
- **Options considered:**
  1. Manual entry only (original v1.0 scope) — simplest, but doesn't scale to bulk supplier exports.
  2. Bulk CSV upload generalized to all activity-data categories immediately — maximizes coverage but multiplies field-mapping complexity across five category shapes in the first build.
  3. Bulk CSV upload scoped to fuel/combustion + electricity only, auto-detect column mapping with user confirmation each upload, bad/out-of-scope rows routed to the existing Review Queue, duplicates warned not blocked — narrower, matches the only real sample data available (`purepasturesrawfuelextract.csv`), reuses existing `requires_review` infrastructure.
- **Chosen:** Option 3
- **Reasoning:** FLAG farm data and purchased goods have materially different field shapes and no sample data exists to validate a mapping design against (no OBJ-1 Scope constraint requires day-one coverage of them). Fuel/combustion and electricity are the categories with demonstrated real-world messiness (inconsistent date formats, blank data-quality ratings within a single file), so validating the import pipeline there first reduces risk without narrowing what the tool ultimately needs to do.
- **Limitation / what this doesn't solve:** FLAG farm data and purchased goods bulk upload remain manual-entry-only until a future iteration extends column-mapping logic to those shapes. Saved per-source mapping templates (deferred separately) mean every recurring supplier file still requires re-confirming its mapping each upload in v1.1.
- **Scope creep check:** in scope — explicitly requested and folded into OBJ-1's Scope via this spec version bump
- **Spec version bump:** yes → v1.1
- **Tags:** #g-1 #bulk-upload #csv-import #data-quality #flag-scope-carveout

---

## D-2: Bulk-upload row validation and failure handling

- **Date:** 2026-07-10
- **Goal:** OBJ-1
- **Spec section affected:** product-spec-g1.md Sections 6, 8, 13
- **Status:** adopted
- **Trigger:** Raw fuel/combustion export files contain rows with unparseable dates, blank data-quality ratings, or facility/category values outside the uploader's role scope (confirmed against `purepasturesrawfuelextract.csv`).
- **Options considered:**
  1. Reject the whole file on any row failure — simplest, but one bad row blocks an entire month's otherwise-valid data.
  2. Skip bad rows silently, import the rest, show a summary — avoids blocking, but summary-only feedback leaves no persistent record once the uploader closes the screen.
  3. Import all rows, routing bad/out-of-scope rows into the existing Review Queue via `requires_review` — reuses infrastructure already built for manual entries, gives the Sustainability Analyst a persistent, auditable place to resolve them.
- **Chosen:** Option 3
- **Reasoning:** The Review Queue already exists specifically to hold flagged records for Analyst resolution; routing bad bulk rows there instead of building a separate "failed rows" surface avoids duplicate infrastructure and keeps a single audit trail consistent with the tool's stated purpose of full traceability.
- **Limitation / what this doesn't solve:** Rows outside the uploader's permitted scope still get inserted with `requires_review = true` via application logic, not a database constraint — RLS restricts *which* facility/category a role can insert under, but the validity flag itself is not RLS-enforced. See product-spec-g1.md's Bulk-upload insert note in Section 6.
- **Scope creep check:** in scope
- **Spec version bump:** yes → v1.1 (folded into D-1's bump)
- **Tags:** #g-1 #bulk-upload #review-queue #data-quality

---

## D-3: Duplicate detection on bulk upload

- **Date:** 2026-07-10
- **Goal:** OBJ-1
- **Spec section affected:** product-spec-g1.md Sections 8, 13
- **Status:** adopted
- **Trigger:** Recurring monthly supplier exports risk being re-uploaded in full (not just the new month's rows), which would double-count activity data feeding into G-4's calculations.
- **Options considered:**
  1. Block duplicates outright (matching `purchase_id` + `site_reference`) — safest against double-counting, but blocks legitimate corrections/re-imports.
  2. Warn but allow override — surfaces the risk without removing the uploader's judgment for edge cases (e.g. an intentional correction re-import).
  3. No duplicate checking in v1.1 — simplest, but leaves double-counting risk entirely on manual review.
- **Chosen:** Option 2
- **Reasoning:** Downstream co2e correctness in G-4 depends on activity data not being double-counted, so silence (option 3) is too risky; but a hard block (option 1) can't distinguish a legitimate re-import from an accidental duplicate. A warn-and-confirm step keeps the decision with the human who has context, while still surfacing the risk instead of hiding it.
- **Limitation / what this doesn't solve:** Detection is limited to exact `purchase_id` + `site_reference` matches — a duplicate submitted under a re-issued invoice number won't be caught. Known gap, not silently assumed away.
- **Scope creep check:** in scope
- **Spec version bump:** yes → v1.1 (folded into D-1's bump)
- **Tags:** #g-1 #bulk-upload #duplicate-detection #data-integrity

---

## D-4: Correct spec's build-environment assumptions (Supabase MCP → Management API + PAT; GitHub → no repo)

- **Date:** 2026-07-10
- **Goal:** OBJ-1
- **Spec section affected:** product-spec-g1.md Sections 4, 11, 14, 15
- **Status:** adopted
- **Trigger:** After the v1.0 build, Andrea reported that Claude Code had no Supabase MCP available and used the Supabase Management API (authenticated with a personal-access-token the builder provided transiently) instead. Separately, no GitHub repo was created or used — Netlify MCP deployed straight from the local project folder. Both diverge from what Sections 4/14/15 described and assumed as blocking pre-build steps.
- **Options considered:**
  1. Leave the spec as-is since the v1.0 build already succeeded — but this misleads G-4 and G-2's own specs, which are written assuming the same (incorrect) environment capabilities.
  2. Correct the spec text to match what actually happened, and flag the same correction forward into G-4/G-2's future specs.
- **Chosen:** Option 2
- **Reasoning:** The build order explicitly depends on G-4 and G-2 reading `docs/supabase-setup.md` and following the same pre-build checklist; an inaccurate checklist would cause both future builds to plan around a GitHub repo and Supabase MCP OAuth step that don't exist in this environment, and to miss that `docs/supabase-setup.md` requires a manual carry-forward step rather than being automatically discoverable via a repo.
- **Limitation / what this doesn't solve:** Confirmed with Andrea that the PAT was used transiently and never written to a file — no credential exposure. `docs/supabase-setup.md` currently exists only as a local file on the builder's machine; it must be manually copied into G-4's project folder before G-4's build session, and this manual step has no automated safeguard against being forgotten.
- **Scope creep check:** in scope (correction, not an addition)
- **Spec version bump:** no — build mechanics, not tool behavior (per §4 of this registry)
- **Tags:** #g-1 #build-environment #supabase #infrastructure-correction

---

## D-5: Reintroduce GitHub repo for G-1 (reverses part of D-4)

- **Date:** 2026-07-10
- **Goal:** OBJ-1
- **Spec section affected:** product-spec-g1.md Sections 4, 14, 15
- **Status:** adopted
- **Trigger:** Andrea provided an existing GitHub repo (`https://github.com/acarras-1403/dairy-carbon-tool_dev`) and requested standard framework deploy flow, reversing D-4's "no GitHub repo" correction for G-1 only.
- **Options considered:**
  1. Keep D-4's no-repo model — simplest, but no longer what's being asked for.
  2. Standard framework flow — Netlify connects to the repo, auto-deploys from `main`, matching the AILab default and giving real git-based session continuity.
  3. Hybrid (repo for version control only, Netlify MCP still deploys directly) — smaller change, but keeps two deploy paths that can drift out of sync.
- **Chosen:** Option 2
- **Reasoning:** Matches the framework's standard stack (Hosting: Netlify, GitHub auto-deploy from main) rather than the workaround D-4 documented for an environment that lacked a repo at the time. Andrea now has the repo, so the constraint that forced the workaround no longer applies.
- **Limitation / what this doesn't solve:** Whether G-4/G-2 also move to a shared-repo handoff (vs. D-4's manual-copy of `docs/supabase-setup.md`) is explicitly deferred to those tools' own specs, not decided here — until answered, D-4's manual-carry-forward instruction stays in force for them by default.
- **Scope creep check:** in scope — explicitly requested
- **Spec version bump:** no — build mechanics, consistent with D-4's own precedent
- **Tags:** #g-1 #github #deploy-mechanism #stack-handoff

---

## D-6: Move scope/category/subcategory from Activity Data to the EF table

- **Date:** 2026-07-14
- **Goal:** G-3
- **Spec section affected:** Data architecture — Activity Data schema, EF table schema
- **Status:** adopted
- **Trigger:** Multi-linkage requirement discovered — a single activity value (electricity, fuel) must generate results across more than one scope/basis (location-based vs. market-based Scope 2; Scope 1 direct vs. Scope 3 Cat 3 WTT). A fixed `scope` field on Activity Data can't represent that.
- **Options considered:**
  1. Keep scope/category/subcategory on Activity Data, add a separate junction table mapping one activity row to multiple EF rows — preserves the familiar structure but adds a redundant mapping layer.
  2. Move scope/category/subcategory to the EF table only; Activity Data stores just `source`. One `source` can match multiple EF rows differing by scope + emission_basis.
- **Chosen:** Option 2
- **Reasoning:** Scope isn't actually a property of what was purchased — it's a property of which calculation basis gets applied to it. Storing it on Activity Data as a fixed field was incorrect the moment multi-linkage entered scope, not just inconvenient.
- **Limitation / what this doesn't solve:** Requires the hardcoded `source` list to be atomic/unambiguous (no two different real-world sources sharing one label), since `source` is now the sole join key. The UI still walks users through a scope→category→subcategory→source cascade for navigation, even though only `source` is stored — that split needs to stay intentional, not drift.
- **Scope creep check:** in scope — directly required by the multi-linkage requirement, not an add-on.
- **Spec version bump:** yes → (assign version once Tool B's spec is drafted; this is a data-model change, not an internal refactor)
- **Tags:** #ef-database #multi-linkage #scope2-dual-reporting #data-model

---

## D-7: Defer the EF table's editable/dynamic frontend view

- **Date:** 2026-07-14
- **Goal:** G-3
- **Spec section affected:** EF table / Tool B UI scope
- **Status:** deferred
- **Trigger:** Discussion of whether the EF table needs a dropdown-based entry UI or an editable frontend letting users adjust EF values and trigger recalculation.
- **Options considered:**
  1. Build an editable, dynamic EF frontend with recalculation now.
  2. Ship the EF table as backend-only calculation reference data this iteration; defer the editable view.
- **Chosen:** Option 2
- **Reasoning:** This iteration's goal is validating calculation logic and the EF-to-activity-data linkage. An editable EF UI is a separate capability that doesn't block that goal and would expand scope disproportionately to the value it adds right now.
- **Limitation / what this doesn't solve:** EF values can only be changed via direct database or CSV edit this iteration — no in-app editing or recalculation trigger exists yet.
- **Scope creep check:** flagged — deferred (not required by G-3's core aim)
- **Spec version bump:** no
- **Tags:** #ef-database #frontend #deferred #tool-b

---

## D-8: Defer new emission_source creation procedure

- **Date:** 2026-07-14
- **Goal:** G-3
- **Spec section affected:** Calculation logic §4 (Unit / Currency Reconciliation)
- **Status:** deferred
- **Trigger:** While defining the unit/currency reconciliation runtime rule, it became clear the system needs a way to guarantee every `emission_source` has a `conversion_factor` before calculation runs — but no procedure for creating a new emission_source (with that requirement enforced) exists yet.
- **Options considered:**
  1. Design and build the new-emission_source creation procedure now, with `conversion_factor` mandatory at creation — closes the gap structurally, but expands this iteration's scope into a feature not yet requested.
  2. Defer the creation procedure to a future session; rely solely on the runtime fallback (`export_blocked = true`) as a stopgap for now.
- **Chosen:** Option 2
- **Reasoning:** No new emission_source is being added this iteration — the hardcoded list carries forward as-is. Building a creation procedure now would be solving a problem this iteration doesn't yet have.
- **Limitation / what this doesn't solve:** The runtime `export_blocked` fallback (calculation logic §4) is the only safeguard against unit mismatches until this procedure exists. If a new emission_source is ever added without a `conversion_factor`, the row will silently fail to reconcile and only get caught at export time, not at creation time.
- **Scope creep check:** flagged — deferred (not required by G-3's current build, since no new emission sources are being added this iteration)
- **Spec version bump:** no (doesn't change current tool behavior — this documents a known gap for a future addition)
- **Tags:** #ef-database #data-quality #deferred #emission-source-creation

---

## D-9: Defer D3/Supabase promotion, ship expanded schema as D2 this iteration

- **Date:** 2026-07-14
- **Goal:** G-3
- **Spec section affected:** Section 1 (Build status), Section 2 (Classification — Data Model)
- **Status:** deferred
- **Trigger:** G-3 explicitly scoped a D3 (Supabase-persisted) promotion for this tool. Mid-session, the decision was made to build the expanded Activity Data schema, Facility Reporting Period, and unit conversion logic as a D2 (session-only) iteration instead, with the actual database wiring pushed to a future session.
- **Options considered:**
  1. Promote to D3 now as G-3 originally scoped — provision the Supabase project, persist Activity Data and Facility Reporting Period, wire the shared schema with the future Tool B.
  2. Stay D2 this iteration — build and validate the expanded field set, the new Facility Reporting Period form, and unit conversion logic against session-only state; defer the Supabase project and persistence to a later session.
- **Chosen:** Option 2
- **Reasoning:** Validates the UI and schema shape (raw/converted split, evidence_link, reviewer, Facility Reporting Period) before taking on the added complexity of provisioning Supabase and rewriting the D2-only Hard Rules currently governing this tool's CLAUDE.md. Speed and reduced build risk this session, at the cost of not delivering G-3's stated D3 outcome yet.
- **Limitation / what this doesn't solve:** Facility Reporting Period exists specifically to support Tool B's future intensity calculations by joining against persisted Activity Data — in a D2 tool, nothing is actually joinable. Both CSV exports exist as a stopgap so entered data isn't lost, but someone has to manually re-enter everything into Supabase once D3 exists. G-3's D3 outcome remains fully open.
- **Scope creep check:** flagged — deferred (not required to validate the schema/UI shape, which was this session's actual goal)
- **Spec version bump:** yes → v4.0 (already reflected in product-spec.md)
- **Tags:** #d3-promotion #tier-1 #deferred #scope-sequencing

---

## D-10: Placeholder conversion_factor values, real logic built now

- **Date:** 2026-07-14
- **Goal:** G-3
- **Spec section affected:** Section 9 (Logic and Calculations) — unit conversion
- **Status:** deferred
- **Trigger:** activity_data_value_converted/unit_converted required a conversion_factor per emission_source with no defined source for the real values.
- **Options considered:**
  1. Invent factor values now to unblock the build.
  2. Build the full computation, lookup table structure, and Data Review fallback for unrecognized units now, with every factor defaulting to a placeholder (1.0, marked TBD); real values supplied later as a data edit.
- **Chosen:** Option 2
- **Reasoning:** Inventing real-looking factor values would let incorrect numbers ship as if authoritative. Building the structure now with visibly-placeholder values keeps the computation and error handling real while making it obvious the output isn't trustworthy yet.
- **Limitation / what this doesn't solve:** Every activity_data_value_converted produced by this build is wrong until real factors are supplied — this must not be exported or used for any downstream calculation before that happens.
- **Scope creep check:** in scope — required to validate the conversion logic and Data Review fallback, which was explicitly requested this session.
- **Spec version bump:** no (already captured in v4.0 as part of D-9's version bump)
- **Tags:** #ef-database #placeholder-data #deferred #unit-conversion
