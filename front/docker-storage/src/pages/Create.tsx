import {useState} from 'react';
import {DatePickerInput} from '@mantine/dates';
import {Button, Flex, Loader, TextInput} from '@mantine/core';

export default function Create() {
  const [name, setName] = useState<string>('');
  const [mailDate, setMailDate] = useState<Date | null>(new Date);
  const [loading, setLoading] = useState<boolean>(false);

  return (
    <Flex m={'sm'} align={'center'} direction={'column'} justify={'space-evenly'} gap={'md'}>
      <TextInput
        label={'Name'}
        value={name}
        onChange={(event) => setName(event.currentTarget.value)}
        data-autofocus/>
      <DatePickerInput
        w={'100%'}
        label={'When to send the mail ?'}
        value={mailDate}
        onChange={setMailDate}
        minDate={new Date((new Date()).setDate((new Date()).getDate() + 1))}
      />
      <Button mt={'md'} onClick={() => setLoading(!loading)}>
        {loading ? <Loader color={'white'} size={'sm'} m={'sm'}/> : 'Create'}
      </Button>
    </Flex>
  );
}
