/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
    theme: {
        extend: {
            animation: {
                fall: 'fall 600ms cubic-bezier(0.8, 0, 1, 1)',
                shake: 'shake 0.82s cubic-bezier(.36,.07,.19,.97)',
            },
            keyframes: {
                fall: {
                    '0%': { transform: 'translateY(-400%)' },
                    '100%': { transform: 'translateY(0)' },
                },
                shake: {
                    '10%': { transform: 'translateX(-1px)' },
                    '20%': { transform: 'translateX(2px)' },
                    '30%': { transform: 'translateX(-4px)' },
                    '40%': { transform: 'translateX(4px)' },
                    '50%': { transform: 'translateX(-4px)' },
                    '60%': { transform: 'translateX(4px)' },
                    '70%': { transform: 'translateX(-4px)' },
                    '80%': { transform: 'translateX(2px)' },
                    '90%': { transform: 'translateX(-1px)' },
                },
            },
        },
    },
    plugins: [require('@tailwindcss/forms')],
}
