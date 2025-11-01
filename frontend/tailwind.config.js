/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      screens: {
        xs: "475px",   // Small phones
        sm: "640px",   // Phones (Portrait)
        md: "768px",   // Tablets
        lg: "1024px",  // Small laptops
        xl: "1280px",  // Desktops
        "2xl": "1536px", // Large screens / Full HD
      },
    },
  },
  plugins: [],
};
