import type { Preview } from '@storybook/nextjs';
import '../src/app/globals.css';

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      options: {
        dark: { name: 'dark', value: '#0a0a0a' },
        light: { name: 'light', value: '#ffffff' }
      }
    },
  },

  tags: ['autodocs'],

  initialGlobals: {
    backgrounds: {
      value: 'dark'
    }
  }
};

export default preview;
