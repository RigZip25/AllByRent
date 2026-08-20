# Extra strings (categories + hardcoded)

Same columns as `cs-native-review.tsv`.

## Files

- `cs-native-review-extra.tsv` — **328** rows (this pack only)
- `cs-native-review-complete.tsv` — app messages + this pack (one sheet)

## Counts

- 27 · Categories · subcategory: 205
- 27 · Categories · top-level: 20
- 28 · SEO · rent landing meta: 8
- 28 · SEO · search nouns: 20
- 29 · Hardcoded · rent landing: 21
- 30 · Hardcoded · list offer (legacy): 17
- 31 · Hardcoded · payments & trust: 15
- 32 · Hardcoded · misc UI: 9
- 33 · Hardcoded · Mr. Evorios local hints: 13

## Notes

- **Categories:** `key` is `category.<English storage label>` — English key must stay stable for matching; translate display only into `czech_native`.
- **Hardcoded:** after translation we still need a code pass to wire them into i18n (or keep as mapped constants).
- Prefer translating **complete** file if you want one Google Sheet.
