# BoardGame: 王への請願

[![Build Status](https://github.com/darai0512/to-court-the-king.js/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/darai0512/to-court-the-king.js/actions)

inspired by [Cosaic](https://www.amazon.co.jp/dp/B00VYK67JS/ref=nosim?tag=papuwa-22)
Ref.
- https://github.com/matthewdeeco/to-court-the-king
- https://www7a.biglobe.ne.jp/~bluebear/MyBSW/MU_LIST/UmKuK/UmKuK.html
- Rule Book
  - [ja](http://emaame.com/static/bsw/pdfs/UmkroneundKragen.pdf)
  - [en](https://github.com/matthewdeeco/to-court-the-king/blob/master/To%20Court%20the%20King%20Rules.pdf)

### 流れ

1. プレイ人数(2-5)と順番を決める
2. アクティブプレイヤーがN個のダイスを振る
    - Nの初期値は3(Nはプレイヤー毎に所持カード能力で増加)
3. ダイスに対して、所持カードの能力を起動するかどうかを決める
    - 起動後は3に戻る
4. 1つ以上のダイスを確定させる
    - N個確定させたら5へ、それ以外は2へ
5. 確定ダイスによってカードを獲得
    - 次のプレイヤーが2へ
    - 全員が終了したらラウンド終了。次ラウンドを逆順で行う(現在のプレイヤーから2を行う)
    - 国王獲得時はラウンド終了後に6へ
6. 最終決戦: 各プレイヤーが2-4を行い、同じ出目を数多く出したプレイヤーが勝利 
    - 王妃をもつプレイヤーは最後にプレイする
    - 引き分けなら早い手番のプレイヤーが勝利。但し王妃をもつプレイヤーは引き分けでも勝利

## memo for developper

todo
- ゲーム中にオフラインになった場合の挙動とリカバリ
    - 接続切れたらhostが引き継ぐ
    - 接続が切れたら一人回しモードに移行
- タイマー
  - 超えると弾かれる
- Create & describe Math.random() on server
  - save & check data on server 
- for card.cost.visual
    - サイコロXのcss
    - divで横並べ

Refs
- i18n
  - https://i18nexus.com/tutorials/nextjs/react-intl
  - https://app.i18nexus.com/
- css
  - https://tailwindcss.com/docs/installation
  - https://www.flowbite-react.com/docs/customize/theme
  - `.lg` by tailwind = https://tailwindcss.com/docs/responsive-design
- WebRTC
  - https://ja.tech.jar.jp/webrtc/turn.html
  - https://qiita.com/yusuke84/items/286f569d110daede721e
- order by draggable
    - https://dev.classmethod.jp/articles/react-html-drag-and-drop/
- forwardRef
    - https://zenn.dev/terrierscript/scraps/15ca11388f7424

### lobby memo

イベントハンドラ内のネストが深い状態で setPlayers() の参照が何度か更新されると、setPlayers() が動作しない.
実行場所を工夫することで凌いだ.
変数参照できないとかは https://stackoverflow.com/questions/55265255/react-usestate-hook-event-handler-using-initial-state
とか https://react.dev/learn/separating-events-from-effects#limitations-of-effect-events
useEffectEventは解決策ぽいが、experimentalがinstallしたりtsconfig.typeに追記しても動かない

```
// peer.on('connection', (conn) => {
//   console.log('member peer.connected', conn)
//   conn.on('open', () => {
//     console.log('member conn.open', conn)
//     conn.on('data', (data) => {
//       console.log('member conn.data', data)
//       if (typeof data !== 'object' || !data.action) return
//       if (data.action === 'syn' && Array.isArray(data.params.players)) {
//         conn.send({action: 'ack', params: params.players?.find(v=>v.id===peer.id)?.name})
//         // todo useStateだとレンダリングされない
//         setPlayers(data.params.players)
//       }
//     })
//   })
//   conn.on('error', setError)
// })
```