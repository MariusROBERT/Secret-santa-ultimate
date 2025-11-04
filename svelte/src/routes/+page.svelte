<script>
  import {Button} from "$lib/components/ui/button/index.js";
  import * as InputOTP from "$lib/components/ui/input-otp/index.js";
  import * as Dialog from "$lib/components/ui/dialog/index.js";
  import * as Card from "$lib/components/ui/card/index.js";
  import { REGEXP_ONLY_DIGITS_AND_CHARS } from "bits-ui";

  let santaCode = $state('');
</script>

<div class="flex justify-evenly items-center gap-8 m-2 ">
  <h1 class="mb-2 p-2 font-bold text-4xl text-center">Welcome to <br/> Secret Santa</h1>
  <div class="flex flex-col items-center">
    <Card.Root class="flex gap-6 flex-col items-center p-8">
      <h2 class="text-3xl font-medium">Got a link ?</h2>
      <InputOTP.Root maxlength={6} pattern={REGEXP_ONLY_DIGITS_AND_CHARS} bind:value={santaCode} >
        {#snippet children({ cells })}
          {#each cells as cell}
            <InputOTP.Group>
              <InputOTP.Slot {cell} />
            </InputOTP.Group>
          {/each}
        {/snippet}
      </InputOTP.Root>

      <Button variant="secondary" disabled={santaCode.length !== 6} href="/{santaCode}">Confirm</Button>
    </Card.Root>

    <div class="flex m-4">
      <Dialog.Root>
        <Dialog.Trigger>
          <Button>Create your own</Button>
        </Dialog.Trigger>
        <Dialog.Content>
          <Dialog.Header>
            <Dialog.Title>New Secret Santa</Dialog.Title>
            <Dialog.Description>
              TODO: add create modal here
            </Dialog.Description>
          </Dialog.Header>
        </Dialog.Content>
      </Dialog.Root>
    </div>
  </div>
</div>
