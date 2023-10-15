import {Anchor, Flex, Title} from '@mantine/core';

export default function NotFound() {
  return (
    <Flex direction={'column'} gap={'md'}>
      <Title>404 Not found</Title>
      <Anchor href={'/'}>Go home</Anchor>
    </Flex>
  );
}