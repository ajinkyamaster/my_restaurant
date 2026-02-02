Smart Restaurant Management System

An end-to-end QR-based restaurant ordering and table management system with AI-powered analytics and future trend prediction, designed to streamline dine-in operations, enhance customer experience, and enable data-driven decision-making for restaurant administrators.

 Overview --

The Smart Restaurant Management System digitizes the complete dine-in workflow using QR-based table sessions, real-time order management, and machine learning–driven business insights.

The system is designed strictly for on-premise dine-in customers and does not support long-distance or advance table booking, as each booking creates an active table session.

The platform is role-based and consists of:

Customer Panel

Manager Panel

Admin Panel

 Customer Workflow--
Table Booking Logic

Each restaurant table is designed to have a unique QR code

QR-based booking is fully implemented

Current booking flow supports two modes:

1️⃣ QR-Based Table Booking (Implemented & Preferred)

Customer scans the QR code placed on the table

The Book Table page is rendered automatically

The table number is auto-filled and non-editable

This ensures:

Customer is physically present at the table

The correct table is booked

No table misuse or remote booking

2️⃣ Manual Table Number Entry (Temporary Provision)

Due to project-level constraints (QRs not printed/attached to all tables yet):

Customers are required to manually enter the table number on the Book Table page

This option assumes:

The customer is sitting at a vacant table

The booking is performed on-premise

!! This manual option is a temporary fallback

It will be removed once the system is fully QR-based

Ordering & Session Flow

Once a table is booked, a table session is created

The session links:

Customer information

Table number

Cart and orders

Customer can:

View digital menu

Add items to cart

Place orders

Proceed to checkout

View order history

Payment Flow (Current Implementation)

Real-time payment gateway is not integrated yet

On clicking Make Payment:

Customer is redirected to a Payment Successful page

This simulates a completed transaction for system flow validation

The system is payment-gateway ready

Production-grade payment integration (Razorpay / Stripe / UPI) can be added in future releases

Ending the Table Session

After completing dine-in, the customer must end the table session

Ending the session:

Clears customer data

Clears cart and orders

Vacates the table

Ensures:

Data privacy

Table availability accuracy

Clean system state

 Table Session Management--

Each table session is:

Temporary

Isolated

Tied to one physical table

Once ended:

All session-related data is deleted

Prevents:

Data leakage

Session reuse

Invalid bookings

 Manager Panel--

Secure manager authentication

View all active orders from all tables

Accept and confirm orders table-wise

Order status updates are reflected in real time on the customer interface

Enables smooth kitchen–service coordination

 Admin Panel--

View and manage all table bookings

Monitor live table occupancy

View and manage all active managers

Create new admin or manager accounts

Vacate or deactivate managers

Add, edit, or remove menu items

Add or modify restaurant tables

 AI-Powered Analytics & Predictions--

The admin panel includes an AI-driven analytics dashboard:

Weekly profit, revenue, and expense analysis

Models trained on historical sales data

Machine Learning models used:

Linear Regression

Random Forest Regressor

Predicts:

Expected next-week revenue

Expected expenses

Expected profit

AI services deployed using Python FastAPI

 End-of-Day Reset & Data Maintenance--

Admin can perform an end-of-day reset

This:

Clears all bookings

Removes all customer orders

Deletes all table sessions

Ensures:

Data cleanliness

Privacy compliance

Fresh operational state

 Technology Stack--
Backend:

Node.js

Express.js

MongoDB

AI / ML:

Python

FastAPI

Linear Regression

Random Forest

Frontend:

HTML

CSS

JavaScript

EJS

Tools & Deployment:

Docker

Git

Linux

 Key Highlights--

QR-based table session architecture

On-premise dine-in focused system

Temporary manual table booking fallback

Secure session lifecycle management

AI-powered business analytics

Payment-gateway-ready architecture

 Conclusion--

The Smart Restaurant Management System is a production-ready, scalable platform that combines QR-based ordering, real-time operations, and AI-powered insights.

The architecture is designed to:

Fully transition to QR-only booking

Support real-time payment gateways

Scale for real-world restaurant environment
