<script>
  import { Menu } from '@lucide/svelte';
  import * as Select from '$lib/components/ui/select/index.js';

  let { users, id } = $props();

  let selectOpen = $state(false);
  let timer;
  let forbidden = $state(users.find((u) => u.id === id).forbidden);
  let originalForbidden = $state(forbidden);

  $effect(() => {
    users.find((u) => u.id === id).forbidden = forbidden;

    // Debounced value
    clearTimeout(timer);
    timer = setTimeout(() => {
      if (JSON.stringify(originalForbidden.sort()) === JSON.stringify(forbidden.sort())) // Deep equal ignoring order
        return;
      fetch(`/api/v1/users/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ forbidden }),
      }).then(() => originalForbidden = forbidden);
    }, 750);
  });
</script>

<Select.Root type="multiple" bind:open={selectOpen} bind:value={forbidden}>
  <Select.Trigger disabled={users.length === 1}>
    <Menu />
  </Select.Trigger>
  <Select.Content>
    {#each users.filter((u) => u.id !== id) as { id, name, forbidden } (id)}
      <Select.Item value={id} disabled={forbidden.includes(id)}>{name}</Select.Item>
    {/each}
  </Select.Content>
</Select.Root>
