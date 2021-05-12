import { SWRConfig } from 'swr';
import Router from 'next/router';
import NProgress from 'nprogress';
import fetchJson from '../lib/fetchJson';
import 'nprogress/nprogress.css';
import '../styles/globals.css';

Router.events.on('routeChangeStart', () => NProgress.start());
Router.events.on('routeChangeComplete', () => NProgress.done());
Router.events.on('routeChangeError', () => NProgress.done());

function SubjectIdGen({ Component, pageProps }) {
  return (
    <SWRConfig
      value={{
        fetcher: fetchJson,
        onError: err => {
          console.error(err);
        },
      }}
    >
      <Component {...pageProps} />
    </SWRConfig>
  );
}

export default SubjectIdGen;
