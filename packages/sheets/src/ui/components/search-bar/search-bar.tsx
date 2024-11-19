import {
  SearchBarEmbed,
  useEmbedRef,
} from '@thoughtspot/visual-embed-sdk/react';
import { Action, HostEvent } from '@thoughtspot/visual-embed-sdk';
import { useCallback, useState } from 'preact/hooks';
import { useLoader } from 'widgets/lib/loader';
import { Vertical } from 'widgets/lib/layout/flex-layout';
import { useTranslations } from 'i18n';
import { useShellContext } from 'gsuite-shell';
import { SuccessBanner } from 'widgets/lib/success-banner';
import { ErrorBanner } from 'widgets/lib/error-banner';
import { memo } from 'preact/compat';
import { debounce, formatDate } from './search-bar.util';
import { getQueryResult } from '../../services/api';
import './search-bar.scss';

export const TSSearchBar = () => {
  const loader = useLoader();
  const { run } = useShellContext();
  const embed = useEmbedRef();
  const { t } = useTranslations();
  const [errorMessage, setErrorMessage] = useState({
    visible: false,
    message: '',
  });
  const [success, setSuccess] = useState(false);

  const onGetDataClick = debounce((fetchedData) => {
    loader.show();
    embed.current
      .trigger(HostEvent.GetTML)
      .then(async (data) => {
        const query = data.answer.search_query;
        if (!query) {
          return;
        }
        const source = data.answer.tables[0].id;
        const { colNames, rows } = await getQueryResult(query, source);
        const ifColumnIsDate = fetchedData.columns.map(
          (col) =>
            col.column.dataType === 'DATE' ||
            col.column.dataType === 'DATE_TIME'
        );

        const formattedRows = rows.map((row) => {
          return row.map((value, index) => {
            if (ifColumnIsDate[index]) {
              return formatDate(colNames[index], value);
            }
            if (value?.v) {
              return value.v?.s;
            }
            return value;
          });
        });
        await run(
          'updateData',
          query,
          source,
          ifColumnIsDate,
          formattedRows,
          colNames
        );
        setSuccess(true);
        loader.hide();
      })
      .catch((error) => {
        setErrorMessage({
          visible: true,
          message: t.DATA_INSERT_FAILURE_MESSAGE,
        });
        setSuccess(false);
        loader.hide();
      });
  }, 0);

  const onLoad = useCallback(() => {
    loader.hide();
  }, []);

  const onData = useCallback((data) => {
    loader.show();
    return onGetDataClick(data.data.embedAnswerData);
  }, []);

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
      <SuccessBanner
        successMessage={t.DATA_INSERT_SUCCESS_MESSAGE}
        showBanner={success}
        onCloseIconClick={() => setSuccess(false)}
        className={'success-banner'}
      />
      <ErrorBanner
        errorMessage={errorMessage.message}
        showBanner={errorMessage.visible}
        onCloseIconClick={() =>
          setErrorMessage({ ...errorMessage, visible: false })
        }
        className={'error-banner'}
      />
      <SearchBarEmbed
        ref={embed}
        hiddenActions={[
          Action.AddFormula,
          Action.AddParameter,
          Action.CollapseDataSources,
        ]}
        useLastSelectedSources={true}
        customizations={customization}
        onLoad={onLoad}
        onData={onData}
        className={'search-bar-iframe'}
      ></SearchBarEmbed>
    </Vertical>
  );
};
