import { Container, Heading, SimpleGrid, Divider } from "@chakra-ui/react";
import Section from "../components/section";
import Paragraph from "../components/paragraph";
import Layout from "../components/layouts/article";

const Works = () => (
  <Layout title="Works">
    <Container>
      <Heading as="h3" fontSize={20} mb={4}>
        Works
      </Heading>

      <Section delay={0.1}>
        <Heading as="h3" variant="section-title">
          Projects
        </Heading>
        <Paragraph>
          <strong>Fridge2Recipe - React, MongoDB, SQL, REST APIs | PolyHack 2024 (Feb. 2024)</strong>
          <ul>
            <li>Developed an intuitive React frontend, improving user retention by 20%, enabling users to input as few as three ingredients and receive recipe suggestions with 98% accuracy.</li>
            <li>Engineered a robust MongoDB and SQL-based backend, reducing average API response times by 25% and ensuring 99.9% uptime through the integration of external REST APIs for dynamic recipe data.</li>
            <li>Optimized API performance and refined search algorithms, enhancing recommendation relevance by 15% and elevating overall user experience.</li>
          </ul>
        </Paragraph>
      </Section>
    </Container>
  </Layout>
);

export default Works;
