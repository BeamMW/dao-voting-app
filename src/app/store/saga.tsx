import { all, fork } from 'redux-saga/effects';
import sharedSaga from '@app/shared/store/saga';
import mainSaga from '@app/containers/Main/store/saga';
import { treasurySaga } from '@app/containers/Treasury/store';

const allSagas = [sharedSaga, mainSaga, treasurySaga];

export default function* appSagas() {
  yield all(allSagas.map(fork));
}
