class Pyramid4 extends Polyhedron {
    
    constructor() {
        super();
        this.type = "pyramid4";
    }

    getVertices() {
        return Pyramid4.vertices;
    }

    static vertices = [
        // Front
        [-0.5,-0.5,-0.5,  0,0.5,0,  0.5,-0.5,-0.5],    
        // Back
        [-0.5,-0.5,0.5,  0,0.5,0,  0.5,-0.5,0.5],  

        // Left
        [0,0.5,0,  -0.5,-0.5,0.5,  -0.5,-0.5,-0.5],  
        // Right
        [0,0.5,0,  0.5,-0.5,0.5,  0.5,-0.5,-0.5],  

        // Bottom
        [-0.5,-0.5,-0.5,  0.5,-0.5,0.5,  -0.5,-0.5,0.5],  
        [-0.5,-0.5,-0.5,  0.5,-0.5,0.5,  0.5,-0.5,-0.5]
    ];
}