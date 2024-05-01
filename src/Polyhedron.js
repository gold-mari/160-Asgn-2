class Polyhedron {

    // Constructor and setters ====

    constructor() {
        this.type = undefined;
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
        let triangles = this.getTriangles();
        let finalFalloff = 0.5;

        for (let i = 0; i < triangles.length; i++) {
            let falloff = Polyhedron.lerp(1, finalFalloff, (i/triangles.length));
            gl.uniform4f(u_FragColor, this.color.r*falloff, this.color.g*falloff, this.color.b*falloff, 1);

            Triangle.drawTriangle3D(triangles[i]);
        }
    }

    getTriangles() {
        return Polyhedron.triangles;
    }

    static triangles = [];

    static lerp(start, end, amount) {
        return (1-amount)*start + amount*end;
    }
}