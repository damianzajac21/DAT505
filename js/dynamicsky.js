/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.EffectComposer = function ( renderer, renderTarget ) {

	this.renderer = renderer;

	if ( renderTarget === undefined ) {

		var parameters = {
			minFilter: THREE.LinearFilter,
			magFilter: THREE.LinearFilter,
			format: THREE.RGBAFormat,
			stencilBuffer: false
		};
		var size = renderer.getSize();
		renderTarget = new THREE.WebGLRenderTarget( size.width, size.height, parameters );

	}

	this.renderTarget1 = renderTarget;
	this.renderTarget2 = renderTarget.clone();

	this.writeBuffer = this.renderTarget1;
	this.readBuffer = this.renderTarget2;

	this.passes = [];

	if ( THREE.CopyShader === undefined )
		console.error( "THREE.EffectComposer relies on THREE.CopyShader" );

	this.copyPass = new THREE.ShaderPass( THREE.CopyShader );

};

Object.assign( THREE.EffectComposer.prototype, {

	swapBuffers: function() {

		var tmp = this.readBuffer;
		this.readBuffer = this.writeBuffer;
		this.writeBuffer = tmp;

	},

	addPass: function ( pass ) {

		this.passes.push( pass );

		var size = this.renderer.getSize();
		pass.setSize( size.width, size.height );

	},

	insertPass: function ( pass, index ) {

		this.passes.splice( index, 0, pass );

	},

	render: function ( delta ) {

		var maskActive = false;

		var pass, i, il = this.passes.length;

		for ( i = 0; i < il; i ++ ) {

			pass = this.passes[ i ];

			if ( pass.enabled === false ) continue;

			pass.render( this.renderer, this.writeBuffer, this.readBuffer, delta, maskActive );

			if ( pass.needsSwap ) {

				if ( maskActive ) {

					var context = this.renderer.context;

					context.stencilFunc( context.NOTEQUAL, 1, 0xffffffff );

					this.copyPass.render( this.renderer, this.writeBuffer, this.readBuffer, delta );

					context.stencilFunc( context.EQUAL, 1, 0xffffffff );

				}

				this.swapBuffers();

			}

			if ( THREE.MaskPass !== undefined ) {

				if ( pass instanceof THREE.MaskPass ) {

					maskActive = true;

				} else if ( pass instanceof THREE.ClearMaskPass ) {

					maskActive = false;

				}

			}

		}

	},

	reset: function ( renderTarget ) {

		if ( renderTarget === undefined ) {

			var size = this.renderer.getSize();

			renderTarget = this.renderTarget1.clone();
			renderTarget.setSize( size.width, size.height );

		}

		this.renderTarget1.dispose();
		this.renderTarget2.dispose();
		this.renderTarget1 = renderTarget;
		this.renderTarget2 = renderTarget.clone();

		this.writeBuffer = this.renderTarget1;
		this.readBuffer = this.renderTarget2;

	},

	setSize: function ( width, height ) {

		this.renderTarget1.setSize( width, height );
		this.renderTarget2.setSize( width, height );

		for ( var i = 0; i < this.passes.length; i ++ ) {

			this.passes[i].setSize( width, height );

		}

	}

} );


THREE.Pass = function () {

	// if set to true, the pass is processed by the composer
	this.enabled = true;

	// if set to true, the pass indicates to swap read and write buffer after rendering
	this.needsSwap = true;

	// if set to true, the pass clears its buffer before rendering
	this.clear = false;

	// if set to true, the result of the pass is rendered to screen
	this.renderToScreen = false;

};

Object.assign( THREE.Pass.prototype, {

	setSize: function( width, height ) {},

	render: function ( renderer, writeBuffer, readBuffer, delta, maskActive ) {

		console.error( "THREE.Pass: .render() must be implemented in derived pass." );

	}

} );
/**
 * @author mrdoob / http://mrdoob.com/
 * @author jetienne / http://jetienne.com/
 */
/** @namespace */
var THREEx	= THREEx || {}

/**
 * provide info on THREE.WebGLRenderer
 *
 * @param {Object} renderer the renderer to update
 * @param {Object} Camera the camera to update
*/
THREEx.RendererStats	= function (){

	var msMin	= 100;
	var msMax	= 0;

	var container	= document.createElement( 'div' );
	container.style.cssText = 'width:80px;opacity:0.9;cursor:pointer';

	var msDiv	= document.createElement( 'div' );
	msDiv.style.cssText = 'padding:0 0 3px 3px;text-align:left;background-color:#200;';
	container.appendChild( msDiv );

	var msText	= document.createElement( 'div' );
	msText.style.cssText = 'color:#f00;font-family:Helvetica,Arial,sans-serif;font-size:9px;font-weight:bold;line-height:15px';
	msText.innerHTML= 'WebGLRenderer';
	msDiv.appendChild( msText );

	var msTexts	= [];
	var nLines	= 9;
	for(var i = 0; i < nLines; i++){
		msTexts[i]	= document.createElement( 'div' );
		msTexts[i].style.cssText = 'color:#f00;background-color:#311;font-family:Helvetica,Arial,sans-serif;font-size:9px;font-weight:bold;line-height:15px';
		msDiv.appendChild( msTexts[i] );
		msTexts[i].innerHTML= '-';
	}


	var lastTime	= Date.now();
	return {
		domElement: container,

		update: function(webGLRenderer){
			// sanity check
			console.assert(webGLRenderer instanceof THREE.WebGLRenderer)

			// refresh only 30time per second
			if( Date.now() - lastTime < 1000/30 )	return;
			lastTime	= Date.now()

			var i	= 0;
			msTexts[i++].textContent = "== Memory =====";
			msTexts[i++].textContent = "Programs: "	+ webGLRenderer.info.memory.programs;
			msTexts[i++].textContent = "Geometries: "+webGLRenderer.info.memory.geometries;
			msTexts[i++].textContent = "Textures: "	+ webGLRenderer.info.memory.textures;

			msTexts[i++].textContent = "== Render =====";
			msTexts[i++].textContent = "Calls: "	+ webGLRenderer.info.render.calls;
			msTexts[i++].textContent = "Vertices: "	+ webGLRenderer.info.render.vertices;
			msTexts[i++].textContent = "Faces: "	+ webGLRenderer.info.render.faces;
			msTexts[i++].textContent = "Points: "	+ webGLRenderer.info.render.points;
		}
	}
};
/**
* @author Tim Knip / http://www.floorplanner.com/ / tim at floorplanner.com
* @author Tony Parisi / http://www.tonyparisi.com/
*/

THREE.ColladaLoader = function () {

	var COLLADA = null;
	var scene = null;
	var visualScene;
	var kinematicsModel;

	var readyCallbackFunc = null;

	var sources = {};
	var images = {};
	var animations = {};
	var controllers = {};
	var geometries = {};
	var materials = {};
	var effects = {};
	var cameras = {};
	var lights = {};

	var animData;
	var kinematics;
	var visualScenes;
	var kinematicsModels;
	var baseUrl;
	var morphs;
	var skins;

	var flip_uv = true;
	var preferredShading = THREE.SmoothShading;

	var options = {
		// Force Geometry to always be centered at the local origin of the
		// containing Mesh.
		centerGeometry: false,

		// Axis conversion is done for geometries, animations, and controllers.
		// If we ever pull cameras or lights out of the COLLADA file, they'll
		// need extra work.
		convertUpAxis: false,

		subdivideFaces: true,

		upAxis: 'Y',

		// For reflective or refractive materials we'll use this cubemap
		defaultEnvMap: null

	};

	var colladaUnit = 1.0;
	var colladaUp = 'Y';
	var upConversion = null;

	function load ( url, readyCallback, progressCallback, failCallback ) {

		var length = 0;

		if ( document.implementation && document.implementation.createDocument ) {

			var request = new XMLHttpRequest();

			request.onreadystatechange = function() {

				if ( request.readyState === 4 ) {

					if ( request.status === 0 || request.status === 200 ) {

						if ( request.response ) {

							readyCallbackFunc = readyCallback;
							parse( request.response, undefined, url );

						} else {

							if ( failCallback ) {

								failCallback( { type: 'error', url: url } );

							} else {

								console.error( "ColladaLoader: Empty or non-existing file (" + url + ")" );

							}

						}

					}else{

						if( failCallback ){

							failCallback( { type: 'error', url: url } );

						}else{

							console.error( 'ColladaLoader: Couldn\'t load "' + url + '" (' + request.status + ')' );

						}

					}

				} else if ( request.readyState === 3 ) {

					if ( progressCallback ) {

						if ( length === 0 ) {

							length = request.getResponseHeader( "Content-Length" );

						}

						progressCallback( { total: length, loaded: request.responseText.length } );

					}

				}

			};

			request.open( "GET", url, true );
			request.send( null );

		} else {

			alert( "Don't know how to parse XML!" );

		}

	}

	function parse( text, callBack, url ) {

		COLLADA = new DOMParser().parseFromString( text, 'text/xml' );
		callBack = callBack || readyCallbackFunc;

		if ( url !== undefined ) {

			var parts = url.split( '/' );
			parts.pop();
			baseUrl = ( parts.length < 1 ? '.' : parts.join( '/' ) ) + '/';

		}

		parseAsset();
		setUpConversion();
		images = parseLib( "library_images image", _Image, "image" );
		materials = parseLib( "library_materials material", Material, "material" );
		effects = parseLib( "library_effects effect", Effect, "effect" );
		geometries = parseLib( "library_geometries geometry", Geometry, "geometry" );
		cameras = parseLib( "library_cameras camera", Camera, "camera" );
		lights = parseLib( "library_lights light", Light, "light" );
		controllers = parseLib( "library_controllers controller", Controller, "controller" );
		animations = parseLib( "library_animations animation", Animation, "animation" );
		visualScenes = parseLib( "library_visual_scenes visual_scene", VisualScene, "visual_scene" );
		kinematicsModels = parseLib( "library_kinematics_models kinematics_model", KinematicsModel, "kinematics_model" );

		morphs = [];
		skins = [];

		visualScene = parseScene();
		scene = new THREE.Group();

		for ( var i = 0; i < visualScene.nodes.length; i ++ ) {

			scene.add( createSceneGraph( visualScene.nodes[ i ] ) );

		}

		// unit conversion
		scene.scale.multiplyScalar( colladaUnit );

		createAnimations();

		kinematicsModel = parseKinematicsModel();
		createKinematics();

		var result = {

			scene: scene,
			morphs: morphs,
			skins: skins,
			animations: animData,
			kinematics: kinematics,
			dae: {
				images: images,
				materials: materials,
				cameras: cameras,
				lights: lights,
				effects: effects,
				geometries: geometries,
				controllers: controllers,
				animations: animations,
				visualScenes: visualScenes,
				visualScene: visualScene,
				scene: visualScene,
				kinematicsModels: kinematicsModels,
				kinematicsModel: kinematicsModel
			}

		};

		if ( callBack ) {

			callBack( result );

		}

		return result;

	}

	function setPreferredShading ( shading ) {

		preferredShading = shading;

	}

	function parseAsset () {

		var elements = COLLADA.querySelectorAll('asset');

		var element = elements[0];

		if ( element && element.childNodes ) {

			for ( var i = 0; i < element.childNodes.length; i ++ ) {

				var child = element.childNodes[ i ];

				switch ( child.nodeName ) {

					case 'unit':

						var meter = child.getAttribute( 'meter' );

						if ( meter ) {

							colladaUnit = parseFloat( meter );

						}

						break;

					case 'up_axis':

						colladaUp = child.textContent.charAt(0);
						break;

				}

			}

		}

	}

	function parseLib ( q, classSpec, prefix ) {

		var elements = COLLADA.querySelectorAll(q);

		var lib = {};

		var i = 0;

		var elementsLength = elements.length;

		for ( var j = 0; j < elementsLength; j ++ ) {

			var element = elements[j];
			var daeElement = ( new classSpec() ).parse( element );

			if ( !daeElement.id || daeElement.id.length === 0 ) daeElement.id = prefix + ( i ++ );
			lib[ daeElement.id ] = daeElement;

		}

		return lib;

	}

	function parseScene() {

		var sceneElement = COLLADA.querySelectorAll('scene instance_visual_scene')[0];

		if ( sceneElement ) {

			var url = sceneElement.getAttribute( 'url' ).replace( /^#/, '' );
			return visualScenes[ url.length > 0 ? url : 'visual_scene0' ];

		} else {

			return null;

		}

	}

	function parseKinematicsModel() {

		var kinematicsModelElement = COLLADA.querySelectorAll('instance_kinematics_model')[0];

		if ( kinematicsModelElement ) {

			var url = kinematicsModelElement.getAttribute( 'url' ).replace(/^#/, '');
			return kinematicsModels[ url.length > 0 ? url : 'kinematics_model0' ];

		} else {

			return null;

		}

	}

	function createAnimations() {

		animData = [];

		// fill in the keys
		recurseHierarchy( scene );

	}

	function recurseHierarchy( node ) {

		var n = visualScene.getChildById( node.colladaId, true ),
			newData = null;

		if ( n && n.keys ) {

			newData = {
				fps: 60,
				hierarchy: [ {
					node: n,
					keys: n.keys,
					sids: n.sids
				} ],
				node: node,
				name: 'animation_' + node.name,
				length: 0
			};

			animData.push(newData);

			for ( var i = 0, il = n.keys.length; i < il; i ++ ) {

				newData.length = Math.max( newData.length, n.keys[i].time );

			}

		} else {

			newData = {
				hierarchy: [ {
					keys: [],
					sids: []
				} ]
			}

		}

		for ( var i = 0, il = node.children.length; i < il; i ++ ) {

			var d = recurseHierarchy( node.children[i] );

			for ( var j = 0, jl = d.hierarchy.length; j < jl; j ++ ) {

				newData.hierarchy.push( {
					keys: [],
					sids: []
				} );

			}

		}

		return newData;

	}

	function calcAnimationBounds () {

		var start = 1000000;
		var end = -start;
		var frames = 0;
		var ID;
		for ( var id in animations ) {

			var animation = animations[ id ];
			ID = ID || animation.id;
			for ( var i = 0; i < animation.sampler.length; i ++ ) {

				var sampler = animation.sampler[ i ];

				sampler.create();

				start = Math.min( start, sampler.startTime );
				end = Math.max( end, sampler.endTime );
				frames = Math.max( frames, sampler.input.length );

			}

		}

		return { start:start, end:end, frames:frames,ID:ID };

	}

	function createMorph ( geometry, ctrl ) {

		var morphCtrl = ctrl instanceof InstanceController ? controllers[ ctrl.url ] : ctrl;

		if ( !morphCtrl || !morphCtrl.morph ) {

			console.log("could not find morph controller!");
			return;

		}

		var morph = morphCtrl.morph;

		for ( var i = 0; i < morph.targets.length; i ++ ) {

			var target_id = morph.targets[ i ];
			var daeGeometry = geometries[ target_id ];

			if ( !daeGeometry.mesh ||
				 !daeGeometry.mesh.primitives ||
				 !daeGeometry.mesh.primitives.length ) {
				 continue;
			}

			var target = daeGeometry.mesh.primitives[ 0 ].geometry;

			if ( target.vertices.length === geometry.vertices.length ) {

				geometry.morphTargets.push( { name: "target_1", vertices: target.vertices } );

			}

		}

		geometry.morphTargets.push( { name: "target_Z", vertices: geometry.vertices } );

	}

	function createSkin ( geometry, ctrl, applyBindShape ) {

		var skinCtrl = controllers[ ctrl.url ];

		if ( !skinCtrl || !skinCtrl.skin ) {

			console.log( "could not find skin controller!" );
			return;

		}

		if ( !ctrl.skeleton || !ctrl.skeleton.length ) {

			console.log( "could not find the skeleton for the skin!" );
			return;

		}

		var skin = skinCtrl.skin;
		var skeleton = visualScene.getChildById( ctrl.skeleton[ 0 ] );
		var hierarchy = [];

		applyBindShape = applyBindShape !== undefined ? applyBindShape : true;

		var bones = [];
		geometry.skinWeights = [];
		geometry.skinIndices = [];

		//createBones( geometry.bones, skin, hierarchy, skeleton, null, -1 );
		//createWeights( skin, geometry.bones, geometry.skinIndices, geometry.skinWeights );

		/*
		geometry.animation = {
			name: 'take_001',
			fps: 30,
			length: 2,
			JIT: true,
			hierarchy: hierarchy
		};
		*/

		if ( applyBindShape ) {

			for ( var i = 0; i < geometry.vertices.length; i ++ ) {

				geometry.vertices[ i ].applyMatrix4( skin.bindShapeMatrix );

			}

		}

	}

	function setupSkeleton ( node, bones, frame, parent ) {

		node.world = node.world || new THREE.Matrix4();
		node.localworld = node.localworld || new THREE.Matrix4();
		node.world.copy( node.matrix );
		node.localworld.copy( node.matrix );

		if ( node.channels && node.channels.length ) {

			var channel = node.channels[ 0 ];
			var m = channel.sampler.output[ frame ];

			if ( m instanceof THREE.Matrix4 ) {

				node.world.copy( m );
				node.localworld.copy(m);
				if (frame === 0)
					node.matrix.copy(m);
			}

		}

		if ( parent ) {

			node.world.multiplyMatrices( parent, node.world );

		}

		bones.push( node );

		for ( var i = 0; i < node.nodes.length; i ++ ) {

			setupSkeleton( node.nodes[ i ], bones, frame, node.world );

		}

	}

	function setupSkinningMatrices ( bones, skin ) {

		// FIXME: this is dumb...

		for ( var i = 0; i < bones.length; i ++ ) {

			var bone = bones[ i ];
			var found = -1;

			if ( bone.type != 'JOINT' ) continue;

			for ( var j = 0; j < skin.joints.length; j ++ ) {

				if ( bone.sid === skin.joints[ j ] ) {

					found = j;
					break;

				}

			}

			if ( found >= 0 ) {

				var inv = skin.invBindMatrices[ found ];

				bone.invBindMatrix = inv;
				bone.skinningMatrix = new THREE.Matrix4();
				bone.skinningMatrix.multiplyMatrices(bone.world, inv); // (IBMi * JMi)
				bone.animatrix = new THREE.Matrix4();

				bone.animatrix.copy(bone.localworld);
				bone.weights = [];

				for ( var j = 0; j < skin.weights.length; j ++ ) {

					for (var k = 0; k < skin.weights[ j ].length; k ++ ) {

						var w = skin.weights[ j ][ k ];

						if ( w.joint === found ) {

							bone.weights.push( w );

						}

					}

				}

			} else {

				console.warn( "ColladaLoader: Could not find joint '" + bone.sid + "'." );

				bone.skinningMatrix = new THREE.Matrix4();
				bone.weights = [];

			}
		}

	}

	//Walk the Collada tree and flatten the bones into a list, extract the position, quat and scale from the matrix
	function flattenSkeleton(skeleton) {

		var list = [];
		var walk = function(parentid, node, list) {

			var bone = {};
			bone.name = node.sid;
			bone.parent = parentid;
			bone.matrix = node.matrix;
			var data = [ new THREE.Vector3(),new THREE.Quaternion(),new THREE.Vector3() ];
			bone.matrix.decompose(data[0], data[1], data[2]);

			bone.pos = [ data[0].x,data[0].y,data[0].z ];

			bone.scl = [ data[2].x,data[2].y,data[2].z ];
			bone.rotq = [ data[1].x,data[1].y,data[1].z,data[1].w ];
			list.push(bone);

			for (var i in node.nodes) {

				walk(node.sid, node.nodes[i], list);

			}

		};

		walk(-1, skeleton, list);
		return list;

	}

	//Move the vertices into the pose that is proper for the start of the animation
	function skinToBindPose(geometry,skeleton,skinController) {

		var bones = [];
		setupSkeleton( skeleton, bones, -1 );
		setupSkinningMatrices( bones, skinController.skin );
		var v = new THREE.Vector3();
		var skinned = [];

		for (var i = 0; i < geometry.vertices.length; i ++) {

			skinned.push(new THREE.Vector3());

		}

		for ( i = 0; i < bones.length; i ++ ) {

			if ( bones[ i ].type != 'JOINT' ) continue;

			for ( var j = 0; j < bones[ i ].weights.length; j ++ ) {

				var w = bones[ i ].weights[ j ];
				var vidx = w.index;
				var weight = w.weight;

				var o = geometry.vertices[vidx];
				var s = skinned[vidx];

				v.x = o.x;
				v.y = o.y;
				v.z = o.z;

				v.applyMatrix4( bones[i].skinningMatrix );

				s.x += (v.x * weight);
				s.y += (v.y * weight);
				s.z += (v.z * weight);
			}

		}

		for (var i = 0; i < geometry.vertices.length; i ++) {

			geometry.vertices[i] = skinned[i];

		}

	}

	function applySkin ( geometry, instanceCtrl, frame ) {

		var skinController = controllers[ instanceCtrl.url ];

		frame = frame !== undefined ? frame : 40;

		if ( !skinController || !skinController.skin ) {

			console.log( 'ColladaLoader: Could not find skin controller.' );
			return;

		}

		if ( !instanceCtrl.skeleton || !instanceCtrl.skeleton.length ) {

			console.log( 'ColladaLoader: Could not find the skeleton for the skin. ' );
			return;

		}

		var animationBounds = calcAnimationBounds();
		var skeleton = visualScene.getChildById( instanceCtrl.skeleton[0], true ) || visualScene.getChildBySid( instanceCtrl.skeleton[0], true );

		//flatten the skeleton into a list of bones
		var bonelist = flattenSkeleton(skeleton);
		var joints = skinController.skin.joints;

		//sort that list so that the order reflects the order in the joint list
		var sortedbones = [];
		for (var i = 0; i < joints.length; i ++) {

			for (var j = 0; j < bonelist.length; j ++) {

				if (bonelist[j].name === joints[i]) {

					sortedbones[i] = bonelist[j];

				}

			}

		}

		//hook up the parents by index instead of name
		for (var i = 0; i < sortedbones.length; i ++) {

			for (var j = 0; j < sortedbones.length; j ++) {

				if (sortedbones[i].parent === sortedbones[j].name) {

					sortedbones[i].parent = j;

				}

			}

		}


		var i, j, w, vidx, weight;
		var v = new THREE.Vector3(), o, s;

		// move vertices to bind shape
		for ( i = 0; i < geometry.vertices.length; i ++ ) {
			geometry.vertices[i].applyMatrix4( skinController.skin.bindShapeMatrix );
		}

		var skinIndices = [];
		var skinWeights = [];
		var weights = skinController.skin.weights;

		// hook up the skin weights
		// TODO - this might be a good place to choose greatest 4 weights
		for ( var i =0; i < weights.length; i ++ ) {

			var indicies = new THREE.Vector4(weights[i][0] ? weights[i][0].joint : 0,weights[i][1] ? weights[i][1].joint : 0,weights[i][2] ? weights[i][2].joint : 0,weights[i][3] ? weights[i][3].joint : 0);
			var weight = new THREE.Vector4(weights[i][0] ? weights[i][0].weight : 0,weights[i][1] ? weights[i][1].weight : 0,weights[i][2] ? weights[i][2].weight : 0,weights[i][3] ? weights[i][3].weight : 0);

			skinIndices.push(indicies);
			skinWeights.push(weight);

		}

		geometry.skinIndices = skinIndices;
		geometry.skinWeights = skinWeights;
		geometry.bones = sortedbones;
		// process animation, or simply pose the rig if no animation

		//create an animation for the animated bones
		//NOTE: this has no effect when using morphtargets
		var animationdata = { "name":animationBounds.ID,"fps":30,"length":animationBounds.frames / 30,"hierarchy":[] };

		for (var j = 0; j < sortedbones.length; j ++) {

			animationdata.hierarchy.push({ parent:sortedbones[j].parent, name:sortedbones[j].name, keys:[] });

		}

		console.log( 'ColladaLoader:', animationBounds.ID + ' has ' + sortedbones.length + ' bones.' );



		skinToBindPose(geometry, skeleton, skinController);


		for ( frame = 0; frame < animationBounds.frames; frame ++ ) {

			var bones = [];
			var skinned = [];
			// process the frame and setup the rig with a fresh
			// transform, possibly from the bone's animation channel(s)

			setupSkeleton( skeleton, bones, frame );
			setupSkinningMatrices( bones, skinController.skin );

			for (var i = 0; i < bones.length; i ++) {

				for (var j = 0; j < animationdata.hierarchy.length; j ++) {

					if (animationdata.hierarchy[j].name === bones[i].sid) {

						var key = {};
						key.time = (frame / 30);
						key.matrix = bones[i].animatrix;

						if (frame === 0)
							bones[i].matrix = key.matrix;

						var data = [ new THREE.Vector3(),new THREE.Quaternion(),new THREE.Vector3() ];
						key.matrix.decompose(data[0], data[1], data[2]);

						key.pos = [ data[0].x,data[0].y,data[0].z ];

						key.scl = [ data[2].x,data[2].y,data[2].z ];
						key.rot = data[1];

						animationdata.hierarchy[j].keys.push(key);

					}

				}

			}

			geometry.animation = animationdata;

		}

	}

	function createKinematics() {

		if ( kinematicsModel && kinematicsModel.joints.length === 0 ) {
			kinematics = undefined;
			return;
		}

		var jointMap = {};

		var _addToMap = function( jointIndex, parentVisualElement ) {

			var parentVisualElementId = parentVisualElement.getAttribute( 'id' );
			var colladaNode = visualScene.getChildById( parentVisualElementId, true );
			var joint = kinematicsModel.joints[ jointIndex ];

			scene.traverse(function( node ) {

				if ( node.colladaId == parentVisualElementId ) {

					jointMap[ jointIndex ] = {
						node: node,
						transforms: colladaNode.transforms,
						joint: joint,
						position: joint.zeroPosition
					};

				}

			});

		};

		kinematics = {

			joints: kinematicsModel && kinematicsModel.joints,

			getJointValue: function( jointIndex ) {

				var jointData = jointMap[ jointIndex ];

				if ( jointData ) {

					return jointData.position;

				} else {

					console.log( 'getJointValue: joint ' + jointIndex + ' doesn\'t exist' );

				}

			},

			setJointValue: function( jointIndex, value ) {

				var jointData = jointMap[ jointIndex ];

				if ( jointData ) {

					var joint = jointData.joint;

					if ( value > joint.limits.max || value < joint.limits.min ) {

						console.log( 'setJointValue: joint ' + jointIndex + ' value ' + value + ' outside of limits (min: ' + joint.limits.min + ', max: ' + joint.limits.max + ')' );

					} else if ( joint.static ) {

						console.log( 'setJointValue: joint ' + jointIndex + ' is static' );

					} else {

						var threejsNode = jointData.node;
						var axis = joint.axis;
						var transforms = jointData.transforms;

						var matrix = new THREE.Matrix4();

						for (i = 0; i < transforms.length; i ++ ) {

							var transform = transforms[ i ];

							// kinda ghetto joint detection
							if ( transform.sid && transform.sid.indexOf( 'joint' + jointIndex ) !== -1 ) {

								// apply actual joint value here
								switch ( joint.type ) {

									case 'revolute':

										matrix.multiply( m1.makeRotationAxis( axis, THREE.Math.degToRad(value) ) );
										break;

									case 'prismatic':

										matrix.multiply( m1.makeTranslation(axis.x * value, axis.y * value, axis.z * value ) );
										break;

									default:

										console.warn( 'setJointValue: unknown joint type: ' + joint.type );
										break;

								}

							} else {

								var m1 = new THREE.Matrix4();

								switch ( transform.type ) {

									case 'matrix':

										matrix.multiply( transform.obj );

										break;

									case 'translate':

										matrix.multiply( m1.makeTranslation( transform.obj.x, transform.obj.y, transform.obj.z ) );

										break;

									case 'rotate':

										matrix.multiply( m1.makeRotationAxis( transform.obj, transform.angle ) );

										break;

								}
							}
						}

						// apply the matrix to the threejs node
						var elementsFloat32Arr = matrix.elements;
						var elements = Array.prototype.slice.call( elementsFloat32Arr );

						var elementsRowMajor = [
							elements[ 0 ],
							elements[ 4 ],
							elements[ 8 ],
							elements[ 12 ],
							elements[ 1 ],
							elements[ 5 ],
							elements[ 9 ],
							elements[ 13 ],
							elements[ 2 ],
							elements[ 6 ],
							elements[ 10 ],
							elements[ 14 ],
							elements[ 3 ],
							elements[ 7 ],
							elements[ 11 ],
							elements[ 15 ]
						];

						threejsNode.matrix.set.apply( threejsNode.matrix, elementsRowMajor );
						threejsNode.matrix.decompose( threejsNode.position, threejsNode.quaternion, threejsNode.scale );
					}

				} else {

					console.log( 'setJointValue: joint ' + jointIndex + ' doesn\'t exist' );

				}

			}

		};

		var element = COLLADA.querySelector('scene instance_kinematics_scene');

		if ( element ) {

			for ( var i = 0; i < element.childNodes.length; i ++ ) {

				var child = element.childNodes[ i ];

				if ( child.nodeType != 1 ) continue;

				switch ( child.nodeName ) {

					case 'bind_joint_axis':

						var visualTarget = child.getAttribute( 'target' ).split( '/' ).pop();
						var axis = child.querySelector('axis param').textContent;
						var jointIndex = parseInt( axis.split( 'joint' ).pop().split( '.' )[0] );
						var visualTargetElement = COLLADA.querySelector( '[sid="' + visualTarget + '"]' );

						if ( visualTargetElement ) {
							var parentVisualElement = visualTargetElement.parentElement;
							_addToMap(jointIndex, parentVisualElement);
						}

						break;

					default:

						break;

				}

			}
		}

	}

	function createSceneGraph ( node, parent ) {

		var obj = new THREE.Object3D();
		var skinned = false;
		var skinController;
		var morphController;
		var i, j;

		// FIXME: controllers

		for ( i = 0; i < node.controllers.length; i ++ ) {

			var controller = controllers[ node.controllers[ i ].url ];

			switch ( controller.type ) {

				case 'skin':

					if ( geometries[ controller.skin.source ] ) {

						var inst_geom = new InstanceGeometry();

						inst_geom.url = controller.skin.source;
						inst_geom.instance_material = node.controllers[ i ].instance_material;

						node.geometries.push( inst_geom );
						skinned = true;
						skinController = node.controllers[ i ];

					} else if ( controllers[ controller.skin.source ] ) {

						// urgh: controller can be chained
						// handle the most basic case...

						var second = controllers[ controller.skin.source ];
						morphController = second;
					//	skinController = node.controllers[i];

						if ( second.morph && geometries[ second.morph.source ] ) {

							var inst_geom = new InstanceGeometry();

							inst_geom.url = second.morph.source;
							inst_geom.instance_material = node.controllers[ i ].instance_material;

							node.geometries.push( inst_geom );

						}

					}

					break;

				case 'morph':

					if ( geometries[ controller.morph.source ] ) {

						var inst_geom = new InstanceGeometry();

						inst_geom.url = controller.morph.source;
						inst_geom.instance_material = node.controllers[ i ].instance_material;

						node.geometries.push( inst_geom );
						morphController = node.controllers[ i ];

					}

					console.log( 'ColladaLoader: Morph-controller partially supported.' );

				default:
					break;

			}

		}

		// geometries

		var double_sided_materials = {};

		for ( i = 0; i < node.geometries.length; i ++ ) {

			var instance_geometry = node.geometries[i];
			var instance_materials = instance_geometry.instance_material;
			var geometry = geometries[ instance_geometry.url ];
			var used_materials = {};
			var used_materials_array = [];
			var num_materials = 0;
			var first_material;

			if ( geometry ) {

				if ( !geometry.mesh || !geometry.mesh.primitives )
					continue;

				if ( obj.name.length === 0 ) {

					obj.name = geometry.id;

				}

				// collect used fx for this geometry-instance

				if ( instance_materials ) {

					for ( j = 0; j < instance_materials.length; j ++ ) {

						var instance_material = instance_materials[ j ];
						var mat = materials[ instance_material.target ];
						var effect_id = mat.instance_effect.url;
						var shader = effects[ effect_id ].shader;
						var material3js = shader.material;

						if ( geometry.doubleSided ) {

							if ( !( instance_material.symbol in double_sided_materials ) ) {

								var _copied_material = material3js.clone();
								_copied_material.side = THREE.DoubleSide;
								double_sided_materials[ instance_material.symbol ] = _copied_material;

							}

							material3js = double_sided_materials[ instance_material.symbol ];

						}

						material3js.opacity = !material3js.opacity ? 1 : material3js.opacity;
						used_materials[ instance_material.symbol ] = num_materials;
						used_materials_array.push( material3js );
						first_material = material3js;
						first_material.name = mat.name === null || mat.name === '' ? mat.id : mat.name;
						num_materials ++;

					}

				}

				var mesh;
				var material = first_material || new THREE.MeshLambertMaterial( { color: 0xdddddd, side: geometry.doubleSided ? THREE.DoubleSide : THREE.FrontSide } );
				var geom = geometry.mesh.geometry3js;

				if ( num_materials > 1 ) {

					material = new THREE.MultiMaterial( used_materials_array );

					for ( j = 0; j < geom.faces.length; j ++ ) {

						var face = geom.faces[ j ];
						face.materialIndex = used_materials[ face.daeMaterial ]

					}

				}

				if ( skinController !== undefined ) {


					applySkin( geom, skinController );

					if ( geom.morphTargets.length > 0 ) {

						material.morphTargets = true;
						material.skinning = false;

					} else {

						material.morphTargets = false;
						material.skinning = true;

					}


					mesh = new THREE.SkinnedMesh( geom, material, false );


					//mesh.skeleton = skinController.skeleton;
					//mesh.skinController = controllers[ skinController.url ];
					//mesh.skinInstanceController = skinController;
					mesh.name = 'skin_' + skins.length;



					//mesh.animationHandle.setKey(0);
					skins.push( mesh );

				} else if ( morphController !== undefined ) {

					createMorph( geom, morphController );

					material.morphTargets = true;

					mesh = new THREE.Mesh( geom, material );
					mesh.name = 'morph_' + morphs.length;

					morphs.push( mesh );

				} else {

					if ( geom.isLineStrip === true ) {

						mesh = new THREE.Line( geom );

					} else {

						mesh = new THREE.Mesh( geom, material );

					}

				}

				obj.add(mesh);

			}

		}

		for ( i = 0; i < node.cameras.length; i ++ ) {

			var instance_camera = node.cameras[i];
			var cparams = cameras[instance_camera.url];

			var cam = new THREE.PerspectiveCamera(cparams.yfov, parseFloat(cparams.aspect_ratio),
					parseFloat(cparams.znear), parseFloat(cparams.zfar));

			obj.add(cam);
		}

		for ( i = 0; i < node.lights.length; i ++ ) {

			var light = null;
			var instance_light = node.lights[i];
			var lparams = lights[instance_light.url];

			if ( lparams && lparams.technique ) {

				var color = lparams.color.getHex();
				var intensity = lparams.intensity;
				var distance = lparams.distance;
				var angle = lparams.falloff_angle;

				switch ( lparams.technique ) {

					case 'directional':

						light = new THREE.DirectionalLight( color, intensity, distance );
						light.position.set(0, 0, 1);
						break;

					case 'point':

						light = new THREE.PointLight( color, intensity, distance );
						break;

					case 'spot':

						light = new THREE.SpotLight( color, intensity, distance, angle );
						light.position.set(0, 0, 1);
						break;

					case 'ambient':

						light = new THREE.AmbientLight( color );
						break;

				}

			}

			if (light) {
				obj.add(light);
			}
		}

		obj.name = node.name || node.id || "";
		obj.colladaId = node.id || "";
		obj.layer = node.layer || "";
		obj.matrix = node.matrix;
		obj.matrix.decompose( obj.position, obj.quaternion, obj.scale );

		if ( options.centerGeometry && obj.geometry ) {

			var delta = obj.geometry.center();
			delta.multiply( obj.scale );
			delta.applyQuaternion( obj.quaternion );

			obj.position.sub( delta );

		}

		for ( i = 0; i < node.nodes.length; i ++ ) {

			obj.add( createSceneGraph( node.nodes[i], node ) );

		}

		return obj;

	}

	function getJointId( skin, id ) {

		for ( var i = 0; i < skin.joints.length; i ++ ) {

			if ( skin.joints[ i ] === id ) {

				return i;

			}

		}

	}

	function getLibraryNode( id ) {

		var nodes = COLLADA.querySelectorAll('library_nodes node');

		for ( var i = 0; i < nodes.length; i++ ) {

			var attObj = nodes[i].attributes.getNamedItem('id');

			if ( attObj && attObj.value === id ) {

				return nodes[i];

			}

		}

		return undefined;

	}

	function getChannelsForNode ( node ) {

		var channels = [];
		var startTime = 1000000;
		var endTime = -1000000;

		for ( var id in animations ) {

			var animation = animations[id];

			for ( var i = 0; i < animation.channel.length; i ++ ) {

				var channel = animation.channel[i];
				var sampler = animation.sampler[i];
				var id = channel.target.split('/')[0];

				if ( id == node.id ) {

					sampler.create();
					channel.sampler = sampler;
					startTime = Math.min(startTime, sampler.startTime);
					endTime = Math.max(endTime, sampler.endTime);
					channels.push(channel);

				}

			}

		}

		if ( channels.length ) {

			node.startTime = startTime;
			node.endTime = endTime;

		}

		return channels;

	}

	function calcFrameDuration( node ) {

		var minT = 10000000;

		for ( var i = 0; i < node.channels.length; i ++ ) {

			var sampler = node.channels[i].sampler;

			for ( var j = 0; j < sampler.input.length - 1; j ++ ) {

				var t0 = sampler.input[ j ];
				var t1 = sampler.input[ j + 1 ];
				minT = Math.min( minT, t1 - t0 );

			}
		}

		return minT;

	}

	function calcMatrixAt( node, t ) {

		var animated = {};

		var i, j;

		for ( i = 0; i < node.channels.length; i ++ ) {

			var channel = node.channels[ i ];
			animated[ channel.sid ] = channel;

		}

		var matrix = new THREE.Matrix4();

		for ( i = 0; i < node.transforms.length; i ++ ) {

			var transform = node.transforms[ i ];
			var channel = animated[ transform.sid ];

			if ( channel !== undefined ) {

				var sampler = channel.sampler;
				var value;

				for ( j = 0; j < sampler.input.length - 1; j ++ ) {

					if ( sampler.input[ j + 1 ] > t ) {

						value = sampler.output[ j ];
						//console.log(value.flatten)
						break;

					}

				}

				if ( value !== undefined ) {

					if ( value instanceof THREE.Matrix4 ) {

						matrix.multiplyMatrices( matrix, value );

					} else {

						// FIXME: handle other types

						matrix.multiplyMatrices( matrix, transform.matrix );

					}

				} else {

					matrix.multiplyMatrices( matrix, transform.matrix );

				}

			} else {

				matrix.multiplyMatrices( matrix, transform.matrix );

			}

		}

		return matrix;

	}

	function bakeAnimations ( node ) {

		if ( node.channels && node.channels.length ) {

			var keys = [],
				sids = [];

			for ( var i = 0, il = node.channels.length; i < il; i ++ ) {

				var channel = node.channels[i],
					fullSid = channel.fullSid,
					sampler = channel.sampler,
					input = sampler.input,
					transform = node.getTransformBySid( channel.sid ),
					member;

				if ( channel.arrIndices ) {

					member = [];

					for ( var j = 0, jl = channel.arrIndices.length; j < jl; j ++ ) {

						member[ j ] = getConvertedIndex( channel.arrIndices[ j ] );

					}

				} else {

					member = getConvertedMember( channel.member );

				}

				if ( transform ) {

					if ( sids.indexOf( fullSid ) === -1 ) {

						sids.push( fullSid );

					}

					for ( var j = 0, jl = input.length; j < jl; j ++ ) {

						var time = input[j],
							data = sampler.getData( transform.type, j, member ),
							key = findKey( keys, time );

						if ( !key ) {

							key = new Key( time );
							var timeNdx = findTimeNdx( keys, time );
							keys.splice( timeNdx === -1 ? keys.length : timeNdx, 0, key );

						}

						key.addTarget( fullSid, transform, member, data );

					}

				} else {

					console.log( 'Could not find transform "' + channel.sid + '" in node ' + node.id );

				}

			}

			// post process
			for ( var i = 0; i < sids.length; i ++ ) {

				var sid = sids[ i ];

				for ( var j = 0; j < keys.length; j ++ ) {

					var key = keys[ j ];

					if ( !key.hasTarget( sid ) ) {

						interpolateKeys( keys, key, j, sid );

					}

				}

			}

			node.keys = keys;
			node.sids = sids;

		}

	}

	function findKey ( keys, time) {

		var retVal = null;

		for ( var i = 0, il = keys.length; i < il && retVal === null; i ++ ) {

			var key = keys[i];

			if ( key.time === time ) {

				retVal = key;

			} else if ( key.time > time ) {

				break;

			}

		}

		return retVal;

	}

	function findTimeNdx ( keys, time) {

		var ndx = -1;

		for ( var i = 0, il = keys.length; i < il && ndx === -1; i ++ ) {

			var key = keys[i];

			if ( key.time >= time ) {

				ndx = i;

			}

		}

		return ndx;

	}

	function interpolateKeys ( keys, key, ndx, fullSid ) {

		var prevKey = getPrevKeyWith( keys, fullSid, ndx ? ndx - 1 : 0 ),
			nextKey = getNextKeyWith( keys, fullSid, ndx + 1 );

		if ( prevKey && nextKey ) {

			var scale = (key.time - prevKey.time) / (nextKey.time - prevKey.time),
				prevTarget = prevKey.getTarget( fullSid ),
				nextData = nextKey.getTarget( fullSid ).data,
				prevData = prevTarget.data,
				data;

			if ( prevTarget.type === 'matrix' ) {

				data = prevData;

			} else if ( prevData.length ) {

				data = [];

				for ( var i = 0; i < prevData.length; ++ i ) {

					data[ i ] = prevData[ i ] + ( nextData[ i ] - prevData[ i ] ) * scale;

				}

			} else {

				data = prevData + ( nextData - prevData ) * scale;

			}

			key.addTarget( fullSid, prevTarget.transform, prevTarget.member, data );

		}

	}

	// Get next key with given sid

	function getNextKeyWith( keys, fullSid, ndx ) {

		for ( ; ndx < keys.length; ndx ++ ) {

			var key = keys[ ndx ];

			if ( key.hasTarget( fullSid ) ) {

				return key;

			}

		}

		return null;

	}

	// Get previous key with given sid

	function getPrevKeyWith( keys, fullSid, ndx ) {

		ndx = ndx >= 0 ? ndx : ndx + keys.length;

		for ( ; ndx >= 0; ndx -- ) {

			var key = keys[ ndx ];

			if ( key.hasTarget( fullSid ) ) {

				return key;

			}

		}

		return null;

	}

	function _Image() {

		this.id = "";
		this.init_from = "";

	}

	_Image.prototype.parse = function(element) {

		this.id = element.getAttribute('id');

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[ i ];

			if ( child.nodeName === 'init_from' ) {

				this.init_from = child.textContent;

			}

		}

		return this;

	};

	function Controller() {

		this.id = "";
		this.name = "";
		this.type = "";
		this.skin = null;
		this.morph = null;

	}

	Controller.prototype.parse = function( element ) {

		this.id = element.getAttribute('id');
		this.name = element.getAttribute('name');
		this.type = "none";

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[ i ];

			switch ( child.nodeName ) {

				case 'skin':

					this.skin = (new Skin()).parse(child);
					this.type = child.nodeName;
					break;

				case 'morph':

					this.morph = (new Morph()).parse(child);
					this.type = child.nodeName;
					break;

				default:
					break;

			}
		}

		return this;

	};

	function Morph() {

		this.method = null;
		this.source = null;
		this.targets = null;
		this.weights = null;

	}

	Morph.prototype.parse = function( element ) {

		var sources = {};
		var inputs = [];
		var i;

		this.method = element.getAttribute( 'method' );
		this.source = element.getAttribute( 'source' ).replace( /^#/, '' );

		for ( i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[ i ];
			if ( child.nodeType != 1 ) continue;

			switch ( child.nodeName ) {

				case 'source':

					var source = ( new Source() ).parse( child );
					sources[ source.id ] = source;
					break;

				case 'targets':

					inputs = this.parseInputs( child );
					break;

				default:

					console.log( child.nodeName );
					break;

			}

		}

		for ( i = 0; i < inputs.length; i ++ ) {

			var input = inputs[ i ];
			var source = sources[ input.source ];

			switch ( input.semantic ) {

				case 'MORPH_TARGET':

					this.targets = source.read();
					break;

				case 'MORPH_WEIGHT':

					this.weights = source.read();
					break;

				default:
					break;

			}
		}

		return this;

	};

	Morph.prototype.parseInputs = function(element) {

		var inputs = [];

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[i];
			if ( child.nodeType != 1) continue;

			switch ( child.nodeName ) {

				case 'input':

					inputs.push( (new Input()).parse(child) );
					break;

				default:
					break;
			}
		}

		return inputs;

	};

	function Skin() {

		this.source = "";
		this.bindShapeMatrix = null;
		this.invBindMatrices = [];
		this.joints = [];
		this.weights = [];

	}

	Skin.prototype.parse = function( element ) {

		var sources = {};
		var joints, weights;

		this.source = element.getAttribute( 'source' ).replace( /^#/, '' );
		this.invBindMatrices = [];
		this.joints = [];
		this.weights = [];

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[i];
			if ( child.nodeType != 1 ) continue;

			switch ( child.nodeName ) {

				case 'bind_shape_matrix':

					var f = _floats(child.textContent);
					this.bindShapeMatrix = getConvertedMat4( f );
					break;

				case 'source':

					var src = new Source().parse(child);
					sources[ src.id ] = src;
					break;

				case 'joints':

					joints = child;
					break;

				case 'vertex_weights':

					weights = child;
					break;

				default:

					console.log( child.nodeName );
					break;

			}
		}

		this.parseJoints( joints, sources );
		this.parseWeights( weights, sources );

		return this;

	};

	Skin.prototype.parseJoints = function ( element, sources ) {

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[ i ];
			if ( child.nodeType != 1 ) continue;

			switch ( child.nodeName ) {

				case 'input':

					var input = ( new Input() ).parse( child );
					var source = sources[ input.source ];

					if ( input.semantic === 'JOINT' ) {

						this.joints = source.read();

					} else if ( input.semantic === 'INV_BIND_MATRIX' ) {

						this.invBindMatrices = source.read();

					}

					break;

				default:
					break;
			}

		}

	};

	Skin.prototype.parseWeights = function ( element, sources ) {

		var v, vcount, inputs = [];

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[ i ];
			if ( child.nodeType != 1 ) continue;

			switch ( child.nodeName ) {

				case 'input':

					inputs.push( ( new Input() ).parse( child ) );
					break;

				case 'v':

					v = _ints( child.textContent );
					break;

				case 'vcount':

					vcount = _ints( child.textContent );
					break;

				default:
					break;

			}

		}

		var index = 0;

		for ( var i = 0; i < vcount.length; i ++ ) {

			var numBones = vcount[i];
			var vertex_weights = [];

			for ( var j = 0; j < numBones; j ++ ) {

				var influence = {};

				for ( var k = 0; k < inputs.length; k ++ ) {

					var input = inputs[ k ];
					var value = v[ index + input.offset ];

					switch ( input.semantic ) {

						case 'JOINT':

							influence.joint = value;//this.joints[value];
							break;

						case 'WEIGHT':

							influence.weight = sources[ input.source ].data[ value ];
							break;

						default:
							break;

					}

				}

				vertex_weights.push( influence );
				index += inputs.length;
			}

			for ( var j = 0; j < vertex_weights.length; j ++ ) {

				vertex_weights[ j ].index = i;

			}

			this.weights.push( vertex_weights );

		}

	};

	function VisualScene () {

		this.id = "";
		this.name = "";
		this.nodes = [];
		this.scene = new THREE.Group();

	}

	VisualScene.prototype.getChildById = function( id, recursive ) {

		for ( var i = 0; i < this.nodes.length; i ++ ) {

			var node = this.nodes[ i ].getChildById( id, recursive );

			if ( node ) {

				return node;

			}

		}

		return null;

	};

	VisualScene.prototype.getChildBySid = function( sid, recursive ) {

		for ( var i = 0; i < this.nodes.length; i ++ ) {

			var node = this.nodes[ i ].getChildBySid( sid, recursive );

			if ( node ) {

				return node;

			}

		}

		return null;

	};

	VisualScene.prototype.parse = function( element ) {

		this.id = element.getAttribute( 'id' );
		this.name = element.getAttribute( 'name' );
		this.nodes = [];

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[ i ];
			if ( child.nodeType != 1 ) continue;

			switch ( child.nodeName ) {

				case 'node':

					this.nodes.push( ( new Node() ).parse( child ) );
					break;

				default:
					break;

			}

		}

		return this;

	};

	function Node() {

		this.id = "";
		this.name = "";
		this.sid = "";
		this.nodes = [];
		this.controllers = [];
		this.transforms = [];
		this.geometries = [];
		this.channels = [];
		this.matrix = new THREE.Matrix4();

	}

	Node.prototype.getChannelForTransform = function( transformSid ) {

		for ( var i = 0; i < this.channels.length; i ++ ) {

			var channel = this.channels[i];
			var parts = channel.target.split('/');
			var id = parts.shift();
			var sid = parts.shift();
			var dotSyntax = (sid.indexOf(".") >= 0);
			var arrSyntax = (sid.indexOf("(") >= 0);
			var arrIndices;
			var member;

			if ( dotSyntax ) {

				parts = sid.split(".");
				sid = parts.shift();
				member = parts.shift();

			} else if ( arrSyntax ) {

				arrIndices = sid.split("(");
				sid = arrIndices.shift();

				for ( var j = 0; j < arrIndices.length; j ++ ) {

					arrIndices[ j ] = parseInt( arrIndices[ j ].replace( /\)/, '' ) );

				}

			}

			if ( sid === transformSid ) {

				channel.info = { sid: sid, dotSyntax: dotSyntax, arrSyntax: arrSyntax, arrIndices: arrIndices };
				return channel;

			}

		}

		return null;

	};

	Node.prototype.getChildById = function ( id, recursive ) {

		if ( this.id === id ) {

			return this;

		}

		if ( recursive ) {

			for ( var i = 0; i < this.nodes.length; i ++ ) {

				var n = this.nodes[ i ].getChildById( id, recursive );

				if ( n ) {

					return n;

				}

			}

		}

		return null;

	};

	Node.prototype.getChildBySid = function ( sid, recursive ) {

		if ( this.sid === sid ) {

			return this;

		}

		if ( recursive ) {

			for ( var i = 0; i < this.nodes.length; i ++ ) {

				var n = this.nodes[ i ].getChildBySid( sid, recursive );

				if ( n ) {

					return n;

				}

			}
		}

		return null;

	};

	Node.prototype.getTransformBySid = function ( sid ) {

		for ( var i = 0; i < this.transforms.length; i ++ ) {

			if ( this.transforms[ i ].sid === sid ) return this.transforms[ i ];

		}

		return null;

	};

	Node.prototype.parse = function( element ) {

		var url;

		this.id = element.getAttribute('id');
		this.sid = element.getAttribute('sid');
		this.name = element.getAttribute('name');
		this.type = element.getAttribute('type');
		this.layer = element.getAttribute('layer');

		this.type = this.type === 'JOINT' ? this.type : 'NODE';

		this.nodes = [];
		this.transforms = [];
		this.geometries = [];
		this.cameras = [];
		this.lights = [];
		this.controllers = [];
		this.matrix = new THREE.Matrix4();

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[ i ];
			if ( child.nodeType != 1 ) continue;

			switch ( child.nodeName ) {

				case 'node':

					this.nodes.push( ( new Node() ).parse( child ) );
					break;

				case 'instance_camera':

					this.cameras.push( ( new InstanceCamera() ).parse( child ) );
					break;

				case 'instance_controller':

					this.controllers.push( ( new InstanceController() ).parse( child ) );
					break;

				case 'instance_geometry':

					this.geometries.push( ( new InstanceGeometry() ).parse( child ) );
					break;

				case 'instance_light':

					this.lights.push( ( new InstanceLight() ).parse( child ) );
					break;

				case 'instance_node':

					url = child.getAttribute( 'url' ).replace( /^#/, '' );
					var iNode = getLibraryNode( url );

					if ( iNode ) {

						this.nodes.push( ( new Node() ).parse( iNode )) ;

					}

					break;

				case 'rotate':
				case 'translate':
				case 'scale':
				case 'matrix':
				case 'lookat':
				case 'skew':

					this.transforms.push( ( new Transform() ).parse( child ) );
					break;

				case 'extra':
					break;

				default:

					console.log( child.nodeName );
					break;

			}

		}

		this.channels = getChannelsForNode( this );
		bakeAnimations( this );

		this.updateMatrix();

		return this;

	};

	Node.prototype.updateMatrix = function () {

		this.matrix.identity();

		for ( var i = 0; i < this.transforms.length; i ++ ) {

			this.transforms[ i ].apply( this.matrix );

		}

	};

	function Transform () {

		this.sid = "";
		this.type = "";
		this.data = [];
		this.obj = null;

	}

	Transform.prototype.parse = function ( element ) {

		this.sid = element.getAttribute( 'sid' );
		this.type = element.nodeName;
		this.data = _floats( element.textContent );
		this.convert();

		return this;

	};

	Transform.prototype.convert = function () {

		switch ( this.type ) {

			case 'matrix':

				this.obj = getConvertedMat4( this.data );
				break;

			case 'rotate':

				this.angle = THREE.Math.degToRad( this.data[3] );

			case 'translate':

				fixCoords( this.data, -1 );
				this.obj = new THREE.Vector3( this.data[ 0 ], this.data[ 1 ], this.data[ 2 ] );
				break;

			case 'scale':

				fixCoords( this.data, 1 );
				this.obj = new THREE.Vector3( this.data[ 0 ], this.data[ 1 ], this.data[ 2 ] );
				break;

			default:
				console.log( 'Can not convert Transform of type ' + this.type );
				break;

		}

	};

	Transform.prototype.apply = function () {

		var m1 = new THREE.Matrix4();

		return function ( matrix ) {

			switch ( this.type ) {

				case 'matrix':

					matrix.multiply( this.obj );

					break;

				case 'translate':

					matrix.multiply( m1.makeTranslation( this.obj.x, this.obj.y, this.obj.z ) );

					break;

				case 'rotate':

					matrix.multiply( m1.makeRotationAxis( this.obj, this.angle ) );

					break;

				case 'scale':

					matrix.scale( this.obj );

					break;

			}

		};

	}();

	Transform.prototype.update = function ( data, member ) {

		var members = [ 'X', 'Y', 'Z', 'ANGLE' ];

		switch ( this.type ) {

			case 'matrix':

				if ( ! member ) {

					this.obj.copy( data );

				} else if ( member.length === 1 ) {

					switch ( member[ 0 ] ) {

						case 0:

							this.obj.n11 = data[ 0 ];
							this.obj.n21 = data[ 1 ];
							this.obj.n31 = data[ 2 ];
							this.obj.n41 = data[ 3 ];

							break;

						case 1:

							this.obj.n12 = data[ 0 ];
							this.obj.n22 = data[ 1 ];
							this.obj.n32 = data[ 2 ];
							this.obj.n42 = data[ 3 ];

							break;

						case 2:

							this.obj.n13 = data[ 0 ];
							this.obj.n23 = data[ 1 ];
							this.obj.n33 = data[ 2 ];
							this.obj.n43 = data[ 3 ];

							break;

						case 3:

							this.obj.n14 = data[ 0 ];
							this.obj.n24 = data[ 1 ];
							this.obj.n34 = data[ 2 ];
							this.obj.n44 = data[ 3 ];

							break;

					}

				} else if ( member.length === 2 ) {

					var propName = 'n' + ( member[ 0 ] + 1 ) + ( member[ 1 ] + 1 );
					this.obj[ propName ] = data;

				} else {

					console.log('Incorrect addressing of matrix in transform.');

				}

				break;

			case 'translate':
			case 'scale':

				if ( Object.prototype.toString.call( member ) === '[object Array]' ) {

					member = members[ member[ 0 ] ];

				}

				switch ( member ) {

					case 'X':

						this.obj.x = data;
						break;

					case 'Y':

						this.obj.y = data;
						break;

					case 'Z':

						this.obj.z = data;
						break;

					default:

						this.obj.x = data[ 0 ];
						this.obj.y = data[ 1 ];
						this.obj.z = data[ 2 ];
						break;

				}

				break;

			case 'rotate':

				if ( Object.prototype.toString.call( member ) === '[object Array]' ) {

					member = members[ member[ 0 ] ];

				}

				switch ( member ) {

					case 'X':

						this.obj.x = data;
						break;

					case 'Y':

						this.obj.y = data;
						break;

					case 'Z':

						this.obj.z = data;
						break;

					case 'ANGLE':

						this.angle = THREE.Math.degToRad( data );
						break;

					default:

						this.obj.x = data[ 0 ];
						this.obj.y = data[ 1 ];
						this.obj.z = data[ 2 ];
						this.angle = THREE.Math.degToRad( data[ 3 ] );
						break;

				}
				break;

		}

	};

	function InstanceController() {

		this.url = "";
		this.skeleton = [];
		this.instance_material = [];

	}

	InstanceController.prototype.parse = function ( element ) {

		this.url = element.getAttribute('url').replace(/^#/, '');
		this.skeleton = [];
		this.instance_material = [];

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[ i ];
			if ( child.nodeType !== 1 ) continue;

			switch ( child.nodeName ) {

				case 'skeleton':

					this.skeleton.push( child.textContent.replace(/^#/, '') );
					break;

				case 'bind_material':

					var instances = child.querySelectorAll('instance_material');

					for ( var j = 0; j < instances.length; j ++ ) {

						var instance = instances[j];
						this.instance_material.push( (new InstanceMaterial()).parse(instance) );

					}


					break;

				case 'extra':
					break;

				default:
					break;

			}
		}

		return this;

	};

	function InstanceMaterial () {

		this.symbol = "";
		this.target = "";

	}

	InstanceMaterial.prototype.parse = function ( element ) {

		this.symbol = element.getAttribute('symbol');
		this.target = element.getAttribute('target').replace(/^#/, '');
		return this;

	};

	function InstanceGeometry() {

		this.url = "";
		this.instance_material = [];

	}

	InstanceGeometry.prototype.parse = function ( element ) {

		this.url = element.getAttribute('url').replace(/^#/, '');
		this.instance_material = [];

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[i];
			if ( child.nodeType != 1 ) continue;

			if ( child.nodeName === 'bind_material' ) {

				var instances = child.querySelectorAll('instance_material');

				for ( var j = 0; j < instances.length; j ++ ) {

					var instance = instances[j];
					this.instance_material.push( (new InstanceMaterial()).parse(instance) );

				}

				break;

			}

		}

		return this;

	};

	function Geometry() {

		this.id = "";
		this.mesh = null;

	}

	Geometry.prototype.parse = function ( element ) {

		this.id = element.getAttribute('id');

		extractDoubleSided( this, element );

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[i];

			switch ( child.nodeName ) {

				case 'mesh':

					this.mesh = (new Mesh(this)).parse(child);
					break;

				case 'extra':

					// console.log( child );
					break;

				default:
					break;
			}
		}

		return this;

	};

	function Mesh( geometry ) {

		this.geometry = geometry.id;
		this.primitives = [];
		this.vertices = null;
		this.geometry3js = null;

	}

	Mesh.prototype.parse = function ( element ) {

		this.primitives = [];

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[ i ];

			switch ( child.nodeName ) {

				case 'source':

					_source( child );
					break;

				case 'vertices':

					this.vertices = ( new Vertices() ).parse( child );
					break;

				case 'linestrips':

					this.primitives.push( ( new LineStrips().parse( child ) ) );
					break;

				case 'triangles':

					this.primitives.push( ( new Triangles().parse( child ) ) );
					break;

				case 'polygons':

					this.primitives.push( ( new Polygons().parse( child ) ) );
					break;

				case 'polylist':

					this.primitives.push( ( new Polylist().parse( child ) ) );
					break;

				default:
					break;

			}

		}

		this.geometry3js = new THREE.Geometry();

		if ( this.vertices === null ) {

			// TODO (mrdoob): Study case when this is null (carrier.dae)

			return this;

		}

		var vertexData = sources[ this.vertices.input['POSITION'].source ].data;

		for ( var i = 0; i < vertexData.length; i += 3 ) {

			this.geometry3js.vertices.push( getConvertedVec3( vertexData, i ).clone() );

		}

		for ( var i = 0; i < this.primitives.length; i ++ ) {

			var primitive = this.primitives[ i ];
			primitive.setVertices( this.vertices );
			this.handlePrimitive( primitive, this.geometry3js );

		}

		if ( this.geometry3js.calcNormals ) {

			this.geometry3js.computeVertexNormals();
			delete this.geometry3js.calcNormals;

		}

		return this;

	};

	Mesh.prototype.handlePrimitive = function ( primitive, geom ) {

		if ( primitive instanceof LineStrips ) {

			// TODO: Handle indices. Maybe easier with BufferGeometry?

			geom.isLineStrip = true;
			return;

		}

		var j, k, pList = primitive.p, inputs = primitive.inputs;
		var input, index, idx32;
		var source, numParams;
		var vcIndex = 0, vcount = 3, maxOffset = 0;
		var texture_sets = [];

		for ( j = 0; j < inputs.length; j ++ ) {

			input = inputs[ j ];

			var offset = input.offset + 1;
			maxOffset = (maxOffset < offset) ? offset : maxOffset;

			switch ( input.semantic ) {

				case 'TEXCOORD':
					texture_sets.push( input.set );
					break;

			}

		}

		for ( var pCount = 0; pCount < pList.length; ++ pCount ) {

			var p = pList[ pCount ], i = 0;

			while ( i < p.length ) {

				var vs = [];
				var ns = [];
				var ts = null;
				var cs = [];

				if ( primitive.vcount ) {

					vcount = primitive.vcount.length ? primitive.vcount[ vcIndex ++ ] : primitive.vcount;

				} else {

					vcount = p.length / maxOffset;

				}


				for ( j = 0; j < vcount; j ++ ) {

					for ( k = 0; k < inputs.length; k ++ ) {

						input = inputs[ k ];
						source = sources[ input.source ];

						index = p[ i + ( j * maxOffset ) + input.offset ];
						numParams = source.accessor.params.length;
						idx32 = index * numParams;

						switch ( input.semantic ) {

							case 'VERTEX':

								vs.push( index );

								break;

							case 'NORMAL':

								ns.push( getConvertedVec3( source.data, idx32 ) );

								break;

							case 'TEXCOORD':

								ts = ts || { };
								if ( ts[ input.set ] === undefined ) ts[ input.set ] = [];
								// invert the V
								ts[ input.set ].push( new THREE.Vector2( source.data[ idx32 ], source.data[ idx32 + 1 ] ) );

								break;

							case 'COLOR':

								cs.push( new THREE.Color().setRGB( source.data[ idx32 ], source.data[ idx32 + 1 ], source.data[ idx32 + 2 ] ) );

								break;

							default:

								break;

						}

					}

				}

				if ( ns.length === 0 ) {

					// check the vertices inputs
					input = this.vertices.input.NORMAL;

					if ( input ) {

						source = sources[ input.source ];
						numParams = source.accessor.params.length;

						for ( var ndx = 0, len = vs.length; ndx < len; ndx ++ ) {

							ns.push( getConvertedVec3( source.data, vs[ ndx ] * numParams ) );

						}

					} else {

						geom.calcNormals = true;

					}

				}

				if ( !ts ) {

					ts = { };
					// check the vertices inputs
					input = this.vertices.input.TEXCOORD;

					if ( input ) {

						texture_sets.push( input.set );
						source = sources[ input.source ];
						numParams = source.accessor.params.length;

						for ( var ndx = 0, len = vs.length; ndx < len; ndx ++ ) {

							idx32 = vs[ ndx ] * numParams;
							if ( ts[ input.set ] === undefined ) ts[ input.set ] = [ ];
							// invert the V
							ts[ input.set ].push( new THREE.Vector2( source.data[ idx32 ], 1.0 - source.data[ idx32 + 1 ] ) );

						}

					}

				}

				if ( cs.length === 0 ) {

					// check the vertices inputs
					input = this.vertices.input.COLOR;

					if ( input ) {

						source = sources[ input.source ];
						numParams = source.accessor.params.length;

						for ( var ndx = 0, len = vs.length; ndx < len; ndx ++ ) {

							idx32 = vs[ ndx ] * numParams;
							cs.push( new THREE.Color().setRGB( source.data[ idx32 ], source.data[ idx32 + 1 ], source.data[ idx32 + 2 ] ) );

						}

					}

				}

				var face = null, faces = [], uv, uvArr;

				if ( vcount === 3 ) {

					faces.push( new THREE.Face3( vs[0], vs[1], vs[2], ns, cs.length ? cs : new THREE.Color() ) );

				} else if ( vcount === 4 ) {

					faces.push( new THREE.Face3( vs[0], vs[1], vs[3], ns.length ? [ ns[0].clone(), ns[1].clone(), ns[3].clone() ] : [], cs.length ? [ cs[0], cs[1], cs[3] ] : new THREE.Color() ) );

					faces.push( new THREE.Face3( vs[1], vs[2], vs[3], ns.length ? [ ns[1].clone(), ns[2].clone(), ns[3].clone() ] : [], cs.length ? [ cs[1], cs[2], cs[3] ] : new THREE.Color() ) );

				} else if ( vcount > 4 && options.subdivideFaces ) {

					var clr = cs.length ? cs : new THREE.Color(),
						vec1, vec2, vec3, v1, v2, norm;

					// subdivide into multiple Face3s

					for ( k = 1; k < vcount - 1; ) {

						faces.push( new THREE.Face3( vs[0], vs[k], vs[k + 1], ns.length ? [ ns[0].clone(), ns[k ++].clone(), ns[k].clone() ] : [], clr ) );

					}

				}

				if ( faces.length ) {

					for ( var ndx = 0, len = faces.length; ndx < len; ndx ++ ) {

						face = faces[ndx];
						face.daeMaterial = primitive.material;
						geom.faces.push( face );

						for ( k = 0; k < texture_sets.length; k ++ ) {

							uv = ts[ texture_sets[k] ];

							if ( vcount > 4 ) {

								// Grab the right UVs for the vertices in this face
								uvArr = [ uv[0], uv[ndx + 1], uv[ndx + 2] ];

							} else if ( vcount === 4 ) {

								if ( ndx === 0 ) {

									uvArr = [ uv[0], uv[1], uv[3] ];

								} else {

									uvArr = [ uv[1].clone(), uv[2], uv[3].clone() ];

								}

							} else {

								uvArr = [ uv[0], uv[1], uv[2] ];

							}

							if ( geom.faceVertexUvs[k] === undefined ) {

								geom.faceVertexUvs[k] = [];

							}

							geom.faceVertexUvs[k].push( uvArr );

						}

					}

				} else {

					console.log( 'dropped face with vcount ' + vcount + ' for geometry with id: ' + geom.id );

				}

				i += maxOffset * vcount;

			}

		}

	};

	function Polygons () {

		this.material = "";
		this.count = 0;
		this.inputs = [];
		this.vcount = null;
		this.p = [];
		this.geometry = new THREE.Geometry();

	}

	Polygons.prototype.setVertices = function ( vertices ) {

		for ( var i = 0; i < this.inputs.length; i ++ ) {

			if ( this.inputs[ i ].source === vertices.id ) {

				this.inputs[ i ].source = vertices.input[ 'POSITION' ].source;

			}

		}

	};

	Polygons.prototype.parse = function ( element ) {

		this.material = element.getAttribute( 'material' );
		this.count = _attr_as_int( element, 'count', 0 );

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[ i ];

			switch ( child.nodeName ) {

				case 'input':

					this.inputs.push( ( new Input() ).parse( element.childNodes[ i ] ) );
					break;

				case 'vcount':

					this.vcount = _ints( child.textContent );
					break;

				case 'p':

					this.p.push( _ints( child.textContent ) );
					break;

				case 'ph':

					console.warn( 'polygon holes not yet supported!' );
					break;

				default:
					break;

			}

		}

		return this;

	};

	function Polylist () {

		Polygons.call( this );

		this.vcount = [];

	}

	Polylist.prototype = Object.create( Polygons.prototype );
	Polylist.prototype.constructor = Polylist;

	function LineStrips() {

		Polygons.call( this );

		this.vcount = 1;

	}

	LineStrips.prototype = Object.create( Polygons.prototype );
	LineStrips.prototype.constructor = LineStrips;

	function Triangles () {

		Polygons.call( this );

		this.vcount = 3;

	}

	Triangles.prototype = Object.create( Polygons.prototype );
	Triangles.prototype.constructor = Triangles;

	function Accessor() {

		this.source = "";
		this.count = 0;
		this.stride = 0;
		this.params = [];

	}

	Accessor.prototype.parse = function ( element ) {

		this.params = [];
		this.source = element.getAttribute( 'source' );
		this.count = _attr_as_int( element, 'count', 0 );
		this.stride = _attr_as_int( element, 'stride', 0 );

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[ i ];

			if ( child.nodeName === 'param' ) {

				var param = {};
				param[ 'name' ] = child.getAttribute( 'name' );
				param[ 'type' ] = child.getAttribute( 'type' );
				this.params.push( param );

			}

		}

		return this;

	};

	function Vertices() {

		this.input = {};

	}

	Vertices.prototype.parse = function ( element ) {

		this.id = element.getAttribute('id');

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			if ( element.childNodes[i].nodeName === 'input' ) {

				var input = ( new Input() ).parse( element.childNodes[ i ] );
				this.input[ input.semantic ] = input;

			}

		}

		return this;

	};

	function Input () {

		this.semantic = "";
		this.offset = 0;
		this.source = "";
		this.set = 0;

	}

	Input.prototype.parse = function ( element ) {

		this.semantic = element.getAttribute('semantic');
		this.source = element.getAttribute('source').replace(/^#/, '');
		this.set = _attr_as_int(element, 'set', -1);
		this.offset = _attr_as_int(element, 'offset', 0);

		if ( this.semantic === 'TEXCOORD' && this.set < 0 ) {

			this.set = 0;

		}

		return this;

	};

	function Source ( id ) {

		this.id = id;
		this.type = null;

	}

	Source.prototype.parse = function ( element ) {

		this.id = element.getAttribute( 'id' );

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[i];

			switch ( child.nodeName ) {

				case 'bool_array':

					this.data = _bools( child.textContent );
					this.type = child.nodeName;
					break;

				case 'float_array':

					this.data = _floats( child.textContent );
					this.type = child.nodeName;
					break;

				case 'int_array':

					this.data = _ints( child.textContent );
					this.type = child.nodeName;
					break;

				case 'IDREF_array':
				case 'Name_array':

					this.data = _strings( child.textContent );
					this.type = child.nodeName;
					break;

				case 'technique_common':

					for ( var j = 0; j < child.childNodes.length; j ++ ) {

						if ( child.childNodes[ j ].nodeName === 'accessor' ) {

							this.accessor = ( new Accessor() ).parse( child.childNodes[ j ] );
							break;

						}
					}
					break;

				default:
					// console.log(child.nodeName);
					break;

			}

		}

		return this;

	};

	Source.prototype.read = function () {

		var result = [];

		//for (var i = 0; i < this.accessor.params.length; i++) {

		var param = this.accessor.params[ 0 ];

			//console.log(param.name + " " + param.type);

		switch ( param.type ) {

			case 'IDREF':
			case 'Name': case 'name':
			case 'float':

				return this.data;

			case 'float4x4':

				for ( var j = 0; j < this.data.length; j += 16 ) {

					var s = this.data.slice( j, j + 16 );
					var m = getConvertedMat4( s );
					result.push( m );
				}

				break;

			default:

				console.log( 'ColladaLoader: Source: Read dont know how to read ' + param.type + '.' );
				break;

		}

		//}

		return result;

	};

	function Material () {

		this.id = "";
		this.name = "";
		this.instance_effect = null;

	}

	Material.prototype.parse = function ( element ) {

		this.id = element.getAttribute( 'id' );
		this.name = element.getAttribute( 'name' );

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			if ( element.childNodes[ i ].nodeName === 'instance_effect' ) {

				this.instance_effect = ( new InstanceEffect() ).parse( element.childNodes[ i ] );
				break;

			}

		}

		return this;

	};

	function ColorOrTexture () {

		this.color = new THREE.Color();
		this.color.setRGB( Math.random(), Math.random(), Math.random() );
		this.color.a = 1.0;

		this.texture = null;
		this.texcoord = null;
		this.texOpts = null;

	}

	ColorOrTexture.prototype.isColor = function () {

		return ( this.texture === null );

	};

	ColorOrTexture.prototype.isTexture = function () {

		return ( this.texture != null );

	};

	ColorOrTexture.prototype.parse = function ( element ) {

		if (element.nodeName === 'transparent') {

			this.opaque = element.getAttribute('opaque');

		}

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[ i ];
			if ( child.nodeType != 1 ) continue;

			switch ( child.nodeName ) {

				case 'color':

					var rgba = _floats( child.textContent );
					this.color = new THREE.Color();
					this.color.setRGB( rgba[0], rgba[1], rgba[2] );
					this.color.a = rgba[3];
					break;

				case 'texture':

					this.texture = child.getAttribute('texture');
					this.texcoord = child.getAttribute('texcoord');
					// Defaults from:
					// https://collada.org/mediawiki/index.php/Maya_texture_placement_MAYA_extension
					this.texOpts = {
						offsetU: 0,
						offsetV: 0,
						repeatU: 1,
						repeatV: 1,
						wrapU: 1,
						wrapV: 1
					};
					this.parseTexture( child );
					break;

				default:
					break;

			}

		}

		return this;

	};

	ColorOrTexture.prototype.parseTexture = function ( element ) {

		if ( ! element.childNodes ) return this;

		// This should be supported by Maya, 3dsMax, and MotionBuilder

		if ( element.childNodes[1] && element.childNodes[1].nodeName === 'extra' ) {

			element = element.childNodes[1];

			if ( element.childNodes[1] && element.childNodes[1].nodeName === 'technique' ) {

				element = element.childNodes[1];

			}

		}

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[ i ];

			switch ( child.nodeName ) {

				case 'offsetU':
				case 'offsetV':
				case 'repeatU':
				case 'repeatV':

					this.texOpts[ child.nodeName ] = parseFloat( child.textContent );

					break;

				case 'wrapU':
				case 'wrapV':

					// some dae have a value of true which becomes NaN via parseInt

					if ( child.textContent.toUpperCase() === 'TRUE' ) {

						this.texOpts[ child.nodeName ] = 1;

					} else {

						this.texOpts[ child.nodeName ] = parseInt( child.textContent );

					}
					break;

				default:

					this.texOpts[ child.nodeName ] = child.textContent;

					break;

			}

		}

		return this;

	};

	function Shader ( type, effect ) {

		this.type = type;
		this.effect = effect;
		this.material = null;

	}

	Shader.prototype.parse = function ( element ) {

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[ i ];
			if ( child.nodeType != 1 ) continue;

			switch ( child.nodeName ) {

				case 'emission':
				case 'diffuse':
				case 'specular':
				case 'transparent':

					this[ child.nodeName ] = ( new ColorOrTexture() ).parse( child );
					break;

				case 'bump':

					// If 'bumptype' is 'heightfield', create a 'bump' property
					// Else if 'bumptype' is 'normalmap', create a 'normal' property
					// (Default to 'bump')
					var bumpType = child.getAttribute( 'bumptype' );
					if ( bumpType ) {
						if ( bumpType.toLowerCase() === "heightfield" ) {
							this[ 'bump' ] = ( new ColorOrTexture() ).parse( child );
						} else if ( bumpType.toLowerCase() === "normalmap" ) {
							this[ 'normal' ] = ( new ColorOrTexture() ).parse( child );
						} else {
							console.error( "Shader.prototype.parse: Invalid value for attribute 'bumptype' (" + bumpType + ") - valid bumptypes are 'HEIGHTFIELD' and 'NORMALMAP' - defaulting to 'HEIGHTFIELD'" );
							this[ 'bump' ] = ( new ColorOrTexture() ).parse( child );
						}
					} else {
						console.warn( "Shader.prototype.parse: Attribute 'bumptype' missing from bump node - defaulting to 'HEIGHTFIELD'" );
						this[ 'bump' ] = ( new ColorOrTexture() ).parse( child );
					}

					break;

				case 'shininess':
				case 'reflectivity':
				case 'index_of_refraction':
				case 'transparency':

					var f = child.querySelectorAll('float');

					if ( f.length > 0 )
						this[ child.nodeName ] = parseFloat( f[ 0 ].textContent );

					break;

				default:
					break;

			}

		}

		this.create();
		return this;

	};

	Shader.prototype.create = function() {

		var props = {};

		var transparent = false;

		if (this['transparency'] !== undefined && this['transparent'] !== undefined) {
			// convert transparent color RBG to average value
			var transparentColor = this['transparent'];
			var transparencyLevel = (this.transparent.color.r + this.transparent.color.g + this.transparent.color.b) / 3 * this.transparency;

			if (transparencyLevel > 0) {
				transparent = true;
				props[ 'transparent' ] = true;
				props[ 'opacity' ] = 1 - transparencyLevel;

			}

		}

		var keys = {
			'diffuse':'map',
			'ambient':'lightMap',
			'specular':'specularMap',
			'emission':'emissionMap',
			'bump':'bumpMap',
			'normal':'normalMap'
			};

		for ( var prop in this ) {

			switch ( prop ) {

				case 'ambient':
				case 'emission':
				case 'diffuse':
				case 'specular':
				case 'bump':
				case 'normal':

					var cot = this[ prop ];

					if ( cot instanceof ColorOrTexture ) {

						if ( cot.isTexture() ) {

							var samplerId = cot.texture;
							var surfaceId = this.effect.sampler[samplerId];

							if ( surfaceId !== undefined && surfaceId.source !== undefined ) {

								var surface = this.effect.surface[surfaceId.source];

								if ( surface !== undefined ) {

									var image = images[ surface.init_from ];

									if ( image ) {

										var url = baseUrl + image.init_from;

										var texture;
										var loader = THREE.Loader.Handlers.get( url );

										if ( loader !== null ) {

											texture = loader.load( url );

										} else {

											texture = new THREE.Texture();

											loadTextureImage( texture, url );

										}

										texture.wrapS = cot.texOpts.wrapU ? THREE.RepeatWrapping : THREE.ClampToEdgeWrapping;
										texture.wrapT = cot.texOpts.wrapV ? THREE.RepeatWrapping : THREE.ClampToEdgeWrapping;
										texture.offset.x = cot.texOpts.offsetU;
										texture.offset.y = cot.texOpts.offsetV;
										texture.repeat.x = cot.texOpts.repeatU;
										texture.repeat.y = cot.texOpts.repeatV;
										props[keys[prop]] = texture;

										// Texture with baked lighting?
										if (prop === 'emission') props['emissive'] = 0xffffff;

									}

								}

							}

						} else if ( prop === 'diffuse' || !transparent ) {

							if ( prop === 'emission' ) {

								props[ 'emissive' ] = cot.color.getHex();

							} else {

								props[ prop ] = cot.color.getHex();

							}

						}

					}

					break;

				case 'shininess':

					props[ prop ] = this[ prop ];
					break;

				case 'reflectivity':

					props[ prop ] = this[ prop ];
					if ( props[ prop ] > 0.0 ) props['envMap'] = options.defaultEnvMap;
					props['combine'] = THREE.MixOperation;	//mix regular shading with reflective component
					break;

				case 'index_of_refraction':

					props[ 'refractionRatio' ] = this[ prop ]; //TODO: "index_of_refraction" becomes "refractionRatio" in shader, but I'm not sure if the two are actually comparable
					if ( this[ prop ] !== 1.0 ) props['envMap'] = options.defaultEnvMap;
					break;

				case 'transparency':
					// gets figured out up top
					break;

				default:
					break;

			}

		}

		props[ 'shading' ] = preferredShading;
		props[ 'side' ] = this.effect.doubleSided ? THREE.DoubleSide : THREE.FrontSide;

		if ( props.diffuse !== undefined ) {

			props.color = props.diffuse;
			delete props.diffuse;

		}

		switch ( this.type ) {

			case 'constant':

				if (props.emissive != undefined) props.color = props.emissive;
				this.material = new THREE.MeshBasicMaterial( props );
				break;

			case 'phong':
			case 'blinn':

				this.material = new THREE.MeshPhongMaterial( props );
				break;

			case 'lambert':
			default:

				this.material = new THREE.MeshLambertMaterial( props );
				break;

		}

		return this.material;

	};

	function Surface ( effect ) {

		this.effect = effect;
		this.init_from = null;
		this.format = null;

	}

	Surface.prototype.parse = function ( element ) {

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[ i ];
			if ( child.nodeType != 1 ) continue;

			switch ( child.nodeName ) {

				case 'init_from':

					this.init_from = child.textContent;
					break;

				case 'format':

					this.format = child.textContent;
					break;

				default:

					console.log( "unhandled Surface prop: " + child.nodeName );
					break;

			}

		}

		return this;

	};

	function Sampler2D ( effect ) {

		this.effect = effect;
		this.source = null;
		this.wrap_s = null;
		this.wrap_t = null;
		this.minfilter = null;
		this.magfilter = null;
		this.mipfilter = null;

	}

	Sampler2D.prototype.parse = function ( element ) {

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[ i ];
			if ( child.nodeType != 1 ) continue;

			switch ( child.nodeName ) {

				case 'source':

					this.source = child.textContent;
					break;

				case 'minfilter':

					this.minfilter = child.textContent;
					break;

				case 'magfilter':

					this.magfilter = child.textContent;
					break;

				case 'mipfilter':

					this.mipfilter = child.textContent;
					break;

				case 'wrap_s':

					this.wrap_s = child.textContent;
					break;

				case 'wrap_t':

					this.wrap_t = child.textContent;
					break;

				default:

					console.log( "unhandled Sampler2D prop: " + child.nodeName );
					break;

			}

		}

		return this;

	};

	function Effect () {

		this.id = "";
		this.name = "";
		this.shader = null;
		this.surface = {};
		this.sampler = {};

	}

	Effect.prototype.create = function () {

		if ( this.shader === null ) {

			return null;

		}

	};

	Effect.prototype.parse = function ( element ) {

		this.id = element.getAttribute( 'id' );
		this.name = element.getAttribute( 'name' );

		extractDoubleSided( this, element );

		this.shader = null;

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[ i ];
			if ( child.nodeType != 1 ) continue;

			switch ( child.nodeName ) {

				case 'profile_COMMON':

					this.parseTechnique( this.parseProfileCOMMON( child ) );
					break;

				default:
					break;

			}

		}

		return this;

	};

	Effect.prototype.parseNewparam = function ( element ) {

		var sid = element.getAttribute( 'sid' );

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[ i ];
			if ( child.nodeType != 1 ) continue;

			switch ( child.nodeName ) {

				case 'surface':

					this.surface[sid] = ( new Surface( this ) ).parse( child );
					break;

				case 'sampler2D':

					this.sampler[sid] = ( new Sampler2D( this ) ).parse( child );
					break;

				case 'extra':

					break;

				default:

					console.log( child.nodeName );
					break;

			}

		}

	};

	Effect.prototype.parseProfileCOMMON = function ( element ) {

		var technique;

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[ i ];

			if ( child.nodeType != 1 ) continue;

			switch ( child.nodeName ) {

				case 'profile_COMMON':

					this.parseProfileCOMMON( child );
					break;

				case 'technique':

					technique = child;
					break;

				case 'newparam':

					this.parseNewparam( child );
					break;

				case 'image':

					var _image = ( new _Image() ).parse( child );
					images[ _image.id ] = _image;
					break;

				case 'extra':
					break;

				default:

					console.log( child.nodeName );
					break;

			}

		}

		return technique;

	};

	Effect.prototype.parseTechnique = function ( element ) {

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[i];
			if ( child.nodeType != 1 ) continue;

			switch ( child.nodeName ) {

				case 'constant':
				case 'lambert':
				case 'blinn':
				case 'phong':

					this.shader = ( new Shader( child.nodeName, this ) ).parse( child );
					break;
				case 'extra':
					this.parseExtra(child);
					break;
				default:
					break;

			}

		}

	};

	Effect.prototype.parseExtra = function ( element ) {

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[i];
			if ( child.nodeType != 1 ) continue;

			switch ( child.nodeName ) {

				case 'technique':
					this.parseExtraTechnique( child );
					break;
				default:
					break;

			}

		}

	};

	Effect.prototype.parseExtraTechnique = function ( element ) {

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[i];
			if ( child.nodeType != 1 ) continue;

			switch ( child.nodeName ) {

				case 'bump':
					this.shader.parse( element );
					break;
				default:
					break;

			}

		}

	};

	function InstanceEffect () {

		this.url = "";

	}

	InstanceEffect.prototype.parse = function ( element ) {

		this.url = element.getAttribute( 'url' ).replace( /^#/, '' );
		return this;

	};

	function Animation() {

		this.id = "";
		this.name = "";
		this.source = {};
		this.sampler = [];
		this.channel = [];

	}

	Animation.prototype.parse = function ( element ) {

		this.id = element.getAttribute( 'id' );
		this.name = element.getAttribute( 'name' );
		this.source = {};

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[ i ];

			if ( child.nodeType != 1 ) continue;

			switch ( child.nodeName ) {

				case 'animation':

					var anim = ( new Animation() ).parse( child );

					for ( var src in anim.source ) {

						this.source[ src ] = anim.source[ src ];

					}

					for ( var j = 0; j < anim.channel.length; j ++ ) {

						this.channel.push( anim.channel[ j ] );
						this.sampler.push( anim.sampler[ j ] );

					}

					break;

				case 'source':

					var src = ( new Source() ).parse( child );
					this.source[ src.id ] = src;
					break;

				case 'sampler':

					this.sampler.push( ( new Sampler( this ) ).parse( child ) );
					break;

				case 'channel':

					this.channel.push( ( new Channel( this ) ).parse( child ) );
					break;

				default:
					break;

			}

		}

		return this;

	};

	function Channel( animation ) {

		this.animation = animation;
		this.source = "";
		this.target = "";
		this.fullSid = null;
		this.sid = null;
		this.dotSyntax = null;
		this.arrSyntax = null;
		this.arrIndices = null;
		this.member = null;

	}

	Channel.prototype.parse = function ( element ) {

		this.source = element.getAttribute( 'source' ).replace( /^#/, '' );
		this.target = element.getAttribute( 'target' );

		var parts = this.target.split( '/' );

		var id = parts.shift();
		var sid = parts.shift();

		var dotSyntax = ( sid.indexOf(".") >= 0 );
		var arrSyntax = ( sid.indexOf("(") >= 0 );

		if ( dotSyntax ) {

			parts = sid.split(".");
			this.sid = parts.shift();
			this.member = parts.shift();

		} else if ( arrSyntax ) {

			var arrIndices = sid.split("(");
			this.sid = arrIndices.shift();

			for (var j = 0; j < arrIndices.length; j ++ ) {

				arrIndices[j] = parseInt( arrIndices[j].replace(/\)/, '') );

			}

			this.arrIndices = arrIndices;

		} else {

			this.sid = sid;

		}

		this.fullSid = sid;
		this.dotSyntax = dotSyntax;
		this.arrSyntax = arrSyntax;

		return this;

	};

	function Sampler ( animation ) {

		this.id = "";
		this.animation = animation;
		this.inputs = [];
		this.input = null;
		this.output = null;
		this.strideOut = null;
		this.interpolation = null;
		this.startTime = null;
		this.endTime = null;
		this.duration = 0;

	}

	Sampler.prototype.parse = function ( element ) {

		this.id = element.getAttribute( 'id' );
		this.inputs = [];

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[ i ];
			if ( child.nodeType != 1 ) continue;

			switch ( child.nodeName ) {

				case 'input':

					this.inputs.push( (new Input()).parse( child ) );
					break;

				default:
					break;

			}

		}

		return this;

	};

	Sampler.prototype.create = function () {

		for ( var i = 0; i < this.inputs.length; i ++ ) {

			var input = this.inputs[ i ];
			var source = this.animation.source[ input.source ];

			switch ( input.semantic ) {

				case 'INPUT':

					this.input = source.read();
					break;

				case 'OUTPUT':

					this.output = source.read();
					this.strideOut = source.accessor.stride;
					break;

				case 'INTERPOLATION':

					this.interpolation = source.read();
					break;

				case 'IN_TANGENT':

					break;

				case 'OUT_TANGENT':

					break;

				default:

					console.log(input.semantic);
					break;

			}

		}

		this.startTime = 0;
		this.endTime = 0;
		this.duration = 0;

		if ( this.input.length ) {

			this.startTime = 1000000;
			this.endTime = -1000000;

			for ( var i = 0; i < this.input.length; i ++ ) {

				this.startTime = Math.min( this.startTime, this.input[ i ] );
				this.endTime = Math.max( this.endTime, this.input[ i ] );

			}

			this.duration = this.endTime - this.startTime;

		}

	};

	Sampler.prototype.getData = function ( type, ndx, member ) {

		var data;

		if ( type === 'matrix' && this.strideOut === 16 ) {

			data = this.output[ ndx ];

		} else if ( this.strideOut > 1 ) {

			data = [];
			ndx *= this.strideOut;

			for ( var i = 0; i < this.strideOut; ++ i ) {

				data[ i ] = this.output[ ndx + i ];

			}

			if ( this.strideOut === 3 ) {

				switch ( type ) {

					case 'rotate':
					case 'translate':

						fixCoords( data, -1 );
						break;

					case 'scale':

						fixCoords( data, 1 );
						break;

				}

			} else if ( this.strideOut === 4 && type === 'matrix' ) {

				fixCoords( data, -1 );

			}

		} else {

			data = this.output[ ndx ];

			if ( member && type === 'translate' ) {
				data = getConvertedTranslation( member, data );
			}

		}

		return data;

	};

	function Key ( time ) {

		this.targets = [];
		this.time = time;

	}

	Key.prototype.addTarget = function ( fullSid, transform, member, data ) {

		this.targets.push( {
			sid: fullSid,
			member: member,
			transform: transform,
			data: data
		} );

	};

	Key.prototype.apply = function ( opt_sid ) {

		for ( var i = 0; i < this.targets.length; ++ i ) {

			var target = this.targets[ i ];

			if ( !opt_sid || target.sid === opt_sid ) {

				target.transform.update( target.data, target.member );

			}

		}

	};

	Key.prototype.getTarget = function ( fullSid ) {

		for ( var i = 0; i < this.targets.length; ++ i ) {

			if ( this.targets[ i ].sid === fullSid ) {

				return this.targets[ i ];

			}

		}

		return null;

	};

	Key.prototype.hasTarget = function ( fullSid ) {

		for ( var i = 0; i < this.targets.length; ++ i ) {

			if ( this.targets[ i ].sid === fullSid ) {

				return true;

			}

		}

		return false;

	};

	// TODO: Currently only doing linear interpolation. Should support full COLLADA spec.
	Key.prototype.interpolate = function ( nextKey, time ) {

		for ( var i = 0, l = this.targets.length; i < l; i ++ ) {

			var target = this.targets[ i ],
				nextTarget = nextKey.getTarget( target.sid ),
				data;

			if ( target.transform.type !== 'matrix' && nextTarget ) {

				var scale = ( time - this.time ) / ( nextKey.time - this.time ),
					nextData = nextTarget.data,
					prevData = target.data;

				if ( scale < 0 ) scale = 0;
				if ( scale > 1 ) scale = 1;

				if ( prevData.length ) {

					data = [];

					for ( var j = 0; j < prevData.length; ++ j ) {

						data[ j ] = prevData[ j ] + ( nextData[ j ] - prevData[ j ] ) * scale;

					}

				} else {

					data = prevData + ( nextData - prevData ) * scale;

				}

			} else {

				data = target.data;

			}

			target.transform.update( data, target.member );

		}

	};

	// Camera
	function Camera() {

		this.id = "";
		this.name = "";
		this.technique = "";

	}

	Camera.prototype.parse = function ( element ) {

		this.id = element.getAttribute( 'id' );
		this.name = element.getAttribute( 'name' );

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[ i ];
			if ( child.nodeType != 1 ) continue;

			switch ( child.nodeName ) {

				case 'optics':

					this.parseOptics( child );
					break;

				default:
					break;

			}

		}

		return this;

	};

	Camera.prototype.parseOptics = function ( element ) {

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			if ( element.childNodes[ i ].nodeName === 'technique_common' ) {

				var technique = element.childNodes[ i ];

				for ( var j = 0; j < technique.childNodes.length; j ++ ) {

					this.technique = technique.childNodes[ j ].nodeName;

					if ( this.technique === 'perspective' ) {

						var perspective = technique.childNodes[ j ];

						for ( var k = 0; k < perspective.childNodes.length; k ++ ) {

							var param = perspective.childNodes[ k ];

							switch ( param.nodeName ) {

								case 'yfov':
									this.yfov = param.textContent;
									break;
								case 'xfov':
									this.xfov = param.textContent;
									break;
								case 'znear':
									this.znear = param.textContent;
									break;
								case 'zfar':
									this.zfar = param.textContent;
									break;
								case 'aspect_ratio':
									this.aspect_ratio = param.textContent;
									break;

							}

						}

					} else if ( this.technique === 'orthographic' ) {

						var orthographic = technique.childNodes[ j ];

						for ( var k = 0; k < orthographic.childNodes.length; k ++ ) {

							var param = orthographic.childNodes[ k ];

							switch ( param.nodeName ) {

								case 'xmag':
									this.xmag = param.textContent;
									break;
								case 'ymag':
									this.ymag = param.textContent;
									break;
								case 'znear':
									this.znear = param.textContent;
									break;
								case 'zfar':
									this.zfar = param.textContent;
									break;
								case 'aspect_ratio':
									this.aspect_ratio = param.textContent;
									break;

							}

						}

					}

				}

			}

		}

		return this;

	};

	function InstanceCamera() {

		this.url = "";

	}

	InstanceCamera.prototype.parse = function ( element ) {

		this.url = element.getAttribute('url').replace(/^#/, '');

		return this;

	};

	// Light

	function Light() {

		this.id = "";
		this.name = "";
		this.technique = "";

	}

	Light.prototype.parse = function ( element ) {

		this.id = element.getAttribute( 'id' );
		this.name = element.getAttribute( 'name' );

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[ i ];
			if ( child.nodeType != 1 ) continue;

			switch ( child.nodeName ) {

				case 'technique_common':

					this.parseCommon( child );
					break;

				case 'technique':

					this.parseTechnique( child );
					break;

				default:
					break;

			}

		}

		return this;

	};

	Light.prototype.parseCommon = function ( element ) {

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			switch ( element.childNodes[ i ].nodeName ) {

				case 'directional':
				case 'point':
				case 'spot':
				case 'ambient':

					this.technique = element.childNodes[ i ].nodeName;

					var light = element.childNodes[ i ];

					for ( var j = 0; j < light.childNodes.length; j ++ ) {

						var child = light.childNodes[j];

						switch ( child.nodeName ) {

							case 'color':

								var rgba = _floats( child.textContent );
								this.color = new THREE.Color(0);
								this.color.setRGB( rgba[0], rgba[1], rgba[2] );
								this.color.a = rgba[3];
								break;

							case 'falloff_angle':

								this.falloff_angle = parseFloat( child.textContent );
								break;

							case 'quadratic_attenuation':
								var f = parseFloat( child.textContent );
								this.distance = f ? Math.sqrt( 1 / f ) : 0;
						}

					}

			}

		}

		return this;

	};

	Light.prototype.parseTechnique = function ( element ) {

		this.profile = element.getAttribute( 'profile' );

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[ i ];

			switch ( child.nodeName ) {

				case 'intensity':

					this.intensity = parseFloat(child.textContent);
					break;

			}

		}

		return this;

	};

	function InstanceLight() {

		this.url = "";

	}

	InstanceLight.prototype.parse = function ( element ) {

		this.url = element.getAttribute('url').replace(/^#/, '');

		return this;

	};

	function KinematicsModel( ) {

		this.id = '';
		this.name = '';
		this.joints = [];
		this.links = [];

	}

	KinematicsModel.prototype.parse = function( element ) {

		this.id = element.getAttribute('id');
		this.name = element.getAttribute('name');
		this.joints = [];
		this.links = [];

		for (var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[ i ];
			if ( child.nodeType != 1 ) continue;

			switch ( child.nodeName ) {

				case 'technique_common':

					this.parseCommon(child);
					break;

				default:
					break;

			}

		}

		return this;

	};

	KinematicsModel.prototype.parseCommon = function( element ) {

		for (var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[ i ];
			if ( child.nodeType != 1 ) continue;

			switch ( element.childNodes[ i ].nodeName ) {

				case 'joint':
					this.joints.push( (new Joint()).parse(child) );
					break;

				case 'link':
					this.links.push( (new Link()).parse(child) );
					break;

				default:
					break;

			}

		}

		return this;

	};

	function Joint( ) {

		this.sid = '';
		this.name = '';
		this.axis = new THREE.Vector3();
		this.limits = {
			min: 0,
			max: 0
		};
		this.type = '';
		this.static = false;
		this.zeroPosition = 0.0;
		this.middlePosition = 0.0;

	}

	Joint.prototype.parse = function( element ) {

		this.sid = element.getAttribute('sid');
		this.name = element.getAttribute('name');
		this.axis = new THREE.Vector3();
		this.limits = {
			min: 0,
			max: 0
		};
		this.type = '';
		this.static = false;
		this.zeroPosition = 0.0;
		this.middlePosition = 0.0;

		var axisElement = element.querySelector('axis');
		var _axis = _floats(axisElement.textContent);
		this.axis = getConvertedVec3(_axis, 0);

		var min = element.querySelector('limits min') ? parseFloat(element.querySelector('limits min').textContent) : -360;
		var max = element.querySelector('limits max') ? parseFloat(element.querySelector('limits max').textContent) : 360;

		this.limits = {
			min: min,
			max: max
		};

		var jointTypes = [ 'prismatic', 'revolute' ];
		for (var i = 0; i < jointTypes.length; i ++ ) {

			var type = jointTypes[ i ];

			var jointElement = element.querySelector(type);

			if ( jointElement ) {

				this.type = type;

			}

		}

		// if the min is equal to or somehow greater than the max, consider the joint static
		if ( this.limits.min >= this.limits.max ) {

			this.static = true;

		}

		this.middlePosition = (this.limits.min + this.limits.max) / 2.0;
		return this;

	};

	function Link( ) {

		this.sid = '';
		this.name = '';
		this.transforms = [];
		this.attachments = [];

	}

	Link.prototype.parse = function( element ) {

		this.sid = element.getAttribute('sid');
		this.name = element.getAttribute('name');
		this.transforms = [];
		this.attachments = [];

		for (var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[ i ];
			if ( child.nodeType != 1 ) continue;

			switch ( child.nodeName ) {

				case 'attachment_full':
					this.attachments.push( (new Attachment()).parse(child) );
					break;

				case 'rotate':
				case 'translate':
				case 'matrix':

					this.transforms.push( (new Transform()).parse(child) );
					break;

				default:

					break;

			}

		}

		return this;

	};

	function Attachment( ) {

		this.joint = '';
		this.transforms = [];
		this.links = [];

	}

	Attachment.prototype.parse = function( element ) {

		this.joint = element.getAttribute('joint').split('/').pop();
		this.links = [];

		for (var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[ i ];
			if ( child.nodeType != 1 ) continue;

			switch ( child.nodeName ) {

				case 'link':
					this.links.push( (new Link()).parse(child) );
					break;

				case 'rotate':
				case 'translate':
				case 'matrix':

					this.transforms.push( (new Transform()).parse(child) );
					break;

				default:

					break;

			}

		}

		return this;

	};

	function _source( element ) {

		var id = element.getAttribute( 'id' );

		if ( sources[ id ] != undefined ) {

			return sources[ id ];

		}

		sources[ id ] = ( new Source(id )).parse( element );
		return sources[ id ];

	}

	function _nsResolver( nsPrefix ) {

		if ( nsPrefix === "dae" ) {

			return "http://www.collada.org/2005/11/COLLADASchema";

		}

		return null;

	}

	function _bools( str ) {

		var raw = _strings( str );
		var data = [];

		for ( var i = 0, l = raw.length; i < l; i ++ ) {

			data.push( (raw[i] === 'true' || raw[i] === '1') ? true : false );

		}

		return data;

	}

	function _floats( str ) {

		var raw = _strings(str);
		var data = [];

		for ( var i = 0, l = raw.length; i < l; i ++ ) {

			data.push( parseFloat( raw[ i ] ) );

		}

		return data;

	}

	function _ints( str ) {

		var raw = _strings( str );
		var data = [];

		for ( var i = 0, l = raw.length; i < l; i ++ ) {

			data.push( parseInt( raw[ i ], 10 ) );

		}

		return data;

	}

	function _strings( str ) {

		return ( str.length > 0 ) ? _trimString( str ).split( /\s+/ ) : [];

	}

	function _trimString( str ) {

		return str.replace( /^\s+/, "" ).replace( /\s+$/, "" );

	}

	function _attr_as_float( element, name, defaultValue ) {

		if ( element.hasAttribute( name ) ) {

			return parseFloat( element.getAttribute( name ) );

		} else {

			return defaultValue;

		}

	}

	function _attr_as_int( element, name, defaultValue ) {

		if ( element.hasAttribute( name ) ) {

			return parseInt( element.getAttribute( name ), 10) ;

		} else {

			return defaultValue;

		}

	}

	function _attr_as_string( element, name, defaultValue ) {

		if ( element.hasAttribute( name ) ) {

			return element.getAttribute( name );

		} else {

			return defaultValue;

		}

	}

	function _format_float( f, num ) {

		if ( f === undefined ) {

			var s = '0.';

			while ( s.length < num + 2 ) {

				s += '0';

			}

			return s;

		}

		num = num || 2;

		var parts = f.toString().split( '.' );
		parts[ 1 ] = parts.length > 1 ? parts[ 1 ].substr( 0, num ) : "0";

		while ( parts[ 1 ].length < num ) {

			parts[ 1 ] += '0';

		}

		return parts.join( '.' );

	}

	function loadTextureImage ( texture, url ) {

		var loader = new THREE.ImageLoader();

		loader.load( url, function ( image ) {

			texture.image = image;
			texture.needsUpdate = true;

		} );

	}

	function extractDoubleSided( obj, element ) {

		obj.doubleSided = false;

		var node = element.querySelectorAll('extra double_sided')[0];

		if ( node ) {

			if ( node && parseInt( node.textContent, 10 ) === 1 ) {

				obj.doubleSided = true;

			}

		}

	}

	// Up axis conversion

	function setUpConversion() {

		if ( options.convertUpAxis !== true || colladaUp === options.upAxis ) {

			upConversion = null;

		} else {

			switch ( colladaUp ) {

				case 'X':

					upConversion = options.upAxis === 'Y' ? 'XtoY' : 'XtoZ';
					break;

				case 'Y':

					upConversion = options.upAxis === 'X' ? 'YtoX' : 'YtoZ';
					break;

				case 'Z':

					upConversion = options.upAxis === 'X' ? 'ZtoX' : 'ZtoY';
					break;

			}

		}

	}

	function fixCoords( data, sign ) {

		if ( options.convertUpAxis !== true || colladaUp === options.upAxis ) {

			return;

		}

		switch ( upConversion ) {

			case 'XtoY':

				var tmp = data[ 0 ];
				data[ 0 ] = sign * data[ 1 ];
				data[ 1 ] = tmp;
				break;

			case 'XtoZ':

				var tmp = data[ 2 ];
				data[ 2 ] = data[ 1 ];
				data[ 1 ] = data[ 0 ];
				data[ 0 ] = tmp;
				break;

			case 'YtoX':

				var tmp = data[ 0 ];
				data[ 0 ] = data[ 1 ];
				data[ 1 ] = sign * tmp;
				break;

			case 'YtoZ':

				var tmp = data[ 1 ];
				data[ 1 ] = sign * data[ 2 ];
				data[ 2 ] = tmp;
				break;

			case 'ZtoX':

				var tmp = data[ 0 ];
				data[ 0 ] = data[ 1 ];
				data[ 1 ] = data[ 2 ];
				data[ 2 ] = tmp;
				break;

			case 'ZtoY':

				var tmp = data[ 1 ];
				data[ 1 ] = data[ 2 ];
				data[ 2 ] = sign * tmp;
				break;

		}

	}

	function getConvertedTranslation( axis, data ) {

		if ( options.convertUpAxis !== true || colladaUp === options.upAxis ) {

			return data;

		}

		switch ( axis ) {
			case 'X':
				data = upConversion === 'XtoY' ? data * -1 : data;
				break;
			case 'Y':
				data = upConversion === 'YtoZ' || upConversion === 'YtoX' ? data * -1 : data;
				break;
			case 'Z':
				data = upConversion === 'ZtoY' ? data * -1 : data ;
				break;
			default:
				break;
		}

		return data;
	}

	function getConvertedVec3( data, offset ) {

		var arr = [ data[ offset ], data[ offset + 1 ], data[ offset + 2 ] ];
		fixCoords( arr, -1 );
		return new THREE.Vector3( arr[ 0 ], arr[ 1 ], arr[ 2 ] );

	}

	function getConvertedMat4( data ) {

		if ( options.convertUpAxis ) {

			// First fix rotation and scale

			// Columns first
			var arr = [ data[ 0 ], data[ 4 ], data[ 8 ] ];
			fixCoords( arr, -1 );
			data[ 0 ] = arr[ 0 ];
			data[ 4 ] = arr[ 1 ];
			data[ 8 ] = arr[ 2 ];
			arr = [ data[ 1 ], data[ 5 ], data[ 9 ] ];
			fixCoords( arr, -1 );
			data[ 1 ] = arr[ 0 ];
			data[ 5 ] = arr[ 1 ];
			data[ 9 ] = arr[ 2 ];
			arr = [ data[ 2 ], data[ 6 ], data[ 10 ] ];
			fixCoords( arr, -1 );
			data[ 2 ] = arr[ 0 ];
			data[ 6 ] = arr[ 1 ];
			data[ 10 ] = arr[ 2 ];
			// Rows second
			arr = [ data[ 0 ], data[ 1 ], data[ 2 ] ];
			fixCoords( arr, -1 );
			data[ 0 ] = arr[ 0 ];
			data[ 1 ] = arr[ 1 ];
			data[ 2 ] = arr[ 2 ];
			arr = [ data[ 4 ], data[ 5 ], data[ 6 ] ];
			fixCoords( arr, -1 );
			data[ 4 ] = arr[ 0 ];
			data[ 5 ] = arr[ 1 ];
			data[ 6 ] = arr[ 2 ];
			arr = [ data[ 8 ], data[ 9 ], data[ 10 ] ];
			fixCoords( arr, -1 );
			data[ 8 ] = arr[ 0 ];
			data[ 9 ] = arr[ 1 ];
			data[ 10 ] = arr[ 2 ];

			// Now fix translation
			arr = [ data[ 3 ], data[ 7 ], data[ 11 ] ];
			fixCoords( arr, -1 );
			data[ 3 ] = arr[ 0 ];
			data[ 7 ] = arr[ 1 ];
			data[ 11 ] = arr[ 2 ];

		}

		return new THREE.Matrix4().set(
			data[0], data[1], data[2], data[3],
			data[4], data[5], data[6], data[7],
			data[8], data[9], data[10], data[11],
			data[12], data[13], data[14], data[15]
			);

	}

	function getConvertedIndex( index ) {

		if ( index > -1 && index < 3 ) {

			var members = [ 'X', 'Y', 'Z' ],
				indices = { X: 0, Y: 1, Z: 2 };

			index = getConvertedMember( members[ index ] );
			index = indices[ index ];

		}

		return index;

	}

	function getConvertedMember( member ) {

		if ( options.convertUpAxis ) {

			switch ( member ) {

				case 'X':

					switch ( upConversion ) {

						case 'XtoY':
						case 'XtoZ':
						case 'YtoX':

							member = 'Y';
							break;

						case 'ZtoX':

							member = 'Z';
							break;

					}

					break;

				case 'Y':

					switch ( upConversion ) {

						case 'XtoY':
						case 'YtoX':
						case 'ZtoX':

							member = 'X';
							break;

						case 'XtoZ':
						case 'YtoZ':
						case 'ZtoY':

							member = 'Z';
							break;

					}

					break;

				case 'Z':

					switch ( upConversion ) {

						case 'XtoZ':

							member = 'X';
							break;

						case 'YtoZ':
						case 'ZtoX':
						case 'ZtoY':

							member = 'Y';
							break;

					}

					break;

			}

		}

		return member;

	}

	return {

		load: load,
		parse: parse,
		setPreferredShading: setPreferredShading,
		applySkin: applySkin,
		geometries : geometries,
		options: options

	};

};

/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.OBJLoader = function ( manager ) {

    this.manager = ( manager !== undefined ) ? manager : THREE.DefaultLoadingManager;

    this.materials = null;

    this.regexp = {
        // v float float float
        vertex_pattern           : /^v\s+([\d|\.|\+|\-|e|E]+)\s+([\d|\.|\+|\-|e|E]+)\s+([\d|\.|\+|\-|e|E]+)/,
        // vn float float float
        normal_pattern           : /^vn\s+([\d|\.|\+|\-|e|E]+)\s+([\d|\.|\+|\-|e|E]+)\s+([\d|\.|\+|\-|e|E]+)/,
        // vt float float
        uv_pattern               : /^vt\s+([\d|\.|\+|\-|e|E]+)\s+([\d|\.|\+|\-|e|E]+)/,
        // f vertex vertex vertex
        face_vertex              : /^f\s+(-?\d+)\s+(-?\d+)\s+(-?\d+)(?:\s+(-?\d+))?/,
        // f vertex/uv vertex/uv vertex/uv
        face_vertex_uv           : /^f\s+(-?\d+)\/(-?\d+)\s+(-?\d+)\/(-?\d+)\s+(-?\d+)\/(-?\d+)(?:\s+(-?\d+)\/(-?\d+))?/,
        // f vertex/uv/normal vertex/uv/normal vertex/uv/normal
        face_vertex_uv_normal    : /^f\s+(-?\d+)\/(-?\d+)\/(-?\d+)\s+(-?\d+)\/(-?\d+)\/(-?\d+)\s+(-?\d+)\/(-?\d+)\/(-?\d+)(?:\s+(-?\d+)\/(-?\d+)\/(-?\d+))?/,
        // f vertex//normal vertex//normal vertex//normal
        face_vertex_normal       : /^f\s+(-?\d+)\/\/(-?\d+)\s+(-?\d+)\/\/(-?\d+)\s+(-?\d+)\/\/(-?\d+)(?:\s+(-?\d+)\/\/(-?\d+))?/,
        // o object_name | g group_name
        object_pattern           : /^[og]\s*(.+)?/,
        // s boolean
        smoothing_pattern        : /^s\s+(\d+|on|off)/,
        // mtllib file_reference
        material_library_pattern : /^mtllib /,
        // usemtl material_name
        material_use_pattern     : /^usemtl /
    };

};

THREE.OBJLoader.prototype = {

    constructor: THREE.OBJLoader,

    load: function ( url, onLoad, onProgress, onError ) {

        var scope = this;

        var loader = new THREE.XHRLoader( scope.manager );
        loader.setPath( this.path );
        loader.load( url, function ( text ) {

            onLoad( scope.parse( text ) );

        }, onProgress, onError );

    },

    setPath: function ( value ) {

        this.path = value;

    },

    setMaterials: function ( materials ) {

        this.materials = materials;

    },

    _createParserState : function () {

        var state = {
            objects  : [],
            object   : {},

            vertices : [],
            normals  : [],
            uvs      : [],

            materialLibraries : [],

            startObject: function ( name, fromDeclaration ) {

                // If the current object (initial from reset) is not from a g/o declaration in the parsed
                // file. We need to use it for the first parsed g/o to keep things in sync.
                if ( this.object && this.object.fromDeclaration === false ) {

                    this.object.name = name;
                    this.object.fromDeclaration = ( fromDeclaration !== false );
                    return;

                }

                if ( this.object && typeof this.object._finalize === 'function' ) {

                    this.object._finalize();

                }

                var previousMaterial = ( this.object && typeof this.object.currentMaterial === 'function' ? this.object.currentMaterial() : undefined );

                this.object = {
                    name : name || '',
                    fromDeclaration : ( fromDeclaration !== false ),

                    geometry : {
                        vertices : [],
                        normals  : [],
                        uvs      : []
                    },
                    materials : [],
                    smooth : true,

                    startMaterial : function( name, libraries ) {

                        var previous = this._finalize( false );

                        // New usemtl declaration overwrites an inherited material, except if faces were declared
                        // after the material, then it must be preserved for proper MultiMaterial continuation.
                        if ( previous && ( previous.inherited || previous.groupCount <= 0 ) ) {

                            this.materials.splice( previous.index, 1 );

                        }

                        var material = {
                            index      : this.materials.length,
                            name       : name || '',
                            mtllib     : ( Array.isArray( libraries ) && libraries.length > 0 ? libraries[ libraries.length - 1 ] : '' ),
                            smooth     : ( previous !== undefined ? previous.smooth : this.smooth ),
                            groupStart : ( previous !== undefined ? previous.groupEnd : 0 ),
                            groupEnd   : -1,
                            groupCount : -1,
                            inherited  : false,

                            clone : function( index ) {
                                return {
                                    index      : ( typeof index === 'number' ? index : this.index ),
                                    name       : this.name,
                                    mtllib     : this.mtllib,
                                    smooth     : this.smooth,
                                    groupStart : this.groupEnd,
                                    groupEnd   : -1,
                                    groupCount : -1,
                                    inherited  : false
                                };
                            }
                        };

                        this.materials.push( material );

                        return material;

                    },

                    currentMaterial : function() {

                        if ( this.materials.length > 0 ) {
                            return this.materials[ this.materials.length - 1 ];
                        }

                        return undefined;

                    },

                    _finalize : function( end ) {

                        var lastMultiMaterial = this.currentMaterial();
                        if ( lastMultiMaterial && lastMultiMaterial.groupEnd === -1 ) {

                            lastMultiMaterial.groupEnd = this.geometry.vertices.length / 3;
                            lastMultiMaterial.groupCount = lastMultiMaterial.groupEnd - lastMultiMaterial.groupStart;
                            lastMultiMaterial.inherited = false;

                        }

                        // Guarantee at least one empty material, this makes the creation later more straight forward.
                        if ( end !== false && this.materials.length === 0 ) {
                            this.materials.push({
                                name   : '',
                                smooth : this.smooth
                            });
                        }

                        return lastMultiMaterial;

                    }
                };

                // Inherit previous objects material.
                // Spec tells us that a declared material must be set to all objects until a new material is declared.
                // If a usemtl declaration is encountered while this new object is being parsed, it will
                // overwrite the inherited material. Exception being that there was already face declarations
                // to the inherited material, then it will be preserved for proper MultiMaterial continuation.

                if ( previousMaterial && previousMaterial.name && typeof previousMaterial.clone === "function" ) {

                    var declared = previousMaterial.clone( 0 );
                    declared.inherited = true;
                    this.object.materials.push( declared );

                }

                this.objects.push( this.object );

            },

            finalize : function() {

                if ( this.object && typeof this.object._finalize === 'function' ) {

                    this.object._finalize();

                }

            },

            parseVertexIndex: function ( value, len ) {

                var index = parseInt( value, 10 );
                return ( index >= 0 ? index - 1 : index + len / 3 ) * 3;

            },

            parseNormalIndex: function ( value, len ) {

                var index = parseInt( value, 10 );
                return ( index >= 0 ? index - 1 : index + len / 3 ) * 3;

            },

            parseUVIndex: function ( value, len ) {

                var index = parseInt( value, 10 );
                return ( index >= 0 ? index - 1 : index + len / 2 ) * 2;

            },

            addVertex: function ( a, b, c ) {

                var src = this.vertices;
                var dst = this.object.geometry.vertices;

                dst.push( src[ a + 0 ] );
                dst.push( src[ a + 1 ] );
                dst.push( src[ a + 2 ] );
                dst.push( src[ b + 0 ] );
                dst.push( src[ b + 1 ] );
                dst.push( src[ b + 2 ] );
                dst.push( src[ c + 0 ] );
                dst.push( src[ c + 1 ] );
                dst.push( src[ c + 2 ] );

            },

            addVertexLine: function ( a ) {

                var src = this.vertices;
                var dst = this.object.geometry.vertices;

                dst.push( src[ a + 0 ] );
                dst.push( src[ a + 1 ] );
                dst.push( src[ a + 2 ] );

            },

            addNormal : function ( a, b, c ) {

                var src = this.normals;
                var dst = this.object.geometry.normals;

                dst.push( src[ a + 0 ] );
                dst.push( src[ a + 1 ] );
                dst.push( src[ a + 2 ] );
                dst.push( src[ b + 0 ] );
                dst.push( src[ b + 1 ] );
                dst.push( src[ b + 2 ] );
                dst.push( src[ c + 0 ] );
                dst.push( src[ c + 1 ] );
                dst.push( src[ c + 2 ] );

            },

            addUV: function ( a, b, c ) {

                var src = this.uvs;
                var dst = this.object.geometry.uvs;

                dst.push( src[ a + 0 ] );
                dst.push( src[ a + 1 ] );
                dst.push( src[ b + 0 ] );
                dst.push( src[ b + 1 ] );
                dst.push( src[ c + 0 ] );
                dst.push( src[ c + 1 ] );

            },

            addUVLine: function ( a ) {

                var src = this.uvs;
                var dst = this.object.geometry.uvs;

                dst.push( src[ a + 0 ] );
                dst.push( src[ a + 1 ] );

            },

            addFace: function ( a, b, c, d, ua, ub, uc, ud, na, nb, nc, nd ) {

                var vLen = this.vertices.length;

                var ia = this.parseVertexIndex( a, vLen );
                var ib = this.parseVertexIndex( b, vLen );
                var ic = this.parseVertexIndex( c, vLen );
                var id;

                if ( d === undefined ) {

                    this.addVertex( ia, ib, ic );

                } else {

                    id = this.parseVertexIndex( d, vLen );

                    this.addVertex( ia, ib, id );
                    this.addVertex( ib, ic, id );

                }

                if ( ua !== undefined ) {

                    var uvLen = this.uvs.length;

                    ia = this.parseUVIndex( ua, uvLen );
                    ib = this.parseUVIndex( ub, uvLen );
                    ic = this.parseUVIndex( uc, uvLen );

                    if ( d === undefined ) {

                        this.addUV( ia, ib, ic );

                    } else {

                        id = this.parseUVIndex( ud, uvLen );

                        this.addUV( ia, ib, id );
                        this.addUV( ib, ic, id );

                    }

                }

                if ( na !== undefined ) {

                    // Normals are many times the same. If so, skip function call and parseInt.
                    var nLen = this.normals.length;
                    ia = this.parseNormalIndex( na, nLen );

                    ib = na === nb ? ia : this.parseNormalIndex( nb, nLen );
                    ic = na === nc ? ia : this.parseNormalIndex( nc, nLen );

                    if ( d === undefined ) {

                        this.addNormal( ia, ib, ic );

                    } else {

                        id = this.parseNormalIndex( nd, nLen );

                        this.addNormal( ia, ib, id );
                        this.addNormal( ib, ic, id );

                    }

                }

            },

            addLineGeometry: function ( vertices, uvs ) {

                this.object.geometry.type = 'Line';

                var vLen = this.vertices.length;
                var uvLen = this.uvs.length;

                for ( var vi = 0, l = vertices.length; vi < l; vi ++ ) {

                    this.addVertexLine( this.parseVertexIndex( vertices[ vi ], vLen ) );

                }

                for ( var uvi = 0, l = uvs.length; uvi < l; uvi ++ ) {

                    this.addUVLine( this.parseUVIndex( uvs[ uvi ], uvLen ) );

                }

            }

        };

        state.startObject( '', false );

        return state;

    },

    parse: function ( text ) {

        console.time( 'OBJLoader' );

        var state = this._createParserState();

        if ( text.indexOf( '\r\n' ) !== - 1 ) {

            // This is faster than String.split with regex that splits on both
            text = text.replace( '\r\n', '\n' );

        }

        var lines = text.split( '\n' );
        var line = '', lineFirstChar = '', lineSecondChar = '';
        var lineLength = 0;
        var result = [];

        // Faster to just trim left side of the line. Use if available.
        var trimLeft = ( typeof ''.trimLeft === 'function' );

        for ( var i = 0, l = lines.length; i < l; i ++ ) {

            line = lines[ i ];

            line = trimLeft ? line.trimLeft() : line.trim();

            lineLength = line.length;

            if ( lineLength === 0 ) continue;

            lineFirstChar = line.charAt( 0 );

            // @todo invoke passed in handler if any
            if ( lineFirstChar === '#' ) continue;

            if ( lineFirstChar === 'v' ) {

                lineSecondChar = line.charAt( 1 );

                if ( lineSecondChar === ' ' && ( result = this.regexp.vertex_pattern.exec( line ) ) !== null ) {

                    // 0                  1      2      3
                    // ["v 1.0 2.0 3.0", "1.0", "2.0", "3.0"]

                    state.vertices.push(
                        parseFloat( result[ 1 ] ),
                        parseFloat( result[ 2 ] ),
                        parseFloat( result[ 3 ] )
                    );

                } else if ( lineSecondChar === 'n' && ( result = this.regexp.normal_pattern.exec( line ) ) !== null ) {

                    // 0                   1      2      3
                    // ["vn 1.0 2.0 3.0", "1.0", "2.0", "3.0"]

                    state.normals.push(
                        parseFloat( result[ 1 ] ),
                        parseFloat( result[ 2 ] ),
                        parseFloat( result[ 3 ] )
                    );

                } else if ( lineSecondChar === 't' && ( result = this.regexp.uv_pattern.exec( line ) ) !== null ) {

                    // 0               1      2
                    // ["vt 0.1 0.2", "0.1", "0.2"]

                    state.uvs.push(
                        parseFloat( result[ 1 ] ),
                        parseFloat( result[ 2 ] )
                    );

                } else {

                    throw new Error( "Unexpected vertex/normal/uv line: '" + line  + "'" );

                }

            } else if ( lineFirstChar === "f" ) {

                if ( ( result = this.regexp.face_vertex_uv_normal.exec( line ) ) !== null ) {

                    // f vertex/uv/normal vertex/uv/normal vertex/uv/normal
                    // 0                        1    2    3    4    5    6    7    8    9   10         11         12
                    // ["f 1/1/1 2/2/2 3/3/3", "1", "1", "1", "2", "2", "2", "3", "3", "3", undefined, undefined, undefined]

                    state.addFace(
                        result[ 1 ], result[ 4 ], result[ 7 ], result[ 10 ],
                        result[ 2 ], result[ 5 ], result[ 8 ], result[ 11 ],
                        result[ 3 ], result[ 6 ], result[ 9 ], result[ 12 ]
                    );

                } else if ( ( result = this.regexp.face_vertex_uv.exec( line ) ) !== null ) {

                    // f vertex/uv vertex/uv vertex/uv
                    // 0                  1    2    3    4    5    6   7          8
                    // ["f 1/1 2/2 3/3", "1", "1", "2", "2", "3", "3", undefined, undefined]

                    state.addFace(
                        result[ 1 ], result[ 3 ], result[ 5 ], result[ 7 ],
                        result[ 2 ], result[ 4 ], result[ 6 ], result[ 8 ]
                    );

                } else if ( ( result = this.regexp.face_vertex_normal.exec( line ) ) !== null ) {

                    // f vertex//normal vertex//normal vertex//normal
                    // 0                     1    2    3    4    5    6   7          8
                    // ["f 1//1 2//2 3//3", "1", "1", "2", "2", "3", "3", undefined, undefined]

                    state.addFace(
                        result[ 1 ], result[ 3 ], result[ 5 ], result[ 7 ],
                        undefined, undefined, undefined, undefined,
                        result[ 2 ], result[ 4 ], result[ 6 ], result[ 8 ]
                    );

                } else if ( ( result = this.regexp.face_vertex.exec( line ) ) !== null ) {

                    // f vertex vertex vertex
                    // 0            1    2    3   4
                    // ["f 1 2 3", "1", "2", "3", undefined]

                    state.addFace(
                        result[ 1 ], result[ 2 ], result[ 3 ], result[ 4 ]
                    );

                } else {

                    throw new Error( "Unexpected face line: '" + line  + "'" );

                }

            } else if ( lineFirstChar === "l" ) {

                var lineParts = line.substring( 1 ).trim().split( " " );
                var lineVertices = [], lineUVs = [];

                if ( line.indexOf( "/" ) === - 1 ) {

                    lineVertices = lineParts;

                } else {

                    for ( var li = 0, llen = lineParts.length; li < llen; li ++ ) {

                        var parts = lineParts[ li ].split( "/" );

                        if ( parts[ 0 ] !== "" ) lineVertices.push( parts[ 0 ] );
                        if ( parts[ 1 ] !== "" ) lineUVs.push( parts[ 1 ] );

                    }

                }
                state.addLineGeometry( lineVertices, lineUVs );

            } else if ( ( result = this.regexp.object_pattern.exec( line ) ) !== null ) {

                // o object_name
                // or
                // g group_name

                var name = result[ 0 ].substr( 1 ).trim();
                state.startObject( name );

            } else if ( this.regexp.material_use_pattern.test( line ) ) {

                // material

                state.object.startMaterial( line.substring( 7 ).trim(), state.materialLibraries );

            } else if ( this.regexp.material_library_pattern.test( line ) ) {

                // mtl file

                state.materialLibraries.push( line.substring( 7 ).trim() );

            } else if ( ( result = this.regexp.smoothing_pattern.exec( line ) ) !== null ) {

                // smooth shading

                // @todo Handle files that have varying smooth values for a set of faces inside one geometry,
                // but does not define a usemtl for each face set.
                // This should be detected and a dummy material created (later MultiMaterial and geometry groups).
                // This requires some care to not create extra material on each smooth value for "normal" obj files.
                // where explicit usemtl defines geometry groups.
                // Example asset: examples/models/obj/cerberus/Cerberus.obj

                var value = result[ 1 ].trim().toLowerCase();
                state.object.smooth = ( value === '1' || value === 'on' );

                var material = state.object.currentMaterial();
                if ( material ) {

                    material.smooth = state.object.smooth;

                }

            } else {

                // Handle null terminated files without exception
                if ( line === '\0' ) continue;

                throw new Error( "Unexpected line: '" + line  + "'" );

            }

        }

        state.finalize();

        var container = new THREE.Group();
        container.materialLibraries = [].concat( state.materialLibraries );

        for ( var i = 0, l = state.objects.length; i < l; i ++ ) {

            var object = state.objects[ i ];
            var geometry = object.geometry;
            var materials = object.materials;
            var isLine = ( geometry.type === 'Line' );

            // Skip o/g line declarations that did not follow with any faces
            if ( geometry.vertices.length === 0 ) continue;

            var buffergeometry = new THREE.BufferGeometry();

            buffergeometry.addAttribute( 'position', new THREE.BufferAttribute( new Float32Array( geometry.vertices ), 3 ) );

            if ( geometry.normals.length > 0 ) {

                buffergeometry.addAttribute( 'normal', new THREE.BufferAttribute( new Float32Array( geometry.normals ), 3 ) );

            } else {

                buffergeometry.computeVertexNormals();

            }

            if ( geometry.uvs.length > 0 ) {

                buffergeometry.addAttribute( 'uv', new THREE.BufferAttribute( new Float32Array( geometry.uvs ), 2 ) );

            }

            // Create materials

            var createdMaterials = [];

            for ( var mi = 0, miLen = materials.length; mi < miLen ; mi++ ) {

                var sourceMaterial = materials[mi];
                var material = undefined;

                if ( this.materials !== null ) {

                    material = this.materials.create( sourceMaterial.name );

                    // mtl etc. loaders probably can't create line materials correctly, copy properties to a line material.
                    if ( isLine && material && ! ( material instanceof THREE.LineBasicMaterial ) ) {

                        var materialLine = new THREE.LineBasicMaterial();
                        materialLine.copy( material );
                        material = materialLine;

                    }

                }

                if ( ! material ) {

                    material = ( ! isLine ? new THREE.MeshPhongMaterial() : new THREE.LineBasicMaterial() );
                    material.name = sourceMaterial.name;

                }

                material.shading = sourceMaterial.smooth ? THREE.SmoothShading : THREE.FlatShading;

                createdMaterials.push(material);

            }

            // Create mesh

            var mesh;

            if ( createdMaterials.length > 1 ) {

                for ( var mi = 0, miLen = materials.length; mi < miLen ; mi++ ) {

                    var sourceMaterial = materials[mi];
                    buffergeometry.addGroup( sourceMaterial.groupStart, sourceMaterial.groupCount, mi );

                }

                var multiMaterial = new THREE.MultiMaterial( createdMaterials );
                mesh = ( ! isLine ? new THREE.Mesh( buffergeometry, multiMaterial ) : new THREE.Line( buffergeometry, multiMaterial ) );

            } else {

                mesh = ( ! isLine ? new THREE.Mesh( buffergeometry, createdMaterials[ 0 ] ) : new THREE.Line( buffergeometry, createdMaterials[ 0 ] ) );
            }

            mesh.name = object.name;

            container.add( mesh );

        }

        console.timeEnd( 'OBJLoader' );

        return container;

    }

};
/**
 * @author miibond
 * Generate a texture that represents the luminosity of the current scene, adapted over time
 * to simulate the optic nerve responding to the amount of light it is receiving.
 * Based on a GDC2007 presentation by Wolfgang Engel titled "Post-Processing Pipeline"
 *
 * Full-screen tone-mapping shader based on http://www.graphics.cornell.edu/~jaf/publications/sig02_paper.pdf
 */

THREE.AdaptiveToneMappingPass = function ( adaptive, resolution ) {

	THREE.Pass.call( this );

	this.resolution = ( resolution !== undefined ) ? resolution : 256;
	this.needsInit = true;
	this.adaptive = adaptive !== undefined ? !! adaptive : true;

	this.luminanceRT = null;
	this.previousLuminanceRT = null;
	this.currentLuminanceRT = null;

	if ( THREE.CopyShader === undefined )
		console.error( "THREE.AdaptiveToneMappingPass relies on THREE.CopyShader" );

	var copyShader = THREE.CopyShader;

	this.copyUniforms = THREE.UniformsUtils.clone( copyShader.uniforms );

	this.materialCopy = new THREE.ShaderMaterial( {

		uniforms: this.copyUniforms,
		vertexShader: copyShader.vertexShader,
		fragmentShader: copyShader.fragmentShader,
		blending: THREE.NoBlending,
		depthTest: false

	} );

	if ( THREE.LuminosityShader === undefined )
		console.error( "THREE.AdaptiveToneMappingPass relies on THREE.LuminosityShader" );

	this.materialLuminance = new THREE.ShaderMaterial( {

		uniforms: THREE.UniformsUtils.clone( THREE.LuminosityShader.uniforms ),
		vertexShader: THREE.LuminosityShader.vertexShader,
		fragmentShader: THREE.LuminosityShader.fragmentShader,
		blending: THREE.NoBlending,
	} );

	this.adaptLuminanceShader = {
		defines: {
			"MIP_LEVEL_1X1" : ( Math.log( this.resolution ) / Math.log( 2.0 ) ).toFixed( 1 ),
		},
		uniforms: {
			"lastLum": { value: null },
			"currentLum": { value: null },
			"delta": { value: 0.016 },
			"tau": { value: 1.0 }
		},
		vertexShader: [
			"varying vec2 vUv;",

			"void main() {",

			"vUv = uv;",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

			"}"
		].join( '\n' ),
		fragmentShader: [
			"varying vec2 vUv;",

			"uniform sampler2D lastLum;",
			"uniform sampler2D currentLum;",
			"uniform float delta;",
			"uniform float tau;",

			"void main() {",

			"vec4 lastLum = texture2D( lastLum, vUv, MIP_LEVEL_1X1 );",
			"vec4 currentLum = texture2D( currentLum, vUv, MIP_LEVEL_1X1 );",

			"float fLastLum = lastLum.r;",
			"float fCurrentLum = currentLum.r;",

			//The adaption seems to work better in extreme lighting differences
			//if the input luminance is squared.
			"fCurrentLum *= fCurrentLum;",

			// Adapt the luminance using Pattanaik's technique
			"float fAdaptedLum = fLastLum + (fCurrentLum - fLastLum) * (1.0 - exp(-delta * tau));",
			// "fAdaptedLum = sqrt(fAdaptedLum);",
			"gl_FragColor = vec4( vec3( fAdaptedLum ), 1.0 );",
			"}",
		].join( '\n' )
	};

	this.materialAdaptiveLum = new THREE.ShaderMaterial( {

		uniforms: THREE.UniformsUtils.clone( this.adaptLuminanceShader.uniforms ),
		vertexShader: this.adaptLuminanceShader.vertexShader,
		fragmentShader: this.adaptLuminanceShader.fragmentShader,
		defines: this.adaptLuminanceShader.defines,
		blending: THREE.NoBlending
	} );

	if ( THREE.ToneMapShader === undefined )
		console.error( "THREE.AdaptiveToneMappingPass relies on THREE.ToneMapShader" );

	this.materialToneMap = new THREE.ShaderMaterial( {

		uniforms: THREE.UniformsUtils.clone( THREE.ToneMapShader.uniforms ),
		vertexShader: THREE.ToneMapShader.vertexShader,
		fragmentShader: THREE.ToneMapShader.fragmentShader,
		blending: THREE.NoBlending
	} );

	this.camera = new THREE.OrthographicCamera( - 1, 1, 1, - 1, 0, 1 );
	this.scene  = new THREE.Scene();

	this.quad = new THREE.Mesh( new THREE.PlaneBufferGeometry( 2, 2 ), null );
	this.scene.add( this.quad );

};

THREE.AdaptiveToneMappingPass.prototype = Object.assign( Object.create( THREE.Pass.prototype ), {

	constructor: THREE.AdaptiveToneMappingPass,

	render: function ( renderer, writeBuffer, readBuffer, delta, maskActive ) {

		if ( this.needsInit ) {

			this.reset( renderer );

			this.luminanceRT.texture.type = readBuffer.texture.type;
			this.previousLuminanceRT.texture.type = readBuffer.texture.type;
			this.currentLuminanceRT.texture.type = readBuffer.texture.type;
			this.needsInit = false;

		}

		if ( this.adaptive ) {

			//Render the luminance of the current scene into a render target with mipmapping enabled
			this.quad.material = this.materialLuminance;
			this.materialLuminance.uniforms.tDiffuse.value = readBuffer.texture;
			renderer.render( this.scene, this.camera, this.currentLuminanceRT );

			//Use the new luminance values, the previous luminance and the frame delta to
			//adapt the luminance over time.
			this.quad.material = this.materialAdaptiveLum;
			this.materialAdaptiveLum.uniforms.delta.value = delta;
			this.materialAdaptiveLum.uniforms.lastLum.value = this.previousLuminanceRT.texture;
			this.materialAdaptiveLum.uniforms.currentLum.value = this.currentLuminanceRT.texture;
			renderer.render( this.scene, this.camera, this.luminanceRT );

			//Copy the new adapted luminance value so that it can be used by the next frame.
			this.quad.material = this.materialCopy;
			this.copyUniforms.tDiffuse.value = this.luminanceRT.texture;
			renderer.render( this.scene, this.camera, this.previousLuminanceRT );

		}

		this.quad.material = this.materialToneMap;
		this.materialToneMap.uniforms.tDiffuse.value = readBuffer.texture;
		renderer.render( this.scene, this.camera, writeBuffer, this.clear );

	},

	reset: function( renderer ) {

		// render targets
		if ( this.luminanceRT ) {

			this.luminanceRT.dispose();

		}
		if ( this.currentLuminanceRT ) {

			this.currentLuminanceRT.dispose();

		}
		if ( this.previousLuminanceRT ) {

			this.previousLuminanceRT.dispose();

		}

		var pars = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat }; // was RGB format. changed to RGBA format. see discussion in #8415 / #8450

		this.luminanceRT = new THREE.WebGLRenderTarget( this.resolution, this.resolution, pars );
		this.luminanceRT.texture.generateMipmaps = false;

		this.previousLuminanceRT = new THREE.WebGLRenderTarget( this.resolution, this.resolution, pars );
		this.previousLuminanceRT.texture.generateMipmaps = false;

		// We only need mipmapping for the current luminosity because we want a down-sampled version to sample in our adaptive shader
		pars.minFilter = THREE.LinearMipMapLinearFilter;
		this.currentLuminanceRT = new THREE.WebGLRenderTarget( this.resolution, this.resolution, pars );

		if ( this.adaptive ) {

			this.materialToneMap.defines[ "ADAPTED_LUMINANCE" ] = "";
			this.materialToneMap.uniforms.luminanceMap.value = this.luminanceRT.texture;

		}
		//Put something in the adaptive luminance texture so that the scene can render initially
		this.quad.material = new THREE.MeshBasicMaterial( { color: 0x777777 } );
		this.materialLuminance.needsUpdate = true;
		this.materialAdaptiveLum.needsUpdate = true;
		this.materialToneMap.needsUpdate = true;
		// renderer.render( this.scene, this.camera, this.luminanceRT );
		// renderer.render( this.scene, this.camera, this.previousLuminanceRT );
		// renderer.render( this.scene, this.camera, this.currentLuminanceRT );

	},

	setAdaptive: function( adaptive ) {

		if ( adaptive ) {

			this.adaptive = true;
			this.materialToneMap.defines[ "ADAPTED_LUMINANCE" ] = "";
			this.materialToneMap.uniforms.luminanceMap.value = this.luminanceRT.texture;

		} else {

			this.adaptive = false;
			delete this.materialToneMap.defines[ "ADAPTED_LUMINANCE" ];
			this.materialToneMap.uniforms.luminanceMap.value = null;

		}
		this.materialToneMap.needsUpdate = true;

	},

	setAdaptionRate: function( rate ) {

		if ( rate ) {

			this.materialAdaptiveLum.uniforms.tau.value = Math.abs( rate );

		}

	},

	setMaxLuminance: function( maxLum ) {

		if ( maxLum ) {

			this.materialToneMap.uniforms.maxLuminance.value = maxLum;

		}

	},

	setAverageLuminance: function( avgLum ) {

		if ( avgLum ) {

			this.materialToneMap.uniforms.averageLuminance.value = avgLum;

		}

	},

	setMiddleGrey: function( middleGrey ) {

		if ( middleGrey ) {

			this.materialToneMap.uniforms.middleGrey.value = middleGrey;

		}

	},

	dispose: function() {

		if ( this.luminanceRT ) {

			this.luminanceRT.dispose();

		}
		if ( this.previousLuminanceRT ) {

			this.previousLuminanceRT.dispose();

		}
		if ( this.currentLuminanceRT ) {

			this.currentLuminanceRT.dispose();

		}
		if ( this.materialLuminance ) {

			this.materialLuminance.dispose();

		}
		if ( this.materialAdaptiveLum ) {

			this.materialAdaptiveLum.dispose();

		}
		if ( this.materialCopy ) {

			this.materialCopy.dispose();

		}
		if ( this.materialToneMap ) {

			this.materialToneMap.dispose();

		}

	}

} );
/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.BloomPass = function ( strength, kernelSize, sigma, resolution ) {

	THREE.Pass.call( this );

	strength = ( strength !== undefined ) ? strength : 1;
	kernelSize = ( kernelSize !== undefined ) ? kernelSize : 25;
	sigma = ( sigma !== undefined ) ? sigma : 4.0;
	resolution = ( resolution !== undefined ) ? resolution : 256;

	// render targets

	var pars = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat };

	this.renderTargetX = new THREE.WebGLRenderTarget( resolution, resolution, pars );
	this.renderTargetY = new THREE.WebGLRenderTarget( resolution, resolution, pars );

	// copy material

	if ( THREE.CopyShader === undefined )
		console.error( "THREE.BloomPass relies on THREE.CopyShader" );

	var copyShader = THREE.CopyShader;

	this.copyUniforms = THREE.UniformsUtils.clone( copyShader.uniforms );

	this.copyUniforms[ "opacity" ].value = strength;

	this.materialCopy = new THREE.ShaderMaterial( {

		uniforms: this.copyUniforms,
		vertexShader: copyShader.vertexShader,
		fragmentShader: copyShader.fragmentShader,
		blending: THREE.AdditiveBlending,
		transparent: true

	} );

	// convolution material

	if ( THREE.ConvolutionShader === undefined )
		console.error( "THREE.BloomPass relies on THREE.ConvolutionShader" );

	var convolutionShader = THREE.ConvolutionShader;

	this.convolutionUniforms = THREE.UniformsUtils.clone( convolutionShader.uniforms );

	this.convolutionUniforms[ "uImageIncrement" ].value = THREE.BloomPass.blurX;
	this.convolutionUniforms[ "cKernel" ].value = THREE.ConvolutionShader.buildKernel( sigma );

	this.materialConvolution = new THREE.ShaderMaterial( {

		uniforms: this.convolutionUniforms,
		vertexShader:  convolutionShader.vertexShader,
		fragmentShader: convolutionShader.fragmentShader,
		defines: {
			"KERNEL_SIZE_FLOAT": kernelSize.toFixed( 1 ),
			"KERNEL_SIZE_INT": kernelSize.toFixed( 0 )
		}

	} );

	this.needsSwap = false;

	this.camera = new THREE.OrthographicCamera( - 1, 1, 1, - 1, 0, 1 );
	this.scene  = new THREE.Scene();

	this.quad = new THREE.Mesh( new THREE.PlaneBufferGeometry( 2, 2 ), null );
	this.scene.add( this.quad );

};

THREE.BloomPass.prototype = Object.assign( Object.create( THREE.Pass.prototype ), {

	constructor: THREE.BloomPass,

	render: function ( renderer, writeBuffer, readBuffer, delta, maskActive ) {

		if ( maskActive ) renderer.context.disable( renderer.context.STENCIL_TEST );

		// Render quad with blured scene into texture (convolution pass 1)

		this.quad.material = this.materialConvolution;

		this.convolutionUniforms[ "tDiffuse" ].value = readBuffer.texture;
		this.convolutionUniforms[ "uImageIncrement" ].value = THREE.BloomPass.blurX;

		renderer.render( this.scene, this.camera, this.renderTargetX, true );


		// Render quad with blured scene into texture (convolution pass 2)

		this.convolutionUniforms[ "tDiffuse" ].value = this.renderTargetX.texture;
		this.convolutionUniforms[ "uImageIncrement" ].value = THREE.BloomPass.blurY;

		renderer.render( this.scene, this.camera, this.renderTargetY, true );

		// Render original scene with superimposed blur to texture

		this.quad.material = this.materialCopy;

		this.copyUniforms[ "tDiffuse" ].value = this.renderTargetY.texture;

		if ( maskActive ) renderer.context.enable( renderer.context.STENCIL_TEST );

		renderer.render( this.scene, this.camera, readBuffer, this.clear );

	}

} );

THREE.BloomPass.blurX = new THREE.Vector2( 0.001953125, 0.0 );
THREE.BloomPass.blurY = new THREE.Vector2( 0.0, 0.001953125 );
/**
*
* Manual Multi-Sample Anti-Aliasing Render Pass
*
* @author bhouston / http://clara.io/
*
* This manual approach to MSAA re-renders the scene ones for each sample with camera jitter and accumulates the results.
*
* References: https://en.wikipedia.org/wiki/Multisample_anti-aliasing
*
*/

THREE.ManualMSAARenderPass = function ( scene, camera, clearColor, clearAlpha ) {

	THREE.Pass.call( this );

	this.scene = scene;
	this.camera = camera;

	this.sampleLevel = 4; // specified as n, where the number of samples is 2^n, so sampleLevel = 4, is 2^4 samples, 16.
	this.unbiased = true;

	// as we need to clear the buffer in this pass, clearColor must be set to something, defaults to black.
	this.clearColor = ( clearColor !== undefined ) ? clearColor : 0x000000;
	this.clearAlpha = ( clearAlpha !== undefined ) ? clearAlpha : 0;

	if ( THREE.CopyShader === undefined ) console.error( "THREE.ManualMSAARenderPass relies on THREE.CopyShader" );

	var copyShader = THREE.CopyShader;
	this.copyUniforms = THREE.UniformsUtils.clone( copyShader.uniforms );

	this.copyMaterial = new THREE.ShaderMaterial(	{
		uniforms: this.copyUniforms,
		vertexShader: copyShader.vertexShader,
		fragmentShader: copyShader.fragmentShader,
		premultipliedAlpha: true,
		transparent: true,
		blending: THREE.AdditiveBlending,
		depthTest: false,
		depthWrite: false
	} );

	this.camera2 = new THREE.OrthographicCamera( - 1, 1, 1, - 1, 0, 1 );
	this.scene2	= new THREE.Scene();
	this.quad2 = new THREE.Mesh( new THREE.PlaneGeometry( 2, 2 ), this.copyMaterial );
	this.scene2.add( this.quad2 );

};

THREE.ManualMSAARenderPass.prototype = Object.assign( Object.create( THREE.Pass.prototype ), {

	constructor: THREE.ManualMSAARenderPass,

	dispose: function() {

		if ( this.sampleRenderTarget ) {

			this.sampleRenderTarget.dispose();
			this.sampleRenderTarget = null;

		}

	},

	setSize: function ( width, height ) {

		if ( this.sampleRenderTarget )	this.sampleRenderTarget.setSize( width, height );

	},

	render: function ( renderer, writeBuffer, readBuffer, delta, maskActive ) {

		if ( ! this.sampleRenderTarget ) {

			this.sampleRenderTarget = new THREE.WebGLRenderTarget( readBuffer.width, readBuffer.height,
				{ minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat } );

		}

		var jitterOffsets = THREE.ManualMSAARenderPass.JitterVectors[ Math.max( 0, Math.min( this.sampleLevel, 5 ) ) ];

		var autoClear = renderer.autoClear;
		renderer.autoClear = false;

		var oldClearColor = renderer.getClearColor().getHex();
		var oldClearAlpha = renderer.getClearAlpha();

		var baseSampleWeight = 1.0 / jitterOffsets.length;
		var roundingRange = 1 / 32;
		this.copyUniforms[ "tDiffuse" ].value = this.sampleRenderTarget.texture;

		var width = readBuffer.width, height = readBuffer.height;

		// render the scene multiple times, each slightly jitter offset from the last and accumulate the results.
		for ( var i = 0; i < jitterOffsets.length; i ++ ) {

			var jitterOffset = jitterOffsets[i];
			if ( this.camera.setViewOffset ) {
				this.camera.setViewOffset( width, height,
					jitterOffset[ 0 ] * 0.0625, jitterOffset[ 1 ] * 0.0625,   // 0.0625 = 1 / 16
					width, height );
			}

			var sampleWeight = baseSampleWeight;
			if( this.unbiased ) {
				// the theory is that equal weights for each sample lead to an accumulation of rounding errors.
				// The following equation varies the sampleWeight per sample so that it is uniformly distributed
				// across a range of values whose rounding errors cancel each other out.
				var uniformCenteredDistribution = ( -0.5 + ( i + 0.5 ) / jitterOffsets.length );
				sampleWeight += roundingRange * uniformCenteredDistribution;
			}

			this.copyUniforms[ "opacity" ].value = sampleWeight;
			renderer.setClearColor( this.clearColor, this.clearAlpha );
			renderer.render( this.scene, this.camera, this.sampleRenderTarget, true );
			if (i === 0) {
				renderer.setClearColor( 0x000000, 0.0 );
			}
			renderer.render( this.scene2, this.camera2, this.renderToScreen ? null : writeBuffer, (i === 0) );

		}

		if ( this.camera.clearViewOffset ) this.camera.clearViewOffset();

		renderer.autoClear = autoClear;
		renderer.setClearColor( oldClearColor, oldClearAlpha );

	}

} );


// These jitter vectors are specified in integers because it is easier.
// I am assuming a [-8,8) integer grid, but it needs to be mapped onto [-0.5,0.5)
// before being used, thus these integers need to be scaled by 1/16.
//
// Sample patterns reference: https://msdn.microsoft.com/en-us/library/windows/desktop/ff476218%28v=vs.85%29.aspx?f=255&MSPPError=-2147217396
THREE.ManualMSAARenderPass.JitterVectors = [
	[
		[ 0, 0 ]
	],
	[
		[ 4, 4 ], [ - 4, - 4 ]
	],
	[
		[ - 2, - 6 ], [ 6, - 2 ], [ - 6, 2 ], [ 2, 6 ]
	],
	[
		[ 1, - 3 ], [ - 1, 3 ], [ 5, 1 ], [ - 3, - 5 ],
		[ - 5, 5 ], [ - 7, - 1 ], [ 3, 7 ], [ 7, - 7 ]
	],
	[
		[ 1, 1 ], [ - 1, - 3 ], [ - 3, 2 ], [ 4, - 1 ],
		[ - 5, - 2 ], [ 2, 5 ], [ 5, 3 ], [ 3, - 5 ],
		[ - 2, 6 ], [ 0, - 7 ], [ - 4, - 6 ], [ - 6, 4 ],
		[ - 8, 0 ], [ 7, - 4 ], [ 6, 7 ], [ - 7, - 8 ]
	],
	[
		[ - 4, - 7 ], [ - 7, - 5 ], [ - 3, - 5 ], [ - 5, - 4 ],
		[ - 1, - 4 ], [ - 2, - 2 ], [ - 6, - 1 ], [ - 4, 0 ],
		[ - 7, 1 ], [ - 1, 2 ], [ - 6, 3 ], [ - 3, 3 ],
		[ - 7, 6 ], [ - 3, 6 ], [ - 5, 7 ], [ - 1, 7 ],
		[ 5, - 7 ], [ 1, - 6 ], [ 6, - 5 ], [ 4, - 4 ],
		[ 2, - 3 ], [ 7, - 2 ], [ 1, - 1 ], [ 4, - 1 ],
		[ 2, 1 ], [ 6, 2 ], [ 0, 4 ], [ 4, 4 ],
		[ 2, 5 ], [ 7, 5 ], [ 5, 6 ], [ 3, 7 ]
	]
];

/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.RenderPass = function ( scene, camera, overrideMaterial, clearColor, clearAlpha ) {

	THREE.Pass.call( this );

	this.scene = scene;
	this.camera = camera;

	this.overrideMaterial = overrideMaterial;

	this.clearColor = clearColor;
	this.clearAlpha = ( clearAlpha !== undefined ) ? clearAlpha : 0;

	this.clear = true;
	this.needsSwap = false;

};

THREE.RenderPass.prototype = Object.assign( Object.create( THREE.Pass.prototype ), {

	constructor: THREE.RenderPass,

	render: function ( renderer, writeBuffer, readBuffer, delta, maskActive ) {

		var oldAutoClear = renderer.autoClear;
		renderer.autoClear = false;

		this.scene.overrideMaterial = this.overrideMaterial;

		var oldClearColor, oldClearAlpha;

		if ( this.clearColor ) {

			oldClearColor = renderer.getClearColor().getHex();
			oldClearAlpha = renderer.getClearAlpha();

			renderer.setClearColor( this.clearColor, this.clearAlpha );

		}

		renderer.render( this.scene, this.camera, this.renderToScreen ? null : readBuffer, this.clear );

		if ( this.clearColor ) {

			renderer.setClearColor( oldClearColor, oldClearAlpha );

		}

		this.scene.overrideMaterial = null;
		renderer.autoClear = oldAutoClear;
	}

} );
/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.ShaderPass = function ( shader, textureID ) {

	THREE.Pass.call( this );

	this.textureID = ( textureID !== undefined ) ? textureID : "tDiffuse";

	if ( shader instanceof THREE.ShaderMaterial ) {

		this.uniforms = shader.uniforms;

		this.material = shader;

	} else if ( shader ) {

		this.uniforms = THREE.UniformsUtils.clone( shader.uniforms );

		this.material = new THREE.ShaderMaterial( {

			defines: shader.defines || {},
			uniforms: this.uniforms,
			vertexShader: shader.vertexShader,
			fragmentShader: shader.fragmentShader

		} );

	}

	this.camera = new THREE.OrthographicCamera( - 1, 1, 1, - 1, 0, 1 );
	this.scene = new THREE.Scene();

	this.quad = new THREE.Mesh( new THREE.PlaneBufferGeometry( 2, 2 ), null );
	this.scene.add( this.quad );

};

THREE.ShaderPass.prototype = Object.assign( Object.create( THREE.Pass.prototype ), {

	constructor: THREE.ShaderPass,

	render: function( renderer, writeBuffer, readBuffer, delta, maskActive ) {

		if ( this.uniforms[ this.textureID ] ) {

			this.uniforms[ this.textureID ].value = readBuffer.texture;

		}

		this.quad.material = this.material;

		if ( this.renderToScreen ) {

			renderer.render( this.scene, this.camera );

		} else {

			renderer.render( this.scene, this.camera, writeBuffer, this.clear );

		}

	}

} );
/**
 * @author mpk / http://polko.me/
 */

THREE.SMAAPass = function ( width, height ) {

	THREE.Pass.call( this );

	// render targets

	this.edgesRT = new THREE.WebGLRenderTarget( width, height, {
		depthBuffer: false,
		stencilBuffer: false,
		generateMipmaps: false,
		minFilter: THREE.LinearFilter,
		format: THREE.RGBFormat
	} );

	this.weightsRT = new THREE.WebGLRenderTarget( width, height, {
		depthBuffer: false,
		stencilBuffer: false,
		generateMipmaps: false,
		minFilter: THREE.LinearFilter,
		format: THREE.RGBAFormat
	} );

	// textures

	var areaTextureImage = new Image();
	areaTextureImage.src = this.getAreaTexture();

	this.areaTexture = new THREE.Texture();
	this.areaTexture.image = areaTextureImage;
	this.areaTexture.format = THREE.RGBFormat;
	this.areaTexture.minFilter = THREE.LinearFilter;
	this.areaTexture.generateMipmaps = false;
	this.areaTexture.needsUpdate = true;
	this.areaTexture.flipY = false;

	var searchTextureImage = new Image();
	searchTextureImage.src = this.getSearchTexture();

	this.searchTexture = new THREE.Texture();
	this.searchTexture.image = searchTextureImage;
	this.searchTexture.magFilter = THREE.NearestFilter;
	this.searchTexture.minFilter = THREE.NearestFilter;
	this.searchTexture.generateMipmaps = false;
	this.searchTexture.needsUpdate = true;
	this.searchTexture.flipY = false;

	// materials - pass 1

	if ( THREE.SMAAShader === undefined ) {
		console.error( "THREE.SMAAPass relies on THREE.SMAAShader" );
	}

	this.uniformsEdges = THREE.UniformsUtils.clone( THREE.SMAAShader[0].uniforms );

	this.uniformsEdges[ "resolution" ].value.set( 1 / width, 1 / height );

	this.materialEdges = new THREE.ShaderMaterial( {
		defines: THREE.SMAAShader[0].defines,
		uniforms: this.uniformsEdges,
		vertexShader: THREE.SMAAShader[0].vertexShader,
		fragmentShader: THREE.SMAAShader[0].fragmentShader
	} );

	// materials - pass 2

	this.uniformsWeights = THREE.UniformsUtils.clone( THREE.SMAAShader[1].uniforms );

	this.uniformsWeights[ "resolution" ].value.set( 1 / width, 1 / height );
	this.uniformsWeights[ "tDiffuse" ].value = this.edgesRT.texture;
	this.uniformsWeights[ "tArea" ].value = this.areaTexture;
	this.uniformsWeights[ "tSearch" ].value = this.searchTexture;

	this.materialWeights = new THREE.ShaderMaterial( {
		defines: THREE.SMAAShader[1].defines,
		uniforms: this.uniformsWeights,
		vertexShader: THREE.SMAAShader[1].vertexShader,
		fragmentShader: THREE.SMAAShader[1].fragmentShader
	} );

	// materials - pass 3

	this.uniformsBlend = THREE.UniformsUtils.clone( THREE.SMAAShader[2].uniforms );

	this.uniformsBlend[ "resolution" ].value.set( 1 / width, 1 / height );
	this.uniformsBlend[ "tDiffuse" ].value = this.weightsRT.texture;

	this.materialBlend = new THREE.ShaderMaterial( {
		uniforms: this.uniformsBlend,
		vertexShader: THREE.SMAAShader[2].vertexShader,
		fragmentShader: THREE.SMAAShader[2].fragmentShader
	} );

	this.needsSwap = false;

	this.camera = new THREE.OrthographicCamera( -1, 1, 1, -1, 0, 1 );
	this.scene  = new THREE.Scene();

	this.quad = new THREE.Mesh( new THREE.PlaneBufferGeometry( 2, 2 ), null );
	this.scene.add( this.quad );

};

THREE.SMAAPass.prototype = Object.assign( Object.create( THREE.Pass.prototype ), {

	constructor: THREE.SMAAPass,

	render: function ( renderer, writeBuffer, readBuffer, delta, maskActive ) {

		// pass 1

		this.uniformsEdges[ "tDiffuse" ].value = readBuffer.texture;

		this.quad.material = this.materialEdges;

		renderer.render( this.scene, this.camera, this.edgesRT, this.clear );

		// pass 2

		this.quad.material = this.materialWeights;

		renderer.render( this.scene, this.camera, this.weightsRT, this.clear );

		// pass 3

		this.uniformsBlend[ "tColor" ].value = readBuffer.texture;

		this.quad.material = this.materialBlend;

		if ( this.renderToScreen ) {

			renderer.render( this.scene, this.camera );

		} else {

			renderer.render( this.scene, this.camera, writeBuffer, this.clear );

		}

	},

	setSize: function ( width, height ) {

		this.edgesRT.setSize( width, height );
		this.weightsRT.setSize( width, height );

		this.materialEdges.uniforms[ 'resolution' ].value.set( 1 / width, 1 / height );
		this.materialWeights.uniforms[ 'resolution' ].value.set( 1 / width, 1 / height );
		this.materialBlend.uniforms[ 'resolution' ].value.set( 1 / width, 1 / height );

	},

	getAreaTexture: function () {
		return 'data:image/png;base64,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';
	},

	getSearchTexture: function () {
		return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEIAAAAhCAAAAABIXyLAAAAAOElEQVRIx2NgGAWjYBSMglEwEICREYRgFBZBqDCSLA2MGPUIVQETE9iNUAqLR5gIeoQKRgwXjwAAGn4AtaFeYLEAAAAASUVORK5CYII=';
	}

} );

/**
 *
 * Temporal Anti-Aliasing Render Pass
 *
 * @author bhouston / http://clara.io/
 *
 * When there is no motion in the scene, the TAA render pass accumulates jittered camera samples across frames to create a high quality anti-aliased result.
 *
 * References:
 *
 * TODO: Add support for motion vector pas so that accumulation of samples across frames can occur on dynamics scenes.
 *
 */

THREE.TAARenderPass = function ( scene, camera, params ) {

	if ( THREE.ManualMSAARenderPass === undefined ) {

		console.error( "THREE.TAARenderPass relies on THREE.ManualMSAARenderPass" );

	}
	THREE.ManualMSAARenderPass.call( this, scene, camera, params );

	this.sampleLevel = 0;
	this.accumulate = false;

};

THREE.TAARenderPass.JitterVectors = THREE.ManualMSAARenderPass.JitterVectors;

THREE.TAARenderPass.prototype = Object.assign( Object.create( THREE.ManualMSAARenderPass.prototype ), {

	constructor: THREE.TAARenderPass,

	render: function ( renderer, writeBuffer, readBuffer, delta ) {

		if( ! this.accumulate ) {

				THREE.ManualMSAARenderPass.prototype.render.call( this, renderer, writeBuffer, readBuffer, delta );

				this.accumulateIndex = -1;
				return;

		}

		var jitterOffsets = THREE.TAARenderPass.JitterVectors[ 5 ];

		if ( ! this.sampleRenderTarget ) {

			this.sampleRenderTarget = new THREE.WebGLRenderTarget( readBuffer.width, readBuffer.height, this.params );

		}

		if ( ! this.holdRenderTarget ) {

			this.holdRenderTarget = new THREE.WebGLRenderTarget( readBuffer.width, readBuffer.height, this.params );

		}

		if( this.accumulate && this.accumulateIndex === -1 ) {

				THREE.ManualMSAARenderPass.prototype.render.call( this, renderer, this.holdRenderTarget, readBuffer, delta );

				this.accumulateIndex = 0;

		}

		var autoClear = renderer.autoClear;
		renderer.autoClear = false;

		var sampleWeight = 1.0 / ( jitterOffsets.length );

		if( this.accumulateIndex >= 0 && this.accumulateIndex < jitterOffsets.length ) {

			this.copyUniforms[ "opacity" ].value = sampleWeight;
			this.copyUniforms[ "tDiffuse" ].value = writeBuffer.texture;

			// render the scene multiple times, each slightly jitter offset from the last and accumulate the results.
			var numSamplesPerFrame = Math.pow( 2, this.sampleLevel );
			for ( var i = 0; i < numSamplesPerFrame; i ++ ) {

				var j = this.accumulateIndex;
				var jitterOffset = jitterOffsets[j];
				if ( this.camera.setViewOffset ) {
					this.camera.setViewOffset( readBuffer.width, readBuffer.height,
						jitterOffset[ 0 ] * 0.0625, jitterOffset[ 1 ] * 0.0625,   // 0.0625 = 1 / 16
						readBuffer.width, readBuffer.height );
				}

				renderer.render( this.scene, this.camera, writeBuffer, true );
				renderer.render( this.scene2, this.camera2, this.sampleRenderTarget, ( this.accumulateIndex === 0 ) );

				this.accumulateIndex ++;
				if( this.accumulateIndex >= jitterOffsets.length ) break;
			}

			if ( this.camera.clearViewOffset ) this.camera.clearViewOffset();

		}

		var accumulationWeight = this.accumulateIndex * sampleWeight;

		if( accumulationWeight > 0 ) {
			this.copyUniforms[ "opacity" ].value = 1.0;
			this.copyUniforms[ "tDiffuse" ].value = this.sampleRenderTarget.texture;
			renderer.render( this.scene2, this.camera2, writeBuffer, true );
		}
		if( accumulationWeight < 1.0 ) {
			this.copyUniforms[ "opacity" ].value = 1.0 - accumulationWeight;
			this.copyUniforms[ "tDiffuse" ].value = this.holdRenderTarget.texture;
			renderer.render( this.scene2, this.camera2, writeBuffer, ( accumulationWeight === 0 ) );
		}

		renderer.autoClear = autoClear;

	}

});

/**
 * @author alteredq / http://alteredqualia.com/
 *
 * Convolution shader
 * ported from o3d sample to WebGL / GLSL
 * http://o3d.googlecode.com/svn/trunk/samples/convolution.html
 */

THREE.ConvolutionShader = {

    defines: {

        "KERNEL_SIZE_FLOAT": "25.0",
        "KERNEL_SIZE_INT": "25",

    },

    uniforms: {

        "tDiffuse":        { value: null },
        "uImageIncrement": { value: new THREE.Vector2( 0.001953125, 0.0 ) },
        "cKernel":         { value: [] }

    },

    vertexShader: [

        "uniform vec2 uImageIncrement;",

        "varying vec2 vUv;",

        "void main() {",

        "vUv = uv - ( ( KERNEL_SIZE_FLOAT - 1.0 ) / 2.0 ) * uImageIncrement;",
        "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

        "}"

    ].join( "\n" ),

    fragmentShader: [

        "uniform float cKernel[ KERNEL_SIZE_INT ];",

        "uniform sampler2D tDiffuse;",
        "uniform vec2 uImageIncrement;",

        "varying vec2 vUv;",

        "void main() {",

        "vec2 imageCoord = vUv;",
        "vec4 sum = vec4( 0.0, 0.0, 0.0, 0.0 );",

        "for( int i = 0; i < KERNEL_SIZE_INT; i ++ ) {",

        "sum += texture2D( tDiffuse, imageCoord ) * cKernel[ i ];",
        "imageCoord += uImageIncrement;",

        "}",

        "gl_FragColor = sum;",

        "}"


    ].join( "\n" ),

    buildKernel: function ( sigma ) {

        // We lop off the sqrt(2 * pi) * sigma term, since we're going to normalize anyway.

        function gauss( x, sigma ) {

            return Math.exp( - ( x * x ) / ( 2.0 * sigma * sigma ) );

        }

        var i, values, sum, halfWidth, kMaxKernelSize = 25, kernelSize = 2 * Math.ceil( sigma * 3.0 ) + 1;

        if ( kernelSize > kMaxKernelSize ) kernelSize = kMaxKernelSize;
        halfWidth = ( kernelSize - 1 ) * 0.5;

        values = new Array( kernelSize );
        sum = 0.0;
        for ( i = 0; i < kernelSize; ++ i ) {

            values[ i ] = gauss( i - halfWidth, sigma );
            sum += values[ i ];

        }

        // normalize the kernel

        for ( i = 0; i < kernelSize; ++ i ) values[ i ] /= sum;

        return values;

    }

};

/**
 * @author alteredq / http://alteredqualia.com/
 *
 * Full-screen textured quad shader
 */

THREE.CopyShader = {

    uniforms: {

        "tDiffuse": { value: null },
        "opacity":  { value: 1.0 }

    },

    vertexShader: [

        "varying vec2 vUv;",

        "void main() {",

        "vUv = uv;",
        "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

        "}"

    ].join( "\n" ),

    fragmentShader: [

        "uniform float opacity;",

        "uniform sampler2D tDiffuse;",

        "varying vec2 vUv;",

        "void main() {",

        "vec4 texel = texture2D( tDiffuse, vUv );",
        "gl_FragColor = opacity * texel;",

        "}"

    ].join( "\n" )

};

/**
 * @author alteredq / http://alteredqualia.com/
 * @author davidedc / http://www.sketchpatch.net/
 *
 * NVIDIA FXAA by Timothy Lottes
 * http://timothylottes.blogspot.com/2011/06/fxaa3-source-released.html
 * - WebGL port by @supereggbert
 * http://www.glge.org/demos/fxaa/
 */

THREE.FXAAShader = {

	uniforms: {

		"tDiffuse":   { value: null },
		"resolution": { value: new THREE.Vector2( 1 / 1024, 1 / 512 ) }

	},

	vertexShader: [

		"void main() {",

			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join( "\n" ),

	fragmentShader: [

		"uniform sampler2D tDiffuse;",
		"uniform vec2 resolution;",

		"#define FXAA_REDUCE_MIN   (1.0/128.0)",
		"#define FXAA_REDUCE_MUL   (1.0/8.0)",
		"#define FXAA_SPAN_MAX     8.0",

		"void main() {",

			"vec3 rgbNW = texture2D( tDiffuse, ( gl_FragCoord.xy + vec2( -1.0, -1.0 ) ) * resolution ).xyz;",
			"vec3 rgbNE = texture2D( tDiffuse, ( gl_FragCoord.xy + vec2( 1.0, -1.0 ) ) * resolution ).xyz;",
			"vec3 rgbSW = texture2D( tDiffuse, ( gl_FragCoord.xy + vec2( -1.0, 1.0 ) ) * resolution ).xyz;",
			"vec3 rgbSE = texture2D( tDiffuse, ( gl_FragCoord.xy + vec2( 1.0, 1.0 ) ) * resolution ).xyz;",
			"vec4 rgbaM  = texture2D( tDiffuse,  gl_FragCoord.xy  * resolution );",
			"vec3 rgbM  = rgbaM.xyz;",
			"vec3 luma = vec3( 0.299, 0.587, 0.114 );",

			"float lumaNW = dot( rgbNW, luma );",
			"float lumaNE = dot( rgbNE, luma );",
			"float lumaSW = dot( rgbSW, luma );",
			"float lumaSE = dot( rgbSE, luma );",
			"float lumaM  = dot( rgbM,  luma );",
			"float lumaMin = min( lumaM, min( min( lumaNW, lumaNE ), min( lumaSW, lumaSE ) ) );",
			"float lumaMax = max( lumaM, max( max( lumaNW, lumaNE) , max( lumaSW, lumaSE ) ) );",

			"vec2 dir;",
			"dir.x = -((lumaNW + lumaNE) - (lumaSW + lumaSE));",
			"dir.y =  ((lumaNW + lumaSW) - (lumaNE + lumaSE));",

			"float dirReduce = max( ( lumaNW + lumaNE + lumaSW + lumaSE ) * ( 0.25 * FXAA_REDUCE_MUL ), FXAA_REDUCE_MIN );",

			"float rcpDirMin = 1.0 / ( min( abs( dir.x ), abs( dir.y ) ) + dirReduce );",
			"dir = min( vec2( FXAA_SPAN_MAX,  FXAA_SPAN_MAX),",
				  "max( vec2(-FXAA_SPAN_MAX, -FXAA_SPAN_MAX),",
						"dir * rcpDirMin)) * resolution;",
			"vec4 rgbA = (1.0/2.0) * (",
        	"texture2D(tDiffuse,  gl_FragCoord.xy  * resolution + dir * (1.0/3.0 - 0.5)) +",
			"texture2D(tDiffuse,  gl_FragCoord.xy  * resolution + dir * (2.0/3.0 - 0.5)));",
    		"vec4 rgbB = rgbA * (1.0/2.0) + (1.0/4.0) * (",
			"texture2D(tDiffuse,  gl_FragCoord.xy  * resolution + dir * (0.0/3.0 - 0.5)) +",
      		"texture2D(tDiffuse,  gl_FragCoord.xy  * resolution + dir * (3.0/3.0 - 0.5)));",
    		"float lumaB = dot(rgbB, vec4(luma, 0.0));",

			"if ( ( lumaB < lumaMin ) || ( lumaB > lumaMax ) ) {",

				"gl_FragColor = rgbA;",

			"} else {",
				"gl_FragColor = rgbB;",

			"}",

		"}"

	].join( "\n" )

};

/**
 * @author mpk / http://polko.me/
 *
 * WebGL port of Subpixel Morphological Antialiasing (SMAA) v2.8
 * Preset: SMAA 1x Medium (with color edge detection)
 * https://github.com/iryoku/smaa/releases/tag/v2.8
 */

THREE.SMAAShader = [ {

	defines: {

		"SMAA_THRESHOLD": "0.1"

	},

	uniforms: {

		"tDiffuse":		{ value: null },
		"resolution":	{ value: new THREE.Vector2( 1 / 1024, 1 / 512 ) }

	},

	vertexShader: [

		"uniform vec2 resolution;",

		"varying vec2 vUv;",
		"varying vec4 vOffset[ 3 ];",

		"void SMAAEdgeDetectionVS( vec2 texcoord ) {",
			"vOffset[ 0 ] = texcoord.xyxy + resolution.xyxy * vec4( -1.0, 0.0, 0.0,  1.0 );", // WebGL port note: Changed sign in W component
			"vOffset[ 1 ] = texcoord.xyxy + resolution.xyxy * vec4(  1.0, 0.0, 0.0, -1.0 );", // WebGL port note: Changed sign in W component
			"vOffset[ 2 ] = texcoord.xyxy + resolution.xyxy * vec4( -2.0, 0.0, 0.0,  2.0 );", // WebGL port note: Changed sign in W component
		"}",

		"void main() {",

			"vUv = uv;",

			"SMAAEdgeDetectionVS( vUv );",

			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join("\n"),

	fragmentShader: [

		"uniform sampler2D tDiffuse;",

		"varying vec2 vUv;",
		"varying vec4 vOffset[ 3 ];",

		"vec4 SMAAColorEdgeDetectionPS( vec2 texcoord, vec4 offset[3], sampler2D colorTex ) {",
			"vec2 threshold = vec2( SMAA_THRESHOLD, SMAA_THRESHOLD );",

			// Calculate color deltas:
			"vec4 delta;",
			"vec3 C = texture2D( colorTex, texcoord ).rgb;",

			"vec3 Cleft = texture2D( colorTex, offset[0].xy ).rgb;",
			"vec3 t = abs( C - Cleft );",
			"delta.x = max( max( t.r, t.g ), t.b );",

			"vec3 Ctop = texture2D( colorTex, offset[0].zw ).rgb;",
			"t = abs( C - Ctop );",
			"delta.y = max( max( t.r, t.g ), t.b );",

			// We do the usual threshold:
			"vec2 edges = step( threshold, delta.xy );",

			// Then discard if there is no edge:
			"if ( dot( edges, vec2( 1.0, 1.0 ) ) == 0.0 )",
				"discard;",

			// Calculate right and bottom deltas:
			"vec3 Cright = texture2D( colorTex, offset[1].xy ).rgb;",
			"t = abs( C - Cright );",
			"delta.z = max( max( t.r, t.g ), t.b );",

			"vec3 Cbottom  = texture2D( colorTex, offset[1].zw ).rgb;",
			"t = abs( C - Cbottom );",
			"delta.w = max( max( t.r, t.g ), t.b );",

			// Calculate the maximum delta in the direct neighborhood:
			"float maxDelta = max( max( max( delta.x, delta.y ), delta.z ), delta.w );",

			// Calculate left-left and top-top deltas:
			"vec3 Cleftleft  = texture2D( colorTex, offset[2].xy ).rgb;",
			"t = abs( C - Cleftleft );",
			"delta.z = max( max( t.r, t.g ), t.b );",

			"vec3 Ctoptop = texture2D( colorTex, offset[2].zw ).rgb;",
			"t = abs( C - Ctoptop );",
			"delta.w = max( max( t.r, t.g ), t.b );",

			// Calculate the final maximum delta:
			"maxDelta = max( max( maxDelta, delta.z ), delta.w );",

			// Local contrast adaptation in action:
			"edges.xy *= step( 0.5 * maxDelta, delta.xy );",

			"return vec4( edges, 0.0, 0.0 );",
		"}",

		"void main() {",

			"gl_FragColor = SMAAColorEdgeDetectionPS( vUv, vOffset, tDiffuse );",

		"}"

	].join("\n")

}, {

	defines: {

		"SMAA_MAX_SEARCH_STEPS":		"8",
		"SMAA_AREATEX_MAX_DISTANCE":	"16",
		"SMAA_AREATEX_PIXEL_SIZE":		"( 1.0 / vec2( 160.0, 560.0 ) )",
		"SMAA_AREATEX_SUBTEX_SIZE":		"( 1.0 / 7.0 )"

	},

	uniforms: {

		"tDiffuse":		{ value: null },
		"tArea":		{ value: null },
		"tSearch":		{ value: null },
		"resolution":	{ value: new THREE.Vector2( 1 / 1024, 1 / 512 ) }

	},

	vertexShader: [

		"uniform vec2 resolution;",

		"varying vec2 vUv;",
		"varying vec4 vOffset[ 3 ];",
		"varying vec2 vPixcoord;",

		"void SMAABlendingWeightCalculationVS( vec2 texcoord ) {",
			"vPixcoord = texcoord / resolution;",

			// We will use these offsets for the searches later on (see @PSEUDO_GATHER4):
			"vOffset[ 0 ] = texcoord.xyxy + resolution.xyxy * vec4( -0.25, 0.125, 1.25, 0.125 );", // WebGL port note: Changed sign in Y and W components
			"vOffset[ 1 ] = texcoord.xyxy + resolution.xyxy * vec4( -0.125, 0.25, -0.125, -1.25 );", // WebGL port note: Changed sign in Y and W components

			// And these for the searches, they indicate the ends of the loops:
			"vOffset[ 2 ] = vec4( vOffset[ 0 ].xz, vOffset[ 1 ].yw ) + vec4( -2.0, 2.0, -2.0, 2.0 ) * resolution.xxyy * float( SMAA_MAX_SEARCH_STEPS );",

		"}",

		"void main() {",

			"vUv = uv;",

			"SMAABlendingWeightCalculationVS( vUv );",

			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join("\n"),

	fragmentShader: [

		"#define SMAASampleLevelZeroOffset( tex, coord, offset ) texture2D( tex, coord + float( offset ) * resolution, 0.0 )",

		"uniform sampler2D tDiffuse;",
		"uniform sampler2D tArea;",
		"uniform sampler2D tSearch;",
		"uniform vec2 resolution;",

		"varying vec2 vUv;",
		"varying vec4 vOffset[3];",
		"varying vec2 vPixcoord;",

		"vec2 round( vec2 x ) {",
			"return sign( x ) * floor( abs( x ) + 0.5 );",
		"}",

		"float SMAASearchLength( sampler2D searchTex, vec2 e, float bias, float scale ) {",
			// Not required if searchTex accesses are set to point:
			// float2 SEARCH_TEX_PIXEL_SIZE = 1.0 / float2(66.0, 33.0);
			// e = float2(bias, 0.0) + 0.5 * SEARCH_TEX_PIXEL_SIZE +
			//     e * float2(scale, 1.0) * float2(64.0, 32.0) * SEARCH_TEX_PIXEL_SIZE;
			"e.r = bias + e.r * scale;",
			"return 255.0 * texture2D( searchTex, e, 0.0 ).r;",
		"}",

		"float SMAASearchXLeft( sampler2D edgesTex, sampler2D searchTex, vec2 texcoord, float end ) {",
			/**
			* @PSEUDO_GATHER4
			* This texcoord has been offset by (-0.25, -0.125) in the vertex shader to
			* sample between edge, thus fetching four edges in a row.
			* Sampling with different offsets in each direction allows to disambiguate
			* which edges are active from the four fetched ones.
			*/
			"vec2 e = vec2( 0.0, 1.0 );",

			"for ( int i = 0; i < SMAA_MAX_SEARCH_STEPS; i ++ ) {", // WebGL port note: Changed while to for
				"e = texture2D( edgesTex, texcoord, 0.0 ).rg;",
				"texcoord -= vec2( 2.0, 0.0 ) * resolution;",
				"if ( ! ( texcoord.x > end && e.g > 0.8281 && e.r == 0.0 ) ) break;",
			"}",

			// We correct the previous (-0.25, -0.125) offset we applied:
			"texcoord.x += 0.25 * resolution.x;",

			// The searches are bias by 1, so adjust the coords accordingly:
			"texcoord.x += resolution.x;",

			// Disambiguate the length added by the last step:
			"texcoord.x += 2.0 * resolution.x;", // Undo last step
			"texcoord.x -= resolution.x * SMAASearchLength(searchTex, e, 0.0, 0.5);",

			"return texcoord.x;",
		"}",

		"float SMAASearchXRight( sampler2D edgesTex, sampler2D searchTex, vec2 texcoord, float end ) {",
			"vec2 e = vec2( 0.0, 1.0 );",

			"for ( int i = 0; i < SMAA_MAX_SEARCH_STEPS; i ++ ) {", // WebGL port note: Changed while to for
				"e = texture2D( edgesTex, texcoord, 0.0 ).rg;",
				"texcoord += vec2( 2.0, 0.0 ) * resolution;",
				"if ( ! ( texcoord.x < end && e.g > 0.8281 && e.r == 0.0 ) ) break;",
			"}",

			"texcoord.x -= 0.25 * resolution.x;",
			"texcoord.x -= resolution.x;",
			"texcoord.x -= 2.0 * resolution.x;",
			"texcoord.x += resolution.x * SMAASearchLength( searchTex, e, 0.5, 0.5 );",

			"return texcoord.x;",
		"}",

		"float SMAASearchYUp( sampler2D edgesTex, sampler2D searchTex, vec2 texcoord, float end ) {",
			"vec2 e = vec2( 1.0, 0.0 );",

			"for ( int i = 0; i < SMAA_MAX_SEARCH_STEPS; i ++ ) {", // WebGL port note: Changed while to for
				"e = texture2D( edgesTex, texcoord, 0.0 ).rg;",
				"texcoord += vec2( 0.0, 2.0 ) * resolution;", // WebGL port note: Changed sign
				"if ( ! ( texcoord.y > end && e.r > 0.8281 && e.g == 0.0 ) ) break;",
			"}",

			"texcoord.y -= 0.25 * resolution.y;", // WebGL port note: Changed sign
			"texcoord.y -= resolution.y;", // WebGL port note: Changed sign
			"texcoord.y -= 2.0 * resolution.y;", // WebGL port note: Changed sign
			"texcoord.y += resolution.y * SMAASearchLength( searchTex, e.gr, 0.0, 0.5 );", // WebGL port note: Changed sign

			"return texcoord.y;",
		"}",

		"float SMAASearchYDown( sampler2D edgesTex, sampler2D searchTex, vec2 texcoord, float end ) {",
			"vec2 e = vec2( 1.0, 0.0 );",

			"for ( int i = 0; i < SMAA_MAX_SEARCH_STEPS; i ++ ) {", // WebGL port note: Changed while to for
				"e = texture2D( edgesTex, texcoord, 0.0 ).rg;",
				"texcoord -= vec2( 0.0, 2.0 ) * resolution;", // WebGL port note: Changed sign
				"if ( ! ( texcoord.y < end && e.r > 0.8281 && e.g == 0.0 ) ) break;",
			"}",

			"texcoord.y += 0.25 * resolution.y;", // WebGL port note: Changed sign
			"texcoord.y += resolution.y;", // WebGL port note: Changed sign
			"texcoord.y += 2.0 * resolution.y;", // WebGL port note: Changed sign
			"texcoord.y -= resolution.y * SMAASearchLength( searchTex, e.gr, 0.5, 0.5 );", // WebGL port note: Changed sign

			"return texcoord.y;",
		"}",

		"vec2 SMAAArea( sampler2D areaTex, vec2 dist, float e1, float e2, float offset ) {",
			// Rounding prevents precision errors of bilinear filtering:
			"vec2 texcoord = float( SMAA_AREATEX_MAX_DISTANCE ) * round( 4.0 * vec2( e1, e2 ) ) + dist;",

			// We do a scale and bias for mapping to texel space:
			"texcoord = SMAA_AREATEX_PIXEL_SIZE * texcoord + ( 0.5 * SMAA_AREATEX_PIXEL_SIZE );",

			// Move to proper place, according to the subpixel offset:
			"texcoord.y += SMAA_AREATEX_SUBTEX_SIZE * offset;",

			"return texture2D( areaTex, texcoord, 0.0 ).rg;",
		"}",

		"vec4 SMAABlendingWeightCalculationPS( vec2 texcoord, vec2 pixcoord, vec4 offset[ 3 ], sampler2D edgesTex, sampler2D areaTex, sampler2D searchTex, ivec4 subsampleIndices ) {",
			"vec4 weights = vec4( 0.0, 0.0, 0.0, 0.0 );",

			"vec2 e = texture2D( edgesTex, texcoord ).rg;",

			"if ( e.g > 0.0 ) {", // Edge at north
				"vec2 d;",

				// Find the distance to the left:
				"vec2 coords;",
				"coords.x = SMAASearchXLeft( edgesTex, searchTex, offset[ 0 ].xy, offset[ 2 ].x );",
				"coords.y = offset[ 1 ].y;", // offset[1].y = texcoord.y - 0.25 * resolution.y (@CROSSING_OFFSET)
				"d.x = coords.x;",

				// Now fetch the left crossing edges, two at a time using bilinear
				// filtering. Sampling at -0.25 (see @CROSSING_OFFSET) enables to
				// discern what value each edge has:
				"float e1 = texture2D( edgesTex, coords, 0.0 ).r;",

				// Find the distance to the right:
				"coords.x = SMAASearchXRight( edgesTex, searchTex, offset[ 0 ].zw, offset[ 2 ].y );",
				"d.y = coords.x;",

				// We want the distances to be in pixel units (doing this here allow to
				// better interleave arithmetic and memory accesses):
				"d = d / resolution.x - pixcoord.x;",

				// SMAAArea below needs a sqrt, as the areas texture is compressed
				// quadratically:
				"vec2 sqrt_d = sqrt( abs( d ) );",

				// Fetch the right crossing edges:
				"coords.y -= 1.0 * resolution.y;", // WebGL port note: Added
				"float e2 = SMAASampleLevelZeroOffset( edgesTex, coords, ivec2( 1, 0 ) ).r;",

				// Ok, we know how this pattern looks like, now it is time for getting
				// the actual area:
				"weights.rg = SMAAArea( areaTex, sqrt_d, e1, e2, float( subsampleIndices.y ) );",
			"}",

			"if ( e.r > 0.0 ) {", // Edge at west
				"vec2 d;",

				// Find the distance to the top:
				"vec2 coords;",

				"coords.y = SMAASearchYUp( edgesTex, searchTex, offset[ 1 ].xy, offset[ 2 ].z );",
				"coords.x = offset[ 0 ].x;", // offset[1].x = texcoord.x - 0.25 * resolution.x;
				"d.x = coords.y;",

				// Fetch the top crossing edges:
				"float e1 = texture2D( edgesTex, coords, 0.0 ).g;",

				// Find the distance to the bottom:
				"coords.y = SMAASearchYDown( edgesTex, searchTex, offset[ 1 ].zw, offset[ 2 ].w );",
				"d.y = coords.y;",

				// We want the distances to be in pixel units:
				"d = d / resolution.y - pixcoord.y;",

				// SMAAArea below needs a sqrt, as the areas texture is compressed
				// quadratically:
				"vec2 sqrt_d = sqrt( abs( d ) );",

				// Fetch the bottom crossing edges:
				"coords.y -= 1.0 * resolution.y;", // WebGL port note: Added
				"float e2 = SMAASampleLevelZeroOffset( edgesTex, coords, ivec2( 0, 1 ) ).g;",

				// Get the area for this direction:
				"weights.ba = SMAAArea( areaTex, sqrt_d, e1, e2, float( subsampleIndices.x ) );",
			"}",

			"return weights;",
		"}",

		"void main() {",

			"gl_FragColor = SMAABlendingWeightCalculationPS( vUv, vPixcoord, vOffset, tDiffuse, tArea, tSearch, ivec4( 0.0 ) );",

		"}"

	].join("\n")

}, {

	uniforms: {

		"tDiffuse":		{ value: null },
		"tColor":		{ value: null },
		"resolution":	{ value: new THREE.Vector2( 1 / 1024, 1 / 512 ) }

	},

	vertexShader: [

		"uniform vec2 resolution;",

		"varying vec2 vUv;",
		"varying vec4 vOffset[ 2 ];",

		"void SMAANeighborhoodBlendingVS( vec2 texcoord ) {",
			"vOffset[ 0 ] = texcoord.xyxy + resolution.xyxy * vec4( -1.0, 0.0, 0.0, 1.0 );", // WebGL port note: Changed sign in W component
			"vOffset[ 1 ] = texcoord.xyxy + resolution.xyxy * vec4( 1.0, 0.0, 0.0, -1.0 );", // WebGL port note: Changed sign in W component
		"}",

		"void main() {",

			"vUv = uv;",

			"SMAANeighborhoodBlendingVS( vUv );",

			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join("\n"),

	fragmentShader: [

		"uniform sampler2D tDiffuse;",
		"uniform sampler2D tColor;",
		"uniform vec2 resolution;",

		"varying vec2 vUv;",
		"varying vec4 vOffset[ 2 ];",

		"vec4 SMAANeighborhoodBlendingPS( vec2 texcoord, vec4 offset[ 2 ], sampler2D colorTex, sampler2D blendTex ) {",
			// Fetch the blending weights for current pixel:
			"vec4 a;",
			"a.xz = texture2D( blendTex, texcoord ).xz;",
			"a.y = texture2D( blendTex, offset[ 1 ].zw ).g;",
			"a.w = texture2D( blendTex, offset[ 1 ].xy ).a;",

			// Is there any blending weight with a value greater than 0.0?
			"if ( dot(a, vec4( 1.0, 1.0, 1.0, 1.0 )) < 1e-5 ) {",
				"return texture2D( colorTex, texcoord, 0.0 );",
			"} else {",
				// Up to 4 lines can be crossing a pixel (one through each edge). We
				// favor blending by choosing the line with the maximum weight for each
				// direction:
				"vec2 offset;",
				"offset.x = a.a > a.b ? a.a : -a.b;", // left vs. right
				"offset.y = a.g > a.r ? -a.g : a.r;", // top vs. bottom // WebGL port note: Changed signs

				// Then we go in the direction that has the maximum weight:
				"if ( abs( offset.x ) > abs( offset.y )) {", // horizontal vs. vertical
					"offset.y = 0.0;",
				"} else {",
					"offset.x = 0.0;",
				"}",

				// Fetch the opposite color and lerp by hand:
				"vec4 C = texture2D( colorTex, texcoord, 0.0 );",
				"texcoord += sign( offset ) * resolution;",
				"vec4 Cop = texture2D( colorTex, texcoord, 0.0 );",
				"float s = abs( offset.x ) > abs( offset.y ) ? abs( offset.x ) : abs( offset.y );",

				// WebGL port note: Added gamma correction
				"C.xyz = pow(C.xyz, vec3(2.2));",
				"Cop.xyz = pow(Cop.xyz, vec3(2.2));",
				"vec4 mixed = mix(C, Cop, s);",
				"mixed.xyz = pow(mixed.xyz, vec3(1.0 / 2.2));",

				"return mixed;",
			"}",
		"}",

		"void main() {",

			"gl_FragColor = SMAANeighborhoodBlendingPS( vUv, vOffset, tColor, tDiffuse );",

		"}"

	].join("\n")

} ];

ShaderLibrary = {
    get: function(filename)
    {
        return ShaderLibrary["include_common.glsl"] + "\n" + ShaderLibrary[filename + ".glsl"];
    }
};
Component = function()
{
    // this allows notifying entities about bound changes (useful for sized components)
    this._entity = null;
};

Component.prototype =
{
    // to be overridden:
    onAdded: function() {},
    onRemoved: function() {},

    // by default, onUpdate is not implemented at all
    //onUpdate: function(dt) {},
    onUpdate: null,

    get entity()
    {
        return this._entity;
    }
};
Entity = function()
{
    // components
    this._components = null;
    this._requiresUpdates = false;
    this._onRequireUpdatesChange = new Signal();
    this._entityEngine = null;
};


/**
 * Converts an Object3D into an object containing the same signature as Entity
 * @param object3d
 */
Entity.convert = function(object3d, components)
{
    Entity.call(object3d);
    for (var key in Entity.prototype) {
        if (Entity.prototype.hasOwnProperty(key)) {
            object3d[key] = Entity.prototype[key];
        }
    }

    if (object3d.parent && object3d.parent._entityEngine)
        object3d._setEntityEngine(object3d.parent._entityEngine);

    var add = object3d.add;
    var remove = object3d.remove;

    object3d.add = function(child)
    {
        add.call(object3d, child);
        if (!child.hasOwnProperty("_setEntityEngine"))
            Entity.convert(child);

        child._setEntityEngine(this._entityEngine);
    };

    object3d.remove = function(child)
    {
        remove.call(object3d, child);
        if (child.hasOwnProperty("_setEntityEngine"))
            child._setEntityEngine(null);
    };

    if (components)
        object3d.addComponents(components);

    for (var i = 0; i < object3d.children.length; ++i) {
        if (!object3d.children[i].hasOwnProperty("_setEntityEngine"))
            Entity.convert(object3d.children[i]);
    }
};

Entity.prototype.addComponents = function(components)
{
    for (var i = 0; i < components.length; ++i)
        this.addComponent(components[i]);
};

Entity.prototype.removeComponents = function(components)
{
    for (var i = 0; i < components.length; ++i) {
        this.removeComponent(components[i]);
    }
};

Entity.prototype.addComponent = function(component)
{
    if (component._entity)
        throw new Error("Component already added to an entity!");

    this._components = this._components || [];

    this._components.push(component);

    this._updateRequiresUpdates(this._requiresUpdates || (!!component.onUpdate));

    component._entity = this;
    component.onAdded();
};

Entity.prototype._updateRequiresUpdates = function(value)
{
    if (value !== this._requiresUpdates) {
        this._requiresUpdates = value;
        this._onRequireUpdatesChange.dispatch(this);
    }
};

Entity.prototype.hasComponent = function(component)
{
    return this._components && this._components.indexOf(component) >= 0;
};

Entity.prototype.removeComponent = function(component)
{
    if (!this.hasComponent(component))
        throw new Error("Component wasn't added to this entity!");

    component.onRemoved();

    var requiresUpdates = false;
    var len = this._components.length;
    var j = 0;
    var newComps = [];

    // not splicing since we need to regenerate _requiresUpdates anyway by looping
    for (var i = 0; i < len; ++i) {
        var c = this._components[i];
        if (c !== component) {
            newComps[j++] = c;
            requiresUpdates = requiresUpdates || !!component.onUpdate;
        }
    }

    this._components = j === 0? null : newComps;
    component._entity = null;
    this._updateRequiresUpdates(requiresUpdates);
};

Entity.prototype.update = function(dt)
{
    var components = this._components;
    if (components) {
        var len = components.length;
        for (var i = 0; i < len; ++i) {
            var component = components[i];
            if (component.onUpdate) {
                component.onUpdate(dt);
            }
        }
    }
};

Entity.prototype._setEntityEngine = function(value)
{
    if (this._entityEngine) this._entityEngine.unregisterEntity(this);
    this._entityEngine = value;
    if (this._entityEngine) this._entityEngine.registerEntity(this);

    for (var i = 0; i < this.children.length; ++i) {
        this.children[i]._setEntityEngine(value);
    }
};

/**
 * Keeps track and updates entities
 * @constructor
 */
EntityEngine = function()
{
    this._updateableEntities = [];
};

EntityEngine.prototype =
{
    registerEntity: function(entity)
    {
        entity._onRequireUpdatesChange.bind(this._onEntityUpdateChange, this);
        if (entity._requiresUpdates)
            this._addUpdatableEntity(entity);
    },

    unregisterEntity: function(entity)
    {
        entity._onRequireUpdatesChange.unbind(this);
        if (entity._requiresUpdates)
            this._removeUpdatableEntity(entity);
    },

    _onEntityUpdateChange: function(entity)
    {
        if (entity._requiresUpdates)
            this._addUpdatableEntity(entity);
        else
            this._removeUpdatableEntity(entity);
    },

    _addUpdatableEntity: function(entity)
    {
        this._updateableEntities.push(entity);
    },

    _removeUpdatableEntity: function(entity)
    {
        var index = this._updateableEntities.indexOf(entity);
        this._updateableEntities.splice(index, 1);
    },

    update: function(dt)
    {
        var entities = this._updateableEntities;
        var len = entities.length;
        for (var i = 0; i < len; ++i) {
            entities[i].update(dt);
        }
    }
};
EntityScene = function()
{
    THREE.Scene.call(this);
    Entity.convert(this);
    this._entityEngine = new EntityEngine();
};


EntityScene.prototype = Object.create(THREE.Scene.prototype,
    {
        entityEngine: {
            get: function() {
                return this._entityEngine;
            }
        }
    }
);
var QueryString = function () {
    // This function is anonymous, is executed immediately and
    // the return value is assigned to QueryString!
    var query_string = {};
    var query = window.location.search.substring(1);
    var vars = query.split("&");
    for (var i=0;i<vars.length;i++) {
        var pair = vars[i].split("=");
        // If first entry with this name
        if (typeof query_string[pair[0]] === "undefined") {
            query_string[pair[0]] = decodeURIComponent(pair[1]);
            // If second entry with this name
        } else if (typeof query_string[pair[0]] === "string") {
            var arr = [ query_string[pair[0]],decodeURIComponent(pair[1]) ];
            query_string[pair[0]] = arr;
            // If third or later entry with this name
        } else {
            query_string[pair[0]].push(decodeURIComponent(pair[1]));
        }
    }
    return query_string;
}();

ShaderLibrary['include_common.glsl'] = 'vec4 encodeHDRE(vec3 color)\n{\n#ifdef HDRE\n    float maxValue = max(max(color.r, color.g), color.b) + .01;\n    float e = floor(max(log(maxValue), 0.0));\n    color /= exp(e);\n    return vec4(color, e / 5.0);\n#else\n    return vec4(color, 1.0);\n#endif\n}\n\nvec3 decodeHDRE(vec4 hdre)\n{\n#ifdef HDRE\n    float e = hdre.a * 5.0;\n    hdre.xyz *= exp(e);\n    return hdre.xyz;\n#else\n    return hdre.xyz;\n#endif\n}\n\nfloat luminance(vec3 color)\n{\n    return dot(color, vec3(.30, 0.59, .11));\n}\n\nfloat luminance(vec4 color)\n{\n    return luminance(color.xyz);\n}\n\nfloat linearStep(float lower, float upper, float x)\n{\n    return clamp((x - lower) / (upper - lower), 0.0, 1.0);\n}\n\n// Only for 0 - 1\nvec4 floatToRGBA8(float value)\n{\n    vec4 enc = value * vec4(1.0, 255.0, 65025.0, 16581375.0);\n    // cannot fract first value or 1 would not be encodable\n    enc.yzw = fract(enc.yzw);\n    return enc - enc.yzww * vec4(1.0/255.0, 1.0/255.0, 1.0/255.0, 0.0);\n}\n\nfloat RGBA8ToFloat(vec4 rgba)\n{\n    return dot(rgba, vec4(1.0, 1.0/255.0, 1.0/65025.0, 1.0/16581375.0));\n}\n\nvec2 floatToRG8(float value)\n{\n    vec2 enc = vec2(1.0, 255.0) * value;\n    enc.y = fract(enc.y);\n    enc.x -= enc.y / 255.0;\n    return enc;\n}\n\nfloat RG8ToFloat(vec2 rg)\n{\n    return dot(rg, vec2(1.0, 1.0/255.0));\n}';

ShaderLibrary['clouds_fragment.glsl'] = 'varying vec2 texCoords;\nuniform sampler2D map;\n\nuniform float density;\nuniform float startDistance;\nuniform samplerCube irradianceProbe;\nuniform float irradianceProbeBoost;\nuniform float minHeight;\nuniform float heightRange;\n\nvarying vec3 worldPosition;\n\nuniform vec3 lightWorldDir;\n\nvoid main() {\n    vec3 viewWorldDir = worldPosition - cameraPosition;\n    float dist = -viewWorldDir.y;\n    viewWorldDir = normalize(viewWorldDir);\n    vec4 samp = texture2D(map, texCoords);\n    float rescale = clamp((worldPosition.y - minHeight) / heightRange, 0.0, 1.0) ;\n\n    float height = max(samp.z - rescale, 0.0) / (1.0 - rescale); //smoothstep(rescale, 1.0, samp.z);\n    vec3 normal;\n    normal.xz = samp.xy * 2.0 - 1.0;\n    normal.y = .7;\n    normal = normalize(normal);\n\n    float d = clamp(exp2(-dist * height * density), 0.0, 1.0);\n\n    vec3 reflected = reflect(viewWorldDir, normal);\n    vec3 horizonSample = normalize(vec3(reflected.x, 0.5, reflected.z));\n    vec4 diffuseSample = textureCube(irradianceProbe, horizonSample);\n    vec3 diffuseLight = decodeHDRE(diffuseSample);\n    diffuseLight *= diffuseLight;\n\n    diffuseLight *= irradianceProbeBoost;\n\n//    float lambert = max(lightWorldDir.y * .7 + .3, 0.0); // wrap around a bit\n    float NDotL = dot(lightWorldDir, normal);\n    float lambert = max(NDotL * .9 + .1, 0.0); // wrap around a bit\n    diffuseLight += vec3(lambert) * 1.0;\n\n    vec3 color = diffuseLight;\n\n    gl_FragColor = vec4(sqrt(color), 1.0 - d);\n}\n';

ShaderLibrary['clouds_vertex.glsl'] = 'varying vec2 texCoords;\n\nvarying vec3 worldPosition;\n\nuniform float uvScale;\nuniform vec2 uvOffset;\n\nvoid main() {\n    vec3 localPos = position;\n    vec4 viewPos = modelViewMatrix * vec4(localPos, 1.0);\n    gl_Position = projectionMatrix * viewPos;\n    worldPosition = (modelMatrix * vec4(localPos, 1.0)).xyz;\n    texCoords = uv * uvScale + uvOffset;\n}';

ShaderLibrary['dielectric_fragment.glsl'] = '#define MIN_VARIANCE -0.0001\n#define LIGHT_BLEED_REDUCTION .5\n\nvarying vec3 worldPosition;\nvarying vec3 viewPosition;\nvarying vec3 worldNormal;\n\n#if defined(SSAO_MAP) || defined(ALBEDO_MAP) || defined(NORMAL_MAP) || defined(ROUGHNESS_MAP) || defined(EMISSION_MAP)\nvarying vec2 texCoords;\n#endif\n\n#ifdef SSAO_MAP\nvarying vec4 projection;\nuniform sampler2D ssaoMap;\n#endif\n\nuniform float shadowMapSize;\nuniform float shadowMapPixelSize;\n\n#ifdef SHADOW_MAP\nuniform sampler2D shadowMap;\n\nvarying vec4 shadowCoord;\n\n#ifdef PCF_SHADOW_MAP\nuniform vec2 shadowOffsets[NUM_SHADOW_SAMPLES]; // w contains bias\n#endif\n#endif\n\n\n#ifdef ALBEDO_MAP\nuniform sampler2D albedoMap;\n\n#ifdef ALBEDO_MAP_2\nuniform sampler2D albedoMap2;\nuniform float albedoBlend;\n#endif\n\n#endif\n\nuniform vec3 color;\n\nuniform float roughness;\nuniform float normalSpecularReflection;\n\n#ifdef NORMAL_MAP\nuniform sampler2D normalMap;\n#endif\n\n#ifdef ROUGHNESS_MAP\nuniform sampler2D roughnessMap;\nuniform float roughnessMapRange;\n#endif\n\n#ifdef EMISSION_MAP\nuniform sampler2D emissionMap;\n#endif\n\nuniform vec3 emissionColor;\n\n#ifdef AMBIENT_OCCLUSION_MAP\nuniform sampler2D aoMap;\nvarying vec2 texCoords2;\n#endif\n\n#ifdef LOCAL_SKYBOX\n// this could also be applied to irradiance map\nuniform vec3 skyboxPosition;\nuniform float skyboxSize;\n#endif\n\n#ifdef SPECULAR_PROBE\nuniform samplerCube specularProbe;\nuniform vec3 specularProbeColor;\n#endif\n\n#ifdef FOG_PROBE\nuniform samplerCube fogProbe;\nuniform float fogProbeBoost;\n#endif\n\n#ifdef IRRADIANCE_PROBE\nuniform samplerCube irradianceProbe;\nuniform float irradianceProbeBoost;\n#endif\n\n// internal\nuniform vec3 ambientLightColor;\n\nuniform float alpha;\n\n#ifdef FOG\nuniform float fogDensity;\nuniform vec3 fogColor;\n#endif\n\n#if NUM_POINT_LIGHTS > 0\nstruct PointLight {\n    vec3 position;\n    vec3 color;\n    float distance;\n    float decay;\n    int shadow;\n    float shadowBias;\n    float shadowRadius;\n    vec2 shadowMapSize;\n};\n\nuniform PointLight pointLights[ NUM_POINT_LIGHTS ];\n#endif\n\n#if NUM_DIR_LIGHTS > 0\nstruct DirectionalLight {\n    vec3 direction;\n    vec3 color;\n    int shadow;\n    float shadowBias;\n    float shadowRadius;\n    vec2 shadowMapSize;\n};\nuniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];\n#endif\n\nvec3 intersectCubeMap(vec3 rayOrigin, vec3 rayDir, float cubeSize)\n{\n    vec3 t = (cubeSize * sign(rayDir) - rayOrigin) / rayDir;\n    float minT = min(min(t.x, t.y), t.z);\n    return rayOrigin + minT * rayDir;\n}\n\n#ifdef NORMAL_MAP\nvec3 perturbNormal2Arb(vec3 position, vec3 worldNormal, vec3 normalSample)\n{\n    vec3 q0 = dFdx( position.xyz );\n    vec3 q1 = dFdy( position.xyz );\n    vec2 st0 = dFdx( texCoords.st );\n    vec2 st1 = dFdy( texCoords.st );\n    vec3 S = normalize( q0 * st1.t - q1 * st0.t );\n    vec3 T = normalize( -q0 * st1.s + q1 * st0.s );\n    vec3 N = normalize( worldNormal );\n    mat3 tsn = mat3( S, T, N );\n    return normalize( tsn * normalSample );\n}\n#endif\n\nvec3 getNormal()\n{\n#if defined(NORMAL_MAP)\n    vec4 normalSample = texture2D( normalMap, texCoords );\n    vec3 normal = normalSample.xyz * 2.0 - 1.0;\n    return perturbNormal2Arb(worldPosition, worldNormal, normal);\n#else\n    #ifdef FACE_NORMALS\n        vec3 q0 = dFdx( worldPosition.xyz );\n        vec3 q1 = dFdy( worldPosition.xyz );\n        return normalize(cross(q0, q1));\n    #else\n        return normalize(worldNormal);\n    #endif\n#endif\n}\n\n#ifdef VSM_SHADOW_MAP\nvec2 getVSMMoments(vec2 uv)\n{\n    vec4 s = texture2D(shadowMap, uv);\n    #ifdef VSM_FLOAT\n    return s.xy;\n    #else\n    return vec2(RG8ToFloat(s.xy), RG8ToFloat(s.zw));\n    #endif\n}\n#endif\n\nfloat getShadow() {\n#ifdef SHADOW_MAP\n\n    #ifdef PCF_SHADOW_MAP\n        #if NUM_SHADOW_SAMPLES > 1\n        float shadow = 0.0;\n        for (int i = 0; i < NUM_SHADOW_SAMPLES; ++i) {\n            // pseudo random\n            #ifdef DITHER_SHADOW\n            float angle = fract (sin((gl_FragCoord.x + 0.5) * (gl_FragCoord.y + 1.0)) * 43758.5453123) * 3.1415 * 2.0;\n            float c = cos(angle);\n            float s = sin(angle);\n            vec2 offset;\n            offset.x = c * shadowOffsets[i].x - s * shadowOffsets[i].y;\n            offset.y = s * shadowOffsets[i].x + c * shadowOffsets[i].y;\n            #else\n            vec2 offset = shadowOffsets[i];\n            #endif\n\n            float occlDepth = RGBA8ToFloat(texture2D(shadowMap, shadowCoord.xy + offset));\n            float diff = shadowCoord.z - occlDepth;\n            shadow += float(diff <= 0.0);\n        }\n\n        shadow *= RCP_NUM_SHADOW_SAMPLES;\n        #else\n            float occlDepth = RGBA8ToFloat(texture2D(shadowMap, shadowCoord.xy));\n            float diff = shadowCoord.z - occlDepth;\n            float shadow = float(diff <= 0.0);\n        #endif\n    #endif\n\n    #ifdef VSM_SHADOW_MAP\n\n// the moments seem correct on ipad... why do the calculations differ?\n        vec2 moments = getVSMMoments(shadowCoord.xy);\n        float p = linearStep(shadowCoord.z - 0.02, shadowCoord.z, moments.x);\n        float variance = moments.y - moments.x * moments.x;\n        variance = max(variance, MIN_VARIANCE);\n\n        float diff = shadowCoord.z - moments.x;\n        float upperBound = variance / (variance + diff*diff);\n        float shadow = linearStep(LIGHT_BLEED_REDUCTION, 1.0, upperBound);\n        shadow = clamp(max(shadow, p), 0.0, 1.0);\n    #endif\n\n    vec2 edges = abs(shadowCoord.xy * 2.0 - 1.0);\n    float edge = max(edges.x, edges.y);\n    edge = linearStep(.8, 1.0, edge);\n    shadow = mix(shadow, 1.0, edge);\n    return shadow;\n#else\n    return 1.0;\n#endif\n}\n\nfloat fresnel(float NdotL, float lowProfileDefault)\n{\n#ifdef PERFORMANCE_PROFILE_HIGH\n// angle to the power of 5\n    float angle = 1.0 - NdotL;\n    float fresnelFactor = angle * angle;\n    fresnelFactor *= fresnelFactor;\n    fresnelFactor *= angle;\n    return normalSpecularReflection + (1.0 - normalSpecularReflection) * fresnelFactor;\n#else\n    return lowProfileDefault;\n#endif\n}\n\nfloat trowbridgeReitz(float roughnessSqr, vec3 lightDir, vec3 normal, vec3 viewDir)\n{\n    vec3 halfVec = normalize(lightDir + viewDir);\n    float micro = max(dot(halfVec, normal), 0.0);\n    float denom = (micro * micro) * (roughnessSqr - 1.0) + 1.0;\n    return roughnessSqr / (denom * denom);\n}\n\nvoid accumulate(vec3 lightDir, vec3 lightColor, vec3 normal, vec3 viewDir, float roughnessSqr, out vec3 diffuseLight, out vec3 specularLight)\n{\n    float NdotL = max(dot(lightDir, normal), 0.0);\n    vec3 irradiance = lightColor * NdotL;\n    diffuseLight += irradiance;\n\n#ifndef IGNORESPECULAR\n    float F = fresnel(NdotL, .08);\n    float D = trowbridgeReitz(roughnessSqr, lightDir, normal, viewDir);\n    float amount = D * F;\n\n    specularLight += irradiance * amount;\n#endif\n}\n\nvoid main() {\n    float roughnessSqr = roughness;\n    #ifdef ROUGHNESS_MAP\n    roughnessSqr -= (texture2D(roughnessMap, texCoords).x - .5) * roughnessMapRange;\n    roughnessSqr = clamp(roughnessSqr, 0.0, 1.0);\n    #endif\n    roughnessSqr *= roughnessSqr;\n    vec3 viewWorldDir = normalize(worldPosition - cameraPosition);\n    vec3 viewDir = -normalize(viewPosition);\n\n    vec3 normal = getNormal();\n    vec3 viewNormal = mat3(viewMatrix) * normal;\n\n    vec3 albedo = vec3(1.0);\n\n#ifdef ALBEDO_MAP\n    albedo = texture2D(albedoMap, texCoords).xyz;\n    albedo *= albedo;\n\n    #ifdef ALBEDO_MAP_2\n        vec3 albedo2 = texture2D(albedoMap2, texCoords).xyz;\n        albedo = mix(albedo, albedo2 * albedo2, albedoBlend);\n    #endif\n#endif\n\n    albedo *= color;\n\n    vec3 diffuseLight = vec3(0.0);\n\n    #ifdef IRRADIANCE_PROBE\n        vec4 diffuseSample = textureCube(irradianceProbe, normal);\n        diffuseLight = decodeHDRE(diffuseSample);\n\n        diffuseLight *= diffuseLight * irradianceProbeBoost;\n    #endif\n\n    float ao = 1.0;\n    #ifdef AMBIENT_OCCLUSION_MAP\n        ao = texture2D(aoMap, texCoords2).x;\n    #endif\n\n    #ifdef SSAO_MAP\n        vec2 screenUV = projection.xy / projection.w * .5 + .5;\n        ao = texture2D(ssaoMap, screenUV).x;\n    #endif\n\n    diffuseLight += ambientLightColor;\n    #ifndef AO_ON_DIFFUSE\n    diffuseLight *= ao;\n    #endif\n\n    vec3 specularLight = vec3(0.0);\n\n    #ifdef SPECULAR_PROBE\n        vec3 reflectedView = reflect(viewWorldDir, normal);\n        float fresnelFactor = fresnel(max(dot(viewWorldDir, normal), 0.0), .35);\n\n        #ifdef LOCAL_SKYBOX\n            vec3 offsetRefl = intersectCubeMap(worldPosition - skyboxPosition, reflectedView, skyboxSize);\n        #else\n            vec3 offsetRefl = reflectedView;\n        #endif\n\n        vec4 reflectionSample = textureCube(specularProbe, reflectedView);\n        vec3 reflection;\n\n        reflection = decodeHDRE(reflectionSample);\n\n        reflection *= reflection * specularProbeColor;\n\n        specularLight = reflection * fresnelFactor;\n\n        #ifdef AMBIENT_OCCLUSION_MAP\n//        specularLight *= ao;\n        #endif\n    #endif\n\n    #if NUM_POINT_LIGHTS > 0\n    for (int i = 0; i < NUM_POINT_LIGHTS; ++i) {\n        vec3 worldDir = pointLights[i].position - worldPosition;\n        float sqrDist = dot(worldDir, worldDir);\n        worldDir /= sqrt(sqrDist);\n        vec3 fallOffColor = pointLights[i].color / max(sqrDist, .001);\n        accumulate(worldDir, fallOffColor, normal, viewDir, roughnessSqr, diffuseLight, specularLight);\n    }\n    #endif\n\n    float shadow = getShadow();\n\n    #if NUM_DIR_LIGHTS > 0\n    for (int i = 0; i < NUM_DIR_LIGHTS; ++i) {\n        float NdotL = max(dot(directionalLights[i].direction, viewNormal), 0.0);\n        vec3 irradiance = directionalLights[i].color * NdotL;\n        irradiance *= shadow;\n        diffuseLight += irradiance;\n\n        #ifndef IGNORESPECULAR\n        float F = fresnel(NdotL, .04);\n        float D = trowbridgeReitz(roughnessSqr, directionalLights[i].direction, viewNormal, viewDir);\n        float amount = D * F;\n\n        specularLight += irradiance * amount;\n        #endif\n    }\n    #endif\n\n    #ifdef AO_ON_DIFFUSE\n    diffuseLight *= ao;\n    #endif\n\n    vec3 color = albedo * diffuseLight + specularLight;\n\n    vec3 emission = emissionColor;\n    #ifdef EMISSION_MAP\n    vec3 emissionSample = texture2D(emissionMap, texCoords).xyz;\n    emissionSample *= emissionSample;\n    emission *= emissionSample;\n    #endif\n    color += emission;\n\n    #ifdef FOG\n        float fogAmount = clamp(exp2(viewPosition.z * fogDensity), 0.0, 1.0);\n        vec3 fogCol = fogColor;\n        #ifdef FOG_PROBE\n            vec4 fogSample = textureCube(fogProbe, vec3(viewWorldDir.x , 0.0, viewWorldDir.z));\n            fogSample.xyz = decodeHDRE(fogSample);\n            fogSample.xyz *= fogSample.xyz * fogProbeBoost;\n            fogCol *= fogSample.xyz;\n        #endif\n        color = mix(fogCol, color, fogAmount);\n\n// ONLY FOR THIS PROJECT, this provides a fade-out for the horizon\n        fogAmount = smoothstep(100.0, 250.0, length(worldPosition.xz));\n        color = mix(color, fogCol, fogAmount);\n    #endif\n\n\n    gl_FragColor = encodeHDRE(sqrt(color));\n//    gl_FragColor = vec4(shadow);\n}\n';

ShaderLibrary['dielectric_vertex.glsl'] = 'varying vec3 worldPosition;\nvarying vec3 viewPosition;\nvarying vec3 worldNormal;\n\n#if defined(SSAO_MAP) || defined(ALBEDO_MAP) || defined(NORMAL_MAP) || defined(ROUGHNESS_MAP) || defined(EMISSION_MAP)\nvarying vec2 texCoords;\n#endif\n\n#if defined(AMBIENT_OCCLUSION_MAP)\nattribute vec2 uv2;\n\nvarying vec2 texCoords2;\n#endif\n\n#ifdef SSAO_MAP\nvarying vec4 projection;\n#endif\n\n#ifdef SHADOW_MAP\nuniform mat4 shadowMatrix;\n\nvarying vec4 shadowCoord;\n#endif\n\nvoid main() {\n    worldPosition = (modelMatrix * vec4(position, 1.0)).xyz;\n    // normalMatrix seems to be view space... need world space, but it\'s okay since we\'re using uniform scaling only\n    vec4 viewPos = modelViewMatrix * vec4(position,1.0);\n    worldNormal = mat3(modelMatrix) * normalize(normal);\n    gl_Position = projectionMatrix * viewPos;\n    viewPosition = viewPos.xyz;\n\n    #if defined(SSAO_MAP) || defined(ALBEDO_MAP) || defined(NORMAL_MAP) || defined(ROUGHNESS_MAP) || defined(EMISSION_MAP)\n    texCoords = uv;\n    #endif\n\n    #if defined(AMBIENT_OCCLUSION_MAP)\n    texCoords2 = uv2;\n    #endif\n\n    #ifdef SSAO_MAP\n    projection = gl_Position;\n    #endif\n\n    #ifdef SHADOW_MAP\n    shadowCoord = (shadowMatrix * vec4(worldPosition, 1.0)) * .5 + .5;\n    #endif\n\n    #ifdef AO_MAP\n    texCoords2 = uv2;\n    #endif\n}';

ShaderLibrary['dynamic_sky_fragment.glsl'] = '#define NUM_SAMPLES 3\n#define PI 3.14159265\n\nvarying vec4 worldPosition;\n\nuniform vec3 lightDir;\n\n#ifdef CLOUD_MAP\nuniform samplerCube cloudMap;\n#endif\n\n#ifdef NIGHT_MAP\nuniform sampler2D nightMap;\n#endif\n\nfloat getRayleighPhase(float dot)\n{\n	return 0.75 + 0.75 * dot * dot;\n}\n\nfloat getMiePhase(float dot, float g)\n{\n    float g2 = g * g;\n	return pow(1.0 - g, 2.0) / pow(1.0 + g2 - 2.0 * g * dot, 1.5);\n}\n\nfloat scale(float fCos)\n{\n	float x = 1.0 - fCos;\n	return 0.25 * exp(-0.00287 + x*(0.459 + x*(3.83 + x*(-6.80 + x*5.25))));\n}\n\nvoid main()\n{\n\n// how much atmosphere to get through when we\'re on the floor?\n    // Get intersection with outer atmosphere\n    const float earthRadius = 10.0;\n    float atmosphereRadius = 10.25;\n    const float rayleighFactor = 0.0025;\n    const float mieFactor = 0.0005;\n    float rayleighFactor4PI = rayleighFactor * 4.0 * PI;\n    float mieFactor4PI = mieFactor * 4.0 * PI;\n    float miePhaseFactor = -.65;\n\n// in earth space:\n// assume camera is in centre\n    vec3 origin = vec3(0.0, earthRadius, 0.0);\n    vec3 origViewDir = normalize(worldPosition.xyz);\n    vec3 viewDir = origViewDir;\n    #ifdef CLOUD_MAP\n        float cloudThickness = textureCube(cloudMap, origViewDir).x;\n//    atmosphereRadius -= 0.24 * cloudThickness;\n    viewDir.y *= cloudThickness * .03 + .97;\n    viewDir = normalize(viewDir.xyz);\n        miePhaseFactor -= cloudThickness * .2;\n        rayleighFactor4PI += cloudThickness * .1;\n    #endif\n\n    float atmosphereThickness = atmosphereRadius - earthRadius;\n\n    float dotLO = dot(viewDir, origin);\n    // this is the distance the ray travels through the atmosphere from the origin\n    float scatterDistance = -dotLO + sqrt(dotLO * dotLO - dot(origin, origin) + atmosphereRadius * atmosphereRadius);\n\n    vec3 waveLen = vec3(0.650, 0.570, 0.475);\n    vec3 rcpWaveLen4 = 1.0 / (waveLen * waveLen * waveLen * waveLen);\n\n    // Initialize the scattering loop variables\n    float stepLength = scatterDistance / float(NUM_SAMPLES);\n    vec3 rayStep = viewDir * stepLength;\n\n    float LdotV = dot(-lightDir, viewDir);\n    float rayleighPhase = getRayleighPhase(LdotV);\n    float miePhase = getMiePhase(LdotV, miePhaseFactor);\n    miePhase = min(miePhase, 70.0);\n\n    vec3 samplePoint = rayStep * 0.5 + origin;\n    scatterDistance -= stepLength * .5;\n    vec3 attenuate = exp(-(rayleighFactor4PI * rcpWaveLen4 + mieFactor4PI) * stepLength);\n    vec3 lightColor = vec3(1.0); // + max(1.0 - lightDir.y, 0.0);\n    vec3 accum = vec3(0.0);\n\n    for (int i = 0; i < NUM_SAMPLES; ++i) {\n        float dotLS = dot(lightDir, samplePoint);\n        float f = dotLS * dotLS - dot(samplePoint, samplePoint);\n        float sunTravelDistance = -dotLS + sqrt(f + atmosphereRadius * atmosphereRadius);\n\n        vec3 attenuatedLight = lightColor * exp(-(rayleighFactor4PI * rcpWaveLen4 + mieFactor4PI) * sunTravelDistance);\n        vec3 inScatter = attenuatedLight * (rayleighFactor4PI * rcpWaveLen4 * rayleighPhase + mieFactor4PI * miePhase) * stepLength;\n\n        accum = accum * attenuate + inScatter;\n        scatterDistance -= stepLength;\n\n        samplePoint += rayStep;\n    }\n\n    // TODO: Could implement a different raytrace target point when we\'re hitting the floor to simulate scattering from the floor?\n\n    float isAboveHorizon = linearStep(-0.1, -0.05, origViewDir.y);\n    vec3 ground = vec3(0.1, 0.3, .5) * max(lightDir.y, 0.01) /*+ vec3(0.02, 0.02, 0.025)*/;\n    accum = mix(ground, accum, isAboveHorizon);\n\n//    gl_FragColor = encodeHDRE(sqrt(accum));\n    gl_FragColor = vec4(sqrt(accum), 0.0);\n}\n';

ShaderLibrary['dynamic_sky_vertex.glsl'] = 'varying vec4 worldPosition;\n\nvoid main()\n{\n    worldPosition = modelMatrix * vec4(position, 1.0);\n    vec4 viewPos = modelViewMatrix * vec4(position, 1.0);\n    gl_Position = projectionMatrix * viewPos;\n}\n';

ShaderLibrary['flat_fragment.glsl'] = '#ifdef ALBEDO_MAP\nvarying vec2 texCoords;\nuniform sampler2D albedoMap;\n#endif\n\nuniform vec3 color;\nuniform float opacity;\n\n#ifdef FOG\nvarying vec3 viewPosition;\n\nuniform float fogDensity;\nuniform vec3 fogColor;\n#endif\n\nvoid main() {\n    float alpha = opacity;\n#ifdef ALBEDO_MAP\n    vec4 albedo = texture2D(albedoMap, texCoords);\n    alpha *= albedo.w;\n    albedo.xyz *= albedo.xyz;\n    albedo.xyz *= color;\n    vec3 col = albedo.xyz;\n#else\n    vec3 col = color;\n#endif\n\n    #ifdef FOG\n    float fogAmount = clamp(exp2(viewPosition.z * fogDensity), 0.0, 1.0);\n    col = mix(fogColor, col, fogAmount);\n    #endif\n\n    #ifdef HDRE\n    gl_FragColor = encodeHDRE(sqrt(col));\n    #else\n//    col *= alpha;\n    gl_FragColor = vec4(sqrt(col), alpha);\n    #endif\n}\n';

ShaderLibrary['flat_vertex.glsl'] = '#ifdef ALBEDO_MAP\nvarying vec2 texCoords;\n#endif\n\n#ifdef FOG\nvarying vec3 viewPosition;\n#endif\n\nvoid main() {\n    vec3 localPos = position;\n    vec4 viewPos = modelViewMatrix * vec4(localPos, 1.0);\n    gl_Position = projectionMatrix * viewPos;\n    #ifdef FOG\n    viewPosition = viewPos.xyz;\n    #endif\n\n    #ifdef ALBEDO_MAP\n    texCoords = uv;\n    #endif\n}';

ShaderLibrary['linear_depth_fragment.glsl'] = 'varying float linearDepth;\n\n// Only for 0 - 1\nvec4 hx_floatToRGBA8(float value)\n{\n    vec4 enc = value * vec4(1.0, 255.0, 65025.0, 16581375.0);\n    // cannot fract first value or 1 would not be encodable\n    enc.yzw = fract(enc.yzw);\n    return enc - enc.yzww * vec4(1.0/255.0, 1.0/255.0, 1.0/255.0, 0.0);\n}\n\nvoid main()\n{\n    gl_FragColor = hx_floatToRGBA8(linearDepth);\n}\n';

ShaderLibrary['linear_depth_vertex.glsl'] = 'varying float linearDepth;\n\nuniform float nearClip;\nuniform float farClip;\n\nvoid main()\n{\n    vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);\n    linearDepth = (-viewPosition.z - nearClip) / (farClip - nearClip);\n    gl_Position = projectionMatrix * viewPosition;\n}';

ShaderLibrary['sky_fragment.glsl'] = 'varying vec3 worldViewDir;\n\nuniform samplerCube envMap;\nuniform vec3 color;\nuniform float invert;\n\nvoid main()\n{\n    vec3 elementDir = normalize(worldViewDir * invert);\n    gl_FragColor = textureCube(envMap, elementDir) * vec4(color, 1.0);\n}\n';

ShaderLibrary['sky_vertex.glsl'] = 'varying vec3 worldViewDir;\n\nvoid main() {\n    vec3 worldPosition = (modelMatrix * vec4(position, 1.0)).xyz;\n    worldViewDir = worldPosition - cameraPosition;\n    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\n}';

ShaderLibrary['water_fragment.glsl'] = '#define MIN_VARIANCE -0.0001\n#define LIGHT_BLEED_REDUCTION .5\n\nvarying vec2 normalCoords1;\nvarying vec2 normalCoords2;\n\nvarying vec3 worldPosition;\nvarying vec3 viewPosition;\nvarying vec3 worldNormal;\n\n#ifdef SSAO_MAP\nvarying vec4 projection;\nuniform sampler2D ssaoMap;\n#endif\n\nuniform float shadowMapSize;\nuniform float shadowMapPixelSize;\n\n#ifdef SHADOW_MAP\nuniform sampler2D shadowMap;\n\nvarying vec4 shadowCoord;\n\n#ifdef PCF_SHADOW_MAP\nuniform vec2 shadowOffsets[NUM_SHADOW_SAMPLES]; // w contains bias\n#endif\n#endif\n\n\nuniform vec3 color;\n\nuniform float roughnessSqr;\nuniform float normalSpecularReflection;\nuniform float rcpNormalStrength;\n\nuniform sampler2D normalMap;\n\n#ifdef AMBIENT_OCCLUSION_MAP\nuniform sampler2D aoMap;\nvarying vec2 texCoords2;\n#endif\n\n#ifdef LOCAL_SKYBOX\n// this could also be applied to irradiance map\nuniform vec3 skyboxPosition;\nuniform float skyboxSize;\n#endif\n\n#ifdef SPECULAR_PROBE\nuniform samplerCube specularProbe;\nuniform vec3 specularProbeColor;\n#endif\n\n#ifdef FOG_PROBE\nuniform samplerCube fogProbe;\nuniform float fogProbeBoost;\n#endif\n\n#ifdef IRRADIANCE_PROBE\nuniform samplerCube irradianceProbe;\nuniform float irradianceProbeBoost;\n#endif\n\n// internal\nuniform vec3 ambientLightColor;\n\nuniform float alpha;\n\n#ifdef FOG\nuniform float fogDensity;\nuniform vec3 fogColor;\n#endif\n\n#if NUM_POINT_LIGHTS > 0\nstruct PointLight {\n    vec3 position;\n    vec3 color;\n    float distance;\n    float decay;\n    int shadow;\n    float shadowBias;\n    float shadowRadius;\n    vec2 shadowMapSize;\n};\n\nuniform PointLight pointLights[ NUM_POINT_LIGHTS ];\n#endif\n\n#if NUM_DIR_LIGHTS > 0\nstruct DirectionalLight {\n    vec3 direction;\n    vec3 color;\n    int shadow;\n    float shadowBias;\n    float shadowRadius;\n    vec2 shadowMapSize;\n};\nuniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];\n#endif\n\nvec3 intersectCubeMap(vec3 rayOrigin, vec3 rayDir, float cubeSize)\n{\n    vec3 t = (cubeSize * sign(rayDir) - rayOrigin) / rayDir;\n    float minT = min(min(t.x, t.y), t.z);\n    return rayOrigin + minT * rayDir;\n}\n\n#ifdef NORMAL_MAP\nvec3 perturbNormal2Arb(vec3 position, vec3 worldNormal, vec3 normalSample)\n{\n    vec3 q0 = dFdx( position.xyz );\n    vec3 q1 = dFdy( position.xyz );\n    vec2 st0 = dFdx( texCoords.st );\n    vec2 st1 = dFdy( texCoords.st );\n    vec3 S = normalize( q0 * st1.t - q1 * st0.t );\n    vec3 T = normalize( -q0 * st1.s + q1 * st0.s );\n    vec3 N = normalize( worldNormal );\n    mat3 tsn = mat3( S, T, N );\n    return normalize( tsn * normalSample );\n}\n#endif\n\nvec3 getNormal()\n{\n    vec4 normalSample1 = texture2D( normalMap, normalCoords1 ) - .5;\n    vec4 normalSample2 = texture2D( normalMap, normalCoords2 ) - .5;\n    vec3 normal = normalSample1.xzy + normalSample2.xzy;\n    normal.y *= rcpNormalStrength;\n    return normalize(normal);\n}\n\n#ifdef VSM_SHADOW_MAP\nvec2 getVSMMoments(vec2 uv)\n{\n    vec4 s = texture2D(shadowMap, uv);\n    #ifdef VSM_FLOAT\n    return s.xy;\n    #else\n    return vec2(RG8ToFloat(s.xy), RG8ToFloat(s.zw));\n    #endif\n}\n#endif\n\nfloat getShadow() {\n#ifdef SHADOW_MAP\n\n    #ifdef PCF_SHADOW_MAP\n        #if NUM_SHADOW_SAMPLES > 1\n        float shadow = 0.0;\n        for (int i = 0; i < NUM_SHADOW_SAMPLES; ++i) {\n            // pseudo random\n            #ifdef DITHER_SHADOW\n            float angle = fract (sin((gl_FragCoord.x + 0.5) * (gl_FragCoord.y + 1.0)) * 43758.5453123) * 3.1415 * 2.0;\n            float c = cos(angle);\n            float s = sin(angle);\n            vec2 offset;\n            offset.x = c * shadowOffsets[i].x - s * shadowOffsets[i].y;\n            offset.y = s * shadowOffsets[i].x + c * shadowOffsets[i].y;\n            #else\n            vec2 offset = shadowOffsets[i];\n            #endif\n\n            float occlDepth = RGBA8ToFloat(texture2D(shadowMap, shadowCoord.xy + offset));\n            float diff = shadowCoord.z - occlDepth;\n            shadow += float(diff <= 0.0);\n        }\n\n        shadow *= RCP_NUM_SHADOW_SAMPLES;\n        #else\n            float occlDepth = RGBA8ToFloat(texture2D(shadowMap, shadowCoord.xy));\n            float diff = shadowCoord.z - occlDepth;\n            float shadow = float(diff <= 0.0);\n        #endif\n    #endif\n\n    #ifdef VSM_SHADOW_MAP\n\n// the moments seem correct on ipad... why do the calculations differ?\n        vec2 moments = getVSMMoments(shadowCoord.xy);\n        float p = linearStep(shadowCoord.z - 0.02, shadowCoord.z, moments.x);\n        float variance = moments.y - moments.x * moments.x;\n        variance = max(variance, MIN_VARIANCE);\n\n        float diff = shadowCoord.z - moments.x;\n        float upperBound = variance / (variance + diff*diff);\n        float shadow = linearStep(LIGHT_BLEED_REDUCTION, 1.0, upperBound);\n        shadow = clamp(max(shadow, p), 0.0, 1.0);\n    #endif\n\n    vec2 edges = abs(shadowCoord.xy * 2.0 - 1.0);\n    float edge = max(edges.x, edges.y);\n    edge = linearStep(.8, 1.0, edge);\n    shadow = mix(shadow, 1.0, edge);\n    return shadow;\n#else\n    return 1.0;\n#endif\n}\n\nfloat fresnel(float NdotL, float lowProfileDefault)\n{\n#ifdef PERFORMANCE_PROFILE_HIGH\n// angle to the power of 5\n    float angle = 1.0 - NdotL;\n    float fresnelFactor = angle * angle;\n    fresnelFactor *= fresnelFactor;\n    fresnelFactor *= angle;\n    return normalSpecularReflection + (1.0 - normalSpecularReflection) * fresnelFactor;\n#else\n    return lowProfileDefault;\n#endif\n}\n\nfloat trowbridgeReitz(float roughnessSqr, vec3 lightDir, vec3 normal, vec3 viewDir)\n{\n    vec3 halfVec = normalize(lightDir + viewDir);\n    float micro = max(dot(halfVec, normal), 0.0);\n    float denom = (micro * micro) * (roughnessSqr - 1.0) + 1.0;\n    return roughnessSqr / (denom * denom);\n}\n\nvoid accumulate(vec3 lightDir, vec3 lightColor, vec3 normal, vec3 viewDir, float roughnessSqr, out vec3 diffuseLight, out vec3 specularLight)\n{\n    diffuseLight += lightColor * max(lightDir.y, 0.0);\n\n#ifndef IGNORESPECULAR\n    float NdotL = max(dot(lightDir, normal), 0.0);\n    vec3 irradiance = lightColor * NdotL;\n    float F = fresnel(NdotL, .08);\n    float D = trowbridgeReitz(roughnessSqr, lightDir, normal, viewDir);\n    float amount = D * F;\n\n    specularLight += irradiance * amount;\n#endif\n}\n\nvoid main() {\n    vec3 viewWorldDir = normalize(worldPosition - cameraPosition);\n    vec3 viewDir = -normalize(viewPosition);\n\n    vec3 normal = getNormal();\n    vec3 viewNormal = mat3(viewMatrix) * normal;\n\n    vec3 diffuseLight = vec3(0.0);\n\n    #ifdef IRRADIANCE_PROBE\n        vec4 diffuseSample = textureCube(irradianceProbe, vec3(0.0, 1.0, 0.0));\n        diffuseLight = decodeHDRE(diffuseSample);\n\n        diffuseLight *= diffuseLight * irradianceProbeBoost;\n    #endif\n\n    float ao = 1.0;\n    #ifdef AMBIENT_OCCLUSION_MAP\n        ao = texture2D(aoMap, texCoords2).x;\n    #endif\n\n    vec3 albedo = color;\n\n    #ifdef SSAO_MAP\n        vec2 screenUV = projection.xy / projection.w * .5 + .5;\n        ao = texture2D(ssaoMap, screenUV).x;\n    #endif\n\n    diffuseLight += ambientLightColor;\n\n    vec3 specularLight = vec3(0.0);\n\n    #ifdef SPECULAR_PROBE\n        vec3 reflectedView = reflect(viewWorldDir, normal);\n        float fresnelFactor = fresnel(max(dot(viewWorldDir, normal), 0.0), .35);\n\n        #ifdef LOCAL_SKYBOX\n            vec3 offsetRefl = intersectCubeMap(worldPosition - skyboxPosition, reflectedView, skyboxSize);\n        #else\n            vec3 offsetRefl = reflectedView;\n        #endif\n\n        vec4 reflectionSample = textureCube(specularProbe, reflectedView);\n        vec3 reflection;\n\n        reflection = decodeHDRE(reflectionSample);\n\n        reflection *= reflection * specularProbeColor;\n\n        specularLight = reflection * fresnelFactor;\n\n        #ifdef AMBIENT_OCCLUSION_MAP\n//        specularLight *= ao;\n        #endif\n    #endif\n\n    #if NUM_POINT_LIGHTS > 0\n    for (int i = 0; i < NUM_POINT_LIGHTS; ++i) {\n        vec3 worldDir = pointLights[i].position - worldPosition;\n        float sqrDist = dot(worldDir, worldDir);\n        worldDir /= sqrt(sqrDist);\n        vec3 fallOffColor = pointLights[i].color / max(sqrDist, .001);\n        accumulate(worldDir, fallOffColor, normal, viewDir, roughnessSqr, diffuseLight, specularLight);\n    }\n    #endif\n\n    float shadow = getShadow();\n\n    #if NUM_DIR_LIGHTS > 0\n    for (int i = 0; i < NUM_DIR_LIGHTS; ++i) {\n        float NdotL = max(dot(directionalLights[i].direction, viewNormal), 0.0);\n        diffuseLight += max(directionalLights[i].direction.y, 0.0) * directionalLights[i].color * shadow;\n\n        #ifndef IGNORESPECULAR\n        vec3 irradiance = directionalLights[i].color * NdotL;\n        irradiance *= shadow;\n        float F = fresnel(NdotL, .04);\n        float D = trowbridgeReitz(roughnessSqr, directionalLights[i].direction, viewNormal, viewDir);\n        float amount = D * F;\n\n        specularLight += irradiance * amount;\n        #endif\n    }\n    #endif\n\n    vec3 color = albedo * diffuseLight + specularLight;\n    color *= ao * ao;\n\n    #ifdef FOG\n        float fogAmount = clamp(exp2(viewPosition.z * fogDensity), 0.0, 1.0);\n        vec3 fogCol = fogColor;\n        #ifdef FOG_PROBE\n            vec4 fogSample = textureCube(fogProbe, vec3(viewWorldDir.x , 0.0, viewWorldDir.z));\n            fogSample.xyz = decodeHDRE(fogSample);\n            fogSample.xyz *= fogSample.xyz * fogProbeBoost;\n            fogCol *= fogSample.xyz;\n        #endif\n        color = mix(fogCol, color, fogAmount);\n\n// ONLY FOR THIS PROJECT\n        fogAmount = smoothstep(100.0, 250.0, length(worldPosition.xz));\n        color = mix(color, fogCol, fogAmount);\n    #endif\n\n    gl_FragColor = encodeHDRE(sqrt(color));\n}\n';

ShaderLibrary['water_vertex.glsl'] = 'varying vec3 worldPosition;\nvarying vec3 viewPosition;\nvarying vec3 worldNormal;\n\nvarying vec2 normalCoords1;\nvarying vec2 normalCoords2;\n\n#if defined(AMBIENT_OCCLUSION_MAP)\nattribute vec2 uv2;\n\nvarying vec2 texCoords2;\n#endif\n\n#ifdef SSAO_MAP\nvarying vec4 projection;\n#endif\n\n#ifdef SHADOW_MAP\nuniform mat4 shadowMatrix;\n\nvarying vec4 shadowCoord;\n#endif\n\nuniform float normalMapScale1;\nuniform float normalMapScale2;\nuniform vec2 normalMapOffset1;\nuniform vec2 normalMapOffset2;\n\nvoid main() {\n    worldPosition = (modelMatrix * vec4(position, 1.0)).xyz;\n    // normalMatrix seems to be view space... need world space, but it\'s okay since we\'re using uniform scaling only\n    vec4 viewPos = modelViewMatrix * vec4(position,1.0);\n    worldNormal = mat3(modelMatrix) * normalize(normal);\n    gl_Position = projectionMatrix * viewPos;\n    viewPosition = viewPos.xyz;\n\n    normalCoords1 = worldPosition.xz * normalMapScale1 + normalMapOffset1;\n    normalCoords2 = worldPosition.xz * normalMapScale2 + normalMapOffset2;\n\n    #if defined(AMBIENT_OCCLUSION_MAP)\n    texCoords2 = uv2;\n    #endif\n\n    #ifdef SSAO_MAP\n    projection = gl_Position;\n    #endif\n\n    #ifdef SHADOW_MAP\n    shadowCoord = (shadowMatrix * vec4(worldPosition, 1.0)) * .5 + .5;\n    #endif\n\n    #ifdef AO_MAP\n    texCoords2 = uv2;\n    #endif\n}';

ShaderLibrary['shadow_fragment.glsl'] = 'varying vec4 projection;\n\nuniform float depthBias;\n\nvoid main()\n{\n    float depth = projection.z * .5 + .5;\n\n    gl_FragColor = floatToRGBA8(depth + depthBias);\n}\n';

ShaderLibrary['shadow_vertex.glsl'] = 'varying vec4 projection;\n\nvoid main()\n{\n    gl_Position = projection = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\n}';

ShaderLibrary['vsm_blur_fragment.glsl'] = '#define RADIUS 1\n#define NUM_SAMPLES (RADIUS * 2 + 1)\n\nuniform sampler2D tDiffuse;\nuniform vec2 step;\n\nvarying vec2 vUv;\n\nvec2 getShadowValue(vec2 uv)\n{\n    vec4 s = texture2D(tDiffuse, uv);\n    #ifdef FLOAT_TEX\n    return s.xy;\n    #else\n    return vec2(RG8ToFloat(s.xy), RG8ToFloat(s.zw));\n    #endif\n}\n\nvoid main() {\n    vec2 sum = getShadowValue(vUv);\n\n    for (int i = 1; i <= RADIUS; ++i) {\n        float fi = float(i);\n        sum += getShadowValue(vUv - step * fi);\n        sum += getShadowValue(vUv + step * fi);\n    }\n\n    sum /= float(NUM_SAMPLES);\n    #ifdef FLOAT_TEX\n    gl_FragColor = vec4(sum, 0.0, 1.0);\n    #else\n    gl_FragColor.xy = floatToRG8(sum.x);\n    gl_FragColor.zw = floatToRG8(sum.y);\n    #endif\n}';

ShaderLibrary['vsm_blur_vertex.glsl'] = 'varying vec2 vUv;\n\nvoid main() {\n    vUv = uv;\n    gl_Position = vec4(position, 1.0);\n}';

ShaderLibrary['vsm_fragment.glsl'] = 'varying vec4 projection;\n\nvoid main()\n{\n    float depth = projection.z * .5 + .5;\n    float dx = dFdx(depth);\n    float dy = dFdy(depth);\n    float moment2 = depth * depth + 0.25*(dx*dx + dy*dy);\n\n    #ifdef FLOAT_TEX\n    gl_FragColor = vec4(depth, moment2, 0.0, 1.0);\n    #else\n    gl_FragColor = vec4(floatToRG8(depth), floatToRG8(moment2));\n    #endif\n}\n';

ShaderLibrary['dof_fragment.glsl'] = 'uniform sampler2D source;\nuniform sampler2D blurred1;\nuniform sampler2D blurred2;\nuniform sampler2D depth;\n\nuniform float strength;\nuniform float focusDepth;\nuniform float focusRange;\nuniform float focusFalloff;\n\nvarying vec2 vUv;\n\nvoid main()\n{\n    const float blendCutoff = .5;\n    float depth = RGBA8ToFloat(texture2D(depth, vUv));\n    float distance = abs(depth - focusDepth);\n\n    float blurAmount = clamp((distance - focusRange) / focusFalloff, 0.0, 1.0);\n\n    vec3 mainCol = decodeHDRE(texture2D(source, vUv));\n    vec3 blurredCol1 = decodeHDRE(texture2D(blurred1, vUv));\n    vec3 blurredCol2 = decodeHDRE(texture2D(blurred2, vUv));\n\n    // for little blurs (0.0 - 0.25), use smaller amount, for (.5, 1.0), use larger blur\n    float smallBlur = linearStep(0.0, blendCutoff, blurAmount);\n    float largeBlur = linearStep(blendCutoff, 1.0, blurAmount);\n    vec3 color = mix(blurredCol1, blurredCol2, largeBlur);\n    color = mix(mainCol, color, smallBlur * strength);\n\n    gl_FragColor = encodeHDRE(color);\n}\n';

ShaderLibrary['gaussian_blur_hdre_fragment.glsl'] = 'uniform sampler2D tDiffuse;\n\nvarying vec2 vUv;\n\nuniform vec2 sampleStep;\nuniform float weights[NUM_WEIGHTS];\n\nvoid main()\n{\n    vec3 col = decodeHDRE(texture2D(tDiffuse, vUv)) * weights[0];\n\n    for (int i = 1; i <= KERNEL_RADIUS; ++i) {\n        vec2 offset = float(i) * sampleStep;\n        col += (decodeHDRE(texture2D(tDiffuse, vUv + offset)) + decodeHDRE(texture2D(tDiffuse, vUv - offset))) * weights[i];\n    }\n\n    gl_FragColor = encodeHDRE(col);\n}\n';

ShaderLibrary['lensflare_composite_fragment.glsl'] = 'uniform sampler2D source;\nuniform sampler2D flare;\nuniform sampler2D lensDirt;\nuniform float strength;\n\nvarying vec2 vUv;\n\nvoid main()\n{\n// some kind of glare texture could be used to make the flare more interesting\n    vec4 hdre = texture2D(source, vUv);\n    vec3 color1 = decodeHDRE(hdre);\n    vec3 lensDirt = texture2D(lensDirt, vUv).xyz;\n\n    vec2 dir = .5 - vUv;\n    vec4 hdreR = texture2D(flare, vUv);\n    vec4 hdreG = texture2D(flare, vUv + dir * .03);\n    vec4 hdreB = texture2D(flare, vUv + dir * .06);\n    float r = (decodeHDRE(hdreR)).r;\n    float g = (decodeHDRE(hdreG)).g;\n    float b = (decodeHDRE(hdreB)).b;\n    vec3 color2 = vec3(r, g, b) * lensDirt;\n    // adding in gamma space, no one will know...\n	gl_FragColor = encodeHDRE(color1 + color2 * strength);\n}\n';

ShaderLibrary['lensflare_feature_fragment.glsl'] = 'uniform sampler2D tDiffuse;\nuniform float threshold;\n\nvarying vec2 uv1;\nvarying vec2 uv2;\nvarying vec2 uv3;\nvarying vec2 uv4;\n\nvec3 readWithThreshold(vec2 uv)\n{\n    vec4 hdre = texture2D(tDiffuse, uv);\n    vec3 color = decodeHDRE(hdre);\n    color = max(color - vec3(threshold), vec3(0.0));\n\n    return color;\n}\n\nfloat boundMask(vec2 uv)\n{\n    return float(uv.x > 0.0 && uv.x < 1.0 && uv.y > 0.0 && uv.y < 1.0);\n}\n\nvoid main()\n{\n    vec3 color1 = readWithThreshold(uv1) * boundMask(uv1);\n    vec3 color2 = readWithThreshold(uv2) * boundMask(uv2);\n    vec3 color3 = readWithThreshold(uv3) * boundMask(uv3);\n    vec3 color4 = readWithThreshold(uv4) * boundMask(uv4);\n	gl_FragColor = encodeHDRE(color1 + color2 + color3 + color4);\n}\n';

ShaderLibrary['lensflare_feature_vertex.glsl'] = 'varying vec2 uv1;\nvarying vec2 uv2;\nvarying vec2 uv3;\nvarying vec2 uv4;\n\nuniform float ratio1;\nuniform float ratio2;\nuniform float ratio3;\nuniform float ratio4;\n\nvec2 getFlippedUV(float ratio)\n{\n    return (uv * 2.0 - 1.0) * ratio * .5 + .5;\n}\n\nvoid main()\n{\n    gl_Position = vec4(position, 1.0);\n    uv1 = getFlippedUV(ratio1);\n    uv2 = getFlippedUV(ratio2);\n    uv3 = getFlippedUV(ratio3);\n    uv4 = getFlippedUV(ratio4);\n}\n';

ShaderLibrary['post_vertex.glsl'] = 'varying vec2 vUv;\n\nvoid main()\n{\n    gl_Position = vec4(position, 1.0);\n    vUv = uv;\n}\n';

ShaderLibrary['post_z_vertex.glsl'] = 'varying vec2 vUv;\nvarying vec3 viewVector;\n\nuniform mat4 unprojectionMatrix;\nuniform float nearClip;\nuniform float farClip;\n\n\nvoid main()\n{\n    gl_Position = vec4(position, 1.0);\n    vUv = uv;\n    vec4 unproj = unprojectionMatrix * vec4(position.xy, 0.0, 1.0);\n    unproj /= unproj.w;\n    viewVector = -unproj.xyz / unproj.z;\n}\n';

ShaderLibrary['tiny_blur_hdre_fragment.glsl'] = 'uniform sampler2D tDiffuse;\n\nvarying vec2 vUv;\n\nuniform vec2 sampleStep;\n\nvoid main()\n{\n    vec3 col = decodeHDRE(texture2D(tDiffuse, vUv - sampleStep * .5));\n    col += decodeHDRE(texture2D(tDiffuse, vUv + sampleStep * vec2(1.5, -.5)));\n    col += decodeHDRE(texture2D(tDiffuse, vUv + sampleStep * vec2(-.5, 1.5)));\n    col += decodeHDRE(texture2D(tDiffuse, vUv + sampleStep * 1.5));\n\n    gl_FragColor = encodeHDRE(col * .25);\n}\n';

ShaderLibrary['tonemap_fragment.glsl'] = 'uniform sampler2D tDiffuse;\nuniform float exposure;\n\nvarying vec2 vUv;\n\nvoid main()\n{\n    vec4 hdre = texture2D(tDiffuse, vUv);\n    vec3 color = decodeHDRE(hdre);\n\n//    color *= color * exposure;\n//    color = max(vec3(0.0), color.xyz - 0.004);\n\n	// this has pow 2.2 gamma included, not valid if using fast gamma correction\n\n    // Jim Hejl and Richard Burgess-Dawson\n	float a = 6.2;\n    float b = .5;\n    float c = 6.2;\n    float d = 1.7;\n    float e = 0.06;\n\n	// ACES\n	/*float a = 2.51;\n    float b = 0.03;\n    float c = 2.43;\n    float d = 0.59;\n    float e = 0.14;*/\n\n//	gl_FragColor = vec4(saturate((color*(a*color+b))/(color*(c*color+d)+e)), 1.0);\n	gl_FragColor = vec4(color, 1.0);\n}\n';

var highPerformance;
var mainProject;
var assetLibrary;

window.onload = startUp;

function startUp()
{
    highPerformance = !isPlatformMobile() && !QueryString.lowPerformance;

    // need to do this before initializing project
    assetLibrary = new AssetLibrary("assets/");
    assetLibrary.queueAsset("lens-dirt", "textures/testLensDirt.jpg", AssetLibrary.Type.TEXTURE_2D);
    assetLibrary.queueAsset("solar-flare", "textures/solar-flare.png", AssetLibrary.Type.TEXTURE_2D);
    assetLibrary.queueAsset("cloud-layer", "textures/sky/cloud-layer.png", AssetLibrary.Type.TEXTURE_2D);
    assetLibrary.queueAsset("cloud-env", "textures/sky/clouds-cube/", AssetLibrary.Type.TEXTURE_CUBE);

    assetLibrary.onComplete.bind(onAssetsLoaded);
    assetLibrary.onProgress.bind(onAssetsProgress);
    assetLibrary.load();
}

var debugMode = QueryString.debug && QueryString.debug !== "0" && QueryString.debug !== "false";

if (debugMode)
    window.onload = startUp;

function onAssetsProgress(ratio)
{
    //var preloader = document.getElementById("preloaderProgress");
    //preloader.style.width = Math.floor(ratio * 100) + "%";
}

function onAssetsLoaded(assetLibrary)
{
    //var preloader = document.getElementById("preloader");
    //preloader.style.display = "none";

    var debugBox = document.getElementById("debugBox");
    if (debugBox)
        debugBox.style.display = debugMode? "inline" : "none";

    mainProject = new SimpleThreeProject();
    mainProject.init(debugMode, assetLibrary);
    mainProject.content = new DynamicSkyContent();
    mainProject.start();
}
AssetLibrary = function(basePath)
{
    this._numLoaded = 0;
    this._queue = [];
    this._assets = {};
    if (basePath && basePath.charAt(basePath.length - 1) != "/") basePath = basePath + "/";
    this._basePath = basePath || "";
    this.onComplete = new Signal(/* void */);
    this.onProgress = new Signal(/* number */)
};

AssetLibrary.Type = {
    JSON: 0,
    MODEL: 1,
    TEXTURE_2D: 2,
    TEXTURE_CUBE: 3,
    PLAIN_TEXT: 4
};

AssetLibrary.prototype =
{
    /**
     *
     * @param id
     * @param filename
     * @param type
     * @param parser (optional) Only in case of models
     */
    queueAsset: function(id, filename, type, parser)
    {
        this._queue.push({
            id: id,
            filename: this._basePath + filename,
            type: type,
            parser: parser
        });
    },

    load: function()
    {
        if (this._queue.length === 0) {
            this.onComplete.dispatch();
            return;
        }

        var asset = this._queue[this._numLoaded];
        switch (asset.type) {
            case AssetLibrary.Type.JSON:
                this._json(asset.filename, asset.id);
                break;
            case AssetLibrary.Type.MODEL:
                this._model(asset.filename, asset.id, asset.parser);
                break;
            case AssetLibrary.Type.TEXTURE_2D:
                this._texture2D(asset.filename, asset.id);
                break;
            case AssetLibrary.Type.TEXTURE_CUBE:
                this._textureCube(asset.filename, asset.id);
                break;
            case AssetLibrary.Type.PLAIN_TEXT:
                this._plainText(asset.filename, asset.id);
                break;
        }
    },

    get: function(id) { return this._assets[id]; },

    _json: function(file, id)
    {
        var self = this;
        var loader = new XMLHttpRequest();
        loader.overrideMimeType("application/json");
        loader.open('GET', file, true);
        loader.onreadystatechange = function()
        {
            if (loader.readyState === 4 && loader.status == "200") {
                self._assets[id] = JSON.parse(loader.responseText);
                self._onAssetLoaded();
            }
        };
        loader.send(null);
    },

    _plainText: function(file, id)
    {
        var self = this;
        var loader = new XMLHttpRequest();
        loader.overrideMimeType("application/json");
        loader.open('GET', file, true);
        loader.onreadystatechange = function()
        {
            if (loader.readyState === 4 && loader.status == "200") {
                self._assets[id] = loader.responseText;
                self._onAssetLoaded();
            }
        };
        loader.send(null);
    },

    _textureCube: function(path, id)
    {
        var self = this;
        var loader = new THREE.CubeTextureLoader();
        this._assets[id] = loader.load([
                path + "posX.jpg",
                path + "negX.jpg",
                path + "posY.jpg",
                path + "negY.jpg",
                path + "negZ.jpg",
                path + "posZ.jpg"
            ],
            function() { self._onAssetLoaded(); }
        );
        this._assets[id].mapping = THREE.CubeReflectionMapping;
    },

    _texture2D: function(file, id)
    {
        var self = this;
        var loader = new THREE.TextureLoader();
        var tex = this._assets[id] = loader.load(file, function() { self._onAssetLoaded(); });
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;
        tex.minFilter = THREE.LinearMipMapLinearFilter;
        tex.magFilter = THREE.LinearFilter;
        if (highPerformance)
            tex.anisotropy = 16;
    },

    _model: function(file, id, parser)
    {
        var self = this;
        var loader = new parser();
        loader.options = loader.options || {};
        loader.options.convertUpAxis = true;
        loader.load(file, function(model) {
            self._assets[id] = model;
            self._onAssetLoaded();
        });
    },

    _onAssetLoaded: function()
    {
        this.onProgress.dispatch(this._numLoaded / this._queue.length);

        if (++this._numLoaded === this._queue.length)
            this.onComplete.dispatch(this);
        else
            this.load();
    }
};
/**
 *
 * @param target
 * @constructor
 */
CameraTravelController = function()
{
    Component.call(this);
    this.onTravelComplete = new Signal();
    this._position = new THREE.Vector3(0.0, 0.0, 0.0);
    this._quat = new THREE.Quaternion(0.0, 0.0, 0.0);
    this._originalMatrixAutoUpdate = false;
    this._tween = null;

    this._focusPoints = {};
};

CameraTravelController.prototype = Object.create(Component.prototype);

CameraTravelController.prototype.onAdded = function()
{
    this._originalMatrixAutoUpdate = this.entity.matrixAutoUpdate;
    this.entity.matrixAutoUpdate = false;
};

CameraTravelController.prototype.onRemoved = function()
{
    this.entity.matrixAutoUpdate = this._originalMatrixAutoUpdate;
    if (this._tween) this._tween.kill();
};

CameraTravelController.prototype._updateCamera = function()
{
    var matrix = this.entity.matrix;
    matrix.makeRotationFromQuaternion(this._quat);
    matrix.setPosition(this._position);

    this.entity.matrixWorldNeedsUpdate = true;
};

CameraTravelController.prototype._fromSphericalCoordinates = function(radius, azimuthalAngle, polarAngle)
{
    var v = new THREE.Vector3();
    v.x = radius*Math.sin(polarAngle)*Math.cos(azimuthalAngle);
    v.y = radius*Math.cos(polarAngle);
    v.z = radius*Math.sin(polarAngle)*Math.sin(azimuthalAngle);
    return v;
};

CameraTravelController.prototype.addTarget = function(name, point)
{
    this._focusPoints[name] = point;
};

CameraTravelController.prototype.copyState = function(camera)
{
    this._position.setFromMatrixPosition(camera.matrix);
    this._quat.setFromRotationMatrix(camera.matrix);
};

CameraTravelController.prototype.goTo = function(name)
{
    var target = this._focusPoints[name];

    if (this._tween) this._tween.kill();

    var tweener = {
        ratio: 0.0
    };
    var self = this;
    var origQuat = this._quat.clone();
    var origPos = this._position.clone();
    this._tween = TweenLite.to(tweener, 2.0, {
        ratio: 1.0,

        onUpdate:function()
        {
            self._quat.copy(origQuat);
            self._quat.slerp(target.quat, tweener.ratio);
            self._position.copy(origPos);
            self._position.lerp(target.position, tweener.ratio);
            self._updateCamera();
        },
        onComplete:function()
        {
            self.onTravelComplete.dispatch();
        }
    });
};
/**
 *
 * @param target
 * @constructor
 */
CloudController = function()
{
    Component.call(this);
    this.uvSpeed = new THREE.Vector2(0.003, 0.003);
};

CloudController.prototype = Object.create(Component.prototype);

CloudController.prototype.onUpdate = function(dt)
{
    dt /= 1000.0;
    var x = this.uvSpeed.x * dt;
    var y = this.uvSpeed.y * dt;
    var offset = this.entity.children[0].material.uniforms.uvOffset.value;

    x += offset.x;
    y += offset.y;
    while (x < 0) x += 1.0;
    while (x > 1) x -= 1.0;
    while (y < 0) y += 1.0;
    while (y > 0) y -= 1.0;
    offset.x = x;
    offset.y = y;
};
/**
 *
 * @param target
 * @constructor
 */
OrbitController = function(lookAtTarget, container, moveWithKeys)
{
    Component.call(this);
    this._container = container;
    this._coords = new THREE.Vector3(0, Math.PI * .4, 2.0);   // azimuth, polar, radius
    this._localAcceleration = new THREE.Vector3(0.0, 0.0, 0.0);
    this._localVelocity = new THREE.Vector3(0.0, 0.0, 0.0);

    this.lookAtTarget = lookAtTarget || new THREE.Vector3(0.0, 0.0, 0.0);
    this.zoomSpeed = 2.0;
    this.maxRadius = 20.0;
    this.minRadius = 0.1;
    this.dampen = .9;
    this._oldMouseX = 0;
    this._oldMouseY = 0;
    this.maxAzimuth = undefined;
    this.minAzimuth = undefined;
    this.minPolar = 0.1;
    this.maxPolar = Math.PI - 0.1;
    this._originalMatrixAutoUpdate = false;

    this._moveWithKeys = moveWithKeys;
    this.moveAcceleration = .02;
    this._moveAcceleration = new THREE.Vector3();
    this._moveVelocity = new THREE.Vector3();

    this._isDown = false;
    this._initListeners();
};

OrbitController.prototype = Object.create(Component.prototype,
    {
        radius: {
            get: function() { return this._coords.z; },
            set: function(value) { this._coords.z = value; }
        },

        azimuth: {
            get: function() { return this._coords.x; },
            set: function(value) { this._coords.x = value; }
        },

        polar: {
            get: function() { return this._coords.y; },
            set: function(value) { this._coords.y = value; }
        }
    });


OrbitController.prototype.setFrom = function(state)
{
    this._coords.x = state.azimuth;
    this._coords.y = state.polar;
    this._coords.z = state.radius;
    this.lookAtTarget.copy(state.lookAtTarget);
};

OrbitController.prototype.onAdded = function()
{
    this._originalMatrixAutoUpdate = this.entity.matrixAutoUpdate;
    this.entity.matrixAutoUpdate = false;

    // can be down when we switch during a click
    this._isDown = false;

    var mousewheelevt = (/Firefox/i.test(navigator.userAgent))? "DOMMouseScroll" : "mousewheel";
    //this._container.addEventListener(mousewheelevt, this._onMouseWheel);
    //this._container.addEventListener("mousemove", this._onMouseMove);
    //this._container.addEventListener("touchmove", this._onTouchMove);
    //this._container.addEventListener("mousedown", this._onMouseDown);
    //this._container.addEventListener("touchstart", this._onTouchDown);
    //this._container.addEventListener("mouseup", this._onUp);
    //this._container.addEventListener("touchend", this._onUp);

    if (this._moveWithKeys) {
        document.addEventListener("keyup", this._onKeyUp);
        document.addEventListener("keydown", this._onKeyDown);
    }
};

OrbitController.prototype.onRemoved = function()
{
    this.entity.matrixAutoUpdate = this._originalMatrixAutoUpdate;

    var mousewheelevt = (/Firefox/i.test(navigator.userAgent))? "DOMMouseScroll" : "mousewheel";
    this._container.removeEventListener(mousewheelevt, this._onMouseWheel);
    this._container.removeEventListener("mousemove", this._onMouseMove);
    this._container.removeEventListener("touchmove", this._onTouchMove);
    this._container.removeEventListener("mousedown", this._onMouseDown);
    this._container.removeEventListener("touchstart", this._onTouchDown);
    this._container.removeEventListener("mouseup", this._onUp);
    this._container.removeEventListener("touchend", this._onUp);

    if (this._moveWithKeys) {
        document.removeEventListener("keyup", this._onKeyUp);
        document.removeEventListener("keydown", this._onKeyDown);
    }
};

OrbitController.prototype.onUpdate = function(dt)
{
    if (this._moveWithKeys) {
        this._moveVelocity.x *= this.dampen;
        this._moveVelocity.y *= this.dampen;
        this._moveVelocity.z *= this.dampen;
        this._moveVelocity.x += this._moveAcceleration.x;
        this._moveVelocity.y += this._moveAcceleration.y;
        this._moveVelocity.z += this._moveAcceleration.z;
        var v = new THREE.Vector3();
        v.copy(this._moveVelocity);
        v.applyQuaternion(this.entity.quaternion.setFromRotationMatrix(this.entity.matrixWorld));
        this.lookAtTarget.x += v.x;
        this.lookAtTarget.y += this._moveVelocity.y;
        this.lookAtTarget.z += v.z;
    }

    this._localVelocity.x *= this.dampen;
    this._localVelocity.y *= this.dampen;
    this._localVelocity.z *= this.dampen;
    this._localVelocity.x += this._localAcceleration.x;
    this._localVelocity.y += this._localAcceleration.y;
    this._localVelocity.z += this._localAcceleration.z;
    this._localAcceleration.x = 0.0;
    this._localAcceleration.y = 0.0;
    this._localAcceleration.z = 0.0;

    this._coords.add(this._localVelocity);
    this._coords.y = THREE.Math.clamp(this._coords.y, this.minPolar, this.maxPolar);
    this._coords.z = THREE.Math.clamp(this._coords.z, this.minRadius, this.maxRadius);

    if (this.maxAzimuth !== undefined && this.minAzimuth !== undefined)
        this._coords.x = THREE.Math.clamp(this._coords.x, this.minAzimuth, this.maxAzimuth);

    var matrix = this.entity.matrix;
    var pos = this._fromSphericalCoordinates(this._coords.z, this._coords.x, this._coords.y);
    pos.add(this.lookAtTarget);
    matrix.lookAt(pos, this.lookAtTarget, new THREE.Vector3(0, 1, 0));
    matrix.setPosition(pos);

    this.entity.matrixWorldNeedsUpdate = true;
};

OrbitController.prototype._fromSphericalCoordinates = function(radius, azimuthalAngle, polarAngle)
{
    var v = new THREE.Vector3();
    v.x = radius*Math.sin(polarAngle)*Math.cos(azimuthalAngle);
    v.y = radius*Math.cos(polarAngle);
    v.z = radius*Math.sin(polarAngle)*Math.sin(azimuthalAngle);
    return v;
};

// ratio is "how far the controller is pushed", from -1 to 1
OrbitController.prototype.setAzimuthImpulse  = function(value)
{
    this._localAcceleration.x = value;
};

OrbitController.prototype.setPolarImpulse = function(value)
{
    this._localAcceleration.y = value;
};

OrbitController.prototype.setZoomImpulse = function(value)
{
    this._localAcceleration.z = value;
};

OrbitController.prototype._updateMove = function(x, y)
{
    if (this._oldMouseX !== undefined) {
        var dx = x - this._oldMouseX;
        var dy = y - this._oldMouseY;
        this.setAzimuthImpulse(dx * .0015);
        this.setPolarImpulse(-dy * .0015);
    }
    this._oldMouseX = x;
    this._oldMouseY = y;
};

OrbitController.prototype._initListeners = function()
{
    var self = this;

    this._onMouseWheel = function(event)
    {
        var delta = event.detail? -120 * event.detail : event.wheelDelta;
        self.setZoomImpulse(-delta * self.zoomSpeed * .0001);
    };

    this._onMouseDown = function (event)
    {
        self._oldMouseX = undefined;
        self._oldMouseY = undefined;

        self._isDown = true;
    };

    this._onMouseMove = function(event)
    {
        if (!self._isDown) return;
        self._updateMove(event.screenX, event.screenY)
    };

    this._onTouchDown = function (event)
    {
        self._oldMouseX = undefined;
        self._oldMouseY = undefined;

        if (event.touches.length === 2) {
            var touch1 = event.touches[0];
            var touch2 = event.touches[1];
            var dx = touch1.screenX - touch2.screenX;
            var dy = touch1.screenY - touch2.screenY;
            self._startPitchDistance = Math.sqrt(dx*dx + dy*dy);
            self._startZoom = self.radius;
        }

        self._isDown = true;
    };

    this._onTouchMove = function (event)
    {
        event.preventDefault();

        if (!self._isDown) return;

        var numTouches = event.touches.length;

        if (numTouches === 1) {
            var touch = event.touches[0];
            self._updateMove(touch.screenX, touch.screenY);
        }
        else if (numTouches === 2) {
            var touch1 = event.touches[0];
            var touch2 = event.touches[1];
            var dx = touch1.screenX - touch2.screenX;
            var dy = touch1.screenY - touch2.screenY;
            var dist = Math.sqrt(dx*dx + dy*dy);
            var diff = self._startPitchDistance - dist;
            self.radius = self._startZoom + diff * .2;
        }
    };

    this._onUp = function(event) { self._isDown = false; };

    this._onKeyUp = function(event)
    {
        switch (event.keyCode) {
            case 69:
            case 81:
                self._moveAcceleration.y = 0;
                break;
            case 37:
            case 65:
            case 39:
            case 68:
                self._moveAcceleration.x = 0;
                break;
            case 38:
            case 87:
            case 40:
            case 83:
                self._moveAcceleration.z = 0;
                break;
        }
    };

    this._onKeyDown = function(event)
    {
        switch (event.keyCode) {
            case 81:
                // Q
                self._moveAcceleration.y = -self.moveAcceleration;
                break;
            case 69:
                // E
                self._moveAcceleration.y = self.moveAcceleration;
                break;
            case 37:
            case 65:
                self._moveAcceleration.x = -self.moveAcceleration;
                break;
            case 38:
            case 87:
                self._moveAcceleration.z = -self.moveAcceleration;
                // up
                break;
            case 39:
            case 68:
                self._moveAcceleration.x = self.moveAcceleration;
                // right
                break;
            case 40:
            case 83:
                self._moveAcceleration.z = self.moveAcceleration;
                // down
                break;
        }
    };
};
TurbineComponent = function()
{
    Component.call(this);
    this._speed = .5;
    this._angle = 0.0;
    this._lookAtRotationTarget = 0.0;
    this._lookAtRotation = 0.0;
    this._axisSpin = new THREE.Vector3(0.0, 1.0, 0.0);
    this._axisLook = new THREE.Vector3(0.0, 0.0, 1.0);
    this._lookQuat = new THREE.Quaternion();
    this._spinQuat = new THREE.Quaternion();
    this._totalQuat = new THREE.Quaternion();
};

TurbineComponent.prototype = Object.create(Component.prototype,
    {
        speed: {
            get: function() {
                return this._speed;
            },

            set: function(value) {
                this._speed = value;
            }
        },

        axis: {
            get: function() { return this._axis; },
            set: function(value) { this._axis = value; }
        },

        angle: {
            get: function() { return this._angle; },
            set: function(value) { this._angle = value; },
        },

        lookAtRotation: {
            get: function() { return this._lookAtRotation; },
            set: function(value)
            {
                if (this._lookAtRotationTarget === value) return;
                this._lookAtRotationTarget = value;
                TweenLite.to(this, 2.0, {
                    _lookAtRotation: value
                });
            }
        }

    });

TurbineComponent.prototype.onAdded = function()
{
    this.entity.matrixAutoUpdate = true;
};

TurbineComponent.prototype.onRemoved = function()
{
};

TurbineComponent.prototype.onUpdate = function(dt)
{
    this._angle += dt / 1000.0 * this._speed;
    this._lookQuat.setFromAxisAngle(this._axisLook, this._lookAtRotation);
    this._spinQuat.setFromAxisAngle(this._axisSpin, this._angle);
    this._totalQuat.multiplyQuaternions(this._lookQuat, this._spinQuat);
    this.entity.setRotationFromQuaternion(this._totalQuat);
};
FocusData =
{
    "focus-hotels": {
        camera: {
            focus: [ -4.19, 2.50, -9.39 ],
            orbit: [ -1.58, 1.44, 20.86 ]
        },
        bubble: {
            assetName: "bubble-hotels",
            position: [ -25.6102486, -106.3891144, 70.6502304 ]
        },
        dof: {
            position: [ 3.00, 0.50, -10.00 ],
            range: 5.0
        }
    },

    "focus-retail": {
        camera: {
            focus: [ 51.67, -1.50, -28.15 ],
            orbit: [ 28.59, 1.47, 57.20 ]
        },
        bubble: {
            assetName: "bubble-retail",
            position: [ -143.525, -440.092, 17.628 ]
        },
        dof: {
            position: [ 14.05, 0.50, -43.41 ],
            range: 5.0
        }
    },

    "focus-logistics": {
        camera: {
            focus: [ 22.22, 0.50, -9.20 ],
            orbit: [ -8.84, 1.37, 12.40 ]
        },
        bubble: {
            assetName: "bubble-logistics",
            position: [ -236.959549, -123.0580902, 20.5037594 ]
        },
        dof: {
            position: [ 23.58, 0.50, -12.71 ],
            range: 3.0
        }
    },

    "focus-office": {
        camera: {
            focus: [ 22.22, 0.50, 15.97 ],
            orbit: [ -2.45, 1.17, 42.80 ]
        },
        bubble: {
            assetName: "bubble-office",
            position: [ -124.65652, -11.85072, 60.1954 ]
        },
        dof: {
            position: [ 16.38, 5.50, -3.39 ],
            range: 2.0
        }
    },

    "focus-residential": {
        camera: {
            focus: [ 3.10, 0.50, -26.25 ],
            orbit: [ -2.79, 1.34, 10.00 ]
        },
        bubble: {
            assetName: "bubble-residential",
            position: [ -80.071, -327.962, 22.0 ]
        },
        dof: {
            position: [  5.58, 0.50, -30.47 ],
            range: 2.0
        }
    },

    "focus-property": {
        camera: {
            focus: [ 29.35, -6.00, 8.24 ],
            orbit: [ 28.92, 1.47, 75.80 ]
        },
        bubble: {
            assetName: "bubble-property",
            position: [ 193.4118347, -334.03006, 13.81783 ]
        },
        dof: {
            position: [ -19.05, 0.50, -33.24 ],
            range: 3.0
        }
    },

    "focus-energy": {
        camera: {
            focus: [ -38.11, 2.50, 27.70 ],
            orbit: [ 30.99, 1.44, 57.56 ]
        },
        bubble: {
            assetName: "bubble-energy",
            position: [ 196.9653625,393.73688, 55.0 ]
        },
        dof: {
            position: [ -16.59, 4.50, 35.60 ],
            range: 9.0
        }
    },

    "focus-about": {
        camera: {
            focus: [ -6.63, 3.00, -25.71 ],
            orbit: [ -0.02, 1.46, 0.10 ]
        },
        bubble: {
            assetName: "bubble-about",
            position: [ 164.2631683,-215.3880768, 28.4972 ]
        },
        dof: {
            position: [ -16.41, 0.50, -21.89 ],
            range: 2.0
        }
    }
};
CloudMaterial = function(options)
{
    options = options || {};

    var defines = "";

    var materialUniforms =
    {
        map: {
            value: options.map
        },

        uvScale: {
            value: 10
        },

        uvOffset: {
            value: new THREE.Vector2(0.0, 0.0)
        },

        density: {
            value: .03
        },

        minHeight: {
            value: options.minHeight || 15.0
        },

        heightRange: {
            value: options.heightRange || 5.0
        },

        startDistance: {
            value: .1
        },

        lightWorldDir: {
            value: new THREE.Vector3()
        },

        irradianceProbe: {
            value: options.irradianceProbe
        },

        // provided in exposure stops
        irradianceProbeBoost: {
            value: options.irradianceProbeBoost? Math.pow(2, options.irradianceProbeBoost) : 1.0
        }
    };

    THREE.ShaderMaterial.call(this,
        {
            uniforms: materialUniforms,

            vertexShader: defines + ShaderLibrary.get("clouds_vertex"),
            fragmentShader: defines + ShaderLibrary.get("clouds_fragment")
        }
    );

    this.blending = THREE.NormalBlending;
    this.transparent = true;
    this.depthWrite = false;
    this.extensions.derivatives = true;
    //this.side = THREE.DoubleSide;

    if (options.hdre) {
        this.blending = THREE.CustomBlending;
        this.blendEquation = THREE.AddEquation; //SrcAlphaFactor;
        this.blendSrc = THREE.SrcAlphaFactor;
        this.blendDst = THREE.OneMinusSrcAlphaFactor;
        this.blendSrcAlpha = THREE.ZeroFactor;
        this.blendDstAlpha = THREE.OneMinusSrcAlphaFactor;
        this.blendEquationAlpha = THREE.AddEquation; //SrcAlphaFactor;
    }

    if (options.map)
        this.uniforms["map"].value = options.map;

    if (options.irradianceProbe)
        this.uniforms["irradianceProbe"].value = options.irradianceProbe;
};

CloudMaterial.prototype = Object.create( THREE.ShaderMaterial.prototype);
DielectricMaterial = function(options)
{
    var defines = "";

    if (options.map) defines += "#define ALBEDO_MAP\n";
    if (options.skyboxPosition || options.skyboxSize) defines += "#define LOCAL_SKYBOX\n";
    if (options.specularProbe) defines += "#define SPECULAR_PROBE\n";
    if (options.fogProbe) defines += "#define FOG_PROBE\n";
    if (options.irradianceProbe) defines += "#define IRRADIANCE_PROBE\n";
    if (options.normalMap) defines += "#define NORMAL_MAP\n";
    if (options.roughnessMap) defines += "#define ROUGHNESS_MAP\n";
    if (options.emissionMap) defines += "#define EMISSION_MAP\n";
    if (options.hdre) defines += "#define HDRE\n";
    if (options.aoMap) defines += "#define AMBIENT_OCCLUSION_MAP\n";
    if (options.aoOnDiffuse) defines += "#define AO_ON_DIFFUSE\n";
    if (options.ditherShadow) defines += "#define DITHER_SHADOW\n";
    if (options.vsmFloat) defines += "#define VSM_FLOAT\n";
    if (!options.lowPerformance) defines += "#define PERFORMANCE_PROFILE_HIGH\n";
    if (options.faceNormals) defines += "#define FACE_NORMALS\n";

    if (options.ssaoRenderer) {
        defines += "#define SSAO_MAP\n";
    }

    if (options.color) {
        options.color = new THREE.Color(options.color);
        options.color.copyGammaToLinear(options.color);
    }
    else options.color = new THREE.Color(0xffffff);

    if (options.emissionColor) {
        options.emissionColor = new THREE.Color(options.emissionColor);
        options.emissionColor.copyGammaToLinear(options.emissionColor);
    }
    else options.emissionColor = new THREE.Color(0, 0, 0);

    if (options.specularProbeColor) {
        options.specularProbeColor = new THREE.Color(options.specularProbeColor);
        options.specularProbeColor.copyGammaToLinear(options.specularProbeColor);
    }
    else options.specularProbeColor = new THREE.Color(1, 1, 1);

    this._specularProbeBoost = options.specularProbeBoost? Math.pow(2, options.specularProbeBoost) : 1.0;

    options.specularProbeColor.multiplyScalar(this._specularProbeBoost);

    options.roughness = options.roughness === undefined? .05 : options.roughness;
    if (options.roughness === 1.0) defines += "#define IGNORESPECULAR\n";

    var shadowSamples;
    if (options.shadowRenderer) {
        this._shadowRenderer = options.shadowRenderer;
        defines += "#define SHADOW_MAP\n";
        this._shadowRenderer.onUpdate.bind(this._onShadowUpdate, this);
    }

    if (options.shadowRenderer instanceof VSMShadowRenderer) {
        defines += "#define VSM_SHADOW_MAP\n";
    }
    else if (options.shadowRenderer instanceof HardShadowRenderer) {
        defines += "#define PCF_SHADOW_MAP\n";

        var numSamples = options.lowPerformance? 1 : 6;
        defines += "#define NUM_SHADOW_SAMPLES " + numSamples + "\n";
        defines += "#define RCP_NUM_SHADOW_SAMPLES float(" + (1 / numSamples) + ")\n";
        this._shadowRadius = options.shadowRadius || .75;
        shadowSamples = this._generateShadowPoints(numSamples, this._shadowRadius)
    }

    if (options.fogDensity || options.fogColor)
        defines += "#define FOG\n";

    options.fogColor = new THREE.Color(options.fogColor || 0xffffff);
    options.fogColor.copyGammaToLinear(options.fogColor);

    var materialUniforms =
    {
        alpha: {
            value: 1
        },

        fogProbe: {
            value: options.fogProbe
        },

        // provided in exposure stops
        fogProbeBoost: {
            value: options.fogProbeBoost? Math.pow(2, options.irradianceProbeBoost) : 1.0
        },

        fogDensity: {
            value: options.fogDensity || .1
        },

        fogColor: {
            value: options.fogColor
        },

        albedoMap: {
            value: options.map
        },

        shadowOffsets: {
            value: shadowSamples
        },

        color: {
            value: options.color
        },

        celSpecularCutOff: {
            value: options.celSpecularCutOff || 1
        },

        roughness: {
            value: options.roughness
        },

        normalSpecularReflection: {
            //value: .04  // based on polyurethane (clear coat) index of refraction 1.5, as opposed to base layer, which would be .027
            value: .027
        },

        normalMap: {
            value: options.normalMap
        },

        ssaoMap: {
            value: options.ssaoRenderer? options.ssaoRenderer.texture : null
        },

        emissionMap: {
            value: options.emissionMap
        },

        emissionColor: {
            value: options.emissionColor
        },

        roughnessMap: {
            value: options.roughnessMap
        },

        roughnessMapRange: {
            value: options.roughnessMapRange || .3
        },

        shadowMapSize: {
            value: this._shadowRenderer? this._shadowRenderer.size : 1
        },

        shadowMapPixelSize: {
            value: this._shadowRenderer? 1.0 / this._shadowRenderer.size : 1
        },

        aoMap: {
            value: options.aoMap
        },

        shadowMap: {
            value: this._shadowRenderer? this._shadowRenderer.shadowMap : null
        },

        shadowMatrix: {
            value: new THREE.Matrix4()
        },

        skyboxPosition: {
            value: options.skyboxPosition? options.skyboxPosition : new THREE.Vector3()
        },

        skyboxSize: {
            value: options.skyboxSize? options.skyboxSize : 10.0
        },

        specularProbe: {
            value: options.specularProbe
        },

        specularProbeColor: {
            value: options.specularProbeColor
        },

        irradianceProbe: {
            value: options.irradianceProbe
        },

        // provided in exposure stops
        irradianceProbeBoost: {
            value: options.irradianceProbeBoost? Math.pow(2, options.irradianceProbeBoost) : 1.0
        }
    };

    var uniforms = options.ignoreLights? materialUniforms :
        THREE.UniformsUtils.merge([
            materialUniforms,
            THREE.UniformsLib["lights"]
        ]);

    THREE.ShaderMaterial.call(this,
        {
            uniforms: uniforms,

            lights: options.ignoreLights? false : true,

            vertexShader: defines + ShaderLibrary.get("dielectric_vertex"),
            fragmentShader: defines + ShaderLibrary.get("dielectric_fragment")
        }
    );

    if (options.map)
        this.uniforms["albedoMap"].value = options.map;

    if (options.map2)
        this.uniforms["albedoMap2"].value = options.map2;

    if (options.normalMap) {
        this.extensions.derivatives = true;
        this.uniforms["normalMap"].value = options.normalMap;
    }

    if (options.faceNormals)
        this.extensions.derivatives = true;

    if (options.specularProbe)
        this.uniforms["specularProbe"].value = options.specularProbe;

    if (options.fogProbe)
        this.uniforms["fogProbe"].value = options.fogProbe;

    if (options.irradianceProbe)
        this.uniforms["irradianceProbe"].value = options.irradianceProbe;

    if (options.aoMap)
        this.uniforms["aoMap"].value = options.aoMap;

    if (options.roughnessMap)
        this.uniforms["roughnessMap"].value = options.roughnessMap;

    if (options.emissionMap)
        this.uniforms["emissionMap"].value = options.emissionMap;

    if (options.ssaoRenderer)
        this.uniforms["ssaoMap"].value = options.ssaoRenderer.target;

    if (this._shadowRenderer) {
        this.uniforms["shadowMap"].value = this._shadowRenderer.shadowMap;
        this.uniforms["shadowMapSize"].value = this._shadowRenderer.size;
        this.uniforms["shadowMapPixelSize"].value = 1.0 / this._shadowRenderer.size;
    }

};

DielectricMaterial.prototype = Object.create( THREE.ShaderMaterial.prototype);

DielectricMaterial.prototype._onShadowUpdate = function()
{
    this.uniforms["shadowMatrix"].value = this._shadowRenderer.shadowMapMatrix;
    this.uniforms["shadowMap"].value = this._shadowRenderer.shadowMap;
    this.uniforms["shadowMapSize"].value = this._shadowRenderer.size;
    this.uniforms["shadowMapPixelSize"].value = 1.0 / this._shadowRenderer.size;
};



DielectricMaterial.prototype._generateShadowPoints = function(numSamples, radius)
{
    var points;
    radius /= this._shadowRenderer.size;
    if (numSamples === 5) {
        points = [];
        points.push(new THREE.Vector2());
        points.push(new THREE.Vector2(.5 * radius,  -radius));
        points.push(new THREE.Vector2(radius,       .5 * radius));
        points.push(new THREE.Vector2(-.5 * radius, radius));
        points.push(new THREE.Vector2(-radius,      -.5 * radius));
    }
    else {
        var poisson = new PoissonDisk();
        poisson.generatePoints(numSamples);
        points = poisson.getPoints();

        for (var i = 0; i < numSamples; ++i) {
            var p = points[i];
            p.multiplyScalar(radius);
        }
    }
    return points;
};
DynamicSkyMaterial = function(options)
{
    var defines = "";

    options = options || {};

    if (options.hdre) defines += "#define HDRE\n";
    if (options.cloudMap) defines += "#define CLOUD_MAP\n";
    if (options.nightMap) defines += "#define NIGHT_MAP\n";


    var materialUniforms =
    {
        lightDir: {
            value: new THREE.Vector3()
        },

        cloudMap: {
            value: options.cloudMap
        },

        nightMap: {
            value: options.nightMap
        }
    };

    THREE.ShaderMaterial.call(this,
        {
            uniforms: materialUniforms,

            vertexShader: defines + ShaderLibrary.get("dynamic_sky_vertex"),
            fragmentShader: defines + ShaderLibrary.get("dynamic_sky_fragment")
        }
    );

};

DynamicSkyMaterial.prototype = Object.create( THREE.ShaderMaterial.prototype,
    {
    });
FlatMaterial = function(options)
{
    options = options || {};

    var defines = "";

    if (options.color) {
        options.color = new THREE.Color(options.color);
        options.color.convertGammaToLinear();
    }

    if (options.fogDensity || options.fogColor)
        defines += "#define FOG\n";

    if (options.hdre && !options.blending)
        defines += "#define HDRE\n";

    if (options.map)
        defines += "#define ALBEDO_MAP\n";

    //if (options.blending)
    //    defines += "#define BLENDING\n";


    var materialUniforms =
    {
        color: {
            value: options.color || new THREE.Color(1, 1, 1)
        },

        albedoMap: {
            value: options.map
        },

        opacity: {
            value: options.opacity === undefined? 1.0 : options.opacity
        },

        fogDensity: {
            value: options.fogDensity ||.1
        },

        fogColor: {
            value: options.fogColor
        }
    };

    THREE.ShaderMaterial.call(this,
        {
            uniforms: materialUniforms,

            vertexShader: defines + ShaderLibrary.get("flat_vertex"),
            fragmentShader: defines + ShaderLibrary.get("flat_fragment")
        }
    );


    if (options.blending) {
        this.blending = options.blending;
        this.transparent = true;

        if (options.blending === THREE.AdditiveBlending && options.hdre) {
            this.blending = THREE.CustomBlending;
            this.blendSrc = THREE.OneFactor;
            this.blendDst = THREE.OneFactor;
            this.blendSrcAlpha = THREE.ZeroFactor;
            this.blendDstAlpha = THREE.ZeroFactor;
        }

        if (options.blending === THREE.NormalBlending && options.hdre) {
            this.blending = THREE.CustomBlending;
            this.blendEquation = THREE.AddEquation; //SrcAlphaFactor;
            this.blendSrc = THREE.SrcAlphaFactor;
            this.blendDst = THREE.OneMinusSrcAlphaFactor;
            this.blendSrcAlpha = THREE.ZeroFactor;
            this.blendDstAlpha = THREE.OneMinusSrcAlphaFactor;
            this.blendEquationAlpha = THREE.AddEquation; //SrcAlphaFactor;
        }
    }
};

FlatMaterial.prototype = Object.create( THREE.ShaderMaterial.prototype);
LinearDepthMaterial = function()
{
    var materialUniforms = {
        "nearClip": {
            type: "f",
            value: 0.0
        },
        "farClip": {
            type: "f",
            value: 0.0
        }
    };

    THREE.ShaderMaterial.call(this,
        {
            uniforms: materialUniforms,

            vertexShader: ShaderLibrary.get("linear_depth_vertex"),
            fragmentShader: ShaderLibrary.get("linear_depth_fragment")
        }
    );
};

LinearDepthMaterial.prototype = Object.create(THREE.ShaderMaterial.prototype);
SkyMaterial = function(options)
{
    this._color = options.color || new THREE.Color(0xffffff);
    this._envMap = options.envMap;

    var materialUniforms =
    {
        invert: {
            value: options.flip? -1 : 1
        },
        envMap: {
            value: this._envMap
        },

        color: {
            value: this._color
        }
    };

    THREE.ShaderMaterial.call(this,
        {
            uniforms: materialUniforms,

            vertexShader: ShaderLibrary.get("sky_vertex"),
            fragmentShader: ShaderLibrary.get("sky_fragment"),

            depthWrite: false
        }
    );

};

SkyMaterial.prototype = Object.create( THREE.ShaderMaterial.prototype,
    {
        color: {
            get: function() { return this._color; },
            set: function(value)
            {
                this._color = new THREE.Color(value);
                this.uniforms["color"].value = value;
            }
        },

        envMap: {
            get: function() { return this._envMap; },
            set: function(value)
            {
                this._envMap = value;
                this.uniforms["envMap"].value = value;
            }
        }
    });
WaterMaterial = function(options)
{
    var defines = "";

    if (options.skyboxPosition || options.skyboxSize) defines += "#define LOCAL_SKYBOX\n";
    if (options.specularProbe) defines += "#define SPECULAR_PROBE\n";
    if (options.fogProbe) defines += "#define FOG_PROBE\n";
    if (options.irradianceProbe) defines += "#define IRRADIANCE_PROBE\n";
    if (options.hdre) defines += "#define HDRE\n";
    if (options.aoMap) defines += "#define AMBIENT_OCCLUSION_MAP\n";
    if (options.ditherShadow) defines += "#define DITHER_SHADOW\n";
    if (options.vsmFloat) defines += "#define VSM_FLOAT\n";
    if (!options.lowPerformance) defines += "#define PERFORMANCE_PROFILE_HIGH\n";
    if (options.faceNormals) defines += "#define FACE_NORMALS\n";

    if (options.ssaoRenderer) {
        defines += "#define SSAO_MAP\n";
    }

    if (options.color) {
        options.color = new THREE.Color(options.color);
        options.color.copyGammaToLinear(options.color);
    }
    else options.color = new THREE.Color(0xffffff);

    if (options.specularProbeColor) {
        options.specularProbeColor = new THREE.Color(options.specularProbeColor);
        options.specularProbeColor.copyGammaToLinear(options.specularProbeColor);
    }
    else options.specularProbeColor = new THREE.Color(1, 1, 1);

    this._specularProbeBoost = options.specularProbeBoost? Math.pow(2, options.specularProbeBoost) : 1.0;

    options.specularProbeColor.multiplyScalar(this._specularProbeBoost);

    options.roughness = options.roughness === undefined? .05 : options.roughness;
    if (options.roughness === 1.0) defines += "#define IGNORESPECULAR\n";

    var shadowSamples;
    if (options.shadowRenderer) {
        this._shadowRenderer = options.shadowRenderer;
        defines += "#define SHADOW_MAP\n";
        this._shadowRenderer.onUpdate.bind(this._onShadowUpdate, this);
    }

    if (options.shadowRenderer instanceof VSMShadowRenderer) {
        defines += "#define VSM_SHADOW_MAP\n";
    }
    else if (options.shadowRenderer instanceof HardShadowRenderer) {
        defines += "#define PCF_SHADOW_MAP\n";

        var numSamples = options.lowPerformance? 1 : 6;
        defines += "#define NUM_SHADOW_SAMPLES " + numSamples + "\n";
        defines += "#define RCP_NUM_SHADOW_SAMPLES float(" + (1 / numSamples) + ")\n";
        this._shadowRadius = options.shadowRadius || .75;
        shadowSamples = this._generateShadowPoints(numSamples, this._shadowRadius)
    }

    if (options.fogDensity || options.fogColor)
        defines += "#define FOG\n";

    options.fogColor = new THREE.Color(options.fogColor || 0xffffff);
    options.fogColor.copyGammaToLinear(options.fogColor);

    var materialUniforms =
    {
        alpha: {
            value: 1
        },

        fogProbe: {
            value: options.fogProbe
        },

        // provided in exposure stops
        fogProbeBoost: {
            value: options.fogProbeBoost? Math.pow(2, options.irradianceProbeBoost) : 1.0
        },

        fogDensity: {
            value: options.fogDensity || .1
        },

        fogColor: {
            value: options.fogColor
        },

        shadowOffsets: {
            value: shadowSamples
        },

        color: {
            value: options.color
        },

        normalMapScale1: {
            value: options.normalMapScale1 || .25
        },

        normalMapScale2: {
            value: options.normalMapScale2 || .1
        },

        normalMapOffset1: {
            value: options.normalMapOffset1 || new THREE.Vector2()
        },

        normalMapOffset2: {
            value: options.normalMapOffset2 || new THREE.Vector2(0.3, 0.3)
        },

        rcpNormalStrength: {
            value: options.normalStrength === undefined? 4.0 : 1.0 / options.normalStrength
        },

        celSpecularCutOff: {
            value: options.celSpecularCutOff || 1
        },

        roughnessSqr: {
            value: options.roughness * options.roughness
        },

        normalSpecularReflection: {
            //value: .04  // based on polyurethane (clear coat) index of refraction 1.5, as opposed to base layer, which would be .027
            value: .027
        },

        normalMap: {
            value: options.normalMap
        },

        ssaoMap: {
            value: options.ssaoRenderer? options.ssaoRenderer.texture : null
        },

        shadowMapSize: {
            value: this._shadowRenderer? this._shadowRenderer.size : 1
        },

        shadowMapPixelSize: {
            value: this._shadowRenderer? 1.0 / this._shadowRenderer.size : 1
        },

        aoMap: {
            value: options.aoMap
        },

        shadowMap: {
            value: this._shadowRenderer? this._shadowRenderer.shadowMap : null
        },

        shadowMatrix: {
            value: new THREE.Matrix4()
        },

        skyboxPosition: {
            value: options.skyboxPosition? options.skyboxPosition : new THREE.Vector3()
        },

        skyboxSize: {
            value: options.skyboxSize? options.skyboxSize : 10.0
        },

        specularProbe: {
            value: options.specularProbe
        },

        specularProbeColor: {
            value: options.specularProbeColor
        },

        irradianceProbe: {
            value: options.irradianceProbe
        },

        // provided in exposure stops
        irradianceProbeBoost: {
            value: options.irradianceProbeBoost? Math.pow(2, options.irradianceProbeBoost) : 1.0
        }
    };

    var uniforms = options.ignoreLights? materialUniforms :
        THREE.UniformsUtils.merge([
            materialUniforms,
            THREE.UniformsLib["lights"]
        ]);

    THREE.ShaderMaterial.call(this,
        {
            uniforms: uniforms,

            lights: options.ignoreLights? false : true,

            vertexShader: defines + ShaderLibrary.get("water_vertex"),
            fragmentShader: defines + ShaderLibrary.get("water_fragment")
        }
    );

    if (options.map)
        this.uniforms["albedoMap"].value = options.map;

    if (options.map2)
        this.uniforms["albedoMap2"].value = options.map2;

    this.uniforms["normalMap"].value = options.normalMap;

    if (options.specularProbe)
        this.uniforms["specularProbe"].value = options.specularProbe;

    if (options.fogProbe)
        this.uniforms["fogProbe"].value = options.fogProbe;

    if (options.irradianceProbe)
        this.uniforms["irradianceProbe"].value = options.irradianceProbe;

    if (options.aoMap)
        this.uniforms["aoMap"].value = options.aoMap;

    if (options.ssaoRenderer)
        this.uniforms["ssaoMap"].value = options.ssaoRenderer.target;

    if (this._shadowRenderer) {
        this.uniforms["shadowMap"].value = this._shadowRenderer.shadowMap;
        this.uniforms["shadowMapSize"].value = this._shadowRenderer.size;
        this.uniforms["shadowMapPixelSize"].value = 1.0 / this._shadowRenderer.size;
    }

};

WaterMaterial.prototype = Object.create( THREE.ShaderMaterial.prototype);

WaterMaterial.prototype._onShadowUpdate = function()
{
    this.uniforms["shadowMatrix"].value = this._shadowRenderer.shadowMapMatrix;
    this.uniforms["shadowMap"].value = this._shadowRenderer.shadowMap;
    this.uniforms["shadowMapSize"].value = this._shadowRenderer.size;
    this.uniforms["shadowMapPixelSize"].value = 1.0 / this._shadowRenderer.size;
};


WaterMaterial.prototype._generateShadowPoints = function(numSamples, radius)
{
    var points;
    radius /= this._shadowRenderer.size;
    if (numSamples === 5) {
        points = [];
        points.push(new THREE.Vector2());
        points.push(new THREE.Vector2(.5 * radius,  -radius));
        points.push(new THREE.Vector2(radius,       .5 * radius));
        points.push(new THREE.Vector2(-.5 * radius, radius));
        points.push(new THREE.Vector2(-radius,      -.5 * radius));
    }
    else {
        var poisson = new PoissonDisk();
        poisson.generatePoints(numSamples);
        points = poisson.getPoints();

        for (var i = 0; i < numSamples; ++i) {
            var p = points[i];
            p.multiplyScalar(radius);
        }
    }
    return points;
};
Gaussian =
{
    estimateGaussianRadius: function (variance, epsilon)
    {
        return Math.sqrt(-2.0 * variance * Math.log(epsilon));
    }
};

CenteredGaussianCurve = function(variance)
{
    this._amplitude = 1.0 / Math.sqrt(2.0 * variance * Math.PI);
    this._expScale = -1.0 / (2.0 * variance);
};

CenteredGaussianCurve.prototype =
{
    getValueAt: function(x)
    {
        return this._amplitude * Math.pow(Math.E, x*x*this._expScale);
    }
};

CenteredGaussianCurve.fromRadius = function(radius, epsilon)
{
    epsilon = epsilon || .01;
    var standardDeviation = radius / Math.sqrt(-2.0 * Math.log(epsilon));
    return new CenteredGaussianCurve(standardDeviation*standardDeviation);
};
/**
 *
 * @param mode
 * @param initialDistance
 * @param decayFactor
 * @param maxTests
 * @constructor
 */
PoissonDisk = function(mode, initialDistance, decayFactor, maxTests)
{
    this._mode = mode === undefined? PoissonDisk.CIRCULAR : mode;
    this._initialDistance = initialDistance || 1.0;
    this._decayFactor = decayFactor || .99;
    this._maxTests = maxTests || 20000;
    this._currentDistance = 0;
    this._points = null;
    this.reset();
};

PoissonDisk.SQUARE = 0;
PoissonDisk.CIRCULAR = 1;


PoissonDisk.prototype =
{
    getPoints: function()
    {
        return this._points;
    },

    reset : function()
    {
        this._currentDistance = this._initialDistance;
        this._points = [];
    },

    generatePoints: function(numPoints)
    {
        for (var i = 0; i < numPoints; ++i)
            this.generatePoint();
    },

    generatePoint: function()
    {
        for (;;) {
            var testCount = 0;
            var sqrDistance = this._currentDistance*this._currentDistance;

            while (testCount++ < this._maxTests) {
                var candidate = this._getCandidate();
                if (this._isValid(candidate, sqrDistance)) {
                    this._points.push(candidate);
                    return candidate;
                }
            }
            this._currentDistance *= this._decayFactor;
        }
    },

    _getCandidate: function()
    {
        for (;;) {
            var x = Math.random() * 2.0 - 1.0;
            var y = Math.random() * 2.0 - 1.0;
            if (this._mode == PoissonDisk.SQUARE || (x * x + y * y <= 1))
                return new THREE.Vector2(x, y);
        }
    },

    _isValid: function(candidate, sqrDistance)
    {
        var len = this._points.length;
        for (var i = 0; i < len; ++i) {
            var p = this._points[i];
            var dx = candidate.x - p.x;
            var dy = candidate.y - p.y;
            if (dx*dx + dy*dy < sqrDistance)
                return false;
        }

        return true;
    }
};

PoissonSphere = function(mode, initialDistance, decayFactor, maxTests)
{
    this._mode = mode === undefined? PoissonSphere.SPHERICAL : mode;
    this._initialDistance = initialDistance || 1.0;
    this._decayFactor = decayFactor || .99;
    this._maxTests = maxTests || 20000;
    this._currentDistance = 0;
    this._points = null;
    this.reset();
};

PoissonSphere.BOX = 0;
PoissonSphere.SPHERICAL = 1;

PoissonSphere.prototype =
{
    getPoints: function()
    {
        return this._points;
    },

    reset : function()
    {
        this._currentDistance = this._initialDistance;
        this._points = [];
    },

    generatePoints: function(numPoints)
    {
        for (var i = 0; i < numPoints; ++i)
            this.generatePoint();
    },

    generatePoint: function()
    {
        for (;;) {
            var testCount = 0;
            var sqrDistance = this._currentDistance*this._currentDistance;

            while (testCount++ < this._maxTests) {
                var candidate = this._getCandidate();
                if (this._isValid(candidate, sqrDistance)) {
                    this._points.push(candidate);
                    return candidate;
                }
            }
            this._currentDistance *= this._decayFactor;
        }
    },

    _getCandidate: function()
    {
        for (;;) {
            var x = Math.random() * 2.0 - 1.0;
            var y = Math.random() * 2.0 - 1.0;
            var z = Math.random() * 2.0 - 1.0;
            if (this._mode === PoissonSphere.BOX || (x * x + y * y + z * z <= 1))
                return new THREE.Vector4(x, y, z, 0.0);
        }
    },

    _isValid: function(candidate, sqrDistance)
    {
        var len = this._points.length;
        for (var i = 0; i < len; ++i) {
            var p = this._points[i];
            var dx = candidate.x - p.x;
            var dy = candidate.y - p.y;
            var dz = candidate.z - p.z;
            if (dx*dx + dy*dy + dz*dz < sqrDistance)
                return false;
        }

        return true;
    }
};

DepthOfFieldPass = function (camera, scene, hdre, hideList)
{
	THREE.Pass.call(this);

	// TODO: We need depth info too -_-
	// So: Render linear depth
	// DOF focusDepth, focusRange, etc... all should be / (far - near)
	if (hdre) {
		DOFShader.defines = TinyBlurHDREShader.defines = {
			HDRE: 1
		};
	}

	this._focusPosition = new THREE.Vector3();
	this._focusFalloff = .5;
	this._focusRange = .5;
	this._v = new THREE.Vector3();
	this._hideList = hideList || [];
	this._visibilityState = [];
	this._camera = camera;
	this._scene = scene;
	this._linearDepthMaterial = new LinearDepthMaterial();
	this._linearDepthMaterial.uniforms.nearClip.value = camera.near;
	this._linearDepthMaterial.uniforms.farClip.value = camera.far;

	this._strength = 1.0;

	this.copy = new THREE.ShaderMaterial(THREE.CopyShader);

	this.blur = new THREE.ShaderMaterial(TinyBlurHDREShader);
	this.composite = new THREE.ShaderMaterial(DOFShader);

	this._postCamera = new THREE.OrthographicCamera( - 1, 1, 1, - 1, 0, 1 );
	this._postScene = new THREE.Scene();
	this._postQuad = new THREE.Mesh( new THREE.PlaneBufferGeometry( 2, 2 ), null );
	this._postScene.add( this._postQuad );

	this.focusRange = 2.0;
	this.focusFalloff = 5.0;
};

DepthOfFieldPass.prototype = Object.assign( Object.create( THREE.Pass.prototype,
	{
		focusPosition: {
			get: function() { return this._focusPosition; },
			set: function(value) {
				this._focusPosition = value;
			}
		},

		focusFalloff: {
			get: function() { return this._focusFalloff; },
			set: function(value) {
				this._focusFalloff = value;
				this.composite.uniforms.focusFalloff.value = value / (this._camera.far - this._camera.near);
			}
		},

		focusRange: {
			get: function() { return this._focusRange; },
			set: function(value) {
				this._focusRange = value;
				this.composite.uniforms.focusRange.value = value / (this._camera.far - this._camera.near);
			}
		},

		strength: {
			get: function() { return this._strength; },
			set: function(value) {
				this._strength = value;
				this.composite.uniforms.strength.value = value;
				this.enabled = this._strength !== 0.0;
			}
		}
	}),
	{

		constructor: DepthOfFieldPass,

		render: function (renderer, writeBuffer, readBuffer, delta, maskActive)
		{
			this._v.copy(this._focusPosition);
			this._v.applyMatrix4(this._camera.matrixWorldInverse);
			this.composite.uniforms.focusDepth.value = (-this._v.z - this._camera.near) / (this._camera.far - this._camera.near);

			var w = this.smallBlurRadiusTex.width;
			var h = this.smallBlurRadiusTex.height;

			var len = this._hideList.length;

			for (var i = 0; i < len; ++i) {
				this._visibilityState[i] = this._hideList[i].visible;
				this._hideList[i].visible = false;
			}
			this._scene.overrideMaterial = this._linearDepthMaterial;
			renderer.render(this._scene, this._camera, this.depthTarget);
			this._scene.overrideMaterial = null;

			for (var i = 0; i < len; ++i)
				this._hideList[i].visible = this._visibilityState[i];

			// scale down and blur
			this._postQuad.material = this.copy;
			this.copy.uniforms.tDiffuse.value = readBuffer.texture;
			renderer.render(this._postScene, this._postCamera, this.smallBlurRadiusTex2);

			this._postQuad.material = this.blur;
			this.blur.uniforms.tDiffuse.value = this.smallBlurRadiusTex2.texture;
			this.blur.uniforms.sampleStep.value.x = 1.0 / w;
			this.blur.uniforms.sampleStep.value.y = 1.0 / h;
			renderer.render(this._postScene, this._postCamera, this.smallBlurRadiusTex);

			this.blur.uniforms.tDiffuse.value = this.smallBlurRadiusTex.texture;
			this.blur.uniforms.sampleStep.value.x = 1.5 / w;
			this.blur.uniforms.sampleStep.value.y = 1.5 / h;
			renderer.render(this._postScene, this._postCamera, this.largeBlurRadiusTex);

			this._postQuad.material = this.composite;
			this.composite.uniforms.depth.value = this.depthTarget.texture;
			this.composite.uniforms.source.value = readBuffer.texture;
			this.composite.uniforms.blurred1.value = this.smallBlurRadiusTex.texture;
			this.composite.uniforms.blurred2.value = this.largeBlurRadiusTex.texture;
			renderer.render(this._postScene, this._postCamera, writeBuffer);
		},

		setSize: function (x, y)
		{
			x = Math.floor(x);
			y = Math.floor(y);
			if (this.resolutionX === x && this.resolutionY === y) return;
			this.resolutionX = x;
			this.resolutionY = y;
			var pars = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat };
			var scaledDownX = x >> 1;
			var scaledDownY = y >> 1;
			this.depthTarget = new THREE.WebGLRenderTarget(x, y, pars);
			this.smallBlurRadiusTex = new THREE.WebGLRenderTarget(scaledDownX, scaledDownY, pars);
			this.smallBlurRadiusTex2 = new THREE.WebGLRenderTarget(scaledDownX, scaledDownY, pars);
			scaledDownX = x >> 2;
			scaledDownY = y >> 2;
			this.largeBlurRadiusTex = new THREE.WebGLRenderTarget(scaledDownX, scaledDownY, pars);
			this.smallBlurRadiusTex.texture.generateMipmaps = false;
			this.largeBlurRadiusTex.texture.generateMipmaps = false;
		}
	}
);
DOFShader = {
	uniforms: {
		"source": { value: null },
		"blurred1": { value: null },
		"blurred2": { value: null },
		"depth": { value: null },
		"strength": { value: 1.0 },
		"focusDepth": { value:.5 },
		"focusRange": { value:.1 },
		"focusFalloff": { value: .1 }
	},

	vertexShader: ShaderLibrary.get("post_vertex"),
	fragmentShader: ShaderLibrary.get("dof_fragment")
};

GaussianBlurHDREShader = {
	defines: {
		"KERNEL_RADIUS": "5",
		"NUM_WEIGHTS": "6"
	},

	uniforms: {
		"tDiffuse": { value: null },
		"sampleStep": { value: new THREE.Vector2() },
		"weights": { value: [] }
	},

	vertexShader: ShaderLibrary.get("post_vertex"),
	fragmentShader: ShaderLibrary.get("gaussian_blur_hdre_fragment")
};

LensFlareCompositeShader = {

	uniforms: {
		"source": { value: null },
		"flare": { value: null },
		"lensDirt": { value: null },
		"strength": { value: 1.0 }
	},

	vertexShader: ShaderLibrary.get("post_vertex"),
	fragmentShader: ShaderLibrary.get("lensflare_composite_fragment")
};

LensFlareFeatureShader = {

	uniforms: {

		"tDiffuse": { type: "t", value: null },
		"threshold": { type: "f", value: 1.0 },
		"ratio1": { type: "f", value: 1.0 },
		"ratio2": { type: "f", value: 1.0/.5 },
		"ratio3": { type: "f", value: -1.0/.3 },
		"ratio4": { type: "f", value: -1.0/.6 }
	},

	vertexShader: ShaderLibrary.get("lensflare_feature_vertex"),
	fragmentShader: ShaderLibrary.get("lensflare_feature_fragment")
};

PseudoLensFlarePass = function (radius, threshold, lensDirtTexture, hdre)
{
	THREE.Pass.call(this);

	radius = radius || 10;
	threshold = threshold || 1.0;

	if (hdre) {
		LensFlareCompositeShader.defines = LensFlareFeatureShader.defines = {
			"HDRE": "1"
		};
		GaussianBlurHDREShader.defines.HDRE = "1";
	}

	this.featureSelection = new THREE.ShaderMaterial(LensFlareFeatureShader);
	this.featureSelection.uniforms.threshold.value = threshold;

	this.composite = new THREE.ShaderMaterial(LensFlareCompositeShader);
	this.composite.uniforms.strength.value = .5;
	this.composite.uniforms.lensDirt.value = lensDirtTexture;
	GaussianBlurHDREShader.defines.KERNEL_RADIUS = radius;
	GaussianBlurHDREShader.defines.NUM_WEIGHTS = radius + 1;
	this.blur = new THREE.ShaderMaterial(GaussianBlurHDREShader);
	this.blur.uniforms.weights.value = this._getGaussian(radius);

	this.camera = new THREE.OrthographicCamera( - 1, 1, 1, - 1, 0, 1 );
	this.scene = new THREE.Scene();
	this.quad = new THREE.Mesh( new THREE.PlaneBufferGeometry( 2, 2 ), null );
	this.scene.add( this.quad );
};

PseudoLensFlarePass.prototype = Object.assign( Object.create( THREE.Pass.prototype ), {

	constructor: PseudoLensFlarePass,

	render: function (renderer, writeBuffer, readBuffer, delta, maskActive)
	{
		var w = this.renderTarget1.width;
		var h = this.renderTarget1.height;

		this.quad.material = this.featureSelection;
		this.featureSelection.uniforms.tDiffuse.value = readBuffer.texture;
		renderer.render(this.scene, this.camera, this.renderTarget1);

		/*this.quad.material = this.featureSelection;
		this.featureSelection.uniforms.threshold.value = 0.0;
		this.featureSelection.uniforms.tDiffuse.value = this.renderTarget1;
		renderer.render(this.scene, this.camera, this.renderTarget2);*/

		this.quad.material = this.blur;
		this.blur.uniforms.tDiffuse.value = this.renderTarget1;
		this.blur.uniforms.sampleStep.value.x = 1.0 / w;
		this.blur.uniforms.sampleStep.value.y = 0.0;
		renderer.render(this.scene, this.camera, this.renderTarget2);

		this.blur.uniforms.tDiffuse.value = this.renderTarget2;
		this.blur.uniforms.sampleStep.value.x = 0.0;
		this.blur.uniforms.sampleStep.value.y = 1.0 / h;
		renderer.render(this.scene, this.camera, this.renderTarget1);

		this.quad.material = this.composite;
		this.composite.uniforms.source.value = readBuffer.texture;
		this.composite.uniforms.flare.value = this.renderTarget1.texture;
		renderer.render(this.scene, this.camera, writeBuffer);
	},

	setSize: function (x, y)
	{
		this.resolutionX = Math.floor(x);
		this.resolutionY = Math.floor(y);
		var pars = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat };
		this.renderTarget1 = new THREE.WebGLRenderTarget(this.resolutionX, this.resolutionY, pars);
		this.renderTarget2 = new THREE.WebGLRenderTarget(this.resolutionX, this.resolutionY, pars);
		this.renderTarget1.texture.generateMipmaps = false;
		this.renderTarget2.texture.generateMipmaps = false;
	},

	_getGaussian: function(radius)
	{
		var gaussian = CenteredGaussianCurve.fromRadius(radius, .01);
		var weights = [];

		var total = 0;
		for (var j = 0; j <= radius; ++j) {
			var w = gaussian.getValueAt(j);
			weights[j] = w;
			total += j === 0? w : w * 2;
		}

		for (var j = 0; j <= radius; ++j) {
			weights[j] /= total;
		}

		return weights;
	}
});
TinyBlurHDREShader = {
	uniforms: {
		"tDiffuse": { value: null },
		"sampleStep": { value: new THREE.Vector2() },
		"weights": { value: [] }
	},

	vertexShader: ShaderLibrary.get("post_vertex"),
	fragmentShader: ShaderLibrary.get("tiny_blur_hdre_fragment")
};

ToneMapShader = {

	uniforms: {

		"tDiffuse": { type: "t", value: null },
		"exposure": { type: "f", value: 1.0 }
	},

	vertexShader: ShaderLibrary.get("post_vertex"),

	fragmentShader: ShaderLibrary.get("tonemap_fragment")

};

function BaseProjectContent()
{

}

BaseProjectContent.prototype =
{
    init: function(project) {},
    start: function() {},
    destroy: function() {},
    resize: function(width, height) {},
    update: function(dt) {}
};

function DynamicSkyContent()
{
    this._skyboxRenderer = null;
    this._skybox = null;
    this._scene = null;
    this._camera = null;
    this._assetLibrary = null;
    this.effectComposer = null;
    this._hdre = highPerformance;
    this._clouds = null;
    this._cloudMaterial = null;
}

DynamicSkyContent.prototype =
{
    init: function(project)
    {
        this._scene = project.scene;
        this._camera = project.camera;
        this._renderer = project.renderer;
        this._assetLibrary = project.assetLibrary;
        //this._container = document.getElementById("webglcontainer");

        this._initCameraController(project.debugMode);
        this._camera.far = 3000;

        this._sunComponent = new SunComponent(this._assetLibrary.get("solar-flare"));
        this._light = new THREE.DirectionalLight(0xffffff);
        Entity.convert(this._light, [ this._sunComponent ]);

        this._skyboxRenderer = new DynamicSkyboxRenderer(this._renderer, this._light, 256, this._hdre, this._assetLibrary.get("cloud-env")/*, this._assetLibrary.get("stars")*/);

        this._skybox = new Skybox(this._skyboxRenderer.skyboxTexture, this._camera.far);
        this._scene.add(this._skybox);
        this._scene.add(this._light);

        this._initEffectChain();
        this._initCloudLayers();
        this._initGround();
    },

    start: function()
    {
    },

    resize: function(width, height)
    {
        this._lensFlare.setSize(width * .18, height * .18);
    },

    update: function(dt)
    {
        this._sunComponent.dayTime += dt * 0.00001;
        this._skyboxRenderer.update();

        var dir = this._cloudMaterial.uniforms.lightWorldDir.value;
        dir.copy(this._light.position);
        dir.normalize();
    },

    // TODO: implement if required:
    destroy: function() {},

    _initGround: function()
    {
        var material = new DielectricMaterial({
            color: 0x808080,
            fogProbe: this._skyboxRenderer.skyboxTexture,
            // specularProbe: this._skyboxRenderer.skyboxTexture,
            irradianceProbe: this._skyboxRenderer.irradianceTexture,
            irradianceProbeBoost: 0.0,
            roughness:.8,
            hdre: this._hdre,
            fogDensity:.008,
            lowPerformance: !highPerformance
        });

        var mesh = new THREE.Mesh(new THREE.PlaneGeometry(1000, 1000, 10, 10), material);
        mesh.rotateX(-Math.PI * .5);
        mesh.position.y = -20.0;
        this._scene.add(mesh);
    },

    _initEffectChain: function()
    {
        if (this._hdre) {
            ToneMapShader.defines = {
                "HDRE": "1"
            }
        }

        var renderPass = new THREE.RenderPass(this._scene, this._camera);
        var lensFlare = new PseudoLensFlarePass(10, 1.0, this._assetLibrary.get("lens-dirt"), this._hdre);
        var tonemap = new THREE.ShaderPass(ToneMapShader);

        this.effectComposer = new THREE.EffectComposer(this._renderer);

        this.effectComposer.addPass(renderPass);
        if (this._hdre)
            this.effectComposer.addPass(lensFlare, this._renderer.width * .5, this._renderer.height * .5);

        this.effectComposer.addPass(tonemap);
        tonemap.renderToScreen = true;

        this._lensFlare = lensFlare;
    },

    // TODO: We could perform clouds as post-processing effect as well...
    _initCloudLayers: function()
    {
        this._clouds = new THREE.Object3D();
        this._scene.add(this._clouds);

        Entity.convert(this._clouds, [ new CloudController() ]);

        var geom = new THREE.PlaneBufferGeometry(2000, 2000, 5, 5);
        geom.rotateX(-Math.PI *.5);

        var numLayers = 6;
        var heightRange = 1.5;
        var minHeight = -10.0;

        this._cloudMaterial = new CloudMaterial(
            {
                hdre: this._hdre,
                map: this._assetLibrary.get("cloud-layer"),
                irradianceProbe: this._skyboxRenderer.irradianceTexture,
                irradianceProbeBoost: 1.0,
                heightRange: heightRange,
                minHeight: minHeight,
                density: .15 / numLayers
            }
        );
        // TODO: instead of layers, we could also raymarch in the shader?
        for (var i = 0; i < numLayers; ++i) {
            var mesh = new THREE.Mesh(geom, this._cloudMaterial);
            mesh.position.y = minHeight + i / numLayers * heightRange;
            mesh.renderOrder = 20000 + i;
            this._clouds.add(mesh);
        }
    },

    _initCameraController: function(debugMode)
    {
        var orbitController = new OrbitController(null, this._container, debugMode);
        orbitController.zoomSpeed = 20.0;
        orbitController.minRadius = 1.0;
        orbitController.maxRadius = 90.0;
        // orbitController.maxPolar = Math.PI * .5 - 0.1;
        // orbitController.minPolar = 0.5;

        Entity.convert(this._camera, [ orbitController ]);
    }
};

function SimpleThreeProject()
{
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.assetLibrary = null;
    this.container = null;
    this.timeScale = 1.0;
    this._content = null;
    this._stats = null;
    this._renderStats = null;
    this._time = null;
    this._isRunning = false;
    this._initialized = false;
};

SimpleThreeProject.prototype =
{
    init: function(debugMode, assetLibrary)
    {
        this.assetLibrary = assetLibrary;

        this._initRenderer();

        this._debugMode = debugMode;
        if (debugMode) this._initStats();

        var self = this;
        window.addEventListener('resize', function() { self._resizeCanvas(); } , false);
        this._initialized = true;
        this._resizeCanvas();
        if (this._content) this._content.init(this);
    },

    get debugMode() { return this._debugMode; },

    get content() { return this._content; },
    set content(value)
    {
        this._time = null;
        // we haven't initialized anything yet, so don't destroy/init content either
        if (this._content) this._content.destroy();
        this._content = value;
        if (this._initialized) this._content.init(this);
        if (this._isRunning) this._content.start();
        this._resizeCanvas();
    },

    _initRenderer: function()
    {
        var dpr = window.devicePixelRatio;
        //if (dpr > 1) dpr *= .75;

        this.renderer = new THREE.WebGLRenderer({ antialias: false, preserveDrawingBuffer: false/*, premultipliedAlpha: false*/ } );
        this.renderer.setPixelRatio(dpr);

        //this.container = document.getElementById('webglcontainer');

        this.scene = new EntityScene();
        this.camera = new THREE.PerspectiveCamera();
        Entity.convert(this.camera);
        this.camera.near = .1;
        this.camera.far = 100.0;

        this.scene.add(this.camera);

        //this.container.appendChild(this.renderer.domElement);
    },

    _initStats: function ()
    {
        this._stats = new Stats();
        this._stats.domElement.style.position = 'absolute';
        this._stats.domElement.style.bottom = '0px';
        this._stats.domElement.style.right  = '0px';
        this._stats.domElement.style.zIndex = 100;
        this.container.appendChild(this._stats.domElement);

        this._renderStats = new THREEx.RendererStats();
        this._renderStats.domElement.style.position = 'absolute';
        this._renderStats.domElement.style.bottom = '0px';
        this._renderStats.domElement.style.zIndex = 100;
        this.container.appendChild(this._renderStats.domElement);
    },

    _resizeCanvas: function()
    {
        if (!this.renderer) return;

        var width = window.innerWidth;
        var height = window.innerHeight;

        this.renderer.setSize(width, height);
        this.renderer.domElement.style.width = width + "px";
        this.renderer.domElement.style.height = height + "px";

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();

        if (this._content) this._content.resize(width, height);
    },

    stop: function()
    {
        this._isRunning = false;
    },

    start: function()
    {
        this._isRunning = true;
        if (this._content) this._content.start();
        this._requestAnimationFrame();
    },

    _render: function()
    {
        if (!this._isRunning) return;

        var time = new Date().getTime();
        var dt = 0;
        if (this._time != null)
            dt = time - this._time;

        dt *= this.timeScale;

        this._time = time;

        this._requestAnimationFrame();

        this.scene.entityEngine.update(dt);

        if (this._content) this._content.update(dt);

        if (this._content && this._content.effectComposer)
            this._content.effectComposer.render(dt / 1000.0);
        else
            this.renderer.render(this.scene, this.camera);

        if (this._stats) {
            this._renderStats.update(this.renderer);
            this._stats.update();
        }
    },

    _requestAnimationFrame: function()
    {
        var self = this;
        requestAnimationFrame(function()
        {
            self._render();
        });
    }
};
function HardShadowRenderer(scene, renderer, light, size)
{
    size = size === undefined? 1024 : size;

    this.onUpdate = new Signal();

    this._renderer = renderer;
    this._scene = scene;

    this._shadowMap = new THREE.WebGLRenderTarget( size, size,
        {
            minFilter: THREE.LinearFilter,
            magFilter: THREE.LinearFilter,
            format: THREE.RGBAFormat,
            stencilBuffer: false
        });

    this._light = light;
    this._lightCamera = new THREE.OrthographicCamera(-30, 30, -30, 30, -50, 50);
    this._size = size;
    this.shadowMapMatrix = new THREE.Matrix4();

    this._shadowMaterial = new ShadowMaterial();
    this._white = new THREE.Color(1, 1, 1);
}

HardShadowRenderer.prototype =
{
    get shadowMap() { return this._shadowMap.texture; },
    get size() { return this._size; },

    render: function()
    {
        var lightCamera = this._lightCamera;
        lightCamera.position.copy(this._light.position);
        lightCamera.lookAt(new THREE.Vector3(0.0, 0.0, 0.0));
        lightCamera.position.set(0.0, 0.0, 0.0);
        lightCamera.updateProjectionMatrix();
        lightCamera.updateMatrixWorld();
        this.shadowMapMatrix.getInverse(lightCamera.matrixWorld);
        this.shadowMapMatrix.multiplyMatrices(lightCamera.projectionMatrix, this.shadowMapMatrix);
        this._scene.overrideMaterial = this._shadowMaterial;
        var clearColor = this._renderer.getClearColor();
        this._renderer.setClearColor(this._white);
        this._renderer.render(this._scene, lightCamera, this._shadowMap);
        this._renderer.setClearColor(clearColor);
        this._scene.overrideMaterial = null;
        this.onUpdate.dispatch();
    },

    // called if not rendered
    update: function()
    {
    }
};
ShadowMaterial = function()
{
    var materialUniforms = {
        depthBias: {
            value: highPerformance? 0 : .004
        }
    };

    THREE.ShaderMaterial.call(this,
        {
            uniforms: materialUniforms,

            vertexShader: ShaderLibrary.get("shadow_vertex"),
            fragmentShader: ShaderLibrary.get("shadow_fragment")
        }
    );

    this.side = highPerformance? THREE.FrontSide : THREE.BackSide;
};

ShadowMaterial.prototype = Object.create(THREE.ShaderMaterial.prototype);
VSMBlurShader = {

	uniforms: {

		"tDiffuse": { value: null },
		"step":        { value: new THREE.Vector2(1.0 / 512.0, 0.0) }

	},

	vertexShader: ShaderLibrary.get("vsm_blur_vertex"),
	fragmentShader: ShaderLibrary.get("vsm_blur_fragment")

};

VSMMaterial = function(floatTex)
{
    var defines = "";
    if (floatTex) defines += "#define FLOAT_TEX\n";
    THREE.ShaderMaterial.call(this,
        {
            vertexShader: ShaderLibrary.get("shadow_vertex"),
            fragmentShader: defines + ShaderLibrary.get("vsm_fragment")
        }
    );

    this.extensions.derivatives = true;
    this.side = THREE.BackSide;
};

VSMMaterial.prototype = Object.create(THREE.ShaderMaterial.prototype);
function VSMShadowRenderer(scene, renderer, light, size, floatExt)
{
    size = size === undefined? 1024 : size;

    this.onUpdate = new Signal();

    this._shadowMap = new THREE.WebGLRenderTarget( size, size,
        {
            minFilter: THREE.LinearFilter,
            magFilter: THREE.LinearFilter,
            format: THREE.RGBAFormat,
            type: floatExt? THREE.HalfFloatType : THREE.UnsignedByteType
        });
    this._light = light;
    this._lightCamera = new THREE.OrthographicCamera(-30, 30, -30, 30, -50, 50);
    this._size = size;
    this.shadowMapMatrix = new THREE.Matrix4();

    this.renderPass = new THREE.RenderPass(scene, this._lightCamera, new VSMMaterial(floatExt));
    this.renderPass.clearColor = new THREE.Color(1, 1, 1);
    this.renderPass.clearAlpha = 1;

    this.effectComposer = new THREE.EffectComposer(renderer, this._shadowMap);
    this.effectComposer.addPass(this.renderPass);

    VSMBlurShader.defines = floatExt? {
        FLOAT_TEX: 1
    } : undefined;
    this.hBlur = new THREE.ShaderPass(VSMBlurShader);
    this.vBlur = new THREE.ShaderPass(VSMBlurShader);
    this.hBlur.uniforms.step.value = new THREE.Vector2(1.0/size, 0.0);
    this.vBlur.uniforms.step.value = new THREE.Vector2(0.0, 1.0/size);

    this.effectComposer.addPass(this.hBlur);
    this.effectComposer.addPass(this.vBlur);
    this.effectComposer.addPass(this.hBlur);
    this.effectComposer.addPass(this.vBlur);
}

VSMShadowRenderer.prototype =
{
    get shadowMap() { return this._shadowMap.texture; },
    get size() { return this._size; },

    render: function()
    {
        var lightCamera = this._lightCamera;
        lightCamera.position.copy(this._light.position);
        lightCamera.lookAt(new THREE.Vector3(0.0, 0.0, 0.0));
        lightCamera.position.set(0.0, 0.0, 0.0);
        lightCamera.updateProjectionMatrix();
        lightCamera.updateMatrixWorld();
        this.shadowMapMatrix.getInverse(lightCamera.matrixWorld);
        this.shadowMapMatrix.multiplyMatrices(lightCamera.projectionMatrix, this.shadowMapMatrix);
        this.effectComposer.render(1/60);
        this.onUpdate.dispatch();
    }
};
function DynamicSkyboxRenderer(renderer, light, size, hdre, cloudMap, nightMap)
{
    // TODO: This uses depth/stencil buffer, we don't really need to render a "scene"

    this._skyboxCubeCamera = new THREE.CubeCamera(0.1, 100.0, size || 512);
    this._irradianceCubeCamera = new THREE.CubeCamera(0.1, 100.0, 4);
    this.skyboxTexture.format = THREE.RGBAFormat;
    this.irradianceTexture.format = THREE.RGBAFormat;
    this.skyboxTexture.minFilter = THREE.LinearMipMapLinearFilter;
    this.skyboxTexture.generateMipmaps = true;

    this._light = light;
    this._renderer = renderer;
    this._lightPos = new THREE.Vector3();
    this._lightDir = new THREE.Vector3();

    this._initScene(hdre, cloudMap, nightMap);
}

DynamicSkyboxRenderer.prototype =
{
    get skyboxTexture()
    {
        return this._skyboxCubeCamera.renderTarget.texture;
    },

    get irradianceTexture()
    {
        return this._irradianceCubeCamera.renderTarget.texture;
    },

    update: function()
    {
        if (!this._lightPos.equals(this._light.position)) {
            this._lightPos.copy(this._light.position);
            this._lightDir.copy(this._light.position);
            this._lightDir.normalize();
            this._skyboxMaterial.uniforms.lightDir.value = this._lightDir;
            this._skyboxCubeCamera.updateCubeMap(this._renderer, this._skyboxScene);
            this._irradianceCubeCamera.updateCubeMap(this._renderer, this._irradianceScene);
        }
    },

    _initScene: function(hdre, cloudMap, nightMap)
    {
        this._skyboxMaterial = new DynamicSkyMaterial({
            hdre: hdre,
            cloudMap: cloudMap,
            nightMap: nightMap
        });
        // TODO: Should we use a sphere so we can use the distance?
        var geometry = new THREE.BoxGeometry(10.0, 10.0, 10.0);
        geometry.scale(1, -1, 1);
        var mesh = new THREE.Mesh(geometry, this._skyboxMaterial);
        this._skyboxScene = new THREE.Scene();
        this._skyboxScene.add(mesh);

        var material = new SkyMaterial({
            envMap: this.skyboxTexture,
            //flip: true
        });
        mesh = new THREE.Mesh(geometry, material);
        this._irradianceScene = new THREE.Scene();
        this._irradianceScene.add(mesh);
    }
};
function Skybox(texture, geometrySize)
{
    geometrySize = geometrySize || 100;
    var geometry = new THREE.BoxGeometry(geometrySize, geometrySize, geometrySize);
    geometry.scale(-1, 1, 1);

    var material = new SkyMaterial({
        envMap: texture
    });

    THREE.Mesh.call(this, geometry, material);
}

Skybox.prototype = Object.create(THREE.Mesh.prototype, {
    texture:
    {
        get: function() { return this.material.envMap; },
        set: function(value)
        {
            this.material.envMap = value;
        }
    }
});


function SunComponent(texture, hdre)
{
    Component.call(this);
    this._texture = texture;
    this._sunMesh = null;
    this._originObject = new THREE.Object3D();
    this._hdre = hdre;
    this._dayTime = 0;
    this._rotation = new THREE.Quaternion();
    this._rotation.setFromAxisAngle(new THREE.Vector3(0, 0, 1), 60 / 180 * Math.PI);
}


SunComponent.prototype = Object.create(Component.prototype,
    {
        dayTime: {
            get: function ()
            {
                return this._dayTime;
            },

            set: function (value)
            {
                var target = this.entity;
                this._dayTime = value;
                var time = (value - .5) * Math.PI * 2.0;
                target.position.x = 0.0;
                target.position.y = Math.cos(time);
                target.position.z = Math.sin(time);
                target.position.applyQuaternion(this._rotation);

                target.position.multiplyScalar(950);
                target.intensity = Math.max(Math.cos(time) + .25, 0.0);
                //target.color.set(1.0, 1.0, 1.0);
                //var f = THREE.Math.smoothstep(target.position.y, .25, 0.0);
                //target.color.lerp(this._sunSetColor, 1.0 - f);

                this._originObject.position.copy(target.position);
                this._originObject.position.negate();
                this._sunMesh.lookAt(this._originObject.position);
            }
        }
    }
);

SunComponent.prototype.onAdded = function()
{
    // TODO: Replace with a disc facing the centre
    var geometry = new THREE.PlaneBufferGeometry(150.0, 150.0, 1, 1);

    // could we use multiplicative blending on the exponent instead?
    var material = new FlatMaterial({
        map: this._texture,
        blending: THREE.AdditiveBlending,
        hdre: this._hdre
    });

    this._sunMesh = new THREE.Mesh(geometry, material);
    this.entity.add(this._sunMesh);

    geometry = new THREE.SphereGeometry(25.0, 15, 10);
    material = new FlatMaterial({
        color: new THREE.Color(10.0, 10.0, 10.0),
        hdre: this._hdre,
        opacity:.5
    });

    var sunSphere = new THREE.Mesh(geometry, material);

    this.entity.add(sunSphere);
};

SunComponent.prototype.onRemoved = function()
{
    this._sunMesh = null;
    this.entity.remove(this._sunMesh);
};
CalculateNormals =
{
    doAll: function(model)
    {
        for (var i = 0; i < model.children.length; ++i) {
            var child = model.children[i];
            if (child.geometry) {
                child.geometry.computeVertexNormals(false);
                child.geometry.normalsNeedUpdate = true;
            }
            CalculateNormals.doAll(child);
        }
    }
};
FindObject3D =
{
    findByNamePartial: function(model, name, targetArr)
    {
        if (targetArr === undefined) targetArr = [];

        for (var i = 0; i < model.children.length; ++i) {
            var child = model.children[i];
            if (child.name.indexOf(name) >= 0)
                targetArr.push(child);
            FindObject3D.findByNamePartial(child, name, targetArr);
        }
        return targetArr;
    }
};
function isPlatformMobile()
{
    var ios = /AppleWebKit/.test(navigator.userAgent) && /Mobile\/\w+/.test(navigator.userAgent);
    // This is woefully incomplete. Suggestions for alternative methods welcome.
    return ios || /Android|webOS|BlackBerry|Opera Mini|Opera Mobi|IEMobile/i.test(navigator.userAgent);
}
// Taken from Helix
Signal = function()
{
    this._listeners = [];
    this._lookUp = {};
};

/**
 * Signals keep "this" of the caller, because having this refer to the signal itself would be silly
 */
Signal.prototype =
{
    bind: function(listener, thisRef)
    {
        this._lookUp[listener] = this._listeners.length;
        var callback = thisRef? listener.bind(thisRef) : listener;
        this._listeners.push(callback);
    },

    unbind: function(listener)
    {
        var index = this._lookUp[listener];
        this._listeners.splice(index, 1);
        delete this._lookUp[listener];
    },

    dispatch: function(payload)
    {
        var len = this._listeners.length;
        for (var i = 0; i < len; ++i)
            this._listeners[i](payload);
    },

    get hasListeners()
    {
        return this._listeners.length > 0;
    }
};
SwapMaterials =
{
    setAll: function(model, material)
    {
        for (var i = 0; i < model.children.length; ++i) {
            var child = model.children[i];
            child.material = material;
            SwapMaterials.setAll(child, material);
        }
    },

    swapSelect: function(model, materialMap)
    {
        for (var i = 0; i < model.children.length; ++i) {
            var child = model.children[i];

            if (materialMap.hasOwnProperty(child.name)) {
                child.material = materialMap[child.name];
            }

            SwapMaterials.swapSelect(child, materialMap);
        }
    },

    swapSelectPartialMatch: function(model, materialMap)
    {
        for (var i = 0; i < model.children.length; ++i) {
            var child = model.children[i];

            for (var key in materialMap) {
                if (materialMap.hasOwnProperty(key)) {
                    if (child.name.indexOf(key) >= 0)
                        child.material = materialMap[key];
                }
            }

            SwapMaterials.swapSelect(child, materialMap);
        }
    }
};
function CameraTravelPoint(x, y, z, azimuth, polar, radius)
{
    this.lookAtTarget = new THREE.Vector3(x, y, z);
    this.azimuth = azimuth || 0;
    this.polar = polar || 0;
    this.radius =  radius || 0;
    this.quat = new THREE.Quaternion();
    this.position = new THREE.Vector3();

    this._updateTransform();
}

CameraTravelPoint.prototype =
{
    copyFromOrbitController: function(controller)
    {
        this.x = controller.lookAtTarget.x;
        this.y = controller.lookAtTarget.y;
        this.z = controller.lookAtTarget.z;
        this.azimuth = controller.azimuth;
        this.polar = controller.polar;
        this.radius = controller.radius;
        this._updateTransform();
    },

    _updateTransform: function()
    {
        this.position = this._fromSphericalCoordinates(this.radius, this.azimuth, this.polar);
        this.position.add(this.lookAtTarget);
        var matrix = new THREE.Matrix4();
        matrix.lookAt(this.position, this.lookAtTarget, new THREE.Vector3(0, 1, 0));
        this.quat.setFromRotationMatrix(matrix);
    },

    _fromSphericalCoordinates: function(radius, azimuthalAngle, polarAngle)
    {
        var v = new THREE.Vector3();
        v.x = radius*Math.sin(polarAngle)*Math.cos(azimuthalAngle);
        v.y = radius*Math.cos(polarAngle);
        v.z = radius*Math.sin(polarAngle)*Math.sin(azimuthalAngle);
        return v;
    }
};
