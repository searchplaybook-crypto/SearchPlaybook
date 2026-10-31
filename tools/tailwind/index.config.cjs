const cfg = {
            theme: {
                extend: {
                    colors: {
                        'gold-100': '#FCEEB5',
                        'gold-300': '#F0D676',
                        'mafia-gold': '#D4AF37',
                        'gold-700': '#A08326',
                        'near-white': '#F9F9F9',
                        'platinum': '#E4E4E7',
                        'zinc-500': '#71717A',
                        'onyx': '#18181B',
                        'void-black': '#09090B',
                        'icy-azure': '#43CFFD',
                        'forged-copper': '#B66E41',
                        'warm-yellow': '#FDBF2D'
                    },
                    fontFamily: {
                        'display': ['Montserrat', 'sans-serif'],
                        'body': ['Inter', 'sans-serif'],
                        'accent': ['Raleway', 'sans-serif'],
                    },
                    animation: {
                        'float': 'float 6s ease-in-out infinite',
                        'float-slow': 'float 8s ease-in-out infinite',
                        'pulse-glow': 'pulseGlow 3s ease-in-out infinite',
                        'shimmer': 'shimmer 2s linear infinite',
                        'reveal': 'reveal 0.8s ease-out forwards',
                        'slide-up': 'slideUp 0.6s ease-out forwards',
                    },
                    keyframes: {
                        float: {
                            '0%, 100%': { transform: 'translateY(0px)' },
                            '50%': { transform: 'translateY(-20px)' },
                        },
                        pulseGlow: {
                            '0%, 100%': { boxShadow: '0 0 20px rgba(212, 175, 55, 0.3)' },
                            '50%': { boxShadow: '0 0 40px rgba(212, 175, 55, 0.6)' },
                        },
                        shimmer: {
                            '0%': { backgroundPosition: '-200% 0' },
                            '100%': { backgroundPosition: '200% 0' },
                        },
                        reveal: {
                            '0%': { opacity: '0', transform: 'translateY(30px)' },
                            '100%': { opacity: '1', transform: 'translateY(0)' },
                        },
                        slideUp: {
                            '0%': { opacity: '0', transform: 'translateY(50px)' },
                            '100%': { opacity: '1', transform: 'translateY(0)' },
                        }
                    }
                }
            }
        };
cfg.content = ['./index.html'];
cfg.corePlugins = cfg.corePlugins || {};
module.exports = cfg;
