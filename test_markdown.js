const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const ReactMarkdown = require('react-markdown').default || require('react-markdown');
const rehypeRaw = require('rehype-raw').default || require('rehype-raw');

function test() {
  const markdown = "![Image](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=)";
  
  const element = React.createElement(ReactMarkdown, {
    rehypePlugins: [rehypeRaw],
    urlTransform: (url) => { console.log('Transforming:', url.substring(0, 50)); return url; },
    children: markdown
  });

  const html = renderToStaticMarkup(element);
  console.log("Output HTML:", html);
}

test();
