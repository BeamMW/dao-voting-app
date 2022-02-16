import React from 'react';
import { useRoutes } from 'react-router-dom';

import { ROUTES_PATH } from '@app/shared/constants';
import {
  EpochesBase,
  EpochsFuture
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
  },
];

const EpochesContainer = () => {
  const content = useRoutes(routes);

  return <>{content}</>;
};

export default EpochesContainer;
