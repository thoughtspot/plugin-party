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
      const { colNames, rows } = await getQueryResult(query, source);
      const ifColumnIsDate = fetchedData.columns.map(
        (col) =>
          col.column.dataType === 'DATE' || col.column.dataType === 'DATE_TIME'
      );

      const formattedRows = rows.map((row) => {
        const modifiedData = row.map((value, index) => {
          if (ifColumnIsDate[index]) {
            return formatDate(colNames[index], value);
          }
          if (value?.v) {
            return value.v?.s;
          }
          return value;
        });
        return modifiedData;
      });
      loader.show();
      await run('updateData', colNames, formattedRows);
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
        onData={(data) => {
          loader.show();
          return onGetDataClick(data.data.embedAnswerData);
        }}
        className={'search-bar-iframe'}
      ></SearchBarEmbed>
    </Vertical>
  );
};
