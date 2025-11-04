<script lang="ts">
  import '../app.css';
  import * as Card from "$lib/components/ui/card/index.js";
  import favicon from '$lib/assets/favicon.svg';
  import Particles from '@tsparticles/svelte';

  let { children } = $props();

  const particlesConfig = {
    background: {
      color: {
        value: "rgb(255,0,0)",
      },
    },
    fpsLimit: 60,
    particles: {
      color: {
        value: "#fff",
      },
      move: {
        direction: "bottom",
        enable: true,
        random: true,
        speed: 5,
      },
      number: {
        value: 150,
      },
      opacity: {
        value: 0.5,
      },
      shape: {
        type: "circle",
      },
      size: {
        value: {min: 1, max: 5},
      },
    },
    detectRetina: true,
  }
</script>

<svelte:head>
    <link rel="icon" href={favicon} />
</svelte:head>

<div class="w-scren h-screen flex items-center justify-center">
  <Particles
    id="tsparticles"
    class="z-0"
    options={particlesConfig}
  />
  <Card.Root class="shadow-2xl z-5">
    <Card.Content>
      {@render children()}
    </Card.Content>
  </Card.Root>
</div>
