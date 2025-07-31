# MediCamp - Medical Camp Management System - Server

This is the **backend server** for the Medical Camp Management System (MediCamp), built using **Node.js**, **Express.js**, **MongoDB**, and **JWT** for authentication and authorization. It handles RESTful API endpoints to manage camps, users, registrations, roles, feedback, and payment intents.

---

##  Live Links

-  **Frontend Repository:** [MediCamp Frontend](https://github.com/Ibtisumraian/medicamp)
<!-- -  **Backend Repository:** [MediCamp Server](https://github.com/Ibtisumraian/medicamp-server) -->
-  **Live Server URL:** `https://medicamp-server-three.vercel.app`

---

##  Features

-  JWT-based authentication & role management  
-  Full CRUD APIs for camps  
-  Organizer & Participant user roles  
-  Stripe payment intent creation  
-  Feedback submission & retrieval  
-  Secure routes with middleware  
-  Participant registration & validation  
-  CORS enabled  

---

##  Dependencies

| Package        | Version  | Purpose                                 |
|----------------|----------|-----------------------------------------|
| `cors`         | ^2.8.5   | Cross-Origin Resource Sharing           |
| `dotenv`       | ^17.2.0  | Load environment variables              |
| `express`      | ^5.1.0   | Node.js web framework                   |
| `jsonwebtoken` | ^9.0.2   | JWT authentication                      |
| `mongoose`     | ^8.16.2  | MongoDB object modeling                 |
| `stripe`       | ^18.3.0  | Stripe payment gateway integration      |

---

##  API Endpoints

| Method | Endpoint                      | Description                            |
| ------ | ----------------------------- | -------------------------------------- |
| POST   | `/jwt`                        | Generates a JSON Web Token             |
| POST   | `/camps`                      | Adds a new camp                        |
| GET    | `/camps`                      | Retrieves all available camps          |
| GET    | `/camps/:id`                  | Retrieves a single camp by ID          |
| GET    | `/TopCamps`                   | Retrieves top 6 most popular camps     |
| PUT    | `/update-camp/:id`            | Updates a camp’s details               |
| PATCH  | `/camps/participantCount/:id` | Increments a camp’s participant count  |
| DELETE | `/delete-camp/:id`            | Deletes a camp                         |
| POST   | `/users`                      | Creates a new user                     |
| GET    | `/users/:email`               | Retrieves a user by email              |
| POST   | `/participants`               | Registers a participant for a camp     |
| GET    | `/participants`               | Retrieves all registered participants  |
| GET    | `/participants/email/:email`  | Retrieves participants by email        |
| DELETE | `/participants/delete/:id`    | Cancels a participant’s registration   |
| PATCH  | `/participants/payment/:id`   | Confirms a participant’s payment       |
| POST   | `/feedback`                   | Submits feedback for a camp            |
| GET    | `/feedbacks`                  | Retrieves all feedback                 |
| POST   | `/create-payment-intent`      | Creates a Stripe payment intent        |


---

##  Author

**Ibtisum Raian**  
Email: ibtisumraian@gmail.com  
GitHub: [Ibtisumraian](https://github.com/Ibtisumraian)

---