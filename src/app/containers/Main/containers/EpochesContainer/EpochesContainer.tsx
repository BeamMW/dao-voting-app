import React from 'react';
import { useRoutes } from 'react-router-dom';

import { ROUTES_PATH } from '@app/shared/constants';
import {
  EpochesBase,
  EpochsFuture,
  EpochsPrevious,
  EpochPage
} from '@app/containers/Main/containers';

const routes = [
  {
    path: ROUTES_PATH.MAIN.EPOCHES,
    element: <EpochesBase />,
    exact: true,
  },
  {
    path: ROUTES_PATH.MAIN.FUTURE_EPOCHS,
    element: <EpochsFuture />,
    exact: true,
  },
  {
    path: ROUTES_PATH.MAIN.PREVIOUS_EPOCH,
    element: <EpochsPrevious />,
    exact: true,
  },
  {
    path: ROUTES_PATH.MAIN.EPOCH_PAGE,
    element: <EpochPage />,
    exact: true,
  }
];

const EpochesContainer = () => {
  const content = useRoutes(routes);

  return <>{content}</>;
};

export default EpochesContainer;
