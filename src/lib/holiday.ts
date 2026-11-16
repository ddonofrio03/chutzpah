/*
  One switch for the holiday menu, set in src/data/holiday.json:
    "active": "<menu id>" turns it on everywhere (nav, home page banner, menu page tab).
    "active": null turns it off everywhere.
    "showUntil": "YYYY-MM-DD" hides it automatically after that day (New York time),
    even if nobody remembers to flip the switch.
*/
import holiday from '../data/holiday.json';

export type HolidayMenu = (typeof holiday.menus)[number];

export const activeHoliday: HolidayMenu | null = holiday.active
  ? (holiday.menus.find((m) => m.id === holiday.active) ?? null)
  : null;

/** Date after which holiday banners hide themselves, or '' for no end date. */
export const holidayUntil: string = activeHoliday && holiday.showUntil ? holiday.showUntil : '';

// Fail the build loudly if "active" points at a menu that doesn't exist (usually a typo).
if (holiday.active && !activeHoliday) {
  throw new Error(`holiday.json: "active" is "${holiday.active}" but no menu has that id.`);
}
