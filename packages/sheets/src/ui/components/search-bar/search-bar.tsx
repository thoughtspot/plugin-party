import {
  SearchBarEmbed,
  useEmbedRef,
} from '@thoughtspot/visual-embed-sdk/react';
import { Action, HostEvent } from '@thoughtspot/visual-embed-sdk';
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

  const onGetDataClick = debounce(() => {
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
  }, 0);
  const customization = {
    style: {
      customCSS: {
        rules_UNSTABLE: {
          '.modal-module__footer': {
            'padding-left': '0px !important',
          },
        },
      },
    },
  };
  return (
    <Vertical className="search-bar">
      <SearchBarEmbed
        ref={embed}
        hiddenActions={[
          Action.AddFormula,
          Action.AddParameter,
          Action.CollapseDataSources,
        ]}
        customizations={customization}
        onLoad={() => loader.hide()}
        onData={() => {
          loader.show();
          return onGetDataClick();
        }}
        className={'search-bar-iframe'}
      ></SearchBarEmbed>
    </Vertical>
  );
};
