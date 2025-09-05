# Digital Gaming Marketplace

A modern, full-stack e-commerce platform for digital products like PC games, software licenses, gift cards, and DLC. Built with React, TypeScript, Express.js, and PostgreSQL.

## 🚀 Features

- **Product Catalog**: Browse and search through digital products with advanced filtering
- **User Authentication**: Secure user registration and login with Replit Auth
- **Shopping Cart**: Add products to cart with real-time updates
- **Payment Processing**: Secure payments with Stripe integration
- **Digital Key Management**: Automated digital key assignment and delivery
- **Admin Dashboard**: Manage products, categories, and orders
- **Responsive Design**: Mobile-first design with modern UI components
- **Real-time Updates**: Live cart updates and order tracking

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **shadcn/ui** for UI components
- **React Query** for data fetching
- **Wouter** for routing
- **Framer Motion** for animations

### Backend
- **Express.js** with TypeScript
- **PostgreSQL** database
- **Drizzle ORM** for database operations
- **Stripe** for payment processing
- **Replit Auth** for authentication
- **WebSocket** support

### Development Tools
- **TypeScript** for type safety
- **ESLint** for code linting
- **Prettier** for code formatting
- **Drizzle Kit** for database migrations

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd DigitalMarket
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Fill in the required environment variables (see Environment Variables section below).

4. **Set up the database**
   ```bash
   npm run db:push
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:5000`.

## 🔧 Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database
DATABASE_URL=your_postgresql_connection_string

# Stripe
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# Replit Auth (if using Replit)
REPLIT_AUTH_URL=your_replit_auth_url
REPLIT_AUTH_CLIENT_ID=your_replit_auth_client_id
REPLIT_AUTH_CLIENT_SECRET=your_replit_auth_client_secret

# Session
SESSION_SECRET=your_session_secret_key

# Server
PORT=5000
NODE_ENV=development
```

## 🗄️ Database Schema

The application uses the following main entities:

- **Users**: User accounts and profiles
- **Categories**: Product categories
- **Products**: Digital products with pricing and details
- **Digital Keys**: Product activation keys
- **Orders**: Purchase orders
- **Order Items**: Individual items in orders

## 🚀 Deployment

### Production Build
```bash
npm run build
npm start
```

### Environment Setup
1. Set up a PostgreSQL database
2. Configure environment variables
3. Set up Stripe webhooks
4. Deploy to your preferred hosting platform

## 📱 API Endpoints

### Authentication
- `GET /api/auth/user` - Get current user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create product (admin)
- `PUT /api/products/:id` - Update product (admin)
- `DELETE /api/products/:id` - Delete product (admin)

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create category (admin)

### Orders
- `GET /api/orders` - Get user orders
- `GET /api/orders/:id` - Get order by ID
- `POST /api/create-payment-intent` - Create Stripe payment intent

### Digital Keys
- `POST /api/products/:id/keys` - Add digital keys to product (admin)

## 🎨 UI Components

The project uses a comprehensive set of UI components from shadcn/ui:

- Forms and inputs
- Modals and dialogs
- Navigation components
- Data display components
- Feedback components

## 🔒 Security Features

- Input validation with Zod schemas
- SQL injection prevention with Drizzle ORM
- Secure session management
- Stripe webhook signature verification
- Admin role-based access control

## 🧪 Testing

The project includes test IDs for automated testing:

- `data-testid="button-browse-games"`
- `data-testid="input-search"`
- `data-testid="select-sort"`
- `data-testid="filter-category-*"`

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For support and questions, please open an issue in the GitHub repository.

---

Built with ❤️ using modern web technologies.
