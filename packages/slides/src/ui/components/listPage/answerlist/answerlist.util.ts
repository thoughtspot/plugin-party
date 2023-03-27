import { useTranslations } from 'i18n/lib';
import { listCategory } from '../listPage.util';

export const useGetEmptyAnswerListMessageMap = () => {
  const { t } = useTranslations();
  return {
    [listCategory.ALL]: {
      emptyIcon: 'rd-icon-no-pinboards',
      emptyMessageTile: t.EMPTY_ANSWER_ALL_LIST_MESSAGE_TITLE,
      emptyMessageDescription: t.EMPTY_ANSWER_ALL_LIST_MESSAGE_DESCRIPTION,
    },
    [listCategory.FAVORITES]: {
      emptyIcon: 'rd-icon-no-favorites',
      emptyMessageTile: t.EMPTY_ANSWER_FAVORITES_LIST_MESSAGE_TITLE,
      emptyMessageDescription:
        t.EMPTY_ANSWER_FAVORITES_LIST_MESSAGE_DESCRIPTION,
    },
    [listCategory.YOURS]: {
      emptyIcon: 'rd-icon-no-yours',
      emptyMessageTile: t.EMPTY_ANSWER_YOURS_LIST_MESSAGE_TITLE,
      emptyMessageDescription: t.EMPTY_ANSWER_YOURS_LIST_MESSAGE_DESCRIPTION,
    },
  };
};
