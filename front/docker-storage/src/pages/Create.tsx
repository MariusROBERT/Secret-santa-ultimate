import {useEffect, useState} from 'react';
import {DatePickerInput} from '@mantine/dates';
import {Button, CopyButton, Flex, Loader, TextInput} from '@mantine/core';
import {apiURL} from '../constants.ts';
import {Check, Copy} from 'tabler-icons-react';

export default function Create() {
  const [name, setName] = useState<string>('');
  const [mailDate, setMailDate] = useState<Date | null>(new Date((new Date()).setDate((new Date()).getDate() + 1)));
  const [loading, setLoading] = useState<boolean>(false);
  const [code, setCode] = useState<string>('');

  useEffect(() => {
    console.log(code);
  }, [code]);

  function submit() {
    setLoading(true);
    if (name === '' || mailDate === null) {
      setLoading(false);
      return;
    }
    fetch(apiURL + '/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: name,
        mailDate: mailDate.toISOString(),
      })
    }).then((response) => {
      if (response.ok) {
        response.json()
            .then((data) => setCode(data.code));
        setLoading(false);
      }
    }).catch((error) => {
      console.error(error);
      setLoading(false);
    });
  }

  return (
      <Flex m={'sm'} align={'center'} direction={'column'} justify={'space-evenly'} gap={'md'}>
        <TextInput
            label={'Name'}
            value={name}
            onChange={(event) => setName(event.currentTarget.value)}
            data-autofocus
            required
        />
        <DatePickerInput
            w={'100%'}
            label={'When to send the mail ?'}
            value={mailDate}
            onChange={setMailDate}
            minDate={new Date((new Date()).setDate((new Date()).getDate() + 1))}
        />
        <Button mt={'md'} onClick={submit}>
          {loading ? <Loader color="white" size={'sm'} m={'sm'}/> : 'Create'}
        </Button>
        {
          code === '' ?
              <Button style={{visibility: 'hidden'}}>{' '}</Button> :
              <CopyButton value={code}>
                {({copied, copy}) => (
                    <Button onClick={() => {
                      copy();
                      window.location.href = '/join?code=' + code;
                    }} variant={'transparent'}>
                      {copied ?
                          <>Copied<Check style={{width: 16, marginLeft: 10}}/></> :
                          <>{code}<Copy style={{width: 16, marginLeft: 10}}/></>
                      }
                    </Button>
                )}
              </CopyButton>
        }
      </Flex>
  );
}
