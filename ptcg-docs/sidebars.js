/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  tutorialSidebar: [
    'intro',
    {
      type: 'category',
      label: 'Architecture',
      items: ['architecture/overview', 'architecture/client-side', 'architecture/server-side'],
    },
    {
      type: 'category',
      label: 'AI Enhancement',
      items: ['ai-enhancement/opportunities', 'ai-enhancement/integration', 'ai-enhancement/implementation'],
    },
  ],
};

module.exports = sidebars;
