class Octohedron extends Polyhedron {
    
    constructor() {
        super();
        this.type = "octohedron";
    }

    getVertices() {
        return Octohedron.vertices;
    }

    static vertices = [
        // Top
            // Front
            [-0.5,0,-0.5,  0,0.5,0,  0.5,0,-0.5],    
            // Back
            [-0.5,0,0.5,  0,0.5,0,  0.5,0,0.5],  
            // Left
            [0,0.5,0,  -0.5,0,0.5,  -0.5,0,-0.5],  
            // Right
            [0,0.5,0,  0.5,0,0.5,  0.5,0,-0.5],

        // Bottom
            // Front
            [-0.5,0,-0.5,  0,-0.5,0,  0.5,0,-0.5],    
            // Back
            [-0.5,0,0.5,  0,-0.5,0,  0.5,0,0.5],  
            // Left
            [0,-0.5,0,  -0.5,0,0.5,  -0.5,0,-0.5],  
            // Right
            [0,-0.5,0,  0.5,0,0.5,  0.5,0,-0.5]
    ];
}