Small_medium_enterprise_pos

A **robust and scalable POS system** designed to streamline sales transactions, inventory management, and reporting. Built with **Python**, **PyQt**, and **SQLite**, this system offers a user-friendly interface and powerful backend functionality to support businesses of all sizes. With real-time transaction tracking, secure payment processing, and seamless integration with inventory, this solution aims to enhance the operational efficiency of retail environments.

---

## Key Features

- **Real-Time Transaction Processing**: Efficiently handles customer purchases, calculating totals, taxes, and discounts in real time.
- **Inventory Management**: Tracks product stock levels, including automatic stock updates after each sale, with alerts for low stock.
- **Sales Reports**: Generates daily, weekly, and monthly sales reports, helping businesses analyze performance and manage revenue.
- **Secure Payment Integration**: Supports **Stripe** and **PayPal** payment gateways for seamless and secure transactions.
- **User Authentication & Roles**: Includes login functionality with role-based access control for different user types (cashiers, admins).
- **Barcode Scanning**: Enables fast product lookup using barcode scanning for quick and accurate sales entry.
- **Data Backup**: Regular backups of all transaction and inventory data to ensure data integrity and prevent loss.

---

## Technology Stack

- **Backend**: Python (Flask)
- **Frontend**: PyQt (for GUI), HTML5, CSS3, Bootstrap (for web-based admin interface)
- **Database**: SQLite for local data storage (easily scalable to MySQL/PostgreSQL)
- **Payment Integration**: Stripe, PayPal API for processing payments
- **Authentication**: JWT-based authentication for secure login and role management
- **Reports**: Built-in reporting module for generating sales reports

---

## Installation and Setup

### Backend Setup

1. **Clone the Repository**:  
   ```bash
   git clone https://github.com/afuyah/Small_medium_enterprEnviron.git

2. Set Up Virtual Environment:
Navigate to the backend directory:

cd backend/
python3 -m venv venv
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate  # Windows


3. Install Dependencies:
```
pip install -r requirements.txt
```

4. Configure Database:
Ensure that the database (SQLite or PostgreSQL) is properly set up, and update the DATABASE_URI in the .env file.


5. Run Flask Application:

flask run



Frontend Setup

1. Navigate to the Frontend Directory:

cd frontend/


2. Install Dependencies:

npm install


3. Start the Application:

npm start




---

Payment Integration

1. Set Up Stripe API:
Obtain Stripe API credentials and configure them in the .env file.


2. Set Up PayPal API:
Configure PayPal API credentials for handling payment transactions.




---

How to Contribute

1. Fork the Repository:
Click the "Fork" button at the top-right of the repository page.


2. Clone Your Fork:

git clone https://github.com/yourusername/pos-system.git


3. Create a Feature Branch:

git checkout -b feature-branch


4. Make Changes:
Implement new features or fix bugs.


5. Commit Changes:

git commit -am 'Add new feature'


6. Push to Your Fork:

git push origin feature-branch


7. Open a Pull Request:
Submit a pull request describing the changes made.




---

License

This project is licensed under the MIT License. See the LICENSE file for details.


---

Contact

For any inquiries, suggestions, or collaboration, feel free to reach out via email:
afuya.b@gmail.com.
