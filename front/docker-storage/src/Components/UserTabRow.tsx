import {User} from "../pages/Join.tsx";
import {List, X} from "tabler-icons-react";
import {ActionIcon, Button, Flex, HoverCard, MultiSelect, Popover, Table, Text} from "@mantine/core";
import {useState} from "react";
import {apiURL} from "../constants.ts";

interface Props {
  user: User;
  allUsers: User[];
  code: string;
  delUser: (id: number) => void;
}


export default function UserTabRow(props: Props) {
  const [oldBanned, setOldBanned] = useState<string[]>(getNames(props.user.forbidden || []));
  const [newBanned, setNewBanned] = useState<string[]>(getNames(props.user.forbidden || []));
  const [bannedOpened, setBannedOpened] = useState(false);

  function getIDs(names: string[]): number[] {
    if (!names)
      return [];
    return names.map(
        (name) => props.allUsers.find(
            (user) => user.name === name)?.id || -1).sort(
        (a, b) => a - b);
  }

  function getNames(ids: number[]): string[] {
    if (!ids)
      return [];
    return ids.sort(
        (a, b) => a - b).map(
        (id) => props.allUsers.find(
            (user) => user.id === id)?.name || '');
  }

  function confirm() {
    const newIds = getIDs(newBanned);
    console.log(newIds);
    if (JSON.stringify(newIds) === JSON.stringify(getIDs(oldBanned))) {
      setBannedOpened(false);
      return;
    }

    fetch(apiURL + '/setForbidden/' + props.code, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: props.user.id,
        forbidden: newIds,
      })
    }).then((response) => {
      setBannedOpened(false);
      if (response.ok) {
        response.json()
            .then((data) => {
              // console.log(data);
              setOldBanned(getNames(data.users.find((user: User) => user.id === props.user.id).forbidden || []));
            });
      }
    }).catch((error) => {
      console.error(error)
    })
  }

  function cancel() {
    setBannedOpened(false);
    setNewBanned(oldBanned);
  }

  return (
      <Table.Tr>
        <Table.Td maw={115}>
          <HoverCard position={"left"} offset={-10}>
            <HoverCard.Target>
              <Text truncate={'end'}>
                {props.user.name}
              </Text>
            </HoverCard.Target>
            <HoverCard.Dropdown p={'xs'}>
              <ActionIcon onClick={() => props.delUser(props.user.id)}>
                <X/>
              </ActionIcon>
            </HoverCard.Dropdown>
          </HoverCard>
        </Table.Td>
        <Table.Td maw={115}>
          <Text truncate={'end'}>
            {props.user.mail}
          </Text>
        </Table.Td>
        <Table.Td>
          <Popover
              position="right-start"
              withArrow
              opened={bannedOpened}
              width={275}
          >
            <Popover.Target>
              <Button variant={'light'}
                      px={5}
                      onClick={() => {
                        JSON.stringify(getIDs(newBanned)) === JSON.stringify(getIDs(oldBanned)) ?
                            setBannedOpened(!bannedOpened) :
                            setBannedOpened(true)
                      }}
              >
                <List/>
              </Button>
            </Popover.Target>
            <Popover.Dropdown>
              <Flex direction={'column'} justify={'center'} align={'center'}>
                <MultiSelect
                    label="Who can't he gift ?"
                    placeholder="Users"
                    data={props.allUsers.filter(
                        (user) => user.id !== props.user.id).map(
                        (user) => user.name) || []}
                    value={newBanned}
                    onChange={(e) => {
                      // console.log('banned:', e);
                      setNewBanned(e);
                    }}
                    maxDropdownHeight={200}
                    clearable
                />
                <Flex justify={'space-evenly'} w={'100%'}>
                  <Button variant={'outline'} mt={'md'} onClick={cancel}>Cancel</Button>
                  <Button variant={'light'} mt={'md'} onClick={confirm}>Save</Button>
                </Flex>
              </Flex>
            </Popover.Dropdown>
          </Popover>
        </Table.Td>
      </Table.Tr>
  )
}