const knowledgeBase = require('./KnowledgeBase');
const pool = require('../config/database');

class InferenceEngine {
    constructor() {
        this.workingMemory = new Map();
        this.explanations = [];
    }

    async initialize() {
        await knowledgeBase.loadRules();
        await knowledgeBase.loadWeatherConstraints();
    }

    // Forward chaining implementation
    async forwardChain(initialFacts) {
        this.workingMemory.clear();
        this.explanations = [];
        
        // Load initial facts into working memory
        Object.entries(initialFacts).forEach(([key, value]) => {
            this.workingMemory.set(key, value);
        });

        let changesMade;
        do {
            changesMade = false;
            for (const rule of knowledgeBase.rules.values()) {
                if (this.evaluateRule(rule)) {
                    const newFacts = this.executeAction(rule.action);
                    if (newFacts) {
                        changesMade = true;
                        this.explanations.push({
                            rule: rule,
                            facts: newFacts
                        });
                    }
                }
            }
        } while (changesMade);

        return {
            conclusions: Object.fromEntries(this.workingMemory),
            explanations: this.explanations
        };
    }

    evaluateRule(rule) {
        const facts = Object.fromEntries(this.workingMemory);
        return knowledgeBase.evaluateCondition(rule.condition, facts);
    }

    executeAction(action) {
        const newFacts = {};

        switch (action.type) {
            case 'ASSERT':
                action.facts.forEach(fact => {
                    this.workingMemory.set(fact.name, fact.value);
                    newFacts[fact.name] = fact.value;
                });
                break;

            case 'MODIFY':
                action.modifications.forEach(mod => {
                    if (this.workingMemory.has(mod.name)) {
                        const currentValue = this.workingMemory.get(mod.name);
                        const newValue = this.calculateModification(currentValue, mod);
                        this.workingMemory.set(mod.name, newValue);
                        newFacts[mod.name] = newValue;
                    }
                });
                break;

            case 'RETRACT':
                action.facts.forEach(factName => {
                    this.workingMemory.delete(factName);
                    newFacts[factName] = null;
                });
                break;
        }

        return Object.keys(newFacts).length > 0 ? newFacts : null;
    }

    calculateModification(currentValue, modification) {
        switch (modification.operation) {
            case 'ADD':
                return currentValue + modification.value;
            case 'SUBTRACT':
                return currentValue - modification.value;
            case 'MULTIPLY':
                return currentValue * modification.value;
            case 'DIVIDE':
                return currentValue / modification.value;
            default:
                return modification.value;
        }
    }

    // A* pathfinding algorithm implementation
    async findOptimalRoute(start, end, constraints) {
        const [airports] = await pool.query('SELECT * FROM airports');
        const [routes] = await pool.query('SELECT * FROM routes');
        
        const airportMap = new Map(airports.map(a => [a.id, a]));
        const routeMap = new Map();
        
        routes.forEach(route => {
            if (!routeMap.has(route.origin_id)) {
                routeMap.set(route.origin_id, []);
            }
            routeMap.get(route.origin_id).push(route);
        });

        const openSet = new Set([start]);
        const cameFrom = new Map();
        
        const gScore = new Map();
        gScore.set(start, 0);
        
        const fScore = new Map();
        fScore.set(start, this.heuristic(airportMap.get(start), airportMap.get(end)));

        while (openSet.size > 0) {
            const current = this.getLowestFScore(openSet, fScore);
            
            if (current === end) {
                return this.reconstructPath(cameFrom, current, airportMap, routeMap);
            }

            openSet.delete(current);
            const neighbors = routeMap.get(current) || [];

            for (const route of neighbors) {
                const neighbor = route.destination_id;
                const tentativeGScore = gScore.get(current) + this.calculateCost(route, constraints);

                if (!gScore.has(neighbor) || tentativeGScore < gScore.get(neighbor)) {
                    cameFrom.set(neighbor, current);
                    gScore.set(neighbor, tentativeGScore);
                    fScore.set(neighbor, tentativeGScore + 
                        this.heuristic(airportMap.get(neighbor), airportMap.get(end)));
                    
                    if (!openSet.has(neighbor)) {
                        openSet.add(neighbor);
                    }
                }
            }
        }

        return null; // No path found
    }

    heuristic(airport1, airport2) {
        // Calculate great circle distance
        const R = 3440.065; // Earth radius in nautical miles
        const lat1 = airport1.latitude * Math.PI / 180;
        const lat2 = airport2.latitude * Math.PI / 180;
        const dLat = lat2 - lat1;
        const dLon = (airport2.longitude - airport1.longitude) * Math.PI / 180;

        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(lat1) * Math.cos(lat2) * 
                Math.sin(dLon/2) * Math.sin(dLon/2);
        
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    }

    calculateCost(route, constraints) {
        let cost = route.distance;

        // Apply constraints
        if (constraints) {
            if (constraints.timeWeight) {
                cost += route.typical_duration * constraints.timeWeight;
            }
            // Add more constraint calculations as needed
        }

        return cost;
    }

    getLowestFScore(openSet, fScore) {
        return Array.from(openSet).reduce((lowest, current) => {
            if (!lowest) return current;
            return fScore.get(current) < fScore.get(lowest) ? current : lowest;
        }, null);
    }

    async reconstructPath(cameFrom, current, airportMap, routeMap) {
        const path = [current];
        const routeDetails = [];
        
        while (cameFrom.has(current)) {
            const previous = cameFrom.get(current);
            path.unshift(previous);
            
            // Find the route between previous and current
            const routes = routeMap.get(previous) || [];
            const route = routes.find(r => r.destination_id === current);
            
            if (route) {
                routeDetails.unshift({
                    origin: airportMap.get(previous),
                    destination: airportMap.get(current),
                    distance: route.distance,
                    duration: route.typical_duration
                });
            }
            
            current = previous;
        }

        return {
            airports: path.map(id => airportMap.get(id)),
            routes: routeDetails
        };
    }
}

module.exports = new InferenceEngine();
