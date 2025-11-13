<script>
  import { Button } from '$lib/components/ui/button/index.js';
  import { page } from '$app/state';
  import { ExternalLink } from '@lucide/svelte';
  import * as Table from '$lib/components/ui/table/index.js';
  import * as HoverCard from '$lib/components/ui/hover-card/index.js';
  import ForbiddenPopover from '$lib/components/ForbiddenPopover.svelte';
  import { goto } from '$app/navigation';

  let justCopied = $state(false);
  let code = $derived(page.params.code.toUpperCase());

  let { data } = $props();

  function copyLink() {
    navigator.clipboard.writeText(window.location.toString());
    justCopied = true;
    setTimeout(() => {
      justCopied = false;
    }, 1000);
  }

  $effect(() => {
    if (code.length !== 6)
      goto('/');
  });
</script>


<div class="flex flex-col text-center items-center gap-4 m-8">
  <h1 class="text-3xl font-bold">{data.name}</h1>
  <Button class="w-24" variant="ghost" onclick={copyLink}>
    {#if (justCopied)}
      Copied
    {:else}
      {code}
      <ExternalLink />
    {/if}
  </Button>

  <div class="rounded-md border">
    <Table.Root>
      <Table.Header>
        <Table.Row>
          <Table.Head>
            Name
          </Table.Head>
          <Table.Head>
            Mail
          </Table.Head>
          <Table.Head>
            <HoverCard.Root>
              <HoverCard.Trigger>Forbidden</HoverCard.Trigger>
              <HoverCard.Content>
                A list of user this user won't be able to gift
              </HoverCard.Content>
            </HoverCard.Root>
          </Table.Head>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {#each data.users as { name, id, email, forbidden } (id)}
          <Table.Row>
            <Table.Cell>
              {name}
            </Table.Cell>
            <Table.Cell>
              {email}
            </Table.Cell>
            <Table.Cell>
              <ForbiddenPopover users={data.users} id={id} />
            </Table.Cell>
          </Table.Row>
        {/each}
      </Table.Body>
    </Table.Root>
  </div>
</div>


