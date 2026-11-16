# Chutzpah Deli website

The website for Chutzpah Deli, a REAL New York deli at 12214 Fairfax Towne Center, Fairfax VA.

It's a fast static site built with [Astro](https://astro.build). There is no database and no WordPress. Everything the deli changes day to day lives in a few plain text files in `src/data/`, so updating the menu or hours means editing one line.

## Everyday updates

You can make all of these right on github.com: open the file, click the pencil icon, change the text, and click **Commit changes**. Vercel rebuilds the live site in about a minute.

| To change | Edit this file | What to look for |
| --- | --- | --- |
| Today's special (the letterboard on the home page) | **Use the update page:** `/update/` on your phone | Type the special, enter the PIN, tap Post. Live in about a minute. `"special"` in `src/data/site.json` is only the fallback if nothing has been posted. |
| Hours | `src/data/site.json` | `"hours"`. Times are 24-hour (`"20:00"` is 8 p.m.). The "Open now" label, the footer and Google all update from this. |
| Announcement ("DINNER IS BACK!") | `src/data/site.json` | `"announcement"` |
| Phone, address, order link, job form link | `src/data/site.json` | Near the top |
| Menu items and prices | `src/data/menu.json` | Find the item by name and change its `"price"` |
| By The Pound | `src/data/by-the-pound.json` | Same as the menu |
| Catering menu and policies | `src/data/catering.json` | Same as the menu |
| Holiday menus | `src/data/holiday.json` | See **Holiday menus** below |
| Passover order form | `src/data/passover-order.json` | Items, prices, and `"show"` |
| Gallery captions | `src/data/gallery.json` | Photos are in `src/assets/gallery/` |
| Catering-by-occasion pages | `src/content/catering/*.md` | Plain text. The file name is the web address. |

## Holiday menus (Rosh Hashanah, Break Fast, Passover)

One switch in `src/data/holiday.json` controls everything:

```json
"active": "rosh-hashanah-2026",
"showUntil": "2026-09-11",
```

- **To turn it on:** set `"active"` to the menu's `id`. This adds a "Rosh Hashanah Menu" link to the top menu bar, a banner on the home page, a tab on the menu page, and the full menu at `/holidaymenu/`.
- **To take it down:** set `"active"` back to `null`. Or set a `"showUntil"` date when you turn it on, and everything hides itself the day after, even if nobody remembers.
- When nothing is on, `/holidaymenu/` shows a short "between holidays" note pointing to catering, so old links never land on a stale menu.

**A new holiday each year:** copy last year's block in `"menus"`, change the `id` (for example `rosh-hashanah-2027`), and update the title, order dates and prices. Each menu has a `name` (used in the link and banner), a one-line `homeBlurb` for the home page, and `dates` for the order deadline and pickup.

**No time to type it in?** Put the menu image in `public/files/`, set `"image": "/files/rosh-hashanah-2027.jpg"` (or `"pdf"` for a PDF), and leave `sections` empty. The page shows the image instead.

`"orderForm"` links the banner's order button to an online form (the Passover menu uses `/passover-order/`). Leave it `null` and the button calls the store.

### Menu item format

```json
{ "name": "Egg & Cheese", "description": "Served on a bagel", "price": "$7.00" }
```

Items with more than one size use `options` instead of `price`:

```json
{ "name": "Chicken Soup", "options": [
  { "label": "Cup", "price": "$7.50" },
  { "label": "Bowl", "price": "$9.50" }
] }
```

`"marks": ["*"]` adds the raw or undercooked asterisk. `"marks": ["**"]` adds the cold smoked asterisk.

## Posting the daily special

Bookmark `/update/` on your phone (or add it to your home screen). Pick which special it is, type the name, description and price, enter the PIN and tap **Post to website**. The letterboard on the home page changes within about a minute. **Take the special down** hides the letterboard until you post again.

The PIN is stored in Vercel under Project › Settings › Environment Variables › `UPDATE_PIN`. To change it, edit that value and redeploy. The special itself is saved in the project's Vercel Blob storage (`chutzpah-specials`), not in the code.

## Forms

- **Contact and Passover order forms** email `eric@chutzpahdeli.com` through [FormSubmit](https://formsubmit.co), the same service the old site used. FormSubmit sends a one-time confirmation email to that address the first time each form is used, and Eric has to click it.
- **Newsletter** signups go straight to the deli's existing Mailchimp list.
- **Online ordering** links to Lingaros.

## Old links

Old WordPress addresses keep working. Pages like `/our-menu/`, `/btp/`, `/catering/` and the catering-by-occasion pages have the same URLs as before. `/breakfast/`, `/more-stuff/`, `/beverage-dessert/` and `/menu/` redirect to where that content lives now (see `astro.config.mjs`).

## For developers

```bash
npm install
npm run dev      # local preview at http://localhost:4321
npm run build    # production build into dist/
```

- Fonts: Bungee (signage headlines) and Libre Franklin (everything else), self-hosted through Fontsource.
- Photos in `src/assets/` are resized and converted to WebP automatically at build time.
- Design tokens (colors, fonts) are at the top of `src/styles/global.css`.
