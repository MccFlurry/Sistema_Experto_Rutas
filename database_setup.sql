-- Create database
CREATE DATABASE IF NOT EXISTS air_routes_expert;
USE air_routes_expert;

-- Create airports table
CREATE TABLE IF NOT EXISTS airports (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    iata_code CHAR(3) UNIQUE NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    timezone VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create routes table
CREATE TABLE IF NOT EXISTS routes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    origin_id INT NOT NULL,
    destination_id INT NOT NULL,
    distance DECIMAL(10, 2) NOT NULL, -- in nautical miles
    typical_duration INT NOT NULL, -- in minutes
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (origin_id) REFERENCES airports(id),
    FOREIGN KEY (destination_id) REFERENCES airports(id)
);

-- Create rules table
CREATE TABLE IF NOT EXISTS rules (
    id INT PRIMARY KEY AUTO_INCREMENT,
    rule_type ENUM('ROUTE', 'WEATHER', 'TIMING', 'COST') NOT NULL,
    condition_json JSON NOT NULL, -- Stores complex conditions in JSON format
    action_json JSON NOT NULL, -- Stores actions to take in JSON format
    priority INT NOT NULL DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create weather_constraints table
CREATE TABLE IF NOT EXISTS weather_constraints (
    id INT PRIMARY KEY AUTO_INCREMENT,
    condition_type ENUM('WIND_SPEED', 'VISIBILITY', 'TEMPERATURE', 'PRECIPITATION', 'PRESSURE') NOT NULL,
    min_value DECIMAL(10, 2),
    max_value DECIMAL(10, 2),
    unit VARCHAR(20) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS learning_metrics (
    id INT PRIMARY KEY AUTO_INCREMENT,
    metric_type VARCHAR(50) NOT NULL,
    value FLOAT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_metric_timestamp (metric_type, timestamp)
);

-- Create indexes for better performance
CREATE INDEX idx_airports_iata ON airports(iata_code);
CREATE INDEX idx_routes_origin ON routes(origin_id);
CREATE INDEX idx_routes_destination ON routes(destination_id);
CREATE INDEX idx_rules_type ON rules(rule_type);
CREATE INDEX idx_rules_priority ON rules(priority);
CREATE INDEX idx_weather_condition_type ON weather_constraints(condition_type);

-- Add some sample airports
INSERT INTO airports (name, iata_code, latitude, longitude, timezone) VALUES
('John F. Kennedy International Airport', 'JFK', 40.6413, -73.7781, 'America/New_York'),
('Los Angeles International Airport', 'LAX', 33.9416, -118.4085, 'America/Los_Angeles'),
('London Heathrow Airport', 'LHR', 51.4700, -0.4543, 'Europe/London'),
('Tokyo Narita International Airport', 'NRT', 35.7720, 140.3929, 'Asia/Tokyo'),
('Dubai International Airport', 'DXB', 25.2532, 55.3657, 'Asia/Dubai'),
('Singapore Changi Airport', 'SIN', 1.3644, 103.9915, 'Asia/Singapore'),
('Paris Charles de Gaulle Airport', 'CDG', 49.0097, 2.5479, 'Europe/Paris'),
('Frankfurt Airport', 'FRA', 50.0379, 8.5622, 'Europe/Berlin'),
('Hong Kong International Airport', 'HKG', 22.3080, 113.9185, 'Asia/Hong_Kong'),
('Sydney Kingsford Smith Airport', 'SYD', -33.9399, 151.1753, 'Australia/Sydney'),
('O Hare International Airport', 'ORD', 41.9786, -87.9048, 'America/Chicago'),
('Miami International Airport', 'MIA', 25.7933, -80.2906, 'America/New_York'),
('Amsterdam Airport Schiphol', 'AMS', 52.3086, 4.7639, 'Europe/Amsterdam'),
('Madrid Barajas Airport', 'MAD', 40.4983, -3.5676, 'Europe/Madrid'),
('Toronto Pearson International Airport', 'YYZ', 43.6777, -79.6248, 'America/Toronto'),
('São Paulo/Guarulhos International Airport', 'GRU', -23.4356, -46.4731, 'America/Sao_Paulo');

-- Add some sample routes
INSERT INTO routes (origin_id, destination_id, distance, typical_duration) VALUES
(1, 2, 2475.00, 360), -- JFK to LAX
(1, 3, 3451.00, 420), -- JFK to LHR
(2, 4, 5451.00, 650), -- LAX to NRT
(1, 7, 740.00, 150),  -- JFK to ORD
(1, 8, 1089.00, 180), -- JFK to MIA
(2, 8, 2342.00, 320), -- LAX to MIA
(3, 7, 3953.00, 480), -- LHR to ORD
(3, 9, 229.00, 60),   -- LHR to AMS
(4, 5, 1687.00, 240), -- NRT to DXB
(5, 6, 3405.00, 420), -- DXB to SIN
(6, 10, 6543.00, 720), -- SIN to MAD
(7, 15, 436.00, 90),  -- ORD to YYZ
(8, 16, 4072.00, 510), -- MIA to GRU
(9, 11, 3651.00, 450), -- AMS to HKG
(10, 12, 8576.00, 960); -- MAD to SYD

-- Add sample rules
INSERT INTO rules (rule_type, condition_json, action_json, priority) VALUES
('WEATHER', '{"condition": "wind_speed > 35", "airport": "all"}', '{"action": "restrict_takeoff", "severity": "high"}', 10),
('ROUTE', '{"condition": "distance > 5000", "fuel_check": "required"}', '{"action": "add_fuel_stop", "min_fuel_reserve": "15%"}', 5),
('WEATHER', '{"condition": "visibility < 1", "airport": "all"}', '{"action": "ground_all", "severity": "critical"}', 100),
('WEATHER', '{"condition": "temperature > 45", "airport": "DXB"}', '{"action": "adjust_fuel", "factor": 1.15}', 20),
('WEATHER', '{"condition": "wind_speed > 25", "direction": "crosswind"}', '{"action": "alternate_runway", "severity": "medium"}', 15),
('ROUTE', '{"condition": "distance > 6000", "aircraft_type": "long_haul"}', '{"action": "require_extra_crew", "crew_count": 2}', 25),
('ROUTE', '{"condition": "duration > 720", "passenger_count": "full"}', '{"action": "add_service_stop", "duration": 60}', 20),
('TIMING', '{"condition": "departure_hour < 6", "airport": "noise_restricted"}', '{"action": "adjust_thrust", "reduction": "15%"}', 30),
('COST', '{"condition": "fuel_price > 2.5", "route_type": "long_haul"}', '{"action": "optimize_altitude", "target": "max_efficiency"}', 10);

-- Add sample weather constraints
INSERT INTO weather_constraints (condition_type, min_value, max_value, unit, description) VALUES
('WIND_SPEED', 0, 35, 'knots', 'Maximum safe wind speed for takeoff and landing'),
('VISIBILITY', 3, NULL, 'miles', 'Minimum visibility required for normal operations'),
('TEMPERATURE', -30, 45, 'celsius', 'Safe temperature range for operations'),
('WIND_SPEED', 0, 40, 'knots', 'Absolute maximum wind speed for any operation'),
('WIND_SPEED', 0, 25, 'knots', 'Maximum crosswind component for narrow-body aircraft'),
('VISIBILITY', 0.5, NULL, 'miles', 'Minimum visibility for CAT III approaches'),
('VISIBILITY', 2, NULL, 'miles', 'Minimum visibility for CAT II approaches'),
('VISIBILITY', 3, NULL, 'miles', 'Minimum visibility for CAT I approaches'),
('TEMPERATURE', -40, 50, 'celsius', 'Extreme temperature operation limits'),
('PRECIPITATION', 0, 50, 'mm/hr', 'Maximum safe precipitation rate'),
('PRESSURE', 950, 1050, 'hPa', 'Safe atmospheric pressure range for operations');

-- Add initial learning metrics
INSERT INTO learning_metrics (metric_type, value) VALUES
('ROUTE_OPTIMIZATION', 1.0),
('WEATHER_ADAPTATION', 1.0),
('FUEL_EFFICIENCY', 1.0),
('SAFETY_SCORE', 1.0);
