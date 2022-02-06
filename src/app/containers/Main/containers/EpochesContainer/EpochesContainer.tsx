import React from 'react';
import { useRoutes } from 'react-router-dom';

import { ROUTES_PATH } from '@app/shared/constants';
import {
  EpochesBase
} from '@app/containers/Main/containers';

const routes = [
  {
    path: '/',
    element: <EpochesBase />,
    exact: true,
  },
];

const EpochesContainer = () => {
  const content = useRoutes(routes);

  return <>{content}</>;
};

export default EpochesContainer;
