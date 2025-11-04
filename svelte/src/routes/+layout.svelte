<script lang="ts">
  import '../app.css';
  import * as Card from "$lib/components/ui/card/index.js";
  import favicon from '$lib/assets/favicon.svg';

  let { children } = $props();
</script>

<svelte:head>
    <link rel="icon" href={favicon} />
</svelte:head>

<div class="w-scren h-screen flex items-center justify-center bg-red-500">
  <Card.Root class="shadow-2xl">
    <Card.Content>
      {@render children()}
    </Card.Content>
  </Card.Root>
</div>
