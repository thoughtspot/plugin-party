import { SearchBarEmbed } from '@thoughtspot/visual-embed-sdk/react';
import { useLoader } from 'widgets/lib/loader';
import { Vertical } from 'widgets/lib/layout/flex-layout';
import { useShellContext } from 'gsuite-shell';
import { parseHeaderAndRows } from './search-bar.util';
import './search-bar.scss';

export const TSSearchBar = () => {
  const loader = useLoader();
  const { run } = useShellContext();

  const onData = (event) => {
    const payload = event.data.embedAnswerData;
    const { colNames, rows } = parseHeaderAndRows(payload);
    run('updateData', colNames, rows);
  };
  return (
    <Vertical className="search-bar">
      <SearchBarEmbed
        onData={onData}
        onLoad={() => loader.hide()}
      ></SearchBarEmbed>
    </Vertical>
  );
};
