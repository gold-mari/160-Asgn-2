class Cube extends Polyhedron {

    constructor(parent) {
        super(parent);
        this.type = "cube";
    }

    getTriangles() {
        return Cube.triangles;
    }

    static triangles = [
        // Front
        [-0.5,-0.5,-0.5,  0.5,0.5,-0.5,  0.5,-0.5,-0.5],  
        [-0.5,-0.5,-0.5,  0.5,0.5,-0.5,  -0.5,0.5,-0.5],  
        // Back
        [-0.5,-0.5,0.5,  0.5,0.5,0.5,  0.5,-0.5,0.5],  
        [-0.5,-0.5,0.5,  0.5,0.5,0.5,  -0.5,0.5,0.5],  

        // Left
        [-0.5,0.5,-0.5,  -0.5,-0.5,0.5,  -0.5,-0.5,-0.5],  
        [-0.5,0.5,-0.5,  -0.5,-0.5,0.5,  -0.5,0.5,0.5],  
        // Right
        [0.5,0.5,-0.5,  0.5,-0.5,0.5,  0.5,-0.5,-0.5],  
        [0.5,0.5,-0.5,  0.5,-0.5,0.5,  0.5,0.5,0.5],  

        // Top
        [-0.5,0.5,-0.5,  0.5,0.5,0.5,  -0.5,0.5,0.5],  
        [-0.5,0.5,-0.5,  0.5,0.5,0.5,  0.5,0.5,-0.5],  
        // Bottom
        [-0.5,-0.5,-0.5,  0.5,-0.5,0.5,  -0.5,-0.5,0.5],  
        [-0.5,-0.5,-0.5,  0.5,-0.5,0.5,  0.5,-0.5,-0.5]
    ];
}