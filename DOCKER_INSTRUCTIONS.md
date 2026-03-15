# Docker Setup Instructions

This project is containerized using Docker. To run the application, follow these steps:

## Prerequisites

- [Docker](https://www.docker.com/products/docker-desktop) installed on your machine.
- [Docker Compose](https://docs.docker.com/compose/install/) (usually included with Docker Desktop).

## Running the Application

1. Open a terminal in the project root directory.
2. Run the following command to build and start the containers:

   ```bash
   docker-compose up --build
   ```

3. Wait for the build process to complete and the services to start. You should see logs from `backend`, `frontend`, and `mongo`.

## Accessing the Application

- **Frontend**: Open your browser and go to [http://localhost:3000](http://localhost:3000).
- **Backend API**: Accessible at [http://localhost:8000](http://localhost:8000).
- **API Documentation**: [http://localhost:8000/docs](http://localhost:8000/docs).
- **MongoDB**: Running on port 27017.

## Stopping the Application

Press `Ctrl+C` in the terminal where Docker is running, or run:

```bash
docker-compose down
```

## Notes

- The database requires MongoDB. The Docker setup automatically provisions a MongoDB container.
- The SQLite database (`emolit.db`) for journal entries is persisted in the `app/` directory via volume mapping.
- The `mongo_data` volume persists MongoDB data.
