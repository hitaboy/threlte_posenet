<script>
	import { Canvas } from '@threlte/core';
	import SceneRPM from '@comp/SceneRPM.svelte';
	
	import * as poseDetection from '@tensorflow-models/pose-detection';
	import '@tensorflow/tfjs-core';
	// Register WebGL backend.
	import '@tensorflow/tfjs-backend-webgl';
	import '@mediapipe/pose';
	// import * as tf from '@tensorflow/tfjs';
	// import '@tensorflow/tfjs-backend-webgl';
	// import * as posenet from '@tensorflow-models/posenet';
	import { onMount } from 'svelte';
	import { drawKeypoints, drawSkeleton } from '../../lib/utils';

	let w,
		h = 0;
	let videoSource = null;
	let canvas;
	let showCanvas = true;

	let videoWidth = 0
	let videoHeight = 0

	let poses = []
	let detector
	let debug = 0
	const runMediaPipe = async ()=> {
		videoWidth = videoSource.videoWidth
		videoHeight = videoSource.videoHeight
		const model = poseDetection.SupportedModels.BlazePose;
		const detectorConfig = {
			runtime: 'mediapipe', // or 'tfjs'
			solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/pose',
			modelType: 'full' // lite 3MB, full 6MB, heavy 26MB
		};
		detector = await poseDetection.createDetector(model, detectorConfig);
		update()
	}

	async function update(){
		poses = await detector.estimatePoses(videoSource);
		// debug = poses[0].keypoints[16].x.toFixed(3)
		requestAnimationFrame(update);
	}

	onMount(() => {
		getVideoCamara();
	});

	// ----- //

	const getVideoCamara = async () => {
		try {
			const stream = await navigator.mediaDevices.getUserMedia({
				video: true
			});

			videoSource.srcObject = stream;
			videoSource.play();

			// runPosenet();
			runMediaPipe()
		} catch (error) {
			console.log(error);
		}
	};
</script>

<div class="container" bind:clientWidth={w} bind:clientHeight={h}>
	<video class="video" bind:this={videoSource} />
	{#if showCanvas}
		<canvas
			class="canvas"
			bind:this={canvas}
			style={{
				position: 'relative',
				marginLeft: 'auto',
				marginRight: 'auto',
				left: 0,
				right: 0,
				textAlign: 'center',
				zindex: 9,
				width: 340,
				height: 280
			}}
		/>
	{/if}
	{#if poses.length}
	<div class="threlte">
		<Canvas dpr={1.0} size={{ width: w, height: h }}>
			<SceneRPM poses={poses[0]?.keypoints3D} />
		</Canvas>
	</div>
	{/if}
</div>

<div class="options">
	{debug}
	<button on:click={getVideoCamara}>Restart Cam</button>	
</div>

<style>
	.container {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		display: block;
	}
	.video {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
	}
	.canvas {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		border: 2px solid #fc0;
	}
	.options {
		position: absolute;
		bottom: 10px;
		left: 10px;
	}
	.threlte {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
	}
</style>
