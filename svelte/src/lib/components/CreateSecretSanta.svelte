<script lang="ts">
  import { onMount } from 'svelte';
  import { getLocalTimeZone } from '@internationalized/date';
  import { Input } from '$lib/components/ui/input';
  import * as Popover from '$lib/components/ui/popover/index.js';
  import { Calendar } from '$lib/components/ui/calendar';
  import { Button } from '$lib/components/ui/button';
  import { Label } from '$lib/components/ui/label';
  import { goto } from '$app/navigation';
  import {
    getEarliestDrawingDate,
    getDrawingInstant,
    isFutureDrawingInstant,
  } from '$lib/santaSchedule.js';

  let name: string = $state('');
  let now = $state(new Date());
  let mailDate = $state(getEarliestDrawingDate());
  let formattedMailDate = $derived(getDrawingInstant(mailDate));
  let errorMessage = $state('');

  let isCalendarPopoverOpen = $state(false);

  onMount(() => {
    const interval = setInterval(() => (now = new Date()), 15_000);
    return () => clearInterval(interval);
  });

  async function createSecretSanta() {
    now = new Date();
    if (!isFutureDrawingInstant(formattedMailDate, now.getTime())) {
      errorMessage = 'Choose a drawing date in the future.';
      return;
    }

    errorMessage = '';
    const response = await fetch('/api/v1/santa', {
      method: 'POST',
      body: JSON.stringify({
        name: name,
        date: formattedMailDate,
      }),
    });
    if (!response.ok) {
      errorMessage = 'Choose a drawing date in the future.';
      return;
    }
    const { code } = await response.json();
    goto(`/${code}`);
  }
</script>

<div class="mt-4 flex flex-col justify-evenly gap-3">
  <div class="flex flex-col gap-2">
    <Label for="name">Name</Label>
    <Input class="text-black" bind:value={name} placeHolder="Family Doe" id="name" />
  </div>

  <div class="flex flex-col gap-2">
    <Label for="mailDate">Mail sending date</Label>
    <Button
      variant="outline"
      class="w-full justify-between font-normal text-black"
      id="mailDate"
      onclick={() => {
        now = new Date();
        isCalendarPopoverOpen = !isCalendarPopoverOpen;
      }}
    >
      {mailDate.toDate(getLocalTimeZone()).toLocaleDateString()}
    </Button>
    <Popover.Root bind:open={isCalendarPopoverOpen}>
      <Popover.Trigger />
      <Popover.Content class="mx-auto w-auto overflow-hidden p-0" align="start">
        <Calendar
          type="single"
          bind:value={mailDate}
          captionLayout="dropdown"
          onValueChange={() => {
            isCalendarPopoverOpen = false;
          }}
          minValue={getEarliestDrawingDate(now)}
        />
      </Popover.Content>
    </Popover.Root>
  </div>

  {#if errorMessage}
    <p class="text-sm text-destructive" role="alert">{errorMessage}</p>
  {/if}

  <div class="flex w-full justify-end">
    <Button disabled={!name.length} onclick={createSecretSanta}>Create</Button>
  </div>
</div>
