# Expensly - Smart Budget Tracker

A comprehensive personal finance management web application built with vanilla JavaScript, HTML5, and CSS3.

## Features

### 🔐 Authentication System
- User login and registration
- Session management with localStorage
- Demo account for testing

### 💰 Financial Management
- Add income and expense transactions
- Categorize transactions (Food, Rent, Travel, etc.)
- Real-time balance calculation
- Transaction history with search and filtering

### 📊 Analytics & Visualizations
- Financial overview dashboard
- Pie chart for expense categories
- Line chart for monthly spending trends
- Interactive data visualizations using Chart.js

### 🎯 Budget Management
- Set monthly budget limits by category
- Visual progress bars showing budget utilization
- Smart budget alerts and warnings
- Overspending notifications

### 💡 Savings Goals
- Create and track multiple savings goals
- Visual progress indicators with percentages
- Goal deadlines and target amounts
- Update progress functionality

### 🎨 Modern UI/UX
- Clean, responsive design
- Dark mode toggle
- Mobile-friendly interface
- Smooth animations and transitions
- Toast notifications for user feedback

## Technologies Used

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Charts**: Chart.js for data visualization
- **Icons**: Font Awesome
- **Storage**: localStorage for data persistence
- **Styling**: Custom CSS with CSS variables for theming

## Setup Instructions

1. **Download the files**:
   - `index.html` - Main HTML file
   - `style.css` - All styles and responsive design
   - `app.js` - Application logic and functionality

2. **Local Development**:
   ```bash
   # Simply open index.html in any modern web browser
   # Or use a local server for better experience:

   # Using Python
   python -m http.server 8000

   # Using Node.js
   npx serve .

   # Using PHP
   php -S localhost:8000
   ```

3. **Demo Account**:
   - Email: `demo@expensly.com`
   - Password: `demo123`

## File Structure

```
expensly/
├── index.html          # Main HTML structure
├── style.css           # Styles and responsive design
├── app.js             # JavaScript functionality
└── README.md          # Project documentation
```

## Key Components

### HTML Structure (`index.html`)
- Landing page with authentication forms
- Main application dashboard
- Sidebar navigation
- Content sections for each feature
- Modal-like forms for data entry

### Styling (`style.css`)
- CSS custom properties for theming
- Responsive grid layouts
- Dark mode support
- Component-based styling
- Mobile-first design approach

### JavaScript Functionality (`app.js`)
- Application state management
- LocalStorage data persistence
- Chart.js integration for visualizations
- Form validation and error handling
- User authentication logic
- Real-time data updates

## Features in Detail

### Dashboard
- Financial overview cards (Income, Expenses, Balance)
- Interactive pie chart showing expense breakdown
- Monthly trend line chart
- Recent transactions list

### Transaction Management
- Add income with categories (Job, Freelance, Investment, Other)
- Add expenses with categories (Food, Rent, Travel, Entertainment, Utilities, Other)
- View all transactions with filtering options
- Delete transactions with confirmation

### Budget System
- Set monthly budget limits per category
- Visual progress bars with color coding
- Budget utilization percentages
- Automatic alerts when approaching or exceeding limits

### Savings Goals
- Create goals with target amounts and deadlines
- Circular progress indicators
- Update progress functionality
- Multiple goal tracking

### Dark Mode
- Toggle between light and dark themes
- Persistent theme selection
- Automatic chart color updates
- Smooth theme transitions

## Browser Compatibility

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Data Storage

The application uses browser localStorage for data persistence:
- `expensly_users` - User accounts
- `expensly_current_user` - Current session
- `expensly_transactions` - All transactions
- `expensly_budgets` - Budget settings
- `expensly_savings_goals` - Savings goals
- `expensly_dark_mode` - Theme preference

## Contributing

This is a demonstration project. For production use, consider:
- Adding server-side authentication
- Implementing database storage
- Adding data encryption
- Including automated testing
- Implementing PWA features

## License

This project is open source and available under the MIT License.

**Demo Credentials:**
- Email: demo@expensly.com
- Password: demo123

---

Built with vanilla JavaScript, HTML5, and CSS3.

linkdin- www.linkedin.com/in/prajwal1320
