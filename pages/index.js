import { Container, Box, Heading, useColorModeValue, Link, Button } from "@chakra-ui/react";
import { ChevronRightIcon, EmailIcon } from '@chakra-ui/icons'
import Image from "next/image";
import NextLink from 'next/link'
import Paragraph from '../components/paragraph'
import { BioSection, BioYear } from '../components/bio'
import Section from '../components/section'
import Layout from '../components/layouts/article'

const Home = () => (
  <Layout>
    <Container>
      <Box
        borderRadius="lg"
        mb={6}
        p={3}
        textAlign="center"
        bg={useColorModeValue('whiteAlpha.500', 'whiteAlpha.200')}
        css={{ backdropFilter: 'blur(10px)' }}
      >
        Hello I'm a Computer Science student at Université de Montréal
      </Box>

      <Box display={{ md: "flex" }}>
        <Box flexGrow={1}>
          <Heading as="h2" variant="page-tittle">
            Louis Forrer
          </Heading>
          <p>Cybersecurity - Developer</p>
          </Box>
          <Box
          flexShrink={0}
          mt={{ base: 4, md: 0 }}
          ml={{ md: 6 }}
          textAlign="center"
        >
          
          <Box
            borderColor="whiteAlpha.800"
            borderWidth={2}
            borderStyle="solid"
            w="100px"
            h="100px"
            display="inline-block"
            borderRadius="full"
            overflow="hidden"
          >
            <Image
              src="/images/pdp.jpeg"
              alt="Profile image"
              width="100"
              height="100"
            />
          </Box>
        </Box>
        </Box>
        
        <Section delay={0.1}>
        <Heading as="h3" variant="section-title">
          Work
        </Heading>
        <Paragraph>
        Louis, a French student living in Montreal since 2020, is finishing his bachelor's degree in computer science with a GPA of 3.5/4. He has a keen interest in cybersecurity, software development, and competitive programming. Louis has participated in several CTFs, hackathons, and a competitive algorithm club, showcasing his passion for tackling complex challenges. Additionally, he has honed his professional skills through over a year and a half of diverse internship experiences.
        </Paragraph>
        <Box align="center" my={4}>
          <Button
            as={NextLink}
            href="/works"
            scroll={false}
            rightIcon={<ChevronRightIcon />}
            colorScheme="teal"
          >
            My portfolio
          </Button>
        </Box>
      </Section>

      <Section delay={0.2}>
        <Heading as="h3" variant="section-title">
          Bio
        </Heading>
        <BioSection>
          <BioYear>2001</BioYear>
          Born in France.
        </BioSection>
        <BioSection>
          <BioYear>2022</BioYear>
          Worked at Genetec as an Intern in a SOC
        </BioSection>
        <BioSection>
          <BioYear>2023</BioYear>
          Worked at EY Montréal as an Intern in Banking Technology
        </BioSection>
        <BioSection>
          <BioYear>2024</BioYear>
          Completing the Bachelor&apos;s Program in Computer Science at Université de Montréal
        </BioSection>
      </Section>

      <Section delay={0.3}>
        <Heading as="h3" variant="section-title">
          I ♥
        </Heading>
        <Paragraph>
          Art, Music,{' '}
          <Link href="https://flickr.com/photos/197481682@N03/" target="_blank">
            Photography
          </Link>
          , Sports
        </Paragraph>
      </Section>

      
    </Container>
  </Layout>
)

export default Home
export { getServerSideProps } from '../components/chakra'