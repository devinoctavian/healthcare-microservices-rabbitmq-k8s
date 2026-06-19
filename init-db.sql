-- Create databases for each service
CREATE DATABASE IF NOT EXISTS auth_db;
CREATE DATABASE IF NOT EXISTS doctor_db;
CREATE DATABASE IF NOT EXISTS patient_db;
CREATE DATABASE IF NOT EXISTS queue_db;

-- Grant privileges
GRANT ALL PRIVILEGES ON auth_db.* TO 'root'@'%';
GRANT ALL PRIVILEGES ON doctor_db.* TO 'root'@'%';
GRANT ALL PRIVILEGES ON patient_db.* TO 'root'@'%';
GRANT ALL PRIVILEGES ON queue_db.* TO 'root'@'%';

FLUSH PRIVILEGES;
