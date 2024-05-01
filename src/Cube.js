class Cube {

    // Constructor and setters ====

    constructor() {
        this.type = "cube";
        this.color = {
            r: 1.0,
            g: 1.0,
            b: 1.0,
            a: 1.0
        };

        this.matrix = new Matrix4();
    }

    setColor(r, g, b, a) {
        this.color = {r, g, b, a};
    }

    // Render methods ====
    render() {
        // Pass the model matrix to u_ModelMatrix attribute
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        // Pass the color of a point to u_FragColor variable
        let verts = this.getVertices();
        let falloffPer = 0.05;

        for (let i = 0; i < verts.length; i++) {
            let falloff = Math.max(1-(i)*falloffPer, 0);
            gl.uniform4f(u_FragColor, this.color.r*falloff, this.color.g*falloff, this.color.b*falloff, 1);

            Triangle.drawTriangle3D(verts[i]);
        }
    }

    getVertices() {
        return Cube.vertices;
    }

    static vertices = [
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