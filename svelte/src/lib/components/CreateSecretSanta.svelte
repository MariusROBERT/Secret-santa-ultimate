<script lang="ts">
  import { CalendarDate, getLocalTimeZone, today } from '@internationalized/date';
  import { Input } from '$lib/components/ui/input';
  import * as Popover from '$lib/components/ui/popover/index.js';
  import { Calendar } from '$lib/components/ui/calendar';
  import { Button } from '$lib/components/ui/button';
  import { Label } from '$lib/components/ui/label';

  let name: string = $state('');
  let mailDate: CalendarDate = $state(today(getLocalTimeZone()).add({ weeks: 1 }));
  let formattedMailDate = $derived(mailDate.toDate(getLocalTimeZone()));

  let isCalendarPopoverOpen = $state(false);
</script>

<div class="flex justify-evenly flex-col gap-3 mt-4">

  <div class="flex flex-col gap-2">
    <Label for="name">Name</Label>
    <Input class="text-black" bind:value={name} placeHolder="Family Doe" id="name" />
  </div>

  <div class="flex flex-col gap-2">
    <Label for="mailDate">Mail sending date</Label>
    <Popover.Root bind:open={isCalendarPopoverOpen}>
      <Popover.Trigger>
        <Button
          variant="outline"
          class="w-full text-black justify-between font-normal"
          id="mailDate"
        >
          {mailDate.toDate(getLocalTimeZone()).toLocaleDateString()}
        </Button>
      </Popover.Trigger>
      <Popover.Content class="w-auto mx-auto overflow-hidden p-0" align="start">
        <Calendar
          type="single"
          bind:value={mailDate}
          captionLayout="dropdown"
          onValueChange={() => {
            isCalendarPopoverOpen = false;
          }}
          minValue={today(getLocalTimeZone())}
        />
      </Popover.Content>
    </Popover.Root>
  </div>

  <div class="w-full justify-end flex">
    <Button
      disabled={!name.length}
      onClick={() => {/* TODO: add the fetch and handle response */}}
    >
      Create
    </Button>
  </div>
</div>
