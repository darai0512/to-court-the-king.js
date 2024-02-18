const message = {
  resources: {
    en: {
      translation: {
        "Rule": ""
      }
    },
    ja: {
      translation: {
        "Rule": "",
        "Initialize": 'プレイヤー名を入力してください。2~5人で遊べます。',
        "Roll": `ダイスを振りましょう。初期値は3つです。`,
        "ability": {
          "select": `ダイス確定前にカードを使って出目の操作やダイスの追加ができます。
カードを選択してください。`,
          "dice": `操作したいダイスを選択してください。`,
          "on": `確定ボタンを押してください。カードは1ラウンドで1回ずつしか使えません。キャンセルしたい場合はカードを再度クリックください。`
        },
        "fix": `1つ以上のダイスを確定させてください。\n
この作業を全てのダイスが確定するまで繰り返し、カードを取得します。\n
欲しいカードの取得条件を確認しておきましょう。\n
ex, ダイスを増やせる「農夫」は3-3のように同じ出目二つが必要です。`,
        choice: '欲しいカードを選んで確定しましょう。王を取得すると最終ラウンドが始まります。',
        final: '最終ラウンドではゾロ目の数を競い合います。ゾロ目の数を早く',
      }
    },
  },
  // lng: "ja", // if you're using a language detector, do not define the lng option
  fallbackLng: "en",
  interpolation: {
    escapeValue: false // react already safes from xss => https://www.i18next.com/translation-function/interpolation#unescape
  }
}

export default message