import adapter from '@sveltejs/adapter-static';
import preprocess from 'svelte-preprocess'
import seqPreprocessor from 'svelte-sequential-preprocessor'
// import { preprocessThrelte } from '@threlte/preprocess'

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
   	 adapter: adapter({
   		 trailingSlash: 'always'
   	 })
    },
    preprocess: seqPreprocessor([preprocess()])
};

export default config;
