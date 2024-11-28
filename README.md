# Sistema Experto de Rutas Aéreas

Un sistema integral para la planificación y optimización de rutas aéreas, utilizando algoritmos avanzados y capacidades de toma de decisiones inteligentes.

## Características

- Planificación inteligente de rutas utilizando algoritmo A* de búsqueda
- Análisis de condiciones climáticas y evaluación de riesgos
- Optimización de rutas multicriterio
- Visualización de mapas interactivos
- Seguimiento de vuelos en tiempo real
- Panel de control integral con métricas del sistema

## Tecnologías Utilizadas

- Frontend: React.js con Material-UI y Leaflet
- Backend: Express.js y Node.js
- Base de Datos: MySQL
- Sistema Experto: Implementación personalizada con encadenamiento hacia adelante

## Requisitos Previos

- Node.js (v14 o superior)
- MySQL (v8.0 o superior)
- Administrador de paquetes npm o yarn

## Instalación

1. Clonar el repositorio:
```bash
git clone <url-del-repositorio>
cd sistema_experto_rutas
```

2. Configurar la base de datos:
```bash
mysql -u root -p < database_setup.sql
```

3. Instalar dependencias del backend:
```bash
cd backend
npm install
```

4. Configurar variables de entorno del backend:
```bash
cp .env.example .env
# Editar .env con tus credenciales de base de datos y otras configuraciones
```

5. Instalar dependencias del frontend:
```bash
cd ../frontend
npm install
```

## Ejecución de la Aplicación

1. Iniciar servidor del backend:
```bash
cd backend
npm start
```

2. Iniciar servidor de desarrollo del frontend:
```bash
cd frontend
npm start
```

La aplicación estará disponible en:
- Frontend: http://localhost:3000
- API del Backend: http://localhost:5000

## Endpoints de la API

### Planificación de Rutas
- POST /api/route-planner/plan
- GET /api/route-planner/explanation/:routeId

### Aeropuertos
- GET /api/airports/search
- GET /api/airports/:iataCode

### Clima
- GET /api/weather?latitude=:lat&longitude=:lon

## Componentes del Sistema Experto

### Base de Conocimiento
- Sistema basado en reglas para toma de decisiones
- Restricciones y condiciones climáticas
- Criterios de optimización de rutas

### Motor de Inferencia
- Implementación de encadenamiento hacia adelante
- Algoritmo de búsqueda A*
- Toma de decisiones multicriterio

### Planificador de Rutas
- Optimización inteligente de rutas
- Evaluación de riesgos climáticos
- Generación de rutas alternativas

## Sistema de Aprendizaje

El sistema experto implementa un sofisticado mecanismo de aprendizaje que le permite mejorar continuamente sus decisiones basándose en la experiencia. Este proceso se realiza a través de varios componentes:

### 1. Aprendizaje de Reglas

El sistema utiliza una base de datos para almacenar y actualizar reglas de decisión. Cada regla tiene:
- Un tipo (RUTA, CLIMA, TIEMPO, COSTO)
- Condiciones en formato JSON
- Acciones a tomar
- Una prioridad que se ajusta según el éxito de las decisiones

Las reglas se actualizan de la siguiente manera:
- Si una decisión es exitosa, la prioridad de la regla aumenta
- Si una decisión falla, la prioridad disminuye
- Las reglas con mayor prioridad se aplican primero en futuras decisiones

### 2. Aprendizaje de Condiciones Climáticas

El sistema aprende de las condiciones climáticas ajustando dinámicamente sus restricciones:
- Mantiene un registro de límites seguros para diferentes condiciones (viento, visibilidad, temperatura)
- Ajusta estos límites basándose en el éxito de los vuelos
- Si un vuelo es exitoso en condiciones más extremas, los límites se expanden gradualmente
- Si hay problemas, los límites se hacen más conservadores

### 3. Retroalimentación Continua

El sistema implementa un ciclo de retroalimentación continua:
1. Planifica una ruta usando reglas y conocimiento actual
2. Recibe retroalimentación sobre el éxito de la ruta
3. Actualiza sus reglas y restricciones basándose en la retroalimentación
4. Utiliza el conocimiento actualizado para futuras planificaciones

### 4. Estructura de Datos de Aprendizaje

El aprendizaje se almacena en tablas SQL:
- `rules`: Almacena reglas y sus prioridades
- `weather_constraints`: Guarda límites aprendidos para condiciones climáticas
- Cada registro mantiene marcas de tiempo para seguir la evolución del aprendizaje

### 5. Implementación Técnica

El aprendizaje se implementa principalmente en dos clases:
- `LearningSystem`: Maneja la actualización de reglas y restricciones
- `KnowledgeBase`: Almacena y gestiona el conocimiento aprendido

El sistema utiliza:
- Encadenamiento hacia adelante para inferencia
- Algoritmo A* para optimización de rutas
- JSON para almacenar condiciones y acciones complejas
- Sistema de prioridades dinámico para reglas

### 6. Ventajas del Sistema

Este enfoque de aprendizaje proporciona:
- Adaptabilidad a nuevas situaciones
- Mejora continua basada en experiencia
- Balance entre seguridad y eficiencia
- Capacidad de manejar condiciones cambiantes
- Transparencia en la toma de decisiones
