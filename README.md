<div align="center">
  <br />
  <h1>✧ Al-Attar | Digital Flagship ✧</h1>
  <p>
    <strong>A luxurious, high-performance e-commerce experience for premium fragrances.</strong>
  </p>
  <p>
    <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
    <img src="https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E" alt="Vite" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
    <img src="https://img.shields.io/badge/Supabase-181818?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase" />
    <img src="https://img.shields.io/badge/Framer_Motion-black?style=for-the-badge&logo=framer&logoColor=blue" alt="Framer Motion" />
  </p>
</div>

---

## ⚜️ About The Project

**Al-Attar Digital Flagship** is a meticulously crafted web application designed to reflect the elegance and sophistication of high-end perfumery. Built with modern web technologies, it features a fluid, animated user interface on the frontend and a powerful, fully-integrated real-time backend powered by Supabase.

Every detail, from the instant-loading hero section to the smooth scroll mechanics, has been optimized to ensure the user feels the luxury of the brand before they even smell the fragrance.

---

## ✨ Key Features

### 🛒 Client-Facing Storefront
- **Premium UI/UX:** Dark-themed, editorial-style layout using custom Tailwind CSS configurations and glassmorphism.
- **Silky Smooth Animations:** Hardware-accelerated transitions, parallax scroll effects, and seamless page routing using Framer Motion and Lenis.
- **Dynamic Catalog:** Real-time fetching of featured scents and products directly from the database.
- **Optimized Performance:** Instant image preloading, throttled event listeners, and strict render optimizations.
- **Cart & Checkout:** Seamless drawer-based cart management.

### 🎛️ Secure Admin Dashboard (`/admin`)
- **Complete CRUD:** Create, read, update, and delete products directly from a bespoke dark-mode UI.
- **Inventory Management:** Real-time stock tracking that automatically updates storefront availability and disables purchases for out-of-stock items.
- **Media Uploads:** Direct integration with Supabase Storage buckets for handling product imagery.
- **Order Tracking:** Clean overview of customer orders and statuses.
- **Detailed Fragrance Profiling:** Manage specific bespoke attributes like *Notes*, *Intensity*, and *Occasion*.

---

## 🛠️ Tech Stack

- **Frontend Framework:** [React 18](https://reactjs.org/) + [Vite](https://vitejs.dev/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Animations:** [Framer Motion](https://www.framer.com/motion/) & [Lenis](https://lenis.studiofreight.com/) (Smooth Scrolling)
- **Routing:** [React Router v6](https://reactrouter.com/)
- **Backend & Database:** [Supabase](https://supabase.com/) (PostgreSQL, Storage Buckets, Row Level Security)
- **Icons:** [Lucide React](https://lucide.dev/)

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm or yarn
- A Supabase project and account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/al-attar-digital-flagship.git
   cd al-attar-digital-flagship
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory and add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Database Setup**
   Execute the SQL schemas found in the `/supabase` folder (`products.sql` and `orders.sql`) in your Supabase SQL Editor. This will set up the required tables and Row Level Security (RLS) policies.

5. **Run the development server**
   ```bash
   npm run dev
   ```

---

## 📂 Project Structure

```text
al-attar-digital-flagship/
├── public/            # Static assets and preloaded hero images
├── src/
│   ├── components/    # Reusable UI components (Navbar, CartDrawer, etc.)
│   ├── lib/           # Utility functions and Supabase client setup
│   ├── pages/         # Route pages (Home, Shop, Admin, Contact, etc.)
│   ├── App.tsx        # Main application entry point and router
│   └── index.css      # Global styles and custom Tailwind variables
├── supabase/          # Database schemas and SQL initialization queries
└── index.html         # HTML template with asset preloading optimizations
```

---

## 👨‍💻 Author

**Made by Armin Selimovic**

*Crafting digital experiences with a strict focus on performance, premium design, and usability.*
