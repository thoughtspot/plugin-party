import {
  SearchBarEmbed,
  useEmbedRef,
} from '@thoughtspot/visual-embed-sdk/react';
import { HostEvent } from '@thoughtspot/visual-embed-sdk';
import { useEffect } from 'preact/hooks';
import { useLoader } from 'widgets/lib/loader';
import { Vertical } from 'widgets/lib/layout/flex-layout';
import { useShellContext } from 'gsuite-shell';
import { parseHeaderAndRows, debounce } from './search-bar.util';
import { getQueryResult } from '../../services/api';
import './search-bar.scss';

export const TSSearchBar = () => {
  const loader = useLoader();
  const { run } = useShellContext();
  const embed = useEmbedRef();

  const onData = (event) => {
    const payload = event.data.embedAnswerData;
    const { colNames, rows } = parseHeaderAndRows(payload);
    run('updateData', colNames, rows);
  };
  const onGetDataClick = debounce(() => {
    // TODO(Ashish): Remove short circuit once the GetData non memo
    // bug is fixed.
    return;
    embed.current.trigger(HostEvent.GetTML).then(async (data) => {
      const query = data.answer.search_query;
      if (!query) {
        return;
      }
      const source = data.answer.tables[0].id;
      const { colNames, rows } = await getQueryResult(query, source);
      loader.show();
      await run('updateData', colNames, rows);
      loader.hide();
    });
  }, 100);
  return (
    <Vertical className="search-bar">
      <SearchBarEmbed
        onData={onData}
        ref={embed}
        onLoad={() => loader.hide()}
        onGetDataClick={() => {
          loader.show();
          return onGetDataClick();
        }}
      ></SearchBarEmbed>
    </Vertical>
  );
};
