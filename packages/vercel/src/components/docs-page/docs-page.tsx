import React, { useState, useEffect } from 'react';
import { Menu, Button, message } from 'antd';
import { EmbedTemplates } from './embed-code-templates';

export const DocsPage = () => {
  const [selectedOption, setSelectedOption] = useState('option1');
  // add the three params
  const codeMap = {
    option1: EmbedTemplates.SearchEmbed(
      'https://champagne-grapes.thoughtspotdev.cloud/',
      '',
      ''
    ),
    option2: EmbedTemplates.SageEmbed(
      'https://champagne-grapes.thoughtspotdev.cloud/',
      '',
      ''
    ),
  };

  const handleOptionChange = (e) => {
    console.log(e);
    setSelectedOption(e.key);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(codeMap[selectedOption]);
    message.success('Code copied to clipboard');
  };

  return (
    <div>
      <Menu
        mode="horizontal"
        selectedKeys={[selectedOption]}
        onClick={handleOptionChange}
      >
        <Menu.Item key="option1">Option 1</Menu.Item>
        <Menu.Item key="option2">Option 2</Menu.Item>
      </Menu>
      <div style={{ padding: '16px' }}>
        <div
          style={{
            background: 'black',
            padding: '16px',
            borderRadius: '8px',
            height: '100vh',
            width: '100vw',
            overflow: 'auto',
            position: 'relative',
          }}
        >
          <Button
            type="primary"
            onClick={handleCopyCode}
            style={{
              position: 'absolute',
              top: '10px', // Adjust the button's position as needed
              right: '50px',
              background: 'white',
              color: 'black',
              zIndex: 1,
            }}
          >
            Copy Code
          </Button>
          <pre style={{ color: 'white', fontSize: '14px' }}>
            {codeMap[selectedOption]}
          </pre>
        </div>
      </div>
    </div>
  );
};
