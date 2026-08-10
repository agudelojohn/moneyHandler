

# moneyhandler

Next.js 16 (App Router) + TypeScript (strict) + MUI v9 + Tailwind v4, backed by AWS DynamoDB. The codebase is in Spanish (code comments, test names, git history) — keep it that way.

## Commands

- `npm run dev` — dev server, binds `0.0.0.0`; `next.config.ts` auto-adds LAN IPv4 addresses to `allowedDevOrigins` (required for mobile/iOS clicks).
- `npm run lint` — ESLint (flat config, `eslint.config.mjs`).
- `npx tsc --noEmit` — typecheck (no npm script exists).
- `npx vitest run <path>` — one test file; `npm run test:run` for all; `npm test` for watch mode.
- `.env` is gitignored but **required**: `lib/config/env.ts` zod-parses `process.env` at module load, so missing vars crash dev/build. Contains real AWS credentials for DynamoDB.

## Testing

- vitest + jsdom + Testing Library. Wrap renders in `renderWithProviders` from `test/test-utils.tsx` (adds MUI + i18n + user-session providers).
- `test/setup.tsx` globally mocks `next/link`, `ResizeObserver`, `matchMedia`. Tests mock `fetch` and `next/navigation`; they never hit real DynamoDB.
- Add a test file alongside the code with `page.test.tsx` / `Component.test.tsx` naming (vitest `include` is `**/*.{test,spec}.{ts,tsx}`).

## Data layer (single-table DynamoDB, us-east-1)

- Prod table `ExpensesApp_db`, dev table `ExpensesApp_db_dev`; selected by `NEXT_PUBLIC_APP_ENV` in `lib/aws/dynamo.ts`.
- Records are keyed by composite `PK`/`SK` strings built in each API route (`app/api/*/route.ts`):
  - Expenses: `USER#<userId>#<year>` / `EXPENSE#<iso>` (item has `type: "EXPENSE"`).
  - Management: `MANAGEMENT#<userId>#<year>` / `<DEV#>ADDITION#<categoryId>#<iso>` — note the `DEV#` SK prefix when not in production.
  - Categories: `CATEGORY#<userId>` / `CATEGORY#<id>`, soft-deleted via `status` (`lib/aws/categories.ts`).
- "Auth" is a hardcoded `x-user-id` header validated against `APP_USER_PROFILES` in `app/common/userProfiles.ts` (two users: alejo/clau). Every API route must call `getUserIdFromRequest`; every client fetch uses `withUserIdHeader` from `app/common/userSession.tsx`.
- Default category ids = canonical name in UPPERCASE. Legacy expense items store the category name in `category` (no `categoryId`); GET `/api/expenses` filters compatibly. Category logic lives in `lib/aws/categories.ts` and validates category ids on write.

## Dates: always use the helpers, never raw `new Date(...)`

Calendar days are persisted as UTC ISO but displayed in device-local time. Use `app/common/utils/dateHelpers.ts` (`localCalendarDayToUtcIso`, `utcIsoToLocalCalendarDay`, `parseUtcIsoDate`, `getDateFromDateString`, `isValidDateRangeOrder`, `getInclusiveDaysBetween`, ...). API routes use the deprecated alias `parseDatePreservingCalendarDay` in `app/api/common/utils.ts`. Date/range math, year bucketing for PKs, and SK ordering all depend on this — do not hand-roll it.

## UI conventions

- **i18n**: every user-visible string (labels, placeholders, aria/title, errors, empty states) must go through i18n. Add the key to `TranslationSchema` and to **both** `es` and `en` in `app/i18n/translations.ts`, then consume via `const { t } = useI18n()` → `t.section.key`. No hardcoded user-facing literals in JSX.
- **MUI styles**: define styles in a module-level `styles.ts` exported as `XxxSx` constants, used as `sx={Sx.xxx}` with `import * as Sx`. Pull color tokens from `COLORS` in `app/theme.ts`. No substantive inline `sx={{...}}` objects in TSX (extract them when touching existing code).
