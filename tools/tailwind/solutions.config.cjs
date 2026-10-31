const cfg = {
      darkMode: 'class',
      theme: {
        extend: {
          colors: {
            void: '#07090e',
            gold: '#D4AF37',
            'gold-light': '#F3E5AB',
            glass: 'rgba(255, 255, 255, 0.03)',
            'glass-border': 'rgba(212, 175, 55, 0.2)'
          }
        }
      }
    };
cfg.content = ['./solutions.html'];
cfg.corePlugins = cfg.corePlugins || {};
module.exports = cfg;
