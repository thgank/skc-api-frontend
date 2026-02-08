# SKC Procurement — Frontend Showcase

Interactive frontend for the **SKC Purchase Requisition API** (Spring Boot backend).  
Demonstrates business rules, validations, and optimistic locking visually.

## Tech Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Ant Design 5** (enterprise UI kit)
- **dayjs** (date handling)

## Quick Start

```bash
# 1. Start the backend (port 8080)
cd ../skc-api
./gradlew bootRun

# 2. Install & run the frontend (port 3000)
cd ../skc-frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Environment

| Variable | Default | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_API_URL` | `https://skc-api-production.up.railway.app/api/v1` | Backend API base URL |

Auth credentials: `admin` / `admin` (HTTP Basic, hardcoded for demo).

## Pages

| Route | Purpose |
|-------|---------|
| `/` | Dashboard — status cards, business rules, quick actions |
| `/requisitions` | List — filterable table of all requisitions |
| `/requisitions/[id]` | Detail — summary, items CRUD, concurrency demo |

## Business Rules Demonstrated

- ✅ DRAFT-only editing (read-only for other statuses)
- ✅ Cannot delete the last item
- ✅ Delivery date ≥ today + 3 days
- ✅ No duplicate nomenclature codes
- ✅ Optimistic locking (409 Conflict)
- ✅ Structured backend error display
- ✅ Reactivate CANCELLED → DRAFT
