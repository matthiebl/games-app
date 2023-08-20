/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
    theme: {
        extend: {
            animation: {
                fall: 'fall 600ms cubic-bezier(0.8, 0, 1, 1)',
            },
            keyframes: {
                fall: {
                    '0%': { transform: 'translateY(-400%)' },
                    '100%': { transform: 'translateY(0)' },
                },
            },
        },
    },
    plugins: [require('@tailwindcss/forms')],
}
