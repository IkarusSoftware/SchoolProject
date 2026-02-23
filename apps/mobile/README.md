# EduSync Mobile (Expo)

This app is currently in Phase 3.1 foundation mode:

- Parent-first visual flow
- Mock data (no backend integration yet)
- Bottom-tab navigation
- Reusable theme and UI components

## Local Run

From repository root:

```bash
npm install
cd apps/mobile
npx expo start
```

Then open:

- `a` for Android emulator
- `w` for web
- or scan QR from Expo Go

## Structure

- `App.tsx`: app entry
- `src/navigation`: app navigator + parent tabs
- `src/features/parent/screens`: parent screens
- `src/components`: shared UI/layout blocks
- `src/theme`: design tokens
- `src/data`: mock datasets

