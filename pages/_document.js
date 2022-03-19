import Document, { Html, Head, Main, NextScript } from 'next/document'

class MyDocument extends Document {
  render() {
    return (
      <Html>
        <Head>
            <link href='https://fonts.googleapis.com/css?family=Press+Start+2P&display=swap' rel='stylesheet'/>
            <link href="http://fonts.cdnfonts.com/css/digital-dismay" rel="stylesheet"></link>
            <script 
            async
            src={`https://www.googletagmanager.com/gtag/js?id=${process.env.GOOGLE_ANALYTICS}`}
          />
          <script
            dangerouslySetInnerHTML={{
              __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${process.env.GOOGLE_ANALYTICS}', {
              page_path: window.location.pathname,
            });
          `,
            }}
          />
        </Head>
        <body>
          <Main />
          <NextScript />
          <div id="ModalPlaceholder"></div>
        </body>
      </Html>
    )
  }
}

export default MyDocument