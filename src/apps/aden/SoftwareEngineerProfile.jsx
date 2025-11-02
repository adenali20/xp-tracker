import React from "react";
import "./SoftwareEngineerProfile.css";

export default function ResumePage() {
  return (
    <div className="resume-container">
      <header className="resume-header">
        <h1>ADEN ALI</h1>
        <p>5630 N Sheridan • Chicago, IL 60660</p>
        <p>641.451.3559 • adenali362@gmail.com</p>
        <a
          href="https://www.linkedin.com/in/aden-ali/"
          target="_blank"
          rel="noreferrer"
        >
          LinkedIn Profile
        </a>
      </header>

      <section className="section">
        <h2>FULL STACK JAVA DEVELOPER</h2>
        <p>
          Progressive Full Stack Developer with 6 years of hands-on experience
          leading both backend and frontend development and resolving technical
          issues to ensure optimal functionality. Skilled in implementing
          technologies such as Java, React Js, React Native, Node Js, WebRTC,
          REST, J2EE, Spring, Hibernate, Microservices, JavaScript, MySQL,
          CI/CD pipeline, Design Patterns and Kafka.
        </p>
        <p>
          <strong>Core Strengths:</strong> Frontend / Backend Development •
          Dependency Injection • Java Programming • Object Oriented Programming •
          Technical Solutions • Data Structures and Collections
        </p>
      </section>

      <section className="section">
        <h2>TECHNICAL SKILLS</h2>
        <ul>
          <li>
            <strong>Languages:</strong> Java
          </li>
          <li>
            <strong>Web:</strong> Java, JavaScript, HTML5, CSS, Bootstrap,
            Node.js, React.js, Socket.io, Express.js, JSON, Redux, WebRTC
          </li>
          <li>
            <strong>Web Services:</strong> REST
          </li>
          <li>
            <strong>Web and Application Servers:</strong> Apache Tomcat
          </li>
          <li>
            <strong>Frameworks / Libraries:</strong> Spring, React.js, React
            Native, Hibernate, Mockito
          </li>
          <li>
            <strong>Databases:</strong> MS SQL, MongoDB
          </li>
          <li>
            <strong>Message Brokers:</strong> Apache Kafka, Solace
          </li>
          <li>
            <strong>Design Patterns:</strong> Façade, Strategy, Observer,
            Composite, Command, State, Chain of Responsibility, Proxy, Builder,
            Decorator, Singleton
          </li>
          <li>
            <strong>SDLC:</strong> Agile, Waterfall
          </li>
          <li>
            <strong>Clouds:</strong> AWS, PCF
          </li>
          <li>
            <strong>Tools:</strong> Docker, Jenkins, Eclipse, Git, JUnit,
            Mockito, Kubernetes, Camunda, Terraform, Helm, GitHub Actions, JFrog
            Artifactory
          </li>
          <li>
            <strong>Platforms:</strong> Linux, Windows
          </li>
        </ul>
      </section>

      <section className="section">
        <h2>PROFESSIONAL EXPERIENCE</h2>

        <div className="job">
          <h3>Creospan, Chicago, USA</h3>
          <p className="job-duration">03/2021 – 10/2025</p>
          <p className="job-title">Full Stack Java Developer</p>
          <p>
            Creospan is an Information Technology & Engineering Consultancy.
          </p>
        </div>

        <div className="job">
          <h3>Northern Trust, Chicago, USA</h3>
          <p className="job-duration">12/2024 – 10/2025</p>
          <p className="job-title">Full Stack Java Developer</p>
          <p>Financial services company.</p>
          <ul>
            <li>
              Designed and developed microservices with RESTful APIs using
              Spring Boot and Spring Data JPA.
            </li>
            <li>
              Tested features using Java and JavaScript testing libraries.
            </li>
            <li>Managed application state using Redux.</li>
            <li>Deployed web applications to PCF.</li>
            <li>Collaborated with product teams to refine requirements.</li>
          </ul>
          <p>
            <strong>Achievements:</strong> Modernized legacy applications;
            delivered modules on time; optimized API performance.
          </p>
          <p>
            <strong>Technologies:</strong> Java, JavaScript, React, Redux, Spring
            Boot, Jenkins, Git, PCF, Hibernate, Solace, Spring Cloud, Microservices,
            JPA, SQL, NodeJS, Jest.
          </p>
        </div>

        <div className="job">
          <h3>Verizon, Irving, USA</h3>
          <p className="job-duration">05/2022 – 06/2024</p>
          <p className="job-title">Full Stack Java Developer</p>
          <p>Communications & Information Technology company.</p>
          <ul>
            <li>
              Developed backend with Java/Spring Boot and frontend with React
              and Angular.
            </li>
            <li>
              Integrated Camunda REST and Java APIs with the process engine.
            </li>
            <li>
              Managed microservices on AWS (EC2, S3, EKS) with Terraform IaC.
            </li>
            <li>
              Automated CI/CD pipelines using GitHub Actions and GitOps via Argo
              CD.
            </li>
          </ul>
          <p>
            <strong>Technologies:</strong> Java, React, Redux, Angular, Spring
            Boot, Jenkins, Git, PCF, Hibernate, Kafka, Spring Cloud, Microservices,
            SQL, NodeJS, Jest, AWS, Camunda, Argo CD, Terraform, Kubernetes.
          </p>
        </div>

        <div className="job">
          <h3>Northern Trust, Chicago, USA</h3>
          <p className="job-duration">03/2021 – 04/2022</p>
          <p className="job-title">Full Stack Java Developer</p>
          <ul>
            <li>
              Built microservices using Java 8, Spring Boot, and JPA
              Specification.
            </li>
            <li>Developed reusable React components and used Redux for state.</li>
            <li>
              Tested React app with Jest and Testing Library; deployed to PCF.
            </li>
          </ul>
          <p>
            <strong>Technologies:</strong> Java, React, Redux, Spring Boot,
            Bamboo, Git, PCF, Hibernate, Solace, JPA, SQL, NodeJS, Jest.
          </p>
        </div>

        <div className="job">
          <h3>Garissa University, Garissa, Kenya</h3>
          <p className="job-duration">08/2016 – 11/2019</p>
          <p className="job-title">Software Engineer</p>
          <ul>
            <li>
              Developed an e-Learning System and university management
              applications.
            </li>
            <li>
              Led Agile development for backend, frontend, and mobile apps.
            </li>
            <li>
              Improved collaboration and academic performance through digital
              solutions.
            </li>
          </ul>
          <p>
            <strong>Technologies:</strong> Java, React, React Native, Redux,
            Spring Boot, MongoDB, Next.js, Docker, Jenkins, Git, Hibernate,
            Kafka, WebRTC, SQL/NoSQL, GCP.
          </p>
        </div>
      </section>

      <section className="section">
        <h2>EDUCATION</h2>
        <ul>
          <li>
            <strong>Ph.D (In Progress):</strong> Information Technology –
            University of the Cumberlands, KY
          </li>
          <li>
            <strong>Master of Science:</strong> Computer Science – Maharishi
            International University, IA
          </li>
          <li>
            <strong>Bachelor of Science:</strong> Computer Science – Meru
            University, Kenya
          </li>
        </ul>
      </section>
    </div>
  );
}
