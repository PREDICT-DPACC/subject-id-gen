import { SWRConfig } from 'swr';
import { useState } from 'react';
import Router from 'next/router';
import NProgress from 'nprogress';
import fetchJson from '../lib/fetchJson';
import 'nprogress/nprogress.css';
import '../styles/globals.css';
import formStyles from '../styles/Form.module.css';

Router.events.on('routeChangeStart', () => NProgress.start());
Router.events.on('routeChangeComplete', () => NProgress.done());
Router.events.on('routeChangeError', () => NProgress.done());

function SubjectIdGen({ Component, pageProps }) {
  const [globalError, setGlobalError] = useState('');

  return (
    <SWRConfig
      value={{
        fetcher: fetchJson,
        onError: err => {
          setGlobalError(err.message);
        },
      }}
    >
      {globalError !== '' && (
        <div
          className={formStyles.error}
          style={{ textAlign: 'center', marginTop: '20px' }}
        >
          {globalError}
        </div>
      )}
      <Component {...pageProps} />
    </SWRConfig>
  );
}

export default SubjectIdGen;
