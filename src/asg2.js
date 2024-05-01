// HelloPoint1.js (c) 2012 matsuda

// ================================================================
// Global variables
// ================================================================

// Vertex shader program
var VSHADER_SOURCE = `
    attribute vec4 a_Position;
    uniform mat4 u_ModelMatrix;
    uniform mat4 u_GlobalRotateMatrix;
    void main() {
        gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
    }`;

// Fragment shader program
var FSHADER_SOURCE = `
    precision mediump float;
    uniform vec4 u_FragColor;
    void main() {
        gl_FragColor = u_FragColor;
    }`;

// Globals
const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;
const SIZE_DELTA = 1/200.0; // Used to scale shapes like triangles and circles.

let canvas;
let gl;
let penColorPreviewDiv;
let a_Position;
let u_FragColor;
let u_ModelMatrix;
let u_GlobalRotateMatrix;

let g_upperAngle = 0;
let g_lowerAngle = 0;
let g_globalAngle = [0, 0];
let g_dragStartAngle = [0, 0];
let g_dragStartMousePos = [0, 0]
let g_shapesList = [];

// ================================================================
// Main
// ================================================================

function main() {
    
    // Set up canvas and gl variables
    setUpWebGL();
    // Set up GLSL shader programs and connect GLSL variables
    connectVariablesToGLSL();

    // Set up actions for the HTML UI elements
    addActionsForHTMLUI();

    // Register function (event handler) to be called on a mouse press
    canvas.onmousedown = function(ev) { click(ev, true) };
    // If the mouse is down, draw.
    canvas.onmousemove = function(ev) { if(ev.buttons == 1) { click(ev, false); } };

    // Specify the color for clearing <canvas>
    gl.clearColor(0.0, 0.9, 0.8, 1.0);

    // Clear <canvas>
    renderAllShapes();
}

// ================================================================
// Initializers
// ================================================================

function setUpWebGL() {
    // Retrieve <canvas> element
    canvas = document.getElementById("webgl");

    // Get the rendering context for WebGL
    gl = canvas.getContext("webgl", {
        preserveDrawingBuffer: true
    });

    if (!gl) {
        console.log("Failed to get the rendering context for WebGL");
        return;
    }

    gl.enable(gl.DEPTH_TEST);
}

function connectVariablesToGLSL() {
    // Initialize shaders
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Failed to intialize shaders.');
        return;
    }

    a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Position < 0) {
        console.log("Failed to get the storage location of a_Position");
        return;
    }

    u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
    if (!u_FragColor) {
        console.log("Failed to get u_FragColor variable");
        return;
    }

    u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
    if (!u_ModelMatrix) {
        console.log("Failed to get u_ModelMatrix variable");
        return;
    }

    u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
    if (!u_GlobalRotateMatrix) {
        console.log("Failed to get u_GlobalRotateMatrix variable");
        return;
    }

    // Provide default values
    gl.vertexAttrib3f(a_Position, 0.0, 0.0, 0.0);

    let identityMatrix = new Matrix4();
    gl.uniformMatrix4fv(u_ModelMatrix, false, identityMatrix.elements);
}

function addActionsForHTMLUI() {
    // Initialize dynamic text
    sendTextTOHTML("lowerAngleLabel", "Left Angle (current: 0)");
    sendTextTOHTML("upperAngleLabel", "Right Angle (current: 0)");
    
    // Upper angle
    let upperAngle = document.getElementById("upperAngle")
    upperAngle.addEventListener("input", function() {
        sendTextTOHTML("upperAngleLabel", `Right Angle (current: ${this.value})`);
        g_upperAngle = this.value;
        renderAllShapes();
    });

    // Lower angle
    let lowerAngle = document.getElementById("lowerAngle")
    lowerAngle.addEventListener("input", function() {
        sendTextTOHTML("lowerAngleLabel", `Left Angle (current: ${this.value})`);
        g_lowerAngle = this.value;
        renderAllShapes();
    });

    // Camera angle
    let resetCam = document.getElementById("resetCam")
    resetCam.addEventListener("mousedown", function() {
        g_globalAngle = [0, 0];
        renderAllShapes();
    });
}

function clearCanvas() {
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.clear(gl.DEPTH_BUFFER_BIT);
}

// ================================================================
// Event callback methods
// ================================================================

function click(ev, dragStart) {

    // Extract the event click and convert to WebGL canvas space
    let [x, y] = coordinatesEventToGLSpace(ev);

    if (dragStart) {
        g_dragStartAngle = [g_globalAngle[0], g_globalAngle[1]];
        g_dragStartMousePos = [x, y]
    }

    g_globalAngle[0] = g_dragStartAngle[0] + ((x - g_dragStartMousePos[0]) * -180);
    g_globalAngle[1] = g_dragStartAngle[1] + ((y - g_dragStartMousePos[1]) * 180);
    renderAllShapes();
}

// ================================================================
// Render methods
// ================================================================

function coordinatesEventToGLSpace(ev) {
    var x = ev.clientX; // x coordinate of a mouse pointer
    var y = ev.clientY; // y coordinate of a mouse pointer
    var rect = ev.target.getBoundingClientRect();

    // Transform from client space to WebGL canvas space
    x = ((x - rect.left) - canvas.height/2)/(canvas.height/2);
    y = (canvas.width/2 - (y - rect.top))/(canvas.width/2);

    return [x, y];
}

function renderAllShapes() {

    // Store the time at the start of this function.
    let startTime = performance.now();

    // Pass in the global angle matrix
    let globalRotationMatrix = new Matrix4();
    globalRotationMatrix.rotate(g_globalAngle[0], 0, 1, 0);
    globalRotationMatrix.rotate(g_globalAngle[1], 1, 0, 0);
    gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotationMatrix.elements);

    // Clear <canvas>
    clearCanvas();

    let robe = new Pyramid4();
    robe.setColorHex("ff1158ff");
    robe.matrix.translate(0, -0.1, 0);
    robe.matrix.scale(0.5, 0.75, 0.5);
    robe.render();

    let head = new Cube(robe);
    head.setColorHex("6d5858ff");
    head.matrix.scale(1/0.5, 1/0.75, 1/0.5); // Undo parent scale
    
    head.matrix.translate(0, 0.0, 0);
    // head.matrix.rotate(-g_lowerAngle, 0, 0, 1);
    // head.matrix.rotate(-g_upperAngle, 1, 0, 0);
    head.matrix.translate(0, 0.3, 0);
    head.matrix.scale(0.25, 0.25, 0.25);
    head.render();
    // Render head decorations
    {
        let hair = new Cube(head);
        hair.setColorHex("ffffffff");
        hair.matrix.translate(0, 0, 0.2);
        hair.matrix.scale(1.2, 1.1, 0.8);
        hair.render();

        let eyePositions = [0.25, -0.25];
        eyePositions.forEach(eyePosition => {
            let sclera = new Cube(head);
            sclera.setColorHex("ffffffff");
            sclera.matrix.translate(eyePosition, 0, -0.46);
            sclera.matrix.scale(0.3, 0.2, 0.1);
            sclera.render();

            let iris = new Cube(sclera);
            iris.setColorHex("7799ccff");
            iris.matrix.translate(-eyePosition, 0, -0.46);
            iris.matrix.scale(0.4, 0.9, 0.1);
            iris.render();

            let pupil = new Cube(iris);
            pupil.setColorHex("000000ff");
            pupil.matrix.translate(-eyePosition, -0.2, -0.46);
            pupil.matrix.scale(0.5, 0.5, 1);
            pupil.render();

            let brow = new Cube(sclera);
            brow.setColorHex("442200ff");
            brow.matrix.rotate(eyePosition*80, 0, 0, 1);
            brow.matrix.translate(eyePosition, 1, -0.46);
            brow.matrix.scale(1, 0.75, 0.1);
            brow.render();
        });

        let mouth = new Pyramid4(head);
        mouth.setColorHex("000000ff");
        mouth.matrix.translate(0, -0.25, -0.5);
        mouth.matrix.scale(0.3, -0.1, 0.01);
        mouth.render();

        let tongue = new Octahedron(mouth);
        tongue.setColorHex("ff1158ff");
        tongue.matrix.scale(0.8, 1, 1);
        tongue.render();

        let beard = new Octahedron(head);
        beard.setColorHex("ffffffff");
        beard.matrix.translate(0, -0.7, 0);
        beard.matrix.scale(2, 2, 2);
        beard.render();

        let hat = new Pyramid4(head);
        hat.setColorHex("ff1158ff");
        hat.matrix.translate(0, 1.1, 0);
        hat.matrix.scale(1, 1.2, 1);
        hat.render();

        let hatBrim = new Cube(hat);
        hatBrim.matrix.translate(0, -0.5, 0);
        hatBrim.matrix.scale(2, 0.1, 2);
        hatBrim.render();

        let hatBauble = new Icosahedron(hat)
        hatBauble.setColorHex("ffbb22ff");
        hatBauble.matrix.translate(0, 0.5, 0);
        hatBauble.matrix.scale(0.3, 0.3/1.2, 0.3);
        hatBauble.render();
    }
    
    let arms = ["left", "right"]
    arms.forEach(side => {
        let armSign = (side == "left") ? -1 : 1;

        let sleeve = new Pyramid4(robe);
        sleeve.matrix.scale(1/0.5, 1/0.75, 1/0.5); // Undo parent scale

        sleeve.matrix.translate(armSign*0.1, 0.1, 0);
        sleeve.matrix.rotate((side == "left") ? -g_lowerAngle : g_upperAngle, 0, 0, 1);

        sleeve.matrix.translate(armSign*0.1, 0, 0); // Sets pivot to be tip of pyramid
        sleeve.matrix.rotate(armSign*90, 0, 0, 1);
        sleeve.matrix.scale(0.2, 0.2, 0.2);
        sleeve.render();

        let arm = new Pyramid4(sleeve);
        arm.setColorHex("6d5858ff");
        arm.matrix.translate(0, -1, 0);
        arm.matrix.scale(0.5, -1, 0.5);
        arm.render();
    });

    updatePerformanceDebug(2, startTime, performance.now());
}

// Robot arm
    // // Draw some cubes
    // let base = new Cube();
    // base.setColor(1.0,0.0,0.0,1.0);
    // base.matrix.translate(0, -0.9, 0);
    // base.matrix.scale(1, 1, 1);
    // base.render();

    // let lower = new Cube();
    // lower.setColor(1.0,1.0,0.0,1.0);
    // lower.matrix.translate(0, -0.5, 0);
    // lower.matrix.rotate(-g_lowerAngle, 0, 0, 1);
    // let lowerCoordsMatrix = new Matrix4(lower.matrix);
    // lower.matrix.scale(0.2, 1, 0.2);
    // lower.matrix.translate(0, 0.5, 0);
    // lower.render();

    // let upper = new Cube();
    // upper.setColor(1.0,0.0,1.0,1.0);
    // upper.matrix = lowerCoordsMatrix;
    // upper.matrix.translate(0, 1, 0);
    // upper.matrix.rotate(-g_upperAngle, 0, 0, 1);
    // upper.matrix.translate(0, 0.45, 0);
    // upper.matrix.scale(0.1, 1, 0.1);
    // upper.render();

// ================================================================
// Utility methods
// ================================================================

function updatePerformanceDebug(shapes, start, end) {
    let duration = end-start;
    sendTextTOHTML("performance",
                        `# shapes: ${shapes} | ms: ${Math.floor(duration)} | fps: ${Math.floor(10000/duration)/10}`)
}

function sendTextTOHTML(htmlID, text) {
    let htmlElm = document.getElementById(htmlID);
    if (!htmlElm) {
        console.log(`Failed to get ${htmlID} from HTML.`);
        return;
    }
    htmlElm.innerHTML = text;
}