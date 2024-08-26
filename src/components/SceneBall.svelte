<script>
	import { T, useFrame } from '@threlte/core';
	import { useGltf, OrbitControls } from '@threlte/extras';
	import { Group, Quaternion, Vector3 } from 'three';
	export let poses = {};
	// const gltf = useGltf('/model2.glb')

	export let videoWidth = 0;
	export let videoHeight = 0;
	export let cameraZ = 45;

  

	let consoled = false;

	function midpoint(p1, p2) {
		return new Vector3((p1.x + p2.x) / 2, (p1.y + p2.y) / 2, (p1.z + p2.z) / 2);
	}

	useFrame(() => {
		if (poses.hasOwnProperty('keypoints')) {
			if (!consoled) {
				consoled = true;
				console.log(poses);
			}
		}
	});
</script>

<T.PerspectiveCamera
	makeDefault
	position={[0, 0, cameraZ]}
	on:create={({ ref }) => {
		ref.lookAt(0, 0, 0);
	}}
>
	<OrbitControls />
</T.PerspectiveCamera>

<T.DirectionalLight position={[3, 10, 7]} />

<T.Group scale={30}>
	{#if poses.hasOwnProperty('keypoints')}
		{#each poses.keypoints3D as pos}
			<T.Mesh position.x={pos.x} position.y={pos.y * -1} position.z={pos.z}>
				<T.SphereGeometry args={[0.01, 10, 10]} />
				<T.MeshStandardMaterial color="hotpink" />
			</T.Mesh>
		{/each}
	{/if}
</T.Group>
