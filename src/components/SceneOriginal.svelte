<script>
	
  import { T, useFrame } from '@threlte/core'
  import { useGltf, OrbitControls } from '@threlte/extras'
  import * as THREE from 'three';
  
  export let poses = []
  
  export let model;

	const gltf = useGltf('/' + model.file);

  let skeleton
  let consoled = false
  let prefix = ''
	if (model.type == 'mixamo') {
		prefix = 'mixamorig';
	}
  let initialDirections = []

  // Helper function to convert Mediapipe landmarks to THREE.js Vector3
  function landmarkToVector3_Left(landmark) {
      return new THREE.Vector3(
        landmark.z,
        landmark.x,
        landmark.y
      );
  }
  function landmarkToVector3_LeftElbow(landmark) {
      return new THREE.Vector3(
        landmark.x,
        landmark.y*-1,
        landmark.z*-1
      );
  }
  function landmarkToVector3_Right(landmark) {
      return new THREE.Vector3(
        landmark.z*-1,
        landmark.x*-1,
        landmark.y
      );
  }
  function landmarkToVector3_RightElbow(landmark) {
      return new THREE.Vector3(
        landmark.x,
        landmark.y*-1,
        landmark.z*-1
      );
  }

  let leftShoulder,
  leftElbow,
  upperLeftArmDirection,
  leftWrist,
  leftForeArmDirection,
  initialLeftArmDirection,
  leftArmQuaternion,
  initialLeftForeArmDirection,
  leftForeArmQuaternion,
  leftArmGlobalQuaternion,
  invLeftArmGlobalQuaternion,
  localRotationLeftForeArm

  let rightShoulder,
  rightElbow,
  upperRightArmDirection,
  rightWrist,
  rightForeArmDirection,
  initialRightArmDirection,
  rightArmQuaternion,
  initialRightForeArmDirection,
  rightForeArmQuaternion,
  rightArmGlobalQuaternion,
  invRightArmGlobalQuaternion,
  localRotationRightForeArm

  

  useFrame(()=>{
      if($gltf && poses.length){

        // ***** LEFT ARM 

        // Convert landmarks to THREE.js vectors
        leftShoulder = landmarkToVector3_Left(poses[11]);
        leftElbow = landmarkToVector3_Left(poses[13]);

        // Calculate vectors for directions
        upperLeftArmDirection = new THREE.Vector3().subVectors(leftElbow, leftShoulder).normalize();

        leftElbow = landmarkToVector3_LeftElbow(poses[13]);
        leftWrist = landmarkToVector3_LeftElbow(poses[15]);
        leftForeArmDirection = new THREE.Vector3().subVectors(leftWrist, leftElbow).normalize();

        // Calculate the quaternion for LeftArm rotation
        initialLeftArmDirection = initialDirections[prefix+'LeftArm'].normalize();
        leftArmQuaternion = new THREE.Quaternion().setFromUnitVectors(initialLeftArmDirection, upperLeftArmDirection);
        $gltf.nodes[prefix+'LeftArm'].quaternion.copy(leftArmQuaternion);

        // Calculate the quaternion for LeftForeArm rotation relative to LeftArm
        initialLeftForeArmDirection = initialDirections[prefix+'LeftForeArm'].normalize(); // Initial direction along X-axis
        leftForeArmQuaternion = new THREE.Quaternion().setFromUnitVectors(initialLeftForeArmDirection, leftForeArmDirection);
        // $gltf.nodes[prefix+'LeftForeArm'].quaternion.multiply(foreArmQuaternion);
        // Get the current global quaternion of the leftArm
        leftArmGlobalQuaternion = $gltf.nodes[prefix+'LeftArm'].getWorldQuaternion(new THREE.Quaternion());

        // Invert the global quaternion of the leftArm to get its "rest" orientation
        invLeftArmGlobalQuaternion = leftArmGlobalQuaternion.clone().invert();

        // Apply the inverse quaternion to the target global quaternion to get the local rotation relative to the leftArm
        localRotationLeftForeArm = new THREE.Quaternion().multiplyQuaternions(invLeftArmGlobalQuaternion, leftForeArmQuaternion);

        // Now apply this local rotation to the leftForeArm's quaternion
        $gltf.nodes[prefix+'LeftForeArm'].quaternion.copy(localRotationLeftForeArm);

        // ***** RIGHT ARM 

        // Convert landmarks to THREE.js vectors
        rightShoulder = landmarkToVector3_Right(poses[12]);
        rightElbow = landmarkToVector3_Right(poses[14]);

        // Calculate vectors for directions
        const upperRightArmDirection = new THREE.Vector3().subVectors(rightElbow, rightShoulder).normalize();

        rightElbow = landmarkToVector3_RightElbow(poses[14]);
        rightWrist = landmarkToVector3_RightElbow(poses[16]);
        rightForeArmDirection = new THREE.Vector3().subVectors(rightWrist, rightElbow).normalize();


        // Calculate the quaternion for LeftArm rotation
        initialRightArmDirection = initialDirections[prefix+'RightArm'].normalize();
        rightArmQuaternion = new THREE.Quaternion().setFromUnitVectors(initialRightArmDirection, upperRightArmDirection);

        $gltf.nodes[prefix+'RightArm'].quaternion.copy(rightArmQuaternion);
        
        // Calculate the quaternion for LeftForeArm rotation relative to LeftArm
        initialRightForeArmDirection = initialDirections[prefix+'RightForeArm'].normalize(); // Initial direction along X-axis
        rightForeArmQuaternion = new THREE.Quaternion().setFromUnitVectors(initialRightForeArmDirection, rightForeArmDirection);
        // $gltf.nodes[prefix+'LeftForeArm'].quaternion.multiply(foreArmQuaternion);
        // Get the current global quaternion of the leftArm
        rightArmGlobalQuaternion = $gltf.nodes[prefix+'RightArm'].getWorldQuaternion(new THREE.Quaternion());

        // Invert the global quaternion of the leftArm to get its "rest" orientation
        invRightArmGlobalQuaternion = rightArmGlobalQuaternion.clone().invert();

        // Apply the inverse quaternion to the target global quaternion to get the local rotation relative to the leftArm
        localRotationRightForeArm = new THREE.Quaternion().multiplyQuaternions(invRightArmGlobalQuaternion, rightForeArmQuaternion);

        // Now apply this local rotation to the leftForeArm's quaternion
        $gltf.nodes[prefix+'RightForeArm'].quaternion.copy(localRotationRightForeArm);

      
        if(!consoled){
          consoled = true
        } 
      }
  })
  
  $: if ($gltf) {
		
    Object.keys($gltf.nodes).map((n) => {
      if ($gltf.nodes[n].type == 'Bone') {
        if ($gltf.nodes[n].children.length > 0) {
          // Assuming the first child gives the correct direction
          const childBone = $gltf.nodes[n].children[0];

          // Calculate the direction vector from the bone to its child
          const direction = new THREE.Vector3()
            .subVectors(childBone.position, $gltf.nodes[n].position)
            .clone()
            .normalize();

          // Store this initial direction with the bone name as the key
          initialDirections[n] = direction;
        } else {
          // console.log('-- no --children')
        }
      }
    });
    // console.log(initialDirections[prefix + 'LeftArm']);
    // console.log(initialDirections[prefix + 'LeftForeArm']);
}

</script>

<T.PerspectiveCamera
  makeDefault
  position={[0, 9, 30]}
  on:create={({ ref }) => {
    ref.lookAt(0, 9, 0)
  }}
>
  <OrbitControls />
</T.PerspectiveCamera>

<T.DirectionalLight position={[3, 10, 7]} intensity={0.8} />
<T.AmbientLight intensity={0.2} />

{#if $gltf}
<T is={$gltf.nodes['Scene']} scale={9} position={[0,0,0]} bind:skeleton={skeleton} />
{/if}