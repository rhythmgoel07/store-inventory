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

**Always true, whatever you set:** every role sees products, photos and stock; **opens any product's page**; records sales, bookings, booking amounts and customer payments; adds a customer while billing; delivers a booking; and can ask an admin to correct an entry. Only an admin reaches categories, lists, settings and staff logins. An admin may always do everything.

**Everything else you decide yourself**, on the Staff screen under *What each role may do* — tick it for manager, for sales executive, for both or for neither:
- See cost price and margin — on the product page, on the product cards and in the Excel export
- See which vendor supplies a product
- See a product's stock movement history
- Add, edit and delete vendors
- Receive stock (stock in) · Transfer stock between locations · Take stock out · Set the counted quantity
- Add and edit products, prices and photos
- Change a saved booking without approval · Cancel a booking · Void a bill · Edit a saved customer · Remove a recorded payment

Out of the box a manager may receive and transfer stock, see the vendor and see the movement history; a sales executive sees none of that and may not move stock. **Cost price is off for both until you tick it.** Anything left unticked shows that person an **Ask admin** button instead. *Reset to defaults* puts it all back.

The Firestore rules read the same settings, so a permission you withhold is refused by the database, not just hidden on screen. The one exception is the split between stock in, transfer, stock out and set count: all four write the same stock fields, so the database can only tell that the person may move stock at all — which of the four they see is decided by the app. Everything else is enforced for real.

## Corrections need an admin
Nobody except an admin can change something already saved. A manager or sales executive presses **Ask admin** instead — on a booking, a payment, a bill, or a stock count — fills in the new value and a reason, and it goes to **Approvals**.
- The admin sees who asked, the old value → the new value, and the reason, then **Approve** (which applies the change) or **Reject**.
- Nothing changes until approval. The sidebar shows a count of what is waiting.
- Managers and sales executives see only their own requests on that screen.

## Prices on screen
- **Every product card shows the selling price and the MRP**, to everyone.
- **Cost price (and the margin %) appears on the card as well**, but only for an admin and for a role you have ticked *See cost price and margin* for. The same tick controls the cost and margin rows on the product page, the cost figures on the dashboard, and the Export button on the Products screen (the sheet carries cost prices).
- **The product page opens for everyone.** Name, SKU, barcode, category, MRP, selling price, GST, stock, size, bookings, locations, notes and timestamps are always shown; cost price, margin, the vendor and the stock movement history each wait on their own permission.
- **Wherever a product is named it is a link to that page** — the dashboard's restock list and activity feed, the Sales and Bookings lists, an invoice, a purchase bill, a booking, the stock screen and its movement log, and a vendor's product list. A product deleted since is left as plain text.

## Stock and locations
- Stock is tracked **per location**, so one SKU can sit partly on the floor and partly in the godown. Every screen shows the split — the product card reads `📍 Godown Rack 3 ×1 · Floor 1 - A2 ×1`, and the product page, stock screen and Excel export show it too. A transfer never changes the SKU, the barcode or the total; it only moves pieces between places.
- **Stock in takes several places at once.** The Stock in tab is a list of rows — a location and a quantity each — with **+ Another location** to add more, so one delivery split between the floor and the godown goes in once. It tells you the total being added and what the stock becomes, and writes a movement-log line per place.
- **Set count asks which place you counted.** Pick the location, enter what you physically counted there, and the app says what it thought was there and what will be added or written off. **Only that place changes** — stock at every other location is left exactly as it was, and the total is recomputed. (Before, a count replaced the whole product and flattened the split.) The same is true of a count an admin approves from **Approvals**: the difference lands on the product's main location.
- **Transfer** moves pieces between places without changing the total, and opens with two different places already picked. **Stock out** takes pieces out of one place and out of the total. Who may do each is set on the Staff screen.
- **Selling asks where the stock comes from**: every line on the Sell screen has a *Take from* dropdown listing each place and how many are there. If you ask for more than that place holds, the app says so and takes the rest from the next place with stock. Delivering a booking asks the same for any item sitting in more than one place.
- Each sale remembers where its pieces came from — it shows in the movement log and in the `taken_from` column of the sales export.
- The Stock screen has a **Stock by location** summary and a movement log that records transfers with their from → to.

## Products screen
- Results are **thumbnail cards**: photo, name, SKU, selling price, MRP, cost price (where allowed), the stock split by location, size, bookings and the stock tag.
- Each card's name is a **link** to the full product page, and the card itself is clickable — for every role.
- Filters: search text, category, sub-category, **location**, **vendor**, stock state, sort.
- **Search by vendor** two ways: pick one from the **All vendors** dropdown, or just type the vendor's name in the search box. The dropdown lists your active vendors plus any name typed or imported onto a product. A vendor's own page has a *see them in Products* link beside the product count that jumps straight to that vendor's products.
- Both the vendor dropdown and vendor matching in the search box follow the *See which vendor supplies a product* permission — a role without it gets neither, so the search cannot be used to work out who supplies what.
- **Location search matches every place a product sits**, not only its main one: a sofa with 2 on the floor and 2 in the godown now turns up under either. (It used to match the main location only.)

## Editable dropdowns (admin)
- **Settings → Dropdown lists**: locations/racks, units, GST rates, payment modes — add, rename or remove. Renaming a location updates every product in it.
- A new rack can also be added from the product form with the **＋** beside Location.
- **Categories screen**: rename, add inside, or delete categories, sub-categories and types (✎ ＋ ✕).

## Data fields per product
name, SKU, barcode, vendor, dimension + dimension unit, category / sub-category / type (id, name, slug from your taxonomy, plus `fullSlug` of the deepest level), MRP, selling price, cost, GST %, stock, reorder level, unit, location, notes, timestamps, updated-by.

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
- **Products → Barcode labels** → *Print / Save as PDF* (A4 sheet of 24, or a 50x25 mm roll) or *Download list (Excel)* with sku, name, MRP, price and barcode.
- **Each label carries the MRP and the selling price** — MRP small on the left, the selling price large on the right, above the barcode, with the SKU and the size on the line above. That is on by default; untick *Show MRP and selling price* for a plain SKU-and-barcode label. You can also print one label per unit in stock.
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

## Opening a bill
Every invoice and every purchase bill has a page of its own, and an admin can correct either one.

**Customer invoice.** Tap the invoice number anywhere it appears — the Sales list, the customer's ledger, the booking page — and the whole bill opens: customer, payment mode, who billed it, every line with quantity, rate, GST and the location the goods came from, and the totals down to what is still pending. **Print bill** gives an A4 invoice; **Print receipt** is the narrow thermal slip as before.
- **Edit bill** (admin only) changes quantities and rates, removes a line, adds another product, sets a discount and the payment mode. **Changing a quantity moves the stock by the difference** — bill one sofa instead of two and one sofa goes back on the shelf, into the same location it was taken from, with a line in the movement log.
- A bill raised by delivering a booking keeps its items — those belong to the booking — and only the **amount collected on delivery** and the payment mode can be corrected. The booking is updated in the same step, so the customer's ledger stays right.
- Every correction is stamped with who made it, when, and the reason you type, and is listed at the bottom of the bill.
- A manager or sales executive can open and print any bill but not change it; the **Ask admin** button is there for them.

**Purchase bill.** On the vendor's ledger, the purchase line is a link and there is an **Open bill** button. The page shows the vendor, bill number and date, every item with its rate, each charge head, the bill total, where the stock went and who entered it.
- **Edit bill** (admin only) reopens the same window you recorded it in, filled with what is already on the bill: items, quantities, rates, charge heads, bill number, date, note and location. Change anything and save.
- If the bill had put the pieces into stock, **the difference is applied to stock**: three sofas instead of two adds one more, two instead of three takes one back out, each with a movement-log entry. If the quantity being taken back out is no longer on the shelf, the app says so and saves nothing.
- You can still add a product that doesn't exist from inside a correction, exactly as when recording a new bill. A product created that way starts at **zero opening stock**, because the bill itself is about to add the pieces.
- **Print bill** gives an A4 copy of the purchase for your file.

## Bookings
- **Bookings → + New booking**: pick products like a bill, enter the customer's phone and name, the **booking amount received**, a **tentative delivery date** and any notes. Booking numbers run BK-00001 upward.
- Booked pieces stay in stock but are **reserved**: the product list shows "🔖 2 booked · 2 free", and Sell and New booking only allow what is free, so the same last piece can't be sold twice.
- **As many products as you like go in one booking** — keep searching and tapping; each one becomes its own line with its own quantity. Selling works the same way: the cart on the Sell screen holds any number of products and bills them together.
- **Deliver & bill** asks how much is being collected now (the balance by default, but you can take less or nothing). Stock comes down, the reservation clears, and anything left stays pending in the customer's ledger.
- **Payments**: a customer can pay in as many instalments as they like. Use **+ Record payment** on the booking or the customer page — each one keeps its own date, mode and reference, and shows as a separate line in the ledger. Only an admin can remove one.
- **Cancel booking** (admin) releases the reserved stock. **Print slip** gives the customer a booking slip with the balance and delivery date.
- Edit lets you update the booking amount, delivery date and notes as things change.
- Dashboard shows open bookings, advance held and upcoming deliveries; overdue dates turn red.

## Vendors
A module of its own (sidebar → **Vendors**), open to admins and to anyone you tick *Add, edit and delete vendors* for.
- Each vendor keeps: name, **contact person and phone**, an optional **second contact and phone**, a **category**, GSTIN, address, city, email, bank or UPI details, a **standing note** and an active/inactive flag.
- **Billing method and credit period are switched off** — the fields are gone from the vendor form, the vendor list, the vendor page, the purchase window, the printed statement, the export and the Settings list. Anything already saved on a vendor is kept. To bring them back, find `const SHOW_BILLING=false;` near the top of the script in `index.html` and change it to `true`.
- **Category** (Furniture, Furnishing, Tableware, Decor, Plants and Planters…) is an editable list like locations — Settings → Dropdown lists → *Vendor categories*, or the **＋** beside the field adds one on the spot. The vendor list has a category column, an **All categories** filter, and the search box matches the category too.
- **Notes**: besides the standing note, **+ Add note** keeps a dated log per vendor — price revisions, delivery habits, disputes — each stamped with the date and who wrote it.
- The vendor's page shows how many products come from them, units in stock, stock value at cost and retail, how many need restocking, and the product list itself.
- **In the product form the vendor is now a dropdown** fed by this list, with a **＋** that jumps straight to adding one. Vendor names typed in before (or imported) still work: the Vendors screen lists them as "used on products but not in this list" with one-tap buttons to adopt them, which links every product carrying that name. Renaming a vendor updates its products too.
- Deleting a vendor warns you how many products name it; those products keep the name as plain text but lose the link, the billing method and the notes.
- **Export** gives an .xlsx with Vendors (including stock value and ledger balance), Purchases, Vendor payments and Vendor notes sheets.

### Vendor ledger
Each vendor page carries a dated statement, the mirror of the customer one.
- **+ Purchase** records a bill: bill number, date, line items picked from your products (quantity and rate, the rate defaulting to the product's cost), and a note.
- **A product that doesn't exist yet** can be created without losing the bill: type its name in the item search and pick **+ Add "…" as a new product**. The product form opens with the name filled in; saving it returns you to the half-written bill with that product added as a line.
  - **Its stock is counted only once.** While the bill is set to add the pieces to inventory, the new product's **Opening stock is locked at 0** and says why — the bill itself puts the quantity in, so the product cannot end up with the opening piece *and* the billed pieces. If you untick *also add these pieces to stock* (because the goods already came in through Stock in), the field unlocks, since then it is the only way to record what is on the shelf.
- **Other charges are rows with their own heads** — Freight, GST, Loading, anything you type — each with its own amount, added with **+ Add charge**. A discount goes in as a minus amount. Heads you have used before are suggested as you type, and each one is named in the ledger line and in the purchases export. Tick **also add these pieces to stock** and the same action receives the goods into a location and writes the movement log entry — leave it unticked if the stock already came in through Stock in, or it would be counted twice.
- **+ Payment** records what you paid: amount, date, mode (cash, UPI, bank transfer, cheque, adjustment — an editable list), reference such as a UTR or cheque number, and whether it is **against bills** or **an advance**.
- The ledger runs date-wise with **Billed**, **Paid** and a running **Balance**. Balance is paid minus billed, so **a negative number is still payable to the vendor** and a positive number is an advance lying with them. The tile at the top says which.
- **Print statement** gives an A4 vendor statement; **Export ledger** saves the same as Excel with a TOTAL row.
- The Vendors list shows each vendor's balance and totals the payables across all of them.
- Recording purchases and payments is its own permission (*Record vendor purchases and payments*), separate from adding or editing vendors. Correcting or removing a purchase or a payment is admin-only. Removing a purchase does not pull the stock back out — correct the bill instead if the quantity was wrong, or adjust the stock separately.

## Dimensions
- Every product has a **Dimension / size** field and a separate **Dimension unit** field, so `16x16` and `inch` stay in their own columns — in the form, in the Excel export and in the import template.
- The unit comes from an editable list (Settings → Dropdown lists → *Dimension units*): inch, cm, ft, mm, m, sq ft out of the box.
- The size shows on the **product card** (`📐 16x16 inch`) wherever a product has one, so cushion covers and bedsheets are told apart at a glance, and on the Sell and New booking pickers next to the SKU.
- **Searching**: the search box matches the size, and an **All sizes** dropdown lists the sizes present in whatever category you are browsing — pick Furnishings and you get furnishing sizes. Changing category clears a size that no longer applies.
- Barcode labels print the size under the SKU, and it appears in the products, barcode-list and sale-items exports.

## Product form defaults and the reorder field
- A new product starts with **GST 0%** and **opening stock 1**; change either as you type. Editing an existing product leaves its saved values alone.
- **Reorder level is switched off.** The field is hidden in the product form, new products save a level of 0, and the *low stock* (amber) state is off for every product while the switch is off — so a card is green when it has stock and red only when it is empty. Levels already saved on older products are kept untouched and come back into use the moment the switch is turned on.
- To bring it back: in `index.html` find `const SHOW_REORDER=false;` near the top of the script and change it to `true`. The field, the "reorder at N" notes and the Reorder level row on the product page all return.
- Stock is written with its unit everywhere it is shown: **1 pc**, **6 pcs**, **1 set**, **1 pair**. A unit the app doesn't recognise is printed exactly as you typed it.
