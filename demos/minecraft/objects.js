

/* preloader for object enacted on hex tile mouseover */
function loadHexSelect() {
    var loader = new THREE.JSONLoader();
    loader.load( "models/cubeSelect.js", 
    function (geometry) { 
        // var geometry = new THREE.CubeGeometry(1,1,
        //     )
        hexSelect = new THREE.Mesh(geometry,new THREE.MeshLambertMaterial({
            color: 0x222222,
            opacity: 0.3,
            transparent: true,
            shading: THREE.FlatShading
        })  );
    }); 
}


