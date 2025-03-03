# Backend

This is the backend application for the GoCase project, built using Python and FastAPI. It provides an API for managing collaborative projects and tasks, user authentication, and data persistence.

## Technologies Used

*   **Python:** The primary programming language.
*   **FastAPI:** A modern, fast (high-performance), web framework for building APIs with Python 3.7+ based on standard Python type hints.
*   **SQLAlchemy:** A Python SQL toolkit and Object-Relational Mapping (ORM) system that provides a full suite of persistence patterns designed for efficient and high-performing database access.
*   **Alembic:** A lightweight database migration tool for SQLAlchemy.
*   **SQLite:** A self-contained, high-reliability, embedded, full-featured, public-domain, SQL database engine.
*   **Poetry:** A tool for dependency management and packaging in Python.

## Project Structure

The backend is structured as follows:

*   `alembic.ini`: Configuration file for Alembic.
*   `database.db`: SQLite database file.
*   `migrations`: Contains Alembic migration scripts.
    *   `versions`: Contains the actual migration files.
*   `pyproject.toml`: Configuration file for Poetry, defining project dependencies and build settings.
*   `src`: Contains the main application code.
    *   `app.py`: The main application entry point, defining the FastAPI application instance.
    *   `assistant`: Contains files related to the AI assistant.
        *   `assistant_config.py`: Configuration for the AI assistant.
        *   `iago_assistant.yaml`: YAML file defining the AI assistant's configuration.
    *   `database`: Contains database-related files.
        *   `database.py`: Defines the database connection and session management.
        *   `models.py`: Defines the SQLAlchemy models for the database tables.
    *   `routers`: Contains the API route definitions.
        *   `auth.py`: Defines authentication-related routes (login, registration).
        *   `collaborators.py`: Defines routes for managing collaborators.
        *   `feedback.py`: Defines routes for handling feedback.
        *   `iago.py`: Defines routes related to the IAGO assistant.
        *   `leaders.py`: Defines routes for managing leaders.
        *   `users.py`: Defines routes for managing users.
    *   `schemas`: Contains Pydantic schemas for data validation and serialization.
        *   `auth.py`: Defines schemas for authentication data.
        *   `feedback.py`: Defines schemas for feedback data.
        *   `message.py`: Defines schemas for messages.
        *   `users.py`: Defines schemas for user data.
    *   `security.py`: Contains security-related functions, such as password hashing.
    *   `settings.py`: Defines application settings and environment variables.
    *   `utils`: Contains utility functions.
        *   `get_cola`: Placeholder for future functionality.
        *   `yaml.py`: Utility functions for working with YAML files.

## Detailed Explanation

### FastAPI

FastAPI is used as the core framework for building the API. The `app.py` file initializes the FastAPI application and includes the routers defined in the `src/routers` directory. Each router defines a set of API endpoints for specific functionalities, such as user authentication, project management, and task management.

### SQLAlchemy

SQLAlchemy is used as the ORM to interact with the SQLite database. The `src/database/models.py` file defines the database tables as Python classes, allowing you to interact with the database using Python code instead of raw SQL queries. The `src/database/database.py` file manages the database connection and provides a session object for performing database operations.

### Alembic

Alembic is used for managing database migrations. The `migrations` directory contains the migration scripts, which define the changes to be applied to the database schema. Alembic allows you to easily update the database schema as the application evolves, without losing existing data.

### Routers

The `src/routers` directory contains the API route definitions. Each file in this directory defines a set of routes for a specific functionality. For example, the `auth.py` file defines the routes for user authentication, such as login and registration. The `users.py` file defines the routes for managing users, such as creating, updating, and deleting users.

### Schemas

The `src/schemas` directory contains the Pydantic schemas for data validation and serialization. Pydantic is a data validation and settings management library that uses Python type annotations to define the structure and types of data. The schemas are used to validate the data received from the API requests and to serialize the data sent in the API responses.

## Getting Started

1.  Install the dependencies using Poetry: `poetry install`
2.  Apply the database migrations: `alembic upgrade head`
3.  Run the application: `poetry run uvicorn src.app:app --reload`