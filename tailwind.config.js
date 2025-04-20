/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./resources/blade/welcome.blade.php",
      "./src/**/*.{js,ts,jsx,tsx}", // Ensure Tailwind scans all JSX/TSX files
    ],
    theme: {
      extend: {}, // You can add custom styles here
    },
    plugins: [],
  };
