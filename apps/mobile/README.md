# EduSync Mobile (Expo)

Current mobile scope:

- Auth flow with login, token persistence and refresh
- Role-based navigation (`Login` -> `ParentTabs` or `TeacherTabs`)
- Parent module in premium mock mode (fully interactive demo UI)
- Parent micro-interactions (card enter motion, press feedback, toast confirmations)
- Teacher module connected to real API (dashboard, roll call, messages)
- Shared loading/error/empty states and pull-to-refresh helpers
- Dynamic API host resolution for emulator + physical device

## Design System

- Premium palette with deep blue + soft cyan surfaces
- Custom typography:
  - `Sora` for display hierarchy
  - `Manrope` for body and controls
- Motion refinements:
  - Card enter animation
  - Button press feedback
  - Toast confirmations

## Run

From repo root:

```bash
npm install
```

Start API (root):

```bash
npm run dev:api
```

Start mobile app (root, Expo):

```bash
npm run dev:mobile
```

If Metro asks to use another port (for example `8083`), accept it. This does not break API calls.

## API Base URL

Set this env var before running Expo:

```bash
EXPO_PUBLIC_API_BASE_URL=http://YOUR_LOCAL_IP:4000/api/v1
```

Defaults used if env var is missing:

- Android emulator: `http://10.0.2.2:4000/api/v1`
- iOS simulator / web: `http://localhost:4000/api/v1`

For physical device, use your machine LAN IP (for example `http://192.168.1.20:4000/api/v1`).
If env var is not set, app will try to auto-detect Metro host IP and call `http://<metro-host>:4000/api/v1`.

## Parent Demo Mode

Parent screens are intentionally mock-driven right now:

- Dashboard
- Attendance
- Announcements
- Meals
- Messages

All buttons are interactive and update local mock state (read/unread, pin, filters, thread send).
This gives fast visual/product testing without waiting for backend parity.

## Physical Device Troubleshooting

If login returns `Network request failed`:

1. Phone and computer must be on same Wi-Fi.
2. API must be running on `0.0.0.0:4000`:
   - `npm run dev:api`
3. Confirm from phone browser:
   - `http://<YOUR_PC_IP>:4000/health`
4. Restart Expo with cache clean:
   - `npm run dev:mobile -- --clear`
5. If Windows Firewall blocks inbound requests, allow Node.js / port `4000`.

## Demo Login

- Email: `veli@demo-okulu.com`
- Password: `Demo1234!`
- Email: `ogretmen@demo-okulu.com`
- Password: `Demo1234!`

## Teacher API Endpoints Used in UI

- `POST /auth/login`
- `POST /auth/refresh`
- `GET /auth/me`
- `POST /auth/logout`
- `GET /attendance?page=1&pageSize=30&date=YYYY-MM-DD`
- `GET /attendance?page=1&pageSize=200&date=YYYY-MM-DD`
- `POST /attendance`
- `GET /students?page=1&pageSize=50`
- `GET /messages/conversations`
- `GET /messages/conversations/:id/messages?page=1&pageSize=20`
- `POST /messages/conversations/:id/messages`
