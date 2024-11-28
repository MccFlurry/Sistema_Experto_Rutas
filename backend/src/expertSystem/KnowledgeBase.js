const pool = require('../config/database');

class KnowledgeBase {
    constructor() {
        this.rules = new Map();
        this.facts = new Map();
    }

    async loadRules() {
        try {
            const [rules] = await pool.query('SELECT * FROM rules WHERE is_active = true ORDER BY priority DESC');
            rules.forEach(rule => {
                this.rules.set(rule.id, {
                    type: rule.rule_type,
                    condition: JSON.parse(rule.condition_json),
                    action: JSON.parse(rule.action_json),
                    priority: rule.priority
                });
            });
            return true;
        } catch (error) {
            console.error('Error loading rules:', error);
            return false;
        }
    }

    async loadWeatherConstraints() {
        try {
            const [constraints] = await pool.query('SELECT * FROM weather_constraints');
            constraints.forEach(constraint => {
                this.facts.set(`weather_${constraint.condition_type}`, {
                    min: constraint.min_value,
                    max: constraint.max_value,
                    unit: constraint.unit
                });
            });
            return true;
        } catch (error) {
            console.error('Error loading weather constraints:', error);
            return false;
        }
    }

    evaluateCondition(condition, facts) {
        // Evaluate complex conditions using the condition JSON structure
        const evalNumericCondition = (value, operator, threshold) => {
            switch (operator) {
                case '>': return value > threshold;
                case '<': return value < threshold;
                case '>=': return value >= threshold;
                case '<=': return value <= threshold;
                case '==': return value === threshold;
                default: return false;
            }
        };

        if (condition.type === 'numeric') {
            return evalNumericCondition(
                facts[condition.variable],
                condition.operator,
                condition.value
            );
        } else if (condition.type === 'composite') {
            const results = condition.conditions.map(c => 
                this.evaluateCondition(c, facts)
            );
            return condition.operator === 'AND' 
                ? results.every(r => r)
                : results.some(r => r);
        }

        return false;
    }

    getRulesByType(type) {
        return Array.from(this.rules.values())
            .filter(rule => rule.type === type);
    }

    getWeatherConstraint(type) {
        return this.facts.get(`weather_${type}`);
    }
}

module.exports = new KnowledgeBase();
