<script>
	import { Canvas } from '@threlte/core';
	import SceneOriginal from '@comp/SceneOriginal.svelte';
	import {
		PoseLandmarker,
		FilesetResolver,
		DrawingUtils
	} from "https://cdn.skypack.dev/@mediapipe/tasks-vision@0.10.15";
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
	let videoSource = null;
	let poses = []
	let detector
	let poseLandmarker = undefined;
	let runningMode = "IMAGE";
	let enableWebcamButton;
	let webcamRunning = false;
	const videoHeight = "360px";
	const videoWidth = "480px";

	const runMediaPipe = async ()=> {
		// Before we can use PoseLandmarker class we must wait for it to finish
		// loading. Machine Learning models can be large and take a moment to
		// get everything needed to run.
		const createPoseLandmarker = async () => {
		const vision = await FilesetResolver.forVisionTasks(
			"https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.15/wasm"
		);
		poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
			baseOptions: {
			modelAssetPath: `https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task`,
			delegate: "GPU"
			},
			runningMode: runningMode,
			numPoses: 2
		});
		demosSection.classList.remove("invisible");
		};
		createPoseLandmarker();

	}

	async function update(){
		poses = await detector.estimatePoses(videoSource);
		if(!consoled){
          console.log(poses[0])
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

			runMediaPipe()
		} catch (error) {
			console.log(error);
		}
	};
</script>