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
8. **Create the first admin by hand** (there is no sign-up in the app):
   a. Authentication -> Users -> **Add user** -> your email + a password.
   b. Copy the **User UID** shown in the list.
   c. Firestore -> **Start collection** `users` -> **Document ID = that UID** -> add fields (all type *string*): `name` = your name, `email` = your email, `role` = `admin` -> Save.
   d. Sign in on the site. From then on, add everyone else from Settings -> Team.
9. On each phone/PC: open the link → "Add to Home screen / Install app".

## Modes (Settings → App mode, applies to all devices)
- **Inventory only** – products, stock in/out/count, low-stock alerts, movement log, Excel import/export, product photos.
- **Inventory + Sales** – adds Sell (barcode/search billing, discount, GST-inclusive pricing, payment mode, printable receipt), Sales history, void (restocks), daily revenue and margin.

## Accounts & roles
- **No sign-up.** The sign-in screen only signs in. Admin creates every account in **Settings → Team** (name, email, temporary password, role); give the person those details and they can change the password with "Forgot password".
- **admin** – everything: add/edit/delete products, settings, dropdown lists, categories, team, void sales, Excel import/export.
- **staff** – search products, update stock, make sales. Rules stop staff from changing prices or product details.
- **disabled** – set anyone to `disabled` in Team to cut off access while keeping their history.
- Even if someone creates an account directly against Firebase, they get nothing: every rule needs a profile in `users` with role staff/admin, and only an admin can create one.

## Products screen
- Results are **thumbnail cards**: photo, SKU, name, MRP, location, stock. Staff see exactly this, plus an **Update** button for stock.
- For admin, each card's name is a **link** to the full product page — every field, margin, category path, barcode, timestamps and that product's stock history, with Edit and Update stock.
- Filters: search text (name, SKU, barcode, brand, location), category, sub-category, **location**, stock state, sort.

## Editable dropdowns (admin)
- **Settings → Dropdown lists**: locations/racks, units, GST rates, payment modes — add, rename or remove. Renaming a location updates every product in it.
- A new rack can also be added from the product form with the **＋** beside Location.
- **Categories screen**: rename, add inside, or delete categories, sub-categories and types (✎ ＋ ✕).

## Data fields per product
name, SKU, barcode, brand, category / sub-category / type (id, name, slug from your taxonomy, plus `fullSlug` of the deepest level), MRP, selling price, cost, GST %, stock, reorder level, unit, location, notes, timestamps, updated-by.

## Notes
- Works offline for browsing and stock changes (syncs when back online). **Completing a sale needs an internet connection** so two staff can never sell the same last piece.
- Prices are treated as GST-inclusive (usual retail MRP); the receipt shows the GST portion.
- **Excel import:** Products → Import → upload the filled `Inventory_Import_Template.xlsx`. Pick category / sub-category / type from the dropdowns; the categorySlug fills itself and the app also saves it. Existing SKUs update (stock unchanged), new SKUs are created.
- **Images:** add a photo to any product (camera or gallery; resized automatically and stored in Firestore, so no paid Storage plan is needed), or put an image link in the `imageUrl` column.
- **Updating:** re-upload `index.html`, `sw.js`, `firestore.rules` contents (re-publish the rules in Firebase) and the template to GitHub when you get a new version.

## Barcodes & labels
- Product form → **Generate** next to Barcode, or leave `barcode` blank in the Excel and use **Barcode labels → Generate missing barcodes** (admin) to fill every product at once.
- Codes are 13-digit EAN-13 numbers starting `200` (the range reserved for in-store use) from one shared counter, so two staff can never get the same code. Once a SKU has a barcode it is kept: the Generate button locks, a blank value can't overwrite it (also on Excel import), and duplicates are refused.
- **Products → Barcode labels** → *Print / Save as PDF* (A4 sheet of 24, or a 50x25 mm roll; optional price, one label per unit in stock) or *Download list (Excel)* with sku, name, barcode.
- Any USB/Bluetooth barcode scanner works: scan in Sell (adds to the bill), Stock or the product search.

## Export
Products → Export gives an .xlsx with a **photo** column (pictures embedded, 220 px) plus all fields. Photos from image links are embedded only if the website allows it; the link always stays in `imageUrl`.
