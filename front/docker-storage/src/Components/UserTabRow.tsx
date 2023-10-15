import {User} from "../pages/Join.tsx";
import {List} from "tabler-icons-react";
import {Button, Flex, MultiSelect, Popover, Table} from "@mantine/core";
import {useState} from "react";
import {apiURL} from "../constants.ts";

interface Props {
  user: User;
  allUsers: User[];
  code: string;
}


export default function UserTabRow(props: Props) {
  const [banned, setBanned] = useState<string[]>(
      props.user.forbidden?.map(
          (id) => props.allUsers.find(
              (user) => user.id === id)?.name || '')
      || []
  );

  function confirm() {
    const bannedIds = banned.map(
        (name) => props.allUsers.find(
            (user) => user.name === name)?.id);
    console.log(bannedIds);
    fetch(apiURL + '/setForbidden/' + props.code, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: props.user.id,
        forbidden: bannedIds,
      })
    }).then((response) => {
      if (response.ok) {
        response.json()
            .then((data) => console.log(data));
      }
    }).catch((error) => {
      console.error(error)
    })
  }

  return (
      <Table.Tr>
        <Table.Td>{props.user.name}</Table.Td>
        <Table.Td>{props.user.mail}</Table.Td>
        <Table.Td>
          <Popover
              position="right"
              width={350}
              withArrow
              closeOnClickOutside={false}
          >
            <Popover.Target>
              <Button variant={'light'} px={5}>
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
                    value={banned}
                    onChange={setBanned}
                    maxDropdownHeight={200}
                    clearable
                />
                <Button variant={'light'} mt={'md'} onClick={confirm}>Done</Button>
              </Flex>
            </Popover.Dropdown>
          </Popover>
        </Table.Td>
      </Table.Tr>
  )
}