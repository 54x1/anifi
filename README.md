### AniFi - MVP_Ver1.0


### Does not read any personal finances everything is stored locally on your own machine and only reads in your owe local browser!!!


### As of 2025 currently Supports* - Westpac | Nab | ANZ | CommBank | St Geroge | ING | Macquarie | Up | UBank | and more too come...
* Need more testers 

### Fixes:
### Fix - Auto select all categories present when loading Chart Page
### Fix - Type padding CSS 
### Fix - Bulk Actions - eg BULK CRUD
### Fix - UI date to local browser settings / hard code dd-mm-yyyy  /or both mm-dd-yyyy


### Future:
### Add - Custom user categoies 
### Add - Custom user colors



### Prerequisites
- Node.js 22.12+ 
- npm or yarn

### Installation
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Development Server
The application will be available at `http://localhost:3000`


## 🔧 Customization

### Adding New Themes
Add custom themes to `tailwind.config.js`:
```javascript
daisyui: {
  themes: [
    // ... existing themes
    {
      "custom": {
        "primary": "#your-color",
        "secondary": "#your-color",
        // ... more colors
      }
    }
  ]
}


