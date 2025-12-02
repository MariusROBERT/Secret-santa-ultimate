<script lang="ts">
  import '../app.css';
  import * as Card from '$lib/components/ui/card/index.js';
  import favicon from '$lib/assets/favicon.svg';
  import AnimationFrameSnow from '$lib/components/AnimationFrameSnow.svelte';

  let { children } = $props();
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
  <title>Secret Santa</title>
</svelte:head>

<div class="relative bg-linear-180 from-[#F00] to-[#9A0000] overflow-hidden w-screen h-screen flex items-center justify-center">
  <AnimationFrameSnow />

  <Card.Root class="shadow-2xl z-5 m-2 sm:m-8 min-w-fit">
    <Card.Content class="sm:px-6 px-2">
      {@render children()}
    </Card.Content>
  </Card.Root>
</div>
