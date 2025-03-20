import { Container, Heading, SimpleGrid, Divider } from '@chakra-ui/react'
import Layout from '../components/layouts/article'
import Section from '../components/section'
import { WorkGridItem } from '../components/grid-item'

import thumbCodeLens from '../public/images/works/codelens_eyecatch.webp'
import thumbRLAgent from '../public/images/works/rlagent_eyecatch.png'
import thumbFridge from '../public/images/works/fridge_eyecatch.png'

const Works = () => (
  <Layout title="Works">
    <Container>
      <Heading as="h3" fontSize={20} mb={4}>
        Featured Projects
      </Heading>

      <SimpleGrid
        columns={[1, 1, 2]}
        gap={6}
        sx={{
          '& > div': {
            height: '100%'
          }
        }}
      >
        <Section height="100%">
          <WorkGridItem 
            id="gpt-codelens" 
            title="GPT-CodeLens" 
            thumbnail={thumbCodeLens}
          >
            Intelligent code review system using LLMs to provide contextual improvements
            and catch complex issues
          </WorkGridItem>
        </Section>
        <Section>
          <WorkGridItem
            id="rl-agentx"
            title="RL-AgentX"
            thumbnail={thumbRLAgent}
          >
            Adaptive game AI that evolves in real-time using deep reinforcement learning
          </WorkGridItem>
        </Section>

        <Section delay={0.1}>
          <WorkGridItem
            id="fridge2recipe"
            title="Fridge2Recipe"
            thumbnail={thumbFridge}
          >
            Smart recipe recommendation system based on available ingredients
          </WorkGridItem>
        </Section>
      </SimpleGrid>
    </Container>
  </Layout>
)

export default Works
export { getServerSideProps } from '../components/chakra'
