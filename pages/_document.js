import Document, { Html, Head, Main, NextScript } from 'next/document'

class MyDocument extends Document {
  render() {
    return (
      <Html>
        <Head>
            <link href='https://fonts.googleapis.com/css?family=Press+Start+2P&display=swap' rel='stylesheet'/>
            <link href="http://fonts.cdnfonts.com/css/digital-dismay" rel="stylesheet"></link>
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