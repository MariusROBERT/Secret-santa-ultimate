import {
  ActionIcon,
  Button,
  CopyButton,
  Flex,
  Input,
  LoadingOverlay,
  ScrollArea,
  Table,
  Text,
  TextInput,
  Title
} from '@mantine/core';
import {useEffect, useState} from 'react';
import {apiURL} from '../constants.ts';
import {z} from 'zod';
import {useForm, zodResolver} from '@mantine/form';
import UserTabRow from "../Components/UserTabRow.tsx";
import {CalendarEvent, Check, Pencil} from "tabler-icons-react";
import {DatePickerInput} from "@mantine/dates";
import {useNavigate} from "react-router-dom";

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
  name: z.string().min(2, {message: '2 letters min'}).max(50, {message: '50 letters max'}),
  email: z.string().email({message: 'Invalid email'}),
});

export default function Join() {
  const [code] = useState<string>(new URLSearchParams(window.location.search).get('code')?.toUpperCase() || '');
  const [loading, setLoading] = useState<boolean>(true);
  const [secretSanta, setSecretSanta] = useState<SecretSanta | null>(null);
  const [title, setTitle] = useState<string>('');
  const [editTitle, setEditTitle] = useState<boolean>(false);
  const [date, setDate] = useState<Date | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (code === '') {
      console.log('No code');
      navigate('/');
    }
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
          setTitle(secretSanta.name);
          setLoading(false);
          setDate(new Date(secretSanta.mailDate));
        });
      } else {
        if (r.status === 404) {
          console.log(`Secret santa ${code} not found`);
          navigate('/');
        }
      }
    }).catch((error) => {
      console.error(error);
    });
  }, [code]);

  useEffect(() => {
    if (!date || secretSanta?.mailDate === date)
      return;
    fetch(apiURL + '/editDate/' + code, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        date: date,
      })
    }).then(
        (r) => {
          if (r.ok) {
            setDate(date);
          } else {
            console.log(r);
          }
        }
    )
  }, [date]);

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

  function delUser(id: number) {
    if (id < 1)
      return;
    fetch(apiURL + '/delUser/' + code, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: id,
      })
    }).then((r) => {
          if (r.ok) {
            setSecretSanta({
              name: secretSanta?.name || '',
              participants: secretSanta?.participants.filter((user) => user.id !== id) || [],
              mailDate: secretSanta?.mailDate || new Date(),
            })
          } else {
            console.error(r);
          }
        }
    )
  }

  function confirmEditTitle() {
    fetch(apiURL + '/editTitle/' + code, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: title,
      })
    }).then(
        (r) => {
          if (r.ok) {
            r.json().then(() => {
              if (secretSanta)
                setSecretSanta({...secretSanta, name: title});
              setEditTitle(false);
            });
          } else {
            console.log(r);
            setEditTitle(false);
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
      <Flex direction={'column'} gap={'xl'} pos={'relative'} align={'center'} maw={'90vw'} mah={'90vh'}>
        <LoadingOverlay visible={loading} overlayProps={{radius: 'sm', blur: 2}}/>
        <Flex direction={'column'}>
          <Flex direction={'row'} align={'center'} gap={'sm'}>
            {
              editTitle ?
                  <>
                    <Input value={title} onChange={(e) => setTitle(e.currentTarget.value)}/>
                    <ActionIcon variant={'light'} onClick={confirmEditTitle}>
                      <Check size={24}/>
                    </ActionIcon>
                  </> :
                  <>
                    <Title w={'100%'}>{secretSanta?.name || 'Name'}</Title>
                    {(secretSanta?.mailDate || 0) > new Date() &&
                      <ActionIcon variant={'light'} onClick={() => setEditTitle(true)}>
                        <Pencil size={24}/>
                      </ActionIcon>
                    }
                  </>
            }
          </Flex>
          <CopyButton value={window.location.href}>
            {({copied, copy}) => (
                <Button variant={'transparent'} onClick={copy}>
                  {copied ? 'copied' : code}
                </Button>
            )}
          </CopyButton>
        </Flex>

        <Flex direction={'row'} justify={'space-between'} maw={500} miw={200} gap={'sm'} align={'center'}>
          <Text>Mail send date:</Text>
          {
            (secretSanta?.mailDate || 0) < new Date() ?
                <Text>{secretSanta?.mailDate?.toLocaleDateString()}</Text> :
                <DatePickerInput
                    variant={'unstyled'}
                    rightSection={<ActionIcon> <CalendarEvent size={24}/> </ActionIcon>}
                    value={date}
                    onChange={setDate}
                    minDate={new Date((new Date()).setDate((new Date()).getDate() + 1))}
                />
          }
        </Flex>
        <Flex direction={'column'}>
          <form onSubmit={form.onSubmit((values) => addUser(values.name, values.email))}>
            <ScrollArea h={'50vh'} w={'80vw'}>
              <Table striped highlightOnHover mah={'30vh'} withTableBorder>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Name</Table.Th>
                    <Table.Th>Mail</Table.Th>
                    <Table.Th>Ban</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {
                      secretSanta?.participants.length !== 0 &&
                      secretSanta?.participants?.map((user, key) => {
                        return <UserTabRow
                            user={user}
                            allUsers={secretSanta?.participants}
                            code={code}
                            delUser={delUser}
                            editable={(secretSanta?.mailDate || 0) > new Date()}
                            key={key}
                        />
                      })
                  }
                  {(secretSanta?.mailDate || 0) > new Date() &&
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
                      <Table.Td/>
                    </Table.Tr>
                  }
                </Table.Tbody>
              </Table>
            </ScrollArea>
            {(secretSanta?.mailDate || 0) > new Date() &&
              <Button type={"submit"} mt={'md'}>Add user</Button>
            }
          </form>
        </Flex>
      </Flex>
  );
}