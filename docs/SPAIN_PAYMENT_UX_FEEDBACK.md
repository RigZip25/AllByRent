# Spain payment UX feedback (2026-08)

Feedback from a Spain user who actively uses **Vinted** and **Wallapop**:

## Pain today
Stripe Connect onboarding **leaves** the Evorios app/site for a multi-step bank/KYC flow. Feels like “register again somewhere else” instead of paying inside the product.

## What neighbors expect (local apps)
- Checkout stays **inside** the app (card / Apple Pay / Google Pay / PayPal where available)
- Platform **holds funds** until the deal completes (especially rentals + deposits)
- Optional **wallet** to spend again or withdraw (Wallapop-style)
- Platform as **escrow / trust intermediary** for rental + delivery

## Product note for Evorios
Keep Stripe under the hood for cards and Connect payouts, but tighten UX toward:
1. **Renter:** Payment Element / Apple Pay / Google Pay in-app (no “new account” feeling)
2. **Host:** Connect Express with clearer in-app framing (“link your bank to receive money”) and fewer surprise exits
3. Later: clearer **hold → release** messaging for deposits (already Stripe holds; copy should match Vinted/Wallapop mental model)

Screenshots of Vinted/Wallapop flows from the reviewer are welcome as a reference pack.
