<script>
    import { T, useFrame } from '@threlte/core'
    import { useGltf, OrbitControls } from '@threlte/extras'
    export let keypoints = []
    const gltf = useGltf('/model.glb')

    const CONFIDENCE = 0.3

    const getAngle = (p1, p2, c1, c2, m) => {
        if(p1['score'] > CONFIDENCE && p2['score'] > CONFIDENCE){
        return (Math.atan2(p2['position']['y'] - p1['position']['y'], p2['position']['x'] - p1['position']['x']) + c1) * m;
        }
        return c2 * m
    }
    
    const normalize = (min, max, val) => {
        return ((val - min) / (max - min))* Math.PI;
    }
    useFrame(()=>{
        if($gltf && keypoints.length){

            // $gltf.nodes.mixamorigLeftArm.rotation.y = getAngle(keypoints[7], keypoints[5], 0, 0, -1)

            // Left arm & elbow
            $gltf.nodes.mixamorigLeftArm.rotation.y  = getAngle(keypoints[5], keypoints[7], 0, 0, -1)
            $gltf.nodes.mixamorigLeftForeArm.rotation.x  = getAngle(keypoints[7], keypoints[9], 0, 0, 1)

            
            //Right arm & elbow
            $gltf.nodes.mixamorigRightArm.rotation.y = getAngle(keypoints[8], keypoints[6], 0, 0, -1)
            $gltf.nodes.mixamorigRightForeArm.rotation.x = getAngle(keypoints[10], keypoints[8], 0, 0, -1)
            /*
            // Left leg & knee
            nodes.Ch36.skeleton.bones[55].rotation.z =  getAngle(kp[11], kp[13], (Math.PI/2), Math.PI, -1)
            //nodes.Ch36.skeleton.bones[56].rotation.z = getAngle(kp[15], kp[13], (Math.PI/2), 0, -1)

            // Right leg & knee
            nodes.Ch36.skeleton.bones[60].rotation.z =  getAngle(kp[12], kp[14], (Math.PI/2), Math.PI, -1)
            //nodes.Ch36.skeleton.bones[61].rotation.z = getAngle(kp[16], kp[14], (Math.PI/2), 0, -1)

            // Head
            nodes.Ch36.skeleton.bones[5].rotation.y = getYRotation(kp[1], kp[2], kp[0])
            nodes.Ch36.skeleton.bones[5].rotation.z = getZRotation(kp[1], kp[2])
            */
        }
    })
    $: if($gltf){
        // console.log($gltf.nodes)
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
  <T is={$gltf.nodes['Scene']} scale={9} position={[0,-9,0]} />
{/if}