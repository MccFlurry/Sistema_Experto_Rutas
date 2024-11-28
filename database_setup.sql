-- Create database
CREATE DATABASE IF NOT EXISTS air_routes_expert;
USE air_routes_expert;

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";
-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `airports`
--

CREATE TABLE `airports` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `iata_code` char(3) NOT NULL,
  `latitude` decimal(10,8) NOT NULL,
  `longitude` decimal(11,8) NOT NULL,
  `timezone` varchar(50) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `airports`
--

INSERT INTO `airports` (`id`, `name`, `iata_code`, `latitude`, `longitude`, `timezone`, `created_at`, `updated_at`) VALUES
(1, 'John F. Kennedy International Airport', 'JFK', 40.64130000, -73.77810000, 'America/New_York', '2024-11-28 17:53:53', '2024-11-28 17:53:53'),
(2, 'Los Angeles International Airport', 'LAX', 33.94160000, -118.40850000, 'America/Los_Angeles', '2024-11-28 17:53:53', '2024-11-28 17:53:53'),
(3, 'London Heathrow Airport', 'LHR', 51.47000000, -0.45430000, 'Europe/London', '2024-11-28 17:53:53', '2024-11-28 17:53:53'),
(4, 'Tokyo Narita International Airport', 'NRT', 35.77200000, 140.39290000, 'Asia/Tokyo', '2024-11-28 17:53:53', '2024-11-28 17:53:53'),
(5, 'Dubai International Airport', 'DXB', 25.25320000, 55.36570000, 'Asia/Dubai', '2024-11-28 20:19:32', '2024-11-28 20:19:32'),
(6, 'Singapore Changi Airport', 'SIN', 1.36440000, 103.99150000, 'Asia/Singapore', '2024-11-28 20:19:32', '2024-11-28 20:19:32'),
(7, 'Paris Charles de Gaulle Airport', 'CDG', 49.00970000, 2.54790000, 'Europe/Paris', '2024-11-28 20:19:32', '2024-11-28 20:19:32'),
(8, 'Frankfurt Airport', 'FRA', 50.03790000, 8.56220000, 'Europe/Berlin', '2024-11-28 20:19:32', '2024-11-28 20:19:32'),
(9, 'Hong Kong International Airport', 'HKG', 22.30800000, 113.91850000, 'Asia/Hong_Kong', '2024-11-28 20:19:32', '2024-11-28 20:19:32'),
(10, 'Sydney Kingsford Smith Airport', 'SYD', -33.93990000, 151.17530000, 'Australia/Sydney', '2024-11-28 20:19:32', '2024-11-28 20:19:32'),
(11, 'O Hare International Airport', 'ORD', 41.97860000, -87.90480000, 'America/Chicago', '2024-11-28 20:19:32', '2024-11-28 20:19:32'),
(12, 'Miami International Airport', 'MIA', 25.79330000, -80.29060000, 'America/New_York', '2024-11-28 20:19:32', '2024-11-28 20:19:32'),
(13, 'Amsterdam Airport Schiphol', 'AMS', 52.30860000, 4.76390000, 'Europe/Amsterdam', '2024-11-28 20:19:32', '2024-11-28 20:19:32'),
(14, 'Madrid Barajas Airport', 'MAD', 40.49830000, -3.56760000, 'Europe/Madrid', '2024-11-28 20:19:32', '2024-11-28 20:19:32'),
(15, 'Toronto Pearson International Airport', 'YYZ', 43.67770000, -79.62480000, 'America/Toronto', '2024-11-28 20:19:32', '2024-11-28 20:19:32'),
(16, 'São Paulo/Guarulhos International Airport', 'GRU', -23.43560000, -46.47310000, 'America/Sao_Paulo', '2024-11-28 20:19:32', '2024-11-28 20:19:32');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `learning_metrics`
--

CREATE TABLE `learning_metrics` (
  `id` int(11) NOT NULL,
  `metric_type` varchar(50) NOT NULL,
  `value` float NOT NULL,
  `timestamp` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `learning_metrics`
--

INSERT INTO `learning_metrics` (`id`, `metric_type`, `value`, `timestamp`) VALUES
(1, 'ROUTE_OPTIMIZATION', 258, '2024-11-28 19:33:38'),
(2, 'ROUTE_OPTIMIZATION', 1, '2024-11-28 20:19:32'),
(3, 'WEATHER_ADAPTATION', 1, '2024-11-28 20:19:32'),
(4, 'FUEL_EFFICIENCY', 1, '2024-11-28 20:19:32'),
(5, 'SAFETY_SCORE', 1, '2024-11-28 20:19:32'),
(6, 'ROUTE_OPTIMIZATION', 401, '2024-11-28 20:35:02'),
(7, 'ROUTE_OPTIMIZATION', 973, '2024-11-28 20:38:32'),
(8, 'ROUTE_OPTIMIZATION', 1038, '2024-11-28 20:39:34'),
(9, 'ROUTE_OPTIMIZATION', 24, '2024-11-28 20:44:30'),
(10, 'ROUTE_OPTIMIZATION', 737, '2024-11-28 20:45:17'),
(11, 'ROUTE_OPTIMIZATION', 737, '2024-11-28 20:45:44'),
(12, 'ROUTE_OPTIMIZATION', 713, '2024-11-28 20:46:44'),
(13, 'ROUTE_OPTIMIZATION', 19.45, '2024-11-28 20:59:57');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `routes`
--

CREATE TABLE `routes` (
  `id` int(11) NOT NULL,
  `origin_id` int(11) NOT NULL,
  `destination_id` int(11) NOT NULL,
  `distance` decimal(10,2) NOT NULL,
  `typical_duration` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `routes`
--

INSERT INTO `routes` (`id`, `origin_id`, `destination_id`, `distance`, `typical_duration`, `created_at`, `updated_at`) VALUES
(1, 1, 2, 2475.00, 360, '2024-11-28 17:53:53', '2024-11-28 17:53:53'),
(2, 1, 3, 3451.00, 420, '2024-11-28 17:53:53', '2024-11-28 17:53:53'),
(3, 2, 4, 5451.00, 650, '2024-11-28 17:53:53', '2024-11-28 17:53:53'),
(4, 1, 2, 2145.97, 258, '2024-11-28 19:00:15', '2024-11-28 19:00:15'),
(5, 1, 2, 2145.97, 258, '2024-11-28 19:02:11', '2024-11-28 19:02:11'),
(6, 1, 2, 2145.97, 258, '2024-11-28 19:03:03', '2024-11-28 19:03:03'),
(7, 1, 2, 2145.97, 258, '2024-11-28 19:04:58', '2024-11-28 19:04:58'),
(8, 1, 3, 2991.37, 359, '2024-11-28 19:05:20', '2024-11-28 19:05:20'),
(9, 1, 2, 2145.97, 258, '2024-11-28 19:06:36', '2024-11-28 19:06:36'),
(10, 2, 4, 4726.17, 567, '2024-11-28 19:11:12', '2024-11-28 19:11:12'),
(11, 2, 4, 4726.17, 567, '2024-11-28 19:11:45', '2024-11-28 19:11:45'),
(12, 1, 2, 2145.97, 258, '2024-11-28 19:18:27', '2024-11-28 19:18:27'),
(13, 2, 4, 4726.17, 567, '2024-11-28 19:20:30', '2024-11-28 19:20:30'),
(14, 1, 2, 2145.97, 258, '2024-11-28 19:33:38', '2024-11-28 19:33:38'),
(15, 1, 2, 2475.00, 360, '2024-11-28 20:19:32', '2024-11-28 20:19:32'),
(16, 1, 3, 3451.00, 420, '2024-11-28 20:19:32', '2024-11-28 20:19:32'),
(17, 2, 4, 5451.00, 650, '2024-11-28 20:19:32', '2024-11-28 20:19:32'),
(18, 1, 7, 740.00, 150, '2024-11-28 20:19:32', '2024-11-28 20:19:32'),
(19, 1, 8, 1089.00, 180, '2024-11-28 20:19:32', '2024-11-28 20:19:32'),
(20, 2, 8, 2342.00, 320, '2024-11-28 20:19:32', '2024-11-28 20:19:32'),
(21, 3, 7, 3953.00, 480, '2024-11-28 20:19:32', '2024-11-28 20:19:32'),
(22, 3, 9, 229.00, 60, '2024-11-28 20:19:32', '2024-11-28 20:19:32'),
(23, 4, 5, 1687.00, 240, '2024-11-28 20:19:32', '2024-11-28 20:19:32'),
(24, 5, 6, 3405.00, 420, '2024-11-28 20:19:32', '2024-11-28 20:19:32'),
(25, 6, 10, 6543.00, 720, '2024-11-28 20:19:32', '2024-11-28 20:19:32'),
(26, 7, 15, 436.00, 90, '2024-11-28 20:19:32', '2024-11-28 20:19:32'),
(27, 8, 16, 4072.00, 510, '2024-11-28 20:19:32', '2024-11-28 20:19:32'),
(28, 9, 11, 3651.00, 450, '2024-11-28 20:19:32', '2024-11-28 20:19:32'),
(29, 10, 12, 8576.00, 960, '2024-11-28 20:19:32', '2024-11-28 20:19:32'),
(34, 1, 8, 3341.54, 401, '2024-11-28 20:35:02', '2024-11-28 20:35:02'),
(35, 10, 12, 8111.21, 973, '2024-11-28 20:38:32', '2024-11-28 20:38:32'),
(36, 1, 10, 8646.59, 1038, '2024-11-28 20:39:34', '2024-11-28 20:39:34'),
(37, 3, 13, 199.76, 24, '2024-11-28 20:44:30', '2024-11-28 20:44:30'),
(38, 6, 14, 6145.14, 737, '2024-11-28 20:45:17', '2024-11-28 20:45:17'),
(39, 6, 14, 6145.14, 737, '2024-11-28 20:45:44', '2024-11-28 20:45:44'),
(40, 1, 5, 5940.28, 713, '2024-11-28 20:46:44', '2024-11-28 20:46:44'),
(41, 9, 16, 18003.79, 19, '2024-11-28 20:59:57', '2024-11-28 20:59:57');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `rules`
--

CREATE TABLE `rules` (
  `id` int(11) NOT NULL,
  `rule_type` enum('ROUTE','WEATHER','TIMING','COST') NOT NULL,
  `condition_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`condition_json`)),
  `action_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`action_json`)),
  `priority` int(11) NOT NULL DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `rules`
--

INSERT INTO `rules` (`id`, `rule_type`, `condition_json`, `action_json`, `priority`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'WEATHER', '{\"condition\": \"wind_speed > 35\", \"airport\": \"all\"}', '{\"action\": \"restrict_takeoff\", \"severity\": \"high\"}', 10, 1, '2024-11-28 20:24:08', '2024-11-28 20:24:08'),
(2, 'WEATHER', '{\"condition\": \"visibility < 1\", \"airport\": \"all\"}', '{\"action\": \"ground_all\", \"severity\": \"critical\"}', 100, 1, '2024-11-28 20:24:08', '2024-11-28 20:24:08'),
(3, 'WEATHER', '{\"condition\": \"temperature > 45\", \"airport\": \"DXB\"}', '{\"action\": \"adjust_fuel\", \"factor\": 1.15}', 20, 1, '2024-11-28 20:24:08', '2024-11-28 20:24:08'),
(4, 'WEATHER', '{\"condition\": \"wind_speed > 25\", \"direction\": \"crosswind\"}', '{\"action\": \"alternate_runway\", \"severity\": \"medium\"}', 15, 1, '2024-11-28 20:24:08', '2024-11-28 20:24:08'),
(5, 'ROUTE', '{\"condition\": \"distance > 5000\", \"fuel_check\": \"required\"}', '{\"action\": \"add_fuel_stop\", \"min_fuel_reserve\": \"15%\"}', 5, 1, '2024-11-28 20:24:08', '2024-11-28 20:24:08'),
(6, 'ROUTE', '{\"distance_range\":[1931.373,2360.567],\"weather_conditions\":[{\"type\":\"WIND_SPEED\",\"severity\":\"MEDIUM\"},{\"type\":\"VISIBILITY\",\"severity\":\"LOW\"}]}', '{\"type\":\"ROUTE_PLANNING\",\"adjustments\":{\"duration\":258,\"reasoning\":[\"Applied rule: Route adjustment\"]}}', 1, 1, '2024-11-28 20:24:08', '2024-11-28 20:24:08'),
(7, 'ROUTE', '{\"distance_range\":[4253.553,5198.787],\"weather_conditions\":[{\"type\":\"WIND_SPEED\",\"severity\":\"MEDIUM\"},{\"type\":\"VISIBILITY\",\"severity\":\"LOW\"}]}', '{\"type\":\"ROUTE_PLANNING\",\"adjustments\":{\"duration\":567,\"reasoning\":[\"Applied rule: Route adjustment\"]}}', 1, 1, '2024-11-28 20:24:08', '2024-11-28 20:24:08'),
(8, 'ROUTE', '{\"condition\": \"distance > 6000\", \"aircraft_type\": \"long_haul\"}', '{\"action\": \"require_extra_crew\", \"crew_count\": 2}', 25, 1, '2024-11-28 20:24:08', '2024-11-28 20:24:08'),
(9, 'ROUTE', '{\"condition\": \"duration > 720\", \"passenger_count\": \"full\"}', '{\"action\": \"add_service_stop\", \"duration\": 60}', 20, 1, '2024-11-28 20:24:08', '2024-11-28 20:24:08'),
(10, 'TIMING', '{\"condition\": \"departure_hour < 6\", \"airport\": \"noise_restricted\"}', '{\"action\": \"adjust_thrust\", \"reduction\": \"15%\"}', 30, 1, '2024-11-28 20:24:08', '2024-11-28 20:24:08'),
(11, 'COST', '{\"condition\": \"fuel_price > 2.5\", \"route_type\": \"long_haul\"}', '{\"action\": \"optimize_altitude\", \"target\": \"max_efficiency\"}', 10, 1, '2024-11-28 20:24:08', '2024-11-28 20:24:08'),
(12, 'ROUTE', '{\"distance_range\":[3007.386,3675.6940000000004],\"weather_conditions\":[{\"type\":\"WIND_SPEED\",\"severity\":\"MEDIUM\"},{\"type\":\"VISIBILITY\",\"severity\":\"LOW\"}]}', '{\"type\":\"ROUTE_PLANNING\",\"adjustments\":{\"duration\":401,\"reasoning\":[\"Applied rule: Route adjustment\",\"Applied rule: Route adjustment\",\"Applied rule: Route adjustment\",\"Applied rule: Route adjustment\",\"Applied rule: Route adjustment\",\"Applied rule: Route adjustment\",\"Applied rule: Route adjustment\",\"Applied rule: Route adjustment\",\"Applied rule: Route adjustment\"]}}', 1, 1, '2024-11-28 20:35:02', '2024-11-28 20:35:02'),
(13, 'ROUTE', '{\"distance_range\":[7300.089,8922.331],\"weather_conditions\":[{\"type\":\"WIND_SPEED\",\"severity\":\"MEDIUM\"},{\"type\":\"VISIBILITY\",\"severity\":\"LOW\"}]}', '{\"type\":\"ROUTE_PLANNING\",\"adjustments\":{\"duration\":973,\"reasoning\":[\"Applied rule: Route adjustment\",\"Applied rule: Route adjustment\",\"Applied rule: Route adjustment\",\"Applied rule: Route adjustment\",\"Applied rule: Route adjustment\",\"Applied rule: Route adjustment\",\"Applied rule: Route adjustment\",\"Applied rule: Route adjustment\",\"Applied rule: Route adjustment\"]}}', 1, 1, '2024-11-28 20:38:32', '2024-11-28 20:38:32'),
(14, 'ROUTE', '{\"distance_range\":[7781.9310000000005,9511.249000000002],\"weather_conditions\":[{\"type\":\"WIND_SPEED\",\"severity\":\"MEDIUM\"},{\"type\":\"VISIBILITY\",\"severity\":\"LOW\"}]}', '{\"type\":\"ROUTE_PLANNING\",\"adjustments\":{\"duration\":1038,\"reasoning\":[\"Applied rule: Route adjustment\",\"Applied rule: Route adjustment\",\"Applied rule: Route adjustment\",\"Applied rule: Route adjustment\",\"Applied rule: Route adjustment\",\"Applied rule: Route adjustment\",\"Applied rule: Route adjustment\",\"Applied rule: Route adjustment\",\"Applied rule: Route adjustment\",\"Applied rule: Route adjustment\"]}}', 1, 1, '2024-11-28 20:39:34', '2024-11-28 20:39:34'),
(15, 'ROUTE', '{\"distance_range\":[179.784,219.73600000000002],\"weather_conditions\":[{\"type\":\"WIND_SPEED\",\"severity\":\"MEDIUM\"},{\"type\":\"VISIBILITY\",\"severity\":\"LOW\"}]}', '{\"type\":\"ROUTE_PLANNING\",\"adjustments\":{\"duration\":24,\"reasoning\":[\"Applied rule: Route adjustment\",\"Applied rule: Route adjustment\",\"Applied rule: Route adjustment\",\"Applied rule: Route adjustment\",\"Applied rule: Route adjustment\",\"Applied rule: Route adjustment\",\"Applied rule: Route adjustment\",\"Applied rule: Route adjustment\",\"Applied rule: Route adjustment\"]}}', 1, 1, '2024-11-28 20:44:30', '2024-11-28 20:44:30'),
(16, 'ROUTE', '{\"distance_range\":[5530.626,6759.654000000001],\"weather_conditions\":[{\"type\":\"WIND_SPEED\",\"severity\":\"MEDIUM\"},{\"type\":\"VISIBILITY\",\"severity\":\"LOW\"}]}', '{\"type\":\"ROUTE_PLANNING\",\"adjustments\":{\"duration\":737,\"reasoning\":[\"Applied rule: Route adjustment\",\"Applied rule: Route adjustment\",\"Applied rule: Route adjustment\",\"Applied rule: Route adjustment\",\"Applied rule: Route adjustment\",\"Applied rule: Route adjustment\",\"Applied rule: Route adjustment\",\"Applied rule: Route adjustment\",\"Applied rule: Route adjustment\"]}}', 1, 1, '2024-11-28 20:45:17', '2024-11-28 20:45:17'),
(17, 'ROUTE', '{\"distance_range\":[5530.626,6759.654000000001],\"weather_conditions\":[{\"type\":\"WIND_SPEED\",\"severity\":\"MEDIUM\"},{\"type\":\"VISIBILITY\",\"severity\":\"LOW\"}]}', '{\"type\":\"ROUTE_PLANNING\",\"adjustments\":{\"duration\":737,\"reasoning\":[\"Applied rule: Route adjustment\",\"Applied rule: Route adjustment\",\"Applied rule: Route adjustment\",\"Applied rule: Route adjustment\",\"Applied rule: Route adjustment\",\"Applied rule: Route adjustment\",\"Applied rule: Route adjustment\",\"Applied rule: Route adjustment\",\"Applied rule: Route adjustment\",\"Applied rule: Route adjustment\"]}}', 1, 1, '2024-11-28 20:45:44', '2024-11-28 20:45:44'),
(18, 'ROUTE', '{\"distance_range\":[5346.2519999999995,6534.308],\"weather_conditions\":[{\"type\":\"WIND_SPEED\",\"severity\":\"MEDIUM\"},{\"type\":\"VISIBILITY\",\"severity\":\"LOW\"}]}', '{\"type\":\"ROUTE_PLANNING\",\"adjustments\":{\"duration\":713,\"reasoning\":[\"Applied rule: Route adjustment\",\"Applied rule: Route adjustment\",\"Applied rule: Route adjustment\",\"Applied rule: Route adjustment\",\"Applied rule: Route adjustment\",\"Applied rule: Route adjustment\",\"Applied rule: Route adjustment\",\"Applied rule: Route adjustment\",\"Applied rule: Route adjustment\",\"Applied rule: Route adjustment\",\"Applied rule: Route adjustment\"]}}', 1, 1, '2024-11-28 20:46:44', '2024-11-28 20:46:44'),
(19, 'ROUTE', '{\"distance_range\":[16203.411000000002,19804.169],\"weather_conditions\":[{\"type\":\"WIND_SPEED\",\"severity\":\"MEDIUM\"},{\"type\":\"VISIBILITY\",\"severity\":\"LOW\"}]}', '{\"type\":\"ROUTE_PLANNING\",\"adjustments\":{\"duration\":1167,\"reasoning\":[],\"fuelStops\":[]}}', 1, 1, '2024-11-28 20:59:57', '2024-11-28 20:59:57');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `weather_constraints`
--

CREATE TABLE `weather_constraints` (
  `id` int(11) NOT NULL,
  `condition_type` enum('WIND_SPEED','VISIBILITY','TEMPERATURE','PRECIPITATION','PRESSURE') NOT NULL,
  `min_value` decimal(10,2) DEFAULT NULL,
  `max_value` decimal(10,2) DEFAULT NULL,
  `unit` varchar(20) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `weather_constraints`
--

INSERT INTO `weather_constraints` (`id`, `condition_type`, `min_value`, `max_value`, `unit`, `description`, `created_at`, `updated_at`) VALUES
(1, 'WIND_SPEED', 0.00, 35.00, 'knots', 'Maximum safe wind speed for takeoff and landing', '2024-11-28 17:53:53', '2024-11-28 17:53:53'),
(2, 'VISIBILITY', 3.00, NULL, 'miles', 'Minimum visibility required for normal operations', '2024-11-28 17:53:53', '2024-11-28 17:53:53'),
(3, 'TEMPERATURE', -30.00, 45.00, 'celsius', 'Safe temperature range for operations', '2024-11-28 17:53:53', '2024-11-28 17:53:53'),
(4, 'WIND_SPEED', 0.00, 25.00, 'knots', NULL, '2024-11-28 19:29:50', '2024-11-28 19:29:50'),
(5, 'VISIBILITY', 3.00, 10.00, 'nm', NULL, '2024-11-28 19:29:50', '2024-11-28 19:29:50'),
(6, 'TEMPERATURE', -20.00, 45.00, 'celsius', NULL, '2024-11-28 19:29:50', '2024-11-28 19:29:50'),
(7, 'PRECIPITATION', 0.00, 25.00, 'mm/h', NULL, '2024-11-28 19:29:50', '2024-11-28 19:29:50'),
(8, 'WIND_SPEED', 0.00, 35.00, 'knots', 'Maximum safe wind speed for takeoff and landing', '2024-11-28 20:19:32', '2024-11-28 20:19:32'),
(9, 'VISIBILITY', 3.00, NULL, 'miles', 'Minimum visibility required for normal operations', '2024-11-28 20:19:32', '2024-11-28 20:19:32'),
(10, 'TEMPERATURE', -30.00, 45.00, 'celsius', 'Safe temperature range for operations', '2024-11-28 20:19:32', '2024-11-28 20:19:32'),
(11, 'WIND_SPEED', 0.00, 40.00, 'knots', 'Absolute maximum wind speed for any operation', '2024-11-28 20:19:32', '2024-11-28 20:19:32'),
(12, 'WIND_SPEED', 0.00, 25.00, 'knots', 'Maximum crosswind component for narrow-body aircraft', '2024-11-28 20:19:32', '2024-11-28 20:19:32'),
(13, 'VISIBILITY', 0.50, NULL, 'miles', 'Minimum visibility for CAT III approaches', '2024-11-28 20:19:32', '2024-11-28 20:19:32'),
(14, 'VISIBILITY', 2.00, NULL, 'miles', 'Minimum visibility for CAT II approaches', '2024-11-28 20:19:32', '2024-11-28 20:19:32'),
(15, 'VISIBILITY', 3.00, NULL, 'miles', 'Minimum visibility for CAT I approaches', '2024-11-28 20:19:32', '2024-11-28 20:19:32'),
(16, 'TEMPERATURE', -40.00, 50.00, 'celsius', 'Extreme temperature operation limits', '2024-11-28 20:19:32', '2024-11-28 20:19:32'),
(17, 'PRECIPITATION', 0.00, 50.00, 'mm/hr', 'Maximum safe precipitation rate', '2024-11-28 20:19:32', '2024-11-28 20:19:32'),
(18, 'PRESSURE', 950.00, 1050.00, 'hPa', 'Safe atmospheric pressure range for operations', '2024-11-28 20:19:32', '2024-11-28 20:19:32');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `airports`
--
ALTER TABLE `airports`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `iata_code` (`iata_code`),
  ADD KEY `idx_airports_iata` (`iata_code`);

--
-- Indices de la tabla `learning_metrics`
--
ALTER TABLE `learning_metrics`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_metric_timestamp` (`metric_type`,`timestamp`);

--
-- Indices de la tabla `routes`
--
ALTER TABLE `routes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_routes_origin` (`origin_id`),
  ADD KEY `idx_routes_destination` (`destination_id`);

--
-- Indices de la tabla `rules`
--
ALTER TABLE `rules`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_rules_type` (`rule_type`),
  ADD KEY `idx_rules_priority` (`priority`);

--
-- Indices de la tabla `weather_constraints`
--
ALTER TABLE `weather_constraints`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_weather_condition_type` (`condition_type`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `airports`
--
ALTER TABLE `airports`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT de la tabla `learning_metrics`
--
ALTER TABLE `learning_metrics`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT de la tabla `routes`
--
ALTER TABLE `routes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=42;

--
-- AUTO_INCREMENT de la tabla `rules`
--
ALTER TABLE `rules`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT de la tabla `weather_constraints`
--
ALTER TABLE `weather_constraints`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `routes`
--
ALTER TABLE `routes`
  ADD CONSTRAINT `routes_ibfk_1` FOREIGN KEY (`origin_id`) REFERENCES `airports` (`id`),
  ADD CONSTRAINT `routes_ibfk_2` FOREIGN KEY (`destination_id`) REFERENCES `airports` (`id`);
COMMIT;
