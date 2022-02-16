import React, { useEffect } from 'react';
import { ROUTES } from '@app/shared/constants';

import { actions as sharedActions, selectors as sharedSelectors } from '@app/shared/store';

import { useNavigate, useRoutes } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import { EpochesContainer } from './containers/Main';

import './styles';

const routes = [
  {
    path: '/',
    element: <></>,
  },
  {
    path: `${ROUTES.MAIN.BASE}/*`,
    element: <EpochesContainer />,
  }
];

const App = () => {
  const dispatch = useDispatch();
  const content = useRoutes(routes);
  const navigate = useNavigate();
  const navigateURL = useSelector(sharedSelectors.selectRouterLink());

  useEffect(() => {
    if (navigateURL) {
      navigate(navigateURL);
      dispatch(sharedActions.navigate(''));
    }
  }, [navigateURL, dispatch, navigate]);
  
  return (
    <>{content}</>
  );
};

export default App;
