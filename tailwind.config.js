/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './app/**/*.{js,ts,jsx,tsx}',
        './components/**/*.{js,ts,jsx,tsx}',
        './pages/**/*.{js,ts,jsx,tsx}',
    ],
    theme: {
        extend: {
            maxWidth: {
                'xs': '20rem',    // 320px
                'sm': '24rem',    // 384px
                'md': '28rem',    // 448px
                'lg': '32rem',    // 512px
                'xl': '36rem',    // 576px
                '2xl': '42rem',   // 672px
                '3xl': '48rem',   // 768px
                '4xl': '56rem',   // 896px
                '5xl': '64rem',   // 1024px
                '6xl': '72rem',   // 1152px
                '7xl': '80rem',   // 1280px
                'full': '100%',
                'min': 'min-content',
                'max': 'max-content',
                'prose': '65ch',
            },
        },
        container: {
            center: true,
            padding: '1rem',
            screens: {
                sm: '540px',   // Bootstrap sm
                md: '720px',   // Bootstrap md
                lg: '960px',   // Bootstrap lg
                xl: '1140px',  // Bootstrap xl
                '2xl': '1320px' // Bootstrap xxl
            },
        },
    },
    plugins: [],
};
