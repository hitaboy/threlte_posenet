<script>
	import { Canvas } from '@threlte/core'
	import Scene from '@comp/Scene.svelte';
	  // import * as poseDetection from '@tensorflow-models/pose-detection';
	  import * as tf from '@tensorflow/tfjs';
	import '@tensorflow/tfjs-backend-webgl';
	  import * as posenet from '@tensorflow-models/posenet';
	  import { onMount } from 'svelte';
	  import { drawKeypoints, drawSkeleton } from '../utils/utils';
  
	  let w,h = 0
	  let videoSource = null;
	  let canvas;
		let keypoints = []
	  let showCanvas = true;
  
	  const runPosenet = async () => {
		  tf.setBackend('webgl')
		  const net = await posenet.load({
			  inputResolution: { width: 340, height: 280 },
			  scale: 0.05
		  });
		  //
		  setInterval(() => {
			  detect(net);
		  }, 100);
	  };
  
	  const detect = async (net) => {
		  if (
			  typeof videoSource !== 'undefined' &&
			  videoSource !== null &&
			  videoSource.readyState === 4
		  ) {
			  // Get Video Properties
			  const video = videoSource;
			  const videoWidth = videoSource.videoWidth;
			  const videoHeight = videoSource.videoHeight;
  
			  // Set video width
			  videoSource.width = videoWidth;
			  videoSource.height = videoHeight;
  
			  // Make Detections
			  const pose = await net.estimateSinglePose(video);
				keypoints = pose.keypoints;
			  if(showCanvas){
				  drawCanvas(pose, videoWidth, videoHeight, canvas);
			  }
		  }
	  };
  
	  const drawCanvas = (pose, videoWidth, videoHeight, canvas) => {
		  const ctx = canvas.getContext('2d');
		  canvas.width = videoWidth;
		  canvas.height = videoHeight;
  
		  drawKeypoints(pose['keypoints'], 0.6, ctx);
		  drawSkeleton(pose['keypoints'], 0.7, ctx);
	  };
  
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
  
			  runPosenet();
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
	  <div class="threlte">
		<Canvas dpr={1.0} size={{ width: w, height: h }}>
		  <Scene {keypoints} />
		</Canvas>
	  </div>
  </div>
  
  <div class="options">
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
  