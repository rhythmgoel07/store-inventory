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
Logins are created by an admin on the **Staff** screen in the sidebar. There is no public sign-up. You can have as many admins and managers as you like.

Three roles: **admin**, **manager**, **sales executive** (plus **disabled**, which removes access but keeps the person's history). Older logins saved as `staff` still work and read as sales executive.

**Always true, whatever you set:** every role sees products, photos and stock; records sales, bookings, booking amounts and customer payments; adds a customer while billing; delivers a booking; and can ask an admin to correct an entry. Only an admin reaches categories, lists, settings and staff logins. An admin may always do everything.

**Everything else you decide yourself**, on the Staff screen under *What each role may do* — tick it for manager, for sales executive, for both or for neither:
- Open the full product page (cost price, margin, history)
- Receive stock (stock in) · Transfer stock between locations · Take stock out · Set the counted quantity
- Add and edit products, prices and photos
- Change a saved booking without approval · Cancel a booking · Void a bill · Edit a saved customer · Remove a recorded payment

Out of the box a manager may receive and transfer stock, and a sales executive may do neither. Anything left unticked shows that person an **Ask admin** button instead. *Reset to defaults* puts it all back.

The Firestore rules read the same settings, so a permission you withhold is refused by the database, not just hidden on screen. The one exception is the split between stock in, transfer, stock out and set count: all four write the same stock fields, so the database can only tell that the person may move stock at all — which of the four they see is decided by the app. Everything else is enforced for real.

## Corrections need an admin
Nobody except an admin can change something already saved. A manager or sales executive presses **Ask admin** instead — on a booking, a payment, a bill, or a stock count — fills in the new value and a reason, and it goes to **Approvals**.
- The admin sees who asked, the old value → the new value, and the reason, then **Approve** (which applies the change) or **Reject**.
- Nothing changes until approval. The sidebar shows a count of what is waiting.
- Managers and sales executives see only their own requests on that screen.

## Stock and locations
- Stock is tracked **per location**, so one SKU can sit partly on the floor and partly in the godown. The product page, the stock screen and the Excel export all show the split; the card shows wherever most of it is.
- **Stock in** adds to the total and to the place you choose. **Transfer** moves pieces between places without changing the total. **Stock out** and **Set count** change the total. Who may do each is set on the Staff screen.
- **Selling asks where the stock comes from**: every line on the Sell screen has a *Take from* dropdown listing each place and how many are there. If you ask for more than that place holds, the app says so and takes the rest from the next place with stock. Delivering a booking asks the same for any item sitting in more than one place.
- Each sale remembers where its pieces came from — it shows in the movement log and in the `taken_from` column of the sales export.
- The Stock screen has a **Stock by location** summary and a movement log that records transfers with their from → to.

## Products screen
- Results are **thumbnail cards**: photo, SKU, name, MRP, location, stock. Staff see exactly this, plus an **Update** button for stock.
- For admin, each card's name is a **link** to the full product page — every field, margin, category path, barcode, timestamps and that product's stock history, with Edit and Update stock.
- Filters: search text (name, SKU, barcode, brand, location), category, sub-category, **location**, stock state, sort.

## Editable dropdowns (admin)
- **Settings → Dropdown lists**: locations/racks, units, GST rates, payment modes — add, rename or remove. Renaming a location updates every product in it.
- A new rack can also be added from the product form with the **＋** beside Location.
- **Categories screen**: rename, add inside, or delete categories, sub-categories and types (✎ ＋ ✕).

## Data fields per product
name, SKU, barcode, vendor, category / sub-category / type (id, name, slug from your taxonomy, plus `fullSlug` of the deepest level), MRP, selling price, cost, GST %, stock, reorder level, unit, location, notes, timestamps, updated-by.

## Notes
- Works offline for browsing and stock changes (syncs when back online). **Completing a sale needs an internet connection** so two staff can never sell the same last piece.
- Prices are treated as GST-inclusive (usual retail MRP); the receipt shows the GST portion.
- **Excel in, Excel out:** every import and export is .xlsx in the same layout — dark header row, frozen panes, filter arrows, Arial, rupee columns formatted, and a `photo` column with the product picture embedded wherever products are listed.
- **Vendor** replaces the old brand field (old data still reads fine; the import accepts a `brand` or `vendor` column).
- **Images:** each product takes a photo three ways — **📷 Take photo** opens the device camera with a live preview and a Capture button (phone camera or laptop webcam; "Switch camera" appears when there is more than one), **⇪ Upload image** picks an existing file, or paste a link in `imageUrl`. Photos are resized to 640 px and stored in Firestore, so no paid Storage plan is needed. The camera needs an https:// address (GitHub Pages is https) and permission the first time; if it is blocked or missing, the panel says so and points to Upload image.
- **Templates:** the Import window can regenerate `Inventory_Import_Template.xlsx` from your current categories and lists at any time.
- **Updating:** re-upload `index.html`, `sw.js`, `firestore.rules` contents (re-publish the rules in Firebase) and the template to GitHub when you get a new version.

## Barcodes & labels
- Product form → **Generate** next to Barcode, or leave `barcode` blank in the Excel and use **Barcode labels → Generate missing barcodes** (admin) to fill every product at once.
- Codes are 13-digit EAN-13 numbers starting `200` (the range reserved for in-store use) from one shared counter, so two staff can never get the same code. Once a SKU has a barcode it is kept: the Generate button locks, a blank value can't overwrite it (also on Excel import), and duplicates are refused.
- **Products → Barcode labels** → *Print / Save as PDF* (A4 sheet of 24, or a 50x25 mm roll; optional price, one label per unit in stock) or *Download list (Excel)* with sku, name, barcode.
- Any USB/Bluetooth barcode scanner works: scan in Sell (adds to the bill), Stock or the product search.

## Export
Products → Export gives an .xlsx with a **photo** column (pictures embedded, 220 px) plus all fields. Photos from image links are embedded only if the website allows it; the link always stays in `imageUrl`.

## Customers
- Saved automatically whenever you bill or book a phone number; add or edit by hand from **Customers → + Add customer**.
- **Search by phone number** (also name or email).
- Each customer page opens a **ledger**: every booking, invoice, cancellation and void in date order, with **Charges**, **Paid** and a running **Balance**.
  - Balance is money received minus money billed, so **a pending amount shows as a negative number** — a booking whose balance is still due, or a bill taken on Credit.
  - Goods are charged once, when the booking is raised; the delivery invoice only records the balance collected, so nothing is counted twice.
  - A cancelled booking reverses its charge and leaves the booking amount as credit until it is refunded. A voided invoice is listed but changes nothing.
  - A positive balance means the shop holds the customer's money (advance or refund due).
- **Print statement** gives the customer an A4 statement; **Export ledger** saves the same thing as Excel.
- The Customers list adds a **Balance** column (customers who owe money sort first) and totals for pending, credit and billed-to-date. The Sell and New booking screens show any pending amount next to the customer's name.
- On the Sell and New booking screens, typing a known phone fills the name and shows past bills, spend and open bookings.
- Import/export: Customers → Import Excel uses the **Customers** sheet of the template (`name`, `phone` required; `email`, `address`, `notes` optional). A phone that already exists updates that customer rather than adding a duplicate. Export adds bills, total spent, open bookings, advance held, billed, received, balance and pending.

## Bookings
- **Bookings → + New booking**: pick products like a bill, enter the customer's phone and name, the **booking amount received**, a **tentative delivery date** and any notes. Booking numbers run BK-00001 upward.
- Booked pieces stay in stock but are **reserved**: the product list shows "🔖 2 booked · 2 free", and Sell and New booking only allow what is free, so the same last piece can't be sold twice.
- **Deliver & bill** asks how much is being collected now (the balance by default, but you can take less or nothing). Stock comes down, the reservation clears, and anything left stays pending in the customer's ledger.
- **Payments**: a customer can pay in as many instalments as they like. Use **+ Record payment** on the booking or the customer page — each one keeps its own date, mode and reference, and shows as a separate line in the ledger. Only an admin can remove one.
- **Cancel booking** (admin) releases the reserved stock. **Print slip** gives the customer a booking slip with the balance and delivery date.
- Edit lets you update the booking amount, delivery date and notes as things change.
- Dashboard shows open bookings, advance held and upcoming deliveries; overdue dates turn red.
