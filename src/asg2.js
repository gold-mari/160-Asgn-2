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
let g_globalAngle = 0;
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
    canvas.onmousedown = click;
    // If the mouse is down, draw.
    canvas.onmousemove = function(ev) { if(ev.buttons == 1) { click(ev); } };

    // Specify the color for clearing <canvas>
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

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
    sendTextTOHTML("lowerAngleLabel", "Lower Angle (current: 0)");
    sendTextTOHTML("upperAngleLabel", "Upper Angle (current: 0)");
    sendTextTOHTML("camAngleLabel", "Camera Angle (current: 0)");
    
    // Upper angle
    let upperAngle = document.getElementById("upperAngle")
    upperAngle.addEventListener("input", function() {
        sendTextTOHTML("upperAngleLabel", `Upper Angle (current: ${this.value})`);
        g_upperAngle = this.value;
        renderAllShapes();
    });

    // Lower angle
    let lowerAngle = document.getElementById("lowerAngle")
    lowerAngle.addEventListener("input", function() {
        sendTextTOHTML("lowerAngleLabel", `Lower Angle (current: ${this.value})`);
        g_lowerAngle = this.value;
        renderAllShapes();
    });

    // Camera angle
    let camAngle = document.getElementById("camAngle")
    camAngle.addEventListener("input", function() {
        sendTextTOHTML("camAngleLabel", `Camera Angle (current: ${this.value})`);
        g_globalAngle = this.value;
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

function click(ev) {

    if (g_penLocked) return;

    // Extract the event click and convert to WebGL canvas space
    let [x, y] = coordinatesEventToGLSpace(ev);

//     let shape = undefined;
//     switch (g_penType) {
//         case POINT:
//             shape = new Point();
//             break;
//         case TRIANGLE:
//             shape = new Triangle();
//             break;
//         case CIRCLE:
//             shape = new Circle();
//             shape.setSegments(g_circleSegments);
//             break;
//     }
    
//     if (shape != undefined) {
//         shape.setPosition(x, y, 0.0);
//         shape.setColor(...g_penColor);
//         shape.setSize(g_penSize);

//         g_shapesList.push(shape);

//         // Draw every shape that's supposed to be on the canvas.
//         renderAllShapes();
//     }
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
    let globalRotationMatrix = new Matrix4().rotate(g_globalAngle, 0, 1, 0);
    gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotationMatrix.elements);

    // Clear <canvas>
    clearCanvas();

    // Draw some cubes
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

    // // Primitive testing
    // let cube = new Cube();
    // cube.render();

    let octo = new Octohedron();
    octo.render();

    updatePerformanceDebug(2, startTime, performance.now());
}

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