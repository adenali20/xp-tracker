import React from "react";
import "./SoftwareEngineerProfile.css";

export default function ResumePage() {
  return (
    <div className="resume-container">
      <header className="resume-header">
        <h1>ADEN ALI</h1>
        <p>5630 N. Sheridan • Chicago, IL 60660</p>
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
        <h2>FULL STACK DEVELOPER</h2>
        <p>
          Progressive Full Stack Developer with 6 years of hands-on experience
          leading both backend and frontend development and resolving technical
          issues to ensure optimal functionality. Skilled in implementing
          technologies such as Java, React Js, React Native, Node Js, WebRTC,
          REST, J2EE, Spring, Hibernate, Microservices, JavaScript, MySQL,
          CI/CD, Design Patterns, and Kafka.
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
            <strong>Frameworks:</strong> Spring, React.js, React Native,
            Angular, Hibernate, Mockito
          </li>
          <li>
            <strong>Databases:</strong> MS SQL, MongoDB
          </li>
          <li>
            <strong>Message Brokers:</strong> Apache Kafka
          </li>
          <li>
            <strong>Tools:</strong> Docker, Jenkins, Eclipse, Git, JUnit,
            Kubernetes, Camunda, Terraform, Helm, GitHub Actions, JFrog
            Artifactory
          </li>
          <li>
            <strong>Clouds:</strong> AWS, PCF
          </li>
        </ul>
      </section>

      <section className="section">
        <h2>PROFESSIONAL EXPERIENCE</h2>

        <div className="job">
          <h3>Northern Trust, Chicago, USA</h3>
          <p className="job-duration">12/2024 – 10/2025</p>
          <p className="job-title">Full Stack Java Developer</p>
          <ul>
            <li>
              Designed and developed microservices with RESTful APIs using
              Spring Boot and Spring Data JPA.
            </li>
            <li>
              Managed application state using Redux and tested with modern JS
              testing frameworks.
            </li>
            <li>Deployed web apps to PCF and optimized API performance.</li>
          </ul>
        </div>

        <div className="job">
          <h3>Verizon, Irving, USA</h3>
          <p className="job-duration">05/2022 – 06/2024</p>
          <p className="job-title">Full Stack Java Developer</p>
          <ul>
            <li>
              Created Camunda workflows for device activation and shipment
              processes.
            </li>
            <li>
              Developed RESTful microservices and reusable React components.
            </li>
            <li>
              Deployed applications on AWS using EC2, S3, and EKS with CI/CD
              pipelines via GitHub Actions.
            </li>
          </ul>
        </div>

        <div className="job">
          <h3>Garissa University, Kenya</h3>
          <p className="job-duration">08/2016 – 11/2019</p>
          <p className="job-title">Software Engineer</p>
          <ul>
            <li>
              Developed an e-Learning System and implemented multiple university
              management applications.
            </li>
            <li>
              Improved academic performance through custom digital solutions.
            </li>
          </ul>
        </div>
      </section>

      <section className="section">
        <h2>EDUCATION</h2>
        <ul>
          <li>
            <strong>PhD (In Progress):</strong> Information Technology –
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
