import {Button, Flex, LoadingOverlay, Text, Title, Tooltip} from '@mantine/core';
import {useEffect, useState} from 'react';
import {apiURL} from '../constants.ts';

interface User {
  name: string;
  mail: string;
  forbidden: number[];
}

interface SecretSanta {
  name: string;
  mailDate: Date;
  participants: User[];
}

export default function Join() {
  const [code] = useState<string | null>(new URLSearchParams(window.location.search).get('code'));
  const [loading, setLoading] = useState<boolean>(true);
  const [secretSanta, setSecretSanta] = useState<SecretSanta | null>(null);

  const isDateSoon: boolean = secretSanta ? new Date().getTime() - secretSanta.mailDate.getTime() < 1000 * 24 * 3600 * 7 : true;

  useEffect(() => {
    fetch(apiURL + '/infos/' + code, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    }).then((r) => {
      if (r.ok) {
        r.json().then((data) => {
          console.log(data);
          const secretSanta: SecretSanta = {
            name: data.name,
            mailDate: new Date(data.mailDate),
            participants: data.users,
          };
          console.log(secretSanta);
          setSecretSanta(secretSanta);
          setLoading(false);
        });
      }
    }).catch((error) => {
      console.error(error);
    });
  }, [code]);

  function addUser() {
    fetch(apiURL + '/addUser/' + code, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'test',
        mail: 'test@gmail.com',
      })
    }).then(
      (r) => {
        if (r.ok) {
          r.json().then((data) => {
            console.log(data);
            /*if (!data.username || !data.mail || !secretSanta)
              return;
            const newUser: User = {
              name: data.username,
              mail: data.mail,
              forbidden: data.forbidden || [],
            };
            setSecretSanta({
              ...secretSanta,
              participants: secretSanta.participants.concat(newUser),
            });*/
            setSecretSanta(data);
          });
        }
      }
    )
    ;
  }


  return (
    <Flex direction={'column'} gap={'xl'} w={'90vw'} pos={'relative'} h={'90vh'} align={'center'}>
      <LoadingOverlay visible={loading} overlayProps={{radius: 'sm', blur: 2}}/>
      <Title>{secretSanta?.name || 'Name'}</Title>
      <Flex direction={'row'} justify={'space-between'} maw={500} miw={200}>
        <Text>Mail send date:</Text>
        <Tooltip label={'soon'} events={{hover: isDateSoon, focus: false, touch: false}}>
          <Text>{secretSanta?.mailDate.toLocaleDateString() || 'soon'}</Text>
        </Tooltip>
      </Flex>
      <Flex direction={'column'}>
        {
          secretSanta?.participants?.map((user, key) => {
            return (
              <Flex direction={'row'} gap={'xl'} key={key}>
                <Text>{user.name}</Text>
                <Text>{user.mail}</Text>
              </Flex>
            );
          })
          || <Text>No participants, be the first</Text>
        }
        <Button onClick={addUser}>Add user</Button>
      </Flex>
    </Flex>
  );
}