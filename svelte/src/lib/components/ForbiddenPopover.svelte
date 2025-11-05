<script>
  import { Menu } from '@lucide/svelte';
  import * as Select from '$lib/components/ui/select/index.js';

  let { users, id } = $props();

  let selectOpen = $state(false);
</script>

<Select.Root type="multiple" bind:open={selectOpen}>
  <Select.Trigger>
    <Menu />
  </Select.Trigger>
  <Select.Content>
    {#each users.filter((u) => u.id !== id) as { id, name, forbidden } (id)}
      <Select.Item value={id} disabled={forbidden.includes(id)}>{name}</Select.Item>
    {/each}
  </Select.Content>
</Select.Root>
