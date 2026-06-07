# Writers' Room Authority Policy

The Scenario Department backend must enforce this hierarchy:

- Photoplaywrights are constructive collaborators. Their memoranda identify a promise to preserve, offer honest encouragement, and propose specific repairs grounded in the Photoplay Rules.
- The Writers' Room may route a property only to `treatments` or `reconference`.
- Low ratings route to `reconference` with fundamental repairs, never to Wastebasket.
- Legacy or generated conference decisions containing `wastebasket`, `reject`, or `discard` normalize to `reconference`.
- Reconference may continue as long as the writers have useful repairs; there is no automatic two-pass disposal rule.
- Only Carstairs may issue `greenlight`, `rewrite`, or `wastebasket` as a final executive ruling.

The updated full Apps Script source is maintained as `Code.gs` and includes `testWritersRoomAuthorityPolicy_()` to verify this boundary.