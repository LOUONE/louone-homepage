import { Container, Badge, List, ListItem } from '@chakra-ui/react'
import { Title, WorkImage, Meta } from '../../components/work'
import P from '../../components/paragraph'
import Layout from '../../components/layouts/article'

const Work = () => (
  <Layout title="RL-AgentX">
    <Container>
      <Title>
        RL-AgentX <Badge>2024</Badge>
      </Title>
      <P>
        RL-AgentX is a deep reinforcement learning agent that dynamically adapts its 
        playstyle against human players in real-time strategy (RTS) games. Unlike 
        traditional rule-based AI, it evolves its strategy on the fly without prior 
        exposure to new opponents.
      </P>

      <List ml={4} my={4}>
        <ListItem>
          <Meta>Features</Meta>
          <span>Meta-learning loop, Self-play & PBT, Neural Network-Driven Fog of War</span>
        </ListItem>
        <ListItem>
          <Meta>Stack</Meta>
          <span>Python, TensorFlow, Unity ML-Agents, PyTorch Lightning, Cloud TPU</span>
        </ListItem>
        <ListItem>
          <Meta>Innovation</Meta>
          <span>Advanced real-time strategy adaptation using deep learning</span>
        </ListItem>
        <ListItem>
          <Meta>Results</Meta>
          <span>Demonstrated strong performance in competitive gaming scenarios</span>
        </ListItem>
      </List>

      <WorkImage src="/images/works/rlagent_01.png" alt="RL-AgentX" />
      <WorkImage src="/images/works/rlagent_02.png" alt="RL-AgentX" />
    </Container>
  </Layout>
)

export default Work
export { getServerSideProps } from '../../components/chakra'
