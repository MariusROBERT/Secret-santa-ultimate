import {Button, Flex, LoadingOverlay, Table, Text, TextInput, Title} from '@mantine/core';
import {useEffect, useState} from 'react';
import {apiURL} from '../constants.ts';
import {z} from 'zod';
import {useForm, zodResolver} from '@mantine/form';
import UserTabRow from "../Components/UserTabRow.tsx";

export interface User {
  id: number;
  name: string;
  mail: string;
  forbidden: number[];
}

interface SecretSanta {
  name: string;
  mailDate: Date;
  participants: User[];
}

const schema = z.object({
  name: z.string().min(2, {message: 'Name should have at least 2 letters'}),
  email: z.string().email({message: 'Invalid email'}),
});

export default function Join() {
  const [code] = useState<string>(new URLSearchParams(window.location.search).get('code') || '');
  const [loading, setLoading] = useState<boolean>(true);
  const [secretSanta, setSecretSanta] = useState<SecretSanta | null>(null);

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
            participants: data.users.sort((a: User, b: User) => a.id - b.id),
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

  function addUser(newName: string, newMail: string) {
    if (newName === '' || newMail === '')
      return;
    fetch(apiURL + '/addUser/' + code, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: newName,
        mail: newMail,
      })
    }).then(
        (r) => {
          if (r.ok) {
            r.json().then((data) => {
              console.log(data);
              if (secretSanta && data.users)
                setSecretSanta({...secretSanta, participants: data.users});
            });
          }
        }
    )
  }

  const form = useForm({
    validateInputOnBlur: true,
    validate: zodResolver(schema),
    initialValues: {
      name: '',
      email: '',
    },
  });

  return (
      <Flex direction={'column'} gap={'xl'} w={'90vw'} pos={'relative'} h={'90vh'} align={'center'}>
        <LoadingOverlay visible={loading} overlayProps={{radius: 'sm', blur: 2}}/>
        <Title>{secretSanta?.name || 'Name'}</Title>
        <Flex direction={'row'} justify={'space-between'} maw={500} miw={200}>
          <Text>Mail send date:</Text>
          <Text>{secretSanta?.mailDate?.toLocaleDateString()}</Text>
        </Flex>
        <Flex direction={'column'}>
          <form onSubmit={form.onSubmit((values) => addUser(values.name, values.email))}>
            <Table striped highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Name</Table.Th>
                  <Table.Th>Mail</Table.Th>
                  <Table.Th>Forbidden</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {
                    secretSanta?.participants.length !== 0 &&
                    secretSanta?.participants?.map((user, key) => {
                      return <UserTabRow user={user} allUsers={secretSanta?.participants} code={code} key={key}/>
                    })
                }
                <Table.Tr>
                  <Table.Td>
                    <TextInput
                        {...form.getInputProps('name')}
                        placeholder={'Name'}/>
                  </Table.Td>
                  <Table.Td>
                    <TextInput
                        {...form.getInputProps('email')}
                        placeholder={'Email'}/>
                  </Table.Td>
                </Table.Tr>
              </Table.Tbody>
            </Table>
            <Button type={"submit"}>Add user</Button>
          </form>
        </Flex>
      </Flex>
  );
}