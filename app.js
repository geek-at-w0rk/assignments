// Wait for the DOM content to be fully loaded before setting up the Babylon.js scene
document.addEventListener("DOMContentLoaded", function () {
    // Get the canvas element where the 3D scene will be rendered
    var canvas = document.getElementById("renderCanvas");
    
    // Create the Babylon.js engine using the canvas
    var engine = new BABYLON.Engine(canvas, true);

    // Function to create the 3D scene
    var createScene = function () {
        // Create a new Babylon.js scene
        var scene = new BABYLON.Scene(engine);
        
        // Create an arc rotate camera that orbits around the origin (0,0,0)
        var camera = new BABYLON.ArcRotateCamera("camera", 0, 0, 5, BABYLON.Vector3.Zero(), scene);
        // Attach camera controls to the canvas for user interaction
        camera.attachControl(canvas, true);

        // Create a hemispheric light that illuminates the scene
        var light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);

        // Create a box mesh using MeshBuilder with face UV mapping
        var box = BABYLON.MeshBuilder.CreateBox("box", { size: 1, faceUV: [] }, scene);
        // Enable rendering of edges for the box
        box.enableEdgesRendering();
        box.edgesWidth = 4;

        // Variables to keep track of the selected face and extrusion state
        var selectedFaceIndex = -1; // The index of the selected face
        var extrusionInProgress = false; // Flag to indicate if extrusion is in progress
        var extrusionFactor = 0; // The amount of extrusion along the normal direction

        // Event handler when the user clicks on the canvas
        scene.onPointerDown = function (event, pickResult) {
            // Check if the picked mesh is the box
            if (pickResult.hit && pickResult.pickedMesh === box) {
                // Store the index of the selected face and start extrusion
                selectedFaceIndex = pickResult.subMeshId;
                extrusionInProgress = true;
            }
        };

        // Event handler when the user moves the mouse while holding it down
        scene.onPointerMove = function (event) {
            // Check if extrusion is in progress
            if (extrusionInProgress) {
                // Calculate extrusion based on mouse movement
                extrusionFactor += event.movementY * 0.01;
                // Get the vertices and indices of the box
                var newVertices = box.getVerticesData(BABYLON.VertexBuffer.PositionKind);
                var vertexIndices = box.getIndices();
                // Get the normal of the selected face
                var normal = box.getFacetNormal(selectedFaceIndex);
                // Iterate through vertex indices and update vertices based on selected face
                for (var i = 0; i < vertexIndices.length; i++) {
                    if (vertexIndices[i] === selectedFaceIndex) {
                        newVertices[i * 3] += normal.x * extrusionFactor;
                        newVertices[i * 3 + 1] += normal.y * extrusionFactor;
                        newVertices[i * 3 + 2] += normal.z * extrusionFactor;
                    }
                }
                // Update the box's vertices and normals
                box.updateVerticesData(BABYLON.VertexBuffer.PositionKind, newVertices);
                box.createNormals();
            }
        };

        // Event handler when the user releases the mouse button
        scene.onPointerUp = function (event) {
            // Reset extrusion state when mouse button is released
            extrusionInProgress = false;
            extrusionFactor = 0;
        };

        // Render loop for continuous rendering of the scene
        engine.runRenderLoop(function () {
            scene.render();
        });

        // Resize the canvas and scene when the browser window is resized
        window.addEventListener("resize", function () {
            engine.resize();
        });
    };

    // Call the createScene function to initialize the 3D scene
    createScene();
});
