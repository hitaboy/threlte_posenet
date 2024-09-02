<script>
	import { T, useFrame } from '@threlte/core';
	import { useGltf, OrbitControls } from '@threlte/extras';
	import { Group, Quaternion, Vector3 } from 'three';
	import { getMidpoint } from '@lib/utils.js'
	export let poses = {};
	// const gltf = useGltf('/model2.glb')

	export let videoWidth = 0;
	export let videoHeight = 0;
	export let cameraZ = 45;

	let consoled = false;
	let neck = new Vector3(0, 0, 0);
	
	useFrame(() => {
		if (poses.hasOwnProperty('keypoints')) {
			neck = getMidpoint(poses.keypoints3D[11],poses.keypoints3D[12])
			if (!consoled) {
				consoled = true;
				console.log(neck)
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

<T.Group scale={20}>
	{#if poses.hasOwnProperty('keypoints')}
		<T.Mesh position.x={neck.x} position.y={neck.y * -1} position.z={neck.z}>
			<T.SphereGeometry args={[0.01, 10, 10]} />
			<T.MeshStandardMaterial color="red" />
		</T.Mesh>
		{#each poses.keypoints3D as pos}
			<T.Mesh position.x={pos.x} position.y={pos.y * -1} position.z={pos.z}>
				<T.SphereGeometry args={[0.01, 10, 10]} />
				<T.MeshStandardMaterial color="blue" />
			</T.Mesh>
		{/each}
	{/if}
</T.Group>
