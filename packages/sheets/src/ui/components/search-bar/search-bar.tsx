import {
  SearchBarEmbed,
  useEmbedRef,
} from '@thoughtspot/visual-embed-sdk/react';
import { Action, HostEvent } from '@thoughtspot/visual-embed-sdk';
import { useLoader } from 'widgets/lib/loader';
import { Vertical } from 'widgets/lib/layout/flex-layout';
import { useShellContext } from 'gsuite-shell';
import { debounce, formatDate } from './search-bar.util';
import { getQueryResult } from '../../services/api';
import './search-bar.scss';

export const TSSearchBar = () => {
  const loader = useLoader();
  const { run } = useShellContext();
  const embed = useEmbedRef();

  const onGetDataClick = debounce((fetchedData) => {
    embed.current.trigger(HostEvent.GetTML).then(async (data) => {
      const query = data.answer.search_query;
      if (!query) {
        return;
      }
      const source = data.answer.tables[0].id;
      const ifColumnIsDate = fetchedData.columns.map(
        (col) =>
          col.column.dataType === 'DATE' || col.column.dataType === 'DATE_TIME'
      );
      console.log('query', query, source, ifColumnIsDate);

      loader.show();
      await run('updateData', query, source, ifColumnIsDate);
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
          '[data-testid="modal-container"]': {
            zoom: '0.6',
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
        useLastSelectedSources={true}
        customizations={customization}
        onLoad={() => loader.hide()}
        onData={(data) => {
          loader.show();
          return onGetDataClick(data.data.embedAnswerData);
        }}
        className={'search-bar-iframe'}
      ></SearchBarEmbed>
    </Vertical>
  );
};
