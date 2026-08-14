# Courier and Logistic System

A full-stack web application for managing courier and logistics operations. This system provides comprehensive tools for managing shipments, customers, delivery agents, warehouses, packages, payments, and real-time tracking.

## Project Overview

The Courier and Logistic System is built with a modern microservices architecture, featuring:

- **Backend**: Spring Boot 4.1.0 REST API with PostgreSQL database
- **Frontend**: React 18 with Vite, Tailwind CSS, and real-time updates
- **Core Functionality**: End-to-end logistics management from shipment creation to delivery tracking

### Key Features

- 📦 **Shipment Management**: Create, route, and manage shipments across multiple warehouses
- 👥 **Customer Management**: Maintain customer profiles and delivery history
- 🚚 **Delivery Agent Management**: Manage delivery personnel and assignments
- 🏭 **Warehouse Management**: Track inventory across multiple depot warehouses
- 📮 **Package Specifications**: Define and manage package types and categories
- 💳 **Payment Processing**: Handle payments and financial transactions
- 🗺️ **Real-time Tracking**: Track shipments in real-time with history and status updates
- 📊 **Dashboard Analytics**: Visual overview of system metrics and operations

## Project Structure

```
courier_and_logistic_system/
├── Backend (Spring Boot)
│   ├── src/main/java/com/courier_and_logistic_system/
│   │   ├── config/              # Spring configuration classes
│   │   ├── controller/          # REST API endpoints
│   │   ├── dto/                 # Data Transfer Objects
│   │   ├── entity/              # JPA entities (database models)
│   │   ├── enums/               # Enumeration classes
│   │   ├── exception/           # Custom exception handlers
│   │   ├── repository/          # JPA repositories (data access)
│   │   ├── service/             # Business logic layer
│   │   └── utils/               # Utility functions
│   ├── src/main/resources/
│   │   ├── application.properties
│   │   ├── static/              # Static resources
│   │   └── templates/           # HTML templates
│   ├── src/test/                # Unit and integration tests
│   ├── pom.xml                  # Maven dependencies
│   └── Dockerfile               # Docker configuration

courier_and_logistic_ui/
├── Frontend (React + Vite)
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx    # Overview dashboard
│   │   │   ├── Shipments.jsx    # Shipment management
│   │   │   ├── Customers.jsx    # Customer directory
│   │   │   ├── Agents.jsx       # Delivery agents
│   │   │   ├── Warehouses.jsx   # Warehouse management
│   │   │   ├── Packages.jsx     # Package specifications
│   │   │   ├── Payments.jsx     # Payment management
│   │   │   └── Tracking.jsx     # Real-time tracking
│   │   ├── services/
│   │   │   └── api.js           # API communication layer
│   │   ├── App.jsx              # Main application component
│   │   ├── main.jsx             # Entry point
│   │   ├── App.css
│   │   └── index.css
│   ├── public/                  # Static assets
│   ├── package.json             # Dependencies
│   ├── vite.config.js           # Vite configuration
│   ├── tailwind.config.js       # Tailwind CSS configuration
│   └── postcss.config.js        # PostCSS configuration
```

## Tech Stack

### Backend
- **Framework**: Spring Boot 4.1.0
- **Language**: Java 21
- **Database**: PostgreSQL
- **ORM**: Spring Data JPA
- **Build Tool**: Maven
- **Dependencies**:
  - Spring Boot Starter Web
  - Spring Boot Starter Data JPA
  - Spring Boot Actuator (monitoring & health checks)
  - Spring Boot DevTools
  - Lombok (reducing boilerplate)
  - PostgreSQL JDBC Driver

### Frontend
- **Framework**: React 18.3.1
- **Build Tool**: Vite 4.5.3
- **Styling**: Tailwind CSS 3.4.3
- **Icons**: Lucide React
- **Language**: JavaScript (with React)
- **Development**: HMR (Hot Module Replacement)

## Getting Started

### Prerequisites

- **Java 21+** (for backend)
- **Node.js 18+** (for frontend)
- **Maven 3.8+** (for building backend)
- **PostgreSQL 12+** (for database)
- **npm or yarn** (for frontend package management)

### Backend Setup

1. **Navigate to the backend directory**:
   ```bash
   cd courier_and_logistic_system
   ```

2. **Configure PostgreSQL database**:
   - Create a PostgreSQL database for the application
   - Update `src/main/resources/application.properties` with your database credentials:
   ```properties
   spring.datasource.url=jdbc:postgresql://localhost:5432/courier_db
   spring.datasource.username=postgres
   spring.datasource.password=your_password
   spring.jpa.hibernate.ddl-auto=update
   ```

3. **Build the project**:
   ```bash
   mvn clean install
   ```

4. **Run the application**:
   ```bash
   mvn spring-boot:run
   ```
   
   The API will be available at: `http://localhost:8080`

### Frontend Setup

1. **Navigate to the frontend directory**:
   ```bash
   cd courier_and_logistic_ui
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```
   
   The application will be available at: `http://localhost:5173`

4. **Build for production**:
   ```bash
   npm run build
   ```

5. **Preview production build**:
   ```bash
   npm run preview
   ```

## API Endpoints

The REST API follows standard REST conventions. Key endpoint categories:

- **Shipments**: `/api/shipments` - CRUD operations and shipment routing
- **Customers**: `/api/customers` - Customer management
- **Agents**: `/api/agents` - Delivery agent management
- **Warehouses**: `/api/warehouses` - Warehouse operations
- **Packages**: `/api/packages` - Package type management
- **Payments**: `/api/payments` - Payment processing
- **Tracking**: `/api/tracking` - Real-time shipment tracking

## Database Schema

The system uses the following main entities:

- **Customer**: Customer information and contact details
- **Shipment**: Shipment records with origin, destination, and status
- **DeliveryAgent**: Delivery personnel information
- **Warehouse**: Storage facilities (depots)
- **Package**: Package definitions and specifications
- **Payment**: Financial transaction records
- **TrackingHistory**: Historical tracking data for shipments

## Testing

### Backend Tests

Run unit and integration tests:
```bash
mvn test
```

Postman collections are included for API testing:
- `src/test/java/com/courier_and_logistic_system/apiTest/*.postman_collection.json`

### Frontend Testing

To add tests to the frontend:
```bash
npm install --save-dev vitest @testing-library/react
```

## Docker Deployment

### Build Docker Image

```bash
docker build -t courier-logistics-system .
```

### Run with Docker

```bash
docker run -p 8080:8080 \
  -e DATABASE_URL=jdbc:postgresql://postgres:5432/courier_db \
  -e DATABASE_USER=postgres \
  -e DATABASE_PASSWORD=password \
  courier-logistics-system
```

## Features in Detail

### Dashboard
- Real-time overview of system metrics
- Shipment statistics and trends
- System health status
- Recent activities

### Shipment Management
- Create new shipments with route optimization
- Track shipment status in real-time
- Update delivery information
- Manage shipment routing across warehouses

### Customer Management
- Maintain customer profiles
- View customer history and preferences
- Track customer shipment records
- Manage customer contact information

### Delivery Agent Management
- Register and manage delivery personnel
- Track agent availability and assignments
- Monitor agent performance metrics
- Manage agent delivery routes

### Warehouse Management
- Track inventory across multiple locations
- Manage warehouse operations
- Monitor stock levels
- Coordinate inter-warehouse transfers

### Payment Processing
- Process customer payments
- Track payment history
- Generate payment reports
- Handle payment disputes

### Real-time Tracking
- Live GPS tracking of shipments
- Tracking history and timeline
- Delivery status notifications
- Customer-facing tracking portal

## Configuration

### Backend Configuration

Edit `application.properties` for:
- Database connection settings
- Server port
- Logging levels
- JPA/Hibernate settings
- Actuator endpoints

### Frontend Configuration

Edit `vite.config.js` and `tailwind.config.js` for:
- Build optimization
- Theme customization
- Development server settings
- Proxy configuration

## Performance Optimization

### Backend
- JPA query optimization with pagination
- Database indexing on frequently queried columns
- Connection pooling configuration
- Caching strategies for static data

### Frontend
- Code splitting with lazy loading
- Image optimization
- CSS and JS minification
- Production build optimization

## Security Considerations

- Implement Spring Security for authentication/authorization
- Use HTTPS in production
- Validate all input data
- Implement rate limiting for API endpoints
- Secure sensitive configuration with environment variables
- Use CORS configuration for frontend-backend communication

## Monitoring and Logging

- Spring Boot Actuator provides health checks at `/actuator/health`
- Application logs available in console and log files
- Monitor database performance
- Track API response times

## Troubleshooting

### Backend Issues
- Check PostgreSQL is running: `psql -U postgres -d courier_db`
- Verify Java 21 installation: `java -version`
- Review logs in console for error details

### Frontend Issues
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Check Node.js version: `node -v`
- Clear Vite cache: `rm -rf .vite`

### Database Issues
- Reset database (development only): 
  ```sql
  DROP DATABASE courier_db;
  CREATE DATABASE courier_db;
  ```
- Check migrations have run properly
- Verify PostgreSQL user permissions

## Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Commit changes: `git commit -am 'Add your feature'`
3. Push to branch: `git push origin feature/your-feature`
4. Submit a pull request

## Future Enhancements

- [ ] Mobile application for delivery agents
- [ ] Advanced analytics and reporting dashboard
- [ ] Machine learning for route optimization
- [ ] Blockchain for shipment verification
- [ ] Multi-language support
- [ ] Enhanced payment gateway integration
- [ ] SMS/Email notifications for customers
- [ ] API rate limiting and authentication tokens
- [ ] Elasticsearch for advanced search
- [ ] WebSockets for real-time updates

## License

This project is licensed under the MIT License.

## Support

For support, please contact the development team or create an issue in the project repository.

---

**Version**: 0.0.1-SNAPSHOT  
**Last Updated**: August 2026  
**Build Status**: Development
