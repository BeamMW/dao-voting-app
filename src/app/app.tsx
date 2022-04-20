import React, { useEffect } from 'react';
import { ROUTES } from '@app/shared/constants';

import { actions as sharedActions, selectors as sharedSelectors } from '@app/shared/store';
import 'react-toastify/dist/ReactToastify.css';

import { useNavigate, useRoutes } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import { EpochesContainer } from './containers/Main';
import { ToastContainer } from 'react-toastify';

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
    <>
      {content}
      <ToastContainer
          position="bottom-right"
          autoClose={3000}
          hideProgressBar
          newestOnTop={false}
          closeOnClick
          closeButton={false}
          rtl={false}
          pauseOnFocusLoss={false}
          draggable={false}
          pauseOnHover={false}
          icon={false}
          toastStyle={{
            textAlign: 'center',
            background: 'rgba(0, 242, 207, 0.1)',
            backdropFilter: 'blur(100px)',
            color: 'white',
            width: '90%',
            margin: '0 auto 16px',
            borderRadius: '10px',
          }}
        />
    </>
  );
};

export default App;
