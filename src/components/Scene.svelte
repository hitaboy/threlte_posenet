<script>
	
    import { T, useFrame } from '@threlte/core'
    import { useGltf, OrbitControls } from '@threlte/extras'
    import { Quaternion, Vector3 } from 'three';
    import { getMidpoint } from '@lib/utils.js'
    
    export let poses = []
    export let model

    const gltf = useGltf('/'+model.file)
    let skeleton
    let consoled = false
    let neckBase
    let scoreThreshold = 0.5
    let initialDirections = {}

    let prefix = ''
    if(model.type == 'mixamo'){
      prefix = prefix+'mixamorig'
    }

    function updateBoneRotation(boneName, s, e){
      const direction = new Vector3(
        e.x - s.x,
        e.y - s.y,
        e.z - s.z
      ).normalize();
      const defaultDirection = new Vector3(initialDirections[boneName].x,initialDirections[boneName].y,initialDirections[boneName].z);
      const quaternion = new Quaternion().setFromUnitVectors(defaultDirection, direction);
      $gltf.nodes[boneName].quaternion.copy(quaternion)
    }

    function updateBoneRotation2(boneName, s_x, s_y, s_z, e_x, e_y, e_z){
      const start = new Vector3(s_x * 2 - 1, -(s_y * 2 - 1), s_z);
      const end = new Vector3(e_x * 2 - 1, -(e_y * 2 - 1), e_z);
      const direction = new Vector3().subVectors(end, start).normalize();
      const defaultDirection = new Vector3(initialDirections[boneName].x,initialDirections[boneName].y,initialDirections[boneName].z);
      const quaternion = new Quaternion().setFromUnitVectors(defaultDirection, direction);
      $gltf.nodes[boneName].quaternion.copy(quaternion)
    }

    function updateNeck(){
      // neckBase : LeftShoulder - RightShoulder
      neckBase = getMidpoint(poses[11],poses[12])

      // Girar amunt i avall
      let initRotationX = new Vector3(1,0,0)
      // let quaternionRotationX = new Quaternion().setFromAxisAngle(initRotationX, -Math.PI / 1.6- ( Math.PI * poses[0].y*-2));
      let quaternionRotationX = new Quaternion().setFromAxisAngle(initRotationX, (Math.PI * poses[0].y*3.1) - 0.3);

      // Girar lateralment
      let initRotationY = new Vector3(0,1,0)
      let quaternionRotationY = new Quaternion().setFromAxisAngle(initRotationY, Math.PI * poses[0].x*3.1);
      
      // Torçar lateralment
      let initRotationZ = new Vector3(0,0,1)
      let quaternionRotationZ = new Quaternion().setFromAxisAngle(initRotationZ, Math.PI * poses[0].x*-1.1 );
      //  - ( Math.PI * poses[0].z*-1 )

      $gltf.nodes[prefix+'Neck'].quaternion.copy(quaternionRotationX).premultiply(quaternionRotationY).premultiply(quaternionRotationZ)
      
    }

    function updateArms(){

      let leftShoulder = {x: poses[11].z, y: poses[11].x, z: poses[11].y}
      let leftElbow = {x: poses[13].z, y: poses[13].x, z: poses[13].y}
      updateBoneRotation(prefix+'LeftArm', leftShoulder, leftElbow);

      let leftElbowToWrist = {x: poses[13].x, y: poses[13].y, z: poses[13].z*-1}
      let leftWrist = {x: poses[15].x, y: poses[15].y, z: poses[15].z*-1}
      updateBoneRotation(prefix+'LeftForeArm', leftElbowToWrist, leftWrist);
      
      let rightShoulder = {x: poses[12].y, y: poses[12].x*-1, z: poses[12].x}
      let rightElbow = {x: poses[14].y, y: poses[14].x*-1, z: poses[14].x}
      updateBoneRotation(prefix+'RightArm', rightShoulder, rightElbow);
      
    }

    function checkScoreTreshold(poses_indexes){
      let scoreApproved = true
      poses_indexes.map(pi=>{
        if(poses[pi].score<scoreThreshold){
          scoreApproved = false
        }
      })
      return scoreApproved
    }



    useFrame(()=>{
        if($gltf && poses.length){
          if(checkScoreTreshold([11,12,10,9,5,2])){
            updateNeck();
          }
          if(checkScoreTreshold([11,13,15])){
            updateArms();
          }
          // updateBoneRotation2(prefix+'LeftArm', poses[11].z, poses[11].x*-1, poses[11].y, poses[13].z, poses[13].x*-1, poses[13].y);
          // updateBoneRotation2(prefix+'LeftForeArm', poses[13].z, poses[13].x*-1, poses[13].y, poses[15].z, poses[15].x*-1, poses[15].y);
          // updateBoneRotation2(prefix+'RightArm', poses[12].z*-1, poses[12].x, poses[12].y, poses[14].z*-1, poses[14].x, poses[14].y);
          // updateBoneRotation2(prefix+'RightForeArm', poses[14].z*-1, poses[14].x, poses[14].y, poses[16].z*-1, poses[16].x, poses[16].y);
          if(!consoled){
            consoled = true
            // console.log(initialDirections[prefix+'Neck'], neckDirection)
          } 
        }
    })
    $: if($gltf){
      if(Object.keys(initialDirections).length == 0){
        Object.keys($gltf.nodes).map(n=>{
          if($gltf.nodes[n].type == 'Bone'){
            if($gltf.nodes[n].children.length>0){
              // Assuming the first child gives the correct direction
              const childBone = $gltf.nodes[n].children[0];

              // Calculate the direction vector from the bone to its child
              const direction = new Vector3().subVectors(childBone.position, $gltf.nodes[n].position).clone().normalize();

              // Store this initial direction with the bone name as the key
              initialDirections[n] = direction;
            }else{
              // console.log('-- no --children')
            }
          }
        })    
      }
    }

    const origin = new Vector3( 7, 3, 3 );
    const hex = 0xffff00;

    // $: console.log(keypoints)
  </script>
  
  <T.PerspectiveCamera
    makeDefault
    position={[0, 0, 30]}
    on:create={({ ref }) => {
      ref.lookAt(0, 0, 0)
    }}
  >
    <OrbitControls />
  </T.PerspectiveCamera>
  
  <T.DirectionalLight position={[4, 10, 7]} intensity={0.3} />
  <T.AmbientLight intensity={0.6} />
  
{#if $gltf}
  <T is={$gltf.nodes['Scene']} scale={9} position={[0,-9,0]} bind:skeleton={skeleton} />
{/if}