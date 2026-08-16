CodTech Intern ID : CITS6692

# Folio

Folio is a modern, full-stack blogging platform built for writers. It features a clean, reading-focused UI, role-based authoring tools, and robust security.

## 🚀 Tech Stack

**Frontend:**
* React (via Vite)
* React Router v6
* Tailwind CSS
* React-Quill (Rich Text Editor)
* Axios (Configured for cross-origin credentials)

**Backend:**
* Node.js & Express.js
* MongoDB (Mongoose)
* JSON Web Tokens (JWT) for authentication
* Zod (Schema validation)
* Multer & Cloudinary (Image uploads)

## ✨ Features

* **Role-Based Access Control:** Distinct roles for readers and authors ensure that only authorized users can create, edit, or publish posts.
* **Secure Authentication:** Utilizes HTTP-only, strictly-typed JWT cookies to prevent XSS and CSRF attacks[cite: 42].
* **Content Management:** Authors can save posts as private drafts or publish them publicly, with the server automatically calculating reading time based on 200 words per minute[cite: 40].
* **Interactive Reading Experience:** Users can engage with content by leaving nested comments or liking posts (featuring optimistic UI updates). Comments are fetched optimally via a compound MongoDB index[cite: 46].
* **Media Management:** Direct integration with Cloudinary for seamless cover image and avatar uploads, strictly limited to 5MB and safe image formats (JPEG, PNG, WEBP)[cite: 44].
* **Robust Validation:** End-to-end data validation using Zod ensures database integrity.

## 🛠️ Prerequisites

Before you begin, ensure you have the following installed:
* Node.js (v16 or higher)
* MongoDB (Local instance or MongoDB Atlas)
* A Cloudinary account (for image hosting)

## ⚙️ Environment Variables

Create a `.env` file in the `backend/` directory and configure the following variables:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGO_URI=your_mongodb_connection_string

# Authentication
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=7d

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
