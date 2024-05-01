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

let g_penLocked = false;
let g_penColor = [1.0, 1.0, 1.0, 1.0];
let g_penSize = 10.0;
let g_globalAngle = 0;
let g_penType = POINT;
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
    // Clear canvas button
    document.getElementById("clearCanvas").addEventListener("mouseup", function() {
        if (!g_penLocked) {
            g_shapesList = []; 
            renderAllShapes();
        }
    });

    // Initialize dynamic text
    g_penType = POINT;
    sendTextTOHTML("penType", "Pen Type (selected: POINT)");
    sendTextTOHTML("camAngleLabel", "Camera Angle (current: 0)");

    document.getElementById("penPoint").addEventListener("mouseup", function() { 
        g_penType = POINT;
        sendTextTOHTML("penType", "Pen Type (selected: POINT)");
    });
    document.getElementById("penTriangle").addEventListener("mouseup", function() { 
        g_penType = TRIANGLE;
        sendTextTOHTML("penType", "Pen Type (selected: TRIANGLE)");
    });
    document.getElementById("penCircle").addEventListener("mouseup", function() { 
        g_penType = CIRCLE;
        sendTextTOHTML("penType", "Pen Type (selected: CIRCLE)");
    });
    
    // Circle segment count slider
    let camAngle = document.getElementById("camAngle")
    camAngle.addEventListener("input", function() {
        sendTextTOHTML("camAngleLabel", `Camera Angle (current: ${this.value})`);
        g_globalAngle = this.value;
        renderAllShapes();
    });

    // Pen color sliders and color preview
    let penColorR = document.getElementById("penColor-r");
    let penColorG = document.getElementById("penColor-g");
    let penColorB = document.getElementById("penColor-b");
    penColorR.addEventListener("mouseup", function() {
        g_penColor[0] = this.value/255;
        colorChanged("penColorPreview");
    });
    penColorG.addEventListener("mouseup", function() { 
        g_penColor[1] = this.value/255
        colorChanged("penColorPreview"); 
    });
    penColorB.addEventListener("mouseup", function() {
        g_penColor[2] = this.value/255;
        colorChanged("penColorPreview");
    });
    penColorR.addEventListener("mousemove", function() {
        g_penColor[0] = this.value/255;
        colorChanged("penColorPreview");
    });
    penColorG.addEventListener("mousemove", function() { 
        g_penColor[1] = this.value/255
        colorChanged("penColorPreview"); 
    });
    penColorB.addEventListener("mousemove", function() {
        g_penColor[2] = this.value/255;
        colorChanged("penColorPreview");
    });

    // Pen size slider
    document.getElementById("penSize").addEventListener("mouseup", function() { g_penSize = this.value; });

    // Initialize HTML
    colorChanged("penColorPreview"); 
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

    let shape = undefined;
    switch (g_penType) {
        case POINT:
            shape = new Point();
            break;
        case TRIANGLE:
            shape = new Triangle();
            break;
        case CIRCLE:
            shape = new Circle();
            shape.setSegments(g_circleSegments);
            break;
    }
    
    if (shape != undefined) {
        shape.setPosition(x, y, 0.0);
        shape.setColor(...g_penColor);
        shape.setSize(g_penSize);

        g_shapesList.push(shape);

        // Draw every shape that's supposed to be on the canvas.
        renderAllShapes();
    }
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
    let body = new Cube();
    body.setColor(1.0,0.0,0.0,1.0);
    body.matrix.translate(-0.25, -0.5, 0.0);
    body.matrix.scale(0.5, 1, -0.5);
    body.render();

    // // Draw a left arm
    let leftArm = new Cube();
    leftArm.setColor(1.0,1.0,0.0,1.0);
    leftArm.matrix.translate(0.7, 0.0, 0.0);
    leftArm.matrix.rotate(45, 0, 0, 1);
    leftArm.matrix.scale(0.25, 0.7, 0.5);
    leftArm.render();

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

function colorChanged(htmlID) {
    sendTextTOHTML("penColor", `Pen Color (current: #${(g_penColor[0]*255).toString(16).toUpperCase()}` +
                                                    `${(g_penColor[1]*255).toString(16).toUpperCase()}` +
                                                    `${(g_penColor[2]*255).toString(16).toUpperCase()})`);

    let htmlElm = document.getElementById(htmlID);
    if (!htmlElm) {
        console.log(`Failed to get ${htmlID} from HTML.`);
        return;
    }
    htmlElm.style.backgroundColor = `rgb(${g_penColor[0]*255}, ${g_penColor[1]*255}, ${g_penColor[2]*255})`;
}

function sendTextTOHTML(htmlID, text) {
    let htmlElm = document.getElementById(htmlID);
    if (!htmlElm) {
        console.log(`Failed to get ${htmlID} from HTML.`);
        return;
    }
    htmlElm.innerHTML = text;
}