-- Índices para la tabla routes
CREATE INDEX IF NOT EXISTS idx_created_at ON routes(created_at);

-- Índices para la tabla rules
CREATE INDEX IF NOT EXISTS idx_active_updated ON rules(is_active, updated_at);

-- Índices para la tabla learning_metrics
CREATE INDEX IF NOT EXISTS idx_timestamp ON learning_metrics(timestamp);
CREATE INDEX IF NOT EXISTS idx_metric_type_timestamp ON learning_metrics(metric_type, timestamp);
