import { Container, Badge, Link, List, ListItem } from '@chakra-ui/react'
import { ExternalLinkIcon } from '@chakra-ui/icons'
import { Title, WorkImage, Meta } from '../../components/work'
import P from '../../components/paragraph'
import Layout from '../../components/layouts/article'

const Work = () => (
  <Layout title="GPT-CodeLens">
    <Container>
      <Title>
        GPT-CodeLens <Badge>2024</Badge>
      </Title>
      <P>
        GPT-CodeLens is an AI-powered code reviewer that understands large-scale software systems, 
        detects anti-patterns, and provides real-time auto-refactoring suggestions inside 
        development environments like VS Code & JetBrains.
      </P>

      <List ml={4} my={4}>
        <ListItem>
          <Meta>Overview</Meta>
          <span>Deep code understanding with fine-tuned LLMs for Java, Python, and C++</span>
        </ListItem>
        <ListItem>
          <Meta>Features</Meta>
          <span>Interactive AI reviews, AST parsing, RLHF-powered learning</span>
        </ListItem>
        <ListItem>
          <Meta>Stack</Meta>
          <span>Python, PyTorch, Hugging Face, LangChain, TypeScript, Kubernetes</span>
        </ListItem>
        <ListItem>
          <Meta>Impact</Meta>
          <span>Enhanced code quality metrics and security standards across projects</span>
        </ListItem>
        <ListItem>
          <Meta>Results</Meta>
          <span>Significant improvements in review efficiency and vulnerability detection</span>
        </ListItem>
      </List>

      <WorkImage src="/images/works/codelens_01.png" alt="GPT-CodeLens" />
      <WorkImage src="/images/works/codelens_02.png" alt="GPT-CodeLens" />
    </Container>
  </Layout>
)

export default Work
export { getServerSideProps } from '../../components/chakra'
