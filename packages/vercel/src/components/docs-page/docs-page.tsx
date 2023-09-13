import React, { useState, useEffect } from 'react';
import { Menu, Button, message } from 'antd';
import { EmbedTemplates } from './embed-code-templates';

export const DocsPage = ({ hostUrl, secretKey }: any) => {
  const [selectedOption, setSelectedOption] = useState('option1');
  // add the three params
  const codeMap = {
    option1: EmbedTemplates.SearchEmbed(hostUrl, secretKey, ''),
    option2: EmbedTemplates.SageEmbed(hostUrl, secretKey, ''),
    option3: EmbedTemplates.LiveboardEmbed(hostUrl, secretKey, ''),
  };

  const handleOptionChange = (e) => {
    setSelectedOption(e.key);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(codeMap[selectedOption]);
    message.success('Code copied to clipboard');
  };

  const closeVercelModal = () => {
    window.location.href =
      new URLSearchParams(window.location.search).get('next') || '';
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
        <Menu.Item key="option3">Option 3</Menu.Item>
      </Menu>
      <div style={{ padding: '16px' }}>
        <div
          style={{
            background: 'black',
            padding: '16px',
            borderRadius: '8px',
            height: '80vh',
            width: '60vw',
            whiteSpace: 'pre-wrap',
            overflow: 'auto',
            position: 'relative',
          }}
        >
          <Button
            type="primary"
            onClick={handleCopyCode}
            style={{
              position: 'absolute',
              top: '20px', // Adjust the button's position as needed
              right: '20px',
              background: 'white',
              color: 'black',
              zIndex: 1,
            }}
          >
            Copy Code
          </Button>
          <Button
            type="primary"
            onClick={closeVercelModal}
            style={{
              position: 'absolute',
              bottom: '20px', // Adjust the button's position as needed
              right: '20px',
              background: 'white',
              color: 'black',
              zIndex: 1,
            }}
          >
            Complete the Setup
          </Button>
          <pre style={{ color: 'white', fontSize: '14px' }}>
            {codeMap[selectedOption]}
          </pre>
        </div>
      </div>
    </div>
  );
};
