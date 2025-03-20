import { Container, Badge, List, ListItem } from '@chakra-ui/react'
import { Title, WorkImage, Meta } from '../../components/work'
import P from '../../components/paragraph'
import Layout from '../../components/layouts/article'

const Work = () => (
  <Layout title="Fridge2Recipe">
    <Container>
      <Title>
        Fridge2Recipe <Badge>2024</Badge>
      </Title>
      <P>
        An innovative recipe recommendation system that transforms your available 
        ingredients into delicious meal suggestions. With as few as three ingredients, 
        users receive personalized recipe recommendations with remarkable accuracy.
      </P>
      <List ml={4} my={4}>
        <ListItem>
          <Meta>Event</Meta>
          <span>PolyHack 2024</span>
        </ListItem>
        <ListItem>
          <Meta>Stack</Meta>
          <span>React, MongoDB, SQL, REST APIs</span>
        </ListItem>
        <ListItem>
          <Meta>Metrics</Meta>
          <span>20% better retention, 25% faster response times</span>
        </ListItem>
      </List>

      <WorkImage src="/images/works/fridge_01.png" alt="Fridge2Recipe" />
      <WorkImage src="/images/works/fridge_02.png" alt="Fridge2Recipe" />
    </Container>
  </Layout>
)

export default Work
export { getServerSideProps } from '../../components/chakra'
