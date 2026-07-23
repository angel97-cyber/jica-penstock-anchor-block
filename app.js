/**
 * HydroBlock Pro - Calculation Engine & CAD Coordinator
 */

// Global State
const state = {
    currentStep: 1,
    activePreset: 'ab13',
    selectedCaseIndex: 0, // for step-by-step rendering
    results: {
        forces: {},
        cases: []
    },
    jicaAuditMode: false, // Clean physics-corrected equations by default (no PDF typos)
    simPlane: 'xz',
    activeBlueprintView: 'plan', // Active drafting view tab
    selectedForceComponent: null, // Active force component detail row
    
    // CAD Geometry Coordinates Input
    coordinates: {
        // Step 1: Plan View XY
        xyCoords: [
            { x: 0.0, y: 0.0 },
            { x: 6.17, y: 0.0 },
            { x: 6.17, y: 4.719 },
            { x: 0.0, y: 4.719 }
        ],
        // Pipe axis XY
        pipeXY: [
            { x: 0.0, y: 2.0 },
            { x: 3.0, y: 2.0 },
            { x: 6.17, y: 2.0 }
        ],
        // Cut Line (Path coords in X-Y)
        cutLineCoords: [
            { x: 0.0, y: 2.0 },
            { x: 6.17, y: 2.0 }
        ],
        
        // Step 2: Profile View XZ (horizontal B X coordinate range [0, L_cut])
        xzCoords: [
            { x: 0.0, z: 0.992 },
            { x: 0.0, z: 4.992 },
            { x: 3.544, z: 4.992 },
            { x: 6.170, z: 3.447 },
            { x: 4.141, z: 0.0 }
        ],
        // Pipe profile vertical X and Z coordinates
        pipeXZ: [
            { x: 0.0, z: 3.533 },
            { x: 3.0, z: 3.000 },
            { x: 6.17, z: 3.000 }
        ],
        // Ground level profile coordinates
        groundCoords: [
            { x: 0.0, z: 4.5 },
            { x: 6.17, z: 4.0 }
        ],
        
        // Step 3: Cross Section YZ
        yzCoords: [
            { y: 0.0, z: 0.0 },
            { y: 4.719, z: 0.0 },
            { y: 4.719, z: 5.0 },
            { y: 0.0, z: 5.0 }
        ],
        // Pipe center in YZ
        pipeCenterYZ: {
            y: 2.0,
            z: 3.0
        }
    },
    
    // Core Engineering Parameters (Option to change)
    params: {
        // Geometry calculated
        B: 5.901,
        W: 5.000,
        H_ab: 4.992,
        B_yz: 4.719,
        
        // Material unit weights
        wc: 2.3, // Concrete weight t/m³
        rs: 7.85, // Steel weight t/m³
        
        // Pipe specs
        D: 2.000,
        t: 0.009,
        t_prime: 0.009,
        L: 5.188,
        L_prime: 0.000,
        l: 7.188,
        l_prime: 0.000,
        
        // Hydraulic parameters
        H: 15.500,
        He: 17.500,
        He_prime: 0.000,
        Q: 9.6,
        
        // Friction parameters
        c: 0.25,      // Pipe-saddle friction
        f: 0.02,      // Water-steel friction
        fe: 0.7,      // Joint slip friction line force t/m
        lambda: 0.65,  // Base friction Concrete-Foundation
        
        // Geotechnical / Seismic
        qa: 100.0,    // Allowable bearing capacity t/m²
        Kh: 0.15,     // Seismic coefficient
        
        buriedCondition: true,
        mitigation_active: true,
        h_key: 0.40,
        n_anchors: 0,
        d_anchor: 25.0,
        fy_anchor: 415.0,
        bearing_increase_factor: 1.50,
        soil_cohesion: 1.50,
        soil_friction_angle: 30.0,
        soil_unit_weight: 1.80
    }
};

// Presets Configurations
const presets = {
    ab13: {
        name: "JICA AB No. 1-3 Coordinates",
        params: {
            B: 5.901, W: 5.000, H_ab: 4.992, B_yz: 4.719, wc: 2.3, rs: 7.85,
            D: 2.000, t: 0.009, t_prime: 0.009, L: 5.188, L_prime: 0.000, l: 7.188, l_prime: 0.000,
            H: 15.5, He: 17.5, He_prime: 0.0, Q: 9.6,
            c: 0.25, f: 0.02, fe: 0.7, lambda: 0.65, qa: 100.0, Kh: 0.15, 
            buriedCondition: true, mitigation_active: true, h_key: 0.40, bearing_increase_factor: 1.50,
            soil_cohesion: 1.50, soil_friction_angle: 30.0, soil_unit_weight: 1.80
        },
        coordinates: {
            xyCoords: [
                { x: 0.0, y: 0.0 },
                { x: 5.901, y: 0.0 },
                { x: 5.901, y: 4.719 },
                { x: 0.0, y: 4.719 }
            ],
            pipeXY: [
                { x: 0.0, y: 2.0 },
                { x: 3.0, y: 2.0 },
                { x: 5.901, y: 3.707 }
            ],
            cutLineCoords: [ { x: 0.0, y: 2.0 }, { x: 5.901, y: 2.0 } ],
            xzCoords: [
                { x: 0.0, z: 0.992 },
                { x: 0.0, z: 4.992 },
                { x: 3.390, z: 4.992 },
                { x: 5.901, z: 3.447 },
                { x: 3.961, z: 0.0 }
            ],
            pipeXZ: [
                { x: 0.0, z: 3.533 },
                { x: 3.0, z: 3.000 },
                { x: 5.901, z: 2.485 }
            ],
            groundCoords: [
                { x: 0.0, z: 4.5 },
                { x: 5.901, z: 4.0 }
            ],
            yzCoords: [
                { y: 0.0, z: 0.0 },
                { y: 4.719, z: 0.0 },
                { y: 4.719, z: 5.0 },
                { y: 0.0, z: 5.0 }
            ],
            pipeCenterYZ: { y: 2.0, z: 3.0 }
        }
    },
    ab23: {
        name: "JICA AB No. 2-3 Coordinates",
        params: {
            B: 5.901, W: 5.000, H_ab: 4.992, B_yz: 4.719, wc: 2.3, rs: 7.85,
            D: 2.000, t: 0.009, t_prime: 0.009, L: 5.070, L_prime: 5.564, l: 8.070, l_prime: 10.022,
            H: 18.75, He: 20.5, He_prime: 17.5, Q: 9.6,
            c: 0.25, f: 0.02, fe: 0.7, lambda: 0.65, qa: 100.0, Kh: 0.15, 
            buriedCondition: true, mitigation_active: true, h_key: 0.40, bearing_increase_factor: 1.50,
            soil_cohesion: 1.50, soil_friction_angle: 30.0, soil_unit_weight: 1.80
        },
        coordinates: {
            xyCoords: [
                { x: 0.0, y: 0.0 },
                { x: 5.901, y: 0.0 },
                { x: 5.901, y: 4.719 },
                { x: 0.0, y: 4.719 }
            ],
            pipeXY: [
                { x: 0.0, y: 2.0 },
                { x: 3.0, y: 2.0 },
                { x: 5.901, y: 3.707 }
            ],
            cutLineCoords: [ { x: 0.0, y: 2.0 }, { x: 5.901, y: 2.0 } ],
            xzCoords: [
                { x: 0.0, z: 0.992 },
                { x: 0.0, z: 4.992 },
                { x: 3.390, z: 4.992 },
                { x: 5.901, z: 3.447 },
                { x: 3.961, z: 0.0 }
            ],
            pipeXZ: [
                { x: 0.0, z: 3.533 },
                { x: 3.0, z: 3.000 },
                { x: 5.901, z: 2.485 }
            ],
            groundCoords: [
                { x: 0.0, z: 4.5 },
                { x: 5.901, z: 4.0 }
            ],
            yzCoords: [
                { y: 0.0, z: 0.0 },
                { y: 4.719, z: 0.0 },
                { y: 4.719, z: 5.0 },
                { y: 0.0, z: 5.0 }
            ],
            pipeCenterYZ: { y: 2.0, z: 3.0 }
        }
    },
    nepal: {
        name: "🇳🇵 Nepal HPP Coordinates (Steep Slope)",
        params: {
            B: 8.000, W: 6.000, H_ab: 6.000, B_yz: 5.500, wc: 2.3, rs: 7.85,
            D: 1.600, t: 0.016, t_prime: 0.014, L: 15.000, L_prime: 12.000, l: 10.000, l_prime: 8.000,
            H: 450.0, He: 460.0, He_prime: 440.0, Q: 14.5,
            c: 0.25, f: 0.02, fe: 0.7, lambda: 0.55, qa: 250.0, Kh: 0.20, 
            buriedCondition: true, mitigation_active: true, h_key: 0.40, bearing_increase_factor: 1.50,
            soil_cohesion: 1.50, soil_friction_angle: 30.0, soil_unit_weight: 1.80
        },
        coordinates: {
            xyCoords: [
                { x: 0.0, y: 0.0 },
                { x: 8.00, y: 0.0 },
                { x: 8.00, y: 5.500 },
                { x: 0.0, y: 5.500 }
            ],
            pipeXY: [
                { x: 0.0, y: 2.75 },
                { x: 4.0, y: 2.75 },
                { x: 8.0, y: 4.75 }
            ],
            cutLineCoords: [ { x: 0.0, y: 2.75 }, { x: 8.0, y: 2.75 } ],
            xzCoords: [
                { x: 0.0, z: 1.200 },
                { x: 0.0, z: 6.000 },
                { x: 4.500, z: 6.000 },
                { x: 8.000, z: 4.000 },
                { x: 6.000, z: 0.000 }
            ],
            pipeXZ: [
                { x: 0.0, z: 5.232 },
                { x: 4.0, z: 3.500 },
                { x: 8.0, z: 1.768 }
            ],
            groundCoords: [
                { x: 0.0, z: 5.5 },
                { x: 8.0, z: 4.5 }
            ],
            yzCoords: [
                { y: 0.0, z: 0.0 },
                { y: 5.500, z: 0.0 },
                { y: 5.500, z: 6.0 },
                { y: 0.0, z: 6.0 }
            ],
            pipeCenterYZ: { y: 2.75, z: 3.5 }
        }
    }
};

// Math functions
function rad(deg) { return deg * Math.PI / 180; }
function deg(rad) { return rad * 180 / Math.PI; }

function sortVertices(points) {
    if (points.length <= 3) return [...points];
    let minX = Infinity, maxX = -Infinity;
    let minZ = Infinity, maxZ = -Infinity;
    points.forEach(pt => {
        if (pt.x < minX) minX = pt.x;
        if (pt.x > maxX) maxX = pt.x;
        if (pt.z < minZ) minZ = pt.z;
        if (pt.z > maxZ) maxZ = pt.z;
    });
    const x_center = (minX + maxX) / 2.0;
    const z_center = (minZ + maxZ) / 2.0;
    return [...points].sort((a, b) => {
        return Math.atan2(a.z - z_center, a.x - x_center) - Math.atan2(b.z - z_center, b.x - x_center);
    });
}

function getClippedSegmentLength(x1, z1, x2, z2, xMin, xMax) {
    const x1_prime = Math.max(xMin, Math.min(x1, xMax));
    const x2_prime = Math.max(xMin, Math.min(x2, xMax));
    
    let z1_prime, z2_prime;
    if (Math.abs(x2 - x1) > 1e-6) {
        z1_prime = z1 + (x1_prime - x1) * (z2 - z1) / (x2 - x1);
        z2_prime = z1 + (x2_prime - x1) * (z2 - z1) / (x2 - x1);
    } else {
        if (x1 < xMin || x1 > xMax) return 0;
        z1_prime = z1;
        z2_prime = z2;
    }
    return Math.sqrt((x2_prime - x1_prime) ** 2 + (z2_prime - z1_prime) ** 2);
}

function fNum(val, dec) {
    if (val === undefined || val === null) return '0.00';
    if (typeof val === 'string') return val;
    if (val === Infinity || val === -Infinity) return 'Overturned';
    if (isNaN(val)) return '0.00';
    return val.toFixed(dec);
}

/**
 * Point In Polygon Raycasting Checker
 */
function isPointInPolygon(point, polygon) {
    let x = (point.x !== undefined) ? point.x : point.y;
    let y = (point.z !== undefined) ? point.z : (point.y !== undefined ? point.y : 0);
    
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        let xi = (polygon[i].x !== undefined) ? polygon[i].x : polygon[i].y;
        let yi = (polygon[i].z !== undefined) ? polygon[i].z : polygon[i].y;
        let xj = (polygon[j].x !== undefined) ? polygon[j].x : polygon[j].y;
        let yj = (polygon[j].z !== undefined) ? polygon[j].z : polygon[j].y;
        
        let intersect = ((yi > y) !== (yj > y))
            && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }
    return inside;
}

/**
 * Core Physics Calculation Engine
 */
function calculateStability() {
    const p = state.params;
    const c = state.coordinates;
    const g = 9.80665;
    
    // --- 1. Dynamic Geometry Angles Calculations ---
    // Horizontal bend angle (theta) from Plan pipe centerline coordinates
    const v1_x = c.pipeXY[1].x - c.pipeXY[0].x;
    const v1_y = c.pipeXY[1].y - c.pipeXY[0].y;
    const v2_x = c.pipeXY[2].x - c.pipeXY[1].x;
    const v2_y = c.pipeXY[2].y - c.pipeXY[1].y;
    
    const dot_prod = v1_x * v2_x + v1_y * v2_y;
    const mag1 = Math.sqrt(v1_x**2 + v1_y**2);
    const mag2 = Math.sqrt(v2_x**2 + v2_y**2);
    
    // Horizontal bend angle (theta)
    const magProduct = mag1 * mag2;
    const theta_val = magProduct > 0.0001 ? Math.acos(Math.max(-1.0, Math.min(1.0, dot_prod / magProduct))) : 0.0;
    p.theta = deg(theta_val);
    
    // Vertical angles delta, delta' from profile pipe coordinates (signed: positive = descending)
    const dx_up = Math.abs(c.pipeXZ[1].x - c.pipeXZ[0].x);
    const dx_down = Math.abs(c.pipeXZ[2].x - c.pipeXZ[1].x);
    const dz_up = c.pipeXZ[0].z - c.pipeXZ[1].z;
    const dz_down = c.pipeXZ[1].z - c.pipeXZ[2].z;
    
    const delta_val = Math.atan2(dz_up, dx_up || 0.001);
    const delta_prime_val = Math.atan2(dz_down, dx_down || 0.001);
    p.delta = deg(delta_val);
    p.delta_prime = deg(delta_prime_val);
    
    // Signed vertical deflection angle
    const phi_val = delta_val - delta_prime_val;
    
    // --- 2. Pipe Derived Weights ---
    const A_pipe = Math.PI * (p.D ** 2) / 4.0;
    const v_water = p.Q / A_pipe;
    const w = A_pipe * 1.0; // water weight t/m
    const s = Math.PI * p.D * p.t * p.rs; // shell weight upstream
    const s_prime = Math.PI * p.D * p.t_prime * p.rs; // downstream
    
    // --- 3. Profile Area of X-Z (Sorted clockwise/counter-clockwise for robust Shoelace computation) ---
    const sortedXZ = sortVertices(c.xzCoords);
    let A_profile = 0;
    let n = sortedXZ.length;
    for (let i = 0; i < n; i++) {
        let next = (i + 1) % n;
        A_profile += sortedXZ[i].x * sortedXZ[next].z - sortedXZ[next].x * sortedXZ[i].z;
    }
    A_profile = Math.abs(A_profile) / 2.0;
    
    // Profile CG coordinates
    let Cx = 0, Cz = 0;
    for (let i = 0; i < n; i++) {
        let next = (i + 1) % n;
        let factor = sortedXZ[i].x * sortedXZ[next].z - sortedXZ[next].x * sortedXZ[i].z;
        Cx += (sortedXZ[i].x + sortedXZ[next].x) * factor;
        Cz += (sortedXZ[i].z + sortedXZ[next].z) * factor;
    }
    Cx = Cx / (6.0 * A_profile);
    Cz = Cz / (6.0 * A_profile);
    
    // --- 4. Concrete Volume & Dead Weight WA ---
    // Clip the pipe centerline segment within the block base horizontal bounds [0, p.B]
    const L_internal = getClippedSegmentLength(c.pipeXZ[0].x, c.pipeXZ[0].z, c.pipeXZ[1].x, c.pipeXZ[1].z, 0.0, p.B) +
                       getClippedSegmentLength(c.pipeXZ[1].x, c.pipeXZ[1].z, c.pipeXZ[2].x, c.pipeXZ[2].z, 0.0, p.B);
    const V_pipe = A_pipe * L_internal;
    const V_concrete = A_profile * p.W - V_pipe;
    let WA = V_concrete * p.wc;
    
    if (p.buriedCondition) {
        let soilCoverDepth = 1.5;
        if (c.groundCoords && c.groundCoords.length > 0) {
            const blockTopZ = Math.max(...c.xzCoords.map(pt => pt.z));
            const avgGroundZ = c.groundCoords.reduce((sum, pt) => sum + pt.z, 0) / c.groundCoords.length;
            soilCoverDepth = Math.max(0.0, avgGroundZ - blockTopZ);
        }
        WA += p.B * p.W * soilCoverDepth * (p.soil_unit_weight || 1.8);
    }
    
    const x_CG = Math.abs(Cx);
    const z_CG = Math.abs(Cz);
    
    // Composite polygon centroid calculation for Y-Z profile (Finding M-1)
    let y_CG_stability;
    const sortedYZ = sortVertices(c.yzCoords);
    let A_yz = 0, Cy = 0;
    let n_yz = sortedYZ.length;
    for (let i = 0; i < n_yz; i++) {
        let next = (i + 1) % n_yz;
        let factor = sortedYZ[i].y * sortedYZ[next].z - sortedYZ[next].y * sortedYZ[i].z;
        A_yz += factor;
        Cy += (sortedYZ[i].y + sortedYZ[next].y) * factor;
    }
    A_yz = Math.abs(A_yz) / 2.0;
    if (A_yz > 0.001) {
        y_CG_stability = Math.abs(Cy / (6.0 * A_yz));
    } else {
        y_CG_stability = p.B_yz / 2.0;
    }
    
    // --- 5. Thrust Force Calculations (Magnitude & Vectors) ---
    const W_val = 0.5 * (w + s) * p.l * Math.cos(delta_val);
    const W_prime_val = 0.5 * (w + s_prime) * p.l_prime * Math.cos(delta_prime_val);
    
    const W_vec = { x: -W_val * Math.sin(delta_val), y: 0.0, z: -W_val * Math.cos(delta_val) };
    const W_prime_vec = {
        x: -W_prime_val * Math.sin(delta_prime_val) * Math.cos(theta_val),
        y: -W_prime_val * Math.sin(delta_prime_val) * Math.sin(theta_val),
        z: -W_prime_val * Math.cos(delta_prime_val)
    };
    
    const P1_val = s * p.L * Math.sin(delta_val);
    const P1_prime_val = s_prime * p.L_prime * Math.sin(delta_prime_val);
    
    const P1_vec = { x: P1_val * Math.cos(delta_val), y: 0.0, z: -P1_val * Math.sin(delta_val) };
    const P1_prime_vec = {
        x: P1_prime_val * Math.cos(delta_prime_val) * Math.cos(theta_val),
        y: -P1_prime_val * Math.cos(delta_prime_val) * Math.sin(theta_val),
        z: -P1_prime_val * Math.sin(delta_prime_val)
    };
    
    const gamma_w = 1.0;
    const P2_val = (2 * p.f * (p.Q ** 2) / (g * Math.PI * (p.D ** 3))) * p.L * gamma_w;
    const P2_prime_val = (2 * p.f * (p.Q ** 2) / (g * Math.PI * (p.D ** 3))) * p.L_prime * gamma_w;
    
    const P2_vec = { x: P2_val * Math.cos(delta_val), y: 0.0, z: -P2_val * Math.sin(delta_val) };
    const P2_prime_vec = {
        x: P2_prime_val * Math.cos(delta_prime_val) * Math.cos(theta_val),
        y: -P2_prime_val * Math.cos(delta_prime_val) * Math.sin(theta_val),
        z: -P2_prime_val * Math.sin(delta_prime_val)
    };
    
    const Pv_val = 2 * (v_water ** 2) / g * A_pipe * Math.sin(Math.abs(phi_val) / 2.0) * gamma_w;
    const Ph_val = 2 * (v_water ** 2) / g * A_pipe * Math.sin(theta_val / 2.0) * gamma_w;
    
    const Pv_vec = { x: Pv_val * Math.sin(Math.abs(phi_val) / 2.0), y: 0.0, z: Pv_val * Math.cos(Math.abs(phi_val) / 2.0) };
    const Ph_vec = { x: Ph_val * Math.sin(theta_val / 2.0), y: Ph_val * Math.cos(theta_val / 2.0), z: 0.0 };
    
    const P3_val = p.He * Math.PI * p.D * p.t * gamma_w;
    const P3_prime_val = p.He_prime * Math.PI * p.D * p.t_prime * gamma_w;
    
    const P3_vec = { x: P3_val * Math.cos(delta_val), y: 0.0, z: -P3_val * Math.sin(delta_val) };
    const P3_prime_vec = {
        x: -P3_prime_val * Math.cos(delta_prime_val) * Math.cos(theta_val),
        y: P3_prime_val * Math.cos(delta_prime_val) * Math.sin(theta_val),
        z: P3_prime_val * Math.sin(delta_prime_val)
    };
    
    const Prv_val = 2 * p.H * A_pipe * Math.sin(Math.abs(phi_val) / 2.0) * gamma_w;
    const Prh_val = 2 * p.H * A_pipe * Math.sin(theta_val / 2.0) * gamma_w;
    
    const Prv_vec = { x: Prv_val * Math.sin(Math.abs(phi_val) / 2.0), y: 0.0, z: Prv_val * Math.cos(Math.abs(phi_val) / 2.0) };
    const Prh_vec = { x: Prh_val * Math.sin(theta_val / 2.0), y: Prh_val * Math.cos(theta_val / 2.0), z: 0.0 };
    
    const P_vec = {
        x: W_vec.x + W_prime_vec.x + P1_vec.x + P1_prime_vec.x + P2_vec.x + P2_prime_vec.x + Pv_vec.x + Ph_vec.x + P3_vec.x + P3_prime_vec.x + Prv_vec.x + Prh_vec.x,
        y: W_vec.y + W_prime_vec.y + P1_vec.y + P1_prime_vec.y + P2_vec.y + P2_prime_vec.y + Pv_vec.y + Ph_vec.y + P3_vec.y + P3_prime_vec.y + Prv_vec.y + Prh_vec.y,
        z: W_vec.z + W_prime_vec.z + P1_vec.z + P1_prime_vec.z + P2_vec.z + P2_prime_vec.z + Pv_vec.z + Ph_vec.z + P3_vec.z + P3_prime_vec.z + Prv_vec.z + Prh_vec.z
    };
    
    const F1 = p.L > 0 ? p.c * (w + s) * (p.L - p.l / 2.0) * Math.cos(delta_val) : 0;
    const F1_prime = p.L_prime > 0 ? p.c * (w + s_prime) * (p.L_prime - p.l_prime / 2.0) * Math.cos(delta_prime_val) : 0;
    const F2 = p.fe * Math.PI * (p.D + 2 * p.t);
    const F2_prime = p.fe * Math.PI * (p.D + 2 * p.t_prime);
    const F_total = F1 + F2;
    const F_prime = F1_prime + F2_prime;
    
    const F_vec = { x: F_total * Math.cos(delta_val), y: 0.0, z: -F_total * Math.sin(delta_val) };
    const F_prime_vec = {
        x: F_prime * Math.cos(delta_prime_val) * Math.cos(theta_val),
        y: -F_prime * Math.cos(delta_prime_val) * Math.sin(theta_val),
        z: -F_prime * Math.sin(delta_prime_val)
    };
    
    const F_WA = p.Kh * WA;
    const F_p = p.Kh * ((w + s) * p.l / 2.0 + (w + s_prime) * p.l_prime / 2.0);
    
    state.results.forces = {
        WA, V_concrete, V_pipe, A_profile, L_internal, x_CG, y_CG_stability, z_CG,
        W: W_vec, W_prime: W_prime_vec, P1: P1_vec, P1_prime: P1_prime_vec,
        P2: P2_vec, P2_prime: P2_prime_vec, Pv: Pv_vec, Ph: Ph_vec,
        P3: P3_vec, P3_prime: P3_prime_vec, Prv: Prv_vec, Prh: Prh_vec,
        P_vec, F1, F1_prime, F2, F2_prime, F: F_vec, F_prime: F_prime_vec,
        F_WA, F_p
    };

    state.results.cases = [];
    const loadCombos = [
        { name: 'Case-1', eq: 'P+F+F\'', fSign: 1.0, fPrimeSign: 1.0 },
        { name: 'Case-2', eq: 'P+F-F\'', fSign: 1.0, fPrimeSign: -1.0 },
        { name: 'Case-3', eq: 'P-F+F\'', fSign: -1.0, fPrimeSign: 1.0 },
        { name: 'Case-4', eq: 'P-F-F\'', fSign: -1.0, fPrimeSign: -1.0 }
    ];
    
    let z_min = c.xzCoords.length > 0 ? c.xzCoords[0].z : 0.0;
    c.xzCoords.forEach(pt => { if (pt.z < z_min) z_min = pt.z; });
    const A_base = state.jicaAuditMode ? A_profile : (p.B * p.W);

    loadCombos.forEach(c => {
        const Rx = P_vec.x + c.fSign * F_vec.x + c.fPrimeSign * F_prime_vec.x;
        const Ry = P_vec.y + c.fSign * F_vec.y + c.fPrimeSign * F_prime_vec.y;
        const Rz = P_vec.z + c.fSign * F_vec.z + c.fPrimeSign * F_prime_vec.z;

        const h_CG_val = state.jicaAuditMode ? 2.500 : (z_CG - z_min);
        const h_pipe_val = state.jicaAuditMode ? 3.000 : ((state.coordinates.pipeXZ && state.coordinates.pipeXZ[1] ? state.coordinates.pipeXZ[1].z : p.H_ab / 2.0) - z_min);
        const x_pipe = state.jicaAuditMode ? 3.000 : (state.coordinates.pipeXZ && state.coordinates.pipeXZ[1] ? state.coordinates.pipeXZ[1].x : p.B / 2.0);

        [-1.0, 1.0].forEach(eqSign => {
            const totalV = -WA + Rz;
            const momV = -WA * x_CG + Rz * x_pipe;
            
            const seismicTotal = eqSign * (F_WA + F_p);
            const totalH = seismicTotal + Rx;
            const momH = eqSign * F_WA * h_CG_val + eqSign * F_p * h_pipe_val + Rx * h_pipe_val;
            
            const A_s = (Math.PI * Math.pow(p.d_anchor || 25, 2)) / 4.0;
            const T_allow = p.mitigation_active ? ((p.n_anchors || 0) * A_s * (p.fy_anchor || 415) * 1e-4 * 0.6) : 0.0;
            const V_allow_anchors = p.mitigation_active ? ((p.n_anchors || 0) * A_s * (p.fy_anchor || 415) * 1e-4 * 0.4) : 0.0;
            const R_key_val = p.mitigation_active ? (15.0 * (p.h_key || 0) * p.W) : 0.0;
            
            const totalV_clamped = totalV - T_allow;
            const x_anchor = totalH >= 0 ? 1.0 : (p.B - 1.0);
            const momV_mitigation = p.mitigation_active ? (-T_allow * x_anchor) : 0.0;
            const momV_clamped = momV + momV_mitigation;
            
            const sumM = momV_clamped - momH;
            const x_res = sumM / totalV_clamped;
            const B_x = p.B;
            const e = Math.abs(B_x / 2.0 - x_res);
            
            const eqLabelVal = eqSign < 0 ? '-x EQ' : '+x EQ';
            const limit_e = state.jicaAuditMode ? (B_x / 6.0) : (B_x / 4.0);
            const eccentricityPass = e <= limit_e;
            
            const d_embed = Math.max(0.0, (state.coordinates.groundCoords[state.coordinates.groundCoords.length - 1].z - z_min));
            const phi_rad = rad(p.soil_friction_angle || 30.0);
            const K_p = (1.0 + Math.sin(phi_rad)) / (1.0 - Math.sin(phi_rad));
            const P_p = (p.buriedCondition && !state.jicaAuditMode) ? (0.5 * K_p * (p.soil_unit_weight || 1.8) * (d_embed ** 2) * p.W) : 0.0;
            const R_cohesion = (p.buriedCondition && !state.jicaAuditMode) ? ((p.soil_cohesion || 1.5) * A_base) : 0.0;
            
            const Fs = (Math.abs(totalV_clamped) * p.lambda + R_key_val + V_allow_anchors + P_p + R_cohesion) / Math.abs(totalH);
            const limit_Fs = state.jicaAuditMode ? 2.0 : 1.2;
            const slidingPass = Fs >= limit_Fs;
            
            let M_R = 0;
            let M_O = Math.abs(momH);
            let M_R_anchors = p.mitigation_active ? (T_allow * (B_x - 1.0)) : 0.0;
            if (totalH >= 0) {
                M_R = WA * (B_x - x_CG) - Rz * (B_x - x_pipe);
            } else {
                M_R = WA * x_CG - Rz * x_pipe;
            }
            const Fot = M_O > 0.001 ? Math.abs((M_R + M_R_anchors) / M_O) : 999.0;
            const overturningFSPass = Fot >= limit_Fs;
            
            const allowedBearing = state.jicaAuditMode ? p.qa : (p.qa * (p.bearing_increase_factor || 1.50));
            
            let sigma_max = Math.abs(totalV_clamped / A_base) * (1.0 + 6.0 * e / B_x);
            let isLiftOff = false;
            let bearingPass = true;
            
            if (e >= B_x / 2.0) {
                sigma_max = "N/A (Overturned)";
                bearingPass = false;
            } else if ((B_x / 2.0 - e) < 0.10) {
                sigma_max = "FAIL (Edge Crushing/Overturned)";
                bearingPass = false;
            } else if (e > B_x / 6.0) {
                sigma_max = (2.0 * Math.abs(totalV_clamped)) / (3.0 * (B_x / 2.0 - e) * p.W);
                isLiftOff = true;
                bearingPass = sigma_max < allowedBearing;
            } else {
                bearingPass = sigma_max < allowedBearing;
            }
            
            state.results.cases.push({
                caseName: c.name,
                eqLabel: eqLabelVal,
                plane: 'X-Z',
                combination: c.eq,
                totalV: totalV_clamped,
                totalH: totalH,
                e: e,
                limit_e: limit_e,
                Fs: Fs,
                Fot: Fot,
                sigma: sigma_max,
                isLiftOff: isLiftOff,
                eccentricityPass,
                overturningFSPass,
                slidingPass,
                bearingPass,
                limit_qa: allowedBearing,
                P_p: P_p,
                R_cohesion: R_cohesion,
                passed: eccentricityPass && overturningFSPass && slidingPass && bearingPass,
                momV: momV_clamped, momH, sumM, x_res, Rx, Ry, Rz
            });
        });

        [-1.0, 1.0].forEach(eqSign => {
            const totalV = -WA + Rz;
            const y_pipe = p.B_yz / 2.0;
            const momV = -WA * y_CG_stability + Rz * y_pipe;
            
            const seismicTotal = eqSign * (F_WA + F_p);
            const totalH = seismicTotal + Ry;
            const momH = eqSign * F_WA * h_CG_val + eqSign * F_p * h_pipe_val + Ry * h_pipe_val;
            
            const A_s = (Math.PI * Math.pow(p.d_anchor || 25, 2)) / 4.0;
            const T_allow = p.mitigation_active ? ((p.n_anchors || 0) * A_s * (p.fy_anchor || 415) * 1e-4 * 0.6) : 0.0;
            const V_allow_anchors = p.mitigation_active ? ((p.n_anchors || 0) * A_s * (p.fy_anchor || 415) * 1e-4 * 0.4) : 0.0;
            const R_key_val = p.mitigation_active ? (15.0 * (p.h_key || 0) * p.B) : 0.0;
            
            const totalV_clamped = totalV - T_allow;
            const y_anchor = totalH >= 0 ? 0.5 : (p.B_yz - 0.5);
            const momV_mitigation = p.mitigation_active ? (-T_allow * y_anchor) : 0.0;
            const momV_clamped = momV + momV_mitigation;
            
            const sumM = momV_clamped - momH;
            const y_res = sumM / totalV_clamped;
            const B_y = p.B_yz;
            const e = Math.abs(B_y / 2.0 - y_res);
            
            const eqLabelVal = eqSign < 0 ? '-y EQ' : '+y EQ';
            const limit_e = state.jicaAuditMode ? (B_y / 6.0) : (B_y / 4.0);
            const eccentricityPass = e <= limit_e;
            
            const d_embed = Math.max(0.0, (state.coordinates.groundCoords[state.coordinates.groundCoords.length - 1].z - z_min));
            const phi_rad = rad(p.soil_friction_angle || 30.0);
            const K_p = (1.0 + Math.sin(phi_rad)) / (1.0 - Math.sin(phi_rad));
            const P_p = (p.buriedCondition && !state.jicaAuditMode) ? (0.5 * K_p * (p.soil_unit_weight || 1.8) * (d_embed ** 2) * p.B) : 0.0;
            const R_cohesion = (p.buriedCondition && !state.jicaAuditMode) ? ((p.soil_cohesion || 1.5) * A_base) : 0.0;
            
            const Fs = (Math.abs(totalV_clamped) * p.lambda + R_key_val + V_allow_anchors + P_p + R_cohesion) / Math.abs(totalH);
            const limit_Fs = state.jicaAuditMode ? 2.0 : 1.2;
            const slidingPass = Fs >= limit_Fs;
            
            let M_R = 0;
            let M_O = Math.abs(momH);
            let M_R_anchors = p.mitigation_active ? (T_allow * (B_y - 0.5)) : 0.0;
            if (totalH >= 0) {
                M_R = WA * (B_y - y_CG_stability) - Rz * (B_y - y_pipe);
            } else {
                M_R = WA * y_CG_stability - Rz * y_pipe;
            }
            const Fot = M_O > 0.001 ? Math.abs((M_R + M_R_anchors) / M_O) : 999.0;
            const overturningFSPass = Fot >= limit_Fs;
            
            const allowedBearing = state.jicaAuditMode ? p.qa : (p.qa * (p.bearing_increase_factor || 1.50));
            
            let sigma_max = Math.abs(totalV_clamped / A_base) * (1.0 + 6.0 * e / B_y);
            let isLiftOff = false;
            let bearingPass = true;
            
            if (e >= B_y / 2.0) {
                sigma_max = "N/A (Overturned)";
                bearingPass = false;
            } else if ((B_y / 2.0 - e) < 0.10) {
                sigma_max = "FAIL (Edge Crushing/Overturned)";
                bearingPass = false;
            } else if (e > B_y / 6.0) {
                sigma_max = (2.0 * Math.abs(totalV_clamped)) / (3.0 * (B_y / 2.0 - e) * p.B);
                isLiftOff = true;
                bearingPass = sigma_max < allowedBearing;
            } else {
                bearingPass = sigma_max < allowedBearing;
            }
            
            state.results.cases.push({
                caseName: c.name,
                eqLabel: eqLabelVal,
                plane: 'Y-Z',
                combination: c.eq,
                totalV: totalV_clamped,
                totalH: totalH,
                e: e,
                limit_e: limit_e,
                Fs: Fs,
                Fot: Fot,
                sigma: sigma_max,
                isLiftOff: isLiftOff,
                eccentricityPass,
                overturningFSPass,
                slidingPass,
                bearingPass,
                limit_qa: allowedBearing,
                P_p: P_p,
                R_cohesion: R_cohesion,
                passed: eccentricityPass && overturningFSPass && slidingPass && bearingPass,
                momV: momV_clamped, momH, sumM, y_res, Rx, Ry, Rz
            });
        });
    });
}

/**
 * Generates a high-contrast dynamic Free Body Diagram (FBD) as an SVG string.
 */
function generateFBDSVG(plane) {
    const p = state.params;
    const c = state.coordinates;
    const f = state.results.forces;
    const cs = state.results.cases[state.selectedCaseIndex] || state.results.cases[0];
    
    if (!cs) return '';
    
    const isXZ = (plane === 'XZ');
    
    // Width and Height of SVG
    const w = 550;
    const h = 340;
    
    // Width and height dimensions of geometry
    const B_dim = isXZ ? p.B : p.B_yz;
    const H_dim = p.H_ab;
    
    const padX = 65;
    const padY = 75;
    const scaleX = (w - 2 * padX) / B_dim;
    const scaleY = (h - 2 * padY) / H_dim;
    const scale = Math.min(scaleX, scaleY);
    
    const offsetX = (w - B_dim * scale) / 2.0;
    const offsetY = h - padY; // base line y-coordinate
    
    // Z reference point
    const z_min_val = isXZ ? Math.min(...c.xzCoords.map(pt => pt.z)) : Math.min(...c.yzCoords.map(pt => pt.z));
    
    // CG point in SVG coords
    const cg_x = isXZ ? f.x_CG : B_dim / 2.0;
    const cg_z = f.z_CG - z_min_val;
    const cg_svg_x = offsetX + cg_x * scale;
    const cg_svg_y = offsetY - cg_z * scale;
    
    // Pipe point in SVG coords
    const pipe_x = isXZ ? (c.pipeXZ && c.pipeXZ[1] ? c.pipeXZ[1].x : p.B / 2.0) : B_dim / 2.0;
    const pipe_z = isXZ ? (c.pipeXZ && c.pipeXZ[1] ? c.pipeXZ[1].z : p.H_ab / 2.0) : c.pipeCenterYZ.z;
    const pipe_rel_z = pipe_z - z_min_val;
    const pipe_svg_x = offsetX + pipe_x * scale;
    const pipe_svg_y = offsetY - pipe_rel_z * scale;
    
    // Block points string
    let blockPointsStr = "";
    if (isXZ) {
        blockPointsStr = c.xzCoords.map(pt => `${offsetX + pt.x * scale},${offsetY - (pt.z - z_min_val) * scale}`).join(' ');
    } else {
        blockPointsStr = c.yzCoords.map(pt => `${offsetX + pt.y * scale},${offsetY - (pt.z - z_min_val) * scale}`).join(' ');
    }
    
    // Determine active earthquake sign/direction from selected case
    const eqLabel = cs.eqLabel;
    const eqDir = eqLabel.includes('+') ? 1.0 : -1.0;
    
    // Arrows helper function
    const drawArrow = (x1, y1, x2, y2, color, label, labelOffset = {x: 0, y: 0}) => {
        const angle = Math.atan2(y2 - y1, x2 - x1);
        const headLength = 8;
        const arrowX1 = x2 - headLength * Math.cos(angle - Math.PI / 6);
        const arrowY1 = y2 - headLength * Math.sin(angle - Math.PI / 6);
        const arrowX2 = x2 - headLength * Math.cos(angle + Math.PI / 6);
        const arrowY2 = y2 - headLength * Math.sin(angle + Math.PI / 6);
        return `
            <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="2.2" />
            <polygon points="${x2},${y2} ${arrowX1},${arrowY1} ${arrowX2},${arrowY2}" fill="${color}" />
            <text x="${x2 + labelOffset.x}" y="${y2 + labelOffset.y}" fill="${color}" font-size="9.5" font-weight="bold" font-family="'Inter', sans-serif">${label}</text>
        `;
    };

    // Draw dimension lines
    const drawDim = (x1, y1, x2, y2, label, color = '#64748b') => {
        const dx = x2 - x1;
        const dy = y2 - y1;
        const len = Math.sqrt(dx*dx + dy*dy) || 1.0;
        const nx = -dy / len;
        const ny = dx / len;
        
        const tickLength = 4;
        const tick1 = `M${x1 - nx * tickLength},${y1 - ny * tickLength} L${x1 + nx * tickLength},${y1 + ny * tickLength}`;
        const tick2 = `M${x2 - nx * tickLength},${y2 - ny * tickLength} L${x2 + nx * tickLength},${y2 + ny * tickLength}`;
        
        return `
            <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="0.8" stroke-dasharray="2 2" />
            <path d="${tick1} ${tick2}" stroke="${color}" stroke-width="0.9" />
            <text x="${(x1 + x2)/2.0}" y="${(y1 + y2)/2.0 - 4}" text-anchor="middle" fill="${color}" font-size="8.5" font-family="monospace">${label}</text>
        `;
    };
    
    // Resultant base centroid position
    const x_res = isXZ ? cs.x_res : cs.y_res;
    const x_res_svg = offsetX + Math.max(0, Math.min(B_dim, x_res)) * scale;
    
    // Base keys or anchors if active
    let keyHtml = "";
    if (p.mitigation_active && p.h_key > 0) {
        const keyWidth = 1.0 * scale;
        const keyHeight = p.h_key * scale;
        keyHtml = `<rect x="${offsetX + B_dim/2.0 * scale - keyWidth/2.0}" y="${offsetY}" width="${keyWidth}" height="${keyHeight}" fill="#94a3b8" stroke="#334155" stroke-width="1.5" />`;
    }
    
    let anchorsHtml = "";
    if (p.mitigation_active && p.n_anchors > 0) {
        const anchorX = cs.totalH >= 0 ? (offsetX + 1.0 * scale) : (offsetX + (B_dim - 1.0) * scale);
        anchorsHtml = `
            <line x1="${anchorX}" y1="${offsetY}" x2="${anchorX}" y2="${offsetY + 30}" stroke="#b91c1c" stroke-width="3" stroke-dasharray="4 2" />
            <circle cx="${anchorX}" cy="${offsetY + 30}" r="4" fill="#b91c1c" />
            ${drawArrow(anchorX, offsetY + 30, anchorX, offsetY, '#b91c1c', 'T_anchors', {x: 8, y: -4})}
        `;
    }

    // Ground Line (GL) coordinates & Passive Soil Pressure
    let glHtml = "";
    if (c.groundCoords && c.groundCoords.length >= 2) {
        const gl_y1 = offsetY - (c.groundCoords[0].z - z_min_val) * scale;
        const gl_y2 = offsetY - (c.groundCoords[1].z - z_min_val) * scale;
        glHtml = `
            <line x1="${offsetX - 35}" y1="${gl_y1}" x2="${offsetX + B_dim * scale + 35}" y2="${gl_y2}" stroke="#15803d" stroke-width="2.5" stroke-dasharray="6 3" />
            <text x="${offsetX + B_dim * scale + 40}" y="${gl_y2 + 4}" fill="#15803d" font-size="10" font-weight="bold">GL (Ground Level)</text>
        `;
    } else {
        glHtml = `
            <line x1="${offsetX - 35}" y1="${offsetY}" x2="${offsetX + B_dim * scale + 35}" y2="${offsetY}" stroke="#475569" stroke-width="2.5" stroke-dasharray="6 3" />
            <text x="${offsetX + B_dim * scale + 40}" y="${offsetY + 4}" fill="#475569" font-size="10" font-weight="bold">GL (Base Level)</text>
        `;
    }

    // Passive soil pressure (P_p) and cohesion (R_cohesion)
    let geotechnicalHtml = "";
    if (p.buriedCondition) {
        if (cs.P_p > 0) {
            const d_embed = Math.max(0.0, (c.groundCoords[c.groundCoords.length - 1].z - z_min_val));
            const pp_y = offsetY - (d_embed / 3.0) * scale;
            const pp_start_x = offsetX + B_dim * scale + 50;
            const pp_end_x = offsetX + B_dim * scale;
            geotechnicalHtml += drawArrow(pp_start_x, pp_y, pp_end_x, pp_y, '#059669', `Pp = ${cs.P_p.toFixed(1)}t`, {x: 8, y: -4});
        }
        if (cs.R_cohesion > 0) {
            geotechnicalHtml += drawArrow(offsetX - 50, offsetY, offsetX, offsetY, '#059669', `R_coh = ${cs.R_cohesion.toFixed(1)}t`, {x: -100, y: -6});
        }
    }

    // Accumulate elements
    let svgBody = `
        <!-- Concrete hatch background -->
        <polygon points="${blockPointsStr}" fill="#f8fafc" stroke="#0f172a" stroke-width="2.2" />
        ${keyHtml}
        ${glHtml}
        ${geotechnicalHtml}
    `;
    
    if (isXZ) {
        const pX1 = offsetX + c.pipeXZ[0].x * scale;
        const pY1 = offsetY - (c.pipeXZ[0].z - z_min_val) * scale;
        const pX2 = offsetX + c.pipeXZ[1].x * scale;
        const pY2 = offsetY - (c.pipeXZ[1].z - z_min_val) * scale;
        const pX3 = offsetX + c.pipeXZ[2].x * scale;
        const pY3 = offsetY - (c.pipeXZ[2].z - z_min_val) * scale;
        
        svgBody += `
            <polyline points="${pX1},${pY1} ${pX2},${pY2} ${pX3},${pY3}" fill="none" stroke="#64748b" stroke-width="14" stroke-opacity="0.25" stroke-linecap="round" />
            <polyline points="${pX1},${pY1} ${pX2},${pY2} ${pX3},${pY3}" fill="none" stroke="#334155" stroke-width="1.2" stroke-dasharray="5 3" />
        `;
    } else {
        const pipeY_svg = offsetX + c.pipeCenterYZ.y * scale;
        const pipeZ_svg = offsetY - (c.pipeCenterYZ.z - z_min_val) * scale;
        const radius_svg = (p.D / 2.0) * scale;
        svgBody += `
            <circle cx="${pipeY_svg}" cy="${pipeZ_svg}" r="${radius_svg}" fill="#64748b" fill-opacity="0.25" stroke="#334155" stroke-width="1.8" />
            <line x1="${pipeY_svg - radius_svg - 6}" y1="${pipeZ_svg}" x2="${pipeY_svg + radius_svg + 6}" y2="${pipeZ_svg}" stroke="#334155" stroke-width="1" stroke-dasharray="3 3" />
            <line x1="${pipeY_svg}" y1="${pipeZ_svg - radius_svg - 6}" x2="${pipeY_svg}" y2="${pipeZ_svg + radius_svg + 6}" stroke="#334155" stroke-width="1" stroke-dasharray="3 3" />
        `;
    }
    
    // Add Force Arrows
    // 1. Concrete Dead Weight (WA)
    svgBody += drawArrow(cg_svg_x, cg_svg_y, cg_svg_x, cg_svg_y + 40, '#2563eb', `WA = ${f.WA.toFixed(1)}t`, {x: -20, y: 14});
    
    // 2. Block Seismic Inertia (F_WA)
    const f_wa_val = isXZ ? f.F_WA : (p.Kh * f.WA);
    if (Math.abs(f_wa_val) > 0.01) {
        svgBody += drawArrow(cg_svg_x, cg_svg_y, cg_svg_x + eqDir * 40, cg_svg_y, '#d97706', `F_seismic = ${Math.abs(f_wa_val).toFixed(1)}t`, {x: eqDir > 0 ? 8 : -95, y: -4});
    }
    
    // 3. Pipe thrust horizontal Rx or Ry
    const H_force_val = isXZ ? cs.Rx : cs.Ry;
    const H_force_lbl = isXZ ? `Rx = ${H_force_val.toFixed(1)}t` : `Ry = ${H_force_val.toFixed(1)}t`;
    if (Math.abs(H_force_val) > 0.01) {
        const startX = pipe_svg_x - (H_force_val >= 0 ? 40 : -40);
        svgBody += drawArrow(startX, pipe_svg_y, pipe_svg_x, pipe_svg_y, '#dc2626', H_force_lbl, {x: H_force_val >= 0 ? -65 : 6, y: -4});
    }
    
    // 4. Pipe vertical force Rz
    if (Math.abs(cs.Rz) > 0.01) {
        const startY = pipe_svg_y - (cs.Rz >= 0 ? -35 : 35);
        svgBody += drawArrow(pipe_svg_x, startY, pipe_svg_x, pipe_svg_y, '#dc2626', `Rz = ${cs.Rz.toFixed(1)}t`, {x: 6, y: cs.Rz >= 0 ? 14 : -4});
    }
    
    // 5. Resultant base reactions
    svgBody += drawArrow(x_res_svg, offsetY + 30, x_res_svg, offsetY, '#16a34a', `V = ${Math.abs(cs.totalV).toFixed(1)}t`, {x: 8, y: 28});
    
    // Friction sliding capacity F_friction = V * lambda
    const F_fric_val = Math.abs(cs.totalV) * p.lambda;
    const slidingDir = cs.totalH >= 0 ? -1.0 : 1.0;
    const fricLabel = `F_fric = ${F_fric_val.toFixed(1)}t`;
    svgBody += drawArrow(x_res_svg - slidingDir * 40, offsetY, x_res_svg, offsetY, '#16a34a', fricLabel, {x: slidingDir > 0 ? -105 : 22, y: -6});
    
    // Anchors
    svgBody += anchorsHtml;
    
    // CG point circle marker
    svgBody += `
        <circle cx="${cg_svg_x}" cy="${cg_svg_y}" r="4" fill="#000000" />
        <circle cx="${cg_svg_x}" cy="${cg_svg_y}" r="2" fill="#ffffff" />
        <text x="${cg_svg_x + 6}" y="${cg_svg_y + 4}" fill="#000000" font-size="9" font-weight="bold">CG</text>
    `;
    
    // Dimensions
    // Width dimension
    svgBody += drawDim(offsetX, offsetY + 38, offsetX + B_dim * scale, offsetY + 38, `B = ${B_dim.toFixed(2)}m`);
    // Height dimension
    svgBody += drawDim(offsetX - 15, offsetY - H_dim * scale, offsetX - 15, offsetY, `H = ${H_dim.toFixed(2)}m`);
    // Lever arm y_CG or x_CG
    svgBody += drawDim(offsetX, offsetY + 50, cg_svg_x, offsetY + 50, `CG_arm = ${cg_x.toFixed(2)}m`, '#2563eb');
    // Resultant location e
    svgBody += drawDim(offsetX + B_dim/2.0 * scale, offsetY + 60, x_res_svg, offsetY + 60, `e = ${cs.e.toFixed(2)}m`, '#16a34a');
    
    return `
        <svg width="100%" height="100%" viewBox="0 0 ${w} ${h}" style="background-color: #ffffff;">
            <defs>
                <style>
                    text { font-family: 'Inter', -apple-system, sans-serif; }
                </style>
            </defs>
            <text x="15" y="22" fill="#0f172a" font-size="11" font-weight="700" letter-spacing="0.5">${plane} FREE BODY DIAGRAM (FBD)</text>
            <text x="15" y="34" fill="#64748b" font-size="8.5">Direction of Case: ${cs.caseName} (${cs.eqLabel})</text>
            ${svgBody}
        </svg>
    `;
}

/**
 * Generates an Isometric 3D Wireframe SVG rendering of the Anchor Block with CG point and (X,Y,Z) coordinates.
 * @param {boolean} isReport - If true, uses a light theme suitable for printable PDF reports.
 */
function generate3DSVG(isReport = false) {
    const p = state.params || {};
    const c = state.coordinates || {};
    const f = (state.results && state.results.forces) ? state.results.forces : { WA: 100, x_CG: (p.B||5)/2, y_CG_stability: (p.B_yz||4)/2, z_CG: (p.H_ab||3)/2 };
    
    const B = (typeof p.B === 'number' && !isNaN(p.B) && p.B > 0) ? p.B : 5.0;
    const W = (typeof p.B_yz === 'number' && !isNaN(p.B_yz) && p.B_yz > 0) ? p.B_yz : 4.0;
    const H = (typeof p.H_ab === 'number' && !isNaN(p.H_ab) && p.H_ab > 0) ? p.H_ab : 3.0;
    
    const x_CG = (typeof f.x_CG === 'number' && !isNaN(f.x_CG)) ? f.x_CG : B / 2.0;
    const y_CG = (typeof f.y_CG_stability === 'number' && !isNaN(f.y_CG_stability)) ? f.y_CG_stability : W / 2.0;
    const z_CG = (typeof f.z_CG === 'number' && !isNaN(f.z_CG)) ? f.z_CG : H / 2.0;
    
    const svgW = isReport ? 650 : 550;
    const svgH = isReport ? 340 : 340;

    const xzPts = (c.xzCoords && c.xzCoords.length >= 3)
        ? c.xzCoords.filter(pt => pt && typeof pt.x === 'number' && !isNaN(pt.x) && typeof pt.z === 'number' && !isNaN(pt.z))
        : [{x: 0, z: 0}, {x: B, z: 0}, {x: B, z: H}, {x: 0, z: H}];
        
    const validPts = xzPts.length >= 3 ? xzPts : [{x: 0, z: 0}, {x: B, z: 0}, {x: B, z: H}, {x: 0, z: H}];
    const z_min = Math.min(...validPts.map(pt => pt.z || 0));

    // Raw isometric projection (unscaled, un-offset)
    const rawProject = (x, y, z) => {
        const rx = x * 0.866 - y * 0.707;
        const ry = -z * 0.85 + y * 0.35 + x * 0.30;
        return { x: rx, y: ry };
    };

    // Gather all 3D points to compute exact bounding box
    const all3DPts = [];
    validPts.forEach(pt => {
        all3DPts.push({ x: pt.x, y: 0, z: pt.z - z_min });
        all3DPts.push({ x: pt.x, y: W, z: pt.z - z_min });
    });
    all3DPts.push({ x: x_CG, y: y_CG, z: z_CG - z_min });
    all3DPts.push({ x: B + 1.2, y: 0, z: 0 });
    all3DPts.push({ x: 0, y: W + 1.2, z: 0 });
    all3DPts.push({ x: 0, y: 0, z: H + 1.0 });

    const rawProjected = all3DPts.map(pt => rawProject(pt.x, pt.y, pt.z));
    const minRx = Math.min(...rawProjected.map(pt => pt.x));
    const maxRx = Math.max(...rawProjected.map(pt => pt.x));
    const minRy = Math.min(...rawProjected.map(pt => pt.y));
    const maxRy = Math.max(...rawProjected.map(pt => pt.y));

    const spanRx = Math.max(0.1, maxRx - minRx);
    const spanRy = Math.max(0.1, maxRy - minRy);

    const marginX = isReport ? 130 : 110;
    const marginY = isReport ? 90 : 80;

    const scale = Math.min((svgW - marginX) / spanRx, (svgH - marginY) / spanRy);
    const offsetX = (svgW - (minRx + maxRx) * scale) / 2.0;
    const offsetY = (svgH - (minRy + maxRy) * scale) / 2.0;

    const project = (x, y, z) => {
        const r = rawProject(x, y, z);
        const px = offsetX + r.x * scale;
        const py = offsetY + r.y * scale;
        return { x: isNaN(px) ? svgW / 2 : px, y: isNaN(py) ? svgH / 2 : py };
    };

    const frontPts = validPts.map(pt => project(pt.x, 0, pt.z - z_min));
    const backPts = validPts.map(pt => project(pt.x, W, pt.z - z_min));

    const frontPolyStr = frontPts.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
    const backPolyStr = backPts.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');

    let sideFacesSvg = '';
    for (let i = 0; i < validPts.length; i++) {
        const nextIdx = (i + 1) % validPts.length;
        const p1 = frontPts[i];
        const p2 = frontPts[nextIdx];
        const p3 = backPts[nextIdx];
        const p4 = backPts[i];
        
        const sideFill = isReport ? '#f1f5f9' : 'url(#sideGradient)';
        const sideStroke = isReport ? '#475569' : '#334155';

        sideFacesSvg += `
            <polygon points="${p1.x.toFixed(1)},${p1.y.toFixed(1)} ${p2.x.toFixed(1)},${p2.y.toFixed(1)} ${p3.x.toFixed(1)},${p3.y.toFixed(1)} ${p4.x.toFixed(1)},${p4.y.toFixed(1)}" 
                     fill="${sideFill}" stroke="${sideStroke}" stroke-width="1.2" />
        `;
    }

    const cgProj = project(x_CG, y_CG, z_CG - z_min);
    const cgBaseProj = project(x_CG, y_CG, 0);

    let pipe3DSvg = '';
    if (c.pipeXZ && c.pipeXZ.length >= 2 && c.pipeXZ[0] && c.pipeXZ[1]) {
        const pipe1 = project(c.pipeXZ[0].x, W / 2.0, c.pipeXZ[0].z - z_min);
        const pipe2 = project(c.pipeXZ[1].x, W / 2.0, c.pipeXZ[1].z - z_min);
        const pipe3 = c.pipeXZ[2] ? project(c.pipeXZ[2].x, W / 2.0, c.pipeXZ[2].z - z_min) : pipe2;
        
        const pipeStroke = isReport ? '#0284c7' : '#00f2fe';
        pipe3DSvg = `
            <polyline points="${pipe1.x.toFixed(1)},${pipe1.y.toFixed(1)} ${pipe2.x.toFixed(1)},${pipe2.y.toFixed(1)} ${pipe3.x.toFixed(1)},${pipe3.y.toFixed(1)}" 
                      fill="none" stroke="${pipeStroke}" stroke-width="5" stroke-opacity="0.3" stroke-linecap="round" />
            <polyline points="${pipe1.x.toFixed(1)},${pipe1.y.toFixed(1)} ${pipe2.x.toFixed(1)},${pipe2.y.toFixed(1)} ${pipe3.x.toFixed(1)},${pipe3.y.toFixed(1)}" 
                      fill="none" stroke="${pipeStroke}" stroke-width="2" stroke-dasharray="4 2" />
        `;
    }

    let vertexLabelsSvg = '';
    const keyVertices = [
        { name: 'P1(0,0,0)', x: 0, y: 0, z: 0 },
        { name: `P2(${B.toFixed(1)},0,0)`, x: B, y: 0, z: 0 },
        { name: `P3(${B.toFixed(1)},${W.toFixed(1)},0)`, x: B, y: W, z: 0 },
        { name: `P4(0,${W.toFixed(1)},0)`, x: 0, y: W, z: 0 }
    ];
    
    const nodeTextFill = isReport ? '#334155' : '#cbd5e1';
    keyVertices.forEach(v => {
        const vp = project(v.x, v.y, v.z);
        vertexLabelsSvg += `
            <circle cx="${vp.x.toFixed(1)}" cy="${vp.y.toFixed(1)}" r="3" fill="${nodeTextFill}" stroke="#0f172a" stroke-width="1" />
            <text x="${(vp.x + 5).toFixed(1)}" y="${(vp.y + 3).toFixed(1)}" fill="${nodeTextFill}" font-size="8.5" font-weight="bold" font-family="monospace">${v.name}</text>
        `;
    });

    const bgFill = isReport ? '#ffffff' : '#060911';
    const borderStyle = isReport ? 'border: 1px solid #cbd5e1;' : 'border: 1px solid rgba(255,255,255,0.08);';
    const frontFill = isReport ? '#e2e8f0' : 'url(#frontGradient)';
    const frontStroke = isReport ? '#0f172a' : '#38bdf8';
    const dropLineStroke = isReport ? '#d97706' : '#ff9100';

    const badgeBg = isReport ? '#ffffff' : 'rgba(15, 23, 42, 0.95)';
    const badgeStroke = isReport ? '#d97706' : '#ff9100';
    const badgeTitleFill = isReport ? '#b45309' : '#ff9100';
    const badgeCoordFill = isReport ? '#0369a1' : '#00f2fe';

    // Position badge intelligently to prevent clipping off bounds
    const badgeX = Math.min(svgW - 200, Math.max(10, cgProj.x + 15));
    const badgeY = Math.max(15, Math.min(svgH - 45, cgProj.y - 20));

    return `
        <svg width="100%" height="100%" viewBox="0 0 ${svgW} ${svgH}" style="background-color: ${bgFill}; ${borderStyle}">
            <defs>
                <linearGradient id="frontGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#1e293b" stop-opacity="0.95" />
                    <stop offset="100%" stop-color="#0f172a" stop-opacity="0.95" />
                </linearGradient>
                <linearGradient id="sideGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#334155" stop-opacity="0.75" />
                    <stop offset="100%" stop-color="#1e293b" stop-opacity="0.75" />
                </linearGradient>
                <linearGradient id="backGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#0f172a" stop-opacity="0.4" />
                    <stop offset="100%" stop-color="#020617" stop-opacity="0.4" />
                </linearGradient>
                <radialGradient id="cgGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stop-color="#ff9100" stop-opacity="1" />
                    <stop offset="100%" stop-color="#ff1744" stop-opacity="0.2" />
                </radialGradient>
            </defs>

            <!-- Coordinate Axes Origin -->
            <g opacity="${isReport ? '0.8' : '0.65'}">
                ${(() => {
                    const o = project(0, 0, 0);
                    const axX = project(B + 1.2, 0, 0);
                    const axY = project(0, W + 1.2, 0);
                    const axZ = project(0, 0, H + 0.8);
                    return `
                        <line x1="${o.x.toFixed(1)}" y1="${o.y.toFixed(1)}" x2="${axX.x.toFixed(1)}" y2="${axX.y.toFixed(1)}" stroke="#ef4444" stroke-width="1.8" />
                        <text x="${(axX.x + 4).toFixed(1)}" y="${axX.y.toFixed(1)}" fill="#ef4444" font-size="10" font-weight="bold">X</text>
                        <line x1="${o.x.toFixed(1)}" y1="${o.y.toFixed(1)}" x2="${axY.x.toFixed(1)}" y2="${axY.y.toFixed(1)}" stroke="#16a34a" stroke-width="1.8" />
                        <text x="${(axY.x - 10).toFixed(1)}" y="${(axY.y + 10).toFixed(1)}" fill="#16a34a" font-size="10" font-weight="bold">Y</text>
                        <line x1="${o.x.toFixed(1)}" y1="${o.y.toFixed(1)}" x2="${axZ.x.toFixed(1)}" y2="${axZ.y.toFixed(1)}" stroke="#2563eb" stroke-width="1.8" />
                        <text x="${axZ.x.toFixed(1)}" y="${(axZ.y - 4).toFixed(1)}" fill="#2563eb" font-size="10" font-weight="bold">Z</text>
                    `;
                })()}
            </g>

            <!-- Back Face -->
            <polygon points="${backPolyStr}" fill="${isReport ? '#f8fafc' : 'url(#backGradient)'}" stroke="${isReport ? '#cbd5e1' : '#334155'}" stroke-width="1" stroke-dasharray="3 2" />

            <!-- Connecting Side Quads -->
            ${sideFacesSvg}

            <!-- Front Face -->
            <polygon points="${frontPolyStr}" fill="${frontFill}" stroke="${frontStroke}" stroke-width="2" />

            <!-- Pipe Centerline -->
            ${pipe3DSvg}

            <!-- CG Drop Lines -->
            <line x1="${cgProj.x.toFixed(1)}" y1="${cgProj.y.toFixed(1)}" x2="${cgBaseProj.x.toFixed(1)}" y2="${cgBaseProj.y.toFixed(1)}" 
                  stroke="${dropLineStroke}" stroke-width="1.5" stroke-dasharray="3 3" />

            <!-- Vertex Coordinates Labels -->
            ${vertexLabelsSvg}

            <!-- CG Center Marker -->
            <circle cx="${cgProj.x.toFixed(1)}" cy="${cgProj.y.toFixed(1)}" r="7" fill="url(#cgGlow)" />
            <circle cx="${cgProj.x.toFixed(1)}" cy="${cgProj.y.toFixed(1)}" r="3.5" fill="#d97706" stroke="#ffffff" stroke-width="1.5" />

            <!-- CG Floating Label Badge -->
            <g transform="translate(${badgeX.toFixed(1)}, ${badgeY.toFixed(1)})">
                <rect x="0" y="0" width="185" height="38" rx="6" fill="${badgeBg}" stroke="${badgeStroke}" stroke-width="1.5" />
                <text x="8" y="14" fill="${badgeTitleFill}" font-size="9.5" font-weight="800">CENTER OF GRAVITY (CG)</text>
                <text x="8" y="29" fill="${badgeCoordFill}" font-size="9.5" font-weight="700" font-family="monospace">X:${x_CG.toFixed(3)}m Y:${y_CG.toFixed(3)}m Z:${z_CG.toFixed(3)}m</text>
            </g>
        </svg>
    `;
}

/**
 * Step-by-Step detailed Case calculation card
 */
function renderDetailedCalculationCard() {
    const cardBody = document.getElementById('detailed-calculation-report');
    if (!cardBody) return;
    
    const idx = state.selectedCaseIndex;
    const c = state.results.cases[idx];
    const f = state.results.forces;
    const p = state.params;
    
    if (!c) {
        cardBody.innerHTML = '<p>Select a case from the combinations table below to view detailed equations.</p>';
        return;
    }
    
    const eqSign = c.eqLabel.includes('-') ? -1.0 : 1.0;
    const signText = eqSign < 0 ? '-' : '+';
    const pipeH_val = c.plane === 'X-Z' ? c.Rx : c.Ry;
    const pipeH_label = c.plane === 'X-Z' ? 'Rx' : 'Ry';
    
    let z_min = state.coordinates.xzCoords.length > 0 ? state.coordinates.xzCoords[0].z : 0.0;
    state.coordinates.xzCoords.forEach(pt => { if (pt.z < z_min) z_min = pt.z; });
    const h_CG_val = state.jicaAuditMode ? 2.500 : (f.z_CG - z_min);
    const h_pipe_val = state.jicaAuditMode ? 3.000 : ((state.coordinates.pipeXZ && state.coordinates.pipeXZ[1] ? state.coordinates.pipeXZ[1].z : p.H_ab / 2.0) - z_min);
    const x_pipe_val = state.jicaAuditMode ? 3.000 : (state.coordinates.pipeXZ && state.coordinates.pipeXZ[1] ? state.coordinates.pipeXZ[1].x : p.B / 2.0);
    
    const dz_up = state.coordinates.pipeXZ && state.coordinates.pipeXZ[1] ? (state.coordinates.pipeXZ[0].z - state.coordinates.pipeXZ[1].z) : 0.0;
    const dz_down = state.coordinates.pipeXZ && state.coordinates.pipeXZ[2] ? (state.coordinates.pipeXZ[1].z - state.coordinates.pipeXZ[2].z) : 0.0;
    const dx_up = state.coordinates.pipeXZ && state.coordinates.pipeXZ[1] ? Math.abs(state.coordinates.pipeXZ[1].x - state.coordinates.pipeXZ[0].x) : 0.0;
    const dx_down = state.coordinates.pipeXZ && state.coordinates.pipeXZ[2] ? Math.abs(state.coordinates.pipeXZ[2].x - state.coordinates.pipeXZ[1].x) : 0.0;
    
    const delta_val = (dx_up || dz_up) ? Math.atan2(dz_up, dx_up || 0.001) : 0.0;
    const delta_prime_val = (dx_down || dz_down) ? Math.atan2(dz_down, dx_down || 0.001) : 0.0;
        
    let dot_prod = (state.coordinates.pipeXY[1].x - state.coordinates.pipeXY[0].x) * (state.coordinates.pipeXY[2].x - state.coordinates.pipeXY[1].x) +
                   (state.coordinates.pipeXY[1].y - state.coordinates.pipeXY[0].y) * (state.coordinates.pipeXY[2].y - state.coordinates.pipeXY[1].y);
    let mag1 = Math.sqrt((state.coordinates.pipeXY[1].x - state.coordinates.pipeXY[0].x)**2 + (state.coordinates.pipeXY[1].y - state.coordinates.pipeXY[0].y)**2);
    let mag2 = Math.sqrt((state.coordinates.pipeXY[2].x - state.coordinates.pipeXY[1].x)**2 + (state.coordinates.pipeXY[2].y - state.coordinates.pipeXY[1].y)**2);
    let theta_val = (mag1 * mag2 > 0) ? Math.acos(Math.max(-1.0, Math.min(1.0, dot_prod / (mag1 * mag2)))) : 0.0;
    let phi_val = delta_val - delta_prime_val;
    
    const W_val = 0.5 * (f.w + f.s) * p.l * Math.cos(delta_val);
    const W_prime_val = 0.5 * (f.w + f.s_prime) * p.l_prime * Math.cos(delta_prime_val);
    const P1_val = f.s * p.L * Math.sin(delta_val);
    const P1_prime_val = f.s_prime * p.L_prime * Math.sin(delta_prime_val);
    const g = 9.80665;
    const gamma_w = 1.0;
    const P2_val = (2 * p.f * (p.Q ** 2) / (g * Math.PI * (p.D ** 3))) * p.L * gamma_w;
    const P2_prime_val = (2 * p.f * (p.Q ** 2) / (g * Math.PI * (p.D ** 3))) * p.L_prime * gamma_w;
    const A_pipe = Math.PI * p.D * p.D / 4.0;
    const v_water = A_pipe > 0 ? p.Q / A_pipe : 0.0;
    const Pv_val = 2 * (v_water ** 2) / g * A_pipe * Math.sin(Math.abs(phi_val) / 2.0) * gamma_w;
    const Ph_val = 2 * (v_water ** 2) / g * A_pipe * Math.sin(theta_val / 2.0) * gamma_w;
    const P3_val = p.He * Math.PI * p.D * p.t * gamma_w;
    const P3_prime_val = p.He_prime * Math.PI * p.D * p.t_prime * gamma_w;
    const Prv_val = 2 * p.H * A_pipe * Math.sin(Math.abs(phi_val) / 2.0) * gamma_w;
    const Prh_val = 2 * p.H * A_pipe * Math.sin(theta_val / 2.0) * gamma_w;
    const Prv_vec = { x: -Prv_val * Math.sin(Math.abs(phi_val) / 2.0), y: 0.0, z: Prv_val * Math.cos(Math.abs(phi_val) / 2.0) };
    const Prh_vec = { x: Prh_val * Math.sin(theta_val / 2.0), y: Prh_val * Math.cos(theta_val / 2.0), z: 0.0 };
    
    if (state.selectedForceComponent) {
        const key = state.selectedForceComponent;
        document.getElementById('step-calc-case-header').innerText = `Detailed Calculations: Force Component (${key})`;
        
        let detailHtml = `
            <div style="font-size: 13px; line-height: 1.7; display: flex; flex-direction: column; gap: 16px;">
                <button class="btn btn-outline btn-sm" onclick="clearSelectedForce()" style="align-self: flex-start; margin-bottom: 8px; border-color: var(--accent-cyan); color: var(--accent-cyan); cursor: pointer; padding: 6px 12px;">
                    ← Back to Stability Case Calculations
                </button>
        `;
        
        if (key === 'WA') {
            detailHtml += `
                <div>
                    <strong>Concrete Dead Weight (WA)</strong>
                    <p>Self-weight of the concrete anchor block computed from the layout profile area and width.</p>
                    <div class="report-equation">
                        Profile Area A_profile = ${f.A_profile.toFixed(3)} m²<br>
                        Block Width W = ${p.W.toFixed(3)} m<br>
                        Concrete Volume V = A_profile × W = ${f.A_profile.toFixed(3)} × ${p.W.toFixed(3)} = ${f.V_concrete.toFixed(3)} m³<br>
                        Concrete Unit Weight wc = ${p.wc.toFixed(2)} t/m³<br>
                        Weight WA = V × wc = ${f.V_concrete.toFixed(3)} × ${p.wc.toFixed(2)} = <strong>${f.WA.toFixed(3)} ton</strong>
                    </div>
                    <strong>3D Force Vector:</strong>
                    <div class="report-equation">
                        Fx = 0.000 ton<br>
                        Fy = 0.000 ton<br>
                        Fz = -WA = <strong>-${f.WA.toFixed(3)} ton</strong>
                    </div>
                </div>
            `;
        } else if (key === 'W') {
            detailHtml += `
                <div>
                    <strong>Pipe & Water Weight - Upstream (W)</strong>
                    <p>Combined gravity load of the pipe shell and internal water column for the upstream segment.</p>
                    <div class="report-equation">
                        Water weight per meter w = ${f.w.toFixed(3)} t/m (inside diameter D = ${p.D.toFixed(3)} m)<br>
                        Shell weight per meter s = ${f.s.toFixed(3)} t/m (shell thickness t = ${p.t.toFixed(4)} m)<br>
                        Saddle spacing l = ${p.l.toFixed(3)} m<br>
                        Upstream slope angle α1 = ${(delta_val * 180.0 / Math.PI).toFixed(2)}°<br>
                        W_mag = 0.5 × (w + s) × l × cos(α1) = 0.5 × (${f.w.toFixed(3)} + ${f.s.toFixed(3)}) × ${p.l.toFixed(3)} × cos(${(delta_val * 180.0 / Math.PI).toFixed(2)}°) = <strong>${W_val.toFixed(3)} ton</strong>
                    </div>
                    <strong>3D Force Vector Resolution:</strong>
                    <div class="report-equation">
                        Fx = W_mag × sin(α1) = ${W_val.toFixed(3)} × sin(${(delta_val * 180.0 / Math.PI).toFixed(2)}°) = <strong>${f.W.x.toFixed(3)} ton</strong><br>
                        Fy = 0.000 ton<br>
                        Fz = -W_mag × cos(α1) = -${W_val.toFixed(3)} × cos(${(delta_val * 180.0 / Math.PI).toFixed(2)}°) = <strong>${f.W.z.toFixed(3)} ton</strong>
                    </div>
                </div>
            `;
        } else if (key === 'W_prime') {
            detailHtml += `
                <div>
                    <strong>Pipe & Water Weight - Downstream (W')</strong>
                    <p>Combined gravity load of the pipe shell and internal water column for the downstream segment.</p>
                    <div class="report-equation">
                        Water weight per meter w = ${f.w.toFixed(3)} t/m<br>
                        Shell weight per meter s' = ${f.s_prime.toFixed(3)} t/m (shell thickness t' = ${p.t_prime.toFixed(4)} m)<br>
                        Saddle spacing l' = ${p.l_prime.toFixed(3)} m<br>
                        Downstream slope angle α2 = ${(delta_prime_val * 180.0 / Math.PI).toFixed(2)}°<br>
                        Horizontal bend angle θ = ${(theta_val * 180.0 / Math.PI).toFixed(2)}°<br>
                        W'_mag = 0.5 × (w + s') × l' × cos(α2) = 0.5 × (${f.w.toFixed(3)} + ${f.s_prime.toFixed(3)}) × ${p.l_prime.toFixed(3)} × cos(${(delta_prime_val * 180.0 / Math.PI).toFixed(2)}°) = <strong>${W_prime_val.toFixed(3)} ton</strong>
                    </div>
                    <strong>3D Force Vector Resolution:</strong>
                    <div class="report-equation">
                        Fx = W'_mag × sin(α2) × cos(θ) = <strong>${f.W_prime.x.toFixed(3)} ton</strong><br>
                        Fy = -W'_mag × sin(α2) × sin(θ) = <strong>${f.W_prime.y.toFixed(3)} ton</strong><br>
                        Fz = -W'_mag × cos(α2) = <strong>${f.W_prime.z.toFixed(3)} ton</strong>
                    </div>
                </div>
            `;
        } else if (key === 'P1') {
            detailHtml += `
                <div>
                    <strong>Pipe Shell Dead Weight - Upstream (P1)</strong>
                    <p>Slope component of the upstream pipe shell weight acting on the anchor block.</p>
                    <div class="report-equation">
                        Shell weight per meter s = ${f.s.toFixed(3)} t/m<br>
                        Pipe length L = ${p.L.toFixed(3)} m<br>
                        Upstream slope α1 = ${(delta_val * 180.0 / Math.PI).toFixed(2)}°<br>
                        P1_mag = s × L × sin(α1) = ${f.s.toFixed(3)} × ${p.L.toFixed(3)} × sin(${(delta_val * 180.0 / Math.PI).toFixed(2)}°) = <strong>${P1_val.toFixed(3)} ton</strong>
                    </div>
                    <strong>3D Force Vector Resolution:</strong>
                    <div class="report-equation">
                        Fx = -P1_mag × cos(α1) = -${P1_val.toFixed(3)} × cos(${(delta_val * 180.0 / Math.PI).toFixed(2)}°) = <strong>${f.P1.x.toFixed(3)} ton</strong><br>
                        Fy = 0.000 ton<br>
                        Fz = -P1_mag × sin(α1) = -${P1_val.toFixed(3)} × sin(${(delta_val * 180.0 / Math.PI).toFixed(2)}°) = <strong>${f.P1.z.toFixed(3)} ton</strong>
                    </div>
                </div>
            `;
        } else if (key === 'P1_prime') {
            detailHtml += `
                <div>
                    <strong>Pipe Shell Dead Weight - Downstream (P1')</strong>
                    <p>Slope component of the downstream pipe shell weight acting on the anchor block.</p>
                    <div class="report-equation">
                        Shell weight per meter s' = ${f.s_prime.toFixed(3)} t/m<br>
                        Pipe length L' = ${p.L_prime.toFixed(3)} m<br>
                        Downstream slope α2 = ${(delta_prime_val * 180.0 / Math.PI).toFixed(2)}°<br>
                        Horizontal bend angle θ = ${(theta_val * 180.0 / Math.PI).toFixed(2)}°<br>
                        P1'_mag = s' × L' × sin(α2) = ${f.s_prime.toFixed(3)} × ${p.L_prime.toFixed(3)} × sin(${(delta_prime_val * 180.0 / Math.PI).toFixed(2)}°) = <strong>${P1_prime_val.toFixed(3)} ton</strong>
                    </div>
                    <strong>3D Force Vector Resolution:</strong>
                    <div class="report-equation">
                        Fx = -P1'_mag × cos(α2) × cos(θ) = <strong>${f.P1_prime.x.toFixed(3)} ton</strong><br>
                        Fy = -P1'_mag × cos(α2) × sin(θ) = <strong>${f.P1_prime.y.toFixed(3)} ton</strong><br>
                        Fz = -P1'_mag × sin(α2) = <strong>${f.P1_prime.z.toFixed(3)} ton</strong>
                    </div>
                </div>
            `;
        } else if (key === 'P2') {
            detailHtml += `
                <div>
                    <strong>Hydrodynamic Wall Friction - Upstream (P2)</strong>
                    <p>Frictional drag shear force of the water flow acting along the internal pipe wall (upstream segment).</p>
                    <div class="report-equation">
                        Inside Diameter D = ${p.D.toFixed(3)} m<br>
                        Discharge Q = ${p.Q.toFixed(3)} m³/s<br>
                        Friction coefficient f = ${p.f.toFixed(4)}<br>
                        Pipe length L = ${p.L.toFixed(3)} m<br>
                        g = 9.807 m/s²<br>
                        P2_mag = (2 × f × Q² / (g × π × D³)) × L = <strong>${P2_val.toFixed(3)} ton</strong>
                    </div>
                    <strong>3D Force Vector Resolution:</strong>
                    <div class="report-equation">
                        Fx = P2_mag × cos(α1) = <strong>${f.P2.x.toFixed(3)} ton</strong><br>
                        Fy = 0.000 ton<br>
                        Fz = P2_mag × sin(α1) = <strong>${f.P2.z.toFixed(3)} ton</strong>
                    </div>
                </div>
            `;
        } else if (key === 'P2_prime') {
            detailHtml += `
                <div>
                    <strong>Hydrodynamic Wall Friction - Downstream (P2')</strong>
                    <p>Frictional drag shear force of the water flow acting along the internal pipe wall (downstream segment).</p>
                    <div class="report-equation">
                        Inside Diameter D = ${p.D.toFixed(3)} m<br>
                        Discharge Q = ${p.Q.toFixed(3)} m³/s<br>
                        Friction coefficient f = ${p.f.toFixed(4)}<br>
                        Pipe length L' = ${p.L_prime.toFixed(3)} m<br>
                        P2'_mag = (2 × f × Q² / (g × π × D³)) × L' = <strong>${P2_prime_val.toFixed(3)} ton</strong>
                    </div>
                    <strong>3D Force Vector Resolution:</strong>
                    <div class="report-equation">
                        Fx = P2'_mag × cos(α2) × cos(θ) = <strong>${f.P2_prime.x.toFixed(3)} ton</strong><br>
                        Fy = -P2'_mag × cos(α2) × sin(θ) = <strong>${f.P2_prime.y.toFixed(3)} ton</strong><br>
                        Fz = P2'_mag × sin(α2) = <strong>${f.P2_prime.z.toFixed(3)} ton</strong>
                    </div>
                </div>
            `;
        } else if (key === 'Pv') {
            detailHtml += `
                <div>
                    <strong>Centrifugal Force - Vertical Bend (Pv)</strong>
                    <p>Dynamic flow momentum deflection thrust acting along the vertical bend bisector direction.</p>
                    <div class="report-equation">
                        Inside diameter D = ${p.D.toFixed(3)} m<br>
                        Water Area A_pipe = ${A_pipe.toFixed(3)} m²<br>
                        Velocity v = Q/A = ${v_water.toFixed(2)} m/s<br>
                        Vertical angle change φ = ${(phi_val * 180.0 / Math.PI).toFixed(2)}°<br>
                        Pv_mag = 2 × (w × v² / g) × sin(φ / 2) = <strong>${Pv_val.toFixed(3)} ton</strong>
                    </div>
                    <strong>3D Force Vector Resolution:</strong>
                    <div class="report-equation">
                        Fx = -Pv_mag × sin(φ / 2) = <strong>${f.Pv.x.toFixed(3)} ton</strong><br>
                        Fy = 0.000 ton<br>
                        Fz = Pv_mag × cos(φ / 2) = <strong>${f.Pv.z.toFixed(3)} ton</strong>
                    </div>
                </div>
            `;
        } else if (key === 'Ph') {
            detailHtml += `
                <div>
                    <strong>Centrifugal Force - Horizontal Bend (Ph)</strong>
                    <p>Dynamic flow momentum deflection thrust acting in the horizontal plan bend bisector direction.</p>
                    <div class="report-equation">
                        Water Area A_pipe = ${A_pipe.toFixed(3)} m²<br>
                        Velocity v = Q/A = ${v_water.toFixed(2)} m/s<br>
                        Horizontal angle change θ = ${(theta_val * 180.0 / Math.PI).toFixed(2)}°<br>
                        Ph_mag = 2 × (w × v² / g) × sin(θ / 2) = <strong>${Ph_val.toFixed(3)} ton</strong>
                    </div>
                    <strong>3D Force Vector Resolution:</strong>
                    <div class="report-equation">
                        Fx = Ph_mag × sin(θ / 2) = <strong>${f.Ph.x.toFixed(3)} ton</strong><br>
                        Fy = Ph_mag × cos(θ / 2) = <strong>${f.Ph.y.toFixed(3)} ton</strong><br>
                        Fz = 0.000 ton
                    </div>
                </div>
            `;
        } else if (key === 'P3') {
            detailHtml += `
                <div>
                    <strong>Upstream Expansion Joint Internal Pressure (P3)</strong>
                    <p>Static hydrostatic end thrust acting on the upstream expansion joint sleeve end.</p>
                    <div class="report-equation">
                        Expansion joint design head He = ${p.He.toFixed(2)} m<br>
                        Inside Diameter D = ${p.D.toFixed(3)} m<br>
                        Shell thickness t = ${p.t.toFixed(4)} m<br>
                        P3_mag = He × π × D × t = <strong>${P3_val.toFixed(3)} ton</strong>
                    </div>
                    <strong>3D Force Vector Resolution:</strong>
                    <div class="report-equation">
                        Fx = P3_mag × cos(α1) = <strong>${f.P3.x.toFixed(3)} ton</strong><br>
                        Fy = 0.000 ton<br>
                        Fz = P3_mag × sin(α1) = <strong>${f.P3.z.toFixed(3)} ton</strong>
                    </div>
                </div>
            `;
        } else if (key === 'P3_prime') {
            detailHtml += `
                <div>
                    <strong>Downstream Expansion Joint Internal Pressure (P3')</strong>
                    <p>Static hydrostatic end thrust acting on the downstream expansion joint sleeve end.</p>
                    <div class="report-equation">
                        Expansion joint design head He' = ${p.He_prime.toFixed(2)} m<br>
                        Inside Diameter D = ${p.D.toFixed(3)} m<br>
                        Shell thickness t' = ${p.t_prime.toFixed(4)} m<br>
                        P3'_mag = He' × π × D × t' = <strong>${P3_prime_val.toFixed(3)} ton</strong>
                    </div>
                    <strong>3D Force Vector Resolution:</strong>
                    <div class="report-equation">
                        Fx = P3'_mag × cos(α2) × cos(θ) = <strong>${f.P3_prime.x.toFixed(3)} ton</strong><br>
                        Fy = -P3'_mag × cos(α2) × sin(θ) = <strong>${f.P3_prime.y.toFixed(3)} ton</strong><br>
                        Fz = P3'_mag × sin(α2) = <strong>${f.P3_prime.z.toFixed(3)} ton</strong>
                    </div>
                </div>
            `;
        } else if (key === 'Prv') {
            detailHtml += `
                <div>
                    <strong>Unbalanced Vertical Bend Pressure (Prv)</strong>
                    <p>Static internal hydrostatic thrust force acting along the vertical deflection bend plane bisector.</p>
                    <div class="report-equation">
                        Static Design Head H = ${p.H.toFixed(2)} m<br>
                        Water Area A_pipe = ${A_pipe.toFixed(3)} m²<br>
                        Vertical angle change φ = ${(phi_val * 180.0 / Math.PI).toFixed(2)}°<br>
                        Prv_mag = 2 × H × A_pipe × sin(φ / 2) = <strong>${Prv_val.toFixed(3)} ton</strong>
                    </div>
                    <strong>3D Force Vector Resolution:</strong>
                    <div class="report-equation">
                        Fx = -Prv_mag × sin(φ / 2) = <strong>${f.Prv.x.toFixed(3)} ton</strong><br>
                        Fy = 0.000 ton<br>
                        Fz = Prv_mag × cos(φ / 2) = <strong>${f.Prv.z.toFixed(3)} ton</strong>
                    </div>
                </div>
            `;
        } else if (key === 'Prh') {
            detailHtml += `
                <div>
                    <strong>Unbalanced Horizontal Bend Pressure (Prh)</strong>
                    <p>Static internal hydrostatic thrust force acting along the horizontal deflection bend plane bisector.</p>
                    <div class="report-equation">
                        Static Design Head H = ${p.H.toFixed(2)} m<br>
                        Water Area A_pipe = ${A_pipe.toFixed(3)} m²<br>
                        Horizontal angle change θ = ${(theta_val * 180.0 / Math.PI).toFixed(2)}°<br>
                        Prh_mag = 2 × H × A_pipe × sin(θ / 2) = <strong>${Prh_val.toFixed(3)} ton</strong>
                    </div>
                    <strong>3D Force Vector Resolution:</strong>
                    <div class="report-equation">
                        Fx = Prh_mag × sin(θ / 2) = <strong>${f.Prh.x.toFixed(3)} ton</strong><br>
                        Fy = Prh_mag × cos(θ / 2) = <strong>${f.Prh.y.toFixed(3)} ton</strong><br>
                        Fz = 0.000 ton
                    </div>
                </div>
            `;
        } else if (key === 'P') {
            detailHtml += `
                <div>
                    <strong>Constant Force Resultant Sum (P)</strong>
                    <p>Vector sum of all static and constant loads before applying transient temperature or seismic combinations.</p>
                    <div class="report-equation">
                        Resultant Vector:<br>
                        Fx = <strong>${f.P_vec.x.toFixed(3)} ton</strong><br>
                        Fy = <strong>${f.P_vec.y.toFixed(3)} ton</strong><br>
                        Fz = <strong>${f.P_vec.z.toFixed(3)} ton</strong>
                    </div>
                </div>
            `;
        }
        
        detailHtml += `</div>`;
        cardBody.innerHTML = detailHtml;
        return;
    }
    
    document.getElementById('step-calc-case-header').innerText = `Detailed Calculations: ${c.caseName} (${c.plane} plane, ${c.eqLabel})`;
    
    const A_base_val = state.jicaAuditMode ? f.A_profile : (p.B * p.W);
    const B_val = c.plane === 'X-Z' ? p.B : p.B_yz;
    
    let html = `
        <div style="font-size: 13px; line-height: 1.7; display: flex; flex-direction: column; gap: 16px;">
            <div>
                <strong>1. Acting Force Summation (Vector Addition)</strong>
                <div class="report-equation">
                    R_constant = W + W' + P1 + P1' + P2 + P2' + Pv + Ph + P3 + P3' + Prv + Prh<br>
                    R_constant Vector = [x: ${f.P_vec.x.toFixed(3)}, y: ${f.P_vec.y.toFixed(3)}, z: ${f.P_vec.z.toFixed(3)}] ton<br><br>
                    Temperature Vector T = ${c.combination} = [x: ${c.Tx.toFixed(3)}, y: ${c.Ty.toFixed(3)}, z: ${c.Tz.toFixed(3)}] ton<br>
                    Combined Force R = R_constant + T = [x: ${c.Rx.toFixed(3)}, y: ${c.Ry.toFixed(3)}, z: ${c.Rz.toFixed(3)}] ton
                </div>
            </div>

            <div>
                <strong>2. Vertical Forces & Moments Sum</strong>
                <div class="report-equation">
                    &Sigma; V = -WA + Rz = -${f.WA.toFixed(2)} + (${c.Rz.toFixed(2)}) = <strong>${c.totalV.toFixed(2)} ton</strong> (acting downward)<br>
                    Block CG Location: <strong>${c.plane === 'X-Z' ? `[X_CG: ${f.x_CG.toFixed(3)}m, Z_CG: ${f.z_CG.toFixed(3)}m]` : `[Y_CG: ${f.y_CG_stability.toFixed(3)}m, Z_CG: ${f.z_CG.toFixed(3)}m]`}</strong><br>
                    Lever arms: CG_arm = ${(c.plane === 'X-Z' ? f.x_CG : f.y_CG_stability).toFixed(3)}m, pipe_arm = ${(c.plane === 'X-Z' ? x_pipe_val : p.B_yz/2.0).toFixed(3)}m<br>
                    &Sigma; M_V = -WA &times; CG_arm + Rz &times; pipe_arm = -${f.WA.toFixed(2)} &times; ${(c.plane === 'X-Z' ? f.x_CG : f.y_CG_stability).toFixed(3)} + (${c.Rz.toFixed(2)}) &times; ${(c.plane === 'X-Z' ? x_pipe_val : p.B_yz/2.0).toFixed(3)}<br>
                    &Sigma; M_V = <strong>${c.momV.toFixed(2)} ton-m</strong>
                </div>
            </div>

            <div>
                <strong>3. Horizontal Forces & Moments Sum (including Seismic)</strong>
                <div class="report-equation">
                    Seismic block F_WA = Kh &times; WA = ${f.F_WA.toFixed(2)} ton (acts at z = ${h_CG_val.toFixed(2)}m)<br>
                    Seismic pipe F_p = ${f.F_p.toFixed(2)} ton (acts at z = ${h_pipe_val.toFixed(2)}m)<br>
                    Combined Horizontal Force &Sigma; H = ${signText} F_WA ${signText} F_p + ${pipeH_label} = ${c.totalH.toFixed(2)} ton<br>
                    &Sigma; M_H = ${signText} (F_WA &times; ${h_CG_val.toFixed(2)}) ${signText} (F_p &times; ${h_pipe_val.toFixed(2)}) + (${pipeH_label} &times; ${h_pipe_val.toFixed(2)})<br>
                    &Sigma; M_H = <strong>${c.momH.toFixed(2)} ton-m</strong>
                </div>
            </div>

            <div>
                <strong>Dynamic Free Body Diagram (FBD)</strong>
                <div style="background-color: #ffffff; border: 1px solid var(--border-color); border-radius: 6px; padding: 10px; margin-top: 6px; display: flex; justify-content: center; height: 280px; box-shadow: inset 0 0 10px rgba(0,0,0,0.05); overflow: hidden;">
                    ${generateFBDSVG(c.plane === 'X-Z' ? 'XZ' : 'YZ')}
                </div>
            </div>

            <div>
                <strong>4. Stability Verification Checks</strong>
                <table class="report-table">
                    <thead>
                        <tr>
                            <th>Check Parameter</th>
                            <th>Equation & Substitution</th>
                            <th>Calculated</th>
                            <th>Allowable Limit</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td><strong>Safety against Sliding (Fs)</strong></td>
                            <td>Fs = (|&Sigma;V|&middot;&lambda; + R_key + V_anchors${c.P_p > 0 ? ' + P_p' : ''}${c.R_cohesion > 0 ? ' + R_cohesion' : ''}) / |&Sigma;H|</td>
                            <td class="num">${c.Fs.toFixed(2)}</td>
                            <td class="num">&ge; ${state.jicaAuditMode ? '2.0' : '1.2'}</td>
                            <td style="color:${c.slidingPass ? 'var(--accent-green)':'var(--accent-red)'}; font-weight:bold;">${c.slidingPass ? 'PASS':'FAIL'}</td>
                        </tr>
                        <tr>
                            <td><strong>Safety against Overturning (Fo)</strong></td>
                            <td>Fo = &Sigma; M_R / &Sigma; M_O</td>
                            <td class="num">${c.Fot.toFixed(2)}</td>
                            <td class="num">&ge; ${state.jicaAuditMode ? '2.0' : '1.2'}</td>
                            <td style="color:${c.overturningFSPass ? 'var(--accent-green)':'var(--accent-red)'}; font-weight:bold;">${c.overturningFSPass ? 'PASS':'FAIL'}</td>
                        </tr>
                        <tr>
                            <td><strong>Eccentricity (e)</strong></td>
                            <td>e = |B/2 - (&Sigma; M_V - &Sigma; M_H) / &Sigma; V|</td>
                            <td class="num">${c.e.toFixed(3)} m</td>
                            <td class="num">${c.limit_e.toFixed(3)} m</td>
                            <td style="color:${c.eccentricityPass ? 'var(--accent-green)':'var(--accent-red)'}; font-weight:bold;">${c.eccentricityPass ? 'PASS':'FAIL'}</td>
                        </tr>
                        <tr>
                            <td><strong>Bearing Stress (&sigma;_max)</strong></td>
                            <td>${c.isLiftOff ? `&sigma; = 2&Sigma;V / [3(B/2 - e) &times; ${c.plane === 'X-Z' ? 'W' : 'B'}] (Heel Lift-off)` : `&sigma; = (&Sigma;V/A_base) &times; (1 + 6e/B)`}</td>
                            <td class="num">${fNum(c.sigma, 2)} t/m²</td>
                            <td class="num">
                                &lt; ${c.limit_qa.toFixed(2)} t/m²
                                ${c.eqLabel.includes('EQ') ? `<br><small style="font-size:10px; color:var(--text-secondary);">(qa_allow = qa &times; ${p.bearing_increase_factor || 1.50} = ${c.limit_qa.toFixed(2)})</small>` : ''}
                            </td>
                            <td style="color:${c.bearingPass ? 'var(--accent-green)':'var(--accent-red)'}; font-weight:bold;">${c.bearingPass ? 'PASS':'FAIL'}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;
    
    cardBody.innerHTML = html;
}

/**
 * Coordinate Wizard Grid Management
 */

// Step 1: XY Table Coordinates
function renderXYCoordsTable() {
    const tbody = document.querySelector('#table-xy-coords tbody');
    tbody.innerHTML = '';
    
    state.coordinates.xyCoords.forEach((pt, idx) => {
        tbody.innerHTML += `
            <tr>
                <td>Point ${idx + 1}</td>
                <td><input type="number" step="0.001" class="xy-input-x" data-idx="${idx}" value="${pt.x}"></td>
                <td><input type="number" step="0.001" class="xy-input-y" data-idx="${idx}" value="${pt.y}"></td>
                <td><button class="btn-delete" onclick="deleteXYRow(${idx})">Delete</button></td>
            </tr>
        `;
    });
    
    document.querySelectorAll('.xy-input-x').forEach(input => {
        input.addEventListener('change', (e) => {
            const idx = parseInt(e.target.getAttribute('data-idx'));
            state.coordinates.xyCoords[idx].x = parseFloat(e.target.value);
            validateAndDraw();
        });
    });
    document.querySelectorAll('.xy-input-y').forEach(input => {
        input.addEventListener('change', (e) => {
            const idx = parseInt(e.target.getAttribute('data-idx'));
            state.coordinates.xyCoords[idx].y = parseFloat(e.target.value);
            validateAndDraw();
        });
    });
}

function deleteXYRow(idx) {
    if (state.coordinates.xyCoords.length <= 3) {
        alert("A polygon must have at least 3 points!");
        return;
    }
    state.coordinates.xyCoords.splice(idx, 1);
    renderXYCoordsTable();
    validateAndDraw();
}

// Step 2: XZ Profile Coordinates
function renderXZCoordsTable() {
    const tbody = document.querySelector('#table-xz-coords tbody');
    tbody.innerHTML = '';
    
    state.coordinates.xzCoords.forEach((pt, idx) => {
        tbody.innerHTML += `
            <tr>
                <td>Vertex ${idx + 1}</td>
                <td><input type="number" step="0.001" class="xz-input-x" data-idx="${idx}" value="${pt.x}"></td>
                <td><input type="number" step="0.001" class="xz-input-z" data-idx="${idx}" value="${pt.z}"></td>
                <td><button class="btn-delete" onclick="deleteXZRow(${idx})">Delete</button></td>
            </tr>
        `;
    });
    
    document.querySelectorAll('.xz-input-x').forEach(input => {
        input.addEventListener('change', (e) => {
            const idx = parseInt(e.target.getAttribute('data-idx'));
            state.coordinates.xzCoords[idx].x = parseFloat(e.target.value);
            validateAndDraw();
        });
    });
    document.querySelectorAll('.xz-input-z').forEach(input => {
        input.addEventListener('change', (e) => {
            const idx = parseInt(e.target.getAttribute('data-idx'));
            state.coordinates.xzCoords[idx].z = parseFloat(e.target.value);
            validateAndDraw();
        });
    });
}

function deleteXZRow(idx) {
    if (state.coordinates.xzCoords.length <= 3) {
        alert("A profile must have at least 3 points!");
        return;
    }
    state.coordinates.xzCoords.splice(idx, 1);
    renderXZCoordsTable();
    validateAndDraw();
}

// Step 2: X-Z Pipe Centerline Table
function renderXZPipeTable() {
    const tbody = document.querySelector('#pane-step-2 #table-xz-pipe tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    
    const labels = ["Upstream Start", "Bend IP", "Downstream End"];
    state.coordinates.pipeXZ.forEach((pt, idx) => {
        tbody.innerHTML += `
            <tr>
                <td>${labels[idx] || 'Point ' + (idx + 1)}</td>
                <td><input type="number" step="0.001" class="pipe-xz-input-x" data-idx="${idx}" value="${pt.x}"></td>
                <td><input type="number" step="0.001" class="pipe-xz-input-z" data-idx="${idx}" value="${pt.z}"></td>
            </tr>
        `;
    });
    
    document.querySelectorAll('.pipe-xz-input-x').forEach(input => {
        input.addEventListener('change', (e) => {
            const idx = parseInt(e.target.getAttribute('data-idx'));
            state.coordinates.pipeXZ[idx].x = parseFloat(e.target.value);
            validateAndDraw();
        });
    });
    document.querySelectorAll('.pipe-xz-input-z').forEach(input => {
        input.addEventListener('change', (e) => {
            const idx = parseInt(e.target.getAttribute('data-idx'));
            state.coordinates.pipeXZ[idx].z = parseFloat(e.target.value);
            validateAndDraw();
        });
    });
}

// Step 2: Ground Level Coordinates Table
function renderXZGroundTable() {
    const tbody = document.querySelector('#table-xz-ground tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    
    state.coordinates.groundCoords.forEach((pt, idx) => {
        tbody.innerHTML += `
            <tr>
                <td>Point ${idx + 1}</td>
                <td><input type="number" step="0.001" class="ground-input-x" data-idx="${idx}" value="${pt.x}"></td>
                <td><input type="number" step="0.001" class="ground-input-z" data-idx="${idx}" value="${pt.z}"></td>
                <td><button class="btn-delete" onclick="deleteGroundRow(${idx})">Delete</button></td>
            </tr>
        `;
    });
    
    document.querySelectorAll('.ground-input-x').forEach(input => {
        input.addEventListener('change', (e) => {
            const idx = parseInt(e.target.getAttribute('data-idx'));
            state.coordinates.groundCoords[idx].x = parseFloat(e.target.value);
            validateAndDraw();
        });
    });
    document.querySelectorAll('.ground-input-z').forEach(input => {
        input.addEventListener('change', (e) => {
            const idx = parseInt(e.target.getAttribute('data-idx'));
            state.coordinates.groundCoords[idx].z = parseFloat(e.target.value);
            validateAndDraw();
        });
    });
}

function deleteGroundRow(idx) {
    if (state.coordinates.groundCoords.length <= 2) {
        alert("Ground profile must have at least 2 points!");
        return;
    }
    state.coordinates.groundCoords.splice(idx, 1);
    renderXZGroundTable();
    validateAndDraw();
}
window.deleteGroundRow = deleteGroundRow;

// Step 3: YZ Cross section Coordinates
function renderYZCoordsTable() {
    const tbody = document.querySelector('#table-yz-coords tbody');
    if (!tbody) return;
    if (document.activeElement && tbody.contains(document.activeElement)) return;
    tbody.innerHTML = '';
    
    state.coordinates.yzCoords.forEach((pt, idx) => {
        tbody.innerHTML += `
            <tr>
                <td>Vertex ${idx + 1}</td>
                <td><input type="number" step="0.001" class="yz-input-y" data-idx="${idx}" value="${pt.y}"></td>
                <td><input type="number" step="0.001" class="yz-input-z" data-idx="${idx}" value="${pt.z}"></td>
                <td><button class="btn-delete" onclick="deleteYZRow(${idx})">Delete</button></td>
            </tr>
        `;
    });
    
    document.querySelectorAll('.yz-input-y').forEach(input => {
        input.addEventListener('change', (e) => {
            const idx = parseInt(e.target.getAttribute('data-idx'));
            state.coordinates.yzCoords[idx].y = parseFloat(e.target.value);
            validateAndDraw();
        });
    });
    document.querySelectorAll('.yz-input-z').forEach(input => {
        input.addEventListener('change', (e) => {
            const idx = parseInt(e.target.getAttribute('data-idx'));
            state.coordinates.yzCoords[idx].z = parseFloat(e.target.value);
            validateAndDraw();
        });
    });
}

function deleteYZRow(idx) {
    if (state.coordinates.yzCoords.length <= 3) {
        alert("A cross section must have at least 3 points!");
        return;
    }
    state.coordinates.yzCoords.splice(idx, 1);
    renderYZCoordsTable();
    validateAndDraw();
}

// Step 1: Section Cut Coordinates Table
function renderCutCoordsTable() {
    const tbody = document.querySelector('#table-xy-cut tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    
    state.coordinates.cutLineCoords.forEach((pt, idx) => {
        tbody.innerHTML += `
            <tr>
                <td>Point ${idx + 1}</td>
                <td><input type="number" step="0.001" class="cut-input-x" data-idx="${idx}" value="${pt.x}"></td>
                <td><input type="number" step="0.001" class="cut-input-y" data-idx="${idx}" value="${pt.y}"></td>
                <td><button class="btn-delete" onclick="deleteCutRow(${idx})">Delete</button></td>
            </tr>
        `;
    });
    
    document.querySelectorAll('.cut-input-x').forEach(input => {
        input.addEventListener('change', (e) => {
            const idx = parseInt(e.target.getAttribute('data-idx'));
            state.coordinates.cutLineCoords[idx].x = parseFloat(e.target.value);
            validateAndDraw();
        });
    });
    document.querySelectorAll('.cut-input-y').forEach(input => {
        input.addEventListener('change', (e) => {
            const idx = parseInt(e.target.getAttribute('data-idx'));
            state.coordinates.cutLineCoords[idx].y = parseFloat(e.target.value);
            validateAndDraw();
        });
    });
}

function deleteCutRow(idx) {
    if (state.coordinates.cutLineCoords.length <= 2) {
        alert("A cut path must have at least 2 points!");
        return;
    }
    state.coordinates.cutLineCoords.splice(idx, 1);
    renderCutCoordsTable();
    validateAndDraw();
}

/**
 * Blueprint drawer
 */
function validateAndDraw() {
    const c = state.coordinates;
    const p = state.params;
    updateBlueprintViewToggles();
    
    const errorBanner = document.getElementById('error-banner-global');
    if (errorBanner) errorBanner.innerHTML = '';
    
    // --- Developed pipe cut line path length calculation ---
    let L_cut = 0;
    const m = c.cutLineCoords.length;
    for (let i = 0; i < m - 1; i++) {
        L_cut += Math.sqrt((c.cutLineCoords[i+1].x - c.cutLineCoords[i].x)**2 + (c.cutLineCoords[i+1].y - c.cutLineCoords[i].y)**2);
    }
    p.B = L_cut; // base B is fixed to cut length
    
    // Calculate L1 for drawing
    let L1 = L_cut / 2.0;
    if (m === 3) {
        L1 = Math.sqrt((c.cutLineCoords[1].x - c.cutLineCoords[0].x)**2 + (c.cutLineCoords[1].y - c.cutLineCoords[0].y)**2);
    }
    
    const lenBadge = document.getElementById('lbl-fixed-length');
    if (lenBadge) lenBadge.innerText = `Fixed Profile Length: ${L_cut.toFixed(2)}m (Upstream Cut Segment: ${L1.toFixed(2)}m)`;
    
    // --- Auto-generate Y-Z cross-section coordinates from plan/profile ---
    const ys = c.xyCoords.map(pt => pt.y);
    const W_width = Math.max(...ys) - (Math.min(...ys) || 0.0);
    
    const zs = c.xzCoords.map(pt => pt.z);
    const H_height = Math.max(...zs) - (Math.min(...zs) || 0.0);
    
    // Set cross-section concrete geometry (initial fallback if empty)
    if (!c.yzCoords || c.yzCoords.length === 0) {
        c.yzCoords = [
            { y: 0.0, z: 0.0 },
            { y: W_width, z: 0.0 },
            { y: W_width, z: H_height },
            { y: 0.0, z: H_height }
        ];
    }
    
    // Compute width B_yz from actual yzCoords polygon bounds
    const ys_yz = c.yzCoords.map(pt => pt.y || 0.0);
    const yz_width = Math.max(0.1, Math.max(...ys_yz) - Math.min(...ys_yz));
    
    // Synchronize parameters
    p.B_yz = yz_width;
    p.W = yz_width;
    p.H_ab = H_height;
    
    // Auto-center pipe horizontally and match bend IP elevation vertically ONLY if not set
    if (!c.pipeCenterYZ || typeof c.pipeCenterYZ.y !== 'number' || isNaN(c.pipeCenterYZ.y)) {
        c.pipeCenterYZ = {
            y: W_width / 2.0,
            z: (c.pipeXZ && c.pipeXZ[1]) ? c.pipeXZ[1].z : H_height / 2.0
        };
    }
    
    // Update YZ input fields in Step 3 so they match calculated values if not currently focused
    const pipeCenterYInput = document.getElementById('pipe-center-y');
    if (pipeCenterYInput && document.activeElement !== pipeCenterYInput) {
        pipeCenterYInput.value = c.pipeCenterYZ.y;
    }
    const pipeCenterZInput = document.getElementById('pipe-center-z');
    if (pipeCenterZInput && document.activeElement !== pipeCenterZInput) {
        pipeCenterZInput.value = c.pipeCenterYZ.z;
    }
    
    // Render YZ table so the user sees the generated coordinates
    renderYZCoordsTable();
    
    // Render drawings
    drawPlanSVG(L_cut, L1);
    drawProfileSVG();
    drawSectionSVG();
    
    // --- Validations ---
    let errors = [];
    
    // Step 2 profile validation
    let profileError = false;
    c.xzCoords.forEach((pt) => {
        if (pt.x < 0 || pt.x > L_cut) profileError = true;
    });
    if (profileError) {
        errors.push(`Concrete profile coordinates must lie within [0.0, ${L_cut.toFixed(2)}m]!`);
    }
    
    // Step 3 section validation
    const pipeCenter = { x: c.pipeCenterYZ.y, y: c.pipeCenterYZ.z };
    const isPipeInsideConcrete = isPointInPolygon(pipeCenter, c.yzCoords);
    if (!isPipeInsideConcrete) {
        errors.push(`Pipe center coordinate lies outside the concrete cross section boundary!`);
    }
    
    // Render errors to global drawing panel notification
    if (errors.length > 0 && errorBanner) {
        errorBanner.innerHTML = errors.map(err => `
            <div class="error-banner" style="margin-bottom: 8px;">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                <span>${err}</span>
            </div>
        `).join('');
    }
    
    // --- Step-Independent Stability Recalculation Pipeline ---
    // 1. Run globally on any input change to keep state.results 100% up-to-date
    syncParamsFromCoords();
    calculateStability();
    
    // 2. Run UI rendering conditionally when active step is Step 4 (Results)
    if (state.currentStep === 4) {
        if (state.selectedCaseIndex === undefined || state.selectedCaseIndex === null) {
            state.selectedCaseIndex = 0;
        }
        updateDashboardMetrics();
        renderForcesTable();
        renderCaseCombinationsTable();
        renderChecklists();
        renderSimulator();
        renderDetailedCalculationCard();
    }
    
    autoSaveState();
}

function updateBlueprintViewToggles() {
    const views = ['plan', 'profile', 'section', '3d'];
    views.forEach(v => {
        const btn = document.getElementById(`btn-view-${v}`);
        if (!btn) return;
        if (state.activeBlueprintView === v) {
            btn.className = "btn btn-sm";
            btn.style.background = "var(--accent-cyan)";
            btn.style.color = "#000";
            btn.style.fontWeight = "600";
        } else {
            btn.className = "btn btn-outline btn-sm";
            btn.style.background = "";
            btn.style.color = "";
            btn.style.fontWeight = "";
        }
    });
    
    const planW = document.getElementById('wrapper-plan-view');
    const profileW = document.getElementById('wrapper-profile-view');
    const sectionW = document.getElementById('wrapper-section-view');
    const view3DW = document.getElementById('wrapper-3d-view');
    
    if (planW) planW.style.display = (state.activeBlueprintView === 'plan') ? 'flex' : 'none';
    if (profileW) profileW.style.display = (state.activeBlueprintView === 'profile') ? 'flex' : 'none';
    if (sectionW) sectionW.style.display = (state.activeBlueprintView === 'section') ? 'flex' : 'none';
    if (view3DW) view3DW.style.display = (state.activeBlueprintView === '3d') ? 'flex' : 'none';

    if (state.activeBlueprintView === '3d') {
        const viewport3D = document.getElementById('3d-svg-viewport');
        if (viewport3D) {
            viewport3D.innerHTML = generate3DSVG();
        }
    }
}
window.updateBlueprintViewToggles = updateBlueprintViewToggles;

function makeDimLine(x1, y1, x2, y2, label, isVertical = false) {
    if ([x1, y1, x2, y2].some(v => typeof v !== 'number' || isNaN(v))) return '';
    const tickLen = 4;
    let tick1 = '', tick2 = '';
    if (isVertical) {
        tick1 = `M${(x1 - tickLen).toFixed(1)},${y1.toFixed(1)} L${(x1 + tickLen).toFixed(1)},${y1.toFixed(1)}`;
        tick2 = `M${(x2 - tickLen).toFixed(1)},${y2.toFixed(1)} L${(x2 + tickLen).toFixed(1)},${y2.toFixed(1)}`;
    } else {
        tick1 = `M${x1.toFixed(1)},${(y1 - tickLen).toFixed(1)} L${x1.toFixed(1)},${(y1 + tickLen).toFixed(1)}`;
        tick2 = `M${x2.toFixed(1)},${(y2 - tickLen).toFixed(1)} L${x2.toFixed(1)},${(y2 + tickLen).toFixed(1)}`;
    }
    
    const midX = (x1 + x2) / 2.0;
    const midY = (y1 + y2) / 2.0;
    
    if (isVertical) {
        return `
            <g class="dim-group">
                <line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="#64748b" stroke-width="1.2" stroke-dasharray="3 2" />
                <path d="${tick1} ${tick2}" stroke="#64748b" stroke-width="1.5" />
                <text x="${(midX - 8).toFixed(1)}" y="${(midY + 3).toFixed(1)}" text-anchor="end" fill="#00f2fe" font-size="9" font-weight="700" font-family="monospace">${label}</text>
            </g>
        `;
    } else {
        return `
            <g class="dim-group">
                <line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="#64748b" stroke-width="1.2" stroke-dasharray="3 2" />
                <path d="${tick1} ${tick2}" stroke="#64748b" stroke-width="1.5" />
                <text x="${midX.toFixed(1)}" y="${(midY - 6).toFixed(1)}" text-anchor="middle" fill="#00f2fe" font-size="9" font-weight="700" font-family="monospace">${label}</text>
            </g>
        `;
    }
}

function drawPlanSVG(L_cut, L1) {
    const viewport = document.getElementById('plan-svg-viewport');
    if (!viewport) return;
    
    const rect = viewport.getBoundingClientRect();
    const viewWidth = rect.width || 450;
    const viewHeight = rect.height || 220;
    
    const c = state.coordinates;
    const p = state.params;
    
    const blockXs = c.xyCoords.map(pt => pt.x);
    const blockYs = c.xyCoords.map(pt => pt.y);
    const xs = [...blockXs, ...c.pipeXY.map(pt => pt.x)];
    const ys = [...blockYs, ...c.pipeXY.map(pt => pt.y)];
    
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    
    const blkMinX = Math.min(...blockXs);
    const blkMaxX = Math.max(...blockXs);
    const blkMinY = Math.min(...blockYs);
    const blkMaxY = Math.max(...blockYs);
    
    const w_geom = Math.max(1.0, maxX - minX);
    const h_geom = Math.max(1.0, maxY - minY);
    
    const pad = 42;
    const scaleX = (viewWidth - 2 * pad) / w_geom;
    const scaleY = (viewHeight - 2 * pad) / h_geom;
    const scale = Math.min(scaleX, scaleY);
    
    const offsetX = (viewWidth - w_geom * scale) / 2.0 - minX * scale;
    const offsetY = (viewHeight - h_geom * scale) / 2.0 + maxY * scale;
    
    const blockPoints = c.xyCoords.map(pt => `${offsetX + pt.x * scale},${offsetY - pt.y * scale}`).join(' ');
    const pipePoints = c.pipeXY.map(pt => `${offsetX + pt.x * scale},${offsetY - pt.y * scale}`).join(' ');
    const cutPoints = c.cutLineCoords.map(pt => `${offsetX + pt.x * scale},${offsetY - pt.y * scale}`).join(' ');

    const svgBlkMinX = offsetX + blkMinX * scale;
    const svgBlkMaxX = offsetX + blkMaxX * scale;
    const svgBlkMinY = offsetY - blkMaxY * scale;
    const svgBlkMaxY = offsetY - blkMinY * scale;

    const dimLen = makeDimLine(svgBlkMinX, svgBlkMinY - 14, svgBlkMaxX, svgBlkMinY - 14, `B = ${p.B.toFixed(2)} m`);
    const dimWid = makeDimLine(svgBlkMinX - 14, svgBlkMinY, svgBlkMinX - 14, svgBlkMaxY, `W = ${(p.B_yz || p.W).toFixed(2)} m`, true);

    const pipeMidX = (svgBlkMinX + svgBlkMaxX) / 2.0;
    const pipeMidY = (svgBlkMinY + svgBlkMaxY) / 2.0;
    
    viewport.innerHTML = `
        <svg width="100%" height="100%" viewBox="0 0 ${viewWidth} ${viewHeight}">
            <defs>
                <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255, 255, 255, 0.02)" stroke-width="1"/>
                </pattern>
                <linearGradient id="concreteGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#1e293b" />
                    <stop offset="50%" stop-color="#334155" />
                    <stop offset="100%" stop-color="#1e293b" />
                </linearGradient>
                <linearGradient id="pipeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stop-color="#0f172a" stop-opacity="0.8"/>
                    <stop offset="50%" stop-color="#64748b" stop-opacity="0.9"/>
                    <stop offset="100%" stop-color="#0f172a" stop-opacity="0.8"/>
                </linearGradient>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
            
            <!-- Concrete block fill and glow border -->
            <polygon points="${blockPoints}" fill="url(#concreteGrad)" stroke="var(--accent-cyan)" stroke-width="2.5" filter="drop-shadow(0 0 8px var(--accent-cyan-glow))" />
            
            <!-- Metallic Steel Outer Penstock Pipe -->
            <polyline points="${pipePoints}" fill="none" stroke="url(#pipeGrad)" stroke-width="${scale * (state.params.D + 2 * state.params.t)}" stroke-linecap="round" />
            
            <!-- Inner Penstock Water Stream -->
            <polyline points="${pipePoints}" fill="none" stroke="rgba(0, 242, 254, 0.25)" stroke-width="${scale * state.params.D}" stroke-linecap="round" />
            
            <!-- Centerline dashed axis -->
            <polyline points="${pipePoints}" fill="none" stroke="var(--accent-cyan)" stroke-width="1.5" stroke-dasharray="6 3" />
            
            <!-- Cut Line along custom path -->
            <polyline points="${cutPoints}" fill="none" stroke="var(--accent-orange)" stroke-width="2.5" stroke-dasharray="8 4" />
            
            <!-- Engineering Dimension Lines -->
            ${dimLen}
            ${dimWid}

            <!-- Pipe Diameter Label Callout -->
            <text x="${pipeMidX.toFixed(1)}" y="${(pipeMidY + 14).toFixed(1)}" fill="#00f2fe" font-size="9" font-weight="700" text-anchor="middle" font-family="monospace">Pipe Ø D = ${p.D.toFixed(2)} m</text>

            <text x="20" y="24" fill="var(--text-secondary)" font-size="11" font-weight="600" letter-spacing="1">PLAN VIEW (X-Y plane)</text>
        </svg>
    `;
}

function drawProfileSVG() {
    const viewport = document.getElementById('profile-svg-viewport');
    if (!viewport) return;
    
    const rect = viewport.getBoundingClientRect();
    const viewWidth = rect.width || 450;
    const viewHeight = rect.height || 220;
    
    const c = state.coordinates;
    const p = state.params;
    
    const blockXs = c.xzCoords.map(pt => pt.x);
    const blockZs = c.xzCoords.map(pt => pt.z);
    const xs = [...blockXs, ...c.pipeXZ.map(pt => pt.x), ...c.groundCoords.map(pt => pt.x)];
    const zs = [...blockZs, ...c.pipeXZ.map(pt => pt.z), ...c.groundCoords.map(pt => pt.z)];
    
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minZ = Math.min(...zs);
    const maxZ = Math.max(...zs);
    
    const blkMinX = Math.min(...blockXs);
    const blkMaxX = Math.max(...blockXs);
    const blkMinZ = Math.min(...blockZs);
    const blkMaxZ = Math.max(...blockZs);
    
    const w_geom = Math.max(1.0, maxX - minX);
    const h_geom = Math.max(1.0, maxZ - minZ);
    
    const pad = 42;
    const scaleX = (viewWidth - 2 * pad) / w_geom;
    const scaleY = (viewHeight - 2 * pad) / h_geom;
    const scale = Math.min(scaleX, scaleY);
    
    const offsetX = (viewWidth - w_geom * scale) / 2.0 - minX * scale;
    const offsetY = (viewHeight - h_geom * scale) / 2.0 + maxZ * scale;
    
    const blockPoints = c.xzCoords.map(pt => `${offsetX + pt.x * scale},${offsetY - pt.z * scale}`).join(' ');
    
    const pX1 = offsetX + c.pipeXZ[0].x * scale;
    const pY1 = offsetY - c.pipeXZ[0].z * scale;
    const pX2 = offsetX + c.pipeXZ[1].x * scale;
    const pY2 = offsetY - c.pipeXZ[1].z * scale;
    const pX3 = offsetX + c.pipeXZ[2].x * scale;
    const pY3 = offsetY - c.pipeXZ[2].z * scale;
    
    const groundPoints = c.groundCoords.map(pt => `${offsetX + pt.x * scale},${offsetY - pt.z * scale}`).join(' ');
    const firstX = offsetX + c.groundCoords[0].x * scale;
    const lastX = offsetX + c.groundCoords[c.groundCoords.length - 1].x * scale;
    const bottomY = viewHeight - 10;

    const svgBlkMinX = offsetX + blkMinX * scale;
    const svgBlkMaxX = offsetX + blkMaxX * scale;
    const svgBlkMinZ = offsetY - blkMaxZ * scale;
    const svgBlkMaxZ = offsetY - blkMinZ * scale;

    const dimLen = makeDimLine(svgBlkMinX, svgBlkMaxZ + 14, svgBlkMaxX, svgBlkMaxZ + 14, `B = ${p.B.toFixed(2)} m`);
    const dimH = makeDimLine(svgBlkMinX - 14, svgBlkMinZ, svgBlkMinX - 14, svgBlkMaxZ, `H = ${p.H_ab.toFixed(2)} m`, true);

    viewport.innerHTML = `
        <svg width="100%" height="100%" viewBox="0 0 ${viewWidth} ${viewHeight}">
            <defs>
                <pattern id="groundHatch" width="10" height="10" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
                    <line x1="0" y1="0" x2="0" y2="10" stroke="rgba(148, 163, 184, 0.12)" stroke-width="1.5" />
                </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
            
            <!-- Ground foundation soil cross-hatching & sloped line -->
            <polygon points="${groundPoints} ${lastX},${bottomY} ${firstX},${bottomY}" fill="url(#groundHatch)" opacity="0.45" />
            <polyline points="${groundPoints}" fill="none" stroke="#a16207" stroke-width="2.5" stroke-dasharray="5 3" />
            
            <!-- Concrete block fill and glow border -->
            <polygon points="${blockPoints}" fill="url(#concreteGrad)" stroke="var(--accent-cyan)" stroke-width="2.5" filter="drop-shadow(0 0 8px var(--accent-cyan-glow))" />
            
            <!-- Metallic Steel Outer Pipe -->
            <polyline points="${pX1},${pY1} ${pX2},${pY2} ${pX3},${pY3}" fill="none" stroke="url(#pipeGrad)" stroke-width="${scale * (state.params.D + 2 * state.params.t)}" stroke-linecap="round" />
            
            <!-- Inner Penstock Water Stream -->
            <polyline points="${pX1},${pY1} ${pX2},${pY2} ${pX3},${pY3}" fill="none" stroke="rgba(0, 242, 254, 0.25)" stroke-width="${scale * state.params.D}" stroke-linecap="round" />
            
            <!-- Centerline dashed axis -->
            <polyline points="${pX1},${pY1} ${pX2},${pY2} ${pX3},${pY3}" fill="none" stroke="var(--accent-cyan)" stroke-width="1.5" stroke-dasharray="6 3" />
            
            <!-- Engineering Dimension Lines -->
            ${dimLen}
            ${dimH}

            <!-- Pipe Diameter Label Callout -->
            <text x="${pX2.toFixed(1)}" y="${(pY2 - 14).toFixed(1)}" fill="#00f2fe" font-size="9" font-weight="700" text-anchor="middle" font-family="monospace">Pipe Ø D = ${p.D.toFixed(2)} m</text>

            <text x="20" y="24" fill="var(--text-secondary)" font-size="11" font-weight="600" letter-spacing="1">LONGITUDINAL PROFILE (X-Z plane)</text>
        </svg>
    `;
}

function drawSectionSVG() {
    const viewport = document.getElementById('section-svg-viewport');
    if (!viewport) return;
    
    const rect = viewport.getBoundingClientRect();
    const viewWidth = rect.width || 450;
    const viewHeight = rect.height || 220;
    
    const c = state.coordinates;
    const p = state.params;
    
    const blockYs = c.yzCoords.map(pt => pt.y);
    const blockZs = c.yzCoords.map(pt => pt.z);
    const ys = [...blockYs, c.pipeCenterYZ.y];
    const zs = [...blockZs, c.pipeCenterYZ.z];
    
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    const minZ = Math.min(...zs);
    const maxZ = Math.max(...zs);
    
    const blkMinY = Math.min(...blockYs);
    const blkMaxY = Math.max(...blockYs);
    const blkMinZ = Math.min(...blockZs);
    const blkMaxZ = Math.max(...blockZs);
    
    const w_geom = Math.max(1.0, maxY - minY);
    const h_geom = Math.max(1.0, maxZ - minZ);
    
    const pad = 42;
    const scaleY_factor = (viewWidth - 2 * pad) / w_geom;
    const scaleZ_factor = (viewHeight - 2 * pad) / h_geom;
    const scale = Math.min(scaleY_factor, scaleZ_factor);
    
    const offsetX = (viewWidth - w_geom * scale) / 2.0 - minY * scale;
    const offsetY = (viewHeight - h_geom * scale) / 2.0 + maxZ * scale;
    
    const blockPoints = c.yzCoords.map(pt => `${offsetX + pt.y * scale},${offsetY - pt.z * scale}`).join(' ');
    
    const pipeY = offsetX + c.pipeCenterYZ.y * scale;
    const pipeZ = offsetY - c.pipeCenterYZ.z * scale;
    
    const firstY = offsetX + c.yzCoords[0].y * scale;
    const lastY = offsetX + c.yzCoords[1].y * scale;
    
    let z_ground = 0.0;
    if (c.groundCoords && c.groundCoords.length > 0) {
        const targetX = p.B / 2.0;
        let closestDist = Infinity;
        c.groundCoords.forEach(pt => {
            const dist = Math.abs(pt.x - targetX);
            if (dist < closestDist) {
                closestDist = dist;
                z_ground = pt.z;
            }
        });
    }
    
    const groundY_svg = offsetY - z_ground * scale;

    const svgBlkMinY = offsetX + blkMinY * scale;
    const svgBlkMaxY = offsetX + blkMaxY * scale;
    const svgBlkMinZ = offsetY - blkMaxZ * scale;
    const svgBlkMaxZ = offsetY - blkMinZ * scale;

    const dimWid = makeDimLine(svgBlkMinY, svgBlkMaxZ + 14, svgBlkMaxY, svgBlkMaxZ + 14, `W = ${(p.B_yz || p.W).toFixed(2)} m`);
    const dimH = makeDimLine(svgBlkMinY - 14, svgBlkMinZ, svgBlkMinY - 14, svgBlkMaxZ, `H = ${p.H_ab.toFixed(2)} m`, true);
    
    viewport.innerHTML = `
        <svg width="100%" height="100%" viewBox="0 0 ${viewWidth} ${viewHeight}">
            <rect width="100%" height="100%" fill="url(#grid)" />
            
            <!-- Ground foundation soil cross-hatching at embedment depth -->
            <rect x="${firstY - 40}" y="${groundY_svg}" width="${(lastY - firstY) + 80}" height="${offsetY + 120 - groundY_svg}" fill="url(#groundHatch)" opacity="0.45" />
            <line x1="${firstY - 40}" y1="${groundY_svg}" x2="${lastY + 40}" y2="${groundY_svg}" stroke="#a16207" stroke-width="2.5" stroke-dasharray="5 3" />
            
            <!-- Concrete block fill and glow border -->
            <polygon points="${blockPoints}" fill="url(#concreteGrad)" stroke="var(--accent-cyan)" stroke-width="2.5" filter="drop-shadow(0 0 8px var(--accent-cyan-glow))" />
            
            <!-- Circular Penstock steel shell outer ring -->
            <circle cx="${pipeY}" cy="${pipeZ}" r="${scale * (state.params.D/2.0 + state.params.t)}" fill="#475569" />
            
            <!-- Inner water core filled cylinder -->
            <circle cx="${pipeY}" cy="${pipeZ}" r="${scale * state.params.D/2.0}" fill="url(#pipeGrad)" stroke="var(--accent-cyan)" stroke-width="1.5" />
            
            <!-- Center crosshairs -->
            <line x1="${pipeY - 12}" y1="${pipeZ}" x2="${pipeY + 12}" y2="${pipeZ}" stroke="rgba(0, 242, 254, 0.6)" stroke-width="1" />
            <line x1="${pipeY}" y1="${pipeZ - 12}" x2="${pipeY}" y2="${pipeZ + 12}" stroke="rgba(0, 242, 254, 0.6)" stroke-width="1" />
            
            <!-- Engineering Dimension Lines -->
            ${dimWid}
            ${dimH}

            <!-- Pipe Center Location Callout -->
            <text x="${(pipeY + 10).toFixed(1)}" y="${(pipeZ - 8).toFixed(1)}" fill="#00f2fe" font-size="8.5" font-weight="700" font-family="monospace">Pipe (Y:${c.pipeCenterYZ.y.toFixed(2)}m, Z:${c.pipeCenterYZ.z.toFixed(2)}m)</text>

            <text x="20" y="24" fill="var(--text-secondary)" font-size="11" font-weight="600" letter-spacing="1">CROSS SECTION (Y-Z plane)</text>
        </svg>
    `;
}

function syncParamsFromCoords() {
    const c = state.coordinates;
    const p = state.params;
    
    if (c.xzCoords && c.xzCoords.length > 0) {
        const zs = c.xzCoords.map(pt => pt.z);
        p.H_ab = Math.max(...zs) - Math.min(...zs);
    }
    
    if (c.yzCoords && c.yzCoords.length > 0) {
        const ys = c.yzCoords.map(pt => pt.y);
        p.B_yz = Math.max(...ys) - Math.min(...ys);
    }
}

/**
 * Dashboard & Results controllers
 */
function updateDashboardMetrics() {
    let minSliding = Infinity;
    let maxEcc = 0;
    let maxBearing = 0;
    let allPassed = true;
    
    state.results.cases.forEach(c => {
        if (c.Fs < minSliding) minSliding = c.Fs;
        if (c.e > maxEcc) maxEcc = c.e;
        if (c.sigma > maxBearing) maxBearing = c.sigma;
        if (!c.passed) allPassed = false;
    });
    
    document.getElementById('metric-sliding').querySelector('.val').innerText = fNum(minSliding, 2);
    document.getElementById('metric-overturning').querySelector('.val').innerText = fNum(maxEcc, 3) + 'm';
    document.getElementById('metric-bearing').querySelector('.val').innerText = fNum(maxBearing, 2);
    
    const slidingCard = document.getElementById('metric-sliding');
    if (minSliding < 1.2) {
        slidingCard.classList.add('fail');
    } else {
        slidingCard.classList.remove('fail');
    }
    
    // Update summary badge text and style
    const checklistBadge = document.getElementById('checklist-summary-badge');
    if (checklistBadge) {
        const total = state.results.cases.length;
        const passed = state.results.cases.filter(c => c.passed).length;
        checklistBadge.innerText = `${passed}/${total} Cases Passed`;
        if (allPassed) {
            checklistBadge.style.background = "#10b981";
            checklistBadge.style.color = "#000";
        } else {
            checklistBadge.style.background = "#ef4444";
            checklistBadge.style.color = "#fff";
        }
    }
    
    const statusCard = document.getElementById('overall-status-card');
    if (statusCard) {
        if (allPassed) {
            statusCard.className = "header-status-card pass";
            statusCard.querySelector('.status-text').innerText = "PASSED";
            statusCard.querySelector('.status-icon').innerText = "✓";
        } else {
            statusCard.className = "header-status-card fail";
            statusCard.querySelector('.status-text').innerText = "FAILED";
            statusCard.querySelector('.status-icon').innerText = "✗";
        }
    }
}

// Render Results 16 cases table
function renderCaseCombinationsTable() {
    const viewport = document.getElementById('results-table-viewport');
    
    let rowsHtml = '';
    state.results.cases.forEach((c, idx) => {
        const statusBadge = c.passed ? '<span class="status-badge ok">PASS</span>' : '<span class="status-badge fail">FAIL</span>';
        
        // Highlight active clicked case
        const highlightStyle = (idx === state.selectedCaseIndex) ? 'background-color:rgba(0,242,254,0.05); border-left: 3px solid var(--accent-cyan);' : '';
        
        rowsHtml += `
            <tr style="${highlightStyle}; cursor:pointer;" onclick="selectCaseRow(${idx})">
                <td style="font-weight:600; color:#fff">${c.caseName}</td>
                <td>${c.plane}</td>
                <td>${c.eqLabel}</td>
                <td class="sym">${c.combination}</td>
                <td class="num">${fNum(c.totalV, 2)}</td>
                <td class="num">${fNum(c.totalH, 2)}</td>
                <td class="num" style="color: ${c.eccentricityPass ? 'var(--text-secondary)' : 'var(--accent-red)'}">${fNum(c.e, 3)} <small style="color:var(--text-muted)">(&lt;${fNum(c.limit_e, 3)})</small></td>
                <td class="num" style="color: ${c.slidingPass ? 'var(--text-secondary)' : 'var(--accent-red)'}">${fNum(c.Fs, 2)}</td>
                <td class="num" style="color: ${c.bearingPass ? 'var(--text-secondary)' : 'var(--accent-red)'}">${fNum(c.sigma, 2)} <small style="color:var(--text-muted)">(&lt;${fNum(c.limit_qa, 2)})</small></td>
                <td>${statusBadge}</td>
            </tr>
        `;
    });
    
    viewport.innerHTML = `
        <table class="calc-table">
            <thead>
                <tr>
                    <th>Load Case</th>
                    <th>Plane</th>
                    <th>EQ Direction</th>
                    <th>Comb. Eq</th>
                    <th>V [ton]</th>
                    <th>H [ton]</th>
                    <th>e [m]</th>
                    <th>Sliding Fs</th>
                    <th>Bearing [t/m²]</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                ${rowsHtml}
            </tbody>
        </table>
    `;
}

function selectCaseRow(idx) {
    state.selectedCaseIndex = idx;
    state.selectedForceComponent = null; // clear force selection when changing case
    renderCaseCombinationsTable();
    renderDetailedCalculationCard();
}
window.selectCaseRow = selectCaseRow;

function selectForceRow(key) {
    state.selectedForceComponent = key;
    renderForcesTable();
    renderDetailedCalculationCard();
}
window.selectForceRow = selectForceRow;

function clearSelectedForce() {
    state.selectedForceComponent = null;
    renderForcesTable();
    renderDetailedCalculationCard();
}
window.clearSelectedForce = clearSelectedForce;

function renderForcesTable() {
    const viewport = document.getElementById('results-table-viewport');
    if (!viewport) return;
    const f = state.results.forces;
    
    const hs = (key) => (state.selectedForceComponent === key)
        ? 'background-color: rgba(0, 242, 254, 0.08); border-left: 3px solid var(--accent-cyan); cursor: pointer;'
        : 'cursor: pointer;';
        
    viewport.innerHTML = `
        <table class="calc-table">
            <thead>
                <tr>
                    <th>Force Component</th>
                    <th>Symbol</th>
                    <th>Fx [ton]</th>
                    <th>Fy [ton]</th>
                    <th>Fz [ton]</th>
                </tr>
            </thead>
            <tbody>
                <tr style="${hs('WA')}" onclick="selectForceRow('WA')"><td>Concrete dead weight (WA)</td><td>WA</td><td>${fNum(0.0, 3)}</td><td>${fNum(0.0, 3)}</td><td>${fNum(-f.WA, 3)}</td></tr>
                <tr style="${hs('W')}" onclick="selectForceRow('W')"><td>Pipe & Water weight (Upstream)</td><td>W</td><td>${fNum(f.W.x, 3)}</td><td>${fNum(f.W.y, 3)}</td><td>${fNum(f.W.z, 3)}</td></tr>
                <tr style="${hs('W_prime')}" onclick="selectForceRow('W_prime')"><td>Pipe & Water weight (Downstream)</td><td>W'</td><td>${fNum(f.W_prime.x, 3)}</td><td>${fNum(f.W_prime.y, 3)}</td><td>${fNum(f.W_prime.z, 3)}</td></tr>
                <tr style="${hs('P1')}" onclick="selectForceRow('P1')"><td>Pipe dead weight (Upstream)</td><td>P1</td><td>${fNum(f.P1.x, 3)}</td><td>${fNum(f.P1.y, 3)}</td><td>${fNum(f.P1.z, 3)}</td></tr>
                <tr style="${hs('P1_prime')}" onclick="selectForceRow('P1_prime')"><td>Pipe dead weight (Downstream)</td><td>P1'</td><td>${fNum(f.P1_prime.x, 3)}</td><td>${fNum(f.P1_prime.y, 3)}</td><td>${fNum(f.P1_prime.z, 3)}</td></tr>
                <tr style="${hs('P2')}" onclick="selectForceRow('P2')"><td>Hydrodynamic Friction (Upstream)</td><td>P2</td><td>${fNum(f.P2.x, 3)}</td><td>${fNum(f.P2.y, 3)}</td><td>${fNum(f.P2.z, 3)}</td></tr>
                <tr style="${hs('P2_prime')}" onclick="selectForceRow('P2_prime')"><td>Hydrodynamic Friction (Downstream)</td><td>P2'</td><td>${fNum(f.P2_prime.x, 3)}</td><td>${fNum(f.P2_prime.y, 3)}</td><td>${fNum(f.P2_prime.z, 3)}</td></tr>
                <tr style="${hs('Pv')}" onclick="selectForceRow('Pv')"><td>Centrifugal Vert. Bend</td><td>Pv</td><td>${fNum(f.Pv.x, 3)}</td><td>${fNum(f.Pv.y, 3)}</td><td>${fNum(f.Pv.z, 3)}</td></tr>
                <tr style="${hs('Ph')}" onclick="selectForceRow('Ph')"><td>Centrifugal Horiz. Bend</td><td>Ph</td><td>${fNum(f.Ph.x, 3)}</td><td>${fNum(f.Ph.y, 3)}</td><td>${fNum(f.Ph.z, 3)}</td></tr>
                <tr style="${hs('P3')}" onclick="selectForceRow('P3')"><td>Upstream expansion joint pressure</td><td>P3</td><td>${fNum(f.P3.x, 3)}</td><td>${fNum(f.P3.y, 3)}</td><td>${fNum(f.P3.z, 3)}</td></tr>
                <tr style="${hs('P3_prime')}" onclick="selectForceRow('P3_prime')"><td>Downstream expansion joint pressure</td><td>P3'</td><td>${fNum(f.P3_prime.x, 3)}</td><td>${fNum(f.P3_prime.y, 3)}</td><td>${fNum(f.P3_prime.z, 3)}</td></tr>
                <tr style="${hs('Prv')}" onclick="selectForceRow('Prv')"><td>Unbalanced vertical bend pressure</td><td>Prv</td><td>${fNum(f.Prv.x, 3)}</td><td>${fNum(f.Prv.y, 3)}</td><td>${fNum(f.Prv.z, 3)}</td></tr>
                <tr style="${hs('Prh')}" onclick="selectForceRow('Prh')"><td>Unbalanced horizontal bend pressure</td><td>Prh</td><td>${fNum(f.Prh.x, 3)}</td><td>${fNum(f.Prh.y, 3)}</td><td>${fNum(f.Prh.z, 3)}</td></tr>
                <tr style="${hs('P')}" onclick="selectForceRow('P')" style="font-weight:bold; border-top:2px solid var(--accent-cyan);">
                    <td>Constant Force Resultant Sum</td>
                    <td>P</td>
                    <td>${fNum(f.P_vec.x, 3)}</td>
                    <td>${fNum(f.P_vec.y, 3)}</td>
                    <td>${fNum(f.P_vec.z, 3)}</td>
                </tr>
            </tbody>
        </table>
    `;
}

function renderChecklists() {
    let xz_minFs = Infinity, xz_maxE = 0, xz_maxSigma = 0, xz_minFot = Infinity;
    let yz_minFs = Infinity, yz_maxE = 0, yz_maxSigma = 0, yz_minFot = Infinity;
    let xz_limitE = 0, yz_limitE = 0;
    
    state.results.cases.forEach(c => {
        if (c.plane === 'X-Z') {
            if (c.Fs < xz_minFs) xz_minFs = c.Fs;
            if (c.e > xz_maxE) xz_maxE = c.e;
            if (c.sigma > xz_maxSigma) xz_maxSigma = c.sigma;
            if (c.Fot < xz_minFot) xz_minFot = c.Fot;
            xz_limitE = c.limit_e;
        } else {
            if (c.Fs < yz_minFs) yz_minFs = c.Fs;
            if (c.e > yz_maxE) yz_maxE = c.e;
            if (c.sigma > yz_maxSigma) yz_maxSigma = c.sigma;
            if (c.Fot < yz_minFot) yz_minFot = c.Fot;
            yz_limitE = c.limit_e;
        }
    });
    
    const updateRow = (id, valText, pass, limitText, isLess = true) => {
        const row = document.getElementById(id);
        if (!row) return;
        const indicator = row.querySelector('.chk-indicator');
        const status = row.querySelector('.chk-status');
        const valPlaceholder = row.querySelector('.val');
        const limitPlaceholder = row.querySelector('.limit');
        const opPlaceholder = row.querySelector('.op');
        
        if (valPlaceholder) valPlaceholder.innerText = valText;
        if (limitPlaceholder && limitText !== undefined) limitPlaceholder.innerText = limitText;
        if (opPlaceholder) {
            if (isLess) {
                opPlaceholder.innerText = pass ? '<' : '>';
            } else {
                opPlaceholder.innerText = pass ? '≥' : '<';
            }
        }
        
        // Dynamically create or retrieve the manual recommendation info button
        let infoBtn = row.querySelector('.chk-info-btn');
        if (!infoBtn) {
            infoBtn = document.createElement('button');
            infoBtn.className = 'chk-info-btn';
            infoBtn.style.display = 'none';
            infoBtn.style.border = 'none';
            infoBtn.style.background = 'transparent';
            infoBtn.style.cursor = 'pointer';
            infoBtn.style.color = '#ef4444';
            infoBtn.style.padding = '4px';
            infoBtn.style.marginLeft = '8px';
            infoBtn.style.alignItems = 'center';
            infoBtn.style.justifyContent = 'center';
            infoBtn.title = 'View Manual Recommendation';
            infoBtn.innerHTML = `
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
            `;
            const statusEl = row.querySelector('.chk-status');
            if (statusEl) {
                statusEl.after(infoBtn);
            } else {
                row.appendChild(infoBtn);
            }
        }
        
        if (pass) {
            row.className = "check-item-row ok";
            if (indicator) indicator.className = "chk-indicator ok";
            if (indicator) indicator.innerText = "✓";
            if (status) {
                status.className = "chk-status ok";
                status.innerText = "OK";
            }
            if (infoBtn) infoBtn.style.display = 'none';
        } else {
            row.className = "check-item-row fail";
            if (indicator) indicator.className = "chk-indicator fail";
            if (indicator) indicator.innerText = "✗";
            if (status) {
                status.className = "chk-status fail";
                status.innerText = "FAIL";
            }
            if (infoBtn) {
                infoBtn.style.display = 'inline-flex';
                infoBtn.onclick = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    showRecommendationModal(id);
                };
            }
        }
    };
    
    const xzCases = state.results.cases.filter(c => c.plane === 'X-Z');
    const yzCases = state.results.cases.filter(c => c.plane === 'Y-Z');
    
    const limitFsVal = state.jicaAuditMode ? '2.0' : '1.2';
    const limitEXZ = fNum(xzCases[0] ? xzCases[0].limit_e : state.params.B / 4.0, 3) + 'm';
    const limitEYZ = fNum(yzCases[0] ? yzCases[0].limit_e : state.params.B_yz / 4.0, 3) + 'm';
    const limitQaXZ = fNum(xzCases[0] ? xzCases[0].limit_qa : state.params.qa, 2) + ' t/m²';
    const limitQaYZ = fNum(yzCases[0] ? yzCases[0].limit_qa : state.params.qa, 2) + ' t/m²';

    updateRow('chk-xz-sliding', fNum(xz_minFs, 2), xzCases.every(c => c.slidingPass), limitFsVal, false);
    updateRow('chk-xz-overturning-fs', fNum(xz_minFot, 2), xzCases.every(c => c.overturningFSPass), limitFsVal, false);
    updateRow('chk-xz-eccentricity', fNum(xz_maxE, 3) + 'm', xzCases.every(c => c.eccentricityPass), limitEXZ, true);
    updateRow('chk-xz-bearing', fNum(xz_maxSigma, 2) + ' t/m²', xzCases.every(c => c.bearingPass), limitQaXZ, true);
    
    updateRow('chk-yz-sliding', fNum(yz_minFs, 2), yzCases.every(c => c.slidingPass), limitFsVal, false);
    updateRow('chk-yz-overturning-fs', fNum(yz_minFot, 2), yzCases.every(c => c.overturningFSPass), limitFsVal, false);
    updateRow('chk-yz-eccentricity', fNum(yz_maxE, 3) + 'm', yzCases.every(c => c.eccentricityPass), limitEYZ, true);
    updateRow('chk-yz-bearing', fNum(yz_maxSigma, 2) + ' t/m²', yzCases.every(c => c.bearingPass), limitQaYZ, true);
}

function showRecommendationModal(checkId) {
    let title = "";
    let reason = "";
    let recommendations = [];
    
    switch (checkId) {
        case 'chk-xz-sliding':
            title = "Longitudinal Sliding Failure (X-Z)";
            reason = "The sliding safety factor (Fs) is below the JICA limit of 1.20. The net driving horizontal force exceeds the net resisting force (soil friction, keyway shear resistance, and rock anchor capacity).";
            recommendations = [
                "<strong>Increase Shear Key Height (h_key)</strong> under Step 3 (Mitigation) to engage passive soil resistance.",
                "<strong>Add Rock Anchors (n_anchors)</strong> under Step 3 to add direct shear capacity.",
                "<strong>Increase Block Height (H_ab)</strong> or profile elevations in Step 2 to add dead-weight and boost base friction.",
                "<strong>Increase Concrete Density (wc)</strong> if a heavier concrete aggregate mix is available."
            ];
            break;
            
        case 'chk-xz-overturning-fs':
            title = "Longitudinal Overturning Failure (X-Z)";
            reason = "The safety factor against overturning (Fot) is below the JICA limit of 1.20. The seismic and hydrostatic overturning moments about the toe exceed the resisting gravity moment.";
            recommendations = [
                "<strong>Extend the Heel Upstream (Stepped base coordinate 1 and 2)</strong> in Step 2 to increase the resisting moment arm.",
                "<strong>Extend the Toe Downstream (Stepped base coordinate 3 and 4)</strong> in Step 2 to increase the base footprint.",
                "<strong>Increase Concrete Dead Weight (WA)</strong> by scaling up block dimensions or concrete thickness (W).",
                "<strong>Add Rock Anchors</strong> to resist tension at the heel (engages anchor tension resisting moments)."
            ];
            break;
            
        case 'chk-xz-eccentricity':
            title = "Longitudinal Eccentricity / Lift-off Failure (X-Z)";
            reason = "The resultant load falls outside the middle-third (under static, e > B/6) or middle-fourth (under seismic, e > B/4) of the base length. This causes heel lift-off and instability.";
            recommendations = [
                "<strong>Asymmetrically Extend the Heel Upstream</strong> to balance the forward thrust of the penstock.",
                "<strong>Increase the Base Length (B)</strong> to expand the allowable eccentricity limit (B/4 or B/6).",
                "<strong>Adjust Penstock Elevations</strong> to lower the pipe bend centerline, decreasing the overturning height lever arm."
            ];
            break;
            
        case 'chk-xz-bearing':
            title = "Longitudinal Soil Bearing Pressure Failure (X-Z)";
            reason = "The peak redistributed soil bearing stress (sigma_max) at the toe exceeds the allowable soil bearing capacity (qa).";
            recommendations = [
                "<strong>Increase Base Length (B) or Width (W)</strong> to distribute the vertical load over a larger footprint area.",
                "<strong>Reduce Overturning Moments</strong> (by extending the heel upstream) to prevent extreme stress concentration at the toe.",
                "<strong>Enable Ground Improvements</strong> or concrete lean pad to increase the allowable soil bearing capacity (qa)."
            ];
            break;
            
        case 'chk-yz-sliding':
            title = "Transverse Sliding Failure (Y-Z)";
            reason = "The transverse sliding safety factor (Fs) is below 1.20 under perpendicular wind or seismic loading.";
            recommendations = [
                "<strong>Increase Block Width (W)</strong> to add dead weight and increase sliding resistance.",
                "<strong>Add Rock Anchors</strong> to resist transverse shear forces.",
                "<strong>Increase base friction coefficient (lambda)</strong> by roughening the rock surface interface."
            ];
            break;
            
        case 'chk-yz-overturning-fs':
            title = "Transverse Overturning Failure (Y-Z)";
            reason = "The safety factor against transverse overturning (Fot) is below 1.20.";
            recommendations = [
                "<strong>Increase Block Width (W)</strong> to provide a wider transverse resisting footprint.",
                "<strong>Add Rock Anchors</strong> to anchor the sides of the block against lateral tipping."
            ];
            break;
            
        case 'chk-yz-eccentricity':
            title = "Transverse Eccentricity Failure (Y-Z)";
            reason = "The resultant transverse load falls outside the middle-third or middle-fourth width limits, causing transverse base lift-off.";
            recommendations = [
                "<strong>Increase Block Width (W)</strong> to increase the allowable transverse eccentricity limit (W/4).",
                "<strong>Center the pipe location (y_pipe)</strong> exactly in the middle of the block width (W/2) to eliminate static asymmetry."
            ];
            break;
            
        case 'chk-yz-bearing':
            title = "Transverse Soil Bearing Failure (Y-Z)";
            reason = "The transverse base soil pressure exceeds the allowable bearing capacity (qa).";
            recommendations = [
                "<strong>Increase Block Width (W)</strong> to distribute vertical loads over a wider base area.",
                "<strong>Symmetrize lateral loads</strong> to avoid stress concentrations on one side."
            ];
            break;
    }
    
    // Create the modal DOM elements if not exists
    let modal = document.getElementById('recommendation-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'recommendation-modal';
        modal.className = 'modal-backdrop';
        modal.style.position = 'fixed';
        modal.style.top = '0';
        modal.style.left = '0';
        modal.style.width = '100vw';
        modal.style.height = '100vh';
        modal.style.backgroundColor = 'rgba(15, 23, 42, 0.6)';
        modal.style.backdropFilter = 'blur(4px)';
        modal.style.display = 'flex';
        modal.style.alignItems = 'center';
        modal.style.justifyContent = 'center';
        modal.style.zIndex = '10000';
        modal.style.opacity = '0';
        modal.style.transition = 'opacity 0.2s ease-out';
        
        modal.innerHTML = `
            <div class="modal-card" style="background: #ffffff; border-radius: 12px; width: 450px; max-width: 90%; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04); border: 1px solid #e2e8f0; overflow: hidden; transform: scale(0.95); transition: transform 0.2s ease-out;">
                <div class="modal-header" style="padding: 16px 20px; border-bottom: 1px solid #f1f5f9; display: flex; align-items: center; justify-content: space-between; background-color: #f8fafc;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <span style="color: #ef4444; display: flex; align-items: center;">
                            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                        </span>
                        <h4 id="rec-modal-title" style="margin: 0; font-size: 14px; font-weight: 700; color: #0f172a;">Recommendation</h4>
                    </div>
                    <button onclick="closeRecModal()" style="border: none; background: transparent; cursor: pointer; color: #64748b; padding: 4px; display: flex; align-items: center;">
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </div>
                <div class="modal-body" style="padding: 20px; font-size: 13px; line-height: 1.6; color: #334155;">
                    <p style="margin-top: 0; font-weight: 600; color: #475569; margin-bottom: 8px;">Why did it fail?</p>
                    <p id="rec-modal-reason" style="margin-bottom: 20px; padding: 10px; background-color: #fff1f2; border-left: 3px solid #f43f5e; border-radius: 4px; color: #9f1239;"></p>
                    
                    <p style="font-weight: 600; color: #475569; margin-bottom: 8px;">How to resolve manually?</p>
                    <ul id="rec-modal-list" style="margin: 0; padding-left: 18px; display: flex; flex-direction: column; gap: 8px;">
                    </ul>
                </div>
                <div class="modal-footer" style="padding: 12px 20px; border-top: 1px solid #f1f5f9; display: flex; justify-content: flex-end; background-color: #f8fafc;">
                    <button onclick="closeRecModal()" style="padding: 6px 16px; border-radius: 6px; border: 1px solid #cbd5e1; background: #ffffff; cursor: pointer; font-size: 12px; font-weight: 600; color: #334155; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">Acknowledge</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    
    // Bind onclick handlers
    window.closeRecModal = () => {
        const modal = document.getElementById('recommendation-modal');
        if (modal) {
            modal.style.opacity = '0';
            modal.querySelector('.modal-card').style.transform = 'scale(0.95)';
            setTimeout(() => {
                modal.style.display = 'none';
            }, 200);
        }
    };
    
    // Set values
    document.getElementById('rec-modal-title').innerText = title;
    document.getElementById('rec-modal-reason').innerText = reason;
    
    const listEl = document.getElementById('rec-modal-list');
    listEl.innerHTML = recommendations.map(rec => `
        <li style="margin-bottom: 4px;">${rec}</li>
    `).join('');
    
    // Show modal
    modal.style.display = 'flex';
    // Trigger layout before transition
    modal.offsetHeight;
    modal.style.opacity = '1';
    modal.querySelector('.modal-card').style.transform = 'scale(1)';
}

// Interactive Free Body Diagram (FBD) viewport logic
state.currentFBDPlane = 'XZ';
function switchFBDPlane(plane) {
    state.currentFBDPlane = plane;
    const btnXZ = document.getElementById('sim-btn-xz');
    const btnYZ = document.getElementById('sim-btn-yz');
    if (btnXZ && btnYZ) {
        btnXZ.classList.toggle('active', plane === 'XZ');
        btnYZ.classList.toggle('active', plane === 'YZ');
    }
    const container = document.getElementById('fbd-interactive-viewport');
    if (container) {
        container.innerHTML = generateFBDSVG(plane);
    }
}

function renderSimulator() {
    switchFBDPlane(state.currentFBDPlane || 'XZ');
}

/**
 * Navigation steps logic
 */
function setStep(stepNum) {
    if (stepNum < 1 || stepNum > 4) return;
    
    document.querySelectorAll('.wizard-pane').forEach(p => p.classList.remove('active'));
    document.getElementById(`pane-step-${stepNum}`).classList.add('active');
    
    for (let i = 1; i <= 4; i++) {
        const item = document.getElementById(`step-nav-${i}`);
        if (i === stepNum) {
            item.className = "step-item active";
        } else if (i < stepNum) {
            item.className = "step-item completed";
        } else {
            item.className = "step-item";
        }
    }
    
    const headersTexts = [
        "Step 1: Plan View Coordinate Input (XY Plane)",
        "Step 2: Profile View Coordinate Input (XZ Plane)",
        "Step 3: Cross Section Coordinate Input (YZ Plane)",
        "Step 4: Stability Analysis Results & Animations"
    ];
    document.getElementById('wizard-title-text').innerText = headersTexts[stepNum - 1];
    
    document.getElementById('btn-wizard-prev').disabled = (stepNum === 1);
    const statusCard = document.getElementById('overall-status-card');
    
    // Adjust layout columns for Step 4
    const globalBlueprints = document.getElementById('global-blueprints-card');
    const leftColumn = document.querySelector('.left-inputs-column');
    const gridContainer = document.querySelector('.tab-content-container .wizard-grid');
    
    if (stepNum === 4) {
        if (globalBlueprints) globalBlueprints.style.display = 'none';
        if (leftColumn) {
            leftColumn.style.gridColumn = 'span 2';
            leftColumn.style.width = '100%';
        }
        if (gridContainer) {
            gridContainer.style.gridTemplateColumns = '1fr';
        }
        
        document.getElementById('btn-wizard-next').innerText = "Finish / Edit";
        document.getElementById('btn-print-report').style.display = 'block';
        if (statusCard) statusCard.style.display = 'flex';
        
        syncParamsFromCoords();
        calculateStability();
        updateDashboardMetrics();
        renderForcesTable();
        renderChecklists();
        renderSimulator();
        selectCaseRow(0); // select case 1 by default
    } else {
        if (globalBlueprints) globalBlueprints.style.display = 'flex';
        if (leftColumn) {
            leftColumn.style.gridColumn = 'auto';
            leftColumn.style.width = 'auto';
        }
        if (gridContainer) {
            gridContainer.style.gridTemplateColumns = '1.15fr 1fr';
        }
        
        document.getElementById('btn-wizard-next').innerText = "Next Step";
        document.getElementById('btn-print-report').style.display = 'none';
        if (statusCard) statusCard.style.display = 'none';
    }
    
    state.currentStep = stepNum;
    validateAndDraw();
}

function loadPreset(key) {
    state.activePreset = key;
    document.getElementById('current-preset-label').innerText = `Case Study: ${presets[key].name}`;
    
    state.params = Object.assign({
        mitigation_active: true,
        h_key: 0.40,
        n_anchors: 0,
        d_anchor: 25.0,
        fy_anchor: 415.0,
        bearing_increase_factor: 1.50,
        soil_cohesion: 1.50,
        soil_friction_angle: 30.0,
        soil_unit_weight: 1.80
    }, presets[key].params);
    state.coordinates = JSON.parse(JSON.stringify(presets[key].coordinates));
    
    document.getElementById('pipe-xy-x1').value = state.coordinates.pipeXY[0].x;
    document.getElementById('pipe-xy-y1').value = state.coordinates.pipeXY[0].y;
    document.getElementById('pipe-xy-x2').value = state.coordinates.pipeXY[1].x;
    document.getElementById('pipe-xy-y2').value = state.coordinates.pipeXY[1].y;
    document.getElementById('pipe-xy-x3').value = state.coordinates.pipeXY[2].x;
    document.getElementById('pipe-xy-y3').value = state.coordinates.pipeXY[2].y;
    document.getElementById('param-D').value = state.params.D;
    document.getElementById('param-t').value = state.params.t;
    document.getElementById('param-t_prime').value = state.params.t_prime;
    document.getElementById('param-L').value = state.params.L;
    document.getElementById('param-L_prime').value = state.params.L_prime;
    
    document.getElementById('pipe-center-y').value = state.coordinates.pipeCenterYZ.y;
    document.getElementById('pipe-center-z').value = state.coordinates.pipeCenterYZ.z;
    document.getElementById('param-qa').value = state.params.qa;
    document.getElementById('param-lambda').value = state.params.lambda;
    document.getElementById('param-Kh').value = state.params.Kh;
    document.getElementById('param-l').value = state.params.l;
    
    document.getElementById('param-bearing-increase-factor').value = state.params.bearing_increase_factor || "1.50";
    document.getElementById('param-soil-cohesion').value = state.params.soil_cohesion || 1.50;
    document.getElementById('param-soil-friction-angle').value = state.params.soil_friction_angle || 30.0;
    
    document.getElementById('buried-condition-toggle').checked = state.params.buriedCondition;
    const jicaToggle = document.getElementById('jica-audit-toggle');
    if (jicaToggle) jicaToggle.checked = state.jicaAuditMode || false;
    document.getElementById('mitigation-toggle').checked = state.params.mitigation_active || false;
    document.getElementById('mitigation-inputs-panel').style.display = (state.params.mitigation_active) ? 'block' : 'none';
    document.getElementById('mitigation-h-key').value = state.params.h_key || 0.0;
    document.getElementById('mitigation-n-anchors').value = state.params.n_anchors || 0;
    document.getElementById('mitigation-d-anchor').value = state.params.d_anchor || 25;
    document.getElementById('mitigation-fy-anchor').value = state.params.fy_anchor || 415;
    
    renderXYCoordsTable();
    renderXZCoordsTable();
    renderXZPipeTable();
    renderXZGroundTable();
    renderYZCoordsTable();
    renderCutCoordsTable();
    
    setStep(1);
}

function initEvents() {
    document.querySelectorAll('.step-item').forEach(item => {
        item.addEventListener('click', () => {
            const step = parseInt(item.getAttribute('data-step'));
            setStep(step);
        });
    });
    
    // Preset buttons (removed from sidebar)
    
    // btn-add-cut-row and btn-follow-pipe bindings
    document.getElementById('btn-add-cut-row').addEventListener('click', () => {
        state.coordinates.cutLineCoords.push({ x: 0.0, y: 0.0 });
        renderCutCoordsTable();
    });
    document.getElementById('btn-follow-pipe').addEventListener('click', () => {
        state.coordinates.cutLineCoords = JSON.parse(JSON.stringify(state.coordinates.pipeXY));
        renderCutCoordsTable();
        validateAndDraw();
    });

    document.getElementById('btn-wizard-prev').addEventListener('click', () => {
        setStep(state.currentStep - 1);
    });
    document.getElementById('btn-wizard-next').addEventListener('click', () => {
        if (state.currentStep === 4) {
            setStep(1);
        } else {
            const L1 = Math.sqrt((state.coordinates.pipeXY[1].x - state.coordinates.pipeXY[0].x)**2 + (state.coordinates.pipeXY[1].y - state.coordinates.pipeXY[0].y)**2);
            const L2 = Math.sqrt((state.coordinates.pipeXY[2].x - state.coordinates.pipeXY[1].x)**2 + (state.coordinates.pipeXY[2].y - state.coordinates.pipeXY[1].y)**2);
            let L_cut = 0;
            const m = state.coordinates.cutLineCoords.length;
            for (let i = 0; i < m - 1; i++) {
                L_cut += Math.sqrt((state.coordinates.cutLineCoords[i+1].x - state.coordinates.cutLineCoords[i].x)**2 + (state.coordinates.cutLineCoords[i+1].y - state.coordinates.cutLineCoords[i].y)**2);
            }
            let hasError = false;
            
            if (state.currentStep === 2) {
                state.coordinates.xzCoords.forEach(pt => {
                    if (pt.x < 0 || pt.x > L_cut) hasError = true;
                });
            } else if (state.currentStep === 3) {
                const pipeCenter = { x: state.coordinates.pipeCenterYZ.y, y: state.coordinates.pipeCenterYZ.z };
                if (!isPointInPolygon(pipeCenter, state.coordinates.yzCoords)) hasError = true;
            }
            
            if (hasError) {
                alert("Please resolve coordinate boundary errors before moving forward!");
                return;
            }
            setStep(state.currentStep + 1);
        }
    });
    
    // Blueprint view toggles
    const views = ['plan', 'profile', 'section', '3d'];
    views.forEach(v => {
        const btn = document.getElementById(`btn-view-${v}`);
        if (btn) {
            btn.addEventListener('click', () => {
                state.activeBlueprintView = v;
                validateAndDraw();
            });
        }
    });

    document.getElementById('btn-add-xy-row').addEventListener('click', () => {
        state.coordinates.xyCoords.push({ x: 0.0, y: 0.0 });
        renderXYCoordsTable();
    });
    document.getElementById('btn-add-xz-row').addEventListener('click', () => {
        state.coordinates.xzCoords.push({ x: 0.0, z: 0.0 });
        renderXZCoordsTable();
    });
    document.getElementById('btn-add-ground-row').addEventListener('click', () => {
        state.coordinates.groundCoords.push({ x: 0.0, z: 0.0 });
        renderXZGroundTable();
    });
    document.getElementById('btn-add-yz-row').addEventListener('click', () => {
        state.coordinates.yzCoords.push({ y: 0.0, z: 0.0 });
        renderYZCoordsTable();
    });
    
    // Inputs binding
    document.getElementById('pipe-xy-x1').addEventListener('change', (e) => { state.coordinates.pipeXY[0].x = parseFloat(e.target.value); validateAndDraw(); });
    document.getElementById('pipe-xy-y1').addEventListener('change', (e) => { state.coordinates.pipeXY[0].y = parseFloat(e.target.value); validateAndDraw(); });
    document.getElementById('pipe-xy-x2').addEventListener('change', (e) => { state.coordinates.pipeXY[1].x = parseFloat(e.target.value); validateAndDraw(); });
    document.getElementById('pipe-xy-y2').addEventListener('change', (e) => { state.coordinates.pipeXY[1].y = parseFloat(e.target.value); validateAndDraw(); });
    document.getElementById('pipe-xy-x3').addEventListener('change', (e) => { state.coordinates.pipeXY[2].x = parseFloat(e.target.value); validateAndDraw(); });
    document.getElementById('pipe-xy-y3').addEventListener('change', (e) => { state.coordinates.pipeXY[2].y = parseFloat(e.target.value); validateAndDraw(); });
    
    document.getElementById('param-D').addEventListener('change', (e) => { state.params.D = parseFloat(e.target.value); validateAndDraw(); });
    document.getElementById('param-t').addEventListener('change', (e) => { state.params.t = parseFloat(e.target.value); validateAndDraw(); });
    document.getElementById('param-t_prime').addEventListener('change', (e) => { state.params.t_prime = parseFloat(e.target.value); validateAndDraw(); });
    document.getElementById('param-L').addEventListener('change', (e) => { state.params.L = parseFloat(e.target.value); validateAndDraw(); });
    document.getElementById('param-L_prime').addEventListener('change', (e) => { state.params.L_prime = parseFloat(e.target.value); validateAndDraw(); });
    document.getElementById('param-l_prime').addEventListener('change', (e) => { state.params.l_prime = parseFloat(e.target.value); validateAndDraw(); });
    document.getElementById('param-rs').addEventListener('change', (e) => { state.params.rs = parseFloat(e.target.value); validateAndDraw(); });
    
    document.getElementById('pipe-center-y').addEventListener('change', (e) => { state.coordinates.pipeCenterYZ.y = parseFloat(e.target.value); validateAndDraw(); });
    document.getElementById('pipe-center-z').addEventListener('change', (e) => { state.coordinates.pipeCenterYZ.z = parseFloat(e.target.value); validateAndDraw(); });
    document.getElementById('param-qa').addEventListener('change', (e) => { state.params.qa = parseFloat(e.target.value); validateAndDraw(); });
    document.getElementById('param-lambda').addEventListener('change', (e) => { state.params.lambda = parseFloat(e.target.value); validateAndDraw(); });
    document.getElementById('param-Kh').addEventListener('change', (e) => { state.params.Kh = parseFloat(e.target.value); validateAndDraw(); });
    document.getElementById('param-l').addEventListener('change', (e) => { state.params.l = parseFloat(e.target.value); validateAndDraw(); });
    
    document.getElementById('param-H').addEventListener('change', (e) => { state.params.H = parseFloat(e.target.value); validateAndDraw(); });
    document.getElementById('param-Q').addEventListener('change', (e) => { state.params.Q = parseFloat(e.target.value); validateAndDraw(); });
    document.getElementById('param-He').addEventListener('change', (e) => { state.params.He = parseFloat(e.target.value); validateAndDraw(); });
    document.getElementById('param-He_prime').addEventListener('change', (e) => { state.params.He_prime = parseFloat(e.target.value); validateAndDraw(); });
    document.getElementById('param-wc').addEventListener('change', (e) => { state.params.wc = parseFloat(e.target.value); validateAndDraw(); });
    document.getElementById('param-c').addEventListener('change', (e) => { state.params.c = parseFloat(e.target.value); validateAndDraw(); });
    document.getElementById('param-f').addEventListener('change', (e) => { state.params.f = parseFloat(e.target.value); validateAndDraw(); });
    document.getElementById('param-fe').addEventListener('change', (e) => { state.params.fe = parseFloat(e.target.value); validateAndDraw(); });
    
    document.getElementById('param-soil-cohesion').addEventListener('change', (e) => {
        state.params.soil_cohesion = parseFloat(e.target.value);
        validateAndDraw();
    });
    document.getElementById('param-soil-friction-angle').addEventListener('change', (e) => {
        state.params.soil_friction_angle = parseFloat(e.target.value);
        validateAndDraw();
    });
    
    document.getElementById('param-bearing-increase-factor').addEventListener('change', (e) => {
        state.params.bearing_increase_factor = parseFloat(e.target.value);
        validateAndDraw();
    });
    
    document.getElementById('buried-condition-toggle').addEventListener('change', (e) => {
        state.params.buriedCondition = e.target.checked;
        validateAndDraw();
    });

    const jicaToggle = document.getElementById('jica-audit-toggle');
    if (jicaToggle) {
        jicaToggle.addEventListener('change', (e) => {
            state.jicaAuditMode = e.target.checked;
            validateAndDraw();
        });
    }

    document.getElementById('mitigation-toggle').addEventListener('change', (e) => {
        state.params.mitigation_active = e.target.checked;
        const panel = document.getElementById('mitigation-inputs-panel');
        if (panel) {
            panel.style.display = e.target.checked ? 'block' : 'none';
        }
        validateAndDraw();
    });
    document.getElementById('mitigation-h-key').addEventListener('change', (e) => { state.params.h_key = parseFloat(e.target.value) || 0; validateAndDraw(); });
    document.getElementById('mitigation-n-anchors').addEventListener('change', (e) => { state.params.n_anchors = parseInt(e.target.value) || 0; validateAndDraw(); });
    document.getElementById('mitigation-d-anchor').addEventListener('change', (e) => { state.params.d_anchor = parseFloat(e.target.value) || 25; validateAndDraw(); });
    document.getElementById('mitigation-fy-anchor').addEventListener('change', (e) => { state.params.fy_anchor = parseFloat(e.target.value) || 415; validateAndDraw(); });
    
    document.getElementById('sim-btn-xz').addEventListener('click', (e) => {
        document.getElementById('sim-btn-xz').classList.add('active');
        document.getElementById('sim-btn-yz').classList.remove('active');
        state.simPlane = 'xz';
        renderSimulator();
    });
    document.getElementById('sim-btn-yz').addEventListener('click', (e) => {
        document.getElementById('sim-btn-yz').classList.add('active');
        document.getElementById('sim-btn-xz').classList.remove('active');
        state.simPlane = 'yz';
        renderSimulator();
    });
    
    document.getElementById('btn-show-forces').addEventListener('click', (e) => {
        document.getElementById('btn-show-forces').classList.add('active');
        document.getElementById('btn-show-combinations').classList.remove('active');
        renderForcesTable();
    });
    document.getElementById('btn-show-combinations').addEventListener('click', (e) => {
        document.getElementById('btn-show-combinations').classList.add('active');
        document.getElementById('btn-show-forces').classList.remove('active');
        renderCaseCombinationsTable();
    });
    
    // Project Manager Buttons
    document.getElementById('btn-save-project').addEventListener('click', () => {
        const name = document.getElementById('project-name-input').value.trim();
        saveActiveProject(name);
    });
    
    document.getElementById('btn-quick-save').addEventListener('click', () => {
        const name = document.getElementById('project-name-input').value.trim();
        saveActiveProject(name);
    });
    
    document.getElementById('project-load-select').addEventListener('change', (e) => {
        loadProjectByName(e.target.value);
    });
    
    document.getElementById('btn-export-project').addEventListener('click', () => {
        const name = document.getElementById('project-name-input').value.trim() || 'Anchor_Block_Project';
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({
            coordinates: state.coordinates,
            params: state.params
        }, null, 4));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", `${name.replace(/\s+/g, '_')}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
    });
    
    document.getElementById('btn-import-project-trigger').addEventListener('click', () => {
        document.getElementById('btn-import-project-file').click();
    });
    
    document.getElementById('btn-import-project-file').addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const imported = JSON.parse(event.target.result);
                if (imported.coordinates && imported.params) {
                    state.coordinates = imported.coordinates;
                    state.params = imported.params;
                    
                    const name = file.name.replace(/\.[^/.]+$/, "").replace(/_/g, " ");
                    document.getElementById('project-name-input').value = name;
                    document.getElementById('current-preset-label').innerText = `Imported Project: ${name}`;
                    
                    updateUIFieldsFromState();
                    validateAndDraw();
                    alert(`Project from file "${file.name}" imported successfully!`);
                } else {
                    alert("Invalid project file format! Missing coordinates or parameters.");
                }
            } catch (err) {
                alert("Failed to parse JSON file.");
            }
        };
        reader.readAsText(file);
    });
    
    // Design report modal triggers
    document.getElementById('btn-print-report').addEventListener('click', () => {
        openReportModal();
    });
    
    const closeBtn = document.getElementById('close-report-modal');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            closeReportModal();
        });
    }
    
    const cancelPrintBtn = document.getElementById('btn-cancel-print');
    if (cancelPrintBtn) {
        cancelPrintBtn.addEventListener('click', () => {
            closeReportModal();
        });
    }
    
    const confirmPrintBtn = document.getElementById('btn-confirm-print');
    if (confirmPrintBtn) {
        confirmPrintBtn.addEventListener('click', () => {
            window.print();
        });
    }

    // Global print event listeners to populate isolated print container
    window.addEventListener('beforeprint', () => {
        const mount = document.getElementById('print-mount-point');
        if (mount) {
            mount.innerHTML = generatePrintReportHtml();
        }
    });
    
    window.addEventListener('afterprint', () => {
        const mount = document.getElementById('print-mount-point');
        if (mount) {
            mount.innerHTML = '';
        }
    });
}

function openReportModal() {
    const modal = document.getElementById('print-report-modal');
    if (!modal) return;
    
    const previewContent = document.getElementById('print-preview-content');
    if (previewContent) {
        previewContent.innerHTML = generatePrintReportHtml();
    }
    
    modal.classList.add('open');
}

function closeReportModal() {
    const modal = document.getElementById('print-report-modal');
    if (modal) {
        modal.classList.remove('open');
    }
}

function generatePrintReportHtml() {
    const p = state.params;
    const c = state.coordinates;
    const f = state.results.forces;
    const cases = state.results.cases;
    
    const dz_up = state.coordinates.pipeXZ && state.coordinates.pipeXZ[1] ? (state.coordinates.pipeXZ[0].z - state.coordinates.pipeXZ[1].z) : 0.0;
    const dz_down = state.coordinates.pipeXZ && state.coordinates.pipeXZ[2] ? (state.coordinates.pipeXZ[1].z - state.coordinates.pipeXZ[2].z) : 0.0;
    const dx_up = state.coordinates.pipeXZ && state.coordinates.pipeXZ[1] ? Math.abs(state.coordinates.pipeXZ[1].x - state.coordinates.pipeXZ[0].x) : 0.0;
    const dx_down = state.coordinates.pipeXZ && state.coordinates.pipeXZ[2] ? Math.abs(state.coordinates.pipeXZ[2].x - state.coordinates.pipeXZ[1].x) : 0.0;
    
    const delta_val = (dx_up || dz_up) ? Math.atan2(dz_up, dx_up || 0.001) : 0.0;
    const delta_prime_val = (dx_down || dz_down) ? Math.atan2(dz_down, dx_down || 0.001) : 0.0;
        
    let dot_prod = (state.coordinates.pipeXY[1].x - state.coordinates.pipeXY[0].x) * (state.coordinates.pipeXY[2].x - state.coordinates.pipeXY[1].x) +
                   (state.coordinates.pipeXY[1].y - state.coordinates.pipeXY[0].y) * (state.coordinates.pipeXY[2].y - state.coordinates.pipeXY[1].y);
    let mag1 = Math.sqrt((state.coordinates.pipeXY[1].x - state.coordinates.pipeXY[0].x)**2 + (state.coordinates.pipeXY[1].y - state.coordinates.pipeXY[0].y)**2);
    let mag2 = Math.sqrt((state.coordinates.pipeXY[2].x - state.coordinates.pipeXY[1].x)**2 + (state.coordinates.pipeXY[2].y - state.coordinates.pipeXY[1].y)**2);
    let theta_val = (mag1 * mag2 > 0) ? Math.acos(Math.max(-1.0, Math.min(1.0, dot_prod / (mag1 * mag2)))) : 0.0;
    let phi_val = delta_val - delta_prime_val;
    
    // Core parameters
    const g = 9.80665; // acceleration of gravity
    const gamma_w = 1.0; // t/m³ fresh water density
    const A_pipe = Math.PI * (p.D ** 2) / 4.0;
    const v_water = A_pipe > 0 ? p.Q / A_pipe : 0.0;
    const w = A_pipe * 1.0;
    const s = Math.PI * p.D * p.t * p.rs;
    const s_prime = Math.PI * p.D * p.t_prime * p.rs;
    
    let z_min = c.xzCoords.length > 0 ? c.xzCoords[0].z : 0.0;
    c.xzCoords.forEach(pt => { if (pt.z < z_min) z_min = pt.z; });
    const h_CG_val = state.jicaAuditMode ? 2.500 : (f.z_CG - z_min);
    const h_pipe_val = state.jicaAuditMode ? 3.000 : ((c.pipeXZ && c.pipeXZ[1] ? c.pipeXZ[1].z : p.H_ab / 2.0) - z_min);
    const x_pipe_val = state.jicaAuditMode ? 3.000 : (c.pipeXZ && c.pipeXZ[1] ? c.pipeXZ[1].x : p.B / 2.0);
    
    // Force Scalars
    const W_val = 0.5 * (w + s) * p.l * Math.cos(delta_val);
    const W_prime_val = 0.5 * (w + s_prime) * p.l_prime * Math.cos(delta_prime_val);
    const P1_val = s * p.L * Math.sin(delta_val);
    const P1_prime_val = s_prime * p.L_prime * Math.sin(delta_prime_val);
    const P2_val = (g * Math.PI * (p.D ** 3)) > 0 ? (2 * p.f * (p.Q ** 2) / (g * Math.PI * (p.D ** 3))) * p.L * gamma_w : 0;
    const P2_prime_val = (g * Math.PI * (p.D ** 3)) > 0 ? (2 * p.f * (p.Q ** 2) / (g * Math.PI * (p.D ** 3))) * p.L_prime * gamma_w : 0;
    const Pv_val = 2 * (v_water ** 2) / g * A_pipe * Math.sin(Math.abs(phi_val) / 2.0) * gamma_w;
    const Ph_val = 2 * (v_water ** 2) / g * A_pipe * Math.sin(theta_val / 2.0) * gamma_w;
    const P3_val = p.He * Math.PI * p.D * p.t * gamma_w;
    const P3_prime_val = p.He_prime * Math.PI * p.D * p.t_prime * gamma_w;
    const Prv_val = 2 * p.H * A_pipe * Math.sin(Math.abs(phi_val) / 2.0) * gamma_w;
    const Prh_val = 2 * p.H * A_pipe * Math.sin(theta_val / 2.0) * gamma_w;
    
    // Friction of expansion joint
    const F1 = p.L > 0 ? p.c * (w + s) * (p.L - p.l / 2.0) * Math.cos(delta_val) : 0;
    const F1_prime = p.L_prime > 0 ? p.c * (w + s_prime) * (p.L_prime - p.l_prime / 2.0) * Math.cos(delta_prime_val) : 0;
    const F2 = p.fe * Math.PI * (p.D + 2 * p.t);
    const F2_prime = p.fe * Math.PI * (p.D + 2 * p.t_prime);
    const F_total = F1 + F2;
    const F_prime = F1_prime + F2_prime;

    // Retrieve SVG drawings and strip grid pattern background
    const planSvg = document.getElementById('plan-svg-viewport') ? document.getElementById('plan-svg-viewport').innerHTML : '';
    const profileSvg = document.getElementById('profile-svg-viewport') ? document.getElementById('profile-svg-viewport').innerHTML : '';
    const sectionSvg = document.getElementById('section-svg-viewport') ? document.getElementById('section-svg-viewport').innerHTML : '';
    
    const concreteHatchDef = `
        <pattern id="concreteHatch" width="20" height="20" patternUnits="userSpaceOnUse">
            <rect width="20" height="20" fill="#f8fafc" />
            <path d="M2,2 L5,2 L3.5,5 Z M12,12 L15,12 L13.5,15 Z M7,8 L9,8 L8,10 Z" fill="none" stroke="#94a3b8" stroke-width="0.6" />
            <circle cx="10" cy="4" r="0.5" fill="#94a3b8" />
            <circle cx="18" cy="8" r="0.5" fill="#94a3b8" />
            <circle cx="4" cy="14" r="0.5" fill="#94a3b8" />
            <circle cx="14" cy="18" r="0.5" fill="#94a3b8" />
        </pattern>
        <pattern id="earthHatch" width="10" height="10" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
            <line x1="0" y1="0" x2="0" y2="10" stroke="#94a3b8" stroke-width="1.0" />
        </pattern>
    `;

    let cleanPlanSvg = planSvg.replace('<rect width="100%" height="100%" fill="url(#grid)"></rect>', '')
                              .replace('<rect width="100%" height="100%" fill="url(#grid)" />', '')
                              .replace('<defs>', `<defs>${concreteHatchDef}`)
                              .replace(/fill="url\(#concreteGrad\)"/g, 'fill="url(#concreteHatch)"')
                              .replace(/stroke="var\(--accent-cyan\)"/g, 'stroke="#0f172a" stroke-width="2"')
                              .replace(/stroke="url\(#pipeGrad\)"/g, 'stroke="#475569"')
                              .replace(/fill="url\(#pipeGrad\)"/g, 'fill="url(#concreteHatch)"')
                              .replace(/fill="#00f2fe"/g, 'fill="#0284c7"')
                              .replace(/stroke="#64748b"/g, 'stroke="#475569"')
                              .replace(/fill="var\(--text-secondary\)"/g, 'fill="#0f172a"');

    let cleanProfileSvg = profileSvg.replace('<rect width="100%" height="100%" fill="url(#grid)"></rect>', '')
                                    .replace('<rect width="100%" height="100%" fill="url(#grid)" />', '')
                                    .replace('<defs>', `<defs>${concreteHatchDef}`)
                                    .replace(/fill="url\(#concreteGrad\)"/g, 'fill="url(#concreteHatch)"')
                                    .replace(/stroke="var\(--accent-cyan\)"/g, 'stroke="#0f172a" stroke-width="2"')
                                    .replace(/stroke="url\(#pipeGrad\)"/g, 'stroke="#475569"')
                                    .replace(/fill="#00f2fe"/g, 'fill="#0284c7"')
                                    .replace(/stroke="#64748b"/g, 'stroke="#475569"')
                                    .replace(/fill="var\(--text-secondary\)"/g, 'fill="#0f172a"');

    let cleanSectionSvg = sectionSvg.replace('<rect width="100%" height="100%" fill="url(#grid)"></rect>', '')
                                    .replace('<rect width="100%" height="100%" fill="url(#grid)" />', '')
                                    .replace('<defs>', `<defs>${concreteHatchDef}`)
                                    .replace(/fill="url\(#concreteGrad\)"/g, 'fill="url(#concreteHatch)"')
                                    .replace(/stroke="var\(--accent-cyan\)"/g, 'stroke="#0f172a" stroke-width="2"')
                                    .replace(/fill="url\(#pipeGrad\)"/g, 'fill="none" stroke="#475569" stroke-width="3"')
                                    .replace(/fill="#00f2fe"/g, 'fill="#0284c7"')
                                    .replace(/stroke="#64748b"/g, 'stroke="#475569"')
                                    .replace(/fill="var\(--text-secondary\)"/g, 'fill="#0f172a"');

    // Table 2.1.1 scalar magnitudes
    const mag_W = Math.sqrt(f.W.x**2 + f.W.y**2 + f.W.z**2);
    const mag_W_prime = Math.sqrt(f.W_prime.x**2 + f.W_prime.y**2 + f.W_prime.z**2);
    const mag_P1 = Math.sqrt(f.P1.x**2 + f.P1.y**2 + f.P1.z**2);
    const mag_P1_prime = Math.sqrt(f.P1_prime.x**2 + f.P1_prime.y**2 + f.P1_prime.z**2);
    const mag_P2 = Math.sqrt(f.P2.x**2 + f.P2.y**2 + f.P2.z**2);
    const mag_P2_prime = Math.sqrt(f.P2_prime.x**2 + f.P2_prime.y**2 + f.P2_prime.z**2);
    const mag_Pv = Math.sqrt(f.Pv.x**2 + f.Pv.y**2 + f.Pv.z**2);
    const mag_Ph = Math.sqrt(f.Ph.x**2 + f.Ph.y**2 + f.Ph.z**2);
    const mag_P3 = Math.sqrt(f.P3.x**2 + f.P3.y**2 + f.P3.z**2);
    const mag_P3_prime = Math.sqrt(f.P3_prime.x**2 + f.P3_prime.y**2 + f.P3_prime.z**2);
    const mag_Prv = Math.sqrt(f.Prv.x**2 + f.Prv.y**2 + f.Prv.z**2);
    const mag_Prh = Math.sqrt(f.Prh.x**2 + f.Prh.y**2 + f.Prh.z**2);
    const mag_P_vec = Math.sqrt(f.P_vec.x**2 + f.P_vec.y**2 + f.P_vec.z**2);

    const mag_F1 = F1;
    const mag_F1_prime = F1_prime;
    const mag_F2 = F2;
    const mag_F2_prime = F2_prime;
    const mag_F = Math.sqrt(f.F.x**2 + f.F.y**2 + f.F.z**2);
    const mag_F_prime = Math.sqrt(f.F_prime.x**2 + f.F_prime.y**2 + f.F_prime.z**2);

    const c1_x = f.P_vec.x + f.F.x + f.F_prime.x;
    const c1_y = f.P_vec.y + f.F.y + f.F_prime.y;
    const c1_z = f.P_vec.z + f.F.z + f.F_prime.z;

    const c2_x = f.P_vec.x + f.F.x - f.F_prime.x;
    const c2_y = f.P_vec.y + f.F.y - f.F_prime.y;
    const c2_z = f.P_vec.z + f.F.z - f.F_prime.z;

    const c3_x = f.P_vec.x - f.F.x + f.F_prime.x;
    const c3_y = f.P_vec.y - f.F.y + f.F_prime.y;
    const c3_z = f.P_vec.z - f.F.z + f.F_prime.z;

    const c4_x = f.P_vec.x - f.F.x - f.F_prime.x;
    const c4_y = f.P_vec.y - f.F.y - f.F_prime.y;
    const c4_z = f.P_vec.z - f.F.z - f.F_prime.z;

    const mag_c1 = mag_P_vec + mag_F + mag_F_prime;
    const mag_c2 = mag_P_vec + mag_F - mag_F_prime;
    const mag_c3 = Math.abs(mag_P_vec - mag_F + mag_F_prime);
    const mag_c4 = Math.abs(mag_P_vec - mag_F - mag_F_prime);

    // Table 2.1.1 rows
    const table211_rows = `
        <tr><td>Pipe & Water weight W</td><td style="font-family:monospace;">W</td><td style="text-align:right;">${fNum(mag_W, 3)}</td><td style="text-align:right;">${fNum(f.W.x, 3)}</td><td style="text-align:right;">${fNum(f.W.y, 3)}</td><td style="text-align:right;">${fNum(f.W.z, 3)}</td></tr>
        <tr><td>Pipe & Water weight W'</td><td style="font-family:monospace;">W'</td><td style="text-align:right;">${fNum(mag_W_prime, 3)}</td><td style="text-align:right;">${fNum(f.W_prime.x, 3)}</td><td style="text-align:right;">${fNum(f.W_prime.y, 3)}</td><td style="text-align:right;">${fNum(f.W_prime.z, 3)}</td></tr>
        <tr><td>Pipe shell weight P1</td><td style="font-family:monospace;">P1</td><td style="text-align:right;">${fNum(mag_P1, 3)}</td><td style="text-align:right;">${fNum(f.P1.x, 3)}</td><td style="text-align:right;">${fNum(f.P1.y, 3)}</td><td style="text-align:right;">${fNum(f.P1.z, 3)}</td></tr>
        <tr><td>Pipe shell weight P1'</td><td style="font-family:monospace;">P1'</td><td style="text-align:right;">${fNum(mag_P1_prime, 3)}</td><td style="text-align:right;">${fNum(f.P1_prime.x, 3)}</td><td style="text-align:right;">${fNum(f.P1_prime.y, 3)}</td><td style="text-align:right;">${fNum(f.P1_prime.z, 3)}</td></tr>
        <tr><td>Hydrodynamic friction P2</td><td style="font-family:monospace;">P2</td><td style="text-align:right;">${fNum(mag_P2, 3)}</td><td style="text-align:right;">${fNum(f.P2.x, 3)}</td><td style="text-align:right;">${fNum(f.P2.y, 3)}</td><td style="text-align:right;">${fNum(f.P2.z, 3)}</td></tr>
        <tr><td>Hydrodynamic friction P2'</td><td style="font-family:monospace;">P2'</td><td style="text-align:right;">${fNum(mag_P2_prime, 3)}</td><td style="text-align:right;">${fNum(f.P2_prime.x, 3)}</td><td style="text-align:right;">${fNum(f.P2_prime.y, 3)}</td><td style="text-align:right;">${fNum(f.P2_prime.z, 3)}</td></tr>
        <tr><td>Centrifugal Vert. Bend Pv</td><td style="font-family:monospace;">Pv</td><td style="text-align:right;">${fNum(mag_Pv, 3)}</td><td style="text-align:right;">${fNum(f.Pv.x, 3)}</td><td style="text-align:right;">${fNum(f.Pv.y, 3)}</td><td style="text-align:right;">${fNum(f.Pv.z, 3)}</td></tr>
        <tr><td>Centrifugal Horiz. Bend Ph</td><td style="font-family:monospace;">Ph</td><td style="text-align:right;">${fNum(mag_Ph, 3)}</td><td style="text-align:right;">${fNum(f.Ph.x, 3)}</td><td style="text-align:right;">${fNum(f.Ph.y, 3)}</td><td style="text-align:right;">${fNum(f.Ph.z, 3)}</td></tr>
        <tr><td>Expansion joint pressure P3</td><td style="font-family:monospace;">P3</td><td style="text-align:right;">${fNum(mag_P3, 3)}</td><td style="text-align:right;">${fNum(f.P3.x, 3)}</td><td style="text-align:right;">${fNum(f.P3.y, 3)}</td><td style="text-align:right;">${fNum(f.P3.z, 3)}</td></tr>
        <tr><td>Expansion joint pressure P3'</td><td style="font-family:monospace;">P3'</td><td style="text-align:right;">${fNum(mag_P3_prime, 3)}</td><td style="text-align:right;">${fNum(f.P3_prime.x, 3)}</td><td style="text-align:right;">${fNum(f.P3_prime.y, 3)}</td><td style="text-align:right;">${fNum(f.P3_prime.z, 3)}</td></tr>
        <tr><td>Unbalanced vertical pressure Prv</td><td style="font-family:monospace;">Prv</td><td style="text-align:right;">${fNum(mag_Prv, 3)}</td><td style="text-align:right;">${fNum(f.Prv.x, 3)}</td><td style="text-align:right;">${fNum(f.Prv.y, 3)}</td><td style="text-align:right;">${fNum(f.Prv.z, 3)}</td></tr>
        <tr><td>Unbalanced horizontal pressure Prh</td><td style="font-family:monospace;">Prh</td><td style="text-align:right;">${fNum(mag_Prh, 3)}</td><td style="text-align:right;">${fNum(f.Prh.x, 3)}</td><td style="text-align:right;">${fNum(f.Prh.y, 3)}</td><td style="text-align:right;">${fNum(f.Prh.z, 3)}</td></tr>
        <tr style="font-weight:bold; background-color:#f1f5f9; border-top:1.5px solid #0f172a;">
            <td>Total Constant Force Resultant</td><td style="font-family:monospace;">P</td><td style="text-align:right;">${fNum(mag_P_vec, 3)}</td><td style="text-align:right;">${fNum(f.P_vec.x, 3)}</td><td style="text-align:right;">${fNum(f.P_vec.y, 3)}</td><td style="text-align:right;">${fNum(f.P_vec.z, 3)}</td>
        </tr>
        <tr><td>Support point friction F1</td><td style="font-family:monospace;">F1</td><td style="text-align:right;">${fNum(mag_F1, 3)}</td><td style="text-align:right;">${fNum(F1 * Math.cos(delta_val), 3)}</td><td style="text-align:right;">0.000</td><td style="text-align:right;">${fNum(-F1 * Math.sin(delta_val), 3)}</td></tr>
        <tr><td>Support point friction F1'</td><td style="font-family:monospace;">F1'</td><td style="text-align:right;">${fNum(mag_F1_prime, 3)}</td><td style="text-align:right;">${fNum(F1_prime * Math.cos(delta_prime_val) * Math.cos(theta_val), 3)}</td><td style="text-align:right;">${fNum(-F1_prime * Math.cos(delta_prime_val) * Math.sin(theta_val), 3)}</td><td style="text-align:right;">${fNum(-F1_prime * Math.sin(delta_prime_val), 3)}</td></tr>
        <tr><td>Expansion joint friction F2</td><td style="font-family:monospace;">F2</td><td style="text-align:right;">${fNum(mag_F2, 3)}</td><td style="text-align:right;">${fNum(F2 * Math.cos(delta_val), 3)}</td><td style="text-align:right;">0.000</td><td style="text-align:right;">${fNum(-F2 * Math.sin(delta_val), 3)}</td></tr>
        <tr><td>Expansion joint friction F2'</td><td style="font-family:monospace;">F2'</td><td style="text-align:right;">${fNum(mag_F2_prime, 3)}</td><td style="text-align:right;">${fNum(F2_prime * Math.cos(delta_prime_val) * Math.cos(theta_val), 3)}</td><td style="text-align:right;">${fNum(-F2_prime * Math.cos(delta_prime_val) * Math.sin(theta_val), 3)}</td><td style="text-align:right;">${fNum(-F2_prime * Math.sin(delta_prime_val), 3)}</td></tr>
        <tr style="font-weight:bold; background-color:#f8fafc;"><td>Upstream Friction Sum F</td><td style="font-family:monospace;">F=F1+F2</td><td style="text-align:right;">${fNum(mag_F, 3)}</td><td style="text-align:right;">${fNum(f.F.x, 3)}</td><td style="text-align:right;">${fNum(f.F.y, 3)}</td><td style="text-align:right;">${fNum(f.F.z, 3)}</td></tr>
        <tr style="font-weight:bold; background-color:#f8fafc;"><td>Downstream Friction Sum F'</td><td style="font-family:monospace;">F'=F1'+F2'</td><td style="text-align:right;">${fNum(mag_F_prime, 3)}</td><td style="text-align:right;">${fNum(f.F_prime.x, 3)}</td><td style="text-align:right;">${fNum(f.F_prime.y, 3)}</td><td style="text-align:right;">${fNum(f.F_prime.z, 3)}</td></tr>
        <tr style="font-weight:bold; background-color:#e2e8f0; border-top:1.5px solid #0f172a;"><td>Case 1 Total (P + F + F')</td><td style="font-family:monospace;">Case-1</td><td style="text-align:right;">${fNum(mag_c1, 3)}</td><td style="text-align:right;">${fNum(c1_x, 3)}</td><td style="text-align:right;">${fNum(c1_y, 3)}</td><td style="text-align:right;">${fNum(c1_z, 3)}</td></tr>
        <tr style="font-weight:bold; background-color:#e2e8f0;"><td>Case 2 Total (P + F - F')</td><td style="font-family:monospace;">Case-2</td><td style="text-align:right;">${fNum(mag_c2, 3)}</td><td style="text-align:right;">${fNum(c2_x, 3)}</td><td style="text-align:right;">${fNum(c2_y, 3)}</td><td style="text-align:right;">${fNum(c2_z, 3)}</td></tr>
        <tr style="font-weight:bold; background-color:#e2e8f0;"><td>Case 3 Total (P - F + F')</td><td style="font-family:monospace;">Case-3</td><td style="text-align:right;">${fNum(mag_c3, 3)}</td><td style="text-align:right;">${fNum(c3_x, 3)}</td><td style="text-align:right;">${fNum(c3_y, 3)}</td><td style="text-align:right;">${fNum(c3_z, 3)}</td></tr>
        <tr style="font-weight:bold; background-color:#e2e8f0;"><td>Case 4 Total (P - F - F')</td><td style="font-family:monospace;">Case-4</td><td style="text-align:right;">${fNum(mag_c4, 3)}</td><td style="text-align:right;">${fNum(c4_x, 3)}</td><td style="text-align:right;">${fNum(c4_y, 3)}</td><td style="text-align:right;">${fNum(c4_z, 3)}</td></tr>
    `;

    let xzCasesRows = '';
    let yzCasesRows = '';
    
    cases.forEach(cs => {
        const row = `
            <tr style="color: #000000 !important;">
                <td style="padding: 4px; border: 1px solid #cbd5e1; color: #000000;">${cs.caseName}</td>
                <td style="padding: 4px; border: 1px solid #cbd5e1; color: #000000;">${cs.eqLabel}</td>
                <td style="padding: 4px; border: 1px solid #cbd5e1; color: #000000;">${cs.combination}</td>
                <td style="padding: 4px; border: 1px solid #cbd5e1; text-align: right; color: #000000;">${fNum(cs.totalV, 2)}</td>
                <td style="padding: 4px; border: 1px solid #cbd5e1; text-align: right; color: #000000;">${fNum(cs.totalH, 2)}</td>
                <td style="padding: 4px; border: 1px solid #cbd5e1; text-align: right; color:${cs.eccentricityPass ? '#15803d':'#b91c1c'}; font-weight:bold; background-color:${cs.eccentricityPass ? '#f0fdf4':'#fef2f2'};">${fNum(cs.e, 3)} / ${fNum(cs.limit_e, 3)}</td>
                <td style="padding: 4px; border: 1px solid #cbd5e1; text-align: right; color:${cs.slidingPass ? '#15803d':'#b91c1c'}; font-weight:bold; background-color:${cs.slidingPass ? '#f0fdf4':'#fef2f2'};">${fNum(cs.Fs, 2)}</td>
                <td style="padding: 4px; border: 1px solid #cbd5e1; text-align: right; color:${cs.overturningFSPass ? '#15803d':'#b91c1c'}; font-weight:bold; background-color:${cs.overturningFSPass ? '#f0fdf4':'#fef2f2'};">${fNum(cs.Fot, 2)}</td>
                <td style="padding: 4px; border: 1px solid #cbd5e1; text-align: right; color:${cs.bearingPass ? '#15803d':'#b91c1c'}; font-weight:bold; background-color:${cs.bearingPass ? '#f0fdf4':'#fef2f2'};">${fNum(cs.sigma, 2)} / ${fNum(cs.limit_qa, 1)}</td>
                <td style="padding: 4px; border: 1px solid #cbd5e1; text-align: center; color:${cs.passed ? '#15803d':'#b91c1c'}; font-weight:bold; background-color:${cs.passed ? '#dcfce7':'#fee2e2'};">${cs.passed ? 'PASS':'FAIL'}</td>
            </tr>
        `;
        if (cs.plane === 'X-Z') {
            xzCasesRows += row;
        } else {
            yzCasesRows += row;
        }
    });

    let detailedCasesVerification = '';
    cases.forEach(cs => {
        const isXZ = cs.plane === 'X-Z';
        const eqSign = cs.eqLabel.includes('-') ? -1.0 : (cs.eqLabel.includes('+') ? 1.0 : 0.0);
        const armV = isXZ ? f.x_CG : f.y_CG_stability;
        const armPipeV = isXZ ? x_pipe_val : (p.B_yz / 2.0);
        const fWA_val = eqSign * f.F_WA;
        const fP_val = eqSign * f.F_p;
        const fPipeH_val = isXZ ? cs.Rx : cs.Ry;
        const pipeH_symbol = isXZ ? 'Px' : 'Py';
        const distLabel = isXZ ? 'x (m)' : 'y (m)';
        const widthVal = isXZ ? p.B : p.B_yz;
        
        let verticalRows = `
            <tr>
                <td style="padding: 3px 6px; border: 1px solid #cbd5e1; font-family: monospace;">WA</td>
                <td style="padding: 3px 6px; border: 1px solid #cbd5e1; text-align: right;">${(-f.WA).toFixed(3)}</td>
                <td style="padding: 3px 6px; border: 1px solid #cbd5e1; text-align: right;">${armV.toFixed(3)}</td>
                <td style="padding: 3px 6px; border: 1px solid #cbd5e1; text-align: right;">${(-f.WA * armV).toFixed(3)}</td>
            </tr>
            <tr>
                <td style="padding: 3px 6px; border: 1px solid #cbd5e1; font-family: monospace;">Pz</td>
                <td style="padding: 3px 6px; border: 1px solid #cbd5e1; text-align: right;">${cs.Rz.toFixed(3)}</td>
                <td style="padding: 3px 6px; border: 1px solid #cbd5e1; text-align: right;">${armPipeV.toFixed(3)}</td>
                <td style="padding: 3px 6px; border: 1px solid #cbd5e1; text-align: right;">${(cs.Rz * armPipeV).toFixed(3)}</td>
            </tr>
        `;
        
        let horizontalRows = `
            <tr>
                <td style="padding: 3px 6px; border: 1px solid #cbd5e1; font-family: monospace;">FWA</td>
                <td style="padding: 3px 6px; border: 1px solid #cbd5e1; text-align: right;">${fWA_val.toFixed(3)}</td>
                <td style="padding: 3px 6px; border: 1px solid #cbd5e1; text-align: right;">${h_CG_val.toFixed(3)}</td>
                <td style="padding: 3px 6px; border: 1px solid #cbd5e1; text-align: right;">${(fWA_val * h_CG_val).toFixed(3)}</td>
            </tr>
            <tr>
                <td style="padding: 3px 6px; border: 1px solid #cbd5e1; font-family: monospace;">Fp</td>
                <td style="padding: 3px 6px; border: 1px solid #cbd5e1; text-align: right;">${fP_val.toFixed(3)}</td>
                <td style="padding: 3px 6px; border: 1px solid #cbd5e1; text-align: right;">${h_pipe_val.toFixed(3)}</td>
                <td style="padding: 3px 6px; border: 1px solid #cbd5e1; text-align: right;">${(fP_val * h_pipe_val).toFixed(3)}</td>
            </tr>
            <tr>
                <td style="padding: 3px 6px; border: 1px solid #cbd5e1; font-family: monospace;">${pipeH_symbol}</td>
                <td style="padding: 3px 6px; border: 1px solid #cbd5e1; text-align: right;">${fPipeH_val.toFixed(3)}</td>
                <td style="padding: 3px 6px; border: 1px solid #cbd5e1; text-align: right;">${h_pipe_val.toFixed(3)}</td>
                <td style="padding: 3px 6px; border: 1px solid #cbd5e1; text-align: right;">${(fPipeH_val * h_pipe_val).toFixed(3)}</td>
            </tr>
        `;

        detailedCasesVerification += `
            <div style="margin-bottom: 20px; padding: 12px; border: 1.5px solid #0f172a; border-radius: 4px; page-break-inside: avoid; background-color: #ffffff;">
                <div style="font-weight: bold; font-size: 11px; color: #0f172a; border-bottom: 1.5px solid #0f172a; padding-bottom: 4px; margin-bottom: 10px; display: flex; justify-content: space-between;">
                    <span>Stability Analysis &bull; ${cs.plane} plain &bull; B = ${widthVal.toFixed(3)} m</span>
                    <span>${cs.caseName} (${cs.combination}) &bull; EQ: ${cs.eqLabel}</span>
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 10px;">
                    <div>
                        <table style="width: 100%; border-collapse: collapse; font-size: 9.5px; font-family: 'Consolas', 'Courier New', monospace;">
                            <thead>
                                <tr style="background-color: #f1f5f9; border-bottom: 1px solid #0f172a;">
                                    <th style="padding: 3px 6px; border: 1px solid #cbd5e1; text-align: left;">Vertical Force (ton)</th>
                                    <th style="padding: 3px 6px; border: 1px solid #cbd5e1; text-align: right;">${distLabel}</th>
                                    <th style="padding: 3px 6px; border: 1px solid #cbd5e1; text-align: right;">Moment (ton&middot;m)</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${verticalRows}
                                <tr style="font-weight: bold; background-color: #f8fafc; border-top: 1.5px solid #0f172a;">
                                    <td style="padding: 3px 6px; border: 1px solid #cbd5e1;">&Sigma;V = ${cs.totalV.toFixed(3)}</td>
                                    <td style="padding: 3px 6px; border: 1px solid #cbd5e1;"></td>
                                    <td style="padding: 3px 6px; border: 1px solid #cbd5e1; text-align: right;">&Sigma;V&middot;${isXZ ? 'x' : 'y'} = ${cs.momV.toFixed(3)}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    
                    <div>
                        <table style="width: 100%; border-collapse: collapse; font-size: 9.5px; font-family: 'Consolas', 'Courier New', monospace;">
                            <thead>
                                <tr style="background-color: #f1f5f9; border-bottom: 1px solid #0f172a;">
                                    <th style="padding: 3px 6px; border: 1px solid #cbd5e1; text-align: left;">Horizontal Force (ton)</th>
                                    <th style="padding: 3px 6px; border: 1px solid #cbd5e1; text-align: right;">z (m)</th>
                                    <th style="padding: 3px 6px; border: 1px solid #cbd5e1; text-align: right;">Moment (ton&middot;m)</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${horizontalRows}
                                <tr style="font-weight: bold; background-color: #f8fafc; border-top: 1.5px solid #0f172a;">
                                    <td style="padding: 3px 6px; border: 1px solid #cbd5e1;">&Sigma;H = ${cs.totalH.toFixed(3)}</td>
                                    <td style="padding: 3px 6px; border: 1px solid #cbd5e1;"></td>
                                    <td style="padding: 3px 6px; border: 1px solid #cbd5e1; text-align: right;">&Sigma;H&middot;z = ${cs.momH.toFixed(3)}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                
                <div style="font-size: 9.5px; font-family: 'Consolas', 'Courier New', monospace; border-top: 1px dashed #cbd5e1; padding-top: 8px; color: #0f172a;">
                    <div style="margin-bottom: 6px; background-color: #f1f5f9; padding: 6px; border-radius: 4px; border: 1px solid #e2e8f0;">
                        <strong>Step 1: Net Resultant Moment:</strong> &Sigma;M = &Sigma;M_V - &Sigma;M_H = ${cs.momV.toFixed(3)} - (${cs.momH.toFixed(3)}) = <strong>${cs.sumM.toFixed(3)} ton&middot;m</strong>
                    </div>

                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 6px;">
                        <!-- Overturning (e) -->
                        <div style="border: 1px solid #cbd5e1; padding: 6px; border-radius: 3px; background: #fafafa;">
                            <div style="font-weight: bold; color: #1e293b; margin-bottom: 2px;">(a) Overturning (Eccentricity e)</div>
                            <div>Formula: e = |B/2 - &Sigma;M / &Sigma;V|</div>
                            <div>Subst: e = |${(widthVal/2.0).toFixed(3)} - ${cs.sumM.toFixed(3)} / ${Math.abs(cs.totalV).toFixed(3)}| = <strong>${cs.e.toFixed(3)} m</strong></div>
                            <div>Check: e = ${cs.e.toFixed(3)} m ${cs.eccentricityPass ? '&le;' : '>'} ${cs.limit_e.toFixed(3)} m &bull; <strong style="color:${cs.eccentricityPass ? '#15803d':'#b91c1c'};">${cs.eccentricityPass ? 'PASS':'FAIL'}</strong></div>
                        </div>

                        <!-- Sliding (Fs) -->
                        <div style="border: 1px solid #cbd5e1; padding: 6px; border-radius: 3px; background: #fafafa;">
                            <div style="font-weight: bold; color: #1e293b; margin-bottom: 2px;">(b) Safety against Sliding (Fs)</div>
                            <div>Formula: Fs = (|&Sigma;V|&middot;&lambda; + R_key + V_anchors) / |&Sigma;H|</div>
                            <div>Subst: Fs = (${Math.abs(cs.totalV).toFixed(3)} &times; ${p.lambda.toFixed(2)}) / ${Math.abs(cs.totalH).toFixed(3)} = <strong>${cs.Fs.toFixed(2)}</strong></div>
                            <div>Check: Fs = ${cs.Fs.toFixed(2)} ${cs.slidingPass ? '&ge;' : '<'} ${state.jicaAuditMode ? '2.0' : (cs.eqLabel === 'Static' ? '2.0' : '1.2')} &bull; <strong style="color:${cs.slidingPass ? '#15803d':'#b91c1c'};">${cs.slidingPass ? 'PASS':'FAIL'}</strong></div>
                        </div>

                        <!-- Overturning FS (Fot) -->
                        <div style="border: 1px solid #cbd5e1; padding: 6px; border-radius: 3px; background: #fafafa;">
                            <div style="font-weight: bold; color: #1e293b; margin-bottom: 2px;">(c) Safety against Overturning (Fo)</div>
                            <div>Formula: Fo = &Sigma;M_R / &Sigma;M_O</div>
                            <div>Subst: Fo = ${cs.momV.toFixed(3)} / ${Math.abs(cs.momH).toFixed(3)} = <strong>${cs.Fot.toFixed(2)}</strong></div>
                            <div>Check: Fo = ${cs.Fot.toFixed(2)} ${cs.overturningFSPass ? '&ge;' : '<'} 1.20 &bull; <strong style="color:${cs.overturningFSPass ? '#15803d':'#b91c1c'};">${cs.overturningFSPass ? 'PASS':'FAIL'}</strong></div>
                        </div>

                        <!-- Bearing Pressure (sigma_max) -->
                        <div style="border: 1px solid #cbd5e1; padding: 6px; border-radius: 3px; background: #fafafa;">
                            <div style="font-weight: bold; color: #1e293b; margin-bottom: 2px;">(d) Soil Bearing Pressure (&sigma;_max)</div>
                            <div>Formula: ${cs.isLiftOff ? '&sigma; = 2|&Sigma;V| / [3(B/2 - e)W] (Heel Lift-off)' : '&sigma; = (|&Sigma;V|/A)&middot;(1 + 6e/B) (Full Contact)'}</div>
                            <div>Subst: &sigma;_max = <strong>${fNum(cs.sigma, 2)} t/m&sup2;</strong></div>
                            <div>Check: &sigma;_max = ${fNum(cs.sigma, 2)} ${cs.bearingPass ? '&le;' : '>'} ${cs.limit_qa.toFixed(2)} t/m&sup2; &bull; <strong style="color:${cs.bearingPass ? '#15803d':'#b91c1c'};">${cs.bearingPass ? 'PASS':'FAIL'}</strong></div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });

    return `
        <div class="print-preview-area" style="padding: 25px; font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif; color: #0f172a; background: #ffffff;">
            <!-- Report Banner -->
            <div class="report-header" style="border-bottom: 3px solid #0f172a; padding-bottom: 12px; margin-bottom: 25px;">
                <div style="font-size: 14px; font-weight: 800; color: #475569; letter-spacing: 1px; text-transform: uppercase;">2. PENSTOCK - 2.1 Stability Analysis</div>
                <h1 style="font-size: 22px; font-weight: 900; color: #0f172a; margin: 5px 0 8px 0; text-transform: uppercase; letter-spacing: -0.5px;">JICA Standard Anchor Block Calculation Report</h1>
                <div style="font-size: 11px; color: #475569; display: flex; justify-content: space-between; border-top: 1px solid #e2e8f0; padding-top: 6px;">
                    <span><strong>Project:</strong> JICA Hydropower Penstock Anchor Block</span>
                    <span><strong>Date:</strong> 2026-07-21</span>
                    <span><strong>Standard:</strong> JICA Guidelines for Hydropower Penstock Anchor Blocks</span>
                </div>
            </div>
            
            <!-- Section 1: Method of Stability Analysis -->
            <div class="report-section" style="margin-bottom: 25px;">
                <h2 style="font-size: 14px; font-weight: 800; color: #0f172a; text-transform: uppercase; border-bottom: 2px solid #0f172a; padding-bottom: 4px; margin-bottom: 12px;">(1) Method of Stability Analysis</h2>
                
                <h3 style="font-size: 12px; font-weight: 700; color: #1e293b; margin: 10px 0 6px 0;">(A) Definition of Variables</h3>
                <table style="width: 100%; border-collapse: collapse; font-size: 9.5px; margin-bottom: 15px;">
                    <tbody>
                        <tr>
                            <td style="padding: 4px 6px; border: 1px solid #cbd5e1; width: 35%;"><strong>&delta;</strong> : vertical angle of upstream pipe axis</td>
                            <td style="padding: 4px 6px; border: 1px solid #cbd5e1; width: 15%;">${deg(delta_val).toFixed(3)}&deg;</td>
                            <td style="padding: 4px 6px; border: 1px solid #cbd5e1; width: 35%;"><strong>&delta;'</strong> : vertical angle of downstream pipe axis</td>
                            <td style="padding: 4px 6px; border: 1px solid #cbd5e1; width: 15%;">${deg(delta_prime_val).toFixed(3)}&deg;</td>
                        </tr>
                        <tr>
                            <td style="padding: 4px 6px; border: 1px solid #cbd5e1;"><strong>&phi;</strong> : vertical intersection angle (&delta; - &delta;')</td>
                            <td style="padding: 4px 6px; border: 1px solid #cbd5e1;">${deg(phi_val).toFixed(3)}&deg;</td>
                            <td style="padding: 4px 6px; border: 1px solid #cbd5e1;"><strong>&theta;</strong> : horizontal intersection angle</td>
                            <td style="padding: 4px 6px; border: 1px solid #cbd5e1;">${p.theta.toFixed(3)}&deg;</td>
                        </tr>
                        <tr>
                            <td style="padding: 4px 6px; border: 1px solid #cbd5e1;"><strong>L</strong> : pipe length between I.P and upstream exp. joint</td>
                            <td style="padding: 4px 6px; border: 1px solid #cbd5e1;">${p.L.toFixed(3)} m</td>
                            <td style="padding: 4px 6px; border: 1px solid #cbd5e1;"><strong>L'</strong> : pipe length between I.P and downstream exp. joint</td>
                            <td style="padding: 4px 6px; border: 1px solid #cbd5e1;">${p.L_prime.toFixed(3)} m</td>
                        </tr>
                        <tr>
                            <td style="padding: 4px 6px; border: 1px solid #cbd5e1;"><strong>l</strong> : pipe length between I.P and upstream saddle pier</td>
                            <td style="padding: 4px 6px; border: 1px solid #cbd5e1;">${p.l.toFixed(3)} m</td>
                            <td style="padding: 4px 6px; border: 1px solid #cbd5e1;"><strong>l'</strong> : pipe length between I.P and downstream saddle pier</td>
                            <td style="padding: 4px 6px; border: 1px solid #cbd5e1;">${p.l_prime.toFixed(3)} m</td>
                        </tr>
                        <tr>
                            <td style="padding: 4px 6px; border: 1px solid #cbd5e1;"><strong>D</strong> : inside diameter of penstock pipe</td>
                            <td style="padding: 4px 6px; border: 1px solid #cbd5e1;">${p.D.toFixed(3)} m</td>
                            <td style="padding: 4px 6px; border: 1px solid #cbd5e1;"><strong>A</strong> : inside sectional area of penstock pipe</td>
                            <td style="padding: 4px 6px; border: 1px solid #cbd5e1;">${A_pipe.toFixed(3)} m&sup2;</td>
                        </tr>
                        <tr>
                            <td style="padding: 4px 6px; border: 1px solid #cbd5e1;"><strong>t / t'</strong> : shell thickness upstream / downstream</td>
                            <td style="padding: 4px 6px; border: 1px solid #cbd5e1;">${p.t.toFixed(4)} / ${p.t_prime.toFixed(4)} m</td>
                            <td style="padding: 4px 6px; border: 1px solid #cbd5e1;"><strong>H / He / He'</strong> : static / upstream / downstream design head</td>
                            <td style="padding: 4px 6px; border: 1px solid #cbd5e1;">${p.H.toFixed(1)} / ${p.He.toFixed(1)} / ${p.He_prime.toFixed(1)} m</td>
                        </tr>
                        <tr>
                            <td style="padding: 4px 6px; border: 1px solid #cbd5e1;"><strong>Q</strong> : maximum discharge</td>
                            <td style="padding: 4px 6px; border: 1px solid #cbd5e1;">${p.Q.toFixed(3)} m&sup3;/s</td>
                            <td style="padding: 4px 6px; border: 1px solid #cbd5e1;"><strong>s / s'</strong> : pipe shell weight per meter</td>
                            <td style="padding: 4px 6px; border: 1px solid #cbd5e1;">${s.toFixed(3)} / ${s_prime.toFixed(3)} t/m</td>
                        </tr>
                        <tr>
                            <td style="padding: 4px 6px; border: 1px solid #cbd5e1;"><strong>w</strong> : weight of contained water per meter</td>
                            <td style="padding: 4px 6px; border: 1px solid #cbd5e1;">${w.toFixed(3)} t/m</td>
                            <td style="padding: 4px 6px; border: 1px solid #cbd5e1;"><strong>wc / rs</strong> : unit weight of concrete / steel</td>
                            <td style="padding: 4px 6px; border: 1px solid #cbd5e1;">${p.wc.toFixed(2)} / ${p.rs.toFixed(2)} t/m&sup3;</td>
                        </tr>
                        <tr>
                            <td style="padding: 4px 6px; border: 1px solid #cbd5e1;"><strong>c / f / fe</strong> : friction coefficients (saddle / water / joint)</td>
                            <td style="padding: 4px 6px; border: 1px solid #cbd5e1;">${p.c.toFixed(2)} / ${p.f.toFixed(2)} / ${p.fe.toFixed(2)} t/m</td>
                            <td style="padding: 4px 6px; border: 1px solid #cbd5e1;"><strong>Kh / &lambda;</strong> : seismic coefficient / base friction</td>
                            <td style="padding: 4px 6px; border: 1px solid #cbd5e1;">${p.Kh.toFixed(2)} / ${p.lambda.toFixed(2)}</td>
                        </tr>
                    </tbody>
                </table>

                <div style="border: 1px solid #cbd5e1; border-radius: 4px; padding: 8px 10px; background-color: #f1f5f9; margin-bottom: 15px;">
                    <div style="font-weight: bold; font-size: 10px; color: #0f172a; margin-bottom: 4px;">Detailed Derivation Calculations for A, w, s, and s':</div>
                    <div style="font-size: 9px; color: #334155; line-height: 1.5; font-family: 'Consolas', 'Courier New', monospace; display: flex; flex-direction: column; gap: 3px;">
                        <div><strong>(1) Pipe Inside Area A:</strong> Formula: A = &pi;&middot;D&sup2;/4 &rarr; Subst: A = &pi; &times; (${p.D.toFixed(3)})&sup2; / 4 = <strong>${A_pipe.toFixed(3)} m&sup2;</strong></div>
                        <div><strong>(2) Contained Water Weight w:</strong> Formula: w = A&middot;&gamma;w &rarr; Subst: w = ${A_pipe.toFixed(3)} &times; 1.0 = <strong>${w.toFixed(3)} t/m</strong></div>
                        <div><strong>(3) Upstream Pipe Shell Weight s:</strong> Formula: s = &pi;&middot;D&middot;t&middot;&gamma;s &rarr; Subst: s = &pi; &times; ${p.D.toFixed(3)} &times; ${p.t.toFixed(4)} &times; ${p.rs.toFixed(2)} = <strong>${s.toFixed(3)} t/m</strong></div>
                        <div><strong>(4) Downstream Pipe Shell Weight s':</strong> Formula: s' = &pi;&middot;D&middot;t'&middot;&gamma;s &rarr; Subst: s' = &pi; &times; ${p.D.toFixed(3)} &times; ${p.t_prime.toFixed(4)} &times; ${p.rs.toFixed(2)} = <strong>${s_prime.toFixed(3)} t/m</strong></div>
                    </div>
                </div>

                <h3 style="font-size: 12px; font-weight: 700; color: #1e293b; margin: 12px 0 8px 0;">(B) Acting Force Detailed Step-by-Step Calculations & 3D Resolutions</h3>
                <div style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 15px;">
                    <!-- Card 1 -->
                    <div style="border: 1px solid #cbd5e1; border-radius: 4px; padding: 8px 10px; background-color: #f8fafc;">
                        <div style="font-weight: bold; font-size: 10px; color: #0f172a; margin-bottom: 4px;">(i) Perpendicular Weight Thrust W & W'</div>
                        <div style="font-size: 9px; color: #334155; line-height: 1.5; font-family: 'Consolas', 'Courier New', monospace;">
                            <div><strong>Formula:</strong> W = 0.5 &middot; (w + s) &middot; l &middot; cos(&delta;) &nbsp;|&nbsp; W' = 0.5 &middot; (w + s') &middot; l' &middot; cos(&delta;')</div>
                            <div><strong>Substitution:</strong> W = 0.5 &times; (${w.toFixed(3)} + ${s.toFixed(3)}) &times; ${p.l.toFixed(3)} &times; cos(${deg(delta_val).toFixed(2)}&deg;) = <strong>${mag_W.toFixed(3)} ton</strong></div>
                            <div><strong>Substitution:</strong> W' = 0.5 &times; (${w.toFixed(3)} + ${s_prime.toFixed(3)}) &times; ${p.l_prime.toFixed(3)} &times; cos(${deg(delta_prime_val).toFixed(2)}&deg;) = <strong>${mag_W_prime.toFixed(3)} ton</strong></div>
                            <div style="margin-top: 4px; padding-top: 4px; border-top: 1px dashed #cbd5e1; color: #1e293b;">
                                <strong>3D Components:</strong><br>
                                Upstream W: Fx = W&middot;sin(&delta;) = <strong>${f.W.x.toFixed(3)} ton</strong> | Fy = <strong>0.000 ton</strong> | Fz = -W&middot;cos(&delta;) = <strong>${f.W.z.toFixed(3)} ton</strong><br>
                                Downstream W': Fx = W'&middot;sin(&delta;')&middot;cos(&theta;) = <strong>${f.W_prime.x.toFixed(3)} ton</strong> | Fy = -W'&middot;sin(&delta;')&middot;sin(&theta;) = <strong>${f.W_prime.y.toFixed(3)} ton</strong> | Fz = -W'&middot;cos(&delta;') = <strong>${f.W_prime.z.toFixed(3)} ton</strong>
                            </div>
                        </div>
                    </div>

                    <!-- Card 2 -->
                    <div style="border: 1px solid #cbd5e1; border-radius: 4px; padding: 8px 10px; background-color: #f8fafc;">
                        <div style="font-weight: bold; font-size: 10px; color: #0f172a; margin-bottom: 4px;">(ii) Pipe Axis Dead Weight P1 & P1'</div>
                        <div style="font-size: 9px; color: #334155; line-height: 1.5; font-family: 'Consolas', 'Courier New', monospace;">
                            <div><strong>Formula:</strong> P1 = s &middot; L &middot; sin(&delta;) &nbsp;|&nbsp; P1' = s' &middot; L' &middot; sin(&delta;')</div>
                            <div><strong>Substitution:</strong> P1 = ${s.toFixed(3)} &times; ${p.L.toFixed(3)} &times; sin(${deg(delta_val).toFixed(2)}&deg;) = <strong>${mag_P1.toFixed(3)} ton</strong> &nbsp;|&nbsp; P1' = ${s_prime.toFixed(3)} &times; ${p.L_prime.toFixed(3)} &times; sin(${deg(delta_prime_val).toFixed(2)}&deg;) = <strong>${mag_P1_prime.toFixed(3)} ton</strong></div>
                            <div style="margin-top: 4px; padding-top: 4px; border-top: 1px dashed #cbd5e1; color: #1e293b;">
                                <strong>3D Components:</strong><br>
                                Upstream P1: Fx = P1&middot;cos(&delta;) = <strong>${f.P1.x.toFixed(3)} ton</strong> | Fy = <strong>0.000 ton</strong> | Fz = -P1&middot;sin(&delta;) = <strong>${f.P1.z.toFixed(3)} ton</strong><br>
                                Downstream P1': Fx = P1'&middot;cos(&delta;')&middot;cos(&theta;) = <strong>${f.P1_prime.x.toFixed(3)} ton</strong> | Fy = -P1'&middot;cos(&delta;')&middot;sin(&theta;) = <strong>${f.P1_prime.y.toFixed(3)} ton</strong> | Fz = -P1'&middot;sin(&delta;') = <strong>${f.P1_prime.z.toFixed(3)} ton</strong>
                            </div>
                        </div>
                    </div>

                    <!-- Card 3 -->
                    <div style="border: 1px solid #cbd5e1; border-radius: 4px; padding: 8px 10px; background-color: #f8fafc;">
                        <div style="font-weight: bold; font-size: 10px; color: #0f172a; margin-bottom: 4px;">(iii) Hydrodynamic Friction P2 & P2'</div>
                        <div style="font-size: 9px; color: #334155; line-height: 1.5; font-family: 'Consolas', 'Courier New', monospace;">
                            <div><strong>Formula:</strong> P2 = [2 &middot; f &middot; Q&sup2; / (g &middot; &pi; &middot; D&sup3;)] &middot; L &nbsp;|&nbsp; P2' = [2 &middot; f &middot; Q&sup2; / (g &middot; &pi; &middot; D&sup3;)] &middot; L'</div>
                            <div><strong>Substitution:</strong> P2 = [2 &times; ${p.f.toFixed(2)} &times; ${p.Q.toFixed(3)}&sup2; / (9.80665 &times; &pi; &times; ${p.D.toFixed(3)}&sup3;)] &times; ${p.L.toFixed(3)} = <strong>${mag_P2.toFixed(3)} ton</strong></div>
                            <div><strong>Substitution:</strong> P2' = [2 &times; ${p.f.toFixed(2)} &times; ${p.Q.toFixed(3)}&sup2; / (9.80665 &times; &pi; &times; ${p.D.toFixed(3)}&sup3;)] &times; ${p.L_prime.toFixed(3)} = <strong>${mag_P2_prime.toFixed(3)} ton</strong></div>
                            <div style="margin-top: 4px; padding-top: 4px; border-top: 1px dashed #cbd5e1; color: #1e293b;">
                                <strong>3D Components:</strong><br>
                                Upstream P2: Fx = P2&middot;cos(&delta;) = <strong>${f.P2.x.toFixed(3)} ton</strong> | Fy = <strong>0.000 ton</strong> | Fz = -P2&middot;sin(&delta;) = <strong>${f.P2.z.toFixed(3)} ton</strong><br>
                                Downstream P2': Fx = P2'&middot;cos(&delta;')&middot;cos(&theta;) = <strong>${f.P2_prime.x.toFixed(3)} ton</strong> | Fy = -P2'&middot;cos(&delta;')&middot;sin(&theta;) = <strong>${f.P2_prime.y.toFixed(3)} ton</strong> | Fz = -P2'&middot;sin(&delta;') = <strong>${f.P2_prime.z.toFixed(3)} ton</strong>
                            </div>
                        </div>
                    </div>

                    <!-- Card 4 -->
                    <div style="border: 1px solid #cbd5e1; border-radius: 4px; padding: 8px 10px; background-color: #f8fafc;">
                        <div style="font-weight: bold; font-size: 10px; color: #0f172a; margin-bottom: 4px;">(iv) Centrifugal Forces Pv & Ph</div>
                        <div style="font-size: 9px; color: #334155; line-height: 1.5; font-family: 'Consolas', 'Courier New', monospace;">
                            <div><strong>Formula:</strong> Pv = 2 &middot; (v&sup2;/g) &middot; A &middot; sin(|&phi;|/2) &middot; &gamma;w &nbsp;|&nbsp; Ph = 2 &middot; (v&sup2;/g) &middot; A &middot; sin(&theta;/2) &middot; &gamma;w</div>
                            <div><strong>Substitution:</strong> Pv = 2 &times; (${v_water.toFixed(3)}&sup2;/9.80665) &times; ${A_pipe.toFixed(3)} &times; sin(|${deg(phi_val).toFixed(2)}&deg;|/2 = ${deg(Math.abs(phi_val)/2.0).toFixed(2)}&deg;) &times; 1.0 = <strong>${Pv_val.toFixed(3)} ton</strong></div>
                            <div><strong>Substitution:</strong> Ph = 2 &times; (${v_water.toFixed(3)}&sup2;/9.80665) &times; ${A_pipe.toFixed(3)} &times; sin(${p.theta.toFixed(2)}&deg;/2) &times; 1.0 = <strong>${Ph_val.toFixed(3)} ton</strong></div>
                            <div style="margin-top: 4px; padding-top: 4px; border-top: 1px dashed #cbd5e1; color: #1e293b;">
                                <strong>3D Components:</strong><br>
                                Vertical Pv: Fx = Pv&middot;sin(&phi;/2) = <strong>${f.Pv.x.toFixed(3)} ton</strong> | Fy = <strong>0.000 ton</strong> | Fz = Pv&middot;cos(&phi;/2) = <strong>${f.Pv.z.toFixed(3)} ton</strong><br>
                                Horizontal Ph: Fx = Ph&middot;sin(&theta;/2) = <strong>${f.Ph.x.toFixed(3)} ton</strong> | Fy = Ph&middot;cos(&theta;/2) = <strong>${f.Ph.y.toFixed(3)} ton</strong> | Fz = <strong>0.000 ton</strong>
                            </div>
                        </div>
                    </div>

                    <!-- Card 5 -->
                    <div style="border: 1px solid #cbd5e1; border-radius: 4px; padding: 8px 10px; background-color: #f8fafc;">
                        <div style="font-weight: bold; font-size: 10px; color: #0f172a; margin-bottom: 4px;">(v) Expansion Joint Hydrostatic Pressure P3 & P3'</div>
                        <div style="font-size: 9px; color: #334155; line-height: 1.5; font-family: 'Consolas', 'Courier New', monospace;">
                            <div><strong>Formula:</strong> P3 = He &middot; &pi; &middot; D &middot; t &middot; &gamma;w &nbsp;|&nbsp; P3' = He' &middot; &pi; &middot; D &middot; t' &middot; &gamma;w</div>
                            <div><strong>Substitution:</strong> P3 = ${p.He.toFixed(1)} &times; &pi; &times; ${p.D.toFixed(3)} &times; ${p.t.toFixed(4)} &times; 1.0 = <strong>${mag_P3.toFixed(3)} ton</strong> &nbsp;|&nbsp; P3' = ${p.He_prime.toFixed(1)} &times; &pi; &times; ${p.D.toFixed(3)} &times; ${p.t_prime.toFixed(4)} &times; 1.0 = <strong>${mag_P3_prime.toFixed(3)} ton</strong></div>
                            <div style="margin-top: 4px; padding-top: 4px; border-top: 1px dashed #cbd5e1; color: #1e293b;">
                                <strong>3D Components:</strong><br>
                                Upstream P3: Fx = P3&middot;cos(&delta;) = <strong>${f.P3.x.toFixed(3)} ton</strong> | Fy = <strong>0.000 ton</strong> | Fz = -P3&middot;sin(&delta;) = <strong>${f.P3.z.toFixed(3)} ton</strong><br>
                                Downstream P3': Fx = P3'&middot;cos(&delta;')&middot;cos(&theta;) = <strong>${f.P3_prime.x.toFixed(3)} ton</strong> | Fy = -P3'&middot;cos(&delta;')&middot;sin(&theta;) = <strong>${f.P3_prime.y.toFixed(3)} ton</strong> | Fz = -P3'&middot;sin(&delta;') = <strong>${f.P3_prime.z.toFixed(3)} ton</strong>
                            </div>
                        </div>
                    </div>

                    <!-- Card 6 -->
                    <div style="border: 1px solid #cbd5e1; border-radius: 4px; padding: 8px 10px; background-color: #f8fafc;">
                        <div style="font-weight: bold; font-size: 10px; color: #0f172a; margin-bottom: 4px;">(vi) Unbalanced Internal Pressure at Bends Prv & Prh</div>
                        <div style="font-size: 9px; color: #334155; line-height: 1.5; font-family: 'Consolas', 'Courier New', monospace;">
                            <div><strong>Formula:</strong> Prv = 2 &middot; H &middot; A &middot; sin(|&phi;|/2) &middot; &gamma;w &nbsp;|&nbsp; Prh = 2 &middot; H &middot; A &middot; sin(&theta;/2) &middot; &gamma;w</div>
                            <div><strong>Substitution:</strong> Prv = 2 &times; ${p.H.toFixed(1)} &times; ${A_pipe.toFixed(3)} &times; sin(|${deg(phi_val).toFixed(2)}&deg;|/2 = ${deg(Math.abs(phi_val)/2.0).toFixed(2)}&deg;) &times; 1.0 = <strong>${Prv_val.toFixed(3)} ton</strong></div>
                            <div><strong>Substitution:</strong> Prh = 2 &times; ${p.H.toFixed(1)} &times; ${A_pipe.toFixed(3)} &times; sin(${p.theta.toFixed(2)}&deg;/2) &times; 1.0 = <strong>${Prh_val.toFixed(3)} ton</strong></div>
                            <div style="margin-top: 4px; padding-top: 4px; border-top: 1px dashed #cbd5e1; color: #1e293b;">
                                <strong>3D Components:</strong><br>
                                Vertical Prv: Fx = Prv&middot;sin(&phi;/2) = <strong>${f.Prv.x.toFixed(3)} ton</strong> | Fy = <strong>0.000 ton</strong> | Fz = Prv&middot;cos(&phi;/2) = <strong>${f.Prv.z.toFixed(3)} ton</strong><br>
                                Horizontal Prh: Fx = Prh&middot;sin(&theta;/2) = <strong>${f.Prh.x.toFixed(3)} ton</strong> | Fy = Prh&middot;cos(&theta;/2) = <strong>${f.Prh.y.toFixed(3)} ton</strong> | Fz = <strong>0.000 ton</strong>
                            </div>
                        </div>
                    </div>

                    <!-- Card 7 -->
                    <div style="border: 1px solid #cbd5e1; border-radius: 4px; padding: 8px 10px; background-color: #f8fafc;">
                        <div style="font-weight: bold; font-size: 10px; color: #0f172a; margin-bottom: 4px;">(vii) Temperature Expansion Friction Forces (F1, F2 &rarr; F | F1', F2' &rarr; F')</div>
                        <div style="font-size: 9px; color: #334155; line-height: 1.5; font-family: 'Consolas', 'Courier New', monospace;">
                            <div><strong>Formulas:</strong> F1 = c&middot;(w+s)&middot;(L-l/2)&middot;cos(&delta;) | F2 = fe&middot;&pi;&middot;(D+2t) | F = F1 + F2</div>
                            <div><strong>Formulas:</strong> F1' = c&middot;(w+s')&middot;(L'-l'/2)&middot;cos(&delta;') | F2' = fe&middot;&pi;&middot;(D+2t') | F' = F1' + F2'</div>
                            <div><strong>Substitution:</strong> F1 = ${F1.toFixed(3)} ton, F2 = ${F2.toFixed(3)} ton &rarr; Upstream Total F = <strong>${F_total.toFixed(3)} ton</strong></div>
                            <div><strong>Substitution:</strong> F1' = ${F1_prime.toFixed(3)} ton, F2' = ${F2_prime.toFixed(3)} ton &rarr; Downstream Total F' = <strong>${F_prime.toFixed(3)} ton</strong></div>
                            <div style="margin-top: 4px; padding-top: 4px; border-top: 1px dashed #cbd5e1; color: #1e293b;">
                                <strong>3D Components:</strong><br>
                                Upstream F: Fx = F&middot;cos(&delta;) = <strong>${f.F.x.toFixed(3)} ton</strong> | Fy = <strong>0.000 ton</strong> | Fz = -F&middot;sin(&delta;) = <strong>${f.F.z.toFixed(3)} ton</strong><br>
                                Downstream F': Fx = F'&middot;cos(&delta;')&middot;cos(&theta;) = <strong>${f.F_prime.x.toFixed(3)} ton</strong> | Fy = -F'&middot;cos(&delta;')&middot;sin(&theta;) = <strong>${f.F_prime.y.toFixed(3)} ton</strong> | Fz = -F'&middot;sin(&delta;') = <strong>${f.F_prime.z.toFixed(3)} ton</strong>
                            </div>
                        </div>
                    </div>

                    <!-- Card 8 -->
                    <div style="border: 1px solid #cbd5e1; border-radius: 4px; padding: 8px 10px; background-color: #f8fafc;">
                        <div style="font-weight: bold; font-size: 10px; color: #0f172a; margin-bottom: 4px;">(viii) Concrete Anchor Block Dead Weight WA</div>
                        <div style="font-size: 9px; color: #334155; line-height: 1.5; font-family: 'Consolas', 'Courier New', monospace;">
                            <div><strong>Formula:</strong> WA = &gamma;c &middot; (A_profile &middot; W_base - A_pipe &middot; L_internal)</div>
                            <div><strong>Substitution:</strong> WA = ${p.wc.toFixed(2)} &times; (${f.A_profile.toFixed(3)} &times; ${p.W.toFixed(2)} - ${A_pipe.toFixed(4)} &times; ${f.L_internal.toFixed(3)}) = <strong>${f.WA.toFixed(3)} ton</strong></div>
                            <div style="margin-top: 4px; padding-top: 4px; border-top: 1px dashed #cbd5e1; color: #1e293b;">
                                <strong>3D Components:</strong> Fx = <strong>0.000 ton</strong> | Fy = <strong>0.000 ton</strong> | Fz = -WA = <strong>${(-f.WA).toFixed(3)} ton</strong>
                            </div>
                        </div>
                    </div>

                    <!-- Card 9 -->
                    <div style="border: 1px solid #cbd5e1; border-radius: 4px; padding: 8px 10px; background-color: #f8fafc;">
                        <div style="font-weight: bold; font-size: 10px; color: #0f172a; margin-bottom: 4px;">(ix) Seismic Inertia Forces FWA & Fp</div>
                        <div style="font-size: 9px; color: #334155; line-height: 1.5; font-family: 'Consolas', 'Courier New', monospace;">
                            <div><strong>Formula:</strong> FWA = Kh &middot; WA &nbsp;|&nbsp; Fp = Kh &middot; [(w+s)&middot;l/2 + (w+s')&middot;l'/2]</div>
                            <div><strong>Substitution:</strong> FWA = ${p.Kh.toFixed(2)} &times; ${f.WA.toFixed(3)} = <strong>${f.F_WA.toFixed(3)} ton</strong></div>
                            <div><strong>Substitution:</strong> Fp = ${p.Kh.toFixed(2)} &times; [(${w.toFixed(3)}+${s.toFixed(3)})&times;${p.l.toFixed(3)}/2 + (${w.toFixed(3)}+${s_prime.toFixed(3)})&times;${p.l_prime.toFixed(3)}/2] = <strong>${f.F_p.toFixed(3)} ton</strong></div>
                            <div style="margin-top: 4px; padding-top: 4px; border-top: 1px dashed #cbd5e1; color: #1e293b;">
                                <strong>3D Components:</strong><br>
                                FWA: Fx = <strong>${f.F_WA.toFixed(3)} ton</strong> | Fy = <strong>0.000 ton</strong> | Fz = <strong>0.000 ton</strong><br>
                                Fp: Fx = <strong>${f.F_p.toFixed(3)} ton</strong> | Fy = <strong>0.000 ton</strong> | Fz = <strong>0.000 ton</strong>
                            </div>
                        </div>
                    </div>
                </div>

                <h3 style="font-size: 12px; font-weight: 700; color: #1e293b; margin: 12px 0 6px 0;">(C) Check of Safety Criteria</h3>
                <div style="font-size: 9.5px; line-height: 1.5; color: #334155;">
                    <div><strong>(i) Safety for overturning:</strong> e = |B/2 - &Sigma;M / &Sigma;V| &le; B/6 (Static) or B/4 (Seismic)</div>
                    <div><strong>(ii) Safety for sliding:</strong> Fs = &Sigma;V&middot;&lambda; / &Sigma;H &ge; 2.0 (Static) or 1.2 (Seismic)</div>
                    <div><strong>(iii) Safety for bearing capacity:</strong> &sigma;_max = (&Sigma;V / A)&middot;(1 &plusmn; 6e/B) &le; qa (Static) or qa &times; 1.50 (Seismic)</div>
                </div>
            </div>

            <!-- Projection Drawings -->
            <div class="report-section" style="margin-bottom: 25px; page-break-inside: avoid;">
                <h2 style="font-size: 14px; font-weight: 800; color: #0f172a; text-transform: uppercase; border-bottom: 2px solid #0f172a; padding-bottom: 4px; margin-bottom: 12px;">Projection Blueprints & Structural Drawings</h2>
                <div style="display: flex; flex-direction: column; gap: 15px;">
                    <div>
                        <h4 style="font-size: 10px; margin: 0 0 4px 0; color: #475569; text-transform: uppercase;">A. Longitudinal Profile (X-Z Plane)</h4>
                        <div style="border: 1px solid #cbd5e1; padding: 5px; background: #ffffff; height: 220px; overflow: hidden;">
                            ${cleanProfileSvg}
                        </div>
                    </div>
                    <div style="display: grid; grid-template-columns: 1.2fr 1fr; gap: 15px;">
                        <div>
                            <h4 style="font-size: 10px; margin: 0 0 4px 0; color: #475569; text-transform: uppercase;">B. Plan Layout (X-Y Plane)</h4>
                            <div style="border: 1px solid #cbd5e1; padding: 5px; background: #ffffff; height: 200px; overflow: hidden;">
                                ${cleanPlanSvg}
                            </div>
                        </div>
                        <div>
                            <h4 style="font-size: 10px; margin: 0 0 4px 0; color: #475569; text-transform: uppercase;">C. Transverse Section (Y-Z Plane)</h4>
                            <div style="border: 1px solid #cbd5e1; padding: 5px; background: #ffffff; height: 200px; overflow: hidden;">
                                ${cleanSectionSvg}
                            </div>
                        </div>
                    </div>
                </div>
            <!-- 3D View & Center of Gravity -->
            <div class="report-section" style="margin-bottom: 25px; page-break-inside: avoid;">
                <h2 style="font-size: 14px; font-weight: 800; color: #0f172a; text-transform: uppercase; border-bottom: 2px solid #0f172a; padding-bottom: 4px; margin-bottom: 12px;">3D Isometric View & Center of Gravity (CG) Spatial Position</h2>
                <div style="border: 1px solid #cbd5e1; padding: 5px; background: #ffffff; height: 320px; overflow: hidden; border-radius: 4px;">
                    ${generate3DSVG(true)}
                </div>
            </div>

            <!-- Free Body Diagrams -->
            <div class="report-section" style="margin-bottom: 25px; page-break-inside: avoid;">
                <h2 style="font-size: 14px; font-weight: 800; color: #0f172a; text-transform: uppercase; border-bottom: 2px solid #0f172a; padding-bottom: 4px; margin-bottom: 12px;">Free Body Diagrams (FBD)</h2>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                    <div style="border: 1px solid #cbd5e1; padding: 5px; background: #ffffff; height: 280px; overflow: hidden;">
                        ${generateFBDSVG('XZ')}
                    </div>
                    <div style="border: 1px solid #cbd5e1; padding: 5px; background: #ffffff; height: 280px; overflow: hidden;">
                        ${generateFBDSVG('YZ')}
                    </div>
                </div>
            </div>

            <!-- Section 2: Stability Analysis Calculations -->
            <div class="report-section" style="margin-bottom: 25px;">
                <h2 style="font-size: 14px; font-weight: 800; color: #0f172a; text-transform: uppercase; border-bottom: 2px solid #0f172a; padding-bottom: 4px; margin-bottom: 12px;">(2) Stability Analysis Step-by-Step Calculations</h2>
                
                <h3 style="font-size: 12px; font-weight: 700; color: #1e293b; margin: 10px 0 6px 0;">(A) Cases for Stability Analysis</h3>
                <table style="width: 100%; border-collapse: collapse; font-size: 9.5px; margin-bottom: 12px;">
                    <thead>
                        <tr style="background-color: #f1f5f9; border-bottom: 1px solid #cbd5e1;">
                            <th style="padding: 4px 6px; border: 1px solid #cbd5e1; text-align: center;">Case</th>
                            <th style="padding: 4px 6px; border: 1px solid #cbd5e1; text-align: left;">Combination of Forces</th>
                            <th style="padding: 4px 6px; border: 1px solid #cbd5e1; text-align: left;">Description</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr><td style="padding: 4px 6px; border: 1px solid #cbd5e1; text-align: center;">1</td><td style="padding: 4px 6px; border: 1px solid #cbd5e1; font-family: monospace;">P + F + F'</td><td style="padding: 4px 6px; border: 1px solid #cbd5e1;">Upstream expansion + Downstream expansion</td></tr>
                        <tr><td style="padding: 4px 6px; border: 1px solid #cbd5e1; text-align: center;">2</td><td style="padding: 4px 6px; border: 1px solid #cbd5e1; font-family: monospace;">P + F - F'</td><td style="padding: 4px 6px; border: 1px solid #cbd5e1;">Upstream expansion + Downstream shrinkage</td></tr>
                        <tr><td style="padding: 4px 6px; border: 1px solid #cbd5e1; text-align: center;">3</td><td style="padding: 4px 6px; border: 1px solid #cbd5e1; font-family: monospace;">P - F + F'</td><td style="padding: 4px 6px; border: 1px solid #cbd5e1;">Upstream shrinkage + Downstream expansion</td></tr>
                        <tr><td style="padding: 4px 6px; border: 1px solid #cbd5e1; text-align: center;">4</td><td style="padding: 4px 6px; border: 1px solid #cbd5e1; font-family: monospace;">P - F - F'</td><td style="padding: 4px 6px; border: 1px solid #cbd5e1;">Upstream shrinkage + Downstream shrinkage</td></tr>
                    </tbody>
                </table>
                <p style="font-size: 8.5px; color: #475569; margin: 0 0 12px 0;">
                    * The analysis is conducted on 2 planes: <strong>x-z plane</strong> (flow direction) and <strong>y-z plane</strong> (transverse direction) under earthquake conditions (x and -x for x-z plane, y and -y for y-z plane), giving 16 total seismic cases.
                </p>

                <h3 style="font-size: 12px; font-weight: 700; color: #1e293b; margin: 10px 0 6px 0;">(B) Dead Weight, Seismic Forces & Center of Gravity</h3>
                <div style="font-size: 9.5px; line-height: 1.5; color: #334155; margin-bottom: 15px;">
                    <div><strong>(a) WA : Dead weight of anchor block:</strong> WA = ${p.wc.toFixed(2)} &times; (${f.A_profile.toFixed(3)} &times; ${p.W.toFixed(2)} - ${A_pipe.toFixed(4)} &times; ${f.L_internal.toFixed(3)}) = <strong>${f.WA.toFixed(3)} ton</strong></div>
                    <div><strong>(b) FWA : Seismic force for dead weight of anchor block:</strong> FWA = ${p.Kh.toFixed(2)} &times; ${f.WA.toFixed(3)} = <strong>${f.F_WA.toFixed(3)} ton</strong></div>
                    <div><strong>(c) Fp : Seismic force for penstock pipe & water:</strong> Fp = ${p.Kh.toFixed(2)} &times; [(${w.toFixed(3)}+${s.toFixed(3)})&times;${p.l.toFixed(3)}/2 + (${w.toFixed(3)}+${s_prime.toFixed(3)})&times;${p.l_prime.toFixed(3)}/2] = <strong>${f.F_p.toFixed(3)} ton</strong></div>
                    <div><strong>(d) Gravity Center of Anchor Block:</strong> x-z plain x = &Sigma;A&middot;x / &Sigma;A = <strong>${f.x_CG.toFixed(3)} m</strong>, y-z plain y = &Sigma;A&middot;y / &Sigma;A = <strong>${f.y_CG_stability.toFixed(3)} m</strong>, z_CG = <strong>${f.z_CG.toFixed(3)} m</strong></div>
                </div>

                <h3 style="font-size: 12px; font-weight: 700; color: #1e293b; margin: 15px 0 6px 0;">Table 2.1.1 Thrust Forces Component Breakdown Table</h3>
                <table style="width: 100%; border-collapse: collapse; font-size: 9px; margin-bottom: 20px;">
                    <thead>
                        <tr style="background-color: #f1f5f9; border-bottom: 1.5px solid #0f172a;">
                            <th style="padding: 4px 6px; border: 1px solid #cbd5e1; text-align: left;">Force Component</th>
                            <th style="padding: 4px 6px; border: 1px solid #cbd5e1; text-align: left;">Symbol</th>
                            <th style="padding: 4px 6px; border: 1px solid #cbd5e1; text-align: right;">Magnitude [ton]</th>
                            <th style="padding: 4px 6px; border: 1px solid #cbd5e1; text-align: right;">x-direction [ton]</th>
                            <th style="padding: 4px 6px; border: 1px solid #cbd5e1; text-align: right;">y-direction [ton]</th>
                            <th style="padding: 4px 6px; border: 1px solid #cbd5e1; text-align: right;">z-direction [ton]</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${table211_rows}
                    </tbody>
                </table>

                <h3 style="font-size: 12px; font-weight: 700; color: #1e293b; margin: 15px 0 6px 0;">Table 2.1.2 Summary of Results of Stability Analysis</h3>
                <div style="font-size: 10px; font-weight: bold; color: #0f172a; margin: 8px 0 4px 0;">1. x-z plain (Flow Direction)</div>
                <table style="width: 100%; border-collapse: collapse; font-size: 9px; margin-bottom: 12px;">
                    <thead>
                        <tr style="background-color: #f1f5f9; border-bottom: 1.5px solid #0f172a;">
                            <th style="padding: 4px 6px; border: 1px solid #cbd5e1; text-align: left;">Case</th>
                            <th style="padding: 4px 6px; border: 1px solid #cbd5e1; text-align: left;">EQ / Load</th>
                            <th style="padding: 4px 6px; border: 1px solid #cbd5e1; text-align: left;">Combination</th>
                            <th style="padding: 4px 6px; border: 1px solid #cbd5e1; text-align: right;">Total V [t]</th>
                            <th style="padding: 4px 6px; border: 1px solid #cbd5e1; text-align: right;">Total H [t]</th>
                            <th style="padding: 4px 6px; border: 1px solid #cbd5e1; text-align: right;">e [m] / Limit</th>
                            <th style="padding: 4px 6px; border: 1px solid #cbd5e1; text-align: right;">Sliding Fs</th>
                            <th style="padding: 4px 6px; border: 1px solid #cbd5e1; text-align: right;">Overturning Fot</th>
                            <th style="padding: 4px 6px; border: 1px solid #cbd5e1; text-align: right;">Bearing &sigma;max [t/m&sup2;]</th>
                            <th style="padding: 4px 6px; border: 1px solid #cbd5e1; text-align: center;">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${xzCasesRows}
                    </tbody>
                </table>

                <div style="font-size: 10px; font-weight: bold; color: #0f172a; margin: 8px 0 4px 0;">2. y-z plain (Transverse Direction)</div>
                <table style="width: 100%; border-collapse: collapse; font-size: 9px; margin-bottom: 20px;">
                    <thead>
                        <tr style="background-color: #f1f5f9; border-bottom: 1.5px solid #0f172a;">
                            <th style="padding: 4px 6px; border: 1px solid #cbd5e1; text-align: left;">Case</th>
                            <th style="padding: 4px 6px; border: 1px solid #cbd5e1; text-align: left;">EQ / Load</th>
                            <th style="padding: 4px 6px; border: 1px solid #cbd5e1; text-align: left;">Combination</th>
                            <th style="padding: 4px 6px; border: 1px solid #cbd5e1; text-align: right;">Total V [t]</th>
                            <th style="padding: 4px 6px; border: 1px solid #cbd5e1; text-align: right;">Total H [t]</th>
                            <th style="padding: 4px 6px; border: 1px solid #cbd5e1; text-align: right;">e [m] / Limit</th>
                            <th style="padding: 4px 6px; border: 1px solid #cbd5e1; text-align: right;">Sliding Fs</th>
                            <th style="padding: 4px 6px; border: 1px solid #cbd5e1; text-align: right;">Overturning Fot</th>
                            <th style="padding: 4px 6px; border: 1px solid #cbd5e1; text-align: right;">Bearing &sigma;max [t/m&sup2;]</th>
                            <th style="padding: 4px 6px; border: 1px solid #cbd5e1; text-align: center;">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${yzCasesRows}
                    </tbody>
                </table>
            </div>

            <!-- Detailed JICA Page-by-Page Calculation Sheets -->
            <div class="report-section" style="margin-bottom: 25px;">
                <h2 style="font-size: 14px; font-weight: 800; color: #0f172a; text-transform: uppercase; border-bottom: 2px solid #0f172a; padding-bottom: 4px; margin-bottom: 15px;">Anchor Block Calculation Sheets (Detailed Load Case Verification)</h2>
                ${detailedCasesVerification}
            </div>
        </div>
    `;
}

// Project Manager Helpers
function updateProjectListDropdown() {
    const select = document.getElementById('project-load-select');
    if (!select) return;
    select.innerHTML = '<option value="">-- Select to Load --</option>';
    
    try {
        const projectsStr = localStorage.getItem('hydroblock_projects');
        if (projectsStr) {
            const projects = JSON.parse(projectsStr);
            Object.keys(projects).forEach(name => {
                select.innerHTML += `<option value="${name}">${name}</option>`;
            });
        }
    } catch (e) {
        console.error("Failed to parse saved projects list", e);
    }
}

function saveActiveProject(name) {
    if (!name) name = document.getElementById('project-name-input').value.trim();
    if (!name) {
        alert("Please enter a valid project name!");
        return;
    }
    
    try {
        let projects = {};
        const projectsStr = localStorage.getItem('hydroblock_projects');
        if (projectsStr) {
            projects = JSON.parse(projectsStr);
        }
        
        projects[name] = {
            coordinates: state.coordinates,
            params: state.params
        };
        
        localStorage.setItem('hydroblock_projects', JSON.stringify(projects));
        localStorage.setItem('hydroblock_last_project_name', name);
        updateProjectListDropdown();
        alert(`Project "${name}" saved successfully to LocalStorage!`);
    } catch (e) {
        alert("Failed to save project. Maybe LocalStorage is disabled or full.");
    }
}

function loadProjectByName(name) {
    if (!name) return;
    
    try {
        const projectsStr = localStorage.getItem('hydroblock_projects');
        if (projectsStr) {
            const projects = JSON.parse(projectsStr);
            if (projects[name]) {
                state.coordinates = projects[name].coordinates;
                state.params = projects[name].params;
                
                updateUIFieldsFromState();
                localStorage.setItem('hydroblock_last_project_name', name);
                document.getElementById('project-name-input').value = name;
                document.getElementById('current-preset-label').innerText = `Active Project: ${name}`;
                validateAndDraw();
                alert(`Project "${name}" loaded successfully!`);
            }
        }
    } catch (e) {
        alert("Failed to load project from LocalStorage.");
    }
}

function autoSaveState() {
    try {
        const activeName = document.getElementById('project-name-input').value.trim() || 'Unsaved Project';
        localStorage.setItem('hydroblock_last_state', JSON.stringify({
            name: activeName,
            coordinates: state.coordinates,
            params: state.params
        }));
    } catch (e) {
        // ignore
    }
}

function tryRestoreLastState() {
    try {
        const lastStateStr = localStorage.getItem('hydroblock_last_state');
        if (lastStateStr) {
            const lastState = JSON.parse(lastStateStr);
            state.coordinates = lastState.coordinates;
            state.params = lastState.params;
            
            updateUIFieldsFromState();
            
            if (lastState.name) {
                document.getElementById('project-name-input').value = lastState.name;
                document.getElementById('current-preset-label').innerText = `Restored Project: ${lastState.name}`;
            }
            validateAndDraw();
            return true;
        }
    } catch (e) {
        console.error("Failed to restore last active project state", e);
    }
    return false;
}

function migrateCoordinates(c) {
    if (!c) return;
    
    // Migrate old pipeZ to pipeXZ array
    if (!c.pipeXZ && c.pipeZ) {
        c.pipeXZ = [
            { x: 0.0, z: c.pipeZ.z1 !== undefined ? c.pipeZ.z1 : 3.533 },
            { x: c.pipeXY && c.pipeXY[1] ? c.pipeXY[1].x : 3.0, z: c.pipeZ.z2 !== undefined ? c.pipeZ.z2 : 3.0 },
            { x: c.pipeXY && c.pipeXY[2] ? c.pipeXY[2].x : 6.17, z: c.pipeZ.z3 !== undefined ? c.pipeZ.z3 : 3.0 }
        ];
        delete c.pipeZ;
    }
    
    // Ensure groundCoords exists
    if (!c.groundCoords) {
        c.groundCoords = [
            { x: 0.0, z: 4.5 },
            { x: c.pipeXZ && c.pipeXZ[2] ? c.pipeXZ[2].x : 6.17, z: 4.0 }
        ];
    }
    
    // Ensure cutLineCoords exists
    if (!c.cutLineCoords && c.pipeXY) {
        c.cutLineCoords = JSON.parse(JSON.stringify(c.pipeXY));
    }
}

function updateUIFieldsFromState() {
    const c = state.coordinates;
    const p = state.params;
    
    migrateCoordinates(c);
    
    document.getElementById('pipe-xy-x1').value = c.pipeXY[0].x;
    document.getElementById('pipe-xy-y1').value = c.pipeXY[0].y;
    document.getElementById('pipe-xy-x2').value = c.pipeXY[1].x;
    document.getElementById('pipe-xy-y2').value = c.pipeXY[1].y;
    document.getElementById('pipe-xy-x3').value = c.pipeXY[2].x;
    document.getElementById('pipe-xy-y3').value = c.pipeXY[2].y;
    
    document.getElementById('param-D').value = p.D;
    document.getElementById('param-t').value = p.t;
    document.getElementById('param-t_prime').value = p.t_prime;
    document.getElementById('param-L').value = p.L;
    document.getElementById('param-L_prime').value = p.L_prime;
    document.getElementById('param-l').value = p.l;
    document.getElementById('param-l_prime').value = p.l_prime || 0.0;
    
    document.getElementById('pipe-center-y').value = c.pipeCenterYZ.y;
    document.getElementById('pipe-center-z').value = c.pipeCenterYZ.z;
    document.getElementById('param-H').value = p.H;
    document.getElementById('param-Q').value = p.Q;
    document.getElementById('param-He').value = p.He;
    document.getElementById('param-He_prime').value = p.He_prime;
    document.getElementById('param-lambda').value = p.lambda;
    document.getElementById('param-qa').value = p.qa;
    document.getElementById('param-Kh').value = p.Kh;
    document.getElementById('param-wc').value = p.wc;
    document.getElementById('param-c').value = p.c;
    document.getElementById('param-f').value = p.f;
    document.getElementById('param-fe').value = p.fe;
    
    document.getElementById('param-bearing-increase-factor').value = p.bearing_increase_factor || "1.50";
    document.getElementById('param-soil-cohesion').value = p.soil_cohesion || 1.50;
    document.getElementById('param-soil-friction-angle').value = p.soil_friction_angle || 30.0;
    
    document.getElementById('buried-condition-toggle').checked = p.buriedCondition;
    document.getElementById('mitigation-toggle').checked = p.mitigation_active || false;
    document.getElementById('mitigation-inputs-panel').style.display = (p.mitigation_active) ? 'block' : 'none';
    document.getElementById('mitigation-h-key').value = p.h_key || 0.0;
    document.getElementById('mitigation-n-anchors').value = p.n_anchors || 0;
    document.getElementById('mitigation-d-anchor').value = p.d_anchor || 25;
    document.getElementById('mitigation-fy-anchor').value = p.fy_anchor || 415;
    
    renderXYCoordsTable();
    renderXZCoordsTable();
    renderXZPipeTable();
    renderXZGroundTable();
    renderYZCoordsTable();
    renderCutCoordsTable();
}

// Start App
window.addEventListener('DOMContentLoaded', () => {
    initEvents();
    updateProjectListDropdown();
    const restored = tryRestoreLastState();
    if (!restored) {
        loadPreset('ab13');
    }
});
