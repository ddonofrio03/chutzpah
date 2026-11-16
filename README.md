# Chutzpah Deli website

The website for Chutzpah Deli, a REAL New York deli at 12214 Fairfax Towne Center, Fairfax VA.

It's a fast static site built with [Astro](https://astro.build). There is no database and no WordPress. Everything the deli changes day to day lives in a few plain text files in `src/data/`, so updating the menu or hours means editing one line.

## Everyday updates

You can make all of these right on github.com: open the file, click the pencil icon, change the text, and click **Commit changes**. Vercel rebuilds the live site in about a minute.

| To change | Edit this file | What to look for |
| --- | --- | --- |
| Today's special (the letterboard on the home page) | `src/data/site.json` | `"special"`. Set `"show": false` to hide it. |
| Hours | `src/data/site.json` | `"hours"`. Times are 24-hour (`"20:00"` is 8 p.m.). The "Open now" label, the footer and Google all update from this. |
| Announcement ("DINNER IS BACK!") | `src/data/site.json` | `"announcement"` |
| Phone, address, order link, job form link | `src/data/site.json` | Near the top |
| Menu items and prices | `src/data/menu.json` | Find the item by name and change its `"price"` |
| By The Pound | `src/data/by-the-pound.json` | Same as the menu |
| Catering menu and policies | `src/data/catering.json` | Same as the menu |
| Holiday menus | `src/data/holiday.json` | `"current"` picks which menu shows first |
| Passover order form | `src/data/passover-order.json` | Items, prices, and `"show"` |
| Gallery captions | `src/data/gallery.json` | Photos are in `src/assets/gallery/` |
| Catering-by-occasion pages | `src/content/catering/*.md` | Plain text. The file name is the web address. |

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
