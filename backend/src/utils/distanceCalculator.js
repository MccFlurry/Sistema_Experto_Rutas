class DistanceCalculator {
    static toRadians(degrees) {
        return degrees * Math.PI / 180;
    }

    static calculateDistance(lat1, lon1, lat2, lon2) {
        // Haversine formula for calculating great circle distance
        const R = 3440.065; // Earth's radius in nautical miles

        const φ1 = this.toRadians(lat1);
        const φ2 = this.toRadians(lat2);
        const Δφ = this.toRadians(lat2 - lat1);
        const Δλ = this.toRadians(lon2 - lon1);

        const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
                Math.cos(φ1) * Math.cos(φ2) *
                Math.sin(Δλ/2) * Math.sin(Δλ/2);
        
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

        return R * c;
    }

    static calculateBearing(lat1, lon1, lat2, lon2) {
        const φ1 = this.toRadians(lat1);
        const φ2 = this.toRadians(lat2);
        const λ1 = this.toRadians(lon1);
        const λ2 = this.toRadians(lon2);

        const y = Math.sin(λ2 - λ1) * Math.cos(φ2);
        const x = Math.cos(φ1) * Math.sin(φ2) -
                Math.sin(φ1) * Math.cos(φ2) * Math.cos(λ2 - λ1);
        
        const θ = Math.atan2(y, x);
        const bearing = (θ * 180 / Math.PI + 360) % 360;

        return bearing;
    }

    static calculateIntermediatePoint(lat1, lon1, lat2, lon2, fraction) {
        const φ1 = this.toRadians(lat1);
        const λ1 = this.toRadians(lon1);
        const φ2 = this.toRadians(lat2);
        const λ2 = this.toRadians(lon2);

        const sinφ1 = Math.sin(φ1), cosφ1 = Math.cos(φ1);
        const sinλ1 = Math.sin(λ1), cosλ1 = Math.cos(λ1);
        const sinφ2 = Math.sin(φ2), cosφ2 = Math.cos(φ2);
        const sinλ2 = Math.sin(λ2), cosλ2 = Math.cos(λ2);

        // Distance between points
        const Δφ = φ2 - φ1;
        const Δλ = λ2 - λ1;
        const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
                Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ/2) * Math.sin(Δλ/2);
        const δ = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

        const A = Math.sin((1-fraction)*δ) / Math.sin(δ);
        const B = Math.sin(fraction*δ) / Math.sin(δ);

        const x = A * cosφ1 * cosλ1 + B * cosφ2 * cosλ2;
        const y = A * cosφ1 * sinλ1 + B * cosφ2 * sinλ2;
        const z = A * sinφ1 + B * sinφ2;

        const φ3 = Math.atan2(z, Math.sqrt(x*x + y*y));
        const λ3 = Math.atan2(y, x);

        return {
            latitude: φ3 * 180 / Math.PI,
            longitude: λ3 * 180 / Math.PI
        };
    }

    static calculateRoutePoints(lat1, lon1, lat2, lon2, numPoints) {
        const points = [];
        for (let i = 0; i <= numPoints; i++) {
            const fraction = i / numPoints;
            points.push(this.calculateIntermediatePoint(lat1, lon1, lat2, lon2, fraction));
        }
        return points;
    }
}

module.exports = DistanceCalculator;
