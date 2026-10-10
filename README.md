docker rm -f spbcont

docker run -d \
  --name spbcont \
  --network todo-network \
  -p 8080:8080 \
  -e SPRING_DATASOURCE_URL=jdbc:postgresql://postgres-db:5432/company_db \
  -e SPRING_DATASOURCE_USERNAME=app_user \
  -e SPRING_DATASOURCE_PASSWORD='ChangeThis_StrongPassword' \
  spbimg:latest


  Step 2: Update WebConfig.java
  # check
     @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins("http://44.223.100.236:3001")


Step 3: Check Spring Security
If you use Spring Security, CORS must also be enabled in its existing SecurityFilterChain:

Step 4: Rebuild and redeploy
After making the changes, rebuild the backend image and recreate the backend container using your existing database network and environment settings.
mvn clean package -DskipTests
docker build -t spbimg:latest .


Then restart the backend container using the rebuilt image. Do not delete your PostgreSQL container or database volume.
Step 5: Test again
Run:
curl -i \
  -H 'Origin: http://44.223.100.236:3001' \
  http://localhost:8080/role/get/all


The response should include:
