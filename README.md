# E-commerce Express.js Application

This is an Express.js application converted from static HTML/CSS files. It uses EJS as the template engine and includes clean routes for all pages.

## Project Structure

```
.
├── app.js                 # Express application configuration
├── server.js             # Server entry point
├── package.json          # Dependencies and scripts
├── routes/
│   └── index.js          # All application routes
├── views/
│   ├── home.ejs          # Home page view
│   ├── products.ejs      # Products listing page (pagination + filters)
│   ├── checkout.ejs      # Checkout page view
│   ├── orders.ejs        # Orders/CRUD page view
│   ├── success.ejs       # Success page view
│   ├── 404.ejs           # Not found page
│   ├── layout.ejs        # Layout template (optional)
│   └── partials/
│       ├── header.ejs    # Header partial
│       └── footer.ejs    # Footer partial
├── public/
│   ├── css/
│   │   ├── main.css      # Main stylesheet
│   │   ├── products.css  # Products page styles
│   │   ├── checkout.css  # Checkout page styles
│   │   ├── orders.css    # Orders page styles
│   │   └── success.css   # Success page styles
│   └── js/
│       ├── main.js       # Main JavaScript
│       ├── checkout.js   # Checkout page JavaScript
│       └── orders.js     # Orders page JavaScript
└── images/               # Static images directory

```

## Installation

1. Install dependencies:
```bash
npm install
```

2. Set up MongoDB:
   - Local: ensure MongoDB is running on `mongodb://localhost:27017/ecommerce`
   - Atlas: set `MONGODB_URI` in a `.env` file

3. Seed the database with sample products:
```bash
npm run seed
```

## Running the Application

Start the server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

The server will run on `http://localhost:3000` by default.

## Routes

- `/` - Home page
- `/products` - Products listing page with pagination and filters
- `/checkout` - Checkout page
- `/orders` - Orders management (CRUD) page
- `/success` - Order success confirmation page

## MongoDB Integration

The application uses MongoDB with Mongoose for data persistence:

- **Product Model**: Stores product information (name, price, category, image, description, stock, rating, etc.)
- **Pagination**: Products are paginated (default: 10 per page)
- **Filtering**: Filter by category, price range, and search by name/description
- **Sample Data**: Run `npm run seed` to populate the database with sample products

## Features

- **MongoDB + Mongoose**: Product model with pagination, filtering, and search
- **Seeding**: `npm run seed` populates sample products
- **EJS Template Engine**: Clean separation of views and partials
- **Static File Serving**: CSS, JavaScript, and images are served statically
- **Modular Routes**: All routes are organized in the `routes` directory
- **Responsive Design**: All pages are mobile-friendly
- **Form Validation**: Checkout page includes jQuery validation
- **CRUD Operations**: Orders page includes full CRUD functionality via API

## Technologies Used

- Express.js
- MongoDB + Mongoose
- EJS (Embedded JavaScript Templates)
- Bootstrap 5
- jQuery (+ Validation Plugin)

## Notes

- Images should be placed in the `images/` directory
- The orders page uses an external API (`https://usmanlive.com/wp-json/api/stories`)
- Navigation links use Express routes instead of static files

