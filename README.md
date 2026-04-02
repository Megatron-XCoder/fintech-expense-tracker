# FinTrack : Fintech Expense & Analytics Tracker

FinTrack is a robust, production-ready SaaS application designed to seamlessly parse, process, and analyze financial banking statements natively (specifically optimized for SBI statements). Built on the MERN stack with highly optimized backend bulk processors and a stunning dark-theme dynamic dashboard.

---

## 🏗️ Architecture Stack
- **Frontend**: React.js, Vite, Tailwind CSS v4, Lucide Icons, React-ChartJS-2 (Doughnut), Recharts (Bar), Zustand (State)
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Mongoose ORM)
- **Authentication**: JSON Web Tokens (JWT) & bcrypt.js
- **Parsing Engine**: `csv-parse` & `xlsx` (custom Regex algorithms for P2P routing)
- **Testing**: Jest & Supertest

---

## ⚙️ Project Setup & Installation

### Requirements
- Node.js (v18+ recommended)
- MongoDB running locally (`localhost:27017`) or a MongoDB Atlas URI

### 1. Clone & Install Dependencies
The repository utilizes a root-level `package.json` utilizing `concurrently` to run both the Client and Server cleanly. First, install the root dependencies:
```bash
git clone <your-repository-url>
cd Fintech-Expense-tool

# Install root manager dependencies
npm install

# Install Server dependencies
cd server
npm install

# Install Client dependencies
cd ../client
npm install
```

### 2. Environment Configuration
Navigate to the `server/` directory and ensure a `.env` file exists with the following mandatory parameters:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/expense-tracker
JWT_SECRET=supersecretkey_change_in_production_123
```

*(Note: The client requires no environment variables as it natively proxies API requests through Vite on localhost:5173 to localhost:5000).*

---

## 🚀 Running the Application

This repository is optimized for a one-click concurrent startup. Ensure your MongoDB instance is running locally.

Navigate to the **root** project directory (`/Fintech-Expense-tool`) and run:
```bash
npm run dev
```

This launches:
- **Express Backend**: Listening on `http://localhost:5000`
- **Vite React Frontend**: Accessible at `http://localhost:5173`

*(Alternatively, you can run them in separate terminals using `npm run dev` inside both the `/client` and `/server` folders natively).*

---

## 🧪 Running Automated Tests

FinTrack includes a hardened Node testing suite written in **Jest** covering core edge-cases (like Corrupt CSV handling, Bank newline string correction, and Smart P2P detection exclusions).

To execute the test suite:
1. Navigate to the server folder: `cd server`
2. Run the Jest testing executor:
```bash
npm run test
```
*Or natively via npx:*
```bash
npx jest
```

---

## 📌 Notable Features
- **Extremely Fast Bulking Processing**: The Excel/CSV parser leverages MongoDB's `insertMany({ ordered: false })` functionality to bulk insert statements whilst gracefully mapping and dropping duplicates silently, providing immense speed boosts over conventional sequential indexing loops.
- **Smart P2P Identification Engine**: Natively protects your "Investment Ratios" by algorithmically distinguishing standard Person-to-Person (P2P) transfers out of the 'Transfer & Investments' pools.
- **Dynamic Charting**: Analyzes Monthly Spending vs Income streams and isolated pure-Expense Category breakdowns without performance dips over dense ledgers.
