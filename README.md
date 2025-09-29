# EcoBazaar

## Project Title
EcoBazaar - Sustainable E-Commerce Platform

## Abstract and Summary
EcoBazaar is a full-stack web application designed to facilitate the buying and selling of eco-friendly products. It provides a user-friendly platform for customers, sellers, and administrators with role-based access, secure authentication, and an AI-powered chat assistant for enhanced user experience. The application promotes sustainability by focusing on environmentally conscious products and services.

## Problem Statement
In the current e-commerce landscape, there is a growing demand for platforms that prioritize sustainability and eco-friendly practices. Traditional e-commerce sites often lack specialized features for green products, making it difficult for users to find and purchase environmentally conscious items. Additionally, sellers of eco-friendly products need dedicated tools for management, and users require assistance in making informed decisions. EcoBazaar addresses these challenges by providing a dedicated platform with AI integration for better engagement and security.

## Modules and Sub-Modules
- **Authentication Module**: Handles user registration, login, and role-based access (Customer, Seller, Admin).
- **Product Management Module**: Allows sellers to add, update, and manage products; customers to browse and purchase.
- **Order Management Module**: Tracks orders, payments, and delivery status.
- **Admin Dashboard Module**: Provides administrative tools for user and system management.
- **AI Chat Assistant Module**: Integrates Google GenAI for real-time assistance and queries.
- **Seller Profile Completion Module**: Guides sellers through profile setup.
- **Customer Dashboard Module**: Displays personalized content, order history, and feedback.

## Unique Selling Points
- **AI-Powered Assistance**: Utilizes Google GenAI for intelligent chat support, helping users with queries and recommendations.
- **Role-Based Dashboards**: Tailored interfaces for customers, sellers, and admins for efficient operations.
- **Secure and Scalable**: Built with Spring Boot and React, ensuring robust security with JWT authentication and scalability.
- **Eco-Focused**: Dedicated to promoting sustainable products, encouraging green consumerism.
- **Real-Time Features**: Includes countdown timers for deals and live order tracking.

## Technologies Used
### Frontend
- React.js (v18.2.0)
- React Router DOM (v6.8.0)
- Vite (build tool)
- CSS for styling

### Backend
- Spring Boot (v2.5.4)
- Java 11
- MySQL Database
- JWT for authentication
- Spring Security
- Google GenAI SDK (v1.17.0)

### Other Tools
- Maven for backend dependency management
- Git for version control
- MIT License

## Installation
### Prerequisites
- Node.js (v14 or higher)
- Java 11
- MySQL Server
- Maven

### Steps
1. Clone the repository:
   ```
   git clone <repository-url>
   cd EcoBazaar
   ```

2. Backend Setup:
   - Navigate to `backend/` directory.
   - Update `src/main/resources/application.properties` with your MySQL database credentials.
   - Run `mvn clean install` to build the project.
   - Start the server: `mvn spring-boot:run`

3. Frontend Setup:
   - Navigate to the root directory.
   - Install dependencies: `npm install`
   - Start the development server: `npm run dev`

4. Access the application at `http://localhost:3000`

## Usage
- **Landing Page**: Overview of the platform and navigation to login/signup.
- **Authentication**: Register as Customer, Seller, or Admin.
- **Dashboards**:
  - Customers: Browse products, place orders, track deliveries.
  - Sellers: Manage products, view sales stats, complete profiles.
  - Admins: Oversee users, products, and system settings.
- **AI Chat**: Use the assistant for queries on products or orders.

## Project Structure
```
EcoBazaar/
├── backend/                    # Spring Boot application
│   ├── src/main/java/com/ecobazaar/
│   │   ├── controller/         # REST controllers
│   │   ├── model/              # Entity models
│   │   ├── repository/         # Data repositories
│   │   ├── service/            # Business logic services
│   │   └── config/             # Configuration classes
│   ├── pom.xml                 # Maven dependencies
│   └── src/main/resources/     # Application properties
├── src/                        # React frontend
│   ├── components/             # Reusable UI components
│   ├── pages/                  # Page components
│   ├── services/               # API services
│   ├── App.jsx                 # Main app component
│   └── index.css               # Global styles
├── public/                     # Static assets
├── package.json                # Frontend dependencies
└── README.md                   # This file
```

## API Endpoints
- **Authentication**: `/auth/login`, `/auth/register`
- **Products**: `/products` (GET, POST, PUT, DELETE)
- **Orders**: `/orders` (GET, POST)
- **Users**: `/users` (GET, PUT)
- **Assistant**: `/assistant/chat` (POST)

For detailed API documentation, refer to the controller classes in `backend/src/main/java/com/ecobazaar/controller/`.

## Contributing
1. Fork the repository.
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Open a pull request.

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
