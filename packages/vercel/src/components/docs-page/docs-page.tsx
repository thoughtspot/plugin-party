import React, { useState } from 'react';
import { Menu, message } from 'antd';
import { Button } from 'widgets/lib/button';
import { EmbedTemplates } from './embed-code-templates';

export const DocsPage = (params: any) => {
  const [selectedOption, setSelectedOption] = useState('option1');
  // add the three params
  const codeMap = {
    SearchEmbed: EmbedTemplates.SearchEmbed(params),
    SageEmbed: EmbedTemplates.SageEmbed(params),
    LiveboardEmbed: EmbedTemplates.LiveboardEmbed(params),
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
        <Menu.Item key="SearchEmbed">Search Embed</Menu.Item>
        <Menu.Item key="SageEmbed">Sage Embed</Menu.Item>
        <Menu.Item key="LiveboardEmbed">Liveboard Embed</Menu.Item>
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
          <Button onClick={handleCopyCode} text="Copy Code"></Button>
          <Button onClick={closeVercelModal} text="Complete the Setup"></Button>
          <pre style={{ color: 'white', fontSize: '14px' }}>
            {codeMap[selectedOption]}
          </pre>
        </div>
      </div>
    </div>
  );
};
