# Market Architecture

## Source of truth
- Current V1 authoritative state lives in Nakama Storage because Hyperstrux economy/resources are already storage-authoritative.
- SQL schema in `backend/sql/market_schema.sql` is provided as the forward schema for analytics, mirroring, moderation tooling and later refactors.

## V1 flow
1. Player opens `Marche`.
2. Frontend loads wallet, book, orders, trades and contracts through `rpc_market_*`.
3. Creating an order reserves resources or orbital credits immediately server-side.
4. Matching executes synchronously server-side with price/time priority.
5. Execution settles resources and orbital credits atomically.
6. Inbox market notifications are emitted after settlement.

## Supported modes
- Public market
- Alliance market
- Private contracts

## Access rules
- Controlled by `Bourse Orbitale`
- Level 1: public market
- Level 3: private contracts
- Level 8: alliance market
- Level 10: alerts + advanced history hooks

## Economic rules
- Currency: Orbital Credits
- No premium conversion
- Buy order: reserves orbital credits
- Sell order: removes resources from free stock and reserves them on the order
- Settlement is instant in V1

## Security notes
- Backend is authoritative
- No client-side matching
- No self-trade on public/alliance books
- New-account restrictions and top-tier gating are enforced server-side
- Private contracts to self are blocked server-side

## V2 extensions already prepared conceptually
- SQL mirroring for trades/orderbooks
- Regional markets
- Delivery convoys
- Admin market moderation
- Risk scoring persistence and alerts dispatch workers
