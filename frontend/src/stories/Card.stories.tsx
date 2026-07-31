import type { Meta, StoryObj } from '@storybook/react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

const meta: Meta<typeof Card> = {
  title: 'UI/Card',
  component: Card,
  tags: ['autodocs'],
  render: (args) => (
    <Card {...args}>
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
      </CardHeader>
      <CardContent>This is the card content area.</CardContent>
    </Card>
  ),
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Default: Story = {};

export const WithCustomClass: Story = {
  args: {
    className: 'border-primary/50 shadow-lg',
  },
};
