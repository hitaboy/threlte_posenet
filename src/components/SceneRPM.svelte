<script>
	
    import { T, useFrame } from '@threlte/core'
    import { useGltf, OrbitControls } from '@threlte/extras'
    import { Quaternion, Vector3 } from 'three';
    export let poses = []
    const gltf = useGltf('/ReadyPlayerMe_66cc6c875071a1bbc6199b10.glb')

    let skeleton
    let consoled = false

    function updateBoneRotation(boneName, s_x, s_y, s_z, e_x, e_y, e_z){
      const start = new Vector3(s_x * 2 - 1, -(s_y * 2 - 1), s_z);
      const end = new Vector3(e_x * 2 - 1, -(e_y * 2 - 1), e_z);
      const direction = new Vector3().subVectors(end, start).normalize();
      const defaultDirection = new Vector3(0, 1, 0);
      const quaternion = new Quaternion().setFromUnitVectors(defaultDirection, direction);
      if(boneName == ''){
        return quaternion
      }else{
        $gltf.nodes[boneName].quaternion.copy(quaternion)
      }
    }

    function midpoint(p1,p2) {
      return new Vector3((p1.x + p2.x) / 2,(p1.y + p2.y) / 2,(p1.z + p2.z) / 2)
    }

    function position(boneName, pos, mul) {
      $gltf.nodes[boneName].position.x = pos.x*mul
      $gltf.nodes[boneName].position.y = pos.y*mul
      $gltf.nodes[boneName].position.z = pos.z*mul
    }

    let neck
    let eyes
    let eyes_neck
    let leftHand
    let rightHand
    let neckQuaternion
    let headQuaternion
    let hips
    let scoreThreshold = 0.5
    
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
          if(checkScoreTreshold([11,13])){
            updateBoneRotation('LeftArm', poses[11].z, poses[11].x*-1, poses[11].y, poses[13].z, poses[13].x*-1, poses[13].y);
          }
          if(checkScoreTreshold([13,15])){
            updateBoneRotation('LeftForeArm', poses[13].z, poses[13].x*-1, poses[13].y, poses[15].z, poses[15].x*-1, poses[15].y);
          }
          if(checkScoreTreshold([12,14])){
            updateBoneRotation('RightArm', poses[12].z*-1, poses[12].x, poses[12].y, poses[14].z*-1, poses[14].x, poses[14].y);
          }
          if(checkScoreTreshold([14,16])){
            updateBoneRotation('RightForeArm', poses[14].z*-1, poses[14].x, poses[14].y, poses[16].z*-1, poses[16].x, poses[16].y);
          }

          if(checkScoreTreshold([11,12])){
            neck = midpoint(poses[11],poses[12])
          }
          if(checkScoreTreshold([5,2])){
            eyes = midpoint(poses[5],poses[2])
          }
          if(checkScoreTreshold([17,19])){
            leftHand = midpoint(poses[17],poses[19])
          }
          if(checkScoreTreshold([20,18])){
            rightHand = midpoint(poses[20],poses[18])
          }
          if(checkScoreTreshold([5,2,11,12])){
            eyes_neck = midpoint(eyes,neck)
          }
          if(checkScoreTreshold([24,23])){
            hips = midpoint(poses[24],poses[23])
          }
          
          if(checkScoreTreshold([11,12,0])){
            updateBoneRotation('Neck', neck.x, neck.y, neck.z*-1, poses[0].x, poses[0].y, poses[0].z*-1);
          }
          if(checkScoreTreshold([5,2])){
            $gltf.nodes['Head'].rotation.y = 2*Math.PI+Math.PI*(eyes.x*2)
            if(checkScoreTreshold([11,12])){
              $gltf.nodes['Head'].rotation.x = Math.PI-Math.PI/(eyes_neck.y*2)-0.5
            }
          }
          
          
          // $gltf.nodes['Neck'].quaternion.copy(neckQuaternion.multiply(headQuaternion))
          if(checkScoreTreshold([24,23,11,12])){
            updateBoneRotation('Spine', hips.x, hips.y, hips.z, neck.x, neck.y, neck.z);
            updateBoneRotation('Spine1', hips.x, hips.y, hips.z, neck.x/2, neck.y/2, neck.z/2);
            updateBoneRotation('Spine2', hips.x, hips.y, hips.z, neck.x/4, neck.y/4, neck.z/4);
          }
          // $gltf.nodes['Spine'].rotation.y = Math.PI/(hips.x*10000)
          
          // updateBoneRotation('LeftUpLeg', 0, -1, 0, 0, 0, 0);
          if(checkScoreTreshold([23,25])){
            updateBoneRotation('LeftUpLeg', poses[23].x, poses[23].y, poses[23].z/30, poses[25].x, poses[25].y, poses[25].z/30);
          }
          if(checkScoreTreshold([25,27])){
            updateBoneRotation('LeftLeg', poses[25].x*-1, poses[25].y, poses[25].z*-1, poses[27].x*-1, poses[27].y/20, poses[27].z*-1);
          }
          // position('LeftLeg', poses[25], 140)
          // position('Spine', hips, 200)

          if(checkScoreTreshold([24,26])){
            updateBoneRotation('RightUpLeg', poses[24].x, poses[24].y, poses[24].z/30, poses[26].x, poses[26].y, poses[26].z/30);
          }
          if(checkScoreTreshold([26,28])){
            updateBoneRotation('RightLeg', poses[26].x*-1, poses[26].y, poses[26].z*-1, poses[28].x*-1, poses[28].y/20, poses[28].z*-1);
          }
          // updateBoneRotation('RightUpLeg', poses[24].z, poses[24].x*-1, poses[24].y, poses[26].z, poses[26].x*-1, poses[26].y);
          // updateBoneRotation('RightLeg', poses[26].z, poses[26].x*-1, poses[26].y, poses[28].z, poses[28].x*-1, poses[28].y);
          
          // updateBoneRotation('LeftHand', poses[15].x, poses[15].y, poses[15].z, leftHand.x, leftHand.y, leftHand.z);
          // updateBoneRotation('RightHand', poses[16].x, poses[16].y, poses[16].z, rightHand.x, rightHand.y, rightHand.z);

          // $gltf.nodes['Head'].position.y = poses[0].y*-20
          // updateBoneRotation('Spine', poses[11].x, 0, poses[11].z, poses[12].x, 0, poses[12].z);

          if(!consoled){
            consoled = true
            console.log(poses)
          } 
        }
    })
    $: if($gltf){
        // console.log($gltf)
        // $gltf.materials.Beta_HighLimbsGeoSG3.wireframe = true
        // $gltf.materials.Beta_Joints_MAT1.wireframe = true
        // $gltf.nodes['LeftShoulder'].visible = false
        // $gltf.nodes['RightShoulder'].visible = false
        // $gltf.nodes['Beta_Joints'].visible = false
    }
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
  
  <T.DirectionalLight position={[3, 10, 7]} />
  
{#if $gltf}
  <T is={$gltf.nodes['Scene']} scale={9} position={[0,-9,0]} bind:skeleton={skeleton} />
{/if}