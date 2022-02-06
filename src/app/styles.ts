import { css } from '@linaria/core';

// eslint-disable-next-line @typescript-eslint/no-unused-expressions
css`
  :global() {
    :root {
      --color-purple: #da68f5;
      --color-red: #f25f5b;
      --color-yellow: #f4ce4a;
      --color-green: #00f6d2;
      --color-blue: #0bccf7;
      --color-dark-blue: #042548;
      --color-darkest-blue: #032e49;
      --color-white: #ffffff;
      --color-gray: #8196a4;
      --color-white: white;
      --color-disconnect: #ff746b;

      --color-popup: rgba(13, 77, 118, .95);
      --color-select: #184469;

      --color-disabled: #8da1ad;

      --color-usdt-from: rgba(80, 175, 149, .3);
      --color-eth-from: rgba(94, 123, 242, .3);
      --color-wbtc-from: rgba(247, 147, 26, .3);
      --color-dai-from: rgba(245, 172, 55, .3);
    }

    @font-face {
      font-family: 'ProximaNova';
      src: url('/assets/fonts/ProximaNova-Regular.ttf');
      font-weight: 400;
      font-style: normal;
    }

    @font-face {
      font-family: 'ProximaNova';
      src: url('/assets/fonts/ProximaNova-RegularIt.ttf');
      font-weight: 400;
      font-style: italic;
    }

    @font-face {
      font-family: 'ProximaNova';
      src: url('/assets/fonts/ProximaNova-Semibold.ttf');
      font-weight: 600;
      font-style: normal;
    }

    @font-face {
      font-family: 'ProximaNova';
      src: url('/assets/fonts/ProximaNova-Bold.ttf');
      font-weight: 700;
      font-style: normal;
    }

    @font-face {
      font-family: 'SFProDisplay';
      src: url('/assets/fonts/SFProDisplay-Regular.ttf');
      font-weight: 400;
      font-style: normal;
    }

    @font-face {
      font-family: 'SFProDisplay';
      src: url('/assets/fonts/SFProDisplay-RegularItalic.ttf');
      font-weight: 400;
      font-style: italic;
    }

    @font-face {
      font-family: 'SFProDisplay';
      src: url('/assets/fonts/SFUIDisplay-Medium.otf');
      font-weight: 600;
      font-style: normal;
    }

    @font-face {
      font-family: 'SFProDisplay';
      src: url('/assets/fonts/SFProDisplay-Bold.ttf');
      font-weight: 700;
      font-style: normal;
    }

    * {
      box-sizing: border-box;
      outline: none;
    }

    html,
    body, #root {
      margin: 0;
      padding: 0;
      height: 100%;
    }

    html * {
      font-family: 'ProximaNova', sans-serif;
    }

    body {
      font-size: 14px;
      color: white;
      background-image: url(assets/bg.png);
      background-attachment: fixed;
      background-position: center;
      background-repeat: no-repeat;
      background-size: cover;
    }    

    p {
      margin: 0;
    }

    h1,h2 {
      margin: 0;
    }

    ul,
    ol {
      list-style: none;
      margin: 0;
      padding: 0;
    }

    tr, th, table {
      border: none;
      border-spacing: 0;
      padding: 0;
      margin: 0;
      border-collapse: inherit;
    }
  }
`;





