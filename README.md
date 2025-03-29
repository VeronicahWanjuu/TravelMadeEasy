# Travel Made Easy 🏨 ✈️

A responsive hotel booking and search platform designed to provide travelers with accurate, verified information about accommodations. This application allows users to search for hotels with specific criteria and filter results based on their preferences.
<img width="932" alt="image" src="https://github.com/user-attachments/assets/023f62e1-67f6-4a28-a640-02acf7f660df" />

## 🌐 Live Demo

**Visit the live application at: [https://verosales.tech](https://verosales.tech)**

---

## 📋 Table of Contents

- [Project Overview](#-project-overview)
- [Features](#-features)
- [Technologies Used](#-technologies-used)
- [API Documentation](#-api-documentation)
- [Local Development Setup](#-local-development-setup)
- [Deployment Architecture](#-deployment-architecture)
- [Load Balancer Configuration](#-load-balancer-configuration)
- [Load Test Results](#-load-test-results)
- [Challenges and Solutions](#-challenges-and-solutions)
- [Credits](#-credits)

---

## 🔍 Project Overview

Travel Made Easy was created to address common problems travelers face when booking accommodations online. The platform focuses on providing accurate information about hotels, including verified amenities, honest review scores, and precise location details.

---

## ✨ Features

- Hotel search with customizable parameters
- Date range selection with validation
- Room quantity selection
- Travel purpose specification (Leisure/Business)
- Various sorting options (Popularity, Distance, Class, etc.)
- Advanced filtering capabilities:
  - Filter by address
  - Filter by swimming pool availability
  - Filter by review score
- Responsive design for all device sizes
- Clear presentation of hotel information including:
  - Price
  - Location
  - Accommodation type
  - Review scores
  - Images

---

## 🔧 Technologies Used

- **HTML5** - Structure and content
- **CSS3** - Styling and responsiveness
- **JavaScript**  - Dynamic functionality
- **RapidAPI** - Hotel data integration
- **Nginx** - Load balancer implementation

---

## 📚 API Documentation

This project uses the Booking.com API via RapidAPI for fetching hotel information:

- **API Name**: Booking.com API (via RapidAPI)
- **Endpoint Used**: `https://apidojo-booking-v1.p.rapidapi.com/properties/list-by-map`
- **Documentation**: [Booking.com API on RapidAPI](https://rapidapi.com/apidojo/api/booking)

The API provides comprehensive hotel data including pricing, availability, amenities, and review scores.

---

## 💻 Local Development Setup

### Prerequisites

- Web browser
- Text editor or IDE
- API key from RapidAPI for the Booking.com API

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/VeronicahWanjuu/TravelMadeEasy.git
   cd TravelMadeEasy
   ```

3. Open verosales.tech in your browser to run the application locally.

---

## 🏗️ Deployment Architecture

The application is deployed on two web servers behind a load balancer to ensure high availability and efficient traffic distribution.

### Web Servers

- **Web01**: Ubuntu server at IP 35.171.163.227
- **Web02**: Ubuntu server at IP 34.207.192.59

### Load Balancer

- **LB01**: Ubuntu server at IP 18.206.137.18 (Nginx)

---

## ⚖️ Load Balancer Configuration

The load balancer was configured using Nginx to distribute traffic evenly between Web01 and Web02 using a round-robin algorithm.

### Steps Taken for Load Balancer Configuration:

1. **Install Nginx on the load balancer server**:
   ```bash
   sudo apt update
   sudo apt install nginx
   ```

2. **Configure Nginx as a load balancer**:
   ```bash
   sudo nano /etc/nginx/sites-available/travel-made-easy
   ```

3. **Add the following configuration**:
   ```nginx
   upstream backend {
       server 35.171.163.227;  # Web01
       server 34.207.192.59;   # Web02
   }

   server {
       listen 80;
       server_name 18.206.137.18 verosales.tech;  # Load balancer IP and domain

       location / {
           proxy_pass http://backend;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   }
   ```

4. **Enable the site and restart Nginx**:
   ```bash
   sudo ln -s /etc/nginx/sites-available/travel-made-easy /etc/nginx/sites-enabled/
   sudo nginx -t  # Test configuration
   sudo systemctl restart nginx
   ```

## Web Server Deployment Steps

1. **Set up web servers**:
   ```bash
   sudo apt update
   sudo apt install nginx
   ```

2. **Clone repository on both web servers**:
   ```bash
   git clone https://github.com/yourusername/TravelMadeEasy.git   ```

3. **Configure web server document root**:
   ```bash
   sudo nano /etc/nginx/sites-available/TravelMadeEasy
   ```
   
   Add the following configuration:
   ```nginx
   server {
       listen 80;
       root /path/to/travel-made-easy;
       index index.html;
       
       location / {
           try_files $uri $uri/ =404;
       }
   }
   ```

4. **Enable the site and restart Nginx**:
   ```bash
   sudo ln -s /etc/nginx/sites-available/TravelMadeEasy /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

5. **Ensure API key is securely configured** on each server in the `config.js` file.

---

## 📊 Load Test Results

To verify the load balancer was functioning correctly, a load test was performed with the following results:

- **Web01 Requests**: 1251
- **Web02 Requests**: 1248

This confirms that the load balancer is effectively distributing traffic between both web servers in a near-equal manner.

---

## 🚧 Challenges and Solutions

### Challenge 1: API Key Security

**Problem**: The API key needed to be kept secure but accessible to the application.

**Solution**: Implemented a separate `config.js` file that is included in `.gitignore` to prevent committing sensitive information to the repository. For deployment, this file was securely transferred to each server.

### Challenge 2: Date Validation

**Problem**: Users could select invalid date ranges for their hotel searches.

**Solution**: Implemented client-side validation to ensure departure dates are after arrival dates and that past dates cannot be selected.

---

## 👏 Credits

- Booking.com API via [RapidAPI](https://rapidapi.com/apidojo/api/booking)
- Project created by Veronica
  

