import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
	plugins: [sveltekit()], 
	ssr: {
		noExternal: ['three']
	},
	resolve: {
		alias: {
			'@lib': path.resolve('./src/lib'),
			'@comp': path.resolve('./src/components'),
			'@stores': path.resolve('./src/stores')
		}
	},
});
