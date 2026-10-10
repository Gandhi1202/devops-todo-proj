FROM postgres:16

ENV POSTGRES_DB=company_db
ENV POSTGRES_USER=postgres
ENV POSTGRES_PASSWORD=ChangePostgresPassword

COPY init.sql /docker-entrypoint-initdb.d/01-init.sql

EXPOSE 5432
