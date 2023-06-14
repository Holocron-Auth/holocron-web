# Holocron Auth
This is the code base of web version of Holocron, a project that aims to develop a secure and user-friendly OAuth system that allows users to verify their mobile numbers and email IDs first, so the system can serve as a centralized platform for users to manage their online presence and control access to their personal information. The system will make it easier for other apps to authenticate users and enable them to log in to their accounts.

## Overview
### What is the project?
Holocron OAuth is an authentication and authorisation service designed to provide developers with a secure, easy-to-use, and reliable method of user authentication. Holocron OAuth adheres to privacy regulations and guidelines while offering developers a seamless integration process with third-party services.

Holocron OAuth gives users complete control over their data and the ability to choose which third-party services can access their information. This way, users can rest assured that their data is safe and secure while they enjoy a hassle-free authentication experience.

With Holocron OAuth, developers can implement a robust and scalable authentication system that provides users easy and seamless access to their services. Holocron OAuth's backup login methods ensure the authentication process remains secure and protected against identity theft, number hijacking, and other potential security threats.

This documentation guides users in starting with Holocron OAuth and comprehensively explains its features and functionalities. We will walk you through setting up and configuring Holocron OAuth, explain its various features, and provide step-by-step instructions for using it in your applications.

### What is the MVP?
Holocron's OAuth system's MVP offers several key features that prioritize user privacy and security while offering a seamless and trustworthy user experience.

1. **Fast OTPs:** Our system provides fast and reliable One-Time Passwords (OTPs) for user verification, ensuring that users can quickly verify their mobile numbers and email IDs to access the platform and linked apps securely.
2. **Easy Integration:** Our OAuth system is designed to be easy to integrate with other apps, simplifying the authentication process for developers and ensuring a seamless experience for users.
3. **Better User Control with More Data:** Our platform offers complete transparency and control over app access and data sharing. Users can view a list of the apps linked to their accounts and choose to opt-out or unlink from any app at any time. Moreover, Holocron's security score feature empowers users to make informed decisions about the apps they link to their accounts, providing another layer of protection and transparency.
4. **Strong Security Measures:** Holocron's OAuth system prioritizes user privacy and security, providing robust security measures to protect user data from unauthorized access. Our platform uses advanced encryption techniques and other security protocols to ensure that user data is always secure.
5. **Customisable and Scalable:** Our OAuth system is highly customizable and scalable, making it suitable for a wide range of applications and use cases. Developers can easily customize the platform to fit their specific needs, ensuring a seamless and secure user experience for their users.
6. **Multi-Factor Authentication:** Our platform provides multi-factor authentication options to enhance user security, providing an additional layer of protection against unauthorised access.
7. **Granular Access Controls:** Our platform offers granular access controls, enabling users to control exactly what data they share with each linked app. Users can choose to share only the necessary data, ensuring that their personal information is always protected.

### Use Cases

1. **App authentication**: Holocron OAuth can be used to provide secure authentication for mobile apps, allowing users to easily log in without remembering multiple login credentials. This also eliminates the need for developers to create a separate authentication system for their app.
2. **Website authentication**: Websites can use Holocron OAuth to provide users with a seamless login experience, eliminating the need for users to remember multiple login credentials. This can help increase user engagement and reduce the risk of abandoned accounts.
3. **Remote access**: Holocron OAuth can be used to provide secure authentication for remote workers, allowing them to easily and securely access company resources and services from outside the office. This helps maintain security while increasing productivity.

## Achievement:
- Sustained Cyberattack for a week from 200+ students
- Highest Scoring course project in the course

## Technical Details
Programming language and libraries used
Stack:
- NextJS
- TailwindCSS
- TypeScript
- tRPC
- Prisma
- MySQL
- Nodemailer for sending mails
- Twilio for sending SMS
- AWS S3 for storing files

The application is built using NextJS with the client-side consisting of the user interface, which uses ReactJS and TailwindCSS. The server-side consists of a backend server that handles all requests and responses, built with the help of tRPC, to make the whole codebase typesafe. The database is a MySQL server hosted on Planetscale for storing data generated by the application. Prisma is used as an ORM to ensure type safety. The system also includes security features to defend against potential attacks.

## Relevant Links
Website: [Link to Deployment](https://holocron-auth.gjd.one/)

