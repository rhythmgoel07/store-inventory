# Store Inventory + POS (cloud-synced PWA)

Files: `index.html` (the whole app, your category tree is built in), `firebase-config.js`, `manifest.json`, `sw.js`, `icon.svg`, `firestore.rules`.

## Setup (about 10 minutes, one time)
1. **Firebase project** – console.firebase.google.com → Add project.
2. **Authentication** → Get started → enable **Email/Password**.
3. **Firestore Database** → Create database (production mode, nearest region e.g. Mumbai `asia-south1`).
4. **Rules** – Firestore → Rules → paste the contents of `firestore.rules` → Publish.
5. **Web app config** – Project settings → Your apps → `</>` Web → copy the config into `firebase-config.js`.
6. **Authorized domains** – Authentication → Settings → add `<yourusername>.github.io`.
7. **Host** – upload all files to a GitHub repo → Settings → Pages → deploy from `main` / root.
8. **Open the site and create the first account yourself** – the first account becomes **admin**.
   Staff then sign up from the same screen and show as *pending* under Settings → Team; set them to **staff**.
9. On each phone/PC: open the link → "Add to Home screen / Install app".

## Modes (Settings → App mode, applies to all devices)
- **Inventory only** – products, stock in/out/count, low-stock alerts, movement log, CSV import/export.
- **Inventory + Sales** – adds Sell (barcode/search billing, discount, GST-inclusive pricing, payment mode, printable receipt), Sales history, void (restocks), daily revenue and margin.

## Roles
- **admin** – everything: add/edit/delete products, settings, team, void sales, CSV import.
- **staff** – view products, update stock, make sales. Rules stop staff from changing prices or product details.

## Data fields per product
name, SKU, barcode, brand, category / sub-category / type (id, name, slug from your taxonomy, plus `fullSlug` of the deepest level), MRP, selling price, cost, GST %, stock, reorder level, unit, location, notes, timestamps, updated-by.

## Notes
- Works offline for browsing and stock changes (syncs when back online). **Completing a sale needs an internet connection** so two staff can never sell the same last piece.
- Prices are treated as GST-inclusive (usual retail MRP); the receipt shows the GST portion.
- CSV import uses the taxonomy slug (e.g. `livingroom-sofas-3seatersofas`) – download the template from Products → Import CSV.
