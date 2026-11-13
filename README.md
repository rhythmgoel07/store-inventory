# Store Inventory + POS (cloud-synced PWA)

Files: `index.html` (the whole app, your category tree is built in), `firebase-config.js`, `manifest.json`, `sw.js`, `icon.svg`, `firestore.rules`.

## Setup (about 10 minutes, one time)
1. **Firebase project** – console.firebase.google.com → Add project.
2. **Authentication** → Get started → enable **Email/Password**.
3. **Firestore Database** → Create database (production mode, nearest region e.g. Mumbai `asia-south1`).
4. **Rules** – Firestore → Rules → paste the contents of `firestore.rules` → Publish. (After the one-time setup below, a push to GitHub does this for you.)
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

**Editing and removing a login**: the People list at the bottom of the Staff screen has **Edit**, **Send password reset** and **Remove** against each person.
- **Edit** changes the name — the label that appears against every entry that person made — and the role. The **email cannot be changed**: it is the sign-in itself, kept in Firebase Authentication, which a browser cannot change on someone else's behalf. To fix a typo in an email, remove the login and create it again.
- **Remove** takes the login out of the app. Access stops at once and the person disappears from the list, but sales, bookings and stock entries they made are kept with their name on them. **It does not delete their Firebase Authentication account** — nothing running in a browser can — so if someone is leaving for good, finish that in the Firebase console → Authentication. Until then they can still sign in, and see only a "No access" screen.
- To keep someone in the list instead, set their role to **disabled**: no access, history kept, and easy to switch back on.
- You cannot change your own role or remove your own login, and the last remaining admin cannot be demoted or removed — otherwise the store would be left with nobody who can create logins.

Out of the box a manager may receive and transfer stock, see the vendor and see the movement history; a sales executive sees none of that and may not move stock. **Cost price is off for both until you tick it.** Anything left unticked shows that person an **Ask admin** button instead. *Reset to defaults* puts it all back.

The Firestore rules read the same settings, so a permission you withhold is refused by the database, not just hidden on screen. The one exception is the split between stock in, transfer, stock out and set count: all four write the same stock fields, so the database can only tell that the person may move stock at all — which of the four they see is decided by the app. Everything else is enforced for real.

## Backdating a sale or a booking (admin only)
An entry made days after it happened should carry the date it happened, or the day's takings and
the month's figures never add up.

- On **Sell** and **New booking** an admin sees a **Date of sale** field, set to today. Change it
  and the bill or booking is dated then: it lands on that day in Sales, in the month's total, and
  in the right place in the customer's ledger.
- **Both dates are kept.** The record carries the date you chose and, separately, when it was
  actually entered and by whom. The invoice and booking pages show a **backdated** tag and a line
  reading "Entered 03 Nov by Rhythm — the bill is dated 25 Oct", and the tag appears in the Sales
  and Bookings lists too. Nothing is quietly rewritten.
- **Stock still moves today.** The shelf only learns about the sale when you enter it, so the
  movement log is dated now. The same goes for the invoice number: it is the next one in the
  sequence, so a backdated bill can carry a later number than one dated after it.
- Limits: not a future date, and not more than 400 days back.
- A manager or sales executive never sees the field, and the app ignores the date even if one is
  forced into the page. Note that the enforcement is the app and the admin role, not the database
  rules, so an admin remains the only practical route.

## Corrections need an admin
Nobody except an admin can change something already saved. A manager or sales executive presses **Ask admin** instead — on a booking, a payment, a bill, or a stock count — fills in the new value and a reason, and it goes to **Approvals**.
- The admin sees who asked, the old value → the new value, and the reason, then **Approve** (which applies the change) or **Reject**.
- Nothing changes until approval. The sidebar shows a count of what is waiting.
- Managers and sales executives see only their own requests on that screen.

## Prices on screen
- **Every product card shows the selling price and the MRP**, to everyone.
- **Settings → Prices on product cards** lets an admin untick any of the three — selling price, MRP, cost price — and that figure simply is not printed on the thumbnail cards. It applies to every device in the store, saves the moment you tick it, and changes nothing else: the product's own page still shows everything the person is allowed to see, and barcode labels still carry MRP and the selling price. Cost price still needs *See cost price* on top, so unticking it hides the figure from everyone while the permission still decides who could have seen it.
- **Cost price appears on the card as well** (the margin % does not — it is on the product page), but only for an admin and for a role you have ticked *See cost price and margin* for. The same tick controls the cost and margin rows on the product page, the cost figures on the dashboard, and the Export button on the Products screen (the sheet carries cost prices).
- **The product page opens for everyone.** Name, SKU, barcode, category, MRP, selling price, GST, stock, size, bookings, locations, notes and timestamps are always shown; cost price, margin, the vendor and the stock movement history each wait on their own permission.
- **Wherever a product is named it is a link to that page** — the dashboard's activity feed, the Sales and Bookings lists, an invoice, a purchase bill, a booking, the stock screen and its movement log, and a vendor's product list. A product deleted since is left as plain text.

## Stock and locations
- Stock is tracked **per location**, so one SKU can sit partly on the floor and partly in the godown. Every screen shows the split — the product card reads `📍 Godown Rack 3 ×1 · Floor 1 - A2 ×1`, and the product page, stock screen and Excel export show it too. A transfer never changes the SKU, the barcode or the total; it only moves pieces between places.
- **Stock in takes several places at once.** The Stock in tab is a list of rows — a location and a quantity each — with **+ Another location** to add more, so one delivery split between the floor and the godown goes in once. It tells you the total being added and what the stock becomes, and writes a movement-log line per place.
- **Set count takes every place at once.** The window opens with a row for each place the product actually sits, showing **App has** beside a **You counted** box, so a full audit of a product spread over three racks is one window and one save. **+ Another place** adds a rack it has never been in (counting stock you have just found). A place can only appear once — picking one that is already listed is refused rather than quietly added to the row above.
  - **An empty box means "not counted", and that place is left exactly as it was.** Counting only the floor can never silently zero the godown. The line underneath says how many boxes you left empty, what the total will become, and how much is being added and written off.
  - Each place that differs gets its own `adjust` line in the movement log with what you counted and what the app had. Places that match are not written at all, and a count that matches everywhere says so instead of pretending to save.
  - A count an admin approves from **Approvals** is still a single number — the difference lands on the product's main location.
- **Transfer** moves pieces between places without changing the total, and opens with two different places already picked. **Stock out** takes pieces out of one place and out of the total. Who may do each is set on the Staff screen.
- **Selling asks where the stock comes from**: every line on the Sell screen has a *Take from* dropdown listing each place and how many are there. If you ask for more than that place holds, the app says so and takes the rest from the next place with stock. Delivering a booking asks the same for any item sitting in more than one place.
- Each sale remembers where its pieces came from — it shows in the movement log and in the `taken_from` column of the sales export.
- The Stock screen has a **Stock by location** summary and a movement log that records transfers with their from → to.
- **Move many products to one place at once.** Products → **Select products** turns the grid into tick boxes; tick the ones you want (or **Select all**, which takes everything the current filters show, so you can filter to one rack and move the lot). The bar at the top counts what is picked and how many pieces that is, and **Move / set location** asks where they go, with two choices:
  - **Move every piece there** — the stock itself moves. Totals never change, a product split across two racks is brought together, and each product gets its own transfer line in the movement log. Needs the *Transfer stock* permission.
  - **Only set the rack label** — where the pieces are recorded stays as it is, and only the product's main location changes. For products with no stock, or to say where the next delivery should go. Needs *Add and edit products*.

  Products already sitting at the destination are left untouched rather than given a pointless `A2 → A2` movement line, and the message afterwards says how many were already there. A role with neither permission does not see the button. Hundreds at a time are safe — the writes go up in chunks of 150 products so no single batch exceeds what Firestore allows.

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

## Tiles open the list behind them
- **Every stat tile in the app is clickable**, not just the dashboard's, and each opens the list already filtered to exactly the rows it counted. A figure on a tile is a question — *which ones?* — and the answer is one tap away.
  - **Bookings**: *Open bookings* and *Received on open bookings* open the open ones; **Due for delivery** opens just those due on or before today, with a line saying so and a link back to all open bookings.
  - **Enquiries**: *Open*, *To follow up* (due today or earlier) and *Won*.
  - **Customers**: *Pending from customers* and *Credit with shop* filter the list to exactly those people; *Billed to date* clears the filter.
  - **Vendors**: *Vendors* and *Stock on hand* open Products; *Needs restocking* opens Products filtered to **Low or out of stock**; *Payable to vendors* filters the vendor list to the ones owed money.
  - **A vendor's page**: *Products* and *Stock value* open that vendor's products; *Needs restocking* opens their low or out-of-stock ones.
  - **A customer's or vendor's own page**: the money tiles scroll to the ledger below, which matters on a phone where it is a long way down.
- The products **stock filter** gained **Low or out of stock**, because that is what "needs restocking" counts — with only *Low* and *Out* separately, a tile counting one product could open a list showing none.

## Dashboard
- Tiles: **Products**, **Stock value (cost)** (admins and anyone allowed to see cost), **Open bookings**, **Today's sales** and **This month's sales**.
- **Every tile opens the screen behind its number** — a › sits in its corner. Today's sales opens Sales on today, This month's sales opens Sales on the whole month, Open bookings opens the open bookings, and the other two open Products.
- Below the tiles: stock value (or units) by category, upcoming deliveries and recent stock activity.
- **There is no restocking list or out-of-stock tile.** Products answers that question properly: set the stock filter to **Out of stock** (or **Low stock**) and you get every one of them as a full card with its photo, locations and a Stock button, instead of the first ten names. The Stock screen keeps its own **Low & out of stock** list for the same reason.

## Sales screen
- The range picker at the top switches between **A day** and **A month**. Pick the date or the month beside it; the Bills tile says which period is on screen, and **Export Excel** exports whatever range is showing.

## Phone and dark mode
- The layout adapts below 820 px (bottom tab bar, stacked panels) and tightens again below 560 px: smaller buttons and headings, narrower gutters, filters two to a row, forms one field per row.
- **Tables become cards on a phone**, each cell labelled. That includes the tables inside dialogs — recording a purchase, correcting a bill, receiving stock into several places — which used to run off the side of the screen.
- **Settings → Appearance** switches between **Follow this device**, **Light** and **Dark**. The choice is kept **per device**, not in Firestore, so the showroom tablet can stay light while your phone goes dark at night, and nobody's choice changes anyone else's. A browser that refuses to store anything (a private window) still switches for that session; it just forgets on reload.
- **Left on "Follow this device", dark mode follows the phone's own setting.** The palette is declared for both schemes, so native date pickers and dropdowns are dark too and the browser does not try to invert the page itself.
- Links were never given a colour, so every browser used its own blue (and purple once visited), which is close to unreadable on a dark background. They now use a palette colour that reads clearly in both schemes.
- Every text colour was checked against its background: everything clears 4.5:1 in dark mode and in light, including small grey text and the amber used for warnings, both of which were marginally too light before.

## Which build am I running?
The bottom of the sidebar, under your name, shows `build 30 Oct 12:58` — the date and time that copy of `index.html` was built. If a change you were told about is missing, compare that stamp with the latest one: if it is older, the browser is still running a cached copy. A hard refresh (Ctrl+Shift+R, or Cmd+Shift+R on a Mac) fixes it; on a phone, close the app and reopen it. Nothing is lost either way — all the data lives in Firestore, not in the page.

## Notes
- Works offline for browsing and stock changes (syncs when back online). **Completing a sale needs an internet connection** so two staff can never sell the same last piece.
- Prices are treated as GST-inclusive (usual retail MRP); the receipt shows the GST portion.
- **Excel in, Excel out:** every import and export is .xlsx in the same layout — dark header row, frozen panes, filter arrows, Arial, rupee columns formatted, and a `photo` column with the product picture embedded wherever products are listed.
- **Vendor** replaces the old brand field (old data still reads fine; the import accepts a `brand` or `vendor` column).
- **Up to 8 photos per product.** The product form shows them as a strip: **⇪ Upload images** takes several files at once, **📷 Take photo** adds one more each time. The first is the **cover** — the one on cards, pickers, bills and barcode labels — and any other can be made the cover with its **★**, or removed with its **✕**. A card shows **📷 3** when there is more than one, and the product page shows the cover large with the rest underneath to click through.
  - Only the cover is fetched for the product list, so a catalogue of several hundred products loads exactly as fast as it did with one photo each. The extras are fetched only when you open that product.
  - Products photographed before this keep their photo as the cover, with nothing to migrate.
- **Images:** each product takes a photo three ways — **📷 Take photo** opens the device camera with a live preview and a Capture button (phone camera or laptop webcam; "Switch camera" appears when there is more than one), **⇪ Upload image** picks an existing file, or paste a link in `imageUrl`. Photos are resized before saving — **640 px for a capture, 480 px for an upload** — so a 12 MP phone photo lands at about 17 KB and a 108 MP one still comes out the same size; there is no file-size limit to worry about and nothing to shrink by hand. An image already smaller is left alone rather than blown up. A cut-out PNG with a transparent background gets a **white** background (JPEG has no transparency; it used to come out black). A file the browser cannot decode — a HEIC straight off an iPhone on some Android browsers, say — is refused with a message saying to save it as JPG or PNG first. Photos are stored in Firestore, so no paid Storage plan is needed. The camera needs an https:// address (GitHub Pages is https) and permission the first time; if it is blocked or missing, the panel says so and points to Upload image.
- **Templates:** the Import window can regenerate `Inventory_Import_Template.xlsx` from your current categories and lists at any time.
- **Updating:** push the new files to GitHub. Pages republishes the app by itself, and the workflow below republishes the rules, so there is nothing to paste by hand.

## Publishing automatically from GitHub
The repository publishes both halves of the app on its own once this is set up.

- **The app** — GitHub Pages rebuilds whenever `index.html` changes on `main`. Nothing to configure.
- **The database rules** — `.github/workflows/deploy-rules.yml` runs `firebase deploy --only firestore:rules` whenever `firestore.rules` changes on `main`, so the rules can never drift behind the app. It also runs on demand from the repo's **Actions** tab (*Publish Firestore rules* → *Run workflow*).

**One-time setup for the rules workflow:**
1. In the [Google Cloud console](https://console.cloud.google.com/iam-admin/serviceaccounts) for the project `store-inventory-5d228`, create a service account — call it something like `github-deploy-rules`.
2. Give it two roles: **Firebase Rules Admin** (to publish rules) and **Firebase Viewer** (so the CLI can see the project). Nothing more — this account must not be able to touch your data.
3. Create a **JSON key** for it and download the file.
4. In GitHub: **Settings → Secrets and variables → Actions → New repository secret**, name it exactly `FIREBASE_SERVICE_ACCOUNT`, and paste the entire contents of that JSON file.

Until that secret exists the workflow fails on purpose with a message pointing here, which is how you can tell it never published silently. Repository secrets are not exposed to forks or pull requests from other people, so a public repo is fine — but the key file itself is a password: keep it out of the repo, and delete the downloaded copy once it is pasted in. If the key is ever exposed, delete that key in the console and make a new one; nothing else needs changing.

`firebase.json` and `.firebaserc` in the repo just tell the CLI which file holds the rules and which project to send them to. `firebase.json` deliberately has no `hosting` section — hosting is GitHub Pages, not Firebase.

## Keeping devices up to date
- The app is a PWA: **Add to Home screen** in Chrome on Android, **Share → Add to Home Screen** in Safari on iPhone (it has to be Safari), or the install icon in the address bar on desktop. It then opens in its own window with no browser bar.
- **A new build arrives on its own.** Each deploy gets its own cache and the previous one is deleted when the new service worker activates, so a device cannot keep serving yesterday's files. The sidebar shows the build stamp of whatever that device is actually running.
- **If the app is left open when a build goes out**, it notices — it polls `version.txt` (which holds nothing but the stamp) when the screen is brought back to the front, when the connection returns, and every 20 minutes. A bar appears offering **Reload now** or **Later**; it never reloads by itself, because that would throw away a cart someone is in the middle of.
- `version.txt` is written by `build.py` alongside `index.html`. Keep them deployed together or the check silently does nothing.
- Checking via the service worker's own `reg.update()` does **not** work for this: it refetches the same `sw.js` URL, whose bytes do not change between builds, so it never sees a new one. That was the original bug — along with a cache version that was never wired up, so every build shared one cache called `inv-1` that was never cleared.

## Barcodes & labels
- Product form → **Generate** next to Barcode, or leave `barcode` blank in the Excel and use **Barcode labels → Generate missing barcodes** (admin) to fill every product at once.
- Codes are 13-digit EAN-13 numbers starting `200` (the range reserved for in-store use) from one shared counter, so two staff can never get the same code. Once a SKU has a barcode it is kept: the Generate button locks, a blank value can't overwrite it (also on Excel import), and duplicates are refused.
- **A barcode generated for a product you never save isn't thrown away.** It comes off a counter, so losing it would leave a permanent gap in the sequence; it is held instead and handed to the next new product that presses Generate. The **SKU** that Auto makes is a random code checked against the ones in use, off no counter at all, so an abandoned one costs nothing.
- **Products → Barcode labels** → *Print / Save as PDF* (a thermal label roll, or an A4 sheet of 24) or *Download list (Excel)* with sku, name, MRP, price and barcode.
- **The roll layout is drawn for a 2-inch, 203 dpi thermal label printer.** Pick the label size on the roll — 50 × 30 mm (the default), 50 × 25, 40 × 30, 40 × 20, 58 × 40, or type any other — and it is remembered on that device. Every label carries the **name, SKU (and size), barcode with its number, MRP and selling price**, one label per page with the page being the label. In the print dialog choose the label printer, the same paper size, margins *none*, scale *100%*.
- **Print a single product's label from its own page** — **Print label** on any product page (every login sees it). Tick what goes on the label — **Name, SKU, Barcode, MRP and Selling price start ticked**, plus **Size** when the product has one — pick the label size (**50 × 30 mm is selected every time**, or another preset, or type one) and the number of copies, and the preview redraws as you go. Untick the barcode and the words grow into the space; untick one price and the other is centred. A product with no barcode yet says so, and anyone who can edit products can generate one right there.
- **What a roll label looks like:** a space at the **top left for the brand logo** (left blank in print, outlined in the preview, until logos are added), the name and SKU beside it, the barcode, then the price row read left to right: **the MRP struck through, the discount under it, and the selling price large on the right** — e.g. *MRP ~~₹45,000~~ · 11% OFF · ₹39,999* — and underneath, in small type, **"GST & other charges extra as applicable"**. The discount is worked out from MRP and selling price and **rounded down**, so a label never claims more off than was given; with no discount there is one price, shown as the MRP. Type never drops below what a 203 dpi head prints legibly, however small the roll. Logo space, Discount % and GST note are their own boxes in the Print label dialog, ticked by default.
- **The preview in the dialog is the print itself**, enlarged, and shows the longest product name in the selection — the label most likely to break.
- **The barcode is sized in whole printer dots**, not stretched to fit: 203 dpi is 8 dots to the millimetre, and a bar that is not a whole number of dots prints with a ragged edge scanners trip on. It also stays inside the 48 mm the print head covers, with clear white either side. A vendor's own code that is too long for the chosen width is called out before you print, rather than after a roll is wasted.
- **Each label carries the MRP and the selling price** — MRP small on the left, the selling price large on the right, above the barcode, with the SKU and the size on the line above. That is on by default; untick *Show MRP and selling price* for a plain SKU-and-barcode label. You can also print one label per unit in stock.
- Any USB/Bluetooth barcode scanner works: scan in Sell (adds to the bill), Stock or the product search.

## Logos and brands
- **Settings → Store logos** (admin): upload the **Physical store logo** and the **Online store logo**. PNG, JPG or SVG; a logo on a white or clear background works best. Blank margins are trimmed so the mark fills its corner.
- **The label printer prints only black dots**, so each upload shows the logo *as printed* — every dot black or white — on a real 50 × 30 label, with a **Darkness** slider: slide right if thin or light parts disappear, left if it prints as a blob. The colour original is kept too, for bills and screens later.
- **Settings → Brands** (admin): add the brands your products are sold under, upload a logo for each, rename (every product using it follows), or delete (products using it are left without a brand). Anyone who can edit products can also add a brand from the product form's **＋**.
- **Each product has a Brand** field (its own field — the old "brand" column that meant the vendor is untouched). The Excel import reads a **brand** column, matching names already in the list and adding new ones; the export and the import template carry it too.
- **On labels**, the **Logo** menu offers **Store logo** (always the default), **Online store logo**, the **product's brand logo** when it has a brand, or **No logo**. The bulk Barcode labels dialog adds **Each product's brand logo** — the store logo for products without one. A logo not uploaded yet is said so in the dialog and its corner prints blank; a damaged one never stops a print.
- **Logos are drawn for the corner they fill, at the printer's 8 dots to the mm**, black or white per dot by the darkness chosen at upload, so the driver has nothing to grey out or speckle.
- Where they live: the `logos` collection in Firestore — `store`, `online` and `brand-<id>` — and the brand names in `brands`. Only an admin can change a logo; everyone signed in can print with them.

## Export
Products → Export gives an .xlsx with a **photo** column (pictures embedded, 220 px) plus all fields. Photos from image links are embedded only if the website allows it; the link always stays in `imageUrl`.

## Customers
- **A name and a phone number are required on every estimate, booking and bill** — all three refuse to save without both, and say so in the same words. The number has to be a real one (at least six digits), because it is what files the customer and what lets anyone find them again. It is asked for on the estimate printed straight off a cart too, since that sheet carries their name and number in print.
- Saved automatically whenever you bill or book; add or edit by hand from **Customers → + Add customer**.
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

## Two people working at once
- **The cart is private to the device.** It lives in that browser's memory, is never saved, and reserves nothing. Two staff can have the same sofa in their carts and neither knows.
- **The screen's stock check is advisory** — it reflects whatever that device last heard from the server. The real decision is made when you save, inside a database transaction that re-reads the product: **whoever saves first wins**, and the second is refused with a message naming the product. Proven for two sales of the last piece, a booking after it was sold, and two bookings of the same piece.
- **A sale checks *free* stock, not total stock.** Pieces reserved against a booking belong to that customer. (This was a bug: a bill already in a cart when someone else took a booking used to sell the reserved piece out from under it, leaving the booking holding stock that no longer existed.) Delivering a booking is unaffected — that path releases its own reservation first.
- **An open booking for the customer is flagged at the till.** Type the phone on the Sell screen and, if that customer has an open booking, a warning lists it with its items, amount and deposit. If anything on the booking is **also in the cart**, it is named in red with a **Deliver & bill** button — because billing it again charges the customer twice and strands their deposit on the open booking. The New booking screen shows the same warning, advising you to add to the existing booking instead of taking a second one.
- **Enquiries never touch stock**, so they never conflict with anything.
- With **Allow selling beyond available stock** on, all of these checks are bypassed — that is what the setting is for, but concurrent sales can then take you negative.

## Going back
- **Back returns to where you came from**, not to a fixed screen. Open a product from a half-built bill and Back puts you on the Sell screen with the cart intact; a chain such as customer → booking → product unwinds one step at a time.
- **The phone's own Back button does exactly the same thing** as the on-screen one. Installed as an app it used to close the app on the first press — because most screens changed without leaving a history entry behind, so Back popped straight past the app, cart and all. Every move forward now leaves an entry carrying a snapshot of the screen, and only the first screen's Back closes the app, the way any other app on the phone behaves.
- **Back closes what is open on top first.** A stock sheet, a payment box, the customer picker — one press closes it and leaves you on the screen underneath; the next press leaves the screen.
- **A link opened cold falls back to the matching list** rather than closing the app: open a shared `#product/...` link and the first Back puts you on Products.

## Adding products to a bill, booking or enquiry
- **You pick from the real Products page**, not a one-line list. Press **+ Add products** (or **Browse products** on an empty cart) and Products opens in shopping mode: every photo, category, size, location and vendor filter you normally have, with an **Add** button on each card. Add again and the button becomes a **− 1 +** stepper; cards already in the cart are outlined.
- **A bar pinned to the top** says which document you are filling — *Billing*, *Booking*, *Quoting* — with the running piece count and total, a **View bill / booking / estimate** button to go back to it, and **Stop adding**. Catalogue buttons (Add product, Import, Export, labels) are hidden while shopping, since that is not what you are doing.
- **Tapping a card still opens the product page**, and Back returns you to browsing with the cart intact — worth it for checking a photo or a size mid-sale.
- **Out of stock behaves differently by document**: it cannot be added to a bill or a booking (the button reads *None* and is disabled), but it can be added to an **enquiry**, which is exactly when a customer asks about something not on the floor.
- **The barcode box stays on the cart screen**, because a scanner is still the fastest way in at the till. Scanning a barcode or typing an exact SKU adds it straight away; a few letters matching one product adds that; anything matching several hands the text to Products so you can look properly.
- The cart screens are now the cart alone and run full width, so the lines, discounts and totals have room.

## The cart
- All three carts — **Sell**, **New booking** and **New enquiry** — are laid out like a shopping cart and built from one shared line, so they cannot drift apart.
- **A tick box leads every row**, before the product name, so the first thing you see on a line is whether it is on the bill. Above the items, **Select all** ticks or unticks the lot and shows a dash while only some are ticked; beside it, a count — *2 of 3 items on the bill*.
- **The product name on a cart line is a link** to its page, like everywhere else a product is named. With Back returning to where you came from, you can check a size or a photo mid-bill and come straight back to the cart with everything still ticked. A product deleted since is left as plain text.
- Under the name sit the quantity stepper, the per-item **Less** discount and **Remove**; on the Sell screen the *Take from* location picker follows. The money is right-aligned: when a line is discounted the original price is **struck through** above the amount, with *saved ₹x* under it.
- On a phone the controls stack one per line, which keeps every tap target full width.

## Taking an item off the bill without removing it
- Every line in the Sell cart and the New booking cart has an **On the bill** tick. Untick it and the line greys out, its amount is struck through and it drops straight out of the total — tick it again and it comes back. Nothing is lost while the customer makes up their mind, so you can price a bill three ways in front of them without retyping anything.
- An unticked line is **not billed, not reserved and not taken out of stock**: it is left out of the saved invoice or booking entirely. A note above the totals says how many lines are unticked, and **Complete sale** / **Confirm booking** is greyed out if nothing is ticked.
- The cart is still cleared completely once the sale or booking is saved — unticked lines are not carried over to the next customer.

## Part payment on a bill
- The Sell screen's **Payment** dropdown has **Received in parts…** beside it. That opens a row per mode — Cash ₹10,000, Bank transfer ₹20,000 — with **+ Another mode** to add more and **Paid in full, one mode** to go back. A line underneath says what has been received of the bill total and what is still pending as you type.
- **Anything left unpaid goes on the customer's ledger.** The bill charges the full amount, the receipts are what was paid, and the difference shows as pending against that customer. Later instalments are recorded as usual with **+ Record payment** on the customer page, and the balance clears to zero.
- A bill cannot be saved for **more than it is worth**, and a bill with something pending **requires a phone number** — otherwise there is nobody to collect from.
- Each receipt is kept with its own mode, so the invoice page, the A4 bill and the thermal slip all list them line by line and then the amount still pending. The Sales list tags a bill that still owes something.
- The quick path is unchanged: pick one mode and the whole total is treated as received, exactly as before. Bills saved before this existed are read the old way — the full total unless the mode was *Credit* — so no history changes.

## Opening a bill
Every invoice and every purchase bill has a page of its own, and an admin can correct either one.

**Customer invoice.** Tap the invoice number anywhere it appears — the Sales list, the customer's ledger, the booking page — and the whole bill opens: customer, payment mode, who billed it, every line with quantity, rate, GST and the location the goods came from, and the totals down to what is still pending. **Print bill** gives an A4 invoice; **Print receipt** is the narrow thermal slip as before.
- **Edit bill** (admin only) changes quantities, rates and per-item discounts, removes a line, adds another product, sets the bill-wide discount and the payment mode, and **corrects the bill date** — a sale entered on the wrong day otherwise sits in the wrong day's takings for good. Moving it rewrites the day and the timestamp together, so it appears under the right date on the Sales screen and in the ledger, and the change is written into the bill's own history as `dated 04 Nov → 29 Oct`. A future date, or one more than 400 days back, is refused. **Changing a quantity moves the stock by the difference** — bill one sofa instead of two and one sofa goes back on the shelf, into the same location it was taken from, with a line in the movement log.
- A bill raised by delivering a booking keeps its items — those belong to the booking — and only the **amount collected on delivery** and the payment mode can be corrected. The booking is updated in the same step, so the customer's ledger stays right.
- Every correction is stamped with who made it, when, and the reason you type, and is listed at the bottom of the bill.
- A manager or sales executive can open and print any bill but not change it; the **Ask admin** button is there for them.

**Purchase bill.** On the vendor's ledger, the purchase line is a link and there is an **Open bill** button. The page shows the vendor, bill number and date, every item with its rate, each charge head, the bill total, where the stock went and who entered it.
- **Edit bill** (admin only) reopens the same window you recorded it in, filled with what is already on the bill: items, quantities, rates, charge heads, bill number, date, note and location. Change anything and save.
- If the bill had put the pieces into stock, **the difference is applied to stock**: three sofas instead of two adds one more, two instead of three takes one back out, each with a movement-log entry. If the quantity being taken back out is no longer on the shelf, the app says so and saves nothing.
- You can still add a product that doesn't exist from inside a correction, exactly as when recording a new bill. A product created that way starts at **zero opening stock**, because the bill itself is about to add the pieces.
- **Print bill** gives an A4 copy of the purchase for your file.

## Enquiries and estimates
- **Enquiries → + New enquiry** records what a customer asked about before anything is promised. The cart is the same one as Sell and New booking: search or scan to add products, a quantity per line, a **Less** box in ₹ or % per line, an **On the bill** tick to take a line out of the total, and a discount on the whole estimate underneath. Numbers run ENQ-00001 upward.
- **Nothing here touches stock.** No reservation, no deduction, no movement-log entry. A product with zero stock can be put on an enquiry — that is usually why the customer is asking — and the cart says what is in stock beside each line as information, not as a limit. The enquiry page repeats it: the pieces stay on sale to anyone until a booking or a bill is made.
- Each one records **who asked** (name and phone both required), **where they came from** (walk-in, phone, WhatsApp, reference, Instagram, exhibition, other), a **follow-up date**, and a free-text note of what they wanted. The list counts open enquiries, how many are due for follow-up today or earlier, and how many were won; the dashboard has a tile for the same.
- **The customer goes into Customers** exactly as a sale or booking does — matched on the phone number, or created if new. Without a phone the enquiry is still saved, but there is nobody to add and nobody to follow up with, and the screen says so. A customer's own page gets an **Enquiries** card listing theirs, and a **New enquiry** button. Enquiries never appear in the ledger: an estimate is not money owed.
- **Make it a booking** / **Bill it now** carry the whole cart over — items, per-line discounts, the overall discount and the customer. Lines the shop cannot currently meet are **carried over unticked**, with a message naming them, because bookings and bills do enforce stock and would otherwise fail on save. When the booking or bill saves, the enquiry closes itself as **won** and records which number it became; the booking and the invoice carry the enquiry's id back.
- **Mark lost** asks for a reason and keeps it. **Reopen** puts a closed one back in play. Deleting one is admin-only (rules); recording and closing are open to all staff, since that is the job.
- **Export** gives an .xlsx with one sheet of enquiries and one of their lines, with embedded photos, the discount per line and what each item's free stock is now.

### The estimate print
- **Print estimate** produces a landscape A4 sheet in the layout furniture suppliers use: a bordered grid of **S.No · Image · Category · Description · Qty · Price per unit · Total price · Discount · Amount**, with the product's photo on every line, then footer rows for the total, item discounts, the discount (named with its percentage when it was given as one) and the net amount.
- **The money on each line shows its working**: the unit price, what that comes to for the quantity, what was taken off, and what is left. The customer can check the arithmetic across the row instead of being handed a net figure. The **A4 bill and the invoice page on screen** break the line down the same way.
- It carries the **store's name, address, phone and GSTIN, the customer's name and phone, and the date** — a bare price list with amounts on it gets taken for a bill, so it also says in print: *this is an estimate, not a tax invoice*, and whether anything is reserved against it.
- The same sheet prints from **three places**: an enquiry (saved or still being typed), the **Sell** cart and the **New booking** cart. From a booking it names the booking, says the pieces are reserved, and adds the received and balance rows.
- Photos are fetched before the print window opens, so none come out blank; a product with no photo prints "no photo" rather than an empty box.

## Bookings
- **Bookings → + New booking**: pick products like a bill, enter the customer's phone and name, the **booking amount received**, a **tentative delivery date** and any notes. Booking numbers run BK-00001 upward.
- **The booking amount records how it was paid**, which it never did before: a mode beside the amount, or **Received in parts…** for a row per mode — ₹5,000 cash and ₹3,000 UPI. The modes are kept with the booking and named in the customer's ledger. If an admin later changes the amount, the split is dropped rather than left claiming a breakdown that no longer adds up.
- Booked pieces stay in stock but are **reserved**: the product list shows "🔖 2 booked · 2 free", and Sell and New booking only allow what is free, so the same last piece can't be sold twice.
- **As many products as you like go in one booking** — keep searching and tapping; each one becomes its own line with its own quantity. Selling works the same way: the cart on the Sell screen holds any number of products and bills them together.
- **Discount in two places, on the Sell screen and here.** Each line has its own **Less** box in ₹ or %, and there is a discount on the whole bill or order underneath. The bill-wide one comes off what is left *after* the per-item ones, and it is spread across the lines in proportion to their value, so the GST figure stays right. The summary separates **Item discounts** from **Discount on the bill** so you can see which is which, and so does the invoice, the thermal slip, the A4 bill, the booking slip and the Excel export (a `line_discount` column per item and an `item_discounts` total).
- Correcting a discount afterwards is **admin-only** (Edit on the booking, Edit bill on an invoice) and recomputes the order value, GST and balance. The Edit bill window has a **Less** column so a per-item discount can be changed or removed, and refuses a discount bigger than the line is worth. A manager with *Change a saved booking* still edits only the booking amount, date and notes, and sees the discount as a read-only line.
- **Deliver & bill** asks how much is being collected now — the balance by default, **split across payment modes** the same way the Sell screen does, with **+ Another mode**. Stock comes down, the reservation clears, and anything left stays pending in the customer's ledger. Taking more than the balance is refused.
- **An admin also gets, at the door:** an **extra discount**, which moves the order value itself so the booking, the invoice and the ledger all agree rather than the ledger continuing to charge the old figure; and the **bill date**, pre-filled with today. A discount larger than what is still owed is refused — that would mean refunding money already taken, which is a cancellation, not a discount.
- **Dates are never editable for anyone but an admin.** A manager or sales executive delivering a booking sees the payment rows and nothing else; the bill is dated today.
- **Payments**: a customer can pay in as many instalments as they like. Use **+ Record payment** on the booking or the customer page — each one keeps its own date, mode and reference, and shows as a separate line in the ledger. Only an admin can remove one.
- **Cancel booking** releases the reserved stock and asks what happens to whatever has already been received, which the ledger then reflects:
  - **Keep it as credit with the shop** — the amount stays on the customer's account against a future order. This is what the app always did, and it stays the default.
  - **Refunded to the customer** — a refund line is recorded and the balance settles to zero. Handing over the cash or making the transfer is separate; the app records it, it does not pay it.
  - **Kept by the shop as a cancellation charge** — a charge for that amount is recorded, so the money counts as the shop's and the balance settles to zero.
  The choice, the amount and any note show on the booking page and in the ledger line, and nothing is shown as "due" on a cancelled booking any more.
- **Settling it later**: a booking already cancelled — including ones cancelled before this existed — shows **Settle the ₹X received** on its page for an admin, with the same three outcomes. The amount is worked out from the advance and the payments against it, so older cancellations are handled correctly without any data fixing.

## An admin can correct the ledger
A customer's ledger is built from bookings, invoices and payments, so most corrections are made on the thing itself — the bill, the booking, the payment. For everything else an admin has two tools on the customer's page:
- **+ Adjustment** adds a line in either direction: *credits the customer* (reduces what they owe — a refund paid, a discount given, a small balance written off) or *charges the customer* (increases it — a missed charge, a delivery fee, a retained deposit). The dialog shows what the balance will become before you save, and a **reason is required** — it prints on the statement and is the only record of why the ledger moved.
- **Edit** beside any payment or adjustment in the ledger corrects its amount, date, mode or note in place. The line then carries "corrected by <name>" alongside who entered it. **Remove** still deletes one outright.
Both are admin-only, on screen and in the database rules. A manager or sales executive uses **Ask admin** as before. Adjustments are never tied to a booking, so they move the customer's balance without disturbing any booking's own figures. **Print slip** gives the customer a booking slip with the balance and delivery date.
- Edit lets you update the booking amount, delivery date and notes as things change.
- The **bookings list reads like the slip**: every item with its SKU, sub-category and type, and `2 × ₹52,900.00 = ₹1,05,800.00`, beside a column showing items value, discount, order value, received and due. Bookings with more than four items list the first four and count the rest.
- Dashboard shows open bookings, advance held and upcoming deliveries; overdue dates turn red.

## Vendors
A module of its own (sidebar → **Vendors**), open to admins and to anyone you tick *Add, edit and delete vendors* for.
- Each vendor keeps: name, **contact person and phone**, an optional **second contact and phone**, a **category**, GSTIN, address, city, email, bank or UPI details, a **standing note** and an active/inactive flag.
- **Billing method and credit period are switched off** — the fields are gone from the vendor form, the vendor list, the vendor page, the purchase window, the printed statement, the export and the Settings list. Anything already saved on a vendor is kept. To bring them back, find `const SHOW_BILLING=false;` near the top of the script in `index.html` and change it to `true`.
- **Category** (Furniture, Furnishing, Tableware, Decor, Plants and Planters…) is an editable list like locations — Settings → Dropdown lists → *Vendor categories*, or the **＋** beside the field adds one on the spot. The vendor list has a category column, an **All categories** filter, and the search box matches the category too.
- **Notes**: besides the standing note, **+ Add note** keeps a dated log per vendor — price revisions, delivery habits, disputes — each stamped with the date and who wrote it.
- The vendor's page shows how many products come from them, units in stock, stock value at cost and retail, how many need restocking, and the product list itself.
- **In the product form the vendor is now a dropdown** fed by this list, with a **＋** that adds one without losing the product you were typing: the vendor form opens over the product form, and saving it brings the product form straight back with the new vendor picked and every field — photos included — exactly as you left it. Cancelling the vendor form closes both, as it did. Vendor names typed in before (or imported) still work: the Vendors screen lists them as "used on products but not in this list" with one-tap buttons to adopt them, which links every product carrying that name. Renaming a vendor updates its products too.
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
- On the **Sell and New booking pickers** each line reads SKU · size · **the deepest two levels of the category path** — `SOF-1001 · 📐 72x36 inch · Sofas, 3 Seater Sofas` when a type is set, `DIN-31303 · Dining Room, Dining Chairs` when there is none, and the category alone if that is all a product has. So a 3 seater is told from a 2 seater without opening the product.
- **Saved documents name it too.** The sub-category and type appear under each item on a booking, an invoice and a purchase bill — on screen, on the printed booking slip, on the thermal receipt and on the A4 bill — and on each cart line while selling or booking. They are looked up from the product at the time of printing, so a product renamed or recategorised later reads correctly; one deleted since simply shows nothing extra.
  - If a line shows only two broad levels, the product has **no type saved**. Set it in the product form's **Type** dropdown, or fill the `type` column in the import template. Note that not every sub-category has types in the taxonomy — *Dining Chairs*, for one, has none, so its line is as specific as it can be.
- **One spelling, whatever you type.** `16X16`, `16 x 16`, `16 X 16`, `16×16` and `16*16` are all stored and shown as `16x16`. The box tidies itself as soon as you leave it, the Excel import does the same, and sizes saved before this read back tidy as well — so the **All sizes** dropdown lists each size once instead of four near-identical entries. The rule only applies between two numbers, so a name like "Box X Large" is left alone, and `16.5 X 20` and `72 X 36 X 30` work as you would expect.
- **Searching**: a search is tidied the same way, so typing `16 X 16` finds a product saved as `16x16` and the other way round. An **All sizes** dropdown lists the sizes present in whatever category you are browsing — pick Furnishings and you get furnishing sizes. Changing category clears a size that no longer applies.
- Barcode labels print the size under the SKU, and it appears in the products, barcode-list and sale-items exports.

## Product form defaults and the reorder field
- A new product starts with **GST 0%** and **opening stock 1**; change either as you type. Editing an existing product leaves its saved values alone.
- **Reorder level is switched off.** The field is hidden in the product form, new products save a level of 0, and the *low stock* (amber) state is off for every product while the switch is off — so a card is green when it has stock and red only when it is empty. Levels already saved on older products are kept untouched and come back into use the moment the switch is turned on.
- To bring it back: in `index.html` find `const SHOW_REORDER=false;` near the top of the script and change it to `true`. The field, the "reorder at N" notes and the Reorder level row on the product page all return.
- Stock is written with its unit everywhere it is shown: **1 pc**, **6 pcs**, **1 set**, **1 pair**. A unit the app doesn't recognise is printed exactly as you typed it.
