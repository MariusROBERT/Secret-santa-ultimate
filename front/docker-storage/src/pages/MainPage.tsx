import {BackgroundImage, Button, Fieldset, Flex, Modal, PinInput, Title} from '@mantine/core';
import santa from '../assets/santa.jpg';
import {useDisclosure} from '@mantine/hooks';
import Create from './Create.tsx';

export default function MainPage() {
  const [create, {open, close}] = useDisclosure(false);

  return (
    <BackgroundImage src={santa} w={'100vw'} h={'100%'}>
      <Flex justify={'space-evenly'} align={'center'} gap={'md'} m={'xl'}>
        <Flex>
          <Title p="xl" c="white" style={{textShadow: 'black 0 0 5px'}}>Welcome to secret santa</Title>
        </Flex>
        <Flex direction="column" align={'center'}>
          <Fieldset radius={'md'}>
            <Title m={'md'}> Got a link ? </Title>
            <PinInput length={6} mb={'md'} placeholder={''}/>
            <Button variant={'light'}>Confirm</Button>
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
    </BackgroundImage>
  );
}
