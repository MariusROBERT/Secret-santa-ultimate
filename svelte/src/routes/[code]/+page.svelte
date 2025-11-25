<script>
  import { Button } from '$lib/components/ui/button/index.js';
  import { page } from '$app/state';
  import { ExternalLink } from '@lucide/svelte';
  import * as Table from '$lib/components/ui/table/index.js';
  import * as HoverCard from '$lib/components/ui/hover-card/index.js';
  import * as Popover from '$lib/components/ui/popover/index.js';
  import ForbiddenPopover from '$lib/components/ForbiddenPopover.svelte';
  import { goto } from '$app/navigation';
  import { Input } from '$lib/components/ui/input/index.js';
  import { fromDate, getLocalTimeZone, today } from '@internationalized/date';
  import { Calendar } from '@/components/ui/calendar/index.js';
  import { Label } from '@/components/ui/label/index.js';

  let justCopied = $state(false);
  let code = $derived(page.params.code.toUpperCase());
  let isCalendarPopoverOpen = $state(false);

  let { data } = $props();

  let users = $state(data.users);
  let mailDate = $state(fromDate(new Date(data.mailDate)));

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

  let newUser = $state({ name: undefined, mail: undefined });

  function addUser() {
    if (!newUser.name || !newUser.mail)
      return;
    fetch(`/api/v1/santa/${page.params.code}/users`, {
      method: 'POST',
      body: JSON.stringify(newUser),
    }).then(res => res.json()).then(res => {
      newUser = { name: undefined, mail: undefined };
      users.push(res);
    });
  }

  function deleteUser(id) {
    fetch(`/api/v1/users/${id}`, {
      method: 'DELETE',
    }).then(res => res.json())
      .then(res => {
        if (res.id === id)
          users = users.filter((user) => user.id !== id);
      });
  }

  let timer = $state();
  let originalMailDate = $state(mailDate);

  function updateMailDate() {
    // Debounced value
    clearTimeout(timer);
    timer = setTimeout(() => {
      if (Number(originalMailDate.toDate(getLocalTimeZone())) === Number(mailDate.toDate(getLocalTimeZone())))
        return;
      fetch(`/api/v1/santa/${code}`, {
        method: 'PATCH',
        body: JSON.stringify({ mailDate: Number(mailDate.toDate(getLocalTimeZone())) }),
      }).then(() => originalMailDate = mailDate);
    }, 750);
  }
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

  <div class="flex gap-1 w-fit">
    <Label for="mailDate" class="whitespace-nowrap">Mail sent date</Label>
    <Popover.Root bind:open={isCalendarPopoverOpen}>
      <Button
        variant="ghost"
        class="w-full text-black relative justify-between font-normal"
        id="mailDate"
        onclick={() => isCalendarPopoverOpen = !isCalendarPopoverOpen}
      >
        <Popover.Trigger class="bottom-0 left-0 absolute" />
        {mailDate.toDate(getLocalTimeZone()).toLocaleDateString()}
      </Button>

      <Popover.Content class="w-auto mx-auto overflow-hidden p-0" align="start">
        <Calendar
          type="single"
          bind:value={mailDate}
          captionLayout="dropdown"
          onValueChange={() => {
            isCalendarPopoverOpen = false;
            updateMailDate();
          }}
          minValue={today(getLocalTimeZone())}
        />
      </Popover.Content>
    </Popover.Root>
  </div>

  <div class="rounded-md border">
    <Table.Root>

      <!-- Header -->
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
        <!-- Existing users -->
        {#each users as { name, id, email, forbidden } (id)}
          <Table.Row class="group">
            <Table.Cell>
              {name}
            </Table.Cell>
            <Table.Cell>
              {email}
            </Table.Cell>
            <Table.Cell>
              <ForbiddenPopover users={users} id={id} />
            </Table.Cell>
            <Table.Cell class="px-0 group-hover:opacity-100 opacity-0">
              <Button onclick={() => deleteUser(id)}>
                X
              </Button>
            </Table.Cell>
          </Table.Row>
        {/each}

        <!-- New user -->
        <Table.Row>
          <Table.Cell>
            <Input bind:value={newUser.name} />
          </Table.Cell>
          <Table.Cell>
            <Input bind:value={newUser.mail} />
          </Table.Cell>
          <Table.Cell>
            <Button onclick={addUser}>Add user</Button>
          </Table.Cell>
        </Table.Row>

      </Table.Body>
    </Table.Root>
  </div>
</div>


