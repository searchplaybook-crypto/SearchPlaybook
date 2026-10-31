# Rebuilding the compiled Tailwind CSS

The pages index.html, solutions.html and collective.html load pre-built CSS from
assets/css/tw-index.css, tw-solutions.css and tw-collective.css instead of the Tailwind
browser build. Viewing and editing the HTML needs no build step. Only when you add or
change Tailwind classes in one of those three pages, rebuild that page's file:

    npm i tailwindcss@3.4.17 @tailwindcss/forms @tailwindcss/container-queries
    npx tailwindcss -c tools/tailwind/<page>.config.cjs -i tools/tailwind/in.css -o assets/css/tw-<page>.css --minify

Configs live in tools/tailwind/. The colour and font settings in them are the ones that used
to sit inline in each page.
