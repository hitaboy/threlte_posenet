<script>
	import { T, useFrame } from '@threlte/core';
	import { useGltf, OrbitControls } from '@threlte/extras';
	import { Quaternion, Vector3 } from 'three';
	export let poses = [];
	const gltf = useGltf('/model2.glb');

	let skeleton;
	let consoled = false;
  let bones = []
	let ready = false
  function mapBones() {
    console.log($gltf.nodes)
    Object.keys($gltf.nodes).map(key=>{
      if($gltf.nodes[key].isBone != undefined){
        let bone = {}
        bone.key = key
        if(key == "mixamorigLeftShoulder"){ 
          bone.point = 11 
          bone.sx = 1
          bone.sy = 1
          bone.sz = 1
        }
        // if(key == "mixamorigRightShoulder"){ bone.point = 12 }
        if(key == "mixamorigLeftArm"){ 
          bone.point = 11 
          bone.sx = 7
          bone.sy = 200
          bone.sz = 1
        }
        // if(key == "mixamorigRightArm"){ bone.point = 12 }
        if(key == "mixamorigLeftForeArm"){ 
          bone.point = 13 
          bone.sx = 2
          bone.sy = 1
          bone.sz = 1
        }
        // if(key == "mixamorigRightForeArm"){ bone.point = 14 }
        if(key == "mixamorigLefthand"){ 
          bone.point = 15 
          bone.sx = 5
          bone.sy = 1
          bone.sz = 1
        }
        // if(key == "mixamorigRighthand"){ bone.point = 16 }
        bone.x = $gltf.nodes[key].position.x
        bone.y = $gltf.nodes[key].position.y
        bone.z = $gltf.nodes[key].position.z
        bones.push(bone)
      }
    })
    ready = true
  }

	useFrame(() => {
		if (poses.length>32) {
			if (!consoled) {
				consoled = true;
        console.log(poses[11].x);
				mapBones();
			}
      if(ready){
        bones.map(b=>{
          if(typeof poses[b.point]!='undefined'){
            $gltf.nodes[b.key].position.x = b.x // poses[b.point].z*b.x*b.sz // Això és la puta Z
            $gltf.nodes[b.key].position.y = poses[b.point].x*b.y*b.sx // Això és la puta X
            $gltf.nodes[b.key].position.z = b.z+(poses[b.point].y*b.sy) // Això és la puta Y
            // poses[b.point].x*100
            // poses[b.point].z*100
            // poses[b.point].y
          }
        })
      }
		}
	});
	$: if ($gltf) {
		// console.log($gltf);
	}
</script>

<T.PerspectiveCamera
	makeDefault
	position={[0, 0, 30]}
	on:create={({ ref }) => {
		ref.lookAt(0, 0, 0);
	}}
>
	<OrbitControls />
</T.PerspectiveCamera>

<T.DirectionalLight position={[3, 10, 7]} />

{#if $gltf}
	<T is={$gltf.nodes['Scene']} scale={9} position={[0, -9, 0]} bind:skeleton />
{/if}
