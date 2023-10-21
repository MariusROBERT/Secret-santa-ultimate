import {Anchor, Button, Fieldset, Flex, Modal, PinInput, Title} from '@mantine/core';
import {useDisclosure} from '@mantine/hooks';
import Create from './Create.tsx';
import {useEffect, useState} from "react";

export default function MainPage() {
  const [create, {open, close}] = useDisclosure(false);
  const [code, setCode] = useState<string>('');

  useEffect(() => {
    console.log(code);
  }, [code]);

  return (
      <Flex justify={'space-evenly'}
            align={'center'}
            gap={{base: 0, sm: 'xl'}}
            m={{base: 'xs', sm: 'xl'}}
            direction={{base: 'column', sm: 'row'}}>
        <Flex direction={'column'}>
          <Title mb={{base: 'xs', sm: 'xl'}} p={{base: 'xs', sm: 'xl'}}>
            Welcome to <br/> secret santa
          </Title>
          <Button style={{visibility: 'hidden'}}/>
        </Flex>
        <Flex direction="column" align={'center'}>
          <Fieldset radius={'md'}>
            <Title m={'md'}> Got a link ? </Title>
            <PinInput length={6} mb={'md'} placeholder={''} value={code} onChange={setCode}/>
            <Anchor href={'/join?code=' + code}>
              <Button variant={'light'}>Confirm</Button>
            </Anchor>
          </Fieldset>
          <Flex m={'md'}>
            <Button onClick={open}>Create your own</Button>
            <Modal opened={create}
                   centered
                   onClose={close}
                   title="New Secret Santa"
                   size={'auto'}
                   overlayProps={{
                     backgroundOpacity: 0.5,
                     blur: 3,
                   }}
            >
              <Create/>
            </Modal>
          </Flex>
        </Flex>
      </Flex>
  );
}
