# TransitOps — Backend

A Spring Boot REST API for fleet and transit operations management, supporting vehicle tracking, driver management, trip lifecycle, fuel/expense logging, and maintenance records.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Spring Boot 4.0.3 (Java 21) |
| Database | MySQL 8+ |
| ORM | Spring Data JPA / Hibernate |
| Security | Spring Security + JWT |
| Email | Spring Mail + Thymeleaf |
| API Docs | SpringDoc OpenAPI (Swagger UI) |
| Build Tool | Maven |
| Utilities | Lombok |

---

## Prerequisites

Make sure you have the following installed before starting:

- **Java 21** — [Download](https://adoptium.net/)
- **Maven 3.9+** — [Download](https://maven.apache.org/download.cgi)
- **MySQL 8+** — [Download](https://dev.mysql.com/downloads/mysql/)
- A Gmail account with an **App Password** enabled for SMTP email

---

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd TransitOps/backend
```

---

### 2. Create the MySQL Database

Log into MySQL and create the database:

```sql
CREATE DATABASE transitops;
```

Then run the schema script to create all tables:

```bash
mysql -u <your_username> -p transitops < src/main/resources/db/schema.sql
```

Or open `src/main/resources/db/schema.sql` in MySQL Workbench and execute it against the `transitops` database.

---

### 3. Configure Application Properties

Open `src/main/resources/application-dev.properties` and update the following:

#### Database
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/transitops
spring.datasource.username=YOUR_MYSQL_USERNAME
spring.datasource.password=YOUR_MYSQL_PASSWORD
```

#### Email (Gmail SMTP)
To send verification and password reset emails, you need a Gmail **App Password**:
1. Go to [Google Account → Security](https://myaccount.google.com/security)
2. Enable **2-Step Verification**
3. Go to **App Passwords** and generate one for "Mail"
4. Use it below:

```properties
spring.mail.username=your_email@gmail.com
spring.mail.password=your_app_password_here
```

#### JWT Secret
Change this to any long, random secret string:
```properties
jwt.secret=your_long_random_secret_key_here
```

#### Frontend URL
Set this to the URL where your frontend is running (used for email verification links):
```properties
frontend-url=http://localhost:5173
```

---

### 4. Build and Run

```bash
# Install dependencies and build
mvn clean install

# Run the application
mvn spring-boot:run
```

The server will start on **port 8080** by default.

---

### 5. Verify the Setup

Once running, open the Swagger UI to explore all available APIs:

```
http://localhost:8080/swagger-ui/index.html
```

---

## API Overview

| Module | Base Path | Access |
|---|---|---|
| Auth | `/api/auth/**` | Public |
| Users | `/api/user/**` | Authenticated |
| Vehicles | `/api/vehicle/**` | Authenticated |
| Trips | `/api/trip/**` | MANAGER / DISPATCHER |
| Logs (Fuel & Expense) | `/api/log/**` | Authenticated |
| Maintenance | `/api/maintenance/**` | MANAGER / DISPATCHER |
| Analytics | `/api/analytics/**` | MANAGER only |

### Auth Endpoints
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/auth/verify?email=` | Send email verification link |
| `POST` | `/api/auth/verify` | Verify user with token |
| `POST` | `/api/auth/login` | Login and receive JWT |
| `GET` | `/api/auth/request-reset-password?email=` | Send password reset link |
| `POST` | `/api/auth/reset-password?token=&newPassword=` | Reset password |

### User Roles
| Role | Permissions |
|---|---|
| `ROLE_MANAGER` | Full access — create users, manage vehicles, trips, analytics |
| `ROLE_DISPATCHER` | Dispatch and manage trips, update driver status |
| `ROLE_DRIVER` | View trips, log fuel/expenses, complete trips |

---

## Environment Variables (Optional for Docker/Production)

You can override properties using environment variables:

| Variable | Default | Description |
|---|---|---|
| `PORT` | `8080` | Server port |
| `SPRING_PROFILES_ACTIVE` | `dev` | Active Spring profile |

---

## Project Structure

```
src/main/java/com/TransitOps/
├── config/         # Spring beans (PasswordEncoder, etc.)
├── dao/            # Spring Data JPA repositories
├── dto/            # Data Transfer Objects
├── entity/         # JPA Entities (DB models)
├── exception/      # Custom exception classes
├── rest/           # REST Controllers (API layer)
├── security/       # JWT filter, WebSecurityConfig
├── service/        # Business logic layer
└── util/           # Enums, JwtUtil, EmailUtil

src/main/resources/
├── db/
│   └── schema.sql          # Full DB creation script
├── templates/              # Thymeleaf email templates
├── application.properties  # Base config (port, active profile)
└── application-dev.properties  # Dev environment config
```

---

## Database Schema

```
USERS
  └── DRIVERS (UserID FK)

VEHICLES
  └── TRIPS (VehicleID + DriverID FK)
  └── EXPENSE_LOGS (VehicleID FK)
       └── FUEL_LOGS (ExpenseID FK)
       └── MAINTENANCE (ExpenseID FK)
```

See full schema at [`src/main/resources/db/schema.sql`](src/main/resources/db/schema.sql).

---

## Notes

- `spring.jpa.hibernate.ddl-auto=none` is set intentionally — Hibernate will **not** auto-create or alter tables. Always use `schema.sql` to manage the schema.
- All deletes are **soft deletes** — records are never physically removed; the `active` flag is set to `false`.
- JWT tokens expire after **24 hours**. Verification and password reset tokens expire after **15 minutes**.
