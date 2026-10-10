# devops-todo-proj

# database
Your Spring Boot container `spbcont` is running, and PostgreSQL container `postgres-db` is also running. However, `docker ps` only confirms that the containers are running; it does not confirm that Spring Boot is connected to PostgreSQL.

Your frontend error is:

```
GET http://44.223.100.236:8080/role/get/all
net::ERR_CONNECTION_REFUSED
```

This error indicates that the browser cannot establish a TCP connection to the backend at that address and port. We should check the backend first, then verify the database connection.

## Step 1: Check whether Spring Boot connected to PostgreSQL

Run these commands on your EC2 server.

1\. Check the Spring Boot logs:

```
docker logs --tail 200 spbcont
```

Look for messages like these:

| Log message                                   | Meaning                                                    |
| --------------------------------------------- | ---------------------------------------------------------- |
| `Started TodoApplication`                     | Spring Boot started successfully                           |
| `HikariPool-1 - Start completed`              | Database connection pool initialized                       |
| `Connection refused`                          | Database endpoint or port may be unreachable               |
| `password authentication failed`              | Username or password mismatch                              |
| `FATAL: database "company_db" does not exist` | Database name is incorrect or database was not initialized |

To monitor new logs while the application runs:

```
docker logs -f spbcont
```

Press `Ctrl+C` to stop watching logs. This will not stop the container.

## Step 2: Verify PostgreSQL is ready

Run:

```
docker exec postgres-db pg_isready -U app_user -d company_db
```

Expected result:

```
/var/run/postgresql:5432 - accepting connections
```

Now connect to PostgreSQL from inside its container:

```
docker exec -it postgres-db psql -U app_user -d company_db
```

Inside `psql`, run:

```
SELECT current_database(), current_user;
```

Expected output should show `company_db` and `app_user`.

Check your tables:

```
\dt
```

Test whether the application user can read the tables:

```
SELECT * FROM public.role;
SELECT * FROM public.services;
SELECT * FROM public.project;
```

Exit:

```
\q
```

If `app_user` does not exist, or authentication fails, the PostgreSQL credentials and initialization need to be checked.

## Step 3: Check whether Spring Boot is listening on port 8080

Run:

```
docker port spbcont
docker inspect -f '{{.State.Status}} {{.State.Running}}' spbcont
curl -i http://localhost:8080/
```

The root endpoint `/` might return `404` if your application has no root mapping. That alone does not mean Spring Boot is down.

Try the API endpoint reported by your frontend:

```
curl -i http://localhost:8080/role/get/all
```

Interpret the results:

- `200 OK`: the endpoint is responding successfully.
- `401` or `403`: the endpoint may require authentication.
- `404`: the server responds, but the URL may not match your API mappings.
- `500`: the backend responds but encounters an application-side error; inspect the logs.
- `Connection refused`: the backend is not accepting connections on that address and port.

If you get connection refused, check the logs and whether the application is listening on port `8080` inside the container.

## Step 4: Verify your Spring Boot database URL

Your current configuration uses:

```
spring.datasource.url=jdbc:postgresql://44.223.100.236:5432/company_db
spring.datasource.username=app_user
spring.datasource.password=ChangeThis_StrongPassword
```

The IP address must be reachable from the Spring Boot container, and PostgreSQL must accept connections from that source.

Recommended approach: put both containers on a dedicated Docker network and connect to PostgreSQL using its container name rather than its public IP.

Create a network:

```
docker network create todo-network
```

Connect both running containers:

```
docker network connect todo-network postgres-db
docker network connect todo-network spbcont
```

Then change the database URL in your Spring Boot configuration to:

```
spring.datasource.url=jdbc:postgresql://postgres-db:5432/company_db
```

The hostname `postgres-db` works because both containers are connected to the same user-defined Docker network.

Important: changing `application.properties` on your server does not automatically change the configuration already packaged into your existing JAR. You must rebuild the image and recreate the Spring Boot container with the updated configuration.

## Step 5: Fix the frontend connection error

Your React frontend is requesting:

```
http://44.223.100.236:8080/role/get/all
```

First, confirm the API works from the EC2 host:

```
curl -i http://localhost:8080/role/get/all
```

If it works locally but not from your browser, check the EC2 security group's inbound rules for TCP port `8080`, the server's public IP, and any host firewall rules. Restrict access to trusted sources rather than exposing the backend publicly to everyone.

If the API does not work locally, resolve the backend issue before changing the frontend.

## Run these three commands first

1\. Spring Boot logs

```
docker logs --tail 100 spbcont
```

2\. PostgreSQL readiness

```
docker exec postgres-db pg_isready -U app_user -d company_db
```

3\. Backend API test

```
curl -i http://localhost:8080/role/get/all
```

&#x20;Copy all three commands

Send me the output of these three commands. I can then help you identify whether the problem is the Spring Boot startup, the PostgreSQL connection, or the frontend-to-backend connection.
