import _ from 'underscore';
import { get } from '../utils/fetch';
import { addNotification } from './notifications';
import { staticfilesAPIUrl, staticfileAPIUrl } from '../constants/api';
import {
  getSuccessMessage,
  getErrorMessage,
  getUploadSuccessMessage,
  getUploadErrorMessage
} from '../translations';

// Action Types
export const FETCH_STATICFILES_REQUEST = 'FETCH_STATICFILES_REQUEST';
export const FETCH_STATICFILES_SUCCESS = 'FETCH_STATICFILES_SUCCESS';
export const FETCH_STATICFILES_FAILURE = 'FETCH_STATICFILES_FAILURE';
export const FETCH_STATICFILE_REQUEST = 'FETCH_STATICFILE_REQUEST';
export const FETCH_STATICFILE_SUCCESS = 'FETCH_STATICFILE_SUCCESS';
export const FETCH_STATICFILE_FAILURE = 'FETCH_STATICFILE_FAILURE';
export const PUT_STATICFILE_REQUEST = 'PUT_STATICFILE_REQUEST';
export const PUT_STATICFILE_SUCCESS = 'PUT_STATICFILE_SUCCESS';
export const PUT_STATICFILE_FAILURE = 'PUT_STATICFILE_FAILURE';
export const DELETE_STATICFILE_REQUEST = 'DELETE_STATICFILE_REQUEST';
export const DELETE_STATICFILE_SUCCESS = 'DELETE_STATICFILE_SUCCESS';
export const DELETE_STATICFILE_FAILURE = 'DELETE_STATICFILE_FAILURE';

// Actions
export const fetchStaticFiles = () => dispatch => {
  dispatch({ type: FETCH_STATICFILES_REQUEST });
  return get(
    staticfilesAPIUrl(),
    { type: FETCH_STATICFILES_SUCCESS, name: 'files' },
    { type: FETCH_STATICFILES_FAILURE, name: 'error' },
    dispatch
  );
};

export const uploadStaticFiles = files => dispatch => {
  _.each(files, file => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      const payload = JSON.stringify({
        encoded_content: reader.result.split('base64,')[1]
      });
      // send the put request
      return fetch(staticfileAPIUrl(file.name), {
        method: 'PUT',
        body: payload
      })
        .then(data => {
          dispatch({ type: PUT_STATICFILE_SUCCESS });
          dispatch(fetchStaticFiles());
          dispatch(
            addNotification(
              getSuccessMessage(),
              getUploadSuccessMessage(file.name),
              'success'
            )
          );
        })
        .catch(error => {
          dispatch({
            type: PUT_STATICFILE_FAILURE,
            error
          });
          dispatch(
            addNotification(getErrorMessage(), getUploadErrorMessage(), 'error')
          );
        });
    };
  });
};

export const deleteStaticFile = filename => dispatch => {
  return fetch(staticfileAPIUrl(filename), {
    method: 'DELETE'
  })
    .then(data => {
      dispatch({ type: DELETE_STATICFILE_SUCCESS });
      dispatch(fetchStaticFiles());
    })
    .catch(error =>
      dispatch({
        type: DELETE_STATICFILE_FAILURE,
        error
      })
    );
};

// Reducer
export default function staticfiles(
  state = {
    files: [],
    isFetching: false,
    uploading: false // TODO show loading gif
  },
  action
) {
  switch (action.type) {
    case FETCH_STATICFILES_REQUEST:
      return {
        ...state,
        isFetching: true
      };
    case FETCH_STATICFILES_SUCCESS:
      return {
        ...state,
        files: action.files,
        isFetching: false
      };
    case FETCH_STATICFILES_FAILURE:
      return {
        ...state,
        isFetching: false
      };
    case PUT_STATICFILE_REQUEST:
      return {
        ...state,
        uploading: true
      };
    case PUT_STATICFILE_SUCCESS:
      return {
        ...state,
        uploading: false
      };
    case PUT_STATICFILE_FAILURE:
      return {
        ...state,
        uploading: false
      };
    default:
      return state;
  }
}

// Selectors
export const filterByFilename = (staticfiles, input) => {
  if (input) {
    return staticfiles.filter(sf =>
      sf.path.toLowerCase().includes(input.toLowerCase())
    );
  }
  return staticfiles;
};
