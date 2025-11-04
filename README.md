# NoteLoom 📝

A modern, feature-rich journaling and note-taking application built with React and TypeScript. NoteLoom offers a flexible, customizable experience for capturing your thoughts, ideas, and memories with support for multiple journals, custom templates, and optional cloud sync.

![NoteLoom](https://img.shields.io/badge/NoteLoom-v1.0-blue)
![React](https://img.shields.io/badge/React-19.2.0-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-6.4-646CFF?logo=vite)

## ✨ Features

### Core Functionality
- **Multiple Journals**: Organize your notes into separate journals for different topics, projects, or purposes
- **Custom Templates**: Create reusable templates with custom fields for structured note-taking
- **Rich Text Editor**: Write and format your entries with a powerful rich text editor
- **Custom Fields**: Define custom field types (text, number, date, rating, dropdown, etc.) for your templates
- **Categories**: Organize custom fields into categories for better management
- **Entry Management**: Create, edit, and organize entries within your journals
- **Multiple Profiles**: Support for multiple user profiles with independent data

### Data Management
- **Local-First Architecture**: All data is stored locally using IndexedDB for fast, offline access
- **Optional Cloud Sync**: Sync your data across devices using Supabase (completely optional)
- **Export Options**: Export your entries to PDF or DOCX format
- **Import/Export**: Backup and restore your data with JSON import/export

### Customization
- **Theme Support**: Light and dark themes with customizable accent colors
- **Typography**: Choose from multiple font families, sizes, and line spacing
- **Layout Options**: Adjustable text width and view density settings
- **Responsive Design**: Works seamlessly on desktop and mobile devices

### Optional Features
- **Cloud Sync**: Optional Supabase integration for cross-device synchronization
- **Offline-First**: Full functionality without internet connection

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v16 or higher)
- **npm** or **yarn**

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/noteloom.git
   cd noteloom
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

That's it! NoteLoom works out of the box with local storage. No additional configuration required.

## ⚙️ Configuration

### Optional: Supabase Cloud Sync

If you want to sync your data across multiple devices, you can set up Supabase (completely optional):

1. **Create a `.env.local` file** in the project root:
   ```bash
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

2. **Follow the setup guide** in [`Supabase Setup Info/README.md`](./Supabase%20Setup%20Info/README.md) for detailed instructions.

**Note**: The app works perfectly without Supabase using local storage only. Supabase is only needed if you want cloud sync.

   ```

## 📦 Building for Production

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

The built files will be in the `dist` directory.

## 🏗️ Project Structure

```
noteloom/
├── index.html              # Main HTML file
├── index.tsx               # Main React application
├── package.json            # Dependencies and scripts
├── vite.config.ts          # Vite configuration
├── tsconfig.json           # TypeScript configuration
├── supabase.config.ts      # Supabase configuration (optional)
├── vite-env.d.ts           # TypeScript environment definitions
├── Supabase Setup Info/    # Supabase setup documentation
│   ├── README.md           # Detailed Supabase setup guide
│   ├── create_user_data_table.sql
│   └── supabase_rls_policies.sql
└── dist/                   # Production build (generated)
```

## 🛠️ Technologies Used

- **React 19.2** - UI library
- **TypeScript 5.8** - Type safety
- **Vite 6.4** - Build tool and dev server
- **IndexedDB** (via Dexie) - Local database
- **Supabase** - Optional cloud backend
- **React DOM** - DOM rendering

## 📝 Usage

### Creating Your First Journal

1. Click on the **"Journals"** view in the sidebar
2. Click **"New Journal"**
3. Enter a name for your journal
4. Optionally select a default template
5. Click **"Create"**

 ### Creating Custom Fields

1. Go to the **"Custom Fields"** view
2. Click **"New Category" to add a new category, or "New Field" to dive right in.**
3. Fill out Field Name
4. Choose Field Type
   - Depending on Field, it will guide you through filling out more information
5. (optionally, and if you created a category) Add it to a category (if not already on category's screen)
6. Save and make more or create a template

### Creating Templates

1. Go to the **"Templates"** view
2. Click **"New Template"** or browse premade
3. Add blocks (fields) to your template:
4. Customize colors and labels
5. Save your template

### Writing Entries

1. Select a journal from the sidebar
2. Click **"New Entry"**
3. Choose a template (or use the journal's default)
4. Fill in the fields
5. Use the rich text editor for text fields
6. Save your entry

### Exporting Data

1. Don't do anything, this feature is mostly broken right now. I plan to get it working soon.

### Cloud Sync (Optional)

If Supabase is configured:

1. Create a profile with **"Enable server-side sync"** checked
2. Enter a username and secret phrase (minimum 6 characters)
3. Your data will automatically sync across devices
4. Access your notes from any device with the same credentials

## 🔒 Privacy & Security

- **Local-First**: All data is stored locally by default
- **Optional Sync**: Cloud sync is completely optional
- **No Tracking**: No analytics or tracking by default
- **Secure Authentication**: If using Supabase, authentication uses secure, industry-standard methods
- **Row Level Security**: Supabase RLS policies ensure users can only access their own data

## 🐛 Troubleshooting

### App Won't Start

- Make sure Node.js v16+ is installed
- Run `npm install` to ensure all dependencies are installed
- Check for error messages in the terminal

### Data Not Syncing

- Verify your `.env.local` file has correct Supabase credentials
- Check the browser console for error messages
- Ensure Supabase is properly configured (see [Supabase Setup Guide](./Supabase%20Setup%20Info/README.md))
- Restart the dev server after updating `.env.local`

### Export Not Working

- Make sure you have entries created
- Check browser console for errors
- Ensure you've selected entries to export

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Built with [React](https://react.dev/)
- Powered by [Vite](https://vitejs.dev/)
- Local storage handled by [Dexie](https://dexie.org/)
- Cloud sync powered by [Supabase](https://supabase.com/) (optional)

## 📞 Support

For issues, questions, or contributions:

1. Check the [Supabase Setup Guide](./Supabase%20Setup%20Info/README.md) for cloud sync setup
2. Review the browser console for error messages
3. Open an issue on GitHub

---

**NoteLoom** - Weave your thoughts into beautiful journals ✨

