<script>
	import { Canvas } from '@threlte/core';
	import SceneOriginal from '@comp/SceneOriginal.svelte';
	
	import * as poseDetection from '@tensorflow-models/pose-detection';
	import '@tensorflow/tfjs-core';
	// Register WebGL backend.
	import '@tensorflow/tfjs-backend-webgl';
	import '@mediapipe/pose';
	// import * as tf from '@tensorflow/tfjs';
	// import '@tensorflow/tfjs-backend-webgl';
	// import * as posenet from '@tensorflow-models/posenet';
	import { onMount } from 'svelte';
	
	let models = [
		{
			label: 'Mixamo',
			type: 'mixamo',
			file: 'model2.glb'
		},
		{
			label: 'Ready Player Me',
			type: 'readyplayerme',
			file: 'ReadyPlayerMe_66cc6c875071a1bbc6199b10.glb'
		}
	]
	let consoled = false
	let activeModel = 0
	let videoWidth = 0
	let videoHeight = 0
	let w,
		h = 0;
	let videoSource = null;
	let canvas;
	let showCanvas = true;
	let poses = []
	let detector
	let debug = false

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
		if(!consoled){
          console.log(poses)
          consoled = true
        } 
		requestAnimationFrame(update);
	}

	onMount(() => {
		getVideoCamara();
	});

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
			{#key activeModel}
				<SceneOriginal poses={poses[0]?.keypoints3D} model={models[activeModel]} />
			{/key}
		</Canvas>
	</div>
	{/if}
</div>

<div class="options">
	Debug {debug?'active':'inactive'}
	<button on:click={getVideoCamara}>Restart Cam</button>	
	{#each models as model, i}
		<button on:click={()=>{ activeModel = i; }}>{model.label}</button>	
	{/each}
	<div class="">
		{models[activeModel].label}
	</div>
	<div>
		
	</div>
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
		/* transform: scaleX(-100%); */
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
		bottom: 4px;
		left: 4px;
		display: flex;
		align-items: center;
		gap: 10px;
		font-family: Arial, Helvetica, sans-serif;
		background: rgba(0,0,0,0.75);
		color: #fff;
		font-size: 12px;
		font-weight: bold;
		padding: 10px 15px;
		border-radius: 5px;
	}
	.threlte {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
	}
</style>
