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
                { x: 6.17, y: 0.0 },
                { x: 6.17, y: 4.719 },
                { x: 0.0, y: 4.719 }
            ],
            pipeXY: [
                { x: 0.0, y: 2.0 },
                { x: 3.0, y: 2.0 },
                { x: 6.17, y: 2.0 }
            ],
            cutLineCoords: [ { x: 0.0, y: 2.0 }, { x: 6.17, y: 2.0 } ],
            xzCoords: [
                { x: 0.0, z: 0.992 },
                { x: 0.0, z: 4.992 },
                { x: 3.544, z: 4.992 },
                { x: 6.170, z: 3.447 },
                { x: 4.141, z: 0.0 }
            ],
            pipeXZ: [
                { x: 0.0, z: 3.533 },
                { x: 3.0, z: 3.000 },
                { x: 6.17, z: 3.000 }
            ],
            groundCoords: [
                { x: 0.0, z: 4.5 },
                { x: 6.17, z: 4.0 }
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
                { x: 6.17, y: 0.0 },
                { x: 6.17, y: 4.719 },
                { x: 0.0, y: 4.719 }
            ],
            pipeXY: [
                { x: 0.0, y: 2.0 },
                { x: 3.0, y: 2.0 },
                { x: 6.17, y: 2.0 }
            ],
            cutLineCoords: [ { x: 0.0, y: 2.0 }, { x: 6.17, y: 2.0 } ],
            xzCoords: [
                { x: 0.0, z: 0.992 },
                { x: 0.0, z: 4.992 },
                { x: 3.544, z: 4.992 },
                { x: 6.170, z: 3.447 },
                { x: 4.141, z: 0.0 }
            ],
            pipeXZ: [
                { x: 0.0, z: 3.533 },
                { x: 3.0, z: 3.000 },
                { x: 6.17, z: 3.000 }
            ],
            groundCoords: [
                { x: 0.0, z: 4.5 },
                { x: 6.17, z: 4.0 }
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
                { x: 8.0, y: 2.75 }
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
                { x: 0.0, z: 5.362 },
                { x: 4.0, z: 3.500 },
                { x: 8.0, z: 2.650 }
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
    
    // Vertical angles delta, delta' from profile pipe coordinates
    const dx_up = Math.abs(c.pipeXZ[1].x - c.pipeXZ[0].x);
    const dx_down = Math.abs(c.pipeXZ[2].x - c.pipeXZ[1].x);
    
    const delta_val = Math.atan(Math.abs(c.pipeXZ[0].z - c.pipeXZ[1].z) / (dx_up || 0.001));
    const delta_prime_val = Math.atan(Math.abs(c.pipeXZ[1].z - c.pipeXZ[2].z) / (dx_down || 0.001));
    p.delta = deg(delta_val);
    p.delta_prime = deg(delta_prime_val);
    
    // intersection angle
    const phi_val = Math.abs(delta_val - delta_prime_val);
    
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
        WA += p.B * p.W * 1.5 * 1.8; // Soil surcharge cover weight
    }
    
    const x_CG = Math.abs(Cx);
    const z_CG = Math.abs(Cz);
    
    // JICA centroid coordinate copy-paste bug simulation
    let y_CG_stability;
    if (state.jicaAuditMode) {
        y_CG_stability = p.H_ab - z_CG;
    } else {
        y_CG_stability = p.B_yz / 2.0;
    }
    
    // --- 5. Thrust Force Calculations (Magnitude & Vectors) ---
    const W_val = 0.5 * (w + s) * p.l * Math.cos(delta_val);
    const W_prime_val = 0.5 * (w + s_prime) * p.l_prime * Math.cos(delta_prime_val);
    
    const W_vec = { x: W_val * Math.sin(delta_val), y: 0.0, z: -W_val * Math.cos(delta_val) };
    const W_prime_vec = {
        x: W_prime_val * Math.sin(delta_prime_val) * Math.cos(theta_val),
        y: -W_prime_val * Math.sin(delta_prime_val) * Math.sin(theta_val),
        z: -W_prime_val * Math.cos(delta_prime_val)
    };
    
    const P1_val = s * p.L * Math.sin(delta_val);
    const P1_prime_val = s_prime * p.L_prime * Math.sin(delta_prime_val);
    const P1_vec = { x: -P1_val * Math.cos(delta_val), y: 0.0, z: -P1_val * Math.sin(delta_val) };
    const P1_prime_vec = {
        x: -P1_prime_val * Math.cos(delta_prime_val) * Math.cos(theta_val),
        y: -P1_prime_val * Math.cos(delta_prime_val) * Math.sin(theta_val),
        z: -P1_prime_val * Math.sin(delta_prime_val)
    };
    
    const P2_val = (2 * p.f * (p.Q ** 2) / (g * Math.PI * (p.D ** 3))) * p.L;
    const P2_prime_val = (2 * p.f * (p.Q ** 2) / (g * Math.PI * (p.D ** 3))) * p.L_prime;
    const P2_vec = { x: P2_val * Math.cos(delta_val), y: 0.0, z: P2_val * Math.sin(delta_val) };
    const P2_prime_vec = {
        x: P2_prime_val * Math.cos(delta_prime_val) * Math.cos(theta_val),
        y: -P2_prime_val * Math.cos(delta_prime_val) * Math.sin(theta_val),
        z: P2_prime_val * Math.sin(delta_prime_val)
    };
    
    const Pv_val = 2 * (v_water ** 2) / g * A_pipe * Math.sin(phi_val / 2.0);
    const Ph_val = 2 * (v_water ** 2) / g * A_pipe * Math.sin(theta_val / 2.0);
    const Pv_vec = { x: -Pv_val * Math.sin(phi_val / 2.0), y: 0.0, z: Pv_val * Math.cos(phi_val / 2.0) };
    const Ph_vec = { x: Ph_val * Math.sin(theta_val / 2.0), y: Ph_val * Math.cos(theta_val / 2.0), z: 0.0 };
    
    const P3_val = p.He * Math.PI * p.D * p.t;
    const P3_prime_val = p.He_prime * Math.PI * p.D * p.t_prime;
    const P3_vec = { x: P3_val * Math.cos(delta_val), y: 0.0, z: P3_val * Math.sin(delta_val) };
    const P3_prime_vec = {
        x: P3_prime_val * Math.cos(delta_prime_val) * Math.cos(theta_val),
        y: -P3_prime_val * Math.cos(delta_prime_val) * Math.sin(theta_val),
        z: P3_prime_val * Math.sin(delta_prime_val)
    };
    
    const Prv_val = 2 * p.H * A_pipe * Math.sin(phi_val / 2.0);
    const Prh_val = 2 * p.H * A_pipe * Math.sin(theta_val / 2.0);
    const Prv_vec = { x: -Prv_val * Math.sin(phi_val / 2.0), y: 0.0, z: Prv_val * Math.cos(phi_val / 2.0) };
    const Prh_vec = { x: Prh_val * Math.sin(theta_val / 2.0), y: Prh_val * Math.cos(theta_val / 2.0), z: 0.0 };
    
    const P_vec = {
        x: W_vec.x + W_prime_vec.x + P1_vec.x + P1_prime_vec.x + P2_vec.x + P2_prime_vec.x + Pv_vec.x + Ph_vec.x + P3_vec.x + P3_prime_vec.x + Prv_vec.x + Prh_vec.x,
        y: W_vec.y + W_prime_vec.y + P1_vec.y + P1_prime_vec.y + P2_vec.y + P2_prime_vec.y + Pv_vec.y + Ph_vec.y + P3_vec.y + P3_prime_vec.y + Prv_vec.y + Prh_vec.y,
        z: W_vec.z + W_prime_vec.z + P1_vec.z + P1_prime_vec.z + P2_vec.z + P2_prime_vec.z + Pv_vec.z + Ph_vec.z + P3_vec.z + P3_prime_vec.z + Prv_vec.z + Prh_vec.z
    };
    
    // Friction of Expansion joint
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
        z: F_prime * Math.sin(delta_prime_val)
    };
    
    // Seismic
    const F_WA = p.Kh * WA;
    const F_p = p.Kh * ((w + s) * p.l / 2.0 + (w + s_prime) * p.l_prime / 2.0);
    
    state.results.forces = {
        w, s, s_prime, A_profile, V_concrete, WA, x_CG, z_CG, y_CG_stability, L_internal,
        W: W_vec, W_prime: W_prime_vec, P1: P1_vec, P1_prime: P1_prime_vec,
        P2: P2_vec, P2_prime: P2_prime_vec, Pv: Pv_vec, Ph: Ph_vec,
        P3: P3_vec, P3_prime: P3_prime_vec, Prv: Prv_vec, Prh: Prh_vec,
        F: F_vec, F_prime: F_prime_vec, P_vec, F_WA, F_p
    };
    
    // Case Combinations
    state.results.cases = [];
    const cases_temp = [
        { id: 1, name: 'Case-1', signF: 1.0, signF_prime: 1.0, eq: 'P+F+F\'' },
        { id: 2, name: 'Case-2', signF: 1.0, signF_prime: -1.0, eq: 'P+F-F\'' },
        { id: 3, name: 'Case-3', signF: -1.0, signF_prime: 1.0, eq: 'P-F+F\'' },
        { id: 4, name: 'Case-4', signF: -1.0, signF_prime: -1.0, eq: 'P-F-F\'' }
    ];
    
    // JICA bug simulates using profile area instead of B * W for bearing capacity base area
    let z_min = c.xzCoords.length > 0 ? c.xzCoords[0].z : 0.0;
    c.xzCoords.forEach(pt => { if (pt.z < z_min) z_min = pt.z; });
    const x_pipe_val = state.jicaAuditMode ? 3.000 : (c.pipeXZ && c.pipeXZ[1] ? c.pipeXZ[1].x : p.B / 2.0);
    const h_CG_val = state.jicaAuditMode ? 2.500 : (z_CG - z_min);
    const h_pipe_val = state.jicaAuditMode ? 3.000 : ((c.pipeXZ && c.pipeXZ[1] ? c.pipeXZ[1].z : p.H_ab / 2.0) - z_min);
    const A_base = state.jicaAuditMode ? A_profile : (p.B * p.W);
    
    cases_temp.forEach(c => {
        const Tx = c.signF * F_vec.x + c.signF_prime * F_prime_vec.x;
        const Ty = c.signF * F_vec.y + c.signF_prime * F_prime_vec.y;
        const Tz = c.signF * F_vec.z + c.signF_prime * F_prime_vec.z;
        
        const Rx = P_vec.x + Tx;
        const Ry = P_vec.y + Ty;
        const Rz = P_vec.z + Tz;
        
        // Plane 1: X-Z (Flow direction)
        [-1.0, 1.0].forEach(eqSign => {
            const totalV = -WA + Rz;
            const x_pipe = x_pipe_val;
            const momV = -WA * x_CG + Rz * x_pipe;
            
            const seismicTotal = eqSign * (F_WA + F_p);
            const totalH = seismicTotal + Rx;
            const momH = seismicTotal * h_CG_val + Rx * h_pipe_val;
            
            // Mitigation calculations
            const A_s = (Math.PI * Math.pow(p.d_anchor || 25, 2)) / 4.0; // mm2
            const T_allow = p.mitigation_active ? ((p.n_anchors || 0) * A_s * (p.fy_anchor || 415) * 1e-4 * 0.6) : 0.0;
            const V_allow_anchors = p.mitigation_active ? ((p.n_anchors || 0) * A_s * (p.fy_anchor || 415) * 1e-4 * 0.4) : 0.0;
            const R_key_val = p.mitigation_active ? (15.0 * (p.h_key || 0) * p.W) : 0.0;
            
            const totalV_clamped = totalV - T_allow; // tension pulls down, acts in negative z direction
            
            // Anchor location for moment: opposite of sliding/overturning direction
            const x_anchor = totalH >= 0 ? 1.0 : (p.B - 1.0);
            const momV_mitigation = p.mitigation_active ? (-T_allow * x_anchor) : 0.0;
            const momV_clamped = momV + momV_mitigation;
            
            const sumM = momV_clamped - momH;
            const x_res = sumM / totalV_clamped;
            const B_x = p.B;
            const e = Math.abs(B_x / 2.0 - x_res);
            
            const B_4 = B_x / 4.0;
            const eccentricityPass = e < B_4;
            
            // JICA Safety against sliding (seismic limit is 1.2)
            const d_embed = Math.max(0.0, (state.coordinates.groundCoords[state.coordinates.groundCoords.length - 1].z - z_min));
            const phi_rad = rad(p.soil_friction_angle || 30.0);
            const K_p = (1.0 + Math.sin(phi_rad)) / (1.0 - Math.sin(phi_rad));
            const P_p = p.buriedCondition ? (0.5 * K_p * (p.soil_unit_weight || 1.8) * (d_embed ** 2) * p.W) : 0.0;
            const R_cohesion = p.buriedCondition ? ((p.soil_cohesion || 1.5) * A_base) : 0.0;
            
            const Fs = (Math.abs(totalV_clamped) * p.lambda + R_key_val + V_allow_anchors + P_p + R_cohesion) / Math.abs(totalH);
            const slidingPass = Fs >= 1.2;
            
            // JICA Safety against overturning (resisting moment / overturning moment >= 1.2)
            let M_R = 0;
            let M_O = Math.abs(momH);
            let M_R_anchors = p.mitigation_active ? (T_allow * (B_x - 1.0)) : 0.0;
            if (totalH >= 0) {
                // Rotation about downstream toe (x = B)
                M_R = WA * (B_x - x_CG) - Rz * (B_x - x_pipe);
            } else {
                // Rotation about upstream toe (x = 0)
                M_R = WA * x_CG - Rz * x_pipe;
            }
            const Fot = M_O > 0.001 ? Math.abs((M_R + M_R_anchors) / M_O) : 999.0;
            const overturningFSPass = Fot >= 1.2;
            
            const eqLabelVal = eqSign < 0 ? '-x EQ' : '+x EQ';
            const allowedBearing = eqLabelVal.includes('EQ') ? (p.qa * (p.bearing_increase_factor || 1.50)) : p.qa;
            
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
                limit_e: B_4,
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
                
                // detailed components for Step 4 reporting
                momV: momV_clamped, momH, sumM, x_res, Rx, Ry, Rz, Tx, Ty, Tz
            });
        });
        
        // Plane 2: Y-Z (Transverse direction)
        [-1.0, 1.0].forEach(eqSign => {
            const totalV = -WA + Rz;
            const y_pipe = p.B_yz / 2.0;
            const momV = -WA * y_CG_stability + Rz * y_pipe;
            
            const seismicTotal = eqSign * (F_WA + F_p);
            const totalH = seismicTotal + Ry;
            const momH = seismicTotal * h_CG_val + Ry * h_pipe_val;
            
            // Mitigation calculations
            const A_s = (Math.PI * Math.pow(p.d_anchor || 25, 2)) / 4.0; // mm2
            const T_allow = p.mitigation_active ? ((p.n_anchors || 0) * A_s * (p.fy_anchor || 415) * 1e-4 * 0.6) : 0.0;
            const V_allow_anchors = p.mitigation_active ? ((p.n_anchors || 0) * A_s * (p.fy_anchor || 415) * 1e-4 * 0.4) : 0.0;
            const R_key_val = p.mitigation_active ? (15.0 * (p.h_key || 0) * p.B) : 0.0;
            
            const totalV_clamped = totalV - T_allow; // tension pulls down
            
            // Anchor location for moment in Y-Z
            const y_anchor = totalH >= 0 ? 0.5 : (p.B_yz - 0.5);
            const momV_mitigation = p.mitigation_active ? (-T_allow * y_anchor) : 0.0;
            const momV_clamped = momV + momV_mitigation;
            
            const sumM = momV_clamped - momH;
            const y_res = sumM / totalV_clamped;
            const B_y = p.B_yz;
            const e = Math.abs(B_y / 2.0 - y_res);
            
            const B_4 = B_y / 4.0;
            const eccentricityPass = e < B_4;
            
            const d_embed = Math.max(0.0, (state.coordinates.groundCoords[state.coordinates.groundCoords.length - 1].z - z_min));
            const phi_rad = rad(p.soil_friction_angle || 30.0);
            const K_p = (1.0 + Math.sin(phi_rad)) / (1.0 - Math.sin(phi_rad));
            const P_p = p.buriedCondition ? (0.5 * K_p * (p.soil_unit_weight || 1.8) * (d_embed ** 2) * p.B) : 0.0;
            const R_cohesion = p.buriedCondition ? ((p.soil_cohesion || 1.5) * A_base) : 0.0;
            
            const Fs = (Math.abs(totalV_clamped) * p.lambda + R_key_val + V_allow_anchors + P_p + R_cohesion) / Math.abs(totalH);
            const slidingPass = Fs >= 1.2;
            
            // JICA Safety against overturning in Transverse direction
            let M_R = 0;
            let M_O = Math.abs(momH);
            let M_R_anchors = p.mitigation_active ? (T_allow * (B_y - 0.5)) : 0.0;
            if (totalH >= 0) {
                // Rotation about right toe (y = B_yz)
                M_R = WA * (B_y - y_CG_stability) - Rz * (B_y - y_pipe);
            } else {
                // Rotation about left toe (y = 0)
                M_R = WA * y_CG_stability - Rz * y_pipe;
            }
            const Fot = M_O > 0.001 ? Math.abs((M_R + M_R_anchors) / M_O) : 999.0;
            const overturningFSPass = Fot >= 1.2;
            
            const eqLabelVal = eqSign < 0 ? '-y EQ' : '+y EQ';
            const allowedBearing = eqLabelVal.includes('EQ') ? (p.qa * (p.bearing_increase_factor || 1.50)) : p.qa;
            
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
                limit_e: B_4,
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
                
                momV: momV_clamped, momH, sumM, y_res, Rx, Ry, Rz, Tx, Ty, Tz
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
    const w = 450;
    const h = 280;
    
    // Width and height dimensions of geometry
    const B_dim = isXZ ? p.B : p.B_yz;
    const H_dim = p.H_ab;
    
    const padX = 50;
    const padY = 65;
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
        const headLength = 7;
        const arrowX1 = x2 - headLength * Math.cos(angle - Math.PI / 6);
        const arrowY1 = y2 - headLength * Math.sin(angle - Math.PI / 6);
        const arrowX2 = x2 - headLength * Math.cos(angle + Math.PI / 6);
        const arrowY2 = y2 - headLength * Math.sin(angle + Math.PI / 6);
        return `
            <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="1.8" />
            <polygon points="${x2},${y2} ${arrowX1},${arrowY1} ${arrowX2},${arrowY2}" fill="${color}" />
            <text x="${x2 + labelOffset.x}" y="${y2 + labelOffset.y}" fill="${color}" font-size="8.5" font-weight="bold" font-family="'Inter', sans-serif">${label}</text>
        `;
    };

    // Draw dimension lines
    const drawDim = (x1, y1, x2, y2, label, color = '#64748b') => {
        const dx = x2 - x1;
        const dy = y2 - y1;
        const len = Math.sqrt(dx*dx + dy*dy) || 1.0;
        const nx = -dy / len;
        const ny = dx / len;
        
        // tick lines
        const tickLength = 4;
        const tick1 = `M${x1 - nx * tickLength},${y1 - ny * tickLength} L${x1 + nx * tickLength},${y1 + ny * tickLength}`;
        const tick2 = `M${x2 - nx * tickLength},${y2 - ny * tickLength} L${x2 + nx * tickLength},${y2 + ny * tickLength}`;
        
        return `
            <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="0.7" stroke-dasharray="1.5 1.5" />
            <path d="${tick1} ${tick2}" stroke="${color}" stroke-width="0.8" />
            <text x="${(x1 + x2)/2.0}" y="${(y1 + y2)/2.0 - 4}" text-anchor="middle" fill="${color}" font-size="8" font-family="monospace">${label}</text>
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
            <line x1="${anchorX}" y1="${offsetY}" x2="${anchorX}" y2="${offsetY + 25}" stroke="#b91c1c" stroke-width="2.5" stroke-dasharray="3 1.5" />
            <circle cx="${anchorX}" cy="${offsetY + 25}" r="3" fill="#b91c1c" />
            ${drawArrow(anchorX, offsetY + 25, anchorX, offsetY, '#b91c1c', 'T_anchors', {x: 6, y: -4})}
        `;
    }

    // Accumulate elements
    let svgBody = `
        <!-- Concrete hatch background -->
        <polygon points="${blockPointsStr}" fill="#f8fafc" stroke="#0f172a" stroke-width="1.8" />
        ${keyHtml}
        
        <!-- Ground Line -->
        <line x1="${offsetX - 25}" y1="${offsetY}" x2="${offsetX + B_dim * scale + 25}" y2="${offsetY}" stroke="#475569" stroke-width="2" />
    `;
    
    if (isXZ) {
        const pX1 = offsetX + c.pipeXZ[0].x * scale;
        const pY1 = offsetY - (c.pipeXZ[0].z - z_min_val) * scale;
        const pX2 = offsetX + c.pipeXZ[1].x * scale;
        const pY2 = offsetY - (c.pipeXZ[1].z - z_min_val) * scale;
        const pX3 = offsetX + c.pipeXZ[2].x * scale;
        const pY3 = offsetY - (c.pipeXZ[2].z - z_min_val) * scale;
        
        svgBody += `
            <polyline points="${pX1},${pY1} ${pX2},${pY2} ${pX3},${pY3}" fill="none" stroke="#64748b" stroke-width="12" stroke-opacity="0.25" stroke-linecap="round" />
            <polyline points="${pX1},${pY1} ${pX2},${pY2} ${pX3},${pY3}" fill="none" stroke="#334155" stroke-width="1" stroke-dasharray="4 2" />
        `;
    } else {
        const pipeY_svg = offsetX + c.pipeCenterYZ.y * scale;
        const pipeZ_svg = offsetY - (c.pipeCenterYZ.z - z_min_val) * scale;
        const radius_svg = (p.D / 2.0) * scale;
        svgBody += `
            <circle cx="${pipeY_svg}" cy="${pipeZ_svg}" r="${radius_svg}" fill="#64748b" fill-opacity="0.25" stroke="#334155" stroke-width="1.5" />
            <line x1="${pipeY_svg - radius_svg - 4}" y1="${pipeZ_svg}" x2="${pipeY_svg + radius_svg + 4}" y2="${pipeZ_svg}" stroke="#334155" stroke-width="0.8" stroke-dasharray="2 2" />
            <line x1="${pipeY_svg}" y1="${pipeZ_svg - radius_svg - 4}" x2="${pipeY_svg}" y2="${pipeZ_svg + radius_svg + 4}" stroke="#334155" stroke-width="0.8" stroke-dasharray="2 2" />
        `;
    }
    
    // Add Force Arrows
    // 1. Concrete Dead Weight (WA)
    svgBody += drawArrow(cg_svg_x, cg_svg_y, cg_svg_x, cg_svg_y + 35, '#2563eb', `WA = ${f.WA.toFixed(1)}t`, {x: -18, y: 12});
    
    // 2. Block Seismic Inertia (F_WA)
    const f_wa_val = isXZ ? f.F_WA : (p.Kh * f.WA);
    if (Math.abs(f_wa_val) > 0.01) {
        svgBody += drawArrow(cg_svg_x, cg_svg_y, cg_svg_x + eqDir * 35, cg_svg_y, '#d97706', `F_seismic = ${Math.abs(f_wa_val).toFixed(1)}t`, {x: eqDir > 0 ? 6 : -85, y: -4});
    }
    
    // 3. Pipe thrust horizontal Rx or Ry
    const H_force_val = isXZ ? cs.Rx : cs.Ry;
    const H_force_lbl = isXZ ? `Rx = ${H_force_val.toFixed(1)}t` : `Ry = ${H_force_val.toFixed(1)}t`;
    if (Math.abs(H_force_val) > 0.01) {
        const startX = pipe_svg_x - (H_force_val >= 0 ? 35 : -35);
        svgBody += drawArrow(startX, pipe_svg_y, pipe_svg_x, pipe_svg_y, '#dc2626', H_force_lbl, {x: H_force_val >= 0 ? -60 : 5, y: -4});
    }
    
    // 4. Pipe vertical force Rz
    if (Math.abs(cs.Rz) > 0.01) {
        const startY = pipe_svg_y - (cs.Rz >= 0 ? -30 : 30);
        svgBody += drawArrow(pipe_svg_x, startY, pipe_svg_x, pipe_svg_y, '#dc2626', `Rz = ${cs.Rz.toFixed(1)}t`, {x: 6, y: cs.Rz >= 0 ? 12 : -4});
    }
    
    // 5. Resultant base reactions
    // Vertical reaction V (Draw label at the bottom of the arrow to prevent collision)
    svgBody += drawArrow(x_res_svg, offsetY + 25, x_res_svg, offsetY, '#16a34a', `V = ${Math.abs(cs.totalV).toFixed(1)}t`, {x: 6, y: 25});
    
    // Friction sliding capacity F_friction = V * lambda
    const F_fric_val = Math.abs(cs.totalV) * p.lambda;
    const slidingDir = cs.totalH >= 0 ? -1.0 : 1.0;
    const fricLabel = `F_fric = ${F_fric_val.toFixed(1)}t`;
    // Draw label at the tail of the horizontal arrow to prevent collision
    svgBody += drawArrow(x_res_svg - slidingDir * 35, offsetY, x_res_svg, offsetY, '#16a34a', fricLabel, {x: slidingDir > 0 ? -95 : 20, y: -6});
    
    // Anchors
    svgBody += anchorsHtml;
    
    // CG point circle marker
    svgBody += `
        <circle cx="${cg_svg_x}" cy="${cg_svg_y}" r="3.5" fill="#000000" />
        <circle cx="${cg_svg_x}" cy="${cg_svg_y}" r="1.5" fill="#ffffff" />
        <text x="${cg_svg_x + 5}" y="${cg_svg_y + 3}" fill="#000000" font-size="8" font-weight="bold">CG</text>
    `;
    
    // Dimensions
    // Width dimension
    svgBody += drawDim(offsetX, offsetY + 32, offsetX + B_dim * scale, offsetY + 32, `B = ${B_dim.toFixed(2)}m`);
    // Height dimension
    svgBody += drawDim(offsetX - 12, offsetY - H_dim * scale, offsetX - 12, offsetY, `H = ${H_dim.toFixed(2)}m`);
    // Lever arm y_CG or x_CG
    svgBody += drawDim(offsetX, offsetY + 42, cg_svg_x, offsetY + 42, `CG_arm = ${cg_x.toFixed(2)}m`, '#2563eb');
    // Resultant location e
    svgBody += drawDim(offsetX + B_dim/2.0 * scale, offsetY + 52, x_res_svg, offsetY + 52, `e = ${cs.e.toFixed(2)}m`, '#16a34a');
    
    return `
        <svg width="100%" height="100%" viewBox="0 0 ${w} ${h}" style="background-color: #ffffff;">
            <defs>
                <style>
                    text { font-family: 'Inter', -apple-system, sans-serif; }
                </style>
            </defs>
            <text x="15" y="22" fill="#0f172a" font-size="11" font-weight="700" letter-spacing="0.5">${plane} FREE BODY DIAGRAM (FBD)</text>
            <text x="15" y="34" fill="#64748b" font-size="8">Direction of Case: ${cs.caseName} (${cs.eqLabel})</text>
            ${svgBody}
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
    
    const delta_val = state.coordinates.pipeXZ && state.coordinates.pipeXZ[1] ?
        Math.atan2(Math.abs(state.coordinates.pipeXZ[1].z - state.coordinates.pipeXZ[0].z), Math.abs(state.coordinates.pipeXZ[1].x - state.coordinates.pipeXZ[0].x)) : 0.0;
    const delta_prime_val = state.coordinates.pipeXZ && state.coordinates.pipeXZ[2] ?
        Math.atan2(Math.abs(state.coordinates.pipeXZ[2].z - state.coordinates.pipeXZ[1].z), Math.abs(state.coordinates.pipeXZ[2].x - state.coordinates.pipeXZ[1].x)) : 0.0;
        
    let dot_prod = (state.coordinates.pipeXY[1].x - state.coordinates.pipeXY[0].x) * (state.coordinates.pipeXY[2].x - state.coordinates.pipeXY[1].x) +
                   (state.coordinates.pipeXY[1].y - state.coordinates.pipeXY[0].y) * (state.coordinates.pipeXY[2].y - state.coordinates.pipeXY[1].y);
    let mag1 = Math.sqrt((state.coordinates.pipeXY[1].x - state.coordinates.pipeXY[0].x)**2 + (state.coordinates.pipeXY[1].y - state.coordinates.pipeXY[0].y)**2);
    let mag2 = Math.sqrt((state.coordinates.pipeXY[2].x - state.coordinates.pipeXY[1].x)**2 + (state.coordinates.pipeXY[2].y - state.coordinates.pipeXY[1].y)**2);
    let theta_val = (mag1 * mag2 > 0) ? Math.acos(Math.max(-1.0, Math.min(1.0, dot_prod / (mag1 * mag2)))) : 0.0;
    let phi_val = Math.abs(delta_val - delta_prime_val);
    
    const W_val = 0.5 * (f.w + f.s) * p.l * Math.cos(delta_val);
    const W_prime_val = 0.5 * (f.w + f.s_prime) * p.l_prime * Math.cos(delta_prime_val);
    const P1_val = f.s * p.L * Math.sin(delta_val);
    const P1_prime_val = f.s_prime * p.L_prime * Math.sin(delta_prime_val);
    const g = 9.80665;
    const P2_val = (2 * p.f * (p.Q ** 2) / (g * Math.PI * (p.D ** 3))) * p.L;
    const P2_prime_val = (2 * p.f * (p.Q ** 2) / (g * Math.PI * (p.D ** 3))) * p.L_prime;
    const A_pipe = Math.PI * p.D * p.D / 4.0;
    const v_water = A_pipe > 0 ? p.Q / A_pipe : 0.0;
    const Pv_val = 2 * (v_water ** 2) / g * A_pipe * Math.sin(phi_val / 2.0);
    const Ph_val = 2 * (v_water ** 2) / g * A_pipe * Math.sin(theta_val / 2.0);
    const P3_val = p.He * Math.PI * p.D * p.t;
    const P3_prime_val = p.He_prime * Math.PI * p.D * p.t_prime;
    const Prv_val = 2 * p.H * A_pipe * Math.sin(phi_val / 2.0);
    const Prh_val = 2 * p.H * A_pipe * Math.sin(theta_val / 2.0);
    const Prv_vec = { x: -Prv_val * Math.sin(phi_val / 2.0), y: 0.0, z: Prv_val * Math.cos(phi_val / 2.0) };
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
                        Discharge Q = ${p.Q.toFixed(2)} m³/s<br>
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
                        Discharge Q = ${p.Q.toFixed(2)} m³/s<br>
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
                            <td class="num">&ge; 1.2</td>
                            <td style="color:${c.slidingPass ? 'var(--accent-green)':'var(--accent-red)'}; font-weight:bold;">${c.slidingPass ? 'PASS':'FAIL'}</td>
                        </tr>
                        <tr>
                            <td><strong>Safety against Overturning (Fo)</strong></td>
                            <td>Fo = &Sigma; M_R / &Sigma; M_O</td>
                            <td class="num">${c.Fot.toFixed(2)}</td>
                            <td class="num">&ge; 1.2</td>
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
    
    // Set auto-generated cross-section concrete geometry
    c.yzCoords = [
        { y: 0.0, z: 0.0 },
        { y: W_width, z: 0.0 },
        { y: W_width, z: H_height },
        { y: 0.0, z: H_height }
    ];
    
    // Synchronize parameters
    p.B_yz = W_width;
    p.W = W_width;
    p.H_ab = H_height;
    
    // Auto-center pipe horizontally and match bend IP elevation vertically
    if (c.pipeXZ && c.pipeXZ[1]) {
        c.pipeCenterYZ.y = W_width / 2.0;
        c.pipeCenterYZ.z = c.pipeXZ[1].z;
    }
    
    // Update YZ input fields in Step 3 so they match calculated values
    const pipeCenterYInput = document.getElementById('pipe-center-y');
    if (pipeCenterYInput) pipeCenterYInput.value = c.pipeCenterYZ.y.toFixed(3);
    const pipeCenterZInput = document.getElementById('pipe-center-z');
    if (pipeCenterZInput) pipeCenterZInput.value = c.pipeCenterYZ.z.toFixed(3);
    
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
    const views = ['plan', 'profile', 'section', 'all'];
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
    
    if (planW) planW.style.display = (state.activeBlueprintView === 'plan' || state.activeBlueprintView === 'all') ? 'flex' : 'none';
    if (profileW) profileW.style.display = (state.activeBlueprintView === 'profile' || state.activeBlueprintView === 'all') ? 'flex' : 'none';
    if (sectionW) sectionW.style.display = (state.activeBlueprintView === 'section' || state.activeBlueprintView === 'all') ? 'flex' : 'none';
    
    // Remove divider borders if rendering in single-view mode
    if (state.activeBlueprintView !== 'all') {
        if (planW) planW.style.borderBottom = 'none';
        if (profileW) profileW.style.borderBottom = 'none';
    } else {
        if (planW) planW.style.borderBottom = '1px solid rgba(255,255,255,0.05)';
        if (profileW) profileW.style.borderBottom = '1px solid rgba(255,255,255,0.05)';
    }
}
window.updateBlueprintViewToggles = updateBlueprintViewToggles;

function drawPlanSVG(L_cut, L1) {
    const viewport = document.getElementById('plan-svg-viewport');
    if (!viewport) return;
    
    const rect = viewport.getBoundingClientRect();
    const viewWidth = rect.width || 450;
    const viewHeight = rect.height || 220;
    
    const c = state.coordinates;
    const p = state.params;
    
    const xs = [...c.xyCoords.map(pt => pt.x), ...c.pipeXY.map(pt => pt.x)];
    const ys = [...c.xyCoords.map(pt => pt.y), ...c.pipeXY.map(pt => pt.y)];
    
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    
    const w_geom = Math.max(1.0, maxX - minX);
    const h_geom = Math.max(1.0, maxY - minY);
    
    const pad = 30;
    const scaleX = (viewWidth - 2 * pad) / w_geom;
    const scaleY = (viewHeight - 2 * pad) / h_geom;
    const scale = Math.min(scaleX, scaleY);
    
    const offsetX = (viewWidth - w_geom * scale) / 2.0 - minX * scale;
    const offsetY = (viewHeight - h_geom * scale) / 2.0 + maxY * scale;
    
    const blockPoints = c.xyCoords.map(pt => `${offsetX + pt.x * scale},${offsetY - pt.y * scale}`).join(' ');
    const pipePoints = c.pipeXY.map(pt => `${offsetX + pt.x * scale},${offsetY - pt.y * scale}`).join(' ');
    const cutPoints = c.cutLineCoords.map(pt => `${offsetX + pt.x * scale},${offsetY - pt.y * scale}`).join(' ');
    
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
            
            <!-- Cut Line along custom path (dashed orange indicator) -->
            <polyline points="${cutPoints}" fill="none" stroke="var(--accent-orange)" stroke-width="2.5" stroke-dasharray="8 4" />
            
            <text x="20" y="30" fill="var(--text-secondary)" font-size="11" font-weight="600" letter-spacing="1">PLAN VIEW (X-Y plane)</text>
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
    
    const xs = [...c.xzCoords.map(pt => pt.x), ...c.pipeXZ.map(pt => pt.x), ...c.groundCoords.map(pt => pt.x)];
    const zs = [...c.xzCoords.map(pt => pt.z), ...c.pipeXZ.map(pt => pt.z), ...c.groundCoords.map(pt => pt.z)];
    
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minZ = Math.min(...zs);
    const maxZ = Math.max(...zs);
    
    const w_geom = Math.max(1.0, maxX - minX);
    const h_geom = Math.max(1.0, maxZ - minZ);
    
    const pad = 30;
    const scaleX = (viewWidth - 2 * pad) / w_geom;
    const scaleY = (viewHeight - 2 * pad) / h_geom;
    const scale = Math.min(scaleX, scaleY);
    
    const offsetX = (viewWidth - w_geom * scale) / 2.0 - minX * scale;
    const offsetY = (viewHeight - h_geom * scale) / 2.0 + maxZ * scale;
    
    const blockPoints = c.xzCoords.map(pt => `${offsetX + pt.x * scale},${offsetY - pt.z * scale}`).join(' ');
    
    // Pipe points on unfolded alignment
    const pX1 = offsetX + c.pipeXZ[0].x * scale;
    const pY1 = offsetY - c.pipeXZ[0].z * scale;
    const pX2 = offsetX + c.pipeXZ[1].x * scale;
    const pY2 = offsetY - c.pipeXZ[1].z * scale;
    const pX3 = offsetX + c.pipeXZ[2].x * scale;
    const pY3 = offsetY - c.pipeXZ[2].z * scale;
    
    // Ground points for rendering
    const groundPoints = c.groundCoords.map(pt => `${offsetX + pt.x * scale},${offsetY - pt.z * scale}`).join(' ');
    const firstX = offsetX + c.groundCoords[0].x * scale;
    const lastX = offsetX + c.groundCoords[c.groundCoords.length - 1].x * scale;
    const bottomY = viewHeight - 10;
    
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
            
            <text x="20" y="30" fill="var(--text-secondary)" font-size="11" font-weight="600" letter-spacing="1">LONGITUDINAL PROFILE (X-Z plane)</text>
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
    
    const ys = [...c.yzCoords.map(pt => pt.y), c.pipeCenterYZ.y];
    const zs = [...c.yzCoords.map(pt => pt.z), c.pipeCenterYZ.z];
    
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    const minZ = Math.min(...zs);
    const maxZ = Math.max(...zs);
    
    const w_geom = Math.max(1.0, maxY - minY);
    const h_geom = Math.max(1.0, maxZ - minZ);
    
    const pad = 30;
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
    
    // Find ground level at the block centerline (x = B/2) from longitudinal ground profile coordinates
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
            
            <text x="20" y="30" fill="var(--text-secondary)" font-size="11" font-weight="600" letter-spacing="1">CROSS SECTION (Y-Z plane)</text>
        </svg>
    `;
}

function syncParamsFromCoords() {
    const c = state.coordinates;
    const p = state.params;
    
    let maxH = 0;
    c.xzCoords.forEach(pt => { if (pt.z > maxH) maxH = pt.z; });
    p.H_ab = maxH;
    
    let maxW_yz = 0;
    c.yzCoords.forEach(pt => { if (pt.y > maxW_yz) maxW_yz = pt.y; });
    p.B_yz = maxW_yz;
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
                <td class="num" style="color: ${c.bearingPass ? 'var(--text-secondary)' : 'var(--accent-red)'}">${fNum(c.sigma, 2)} <small style="color:var(--text-muted)">(&lt;${fNum(c.limit_qa, 1)})</small></td>
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
    
    const updateRow = (id, valText, pass) => {
        const row = document.getElementById(id);
        if (!row) return;
        const indicator = row.querySelector('.chk-indicator');
        const status = row.querySelector('.chk-status');
        const valPlaceholder = row.querySelector('.val');
        
        if (valPlaceholder) valPlaceholder.innerText = valText;
        
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
    
    updateRow('chk-xz-sliding', fNum(xz_minFs, 2), xzCases.every(c => c.slidingPass));
    updateRow('chk-xz-overturning-fs', fNum(xz_minFot, 2), xzCases.every(c => c.overturningFSPass));
    updateRow('chk-xz-eccentricity', fNum(xz_maxE, 3) + 'm', xzCases.every(c => c.eccentricityPass));
    updateRow('chk-xz-bearing', fNum(xz_maxSigma, 2) + ' t/m²', xzCases.every(c => c.bearingPass));
    
    updateRow('chk-yz-sliding', fNum(yz_minFs, 2), yzCases.every(c => c.slidingPass));
    updateRow('chk-yz-overturning-fs', fNum(yz_minFot, 2), yzCases.every(c => c.overturningFSPass));
    updateRow('chk-yz-eccentricity', fNum(yz_maxE, 3) + 'm', yzCases.every(c => c.eccentricityPass));
    updateRow('chk-yz-bearing', fNum(yz_maxSigma, 2) + ' t/m²', yzCases.every(c => c.bearingPass));
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

// Render dynamic animated simulator
function renderSimulator() {
    const simViewport = document.getElementById('sim-viewport');
    if (!simViewport) return;
    
    let worstSliding = Infinity;
    let worstEcc = 0;
    let worstBearing = 0;
    let worstFot = Infinity;
    
    state.results.cases.forEach(c => {
        if (c.Fs < worstSliding) worstSliding = c.Fs;
        if (c.e > worstEcc) worstEcc = c.e;
        if (c.sigma > worstBearing) worstBearing = c.sigma;
        if (c.Fot < worstFot) worstFot = c.Fot;
    });
    
    const limit_ex = state.params.B / 4.0;
    const isSlidingFail = worstSliding < 1.2;
    const isOverturningFail = worstEcc > limit_ex || worstFot < 1.2;
    const isBearingFail = state.results.cases.some(c => !c.bearingPass);
    
    let animClass = 'anim-success';
    let failOverlayStyle = 'border-color: var(--accent-green);';
    
    if (isSlidingFail) {
        animClass = 'anim-sliding-fail';
        failOverlayStyle = 'border-color: var(--accent-red); box-shadow: 0 0 20px rgba(255,23,68,0.2)';
    } else if (isOverturningFail) {
        animClass = 'anim-overturning-fail';
        failOverlayStyle = 'border-color: var(--accent-red); box-shadow: 0 0 20px rgba(255,23,68,0.2)';
    } else if (isBearingFail) {
        animClass = 'anim-bearing-fail';
        failOverlayStyle = 'border-color: var(--accent-red); box-shadow: 0 0 20px rgba(255,23,68,0.2)';
    }
    
    document.getElementById('failure-animation-box').setAttribute('style', failOverlayStyle);
    
    const scale = 30;
    const offsetX = 80;
    const offsetY = 250;
    
    const c = state.coordinates;
    const blockPoints = c.xzCoords.map(pt => `${offsetX + pt.x * scale},${offsetY - pt.z * scale}`).join(' ');
    const f = state.results.forces;
    const cgPixel = { x: offsetX + f.x_CG * scale, y: offsetY - f.z_CG * scale };
    
    let simContent = '';
    
    if (state.simPlane === 'xz') {
        document.getElementById('sim-mode-text').innerText = 'X-Z Profile Plane (Flow plane simulation)';
        const cgLabel = document.getElementById('sim-cg-label');
        if (cgLabel) cgLabel.innerText = `CG: [X: ${f.x_CG.toFixed(3)}m, Z: ${f.z_CG.toFixed(3)}m]`;
        simContent = `
            <svg width="100%" height="100%">
                ${state.params.buriedCondition ? `
                    <rect x="20" y="${offsetY - 6.5 * scale}" width="380" height="${1.5 * scale}" fill="rgba(255, 145, 0, 0.08)" stroke="rgba(255, 145, 0, 0.15)"/>
                ` : ''}

                <g class="${animClass}">
                    <polygon points="${blockPoints}" fill="rgba(43, 58, 92, 0.5)" stroke="${animClass === 'anim-success' ? 'var(--accent-green)' : 'var(--accent-red)'}" stroke-width="2.5" />
                    
                    <line x1="20" y1="${offsetY - 3.0 * scale}" x2="380" y2="${offsetY - 3.0 * scale}" 
                        stroke="rgba(0, 242, 254, 0.15)" stroke-width="${scale * state.params.D}" stroke-linecap="round" />
                    <line x1="20" y1="${offsetY - 3.0 * scale}" x2="380" y2="${offsetY - 3.0 * scale}" 
                        stroke="var(--accent-cyan)" stroke-width="2" stroke-dasharray="5 5" />
                    
                    <circle cx="${cgPixel.x}" cy="${cgPixel.y}" r="5" fill="var(--accent-orange)" />
                    <line x1="${cgPixel.x}" y1="${cgPixel.y}" x2="${cgPixel.x + 35}" y2="${cgPixel.y + 40}" stroke="var(--accent-red)" stroke-width="2" marker-end="url(#arrow)" />
                </g>
                <line x1="10" y1="${offsetY}" x2="420" y2="${offsetY}" stroke="#475569" stroke-width="3" />
                
                <defs>
                    <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                      <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--accent-red)" />
                    </marker>
                </defs>
            </svg>
        `;
    } else {
        document.getElementById('sim-mode-text').innerText = 'Y-Z Section Plane (Lateral plane simulation)';
        const cgLabel = document.getElementById('sim-cg-label');
        if (cgLabel) cgLabel.innerText = `CG: [Y: ${f.y_CG_stability.toFixed(3)}m, Z: ${f.z_CG.toFixed(3)}m]`;
        const widthYZ = state.params.B_yz * scale;
        
        simContent = `
            <svg width="100%" height="100%">
                <g class="${animClass}">
                    <rect x="${(380 - widthYZ)/2}" y="${offsetY - state.params.H_ab * scale}" width="${widthYZ}" height="${state.params.H_ab * scale}" 
                        fill="rgba(43, 58, 92, 0.5)" stroke="${animClass === 'anim-success' ? 'var(--accent-green)' : 'var(--accent-red)'}" stroke-width="2.5" />
                    <circle cx="190" cy="${offsetY - 3.0 * scale}" r="${scale * state.params.D / 2.0}" 
                        fill="rgba(0, 242, 254, 0.1)" stroke="var(--accent-cyan)" stroke-width="2" />
                </g>
                <line x1="10" y1="${offsetY}" x2="380" y2="${offsetY}" stroke="#475569" stroke-width="3" />
            </svg>
        `;
    }
    simViewport.innerHTML = simContent;
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
    const views = ['plan', 'profile', 'section', 'all'];
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
    
    const delta_val = state.coordinates.pipeXZ && state.coordinates.pipeXZ[1] ?
        Math.atan2(Math.abs(state.coordinates.pipeXZ[1].z - state.coordinates.pipeXZ[0].z), Math.abs(state.coordinates.pipeXZ[1].x - state.coordinates.pipeXZ[0].x)) : 0.0;
    const delta_prime_val = state.coordinates.pipeXZ && state.coordinates.pipeXZ[2] ?
        Math.atan2(Math.abs(state.coordinates.pipeXZ[2].z - state.coordinates.pipeXZ[1].z), Math.abs(state.coordinates.pipeXZ[2].x - state.coordinates.pipeXZ[1].x)) : 0.0;
        
    let dot_prod = (state.coordinates.pipeXY[1].x - state.coordinates.pipeXY[0].x) * (state.coordinates.pipeXY[2].x - state.coordinates.pipeXY[1].x) +
                   (state.coordinates.pipeXY[1].y - state.coordinates.pipeXY[0].y) * (state.coordinates.pipeXY[2].y - state.coordinates.pipeXY[1].y);
    let mag1 = Math.sqrt((state.coordinates.pipeXY[1].x - state.coordinates.pipeXY[0].x)**2 + (state.coordinates.pipeXY[1].y - state.coordinates.pipeXY[0].y)**2);
    let mag2 = Math.sqrt((state.coordinates.pipeXY[2].x - state.coordinates.pipeXY[1].x)**2 + (state.coordinates.pipeXY[2].y - state.coordinates.pipeXY[1].y)**2);
    let theta_val = (mag1 * mag2 > 0) ? Math.acos(Math.max(-1.0, Math.min(1.0, dot_prod / (mag1 * mag2)))) : 0.0;
    let phi_val = Math.abs(delta_val - delta_prime_val);
    
    // Core parameters
    const g = 9.80665; // acceleration of gravity
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
    const P2_val = (g * Math.PI * (p.D ** 3)) > 0 ? (2 * p.f * (p.Q ** 2) / (g * Math.PI * (p.D ** 3))) * p.L : 0;
    const P2_prime_val = (g * Math.PI * (p.D ** 3)) > 0 ? (2 * p.f * (p.Q ** 2) / (g * Math.PI * (p.D ** 3))) * p.L_prime : 0;
    const Pv_val = 2 * (v_water ** 2) / g * A_pipe * Math.sin(phi_val / 2.0);
    const Ph_val = 2 * (v_water ** 2) / g * A_pipe * Math.sin(theta_val / 2.0);
    const P3_val = p.He * Math.PI * p.D * p.t;
    const P3_prime_val = p.He_prime * Math.PI * p.D * p.t_prime;
    const Prv_val = 2 * p.H * A_pipe * Math.sin(phi_val / 2.0);
    const Prh_val = 2 * p.H * A_pipe * Math.sin(theta_val / 2.0);
    
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
                              .replace(/fill="url\(#pipeGrad\)"/g, 'fill="url(#concreteHatch)"');

    let cleanProfileSvg = profileSvg.replace('<rect width="100%" height="100%" fill="url(#grid)"></rect>', '')
                                    .replace('<rect width="100%" height="100%" fill="url(#grid)" />', '')
                                    .replace('<defs>', `<defs>${concreteHatchDef}`)
                                    .replace(/fill="url\(#concreteGrad\)"/g, 'fill="url(#concreteHatch)"')
                                    .replace(/stroke="var\(--accent-cyan\)"/g, 'stroke="#0f172a" stroke-width="2"')
                                    .replace(/stroke="url\(#pipeGrad\)"/g, 'stroke="#475569"');

    let cleanSectionSvg = sectionSvg.replace('<rect width="100%" height="100%" fill="url(#grid)"></rect>', '')
                                    .replace('<rect width="100%" height="100%" fill="url(#grid)" />', '')
                                    .replace('<defs>', `<defs>${concreteHatchDef}`)
                                    .replace(/fill="url\(#concreteGrad\)"/g, 'fill="url(#concreteHatch)"')
                                    .replace(/stroke="var\(--accent-cyan\)"/g, 'stroke="#0f172a" stroke-width="2"')
                                    .replace(/fill="url\(#pipeGrad\)"/g, 'fill="none" stroke="#475569" stroke-width="3"');

    let forcesRows = '';
    const forceKeys = [
        { name: 'Concrete dead weight', symbol: 'WA', fx: 0, fy: 0, fz: -f.WA },
        { name: 'Pipe & Water weight (Upstream)', symbol: 'W', fx: f.W.x, fy: f.W.y, fz: f.W.z },
        { name: 'Pipe & Water weight (Downstream)', symbol: 'W\'', fx: f.W_prime.x, fy: f.W_prime.y, fz: f.W_prime.z },
        { name: 'Pipe dead weight (Upstream)', symbol: 'P1', fx: f.P1.x, fy: f.P1.y, fz: f.P1.z },
        { name: 'Pipe dead weight (Downstream)', symbol: 'P1\'', fx: f.P1_prime.x, fy: f.P1_prime.y, fz: f.P1_prime.z },
        { name: 'Hydrodynamic Friction (Upstream)', symbol: 'P2', fx: f.P2.x, fy: f.P2.y, fz: f.P2.z },
        { name: 'Hydrodynamic Friction (Downstream)', symbol: 'P2\'', fx: f.P2_prime.x, fy: f.P2_prime.y, fz: f.P2_prime.z },
        { name: 'Centrifugal Vert. Bend', symbol: 'Pv', fx: f.Pv.x, fy: f.Pv.y, fz: f.Pv.z },
        { name: 'Centrifugal Horiz. Bend', symbol: 'Ph', fx: f.Ph.x, fy: f.Ph.y, fz: f.Ph.z },
        { name: 'Upstream expansion joint pressure', symbol: 'P3', fx: f.P3.x, fy: f.P3.y, fz: f.P3.z },
        { name: 'Downstream expansion joint pressure', symbol: 'P3\'', fx: f.P3_prime.x, fy: f.P3_prime.y, fz: f.P3_prime.z },
        { name: 'Unbalanced vertical bend pressure', symbol: 'Prv', fx: f.Prv.x, fy: f.Prv.y, fz: f.Prv.z },
        { name: 'Unbalanced horizontal bend pressure', symbol: 'Prh', fx: f.Prh.x, fy: f.Prh.y, fz: f.Prh.z }
    ];
    
    forceKeys.forEach(fk => {
        forcesRows += `
            <tr style="color: #000000 !important;">
                <td style="padding: 4px; border: 1px solid #cbd5e1; color: #000000;">${fk.name}</td>
                <td style="padding: 4px; border: 1px solid #cbd5e1; font-family: monospace; color: #000000;">${fk.symbol}</td>
                <td style="padding: 4px; border: 1px solid #cbd5e1; text-align: right; color: #000000;">${fNum(fk.fx, 3)}</td>
                <td style="padding: 4px; border: 1px solid #cbd5e1; text-align: right; color: #000000;">${fNum(fk.fy, 3)}</td>
                <td style="padding: 4px; border: 1px solid #cbd5e1; text-align: right; color: #000000;">${fNum(fk.fz, 3)}</td>
            </tr>
        `;
    });
    
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
                <td style="padding: 4px; border: 1px solid #cbd5e1; text-align: right; color: #000000;">${fNum(cs.e, 3)} / ${fNum(cs.limit_e, 3)}</td>
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
        const eqSign = cs.eqLabel.includes('-') ? -1.0 : 1.0;
        const signText = eqSign < 0 ? '-' : '+';
        const seismicTotal = eqSign * (f.F_WA + f.F_p);
        const pipeH_val = isXZ ? cs.Rx : cs.Ry;
        const pipeH_label = isXZ ? 'Rx' : 'Ry';
        const toeLabel = isXZ ? (cs.eqLabel.includes('-x') ? 'upstream toe (x=0)' : 'downstream toe (x=B)') : 'toe';
        detailedCasesVerification += `
            <div style="margin-bottom: 15px; padding: 10px; border: 1px solid #cbd5e1; border-radius: 4px; page-break-inside: avoid; background-color: #f8fafc;">
                <h4 style="margin: 0 0 6px 0; font-size: 10px; color: #0f172a; text-transform: uppercase; border-bottom: 1px dashed #cbd5e1; padding-bottom: 2px;">
                    Case: ${cs.caseName} (${cs.plane} Plane, EQ: ${cs.eqLabel}, Comb: ${cs.combination})
                </h4>
                <div style="font-size: 9px; line-height: 1.5; color: #334155; display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                    <div>
                        <strong>Vertical Forces & Moments Sum:</strong><br>
                        * &Sigma; V = -WA + Rz = -${f.WA.toFixed(2)} + (${cs.Rz.toFixed(2)}) = <strong>${cs.totalV.toFixed(2)} ton</strong> (downward)<br>
                        * Lever arms: CG_arm = ${(isXZ ? f.x_CG : f.y_CG_stability).toFixed(3)}m, pipe_arm = ${(isXZ ? x_pipe_val : p.B_yz/2.0).toFixed(3)}m<br>
                        * &Sigma; M_V = -WA &times; CG_arm + Rz &times; pipe_arm = <strong>${cs.momV.toFixed(2)} ton-m</strong>
                    </div>
                    <div>
                        <strong>Horizontal Forces & Moments Sum (with Seismic):</strong><br>
                        * Horizontal load from pipe: ${pipeH_label} = <strong>${pipeH_val.toFixed(2)} ton</strong><br>
                        * Seismic force: F_seismic = <strong>${seismicTotal.toFixed(2)} ton</strong><br>
                        * &Sigma; H = F_seismic + ${pipeH_label} = <strong>${cs.totalH.toFixed(2)} ton</strong><br>
                        * &Sigma; M_H = ${signText} (F_WA &times; ${h_CG_val.toFixed(2)}) ${signText} (F_p &times; ${h_pipe_val.toFixed(2)}) + (${pipeH_label} &times; ${h_pipe_val.toFixed(2)}) = <strong>${cs.momH.toFixed(2)} ton-m</strong>
                    </div>
                </div>
                <div style="font-size: 9px; line-height: 1.5; color: #334155; margin-top: 6px; border-top: 1px dashed #cbd5e1; padding-top: 4px; display: flex; gap: 12px; flex-wrap: wrap;">
                    <span><strong>Sliding check:</strong> Fs = (${cs.P_p > 0 || cs.R_cohesion > 0 ? `(|&Sigma; V| &times; &lambda; + R_key + V_anchors + P_p + R_cohesion)` : `(|&Sigma; V| &times; &lambda; + R_key + V_anchors`}) / |&Sigma; H| = <strong>${cs.Fs.toFixed(2)}</strong> (Limit: &ge; 1.2)${cs.P_p > 0 ? ` [P_p = ${cs.P_p.toFixed(2)} t, R_coh = ${cs.R_cohesion.toFixed(2)} t]` : ''} - <strong style="color:${cs.slidingPass ? '#10b981':'#ef4444'};">${cs.slidingPass ? 'PASS':'FAIL'}</strong></span>
                    <span><strong>Overturning check:</strong> Fot = |M_Resisting / M_Overturning| = <strong>${cs.Fot.toFixed(2)}</strong> (Limit: &ge; 1.2) - <strong style="color:${cs.overturningFSPass ? '#10b981':'#ef4444'};">${cs.overturningFSPass ? 'PASS':'FAIL'}</strong></span>
                    <span><strong>Eccentricity:</strong> e = |B/2 - x_res| = <strong>${cs.e.toFixed(3)} m</strong> (Limit: &le; ${cs.limit_e.toFixed(3)} m) - <strong style="color:${cs.eccentricityPass ? '#10b981':'#ef4444'};">${cs.eccentricityPass ? 'PASS':'FAIL'}</strong></span>
                    <span><strong>Bearing pressure:</strong> &sigma;_max = <strong>${fNum(cs.sigma, 2)} t/m&sup2;</strong> (Limit: &lt; ${cs.limit_qa.toFixed(2)} t/m&sup2;${cs.eqLabel.includes('EQ') ? ` [qa_allow = qa &times; ${p.bearing_increase_factor || 1.50} = ${cs.limit_qa.toFixed(2)}]` : ''}) ${cs.isLiftOff ? '<em>(Heel Lift-off redistributed)</em>' : ''} - <strong style="color:${cs.bearingPass ? '#10b981':'#ef4444'};">${cs.bearingPass ? 'PASS':'FAIL'}</strong></span>
                </div>
            </div>
        `;
    });

    const activeCase = cases[state.selectedCaseIndex] || cases[0];
    
    return `
        <div class="print-preview-area" style="padding: 20px; font-family: 'Inter', sans-serif; color: #1e293b; background: #ffffff;">
            <!-- Report Header -->
            <div class="report-header" style="border-bottom: 2px solid #0f172a; padding-bottom: 15px; margin-bottom: 20px;">
                <h1 style="font-size: 20px; font-weight: 800; color: #0f172a; margin: 0 0 5px 0; text-transform: uppercase;">JICA Penstock Anchor Block Design Report</h1>
                <div style="font-size: 11px; color: #475569; display: flex; justify-content: space-between;">
                    <span><strong>Project:</strong> JICA Hydropower Penstock Anchor Block</span>
                    <span><strong>Date:</strong> 2026-07-14</span>
                    <span><strong>Reference:</strong> AB-1 Stability Audit</span>
                </div>
            </div>
            
            <!-- Section 1 -->
            <div class="report-section" style="margin-bottom: 20px;">
                <h3 style="font-size: 12px; font-weight: 700; color: #0f172a; text-transform: uppercase; border-bottom: 1px solid #94a3b8; padding-bottom: 4px; margin-bottom: 8px;">1. Geometric Inputs & Boundary Parameters</h3>
                <table style="width: 100%; border-collapse: collapse; font-size: 10px; margin-bottom: 12px;">
                    <tbody>
                        <tr>
                            <td style="padding: 4px; border: 1px solid #cbd5e1; width: 25%;"><strong>Block Length B:</strong></td>
                            <td style="padding: 4px; border: 1px solid #cbd5e1; width: 25%;">${p.B.toFixed(2)} m</td>
                            <td style="padding: 4px; border: 1px solid #cbd5e1; width: 25%;"><strong>Block Width W:</strong></td>
                            <td style="padding: 4px; border: 1px solid #cbd5e1; width: 25%;">${p.W.toFixed(2)} m</td>
                        </tr>
                        <tr>
                            <td style="padding: 4px; border: 1px solid #cbd5e1;"><strong>Block Height H_ab:</strong></td>
                            <td style="padding: 4px; border: 1px solid #cbd5e1;">${p.H_ab.toFixed(2)} m</td>
                            <td style="padding: 4px; border: 1px solid #cbd5e1;"><strong>Transverse Base B_yz:</strong></td>
                            <td style="padding: 4px; border: 1px solid #cbd5e1;">${p.B_yz.toFixed(2)} m</td>
                        </tr>
                        <tr>
                            <td style="padding: 4px; border: 1px solid #cbd5e1;"><strong>Concrete density:</strong></td>
                            <td style="padding: 4px; border: 1px solid #cbd5e1;">${p.wc.toFixed(2)} t/m³</td>
                            <td style="padding: 4px; border: 1px solid #cbd5e1;"><strong>Horizontal Seismic Kh:</strong></td>
                            <td style="padding: 4px; border: 1px solid #cbd5e1;">${p.Kh.toFixed(2)}</td>
                        </tr>
                        <tr>
                            <td style="padding: 4px; border: 1px solid #cbd5e1;"><strong>Pipe Diameter D:</strong></td>
                            <td style="padding: 4px; border: 1px solid #cbd5e1;">${p.D.toFixed(3)} m</td>
                            <td style="padding: 4px; border: 1px solid #cbd5e1;"><strong>Static Design Head H:</strong></td>
                            <td style="padding: 4px; border: 1px solid #cbd5e1;">${p.H.toFixed(2)} m</td>
                        </tr>
                        <tr>
                            <td style="padding: 4px; border: 1px solid #cbd5e1;"><strong>Upstream Slope δ:</strong></td>
                            <td style="padding: 4px; border: 1px solid #cbd5e1;">${deg(delta_val).toFixed(3)}°</td>
                            <td style="padding: 4px; border: 1px solid #cbd5e1;"><strong>Downstream Slope δ':</strong></td>
                            <td style="padding: 4px; border: 1px solid #cbd5e1;">${deg(delta_prime_val).toFixed(3)}°</td>
                        </tr>
                        <tr>
                            <td style="padding: 4px; border: 1px solid #cbd5e1;"><strong>Horizontal Bend θ:</strong></td>
                            <td style="padding: 4px; border: 1px solid #cbd5e1;">${p.theta.toFixed(3)}°</td>
                            <td style="padding: 4px; border: 1px solid #cbd5e1;"><strong>Allowable Soil qa:</strong></td>
                            <td style="padding: 4px; border: 1px solid #cbd5e1;">${p.qa.toFixed(2)} t/m²</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- SVG Projection Blueprints Section -->
            <div class="report-section" style="margin-bottom: 20px; page-break-inside: avoid;">
                <h3 style="font-size: 12px; font-weight: 700; color: #0f172a; text-transform: uppercase; border-bottom: 1px solid #94a3b8; padding-bottom: 4px; margin-bottom: 8px;">2. Projection Blueprints & Drawings</h3>
                <div style="display: flex; flex-direction: column; gap: 15px;">
                    <div>
                        <h4 style="font-size: 9px; margin: 0 0 4px 0; color: #475569; text-transform: uppercase;">A. Longitudinal Profile (X-Z Plane)</h4>
                        <div style="border: 1px solid #cbd5e1; padding: 5px; background: #ffffff; height: 220px; overflow: hidden;">
                            ${cleanProfileSvg}
                        </div>
                    </div>
                    <div style="display: grid; grid-template-columns: 1.2fr 1fr; gap: 15px;">
                        <div>
                            <h4 style="font-size: 9px; margin: 0 0 4px 0; color: #475569; text-transform: uppercase;">B. Plan Layout (X-Y Plane)</h4>
                            <div style="border: 1px solid #cbd5e1; padding: 5px; background: #ffffff; height: 200px; overflow: hidden;">
                                ${cleanPlanSvg}
                            </div>
                        </div>
                        <div>
                            <h4 style="font-size: 9px; margin: 0 0 4px 0; color: #475569; text-transform: uppercase;">C. Transverse Section (Y-Z Plane)</h4>
                            <div style="border: 1px solid #cbd5e1; padding: 5px; background: #ffffff; height: 200px; overflow: hidden;">
                                ${cleanSectionSvg}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- FBD Section -->
            <div class="report-section" style="margin-bottom: 20px; page-break-inside: avoid;">
                <h3 style="font-size: 12px; font-weight: 700; color: #0f172a; text-transform: uppercase; border-bottom: 1px solid #94a3b8; padding-bottom: 4px; margin-bottom: 8px;">3. Free Body Diagrams (FBD) - X-Z & Y-Z Planes</h3>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                    <div style="border: 1px solid #cbd5e1; padding: 5px; background: #ffffff; height: 280px; overflow: hidden;">
                        ${generateFBDSVG('XZ')}
                    </div>
                    <div style="border: 1px solid #cbd5e1; padding: 5px; background: #ffffff; height: 280px; overflow: hidden;">
                        ${generateFBDSVG('YZ')}
                    </div>
                </div>
            </div>

            <!-- Concrete Area and CG -->
            <div class="report-section" style="margin-bottom: 20px; page-break-inside: avoid;">
                <h3 style="font-size: 12px; font-weight: 700; color: #0f172a; text-transform: uppercase; border-bottom: 1px solid #94a3b8; padding-bottom: 4px; margin-bottom: 8px;">4. Concrete Volume & Centroid Calculations</h3>
                <div style="font-size: 10px; line-height: 1.5; margin-bottom: 8px; color: #334155;">
                    * Concrete Profile Area (X-Z Polygon Area) = <strong>${f.A_profile.toFixed(3)} m²</strong><br>
                    * Gross Block Volume = <strong>${(f.A_profile * p.W).toFixed(3)} m³</strong><br>
                    * Net Concrete Volume = <strong>${f.V_concrete.toFixed(3)} m³</strong><br>
                    * Concrete Dry Weight (WA) = <strong>${f.WA.toFixed(3)} ton</strong><br>
                    * Center of Gravity (CG) Position: <strong>[X_CG: ${f.x_CG.toFixed(3)}m, Y_CG: ${f.y_CG_stability.toFixed(3)}m, Z_CG: ${f.z_CG.toFixed(3)}m]</strong><br>
                    * Stepped base minimum z: <strong>${z_min.toFixed(3)}m</strong><br>
                    * Overturning arms (from base): h_CG = <strong>${h_CG_val.toFixed(3)}m</strong>, h_pipe = <strong>${h_pipe_val.toFixed(3)}m</strong>
                </div>
            </div>

            <!-- Force Table -->
            <div class="report-section" style="margin-bottom: 20px; page-break-inside: avoid;">
                <h3 style="font-size: 12px; font-weight: 700; color: #0f172a; text-transform: uppercase; border-bottom: 1px solid #94a3b8; padding-bottom: 4px; margin-bottom: 8px;">5. JICA Resolved Force Vector Summary</h3>
                <table class="report-table" style="width: 100%; border-collapse: collapse; font-size: 9px; margin-top: 5px;">
                    <thead>
                        <tr style="background-color: #f1f5f9; border-bottom: 1px solid #cbd5e1;">
                            <th style="padding: 4px; border: 1px solid #cbd5e1; text-align: left; color: #0f172a;">Force Component</th>
                            <th style="padding: 4px; border: 1px solid #cbd5e1; text-align: left; color: #0f172a;">Symbol</th>
                            <th style="padding: 4px; border: 1px solid #cbd5e1; text-align: right; color: #0f172a;">Fx [ton]</th>
                            <th style="padding: 4px; border: 1px solid #cbd5e1; text-align: right; color: #0f172a;">Fy [ton]</th>
                            <th style="padding: 4px; border: 1px solid #cbd5e1; text-align: right; color: #0f172a;">Fz [ton]</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${forcesRows}
                        <tr style="font-weight: bold; background-color: #f8fafc; border-top: 1px solid #94a3b8;">
                            <td style="padding: 4px; border: 1px solid #cbd5e1; color: #0f172a;">Constant Force Resultant Sum</td>
                            <td style="padding: 4px; border: 1px solid #cbd5e1; font-family: monospace; color: #0f172a;">P</td>
                            <td style="padding: 4px; border: 1px solid #cbd5e1; text-align: right; color: #0f172a;">${fNum(f.P_vec.x, 3)}</td>
                            <td style="padding: 4px; border: 1px solid #cbd5e1; text-align: right; color: #0f172a;">${fNum(f.P_vec.y, 3)}</td>
                            <td style="padding: 4px; border: 1px solid #cbd5e1; text-align: right; color: #0f172a;">${fNum(f.P_vec.z, 3)}</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- Section 6: Individual Force Derivations -->
            <div class="report-section" style="margin-bottom: 20px; page-break-inside: avoid;">
                <h3 style="font-size: 12px; font-weight: 700; color: #0f172a; text-transform: uppercase; border-bottom: 1px solid #94a3b8; padding-bottom: 4px; margin-bottom: 8px;">6. Individual Force Formula Substitutions</h3>
                <div style="font-size: 9px; line-height: 1.4; color: #334155; display: flex; flex-direction: column; gap: 8px;">
                    <div>
                        <strong>1. Concrete Block Dead Weight (W_A):</strong><br>
                        Formula: W_A = [ A_profile &times; W - A_pipe &times; L_internal ] &times; w_c<br>
                        Substitution: [ ${f.A_profile.toFixed(3)} &times; ${p.W.toFixed(2)} - ${A_pipe.toFixed(5)} &times; ${f.L_internal.toFixed(3)} ] &times; ${p.wc.toFixed(2)} = <strong>${f.WA.toFixed(3)} ton</strong>
                    </div>
                    <div>
                        <strong>2. Pipe & Water weight (Upstream) (W):</strong><br>
                        Formula: W = 0.5 &times; (w + s) &times; l &times; cos(&delta;)<br>
                        Substitution: 0.5 &times; (${w.toFixed(4)} + ${s.toFixed(4)}) &times; ${p.l.toFixed(3)} &times; cos(${deg(delta_val).toFixed(2)}&deg;) = <strong>${W_val.toFixed(3)} ton</strong> (Fx: ${f.W.x.toFixed(3)}, Fy: ${f.W.y.toFixed(3)}, Fz: ${f.W.z.toFixed(3)})
                    </div>
                    <div>
                        <strong>3. Pipe & Water weight (Downstream) (W'):</strong><br>
                        Formula: W' = 0.5 &times; (w + s') &times; l' &times; cos(&delta;')<br>
                        Substitution: 0.5 &times; (${w.toFixed(4)} + ${s_prime.toFixed(4)}) &times; ${p.l_prime.toFixed(3)} &times; cos(${deg(delta_prime_val).toFixed(2)}&deg;) = <strong>${W_prime_val.toFixed(3)} ton</strong> (Fx: ${f.W_prime.x.toFixed(3)}, Fy: ${f.W_prime.y.toFixed(3)}, Fz: ${f.W_prime.z.toFixed(3)})
                    </div>
                    <div>
                        <strong>4. Pipe shell weight (Upstream) (P1):</strong><br>
                        Formula: P1 = s &times; L &times; sin(&delta;)<br>
                        Substitution: ${s.toFixed(4)} &times; ${p.L.toFixed(2)} &times; sin(${deg(delta_val).toFixed(2)}&deg;) = <strong>${P1_val.toFixed(3)} ton</strong> (Fx: ${f.P1.x.toFixed(3)}, Fy: ${f.P1.y.toFixed(3)}, Fz: ${f.P1.z.toFixed(3)})
                    </div>
                    <div>
                        <strong>5. Pipe shell weight (Downstream) (P1'):</strong><br>
                        Formula: P1' = s' &times; L' &times; sin(&delta;')<br>
                        Substitution: ${s_prime.toFixed(4)} &times; ${p.L_prime.toFixed(2)} &times; sin(${deg(delta_prime_val).toFixed(2)}&deg;) = <strong>${P1_prime_val.toFixed(3)} ton</strong> (Fx: ${f.P1_prime.x.toFixed(3)}, Fy: ${f.P1_prime.y.toFixed(3)}, Fz: ${f.P1_prime.z.toFixed(3)})
                    </div>
                    <div>
                        <strong>6. Hydrodynamic friction (Upstream) (P2):</strong><br>
                        Formula: P2 = (2 &times; f &times; Q&sup2; / (g &times; &pi; &times; D&sup3;)) &times; L<br>
                        Substitution: (2 &times; ${p.f.toFixed(3)} &times; ${p.Q.toFixed(3)}&sup2; / (9.81 &times; &pi; &times; ${p.D.toFixed(3)}&sup3;)) &times; ${p.L.toFixed(2)} = <strong>${P2_val.toFixed(4)} ton</strong> (Fx: ${f.P2.x.toFixed(3)}, Fy: ${f.P2.y.toFixed(3)}, Fz: ${f.P2.z.toFixed(3)})
                    </div>
                    <div>
                        <strong>7. Hydrodynamic friction (Downstream) (P2'):</strong><br>
                        Formula: P2' = (2 &times; f &times; Q&sup2; / (g &times; &pi; &times; D&sup3;)) &times; L'<br>
                        Substitution: (2 &times; ${p.f.toFixed(3)} &times; ${p.Q.toFixed(3)}&sup2; / (9.81 &times; &pi; &times; ${p.D.toFixed(3)}&sup3;)) &times; ${p.L_prime.toFixed(2)} = <strong>${P2_prime_val.toFixed(4)} ton</strong> (Fx: ${f.P2_prime.x.toFixed(3)}, Fy: ${f.P2_prime.y.toFixed(3)}, Fz: ${f.P2_prime.z.toFixed(3)})
                    </div>
                    <div>
                        <strong>8. Centrifugal Force from Vertical Bend (Pv):</strong><br>
                        Formula: Pv = 2 &times; (v_w&sup2; / g) &times; A_pipe &times; sin(&phi;/2) &times; &gamma;_w<br>
                        Substitution: 2 &times; (${v_water.toFixed(3)}&sup2; / 9.81) &times; ${A_pipe.toFixed(4)} &times; sin(${deg(phi_val).toFixed(2)}&deg; / 2) &times; 1.0 t/m&sup3; = <strong>${Pv_val.toFixed(4)} ton</strong> (Fx: ${f.Pv.x.toFixed(3)}, Fy: ${f.Pv.y.toFixed(3)}, Fz: ${f.Pv.z.toFixed(3)})
                    </div>
                    <div>
                        <strong>9. Centrifugal Force from Horizontal Bend (Ph):</strong><br>
                        Formula: Ph = 2 &times; (v_w&sup2; / g) &times; A_pipe &times; sin(&theta;/2) &times; &gamma;_w<br>
                        Substitution: 2 &times; (${v_water.toFixed(3)}&sup2; / 9.81) &times; ${A_pipe.toFixed(4)} &times; sin(${p.theta.toFixed(2)}&deg; / 2) &times; 1.0 t/m&sup3; = <strong>${Ph_val.toFixed(4)} ton</strong>
                    </div>
                    <div>
                        <strong>10. Upstream Expansion Joint Pressure (P3):</strong><br>
                        Formula: P3 = He &times; &pi; &times; D &times; t &times; &gamma;_w<br>
                        Substitution: ${p.He.toFixed(2)} &times; &pi; &times; ${p.D.toFixed(3)} &times; ${p.t.toFixed(4)} &times; 1.0 t/m&sup3; = <strong>${P3_val.toFixed(3)} ton</strong> (Fx: ${f.P3.x.toFixed(3)}, Fy: ${f.P3.y.toFixed(3)}, Fz: ${f.P3.z.toFixed(3)})
                    </div>
                    <div>
                        <strong>11. Downstream Expansion Joint Pressure (P3'):</strong><br>
                        Formula: P3' = He' &times; &pi; &times; D &times; t' &times; &gamma;_w<br>
                        Substitution: ${p.He_prime.toFixed(2)} &times; &pi; &times; ${p.D.toFixed(3)} &times; ${p.t_prime.toFixed(4)} &times; 1.0 t/m&sup3; = <strong>${P3_prime_val.toFixed(3)} ton</strong> (Fx: ${f.P3_prime.x.toFixed(3)}, Fy: ${f.P3_prime.y.toFixed(3)}, Fz: ${f.P3_prime.z.toFixed(3)})
                    </div>
                    <div>
                        <strong>12. Unbalanced Vertical Pressure (Prv):</strong><br>
                        Formula: Prv = 2 &times; H &times; A_pipe &times; sin(&phi;/2) &times; &gamma;_w<br>
                        Substitution: 2 &times; ${p.H.toFixed(2)} &times; ${A_pipe.toFixed(4)} &times; sin(${deg(phi_val).toFixed(2)}&deg; / 2) &times; 1.0 t/m&sup3; = <strong>${Prv_val.toFixed(3)} ton</strong> (Fx: ${f.Prv.x.toFixed(3)}, Fy: ${f.Prv.y.toFixed(3)}, Fz: ${f.Prv.z.toFixed(3)})
                    </div>
                    <div>
                        <strong>13. Unbalanced Horizontal Pressure (Prh):</strong><br>
                        Formula: Prh = 2 &times; H &times; A_pipe &times; sin(&theta;/2) &times; &gamma;_w<br>
                        Substitution: 2 &times; ${p.H.toFixed(2)} &times; ${A_pipe.toFixed(4)} &times; sin(${p.theta.toFixed(2)}&deg; / 2) &times; 1.0 t/m&sup3; = <strong>${Prh_val.toFixed(3)} ton</strong>
                    </div>
                    <div>
                        <strong>Temperature force upstream (F):</strong> F_total = c&times;(w+s)&times;(L - l/2)&times;cos(&delta;) + fe&times;&pi;&times;(D+2t) = <strong>${F_total.toFixed(3)} ton</strong> (Fx: ${f.F.x.toFixed(3)}, Fz: ${f.F.z.toFixed(3)})<br>
                        <strong>Temperature force downstream (F'):</strong> F_prime_total = c&times;(w+s')&times;(L' - l'/2)&times;cos(&delta;') + fe&times;&pi;&times;(D+2t') = <strong>${F_prime.toFixed(3)} ton</strong> (Fx: ${f.F_prime.x.toFixed(3)}, Fz: ${f.F_prime.z.toFixed(3)})
                    </div>
                    <div>
                        <strong>Seismic forces (Kh = ${p.Kh.toFixed(2)}):</strong> F_WA = Kh &times; WA = <strong>${f.F_WA.toFixed(3)} ton</strong>, F_p = Kh &times; PipeWeight = <strong>${f.F_p.toFixed(3)} ton</strong>
                    </div>
                </div>
            </div>

            <!-- Case Summaries -->
            <div class="report-section" style="margin-bottom: 20px;">
                <h3 style="font-size: 12px; font-weight: 700; color: #0f172a; text-transform: uppercase; border-bottom: 1px solid #94a3b8; padding-bottom: 4px; margin-bottom: 8px;">7. Stability Verification Summary - Longitudinal Plane (X-Z)</h3>
                <table class="report-table" style="width: 100%; border-collapse: collapse; font-size: 9px; margin-top: 5px;">
                    <thead>
                        <tr style="background-color: #f1f5f9; border-bottom: 1px solid #cbd5e1;">
                            <th style="padding: 4px; border: 1px solid #cbd5e1; text-align: left; color: #0f172a;">Load Case</th>
                            <th style="padding: 4px; border: 1px solid #cbd5e1; text-align: left; color: #0f172a;">EQ Dir</th>
                            <th style="padding: 4px; border: 1px solid #cbd5e1; text-align: left; color: #0f172a;">Combination</th>
                            <th style="padding: 4px; border: 1px solid #cbd5e1; text-align: right; color: #0f172a;">V [ton]</th>
                            <th style="padding: 4px; border: 1px solid #cbd5e1; text-align: right; color: #0f172a;">H [ton]</th>
                            <th style="padding: 4px; border: 1px solid #cbd5e1; text-align: right; color: #0f172a;">e / limit [m]</th>
                            <th style="padding: 4px; border: 1px solid #cbd5e1; text-align: right; color: #0f172a;">Sliding Fs</th>
                            <th style="padding: 4px; border: 1px solid #cbd5e1; text-align: right; color: #0f172a;">Overturning Fot</th>
                            <th style="padding: 4px; border: 1px solid #cbd5e1; text-align: right; color: #0f172a;">Bearing [t/m²]</th>
                            <th style="padding: 4px; border: 1px solid #cbd5e1; text-align: left; color: #0f172a;">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${xzCasesRows}
                    </tbody>
                </table>
                <p style="font-size: 8px; color: #475569; margin: 4px 0 0 0; font-style: italic; line-height: 1.3;">
                    * <strong>Eccentricity Limit Note:</strong> In accordance with JICA gravity design guidelines, the allowable eccentricity limit is dynamically computed. Under seismic loading, the limit is extended to the middle-fourth width: B/4 = ${(p.B / 4.0).toFixed(3)} m. Under static conditions (normal/non-seismic), the limit is the middle-third: B/6 = ${(p.B / 6.0).toFixed(3)} m.
                </p>
            </div>

            <div class="report-section" style="margin-bottom: 20px;">
                <h3 style="font-size: 12px; font-weight: 700; color: #0f172a; text-transform: uppercase; border-bottom: 1px solid #94a3b8; padding-bottom: 4px; margin-bottom: 8px;">8. Stability Verification Summary - Transverse Plane (Y-Z)</h3>
                <table class="report-table" style="width: 100%; border-collapse: collapse; font-size: 9px; margin-top: 5px;">
                    <thead>
                        <tr style="background-color: #f1f5f9; border-bottom: 1px solid #cbd5e1;">
                            <th style="padding: 4px; border: 1px solid #cbd5e1; text-align: left; color: #0f172a;">Load Case</th>
                            <th style="padding: 4px; border: 1px solid #cbd5e1; text-align: left; color: #0f172a;">EQ Dir</th>
                            <th style="padding: 4px; border: 1px solid #cbd5e1; text-align: left; color: #0f172a;">Combination</th>
                            <th style="padding: 4px; border: 1px solid #cbd5e1; text-align: right; color: #0f172a;">V [ton]</th>
                            <th style="padding: 4px; border: 1px solid #cbd5e1; text-align: right; color: #0f172a;">H [ton]</th>
                            <th style="padding: 4px; border: 1px solid #cbd5e1; text-align: right; color: #0f172a;">e / limit [m]</th>
                            <th style="padding: 4px; border: 1px solid #cbd5e1; text-align: right; color: #0f172a;">Sliding Fs</th>
                            <th style="padding: 4px; border: 1px solid #cbd5e1; text-align: right; color: #0f172a;">Overturning Fot</th>
                            <th style="padding: 4px; border: 1px solid #cbd5e1; text-align: right; color: #0f172a;">Bearing [t/m²]</th>
                            <th style="padding: 4px; border: 1px solid #cbd5e1; text-align: left; color: #0f172a;">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${yzCasesRows}
                    </tbody>
                </table>
                <p style="font-size: 8px; color: #475569; margin: 4px 0 0 0; font-style: italic; line-height: 1.3;">
                    * <strong>Eccentricity Limit Note:</strong> Under seismic loading, the transverse eccentricity limit is: B_yz/4 = ${(p.B_yz / 4.0).toFixed(3)} m. Under static conditions, the limit is: B_yz/6 = ${(p.B_yz / 6.0).toFixed(3)} m.
                </p>
            </div>

            <!-- Detailed Case Calculations -->
            <div class="report-section" style="margin-bottom: 20px;">
                <h3 style="font-size: 12px; font-weight: 700; color: #0f172a; text-transform: uppercase; border-bottom: 1px solid #94a3b8; padding-bottom: 4px; margin-bottom: 8px;">9. Step-by-Step Load Cases Verification (All 16 Combinations)</h3>
                <div style="display: flex; flex-direction: column; gap: 10px;">
                    ${detailedCasesVerification}
                </div>
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
