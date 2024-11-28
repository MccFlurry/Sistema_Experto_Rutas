-- Actualizar tabla de rutas si no tiene las columnas necesarias
ALTER TABLE routes
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- Actualizar tabla de weather_constraints si no existe
CREATE TABLE IF NOT EXISTS weather_constraints (
    id INT PRIMARY KEY AUTO_INCREMENT,
    condition_type VARCHAR(50) NOT NULL,
    min_value FLOAT NOT NULL,
    max_value FLOAT NOT NULL,
    unit VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_condition (condition_type)
);

-- Insertar datos iniciales de weather_constraints si no existen
INSERT IGNORE INTO weather_constraints (condition_type, min_value, max_value, unit) VALUES
('WIND_SPEED', 0, 25, 'knots'),
('VISIBILITY', 3, 10, 'nm'),
('TEMPERATURE', -20, 45, 'celsius'),
('PRECIPITATION', 0, 25, 'mm/h');

-- Actualizar tabla de rules si no existe
CREATE TABLE IF NOT EXISTS rules (
    id INT PRIMARY KEY AUTO_INCREMENT,
    rule_type VARCHAR(50) NOT NULL,
    condition_json JSON NOT NULL,
    action_json JSON NOT NULL,
    priority INT DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Crear tabla de learning_metrics si no existe
CREATE TABLE IF NOT EXISTS learning_metrics (
    id INT PRIMARY KEY AUTO_INCREMENT,
    metric_type VARCHAR(50) NOT NULL,
    value FLOAT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_metric_timestamp (metric_type, timestamp)
);
