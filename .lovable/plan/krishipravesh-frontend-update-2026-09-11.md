# KrishiPravesh frontend update

## What will change
- Import the supplied frontend project into the current workspace without its backend/service integrations being altered.
- Rename visible SmartMandi branding and page metadata to **KrishiPravesh**.
- Add persistent light/dark controls to the shared farmer and authority navigation.
- Add an English/Hindi language selector and translate the shared navigation plus Authority dashboard interface.
- Finish the Authority experience as a responsive operations dashboard with summary metrics, arrivals chart, queue preview, centre status, and working navigation.

## Technical details
- Keep the existing warm agriculture design system and extend its semantic light/dark tokens.
- Store theme and language preferences in the browser only; no database, authentication, or external integrations.
- Reuse the existing TanStack routes, shared shell, UI kit, demo data, and charts.
- Remove or avoid Authority links that point to unfinished pages unless matching frontend screens already exist.
- Add unique KrishiPravesh metadata to the Authority page and verify desktop/mobile rendering and controls in the preview.

## Assumptions
- Language choices are English and Hindi.
- Existing demo data remains the source for the Authority interface.
