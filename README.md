# Project Name

## Overview
This is a Laravel-based application with a React frontend (Inertia.js). It includes features for Mail Management, Staff Management, and Dispositions.

## Requirements
- PHP 8.2+
- Composer
- Node.js & NPM
- MySQL

## Installation

1.  **Clone the repository**
    ```bash
    git clone <repository-url>
    cd project-name
    ```

2.  **Install Dependencies**
    ```bash
    composer install
    npm install
    ```

3.  **Environment Setup**
    Copy `.env.example` to `.env` and configure your database credentials.
    ```bash
    cp .env.example .env
    php artisan key:generate
    ```

4.  **Database Migration & Seeding**
    ```bash
    php artisan migrate
    php artisan db:seed
    ```

5.  **Build Frontend**
    ```bash
    npm run build
    ```

## Running the Application
```bash
php artisan serve
npm run dev
```

## Testing
To run the test suite:
```bash
php artisan test
```

## Features
- **Authentication**: Login, Register, Profile Completion.
- **Mail Management**: Create, Send, Approve, Archive, and Star letters.
- **Staff Management**: Manage staff members and their roles.
- **Dispositions**: Create and track dispositions for letters.
