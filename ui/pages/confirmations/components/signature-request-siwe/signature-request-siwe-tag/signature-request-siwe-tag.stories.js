import React from 'react';
import SignatureRequestSIWETag from '.';

export default {
  title:
    'Confirmations/Components/SignatureRequestSIWE/SignatureRequestSIWETag',

  argTypes: {
    text: { control: 'text' },
  },
};

export const DefaultStory = (args) => <SignatureRequestSIWETag {...args} />;

DefaultStory.storyName = 'Default';

DefaultStory.args = {
  text: 'Unsafe',
};
